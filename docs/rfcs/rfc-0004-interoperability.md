# RFC 0004: Device-neutral, source-aware adapters
Status: DRAFT · Oct 19, 2026

## Private measurement contract (future)
`metric`, `value`, `unit`, `source_application`, `device_family`, `measured_vs_derived`, `source_record_id`, `start/end_utc`, `source_timezone`, `method_version`, `coverage`, `missingness`, `quality_flags`. Distinguish app writer (e.g. Samsung Health) from hardware, and never mix vendor-specific recovery/HRV scores blindly.

Read-only, explicit imports first: manual (MVP); next Apple Health export, Android Health Connect and user-directed NOOP export. Provider cloud connectors via Open Wearables (MIT) are later **optional** and must never silently become a server requirement. HealthWallet lab FHIR is later user-selected only, no raw clinical record in social service. Open mHealth + FHIR R4/LOINC/UCUM at appropriate edges; avoid recreating a full EHR.

Acceptance: unit/timezone/DST correctness, idempotence, source priority with retained provenance, import-dedup, transparent stale/insufficient data, disconnect stops import, no measurement fields in social share payload. Respect NOOP's PolyForm Noncommercial boundary, HealthWallet GPL and wger AGPL; credit upstream authors.
