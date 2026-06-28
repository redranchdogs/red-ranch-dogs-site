# CRM Intake Alignment Review

This review keeps the live website form system aligned with the future CRM without touching live Sheets, CRM data, or Apps Script deployments.

## Summary

- API form types: `application`, `contact`, `guardian`, `newsletter`, `stud`, `waitlist`
- Rendered public LeadForm types: `application`, `contact`, `guardian`, `newsletter`, `stud`
- Backend-only support: `waitlist`
- Blockers: None

## Form Contract

| Form type | Accepted by /api/forms | Public website status | CRM handoff status |
| --- | --- | --- | --- |
| `application` | Yes | Rendered | Documented |
| `contact` | Yes | Rendered | Documented |
| `guardian` | Yes | Rendered | Documented |
| `newsletter` | Yes | Rendered | Documented |
| `stud` | Yes | Rendered | Documented |
| `waitlist` | Yes | Backend-supported; public route currently uses application CTA | Documented |

## Contract Checks

| Check | Status | Detail |
| --- | --- | --- |
| API accepts forms | PASS | application, contact, guardian, newsletter, stud, waitlist |
| Public form endpoint documented | PASS | /api/forms |
| Website Leads documented | PASS | Immutable raw submission archive |
| Lead Queue documented | PASS | Working CRM intake queue |
| Submission ID in raw archive headers | PASS | Stable join key |
| Submission ID in handoff docs | PASS | Stable join key documented |
| Preferred contact method stored | PASS | Contact-form reply preference is a first-class Website Leads column |

## CRM Boundary

- Do not treat Vercel Analytics events as lead records.
- Keep `Website Leads` as the immutable raw archive.
- Keep `Lead Queue` as the working inbox until the CRM owns the form backend.
- Preserve `Submission ID` as the stable join key across website submission, email notification, Sheets, and CRM.
- The public waitlist mini form is not the preferred public path right now; application CTAs should continue to route serious families through the full application while backend waitlist support remains available.
