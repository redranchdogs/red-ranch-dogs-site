# Red Ranch Dogs Content Operations

This site is moving toward a simple weekly update system: Google Drive and sheets hold the working business information, and the website renders clean public records from structured data files.

## Website Hub Structure

Recommended Drive structure:

- `Website Hub`
  - `Data Sheets`
    - `Puppy Tracker`
    - `Litter Sheet`
    - `Parent Dog Sheet`
    - `Waitlist Sheet`
  - `Photos`
    - `Home`
    - `Litters`
      - `Birdie 3 + Waylon`
        - `Ranger`
          - `Week 3`
          - `Week 4`
        - `Axel`
          - `Week 3`
          - `Week 4`
        - `Other Puppies`
    - `Parents`
      - `Mamas`
      - `Studs`
    - `Previous Litters`
      - `Honey 2 + Bram`
        - `Parent Photos`
        - `Puppy Gallery`

## Website Data Files

- `src/data/puppies.json`: individual puppy records.
- `src/data/litters.json`: litter records and parent pairings.
- `src/data/previousLitters.json`: previous litter archives, parent pairing photos, and puppy galleries.
- `src/data/parents.json`: mama and stud profile records.
- `src/data/waitlist.json`: public waitlist rows copied from the Website Hub waitlist sheet.

## Sheet Column Exports

The website now has a repeatable sheet export command. It turns the current website data into clean tab-separated files that can be pasted into, or imported into, the Website Hub Google Sheets.

```bash
npm run export:sheets
```

This creates:

- `outputs/content-sheet-exports/puppy-tracker.tsv`
- `outputs/content-sheet-exports/litters.tsv`
- `outputs/content-sheet-exports/previous-litters.tsv`
- `outputs/content-sheet-exports/parent-dogs.tsv`
- `outputs/content-sheet-exports/column-guide.tsv`

Use these files as the canonical column layout for the Puppy Tracker, Litter Sheet, Previous Litters, and Parent Dog Sheet. The column names intentionally match the website data fields so future sheet-to-website automation can stay simple.

## One-Command Operations Pass

Run this when you want a single health check for the site, bridge, forms, routes, content, buyer flow, lint, and production build:

```bash
npm run ops:status
```

This writes a readable report to:

```text
docs/OPERATIONS_STATUS.md
```

The report confirms whether the full Apps Script bridge is reachable, whether the Website Submissions tabs are readable, and whether the local website checks are passing. It does not submit fake live leads or change puppy, litter, parent, or waitlist content.

The operations pass also runs a public-safety scanner:

```bash
npm run review:safety
```

This writes:

```text
docs/PUBLIC_SAFETY_REVIEW.md
```

That report checks for public-facing internal workflow notes, raw Google Drive/Sheets/Apps Script links, private contact details, and old-pricing artifacts in structured public data.

For a browser-based mobile/desktop smoke test, run:

```bash
npm run review:visual
```

This starts a local Vite preview from the production build, opens important buyer routes in mobile and desktop viewports, and writes:

```text
docs/VISUAL_QA_REPORT.md
```

It checks for page load failures, broken images, horizontal overflow, browser page errors, console errors, and likely clipped text.

For crawler and metadata confidence, run:

```bash
npm run review:seo
```

This opens every route in `public/sitemap.xml` through the production build and writes:

```text
docs/SEO_METADATA_REPORT.md
```

It checks titles, meta descriptions, canonical URLs, Open Graph/Twitter metadata, H1s, and JSON-LD presence.

For final deploy-package safety, run:

```bash
npm run review:deploy
```

This writes:

```text
docs/DEPLOY_PACKAGE_REVIEW.md
```

It confirms `dist/` contains the built app, sitemap, robots file, manifest, icons, logo, and referenced images while checking that bridge/form secrets and internal Apps Script details are not leaking into the public build.

For a read-only check that website data and the live Website Hub sheets are still aligned, run:

```bash
npm run review:sheets
```

This writes:

```text
docs/SHEET_SYNC_REVIEW.md
```

It compares the generated Puppy Tracker, Litters, Previous Litters, and Parent Dogs exports against the live Google Sheets through the bridge. If it fails, confirm the website data is the source of truth, then run `npm run sync:sheets` and rerun `npm run review:sheets`.

## Weekly Workflow Queue

Run this when you want a generated Tuesday-style working list for current litters, puppy photos, upcoming litters, parent photos, and previous-litter archive gaps:

```bash
npm run ops:workflow
```

This writes:

```text
docs/WEEKLY_UPDATE_QUEUE.md
outputs/weekly-photo-roster.tsv
```

The markdown report is the human-readable checklist. The TSV is spreadsheet-friendly and includes the litter, Drive folder hint, latest week, puppy name, collar color, status, and current main photo path.

Run this when you want a more detailed photo-day packet with folder rules, suggested puppy file names, parent photo cleanup, and previous-litter backfill tasks:

```bash
npm run photos:packet
```

