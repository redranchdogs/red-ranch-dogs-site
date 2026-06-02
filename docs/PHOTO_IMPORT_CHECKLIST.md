# Weekly Media Import Checklist

Generated: 6/2/2026, 4:23:26 PM Central

Use this after a current-litter media drop is uploaded. This is intentionally operational: it keeps the website, Website Hub sheets, and publishing flow in the same order every time.

The latest rehearsal packet is available at `docs/PHOTO_DAY_REHEARSAL.md`.

## Before Editing Website Data

1. Confirm the Google Drive folder name matches the litter pattern: `Mama LitterNumber + Stud`.
2. Confirm the week folder exists under `Website Hub / Weekly Media Drops / Current Litters` or `Website Hub / Weekly Media Drops / Previous Litters`.
3. Confirm the week folder has `Photos` and `Videos` subfolders.
4. Match every puppy by name and collar color before choosing public photos.
5. Choose one clean main photo for any puppy that does not already have one.
6. Keep older weekly photo groups; add a new group instead of replacing history.
7. Keep videos organized in Drive for the future portal; do not add videos to the public website unless Adam asks for that specific public display.
8. If the media came from a puppy weight chart, use birth date, litter name, puppy name, collar color, and gender only; do not publish puppy weights from that chart.

## Website Data Update Order

1. Add or update each puppy's `mainPhoto` only when the chosen image should become the card/profile image.
2. Add the new week under each puppy's `weeklyPhotos`.
3. Add or update the litter-level `weeklyUpdateGallery` only with images that represent the litter as a whole.
4. Update the litter's `weeklyUpdateStatus` so the current litter page names the latest photo round.
5. Keep status wording stable: `Available`, `Waitlist Matching`, or `Reserved`.
6. If puppy, litter, parent, or previous-litter content changed, run the matching Google Sheet sync before publish review.

## Collar Mapping Mini-Table

Use this quick table beside the Drive folder before touching website data:

| Puppy | Collar | Gender | Public photo chosen | Notes |
| --- | --- | --- | --- | --- |
| _fill in from sheet/photo set_ | _color_ | _male/female_ | _file name_ | _identity check_ |

## After Editing Website Data

```bash
npm run validate:content
npm run photos:packet
npm run sync:puppies:dry-run
npm run sync:litters:dry-run
npm run sync:puppies
npm run sync:litters
npm run review:sheets
npm run publish:check
```

## Before Publishing

1. Open the litter page on mobile and confirm the puppy cards are not cramped.
2. Open at least one puppy profile and confirm weekly photo groups appear newest-first.
3. Confirm the `Photos Coming Soon` panel disappears when a litter has gallery photos.
4. Confirm the Website Hub sheets review passes before pushing.
5. Commit, push, and deploy only after the website and sheets are aligned.
