# RFC 0003: Privacy, consent and research separation
Status: DRAFT; not a security certification · Oct 19, 2026

Default behavior: NO SHARING, no network, no local persistence in prototype. A user must explicitly opt in to prepare a weekly share **preview** and can clear it locally. The seven-field preview is pseudonymous and can be linkable: an alias is NOT anonymization. Never infer that any health data or participant is anonymous from hashed IDs.

Social opt-in is independent from study enrollment. Studies require affirmative informed consent, ethics/IRB review as appropriate, restrictions on retention/recipient/methods, right to withdraw where feasible, and clear caveat that public copies may persist.

Threat actors: group members, stalkers, operators, scrapers, researcher linkage attacks, compromised devices and source replay. Future server requires encrypted transport/storage, per-group identifiers, trusted ownership, moderation, expiry, deletion and independent threat assessment; NONE are in the MVP.

No raw time-series, GPS, clinical records, genetics, rare-condition flags or precise timestamps in public leaderboard or Hugging Face. Public research releases: curated vocabularies, synthetic fixtures, permitted source data and independently disclosure-reviewed aggregates only. A `k>=10` rule alone does not solve inference/differencing attacks.
Reference: [HHS de-identification guidance](https://www.hhs.gov/hipaa/for-professionals/special-topics/de-identification/index.html).
