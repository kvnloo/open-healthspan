# RFC 0006: A research path that doesn't wait on a hospital data pull
Status: DRAFT · Nov 26, 2026 · not legal advice; any real study needs its institution's IRB and privacy office

## Problem
Medical students and junior researchers lose months getting data out of hospital EHRs such as Epic. Three things stack up:
1. **Compliance.** Records held by a hospital are protected health information (PHI) under HIPAA. A study needs IRB approval, often a data use agreement, and a faculty sponsor before any data moves.
2. **Extraction.** Research data usually comes from the reporting warehouse through an analytics team or "honest broker", and that team has a queue.
3. **Cleaning.** Much of what matters is in free-text notes, and codes are inconsistent. Building a cohort and splitting it into groups often means reviewing charts by hand.

Behavior studies (does a group help people keep a habit?) don't need hospital records at all. They still end up in the same queue because there's no other source of consented, structured, longitudinal data.

## What Open Healthspan changes
| step | hospital EHR route | Open Healthspan route |
|---|---|---|
| who holds the data | a covered entity (the hospital) | the participant, on their own device |
| HIPAA | applies (PHI) | generally does not apply to data a person enters into an app for personal use that a covered entity didn't provide ([HHS](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/cell-phone-hipaa), [HHS app scenarios](https://www.hhs.gov/sites/default/files/ocr-health-app-developer-scenarios-2-2016.pdf)) |
| extraction | warehouse query by an analytics team | none: the participant exports a structured record |
| structure | free text and mixed codes | ISO week, 1–7 goals, each opportunity `done` / `missed` / `unknown` (RFC 0002) |
| consent | added after the data exists | collected first, separate from social sharing (RFC 0003) |

**What doesn't change:** a university study with human participants still needs IRB review (the Common Rule), informed consent and a data management plan. The FTC's Health Breach Notification Rule covers health apps that HIPAA doesn't ([FTC, 2024](https://www.ftc.gov/news-events/news/press-releases/2024/04/ftc-finalizes-changes-health-breach-notification-rule)), and state laws (e.g. Washington's My Health My Data Act) may apply. This RFC removes the extraction and cleaning bottleneck, not the ethics review.

## Design
1. **Separate research channel.** Study enrollment is its own opt-in, never implied by joining a circle (RFC 0003). It's revocable where feasible, and the participant sees exactly what gets sent.
2. **Research record ≠ share code.** The 7-field social share stays as it is. A research export may hold more (each goal's opportunities by day of week, plan changes, self-reported reasons for misses), but only the fields in the study's approved data dictionary, all pseudonymous, with a per-study ID (HMAC of the device secret and the study ID, the same pattern as `member_id`).
3. **Study package.** A study is a reviewed file: question, data dictionary, consent text, retention, recipients, IRB approval reference, and stop rule. The app shows the package before enrollment and refuses any field that isn't in the dictionary.
4. **Patient-mediated clinical data (later, optional).** Certified EHRs expose standardized FHIR R4 patient-access APIs ([ONC Cures Act rule, § 170.315(g)(10)](https://www.federalregister.gov/documents/2020/05/01/2020-07419/21st-century-cures-act-interoperability-information-blocking-and-the-onc-cures-act-final-rule)). A participant can pull their own records through these APIs; once the records reach an app the patient chose, HIPAA no longer covers them ([HHS](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/access-right-health-apps-apis)). HHS's Nov 2026 Privacy Rule update defines "personal health applications" and shortens access deadlines to 15 days (effective Jan 19, 2027; compliance Jul 19, 2027; [summary](https://www.mayerbrown.com/en/insights/publications/2026/11/hhs-finalizes-major-hipaa-privacy-rule-changes-what-covered-entities-and-business-associates-need-to-know)). This is high risk: clinical values stay on the device, never enter social shares, and go into a study export only if that study's IRB-approved dictionary names them.
5. **Releases.** Only disclosure-reviewed aggregates are published (RFC 0003). Never per-person histories.

## Where students fit
The RFC 0005 pilot needs exactly the work a medical student or resident can lead and publish:
- the IRB protocol and consent text;
- preregistration (OSF or ClinicalTrials.gov, as the design requires) and a power analysis;
- choosing a validated secondary outcome (e.g. a licensed PROMIS short form);
- recruiting circles through their own clubs and programs;
- a harms review: overtraining, social pressure, inequity, attrition.

## Open questions
- Which IRB pathway fits best: exempt, expedited or full board? This depends on the institution and the risk level.
- Is a no-server design workable for a study (participants upload exports to a study inbox the institution controls), or does it need a hosted service with a threat-model review first (RFC 0003)?
- Does importing FHIR data change the app's obligations under the FTC rule and state laws? This needs counsel before step 4 ships.

## Go / no-go
Everything here stays a design until a sponsoring institution's IRB approves a specific study package. No real recruitment, uploads or research exports happen before that (same hold as RFC 0005).
