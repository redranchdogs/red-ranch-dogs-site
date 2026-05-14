# Lead UAT Scenarios

Generated: 5/14/2026, 11:27:13 AM Central

Mode: **LIVE WRITE**

UAT means User Acceptance Testing. These are fake-but-realistic client journeys that prove the website lead flow works before launch.

## Business Lingo

- **UAT:** fake client scenarios used to prove the system works the way the business actually works.
- **Happy path:** the normal clean version of a workflow.
- **Edge case:** a realistic odd situation that should still behave clearly.
- **Acceptance criteria:** the pass/fail rule for a scenario.
- **Source of truth:** the place we trust as correct. For now, raw website submissions stay in `Website Leads`, and daily work happens in `Lead Queue`.
- **Data contract:** the agreed meaning of the columns so the future CRM can read them later.
- **Lead lifecycle:** the movement from new lead to replied, follow-up, deposit info sent, waitlist, closed, or not a fit.

## How To Use This

1. Run `npm run leads:uat` to preview the scenarios without writing rows.
2. Run `npm run leads:uat:write` to push the fake clients through the real form handler into Google Sheets.
3. Open the `Website Submissions` sheet and work from `Lead Queue`.
4. Mark each fake row as `Test/delete` after you have reviewed the routing.
5. Run `npm run leads:rebuild-queue` any time you want the queue rebuilt from raw submissions while preserving manual status notes.

## Scenarios

| Scenario | Form | Submission ID | Acceptance Criteria | Result |
| --- | --- | --- | --- | --- |
| Happy path: puppy application | application | uat-20260514162613-application-goldendoodle | Routes as a high-priority puppy application with breed, size, timing, pickup, and agreement details. | 200 PASS - Thank you. We received your submission. |
| Happy path: waitlist interest | waitlist | uat-20260514162613-waitlist-cavapoo | Routes as waitlist interest and keeps the request simple enough to move into the breed waitlist later. | 200 PASS - Thank you. We received your submission. |
| Edge case: available puppy question when none are available | contact | uat-20260514162613-contact-availability | Routes as general contact and captures the question without pretending a puppy is available. | 200 PASS - Thank you. We received your submission. |
| Happy path: stud inquiry | stud | uat-20260514162613-stud-inquiry | Routes as a high-priority stud inquiry with female dog and brucellosis fields visible. | 200 PASS - Thank you. We received your submission. |
| Happy path: guardian application | guardian | uat-20260514162613-guardian-candidate | Routes as a guardian candidate and surfaces location, yard, housing, and phone-call fit. | 200 PASS - Thank you. We received your submission. |
| Happy path: puppy alert signup | newsletter | uat-20260514162613-newsletter-signup | Routes as a low-priority puppy alert signup with only email required. | 200 PASS - Thank you. We received your submission. |

## Before Launch

- The fake UAT rows should either be marked `Test/delete` or removed from the working queue before launch day.
- Keep the rows long enough to practice the daily process once: assign owner, choose next action, choose status, and add a short note.
- Do not use the fake emails for real follow-up.
