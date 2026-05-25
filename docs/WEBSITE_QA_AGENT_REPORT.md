# Website QA Agent Report

Generated: 5/25/2026, 3:10:49 PM Central

Owner app: **Website**
Agent: **Website QA Agent**
Permission level: **read_only**

This report is a local, read-only Website QA Agent pass. It inspects repository files and the latest generated review docs. It does not write to Google Sheets, Google Drive, Vercel, DNS, env vars, CRM, Breeding Ops, or live website data.

Status: **PASS**

## Guardrail Alignment

| Check | Status |
| --- | --- |
| AGENTS.md exists | PASS |
| AGENTS.md references shared control docs | PASS |
| Website QA Agent is registered | PASS |
| Data matrix preserves website ownership boundary | PASS |
| Approval matrix covers website publishing | PASS |
| Infrastructure baseline requires agent audit logs | PASS |
| Operating model says no silent writes | PASS |

## Public Site QA Snapshot

| Area | Result |
| --- | ---: |
| Sitemap routes | 119 |
| Known static/dynamic routes | 168 |
| Internal links | 64 |
| Redirects | 81 |
| Host canonical redirects | 2 |
| Missing sitemap routes | 0 |
| Missing internal links | 0 |

## Public Data Snapshot

| Public display category | Count |
| --- | ---: |
| Available puppies | 0 |
| Waitlist matching puppies | 16 |
| Reserved puppies | 14 |
| Current litters | 4 |
| Planned litters | 5 |
| Previous litter records | 12 |
| Public parent profiles | 29 |
| Public waitlist rows | 21 |

## Forms And Attribution

Allowed form types: `application`, `contact`, `guardian`, `newsletter`, `stud`, `waitlist`

Rendered public LeadForm types: `application`, `contact`, `guardian`, `newsletter`, `stud`

Tracking fields present in frontend and API: `landingPage`, `referrer`, `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`, `source`

Important boundary: form submissions and analytics events are website intake/behavior signals. CRM remains the source of truth for lead outcomes, waitlist decisions, deposits, and puppy-family matching.

## Latest Generated Review Status

| Review doc | Status |
| --- | --- |
| docs/OPERATIONS_STATUS.md | PASS |
| docs/SHEET_SYNC_REVIEW.md | PASS |
| Operations bridge section | PASS |

## Blockers

- None flagged.

## Warnings

- None flagged.

## Recommended Next Moves

1. Owner: Website
   Action: Run `npm run agent:website-qa` after major public website updates.
   Why: This gives Adam one read-only health report tied to the ecosystem guardrails.
   Approval needed: No, read-only.

2. Owner: Website + Marketing Engine
   Action: Use this report with Vercel Analytics and Lead Queue summaries for the first Analytics and Attribution Agent readout.
   Why: Website traffic is not lead truth; CRM outcomes need to be compared separately.
   Approval needed: Yes before changing tracking code, ad settings, or CRM fields.

3. Owner: CRM / Breeding Ops / Website
   Action: Keep cross-system updates as handoffs until stable APIs and audit logs exist.
   Why: The control docs explicitly forbid direct cross-app writes for now.
   Approval needed: Yes for any write across app boundaries.

