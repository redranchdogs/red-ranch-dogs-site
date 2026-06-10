# Claude Review Packet: Red Ranch Dogs Website

Prepared: June 10, 2026  
Repo: `/Users/adamdietlein/Documents/New project/red-ranch-dogs-site`  
Branch: `codex/launch-candidate`  
Live site: `https://redranchdogs.com`

## Reviewer Role

Claude should act only as a reviewer. Do not edit files, run write/sync scripts, deploy, change Google Sheets, change Google Drive, touch Vercel settings, modify DNS, send emails, or create implementation patches unless Adam explicitly asks for a build pass after the review.

Expected output from Claude:

- Findings ordered by severity.
- Exact file and line references where possible.
- Risks, regressions, missing tests, accessibility issues, SEO issues, or buyer-flow problems.
- Suggested fixes in prose or small illustrative snippets only.
- No production writes or external actions.

## Website Goal

The Red Ranch Dogs website is the public marketing and public display layer for the business. Its job is to help families understand Red Ranch Dogs, browse available puppies, follow current litters, preview upcoming litters, learn the application/waitlist process, submit public forms, and contact the team.

Ownership boundary:

- Website owns public pages, public forms, approved public puppy/litter/parent display, SEO/crawler files, analytics implementation, and deployment behavior.
- CRM owns leads, applications, family records, waitlists, deposits, pricing workflows, communications, follow-ups, and puppy-family matching.
- Breeding Ops owns dog/litter/puppy operational records, weights, health records, breeding timeline, barn tasks, and official animal-care state.

## Main Public Pages And Buyer Journey

Core buyer path:

1. Home page introduces Red Ranch Dogs, puppy types, process, current availability paths, testimonials, and calls to action.
2. Families browse `Available Puppies` to see puppies available to reserve now.
3. Families browse `Current Litters` to see litters growing now, puppy cards, weekly galleries, and status.
4. Families browse `Upcoming Litters` to preview planned pairings by breed.
5. Families use `Application and Waitlist`, `Pricing`, `FAQ`, and `Pickup and Delivery` to understand process and timing.
6. Families submit the puppy application or contact form.
7. Website form submissions write to the website lead workflow; CRM later owns follow-up and matching.

Main route groups:

- `/`
- `/puppies`
- `/puppies/available`
- `/puppies/current-litters`
- `/puppies/upcoming-litters`
- `/puppies/previous-litters`
- `/puppies/:breedSlug`
- `/puppies/:puppySlug`
- `/litters/:litterSlug`
- `/parents`
- `/parents/mamas`
- `/parents/studs`
- `/parents/:parentSlug`
- `/process`
- `/process/how-it-works`
- `/process/pricing`
- `/process/application-and-waitlist`
- `/process/waitlist`
- `/process/faq`
- `/process/pickup-and-delivery`
- `/stud-services`
- `/guardian-program`
- `/guardian-program/application`
- `/about`
- `/about/our-family`
- `/about/meet-the-team`
- `/about/reviews`
- `/contact`
- `/apply`

## Relevant File Paths

Page structure, routing, templates:

- `src/main.jsx`
- `src/App.jsx`
- `src/styles.css`

Static/public data loaded by the app:

- `src/data/puppies.json`
- `src/data/litters.json`
- `src/data/previous-litters.json`
- `src/data/parents.json`
- `src/data/waitlist.json`
- `src/data/breeds.json`
- `src/data/site.js`

SEO, metadata, crawler, and link previews:

- `src/App.jsx`
- `public/robots.txt`
- `public/sitemap.xml`
- `public/llms.txt`
- `public/llms-full.txt`
- `scripts/generate-crawler-files.mjs`
- `scripts/generate-link-preview-pages.mjs`
- `scripts/audit-seo-metadata.mjs`
- `docs/SEO_METADATA_REPORT.md`
- `docs/AI_SEARCH_REVIEW.md`

Forms and lead intake:

- `src/App.jsx`
- `api/forms.js`
- `api/waitlist.js`
- `scripts/test-form-api-handler.mjs`
- `scripts/test-form-webhook.mjs`
- `scripts/run-lead-uat-scenarios.mjs`
- `scripts/website-bridge-apps-script.js`
- `scripts/google-apps-script.js`
- `docs/FORM_SETUP.md`
- `docs/LEAD_WORKFLOW_PACKET.md`
- `docs/CRM_HANDOFF_PACKET.md`

Media and Google Sheets sync:

- `scripts/sync-content-sheets-smart.mjs`
- `scripts/export-content-sheets.mjs`
- `scripts/audit-sheet-sync.mjs`
- `scripts/audit-current-litter-media.mjs`
- `scripts/audit-image-budget.mjs`
- `scripts/plan-drive-folders.mjs`
- `docs/SHEET_SYNC_REVIEW.md`
- `docs/PHOTO_WORKFLOW_PACKET.md`
- `docs/PHOTO_IMPORT_CHECKLIST.md`

