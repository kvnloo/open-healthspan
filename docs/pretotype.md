# Pretotype: does anyone want this?

The site in `site/` is a pretotype: a real, working scoring demo plus three
"fake doors" for features that are not built yet. Its job is to answer
whether people will act, not whether they like the idea. Opinions count as zero.

The page has no analytics, cookies or network calls (`npm run check` enforces this),
so the only signal is a person opening a GitHub issue. That costs a minute and a
public account, which is a small but real commitment.

## Hypotheses (Savoia XYZ)

| door | hypothesis | counts as yes | pass line (first 4 weeks after sharing the link) |
|---|---|---|---|
| A · Reserve a circle | At least 5% of people we send the link to will open a `[circle]` issue naming a real group | issue with a group size and a week-1 goal | 10 issues, 3 groups of 3 or more |
| B · Research with us | At least 2 med students, researchers or clinicians will offer to help with ethics review or outcome measures for RFC 0005 | `[research]` issue naming a role and a question | 2 issues |
| C · Bring my device | Most circle requests will name a source to import from | `[adapter]` issues, grouped by source | the top source gets 5 or more |

If door A fails, keep the solo tool and don't build hosted circles. If door C is
split across many sources, build Open Wearables first, since it covers several.

## Who to send it to

- Friend groups that already share workouts in a chat (run clubs, climbing gyms, family chats).
- Med students looking for research projects that don't wait on a hospital data pull.
- Blueprint and longevity communities that want a social board without lab costs.

## Counting

```sh
for t in circle research adapter; do
  printf '%s ' "$t"; gh issue list -R kvnloo/open-healthspan --state all --search "[$t] in:title" --json number -q length
done
```

Record each week's counts in this file. Don't post or quote anyone's health data.
