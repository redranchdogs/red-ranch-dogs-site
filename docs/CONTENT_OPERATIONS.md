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
5. Run:

```bash
npm run validate:content
npm run build
npm run verify:routes
```

## Public Safety Rule

Public data should never include private family notes, emails, phone numbers, full last names, payment details, or internal application notes.
