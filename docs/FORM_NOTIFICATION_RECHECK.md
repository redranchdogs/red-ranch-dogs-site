# Form Notification Recheck

Generated: 5/20/2026, 7:56:44 AM Central

Status: **PASS**

Controlled test submission ID: `codex-live-notification-test-1779281790318`

This test intentionally wrote one clearly marked `TEST DELETE` contact submission through the live public endpoint. It did not change form fields, sheet structure, DNS, CRM, or Apps Script bridge behavior.

## Results

| Check | Status | Detail |
| --- | --- | --- |
| Live API response | PASS | HTTP 200; message: Thank you. We received your submission. |
| Website Leads row | PASS | Found submission ID in `Website Leads`. |
| Lead Queue row | PASS | Found submission ID in `Lead Queue`. |
| Email notification | PASS | Gmail found message `19e45758b7c6d5b0` from `forms@redranchdogs.com` to `adam@redranchdogs.com` with subject `Red Ranch Dogs - Website Contact - Goldendoodle`. |

## Follow-Up

- Delete or mark this row as test/delete in the working CRM/Lead Queue flow.
- If email is missing, search Gmail Spam and Resend Activity before changing website code.
