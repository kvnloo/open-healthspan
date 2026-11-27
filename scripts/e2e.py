"""Browser end-to-end smoke for the synthetic demo (Playwright, headless Chromium).

Usage: npm run demo  (in another shell), then
       python3 scripts/e2e.py [base_url] [screenshot_dir]
Fails on page errors, off-origin requests, horizontal overflow, or a broken
opt-in -> share -> board -> withdraw loop.
"""
import json
import sys
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4173/demo/"
_u = urlsplit(BASE)
ORIGIN = f"{_u.scheme}://{_u.netloc}/"
OUT = sys.argv[2] if len(sys.argv) > 2 else None
SHARE_KEYS = {"schema", "group_id", "member_id", "alias", "week", "goals_planned", "progress_band"}


def run(page):
    errors, reqs = [], []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))  # catches CSP blocks
    page.on("request", lambda r: reqs.append(r.url))
    page.goto(BASE)
    page.wait_for_selector("#board tr")
    r = {"rows_before": page.locator("#board tr").count(), "preview_off": page.inner_text("#preview")}
    page.check("#optin")
    page.wait_for_selector("#board tr.me")
    r["share"] = json.loads(page.inner_text("#preview"))
    r["rows_after"] = page.locator("#board tr").count()
    r["me_row"] = page.inner_text("#board tr.me")
    r["together"] = page.inner_text("#together")
    first = page.locator(".cell").first
    for _ in range(3):  # done -> missed -> unknown -> not yet
        first.click()
    page.wait_for_timeout(150)
    r["pending_preview"] = page.inner_text("#preview")
    r["rows_pending"] = page.locator("#board tr").count()
    first.click()
    page.wait_for_timeout(150)
    r["overflow"] = page.evaluate("document.documentElement.scrollWidth > innerWidth")
    r["styled"] = page.evaluate("getComputedStyle(document.body).backgroundColor") == "rgb(15, 17, 21)"
    r["errors"] = errors
    r["off_origin"] = [u for u in reqs if not u.startswith(ORIGIN)]
    return r


def main():
    failures, report = [], {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for name, vp in (("desktop", {"width": 1280, "height": 900}), ("mobile", {"width": 390, "height": 844})):
            page = browser.new_page(viewport=vp)
            r = run(page)
            if OUT:
                page.screenshot(path=f"{OUT}/{name}.png", full_page=True)
            report[name] = r
            checks = {
                "sharing off by default": "Sharing is off" in r["preview_off"],
                "share has exactly 7 fields": set(r["share"]) == SHARE_KEYS,
                "my row joins the board": r["rows_after"] == r["rows_before"] + 1,
                "pending week withdraws share": "Week not finished" in r["pending_preview"]
                and r["rows_pending"] == r["rows_before"],
                "no page errors": not r["errors"],
                "no off-origin requests": not r["off_origin"],
                "no horizontal overflow": not r["overflow"],
                "stylesheet applied": r["styled"],
            }
            failures += [f"{name}: {k}" for k, ok in checks.items() if not ok]
        browser.close()
    print(json.dumps(report, indent=1, ensure_ascii=False))
    if failures:
        print("FAIL\n" + "\n".join(failures))
        sys.exit(1)
    print("e2e ok")


if __name__ == "__main__":
    main()