Checks and deployment readiness:

- `package.json`
- `scripts/check-source-of-truth.mjs`
- `scripts/check-buyer-flow.mjs`
- `scripts/check-content-publish-ready.mjs`
- `scripts/audit-public-safety.mjs`
- `scripts/audit-deploy-package.mjs`
- `scripts/verify-routes.mjs`
- `docs/DEPLOY_PACKAGE_REVIEW.md`
- `docs/PUBLIC_SAFETY_REVIEW.md`

## Recent Changes And Risky Areas

Recent committed work:

- `e3e3d86 Reserve Hook and Bobber`
- `dc8e650 Update current litter public availability`
- `9ff790b Mark Glory reserved`
- `6c8535b Add referenced image budget audit`
- `cb45015 Add current litter media audit`

Important recent behavior changes to review:

- Current litters have shifted from waitlist-matching language to public availability language.
- Available puppy count recently changed from 21 to 19 after Hook and Bobber were reserved.
- Current litter pages, available puppy pages, and generated AI/crawler files should agree on puppy availability.
- Form notification and lead workflow code has uncommitted changes and should be reviewed carefully before deployment.
- `src/App.jsx` has many template, analytics, routing, CTA, and UI changes in one large file; regressions can hide there.
- Image budget audit passes but reports many images over the soft size threshold. This is a performance risk, not currently a deploy blocker.
- Docs and generated review reports are frequently regenerated, so distinguish generated noise from intentional logic changes.

Review focus:

- Public buyer flow clarity, especially Available Puppies, Current Litters, and Apply.
- Mobile navigation and sticky CTA behavior.
- Status consistency across puppy cards, litter cards, detail pages, generated crawler files, and sheets.
- Form handler error handling, email notification path, and privacy boundaries.
- SEO title/description/canonical/JSON-LD coverage on dynamic puppy/litter/parent routes.
- Accessibility: headings, link text, buttons, accordions, focus behavior, labels, contrast, and mobile tap targets.

## Focused Uncommitted Diff Summary

Current worktree has uncommitted changes outside the latest deployed availability commits. Claude should review them as uncommitted risk, not assume they are live.

Changed files by area:

- Instructions/guardrails: `AGENTS.md`
- Form/API code: `api/forms.js`
- Main frontend: `src/App.jsx`
- Generated/review docs: `docs/AI_SEARCH_REVIEW.md`, `docs/BUSINESS_ACCURACY_REVIEW.md`, `docs/CONVERSION_ANALYTICS_REVIEW.md`, `docs/CRM_HANDOFF_PACKET.md`, `docs/CRM_WEBSITE_INTEGRATION_CHECKLIST.md`, `docs/CURRENT_LITTER_CLARITY_REVIEW.md`, `docs/DEPLOY_PACKAGE_REVIEW.md`, `docs/FORM_SETUP.md`, `docs/IMAGE_ASSET_REVIEW.md`, `docs/LEAD_WORKFLOW_PACKET.md`, `docs/MOBILE_CTA_REVIEW.md`, `docs/OPERATIONS_STATUS.md`, `docs/PAGE_REVIEW_PACKET.md`, `docs/PHOTO_DAY_REHEARSAL.md`, `docs/PHOTO_IMPORT_CHECKLIST.md`, `docs/PHOTO_WORKFLOW_PACKET.md`, `docs/PUBLIC_SAFETY_REVIEW.md`, `docs/SEO_METADATA_REPORT.md`, `docs/SHEET_SYNC_REVIEW.md`, `docs/WEBSITE_QA_AGENT_REPORT.md`, `docs/WEEKLY_UPDATE_QUEUE.md`
- Review/test/sync scripts: `scripts/generate-conversion-analytics-review.mjs`, `scripts/generate-website-qa-agent-report.mjs`, `scripts/google-apps-script.js`, `scripts/run-lead-uat-scenarios.mjs`, `scripts/test-form-api-handler.mjs`

Diff size at packet prep time:

```text
29 files changed, 635 insertions(+), 171 deletions(-)
```

Suggested safe review commands:

```bash
git status --short
git diff --stat
git diff -- AGENTS.md src/App.jsx api/forms.js
npm run validate:content
npm run check:buyer-flow
npm run test:forms
npm run lint
```

Do not run sync, write, deploy, or live notification commands during review.

## Review-Only Instructions For Claude

Claude should:

1. Read this packet, `AGENTS.md`, and the relevant files listed above.
2. Stay within the website ownership boundary.
3. Treat CRM, Breeding Ops, Google Sheets, Google Drive, Vercel settings, DNS, email settings, and payment/ad systems as out of scope.
4. Avoid raw customer data, credentials, private spreadsheet details, or secret/config values.
5. Produce a code-review style report with findings first, ordered by severity.
6. Include exact file references and concrete risk explanations.
7. Mention any tests or checks that should be run before deployment.
8. Do not build, deploy, sync, or modify files.