This writes:

```text
docs/PHOTO_WORKFLOW_PACKET.md
outputs/photo-intake-checklist.tsv
```

Use the packet before a Tuesday photo import. The key workflow is still simple: upload the whole litter photo dump into the litter's `Week N` folder, make sure each puppy has at least one clear collar-identification shot, then use the checklist to map photos to puppy records.

For the cleanest pre-photo-day prep, run:

```bash
npm run photos:plan
```

This refreshes both the Drive folder plan and the photo workflow packet without writing to Google Drive.

When you want the heavier “do the sheet queue rebuild, refresh the weekly queue, and then verify the site” pass, run:

```bash
npm run ops:full
```

This also refreshes:

```text
docs/LAUNCH_DECISION.md
docs/VISUAL_QA_REPORT.md
docs/SEO_METADATA_REPORT.md
docs/DEPLOY_PACKAGE_REVIEW.md
docs/SHEET_SYNC_REVIEW.md
docs/PHOTO_WORKFLOW_PACKET.md
outputs/drive-folder-plan.tsv
docs/PRELAUNCH_SIGNOFF.md
docs/NEXT_SESSION_HANDOFF.md
```

Use `docs/LAUNCH_DECISION.md` as the automation-readiness summary. Use `docs/PRELAUNCH_SIGNOFF.md` as Adam's final human spot-check packet before any domain/DNS launch. Use `docs/NEXT_SESSION_HANDOFF.md` when starting a fresh Codex session or when the computer needs RAM relief.

## Drive Folder Plan

Run this when you want the website data to produce a spreadsheet-friendly list of expected Google Drive folder paths:

```bash
npm run drive:folders
```

This writes:

```text
outputs/drive-folder-plan.tsv
```

By default, this only creates a plan. It does not touch Google Drive. When the bridge is working and you intentionally want to create missing folders inside the Website Hub folder, run:

```bash
npm run drive:folders:write
```

The write command uses the Apps Script bridge `ensurePath` action. If the Website Hub folder ever changes, set `RED_RANCH_WEBSITE_HUB_FOLDER_ID` locally before running the write command.

## Lead Queue Rebuild

New website form submissions are written to both `Website Leads` and `Lead Queue`. `Website Leads` is the raw archive. `Lead Queue` is the daily working tab with status, owner, next action, outcome, and notes.

If the queue ever looks out of sync with the raw submission tab, rebuild it with:

```bash
npm run leads:rebuild-queue
```

This rebuilds `Lead Queue` from `Website Leads`, refreshes dashboard formulas, and preserves any existing queue values in:

- `Status`
- `Follow Up Date`
- `Owner`
- `Next Action`
- `Outcome`
- `Notes`

Run this when you want a CRM-friendly lead operations packet without copying names, emails, or phone numbers into repo docs:

```bash
npm run leads:packet
```

This writes:

```text
docs/LEAD_WORKFLOW_PACKET.md
outputs/lead-queue-snapshot.tsv
```

Use the markdown file as the daily workflow reminder and the TSV as a redacted lead-routing snapshot. The real contact details stay inside the `Website Submissions` Google Sheet.

After bridge formatting changes, redeploy `scripts/website-bridge-apps-script.js` in Apps Script and then run:

```bash
npm run bridge:setup-submissions
```

This reapplies the compact sheet layout: frozen headers, useful filters, dropdown working columns, clipped raw rows, and shorter row heights so the workbook stays quick to scan.

## Smart Sheet Sync

The safer workflow is the smart sync. It reads the live Website Hub sheet first, merges rows by stable IDs, and then writes the merged result back. This keeps extra manual columns and internal notes instead of wiping them away.

Before running the smart sync, deploy the bridge code in:

```bash
scripts/website-bridge-apps-script.js
```

Set these environment variables locally before syncing:

```bash
export RED_RANCH_BRIDGE_URL="YOUR_APPS_SCRIPT_WEB_APP_URL"
export RED_RANCH_BRIDGE_SECRET="YOUR_BRIDGE_SECRET"
```

Preview the generated row counts without touching Google Sheets:

```bash
npm run sync:sheets:dry-run
```

Confirm the bridge URL, secret, and read access are all working before writing sheets:

```bash
npm run test:bridge
```

If this reports `Unauthorized`, open the deployed Apps Script project, go to
Project Settings > Script properties, and confirm `BRIDGE_SECRET` exactly
matches `RED_RANCH_BRIDGE_SECRET` in `.env.local`. After changing script
properties or code, use Deploy > Manage deployments > Edit > New version >
Deploy before testing again.

Run the actual smart sync:

```bash
npm run sync:sheets
```

For safer day-to-day updates, sync only the sheet you changed:

```bash
npm run sync:puppies
npm run sync:litters
npm run sync:previous-litters
npm run sync:parents
npm run sync:waitlist
```

Each targeted sync also has a dry-run version, for example:

```bash
npm run sync:litters:dry-run
```

Stable sync keys:

