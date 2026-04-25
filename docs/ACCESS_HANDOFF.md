# Access Handoff Guide

This is the practical list of what Codex needs to finish the migration safely.

## 1. Squarespace

Goal: pull original content, media, SEO settings, hidden pages, forms, and redirects.

Recommended steps:

1. Log in to Squarespace.
2. Go to Settings > Permissions, or the current Squarespace member/permissions area.
3. Invite the migration helper account as a contributor.
4. Give permissions for website editing, pages, assets/media, forms, and settings.
5. If you prefer not to grant live access, export/download:
   - Page list
   - Site XML export if available
   - Media library
   - Form definitions
   - SEO page settings
   - Redirect settings

Do not change DNS during this step.

## 2. Domain/DNS

Goal: switch `redranchdogs.com` only after the replacement site is approved.

Needed later:

- Domain registrar login or collaborator access.
- Current DNS records screenshot/export.
- Confirmation of any email records in DNS, especially Google Workspace or other mail records.

Important: DNS is a launch step, not a migration step. Keep this untouched until final approval.

## 3. Forms And Spreadsheet

Goal: application/contact/waitlist/newsletter submissions email you and log to a Sheet.

Needed:

- Destination email address for submissions.
- A Google Sheet for submissions, or permission to create one.
- Permission to create a Google Apps Script web app connected to that Sheet.

Optional:

- Resend account/API key if you want direct transactional email from the website.
- Separate routing emails for applications, stud inquiries, contact, and newsletter.

## 4. Photos

Goal: stop relying on Squarespace CDN URLs and use owned, organized image assets.

Best handoff:

- Export/download the full Squarespace media library.
- Provide any newest puppy photos in original size.
- Name folders by litter when possible, for example `2026-04-birdie-waylon`.

## 5. CRM Later

The current form design keeps data structured so a CRM can be added later.

Future CRM fields likely include:

- Family/contact record
- Preferred breed/size/sex/timing
- Waitlist status
- Deposit amount/date/method
- Litter interest
- Puppy assigned
- Contract status
- Go-home checklist
- Follow-up history

Do not choose the CRM until the public site and form flow are stable.
