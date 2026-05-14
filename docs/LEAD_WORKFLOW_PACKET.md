# Lead Workflow Packet

Generated: 5/14/2026, 2:39:41 PM Central

Spreadsheet: https://docs.google.com/spreadsheets/d/1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE/edit

This packet is intentionally CRM-friendly without copying personal contact details into repo docs. Work the actual names, emails, and phone numbers inside the `Lead Queue` tab.

## Daily Use

1. Open `Lead Dashboard` for the quick counts.
2. Work from `Lead Queue`, not the raw `Website Leads` tab.
3. Use dropdowns for `Status`, `Owner`, `Next Action`, and `Outcome`.
4. Set `Follow Up Date` only when a family needs a later touch.
5. Keep `Website Leads` untouched so raw form history stays clean for the future CRM.

## Current Queue

- Raw website submission rows: 14
- Lead queue rows: 14
- Open/non-closed rows: 14
- UAT/test scenario rows: 6
- UAT rows not marked Test/delete: 6
- Blank status rows: 12
- Needs reply rows: 1
- Follow up rows: 0
- Overdue follow-up rows: 0

## Status Counts

| Value | Count |
| --- | ---: |
| (blank) | 12 |
| Deposit info sent | 1 |
| Needs reply | 1 |

## Lead Type Counts

| Value | Count |
| --- | ---: |
| Website Contact | 4 |
| Guardian Application | 2 |
| Puppy Alert Signup | 2 |
| Puppy Application | 2 |
| Stud Inquiry | 2 |
| Waitlist Interest | 2 |

## Recommended Routine

- Morning: filter `Status` to blank, `New`, and `Needs reply`.
- Midday: filter `Next Action` to `Text family`, `Send deposit info`, and `Schedule call`.
- End of day: move finished leads to `Replied`, `Waiting on family`, `On waitlist`, or `Closed`.
- Weekly: archive obvious tests and closed rows into `Closed Leads` if the queue starts feeling noisy.

## Automation Notes

- `npm run leads:rebuild-queue` rebuilds the working queue from raw submissions while preserving manual status, owner, next action, outcome, follow-up date, and notes.
- `npm run leads:packet` refreshes this packet and the redacted TSV snapshot.
- `npm run leads:uat` previews fake client scenarios without writing rows.
- `npm run leads:uat:write` submits fake clients through the real form handler into Google Sheets. Mark those rows `Test/delete` after review.
- `npm run bridge:setup-submissions` reapplies the compact workbook layout after the latest bridge code is deployed.

## Files

- `docs/LEAD_WORKFLOW_PACKET.md`
- `outputs/lead-queue-snapshot.tsv`
