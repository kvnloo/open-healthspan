# RFC 0001: Independent project boundary
Status: DRAFT · Oct 19, 2026

## Decision
Build a separate MIT-licensed Open Healthspan social companion. NOOP's offline anonymous model is a **hard boundary**: no hosted feeds, social profiles, default network traffic or medical conclusions inside NOOP ([docs/SCOPE.md](https://github.com/ryanbr/noop/blob/main/docs/SCOPE.md)). A person independently opts into a safe export and the companion must work with manual self-report, even without a wearable.

## Reuse map
NOOP = personal wearable analytics and Journal; Open Wearables (MIT) = optional device connectors; HealthWallet.me (GPL) = optional user-selected clinical FHIR export, never shared socially; Open mHealth + FHIR/LOINC/UCUM = units and provenance; wger = exercise/nutrition adapter subject to AGPL boundaries; Open Humans = research-consent integration candidate, not blanket data license; Longevity World Cup (MIT) = competition-design inspiration, original work credited.

## Minimum deliverable
Solo local progress; complete/unknown states; group-scoped pseudonymous weekly progress preview, default off; synthetic UI and tests. The tested starter has **no** remote sync, data collection, patient records or real participants. Distinct social and research consent, and usable without any device.
## No-go
No universal biometric score or claims of life extension; no diagnosis/treatment; no global identity or exposed GPS/HRV/raw health streams; no competition requiring money/wearables; no commercial use of NOOP source in MIT code.
