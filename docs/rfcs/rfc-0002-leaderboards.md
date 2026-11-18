# RFC 0002: Friendly competition without health rankings
Status: DRAFT · Oct 19, 2026

## Fair mechanics
One weekly, user-chosen plan of 1–7 goals (including planned recovery). Every opportunity is explicitly `done`, `missed` or `unknown`; unknown **never counts as a missed or successful day**. Incomplete weeks cannot produce ranked shares. The local-only MVP caps progress at 100%; optional share is a 5-point-bucket `progress_band` with alias, opaque group-scoped member ID, group and week only.

This is **social commitment completion, not a biomedical comparison**. A 4/4 plan is not the same work or health effect as another person's 4/4. First preference: small private cooperative groups, no global rankings. Rest when appropriate and manual/no-wearable participation count. No “best HRV”, biological age, step totals or blood markers leaderboard.

## Adversarial / fairness gates
No overexertion incentives, streak shame, scores higher than 100, repeated impersonated entries, raw device quality assertions, route leakage, or untrusted uploaded fields. Future server requires consent and group membership proof, authenticated updates, replay defense, moderation, deletion and rate limiting. Compare category-specific sport performance only in clearly separate reviewed competitions.

## MVP tests
Default share null; incomplete week null; submitted allowlist exactly seven fields; reject unexpected health fields; no day-level data; cap; dedupe; cross-group/week isolation; no research enrollment.
