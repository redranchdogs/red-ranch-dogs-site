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

## Website Data Files

- `src/data/puppies.json`: individual puppy records.
- `src/data/litters.json`: litter records and parent pairings.
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
- `outputs/content-sheet-exports/parent-dogs.tsv`
- `outputs/content-sheet-exports/column-guide.tsv`

Use these files as the canonical column layout for the Puppy Tracker, Litter Sheet, and Parent Dog Sheet. The column names intentionally match the website data fields so future sheet-to-website automation can stay simple.

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

Run the actual smart sync:

```bash
npm run sync:sheets
```

Stable sync keys:

- Puppy Tracker: `slug`
- Litter Sheet: `slug`
- Parent Dog Sheet: `slug`
- Waitlist Sheet: `breed` + `position`

The smart sync preserves extra live sheet columns and protects note-style fields such as `internal_notes`, `internalNotes`, and `matched_family_display` when those fields already have values in Google Sheets.

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
npm run build
npm run verify:routes
```

## Public Safety Rule

Public data should never include private family notes, emails, phone numbers, full last names, payment details, or internal application notes.