- Puppy Tracker: `slug`
- Litter Sheet: `slug`
- Previous Litters: `href`
- Parent Dog Sheet: `slug`
- Waitlist Sheet: `breed` + `position`

The smart sync preserves extra live sheet columns and protects note-style fields such as `internal_notes`, `internalNotes`, and `matched_family_display` when those fields already have values in Google Sheets.

Check bridge health before sheet formatting or live sync work:

```bash
npm run bridge:status
```

The Website Submissions compact workbook formatting and bridge-managed notification emails require the deployed Apps Script bridge to report `3.2.0`. If the bridge reports an older version, deploy the current `scripts/website-bridge-apps-script.js` file first, then rerun:

```bash
npm run bridge:setup-submissions
```

## Puppy Record Pattern

Each puppy should include:

- `slug`
- `name`
- `visibility`
- `breedSlug`
- `breed`
- `litterSlug`
- `litter`
- `mamaSlug`
- `studSlug`
- `gender`
- `collarColor`
- `status`
- `sizeCategory`
- `estimatedAdultWeight`
- `birthDate`
- `goHomeDate`
- `price`
- `color`
- `coat`
- `mainPhoto`
- `photos`
- `weeklyPhotos`
- `description`
- `availabilityNote`
- `personalityNote`

## Litter Record Pattern

Each litter should include:

- `slug`
- `name`
- `visibility`
- `status`
- `litterNumber`
- `mamaSlug`
- `studSlug`
- `breedSlug`
- `breed`
- `birthDate`
- `goHomeDate`
- `expectedSize`
- `expectedTiming`
- `expectedColors`
- `expectedCoatTraits`
- `priceRange`
- `availabilitySummary`
- `availabilityNote`
- `puppySlugs`
- `photoFolderHint`
- `weeklyUpdateStatus`
- `weeklyUpdateGallery`

## Parent Record Pattern

Each parent dog should include:

- `slug`
- `name`
- `visibility`
- `role`
- `breedSlug`
- `breed`
- `weight`
- `color`
- `coat`
- `status`
- `mainPhoto`
- `photos`
- `healthTestingLinks`
- `geneticTestingLinks`
- `relatedLitters`
- `photoFolderHint`
- `description`

## Previous Litter Record Pattern

Previous litters are reference pages. They should show the pairing and the puppies that were produced, not old pricing or current availability.

Each previous litter should include:

- `href`
- `visibility`
- `name`
- `group`
- `breed`
- `image`
- `parents`
- `parentPhotos`
- `theme`
- `facts`
- `puppies`
- `puppyPhotos`
- `milestones`
- `photoFolderHint`

Use `parentPhotos` when a previous litter needs specific pairing images, especially for outside studs or retired dogs that should not appear as full public parent profiles.

Recommended `parentPhotos` format:

```json
[
  {
    "name": "Honey",
    "image": "/images/dams/honey-red-ranch-dogs.webp",
    "href": "/parents/honey"
  },
  {
    "name": "Bram",
    "image": "/images/studs/bram-outside-stud-honey-bram-red-ranch-dogs.jpg"
  }
]
```

Recommended `puppyPhotos` format:

```json
[
  {
    "name": "Buzz",
    "image": "/images/puppies/honey-bram-2026/buzz-micro-goldendoodle-puppy-honey-bram-week-6-red-ranch-dogs.jpg"
  }
]
```

## Weekly Tuesday Update

1. Upload puppy photos into the correct Drive folder by litter, puppy, and week.
2. Confirm status changes: Available, Pending, Reserved, Matched, Guardian Candidate, or Private.
3. Update each puppy's `mainPhoto`, `photos`, `weeklyPhotos`, `status`, and short personality note.
4. Update the litter's `availabilitySummary`, `availabilityNote`, `puppySlugs`, and `weeklyUpdateStatus`.
5. If sheet columns drift or a fresh template is needed, run:

```bash
npm run export:sheets
```

6. Run:

```bash
npm run validate:content
npm run review:images
npm run build
npm run verify:routes
```

## Public Listing Rules

- `Available Puppies` should show only puppies with `status` set to `Available` and `visibility` set to `public`.
- Reserved, matched, and waitlist-matching puppies can still appear on current litter pages when the litter itself is public.
- Delivered litters should not stay public as `Planned Litter`. If the puppies have delivered but photos/details are not ready yet, keep the litter record in the data and set `visibility` to `hidden` until it is ready for the Current Litters page.
- A current litter should become public once it has the parent pairing, accurate status copy, puppy names/statuses when available, and a usable first puppy photo set.
- Private support records, such as outside studs used only for a litter pairing, should use `visibility: "private"`.
- Private records can support litter content, but they should not appear as standalone public profile pages or sitemap URLs.
- The sitemap and launch checks now treat both `hidden` and `private` records as non-public.

## Public Safety Rule

Public data should never include private family notes, emails, phone numbers, full last names, payment details, or internal application notes.
