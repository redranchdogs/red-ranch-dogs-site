# Website QA Agent Report

Generated: 10/19/2026, 6:19:23 PM Central

Owner app: **Website**
Agent: **Website QA Agent**
Permission level: **read_only**

This report is a local, read-only Website QA Agent pass. It inspects repository files and the latest generated review docs. It does not write to Google Sheets, Google Drive, Vercel, DNS, env vars, CRM, Breeding Ops, or live website data.

Status: **FAIL**

## Guardrail Alignment

| Check | Status |
| --- | --- |
| AGENTS.md exists | PASS |
| AGENTS.md references shared control docs | PASS |
| Website QA Agent is registered | FAIL |
| Data matrix preserves website ownership boundary | FAIL |
| Approval matrix covers website publishing | FAIL |
| Infrastructure baseline requires agent audit logs | FAIL |
| Operating model says no silent writes | FAIL |

## Public Site QA Snapshot

| Area | Result |
| --- | ---: |
| Sitemap routes | 160 |
| Known static/dynamic routes | 208 |
| Internal links | 65 |
| Redirects | 78 |
| Host canonical redirects | 2 |
| Missing sitemap routes | 2 |
| Missing internal links | 1 |

## Public Data Snapshot

| Public display category | Count |
| --- | ---: |
| Available puppies | 9 |
| Waitlist matching puppies | 0 |
| Reserved puppies | 53 |
| Current litters | 2 |
| Planned litters | 2 |
| Previous litter records | 19 |
| Public parent profiles | 31 |
| Public waitlist rows | 19 |

## Forms And Attribution

Allowed form types: `application`, `contact`, `guardian`, `newsletter`, `stud`, `waitlist`

Rendered public LeadForm types: `application`, `contact`, `guardian`, `newsletter`, `stud`

Tracking fields present in frontend and API: `landingPage`, `referrer`, `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`, `gclid`, `gbraid`, `wbraid`, `firstLandingPage`, `firstReferrer`, `firstUtmSource`, `firstUtmMedium`, `firstUtmCampaign`, `firstUtmContent`, `firstUtmTerm`, `firstGclid`, `firstGbraid`, `firstWbraid`, `lastLandingPage`, `lastReferrer`, `lastUtmSource`, `lastUtmMedium`, `lastUtmCampaign`, `lastUtmContent`, `lastUtmTerm`, `lastGclid`, `lastGbraid`, `lastWbraid`, `source`

Important boundary: form submissions and analytics events are website intake/behavior signals. CRM remains the source of truth for lead outcomes, waitlist decisions, deposits, and puppy-family matching.

## Latest Generated Review Status

| Review doc | Status |
| --- | --- |
| docs/OPERATIONS_STATUS.md | PASS |
| docs/SHEET_SYNC_REVIEW.md | PASS |
| Operations bridge section | PASS |

## Blockers

- Agent Registry does not include Website QA Agent.
- Data Access Matrix does not identify website public-content ownership.
- Sitemap routes missing from known app/data routes: /litters/beatrix-enzo-planned-2026/past-puppies, /litters/reece-wyatt-summer-2026/past-puppies
- Internal links missing routes or redirects: /agreements/red-ranch-dogs-puppy-purchase-agreement-2026-09-17.pdf

## Warnings

- Infrastructure baseline audit-log section was not found.
- Operating model no-silent-writes language was not found.
- Weekly Ecosystem Brief spec may not include the Website section.

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

