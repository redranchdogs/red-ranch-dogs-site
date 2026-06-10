# Form Notification Recheck

Generated: 6/10/2026, 4:15:25 PM Central

Status: **PASS**

Controlled test submission ID: `codex-live-notification-test-1781126103696`

This test intentionally wrote one clearly marked `TEST DELETE` contact submission through the live public endpoint. It did not change form fields, sheet structure, DNS, CRM, or Apps Script bridge behavior.

## Results

| Check | Status | Detail |
| --- | --- | --- |
| Live API response | PASS | HTTP 200; message: Thank you. We received your submission. |
| Website Leads row | PASS | Found submission ID in `Website Leads`. |
| Lead Queue row | PASS | Found submission ID in `Lead Queue`. |
| Email notification | PASS | Gmail found the notification for this submission ID in the Red Ranch Dogs inbox. |

## Follow-Up

- Delete or mark this row as test/delete in the working CRM/Lead Queue flow.
