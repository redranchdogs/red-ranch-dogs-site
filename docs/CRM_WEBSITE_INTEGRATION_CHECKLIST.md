# CRM Website Integration Checklist

Generated: 5/22/2026, 8:41:36 AM Central

This checklist protects the live website while the Red Ranch CRM, Breeding Ops, puppy portal, and guardian hub grow around it.

## Website Owns For Now

- Public routes, copy, images, React templates, redirects, SEO files, and Vercel production deploys.
- Public puppy, litter, parent, previous-litter, and waitlist website data files.
- `/api/forms` and the current website form submission contract.
- Vercel environment variables for the live website.
- The current Google Sheets bridge connection used by the website.
- Public photo/media display decisions. Google Drive media organization may support CRM, Breeding Ops, and future portals, but the website controls what is publicly visible.

## CRM May Read First

- `Website Leads` as immutable raw submissions.
- `Lead Queue` as the current working inbox.
- `Submission ID` as the join key between raw lead, queue row, email notification, and future CRM record.
- Redacted generated packets such as `docs/CRM_HANDOFF_PACKET.md`, `docs/LEAD_WORKFLOW_PACKET.md`, and `docs/CRM_INTAKE_ALIGNMENT_REVIEW.md`.
- Public website content sheets for context only: Puppy Tracker, Litters, Parent Dogs, Public Waitlist, and Previous Litters.

## CRM Must Not Touch Without Explicit Approval

- DNS, GoDaddy, Squarespace, or Vercel production aliases.
- Website form fields, validation, routes, or public form UI.
- `Website Leads` raw tab headers or row history.
- Apps Script bridge deployment, script properties, bridge secret, or notification behavior.
- Puppy/litter/parent content sheets while CRM is still in prototype/import mode.
- Weekly Media Drops folder names or public website image references, because those paths also support the website publishing workflow.
- Real customer lead data in repo docs, fixtures, screenshots, or logs.

## First Safe Integration Scope

1. Build a read-only CRM import from `Website Leads` and `Lead Queue`.
2. Normalize contacts but keep the original raw submission attached.
3. Map blank queue statuses to `New` or `Unworked`.
4. Preserve current columns: status, owner, next action, outcome, follow-up date, notes, lead type, priority, interest, timing, location, recommended next step, lead summary, and submission ID.
5. Read public litter and puppy status as context, but do not make the CRM the owner of public availability until Adam approves that handoff.
6. Test with UAT/test-delete rows before importing real customer records.

## Graduation Checklist Before CRM Writes Back

1. CRM can read all live website submission types without dropping fields.
2. CRM can identify test/delete rows.
3. CRM has a backup/export path.
4. Adam approves exactly which system owns status changes.
5. A rollback plan exists before any CRM writeback to Sheets or the live website.
