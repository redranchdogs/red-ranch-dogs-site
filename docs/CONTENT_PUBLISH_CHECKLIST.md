# Content Publish Checklist

Use this when website content changes need to flow cleanly into the live site, Website Hub sheets, CRM handoff, and future Breeding Ops or portal work.

## Standard Flow

1. Update website source data or templates.
2. Regenerate crawler files:

```bash
npm run seo:crawler
```

3. Sync the affected Website Hub sheet:

```bash
npm run sync:puppies
npm run sync:litters
npm run sync:parents
npm run sync:previous-litters
npm run sync:waitlist
```

4. Review sheet alignment:

```bash
npm run review:sheets
```

5. Run the publish gate:

```bash
npm run publish:check
```

6. Commit and push after the publish gate passes.

## Which Sheet To Sync

| Website change | Sheet command |
| --- | --- |
| Puppy name, collar, gender, status, photos, personality, price, go-home date | `npm run sync:puppies` |
| Litter status, birth date, go-home date, puppy list, availability note, weekly gallery | `npm run sync:litters` |
| Mama or stud profile, photo, weight, related litter, description | `npm run sync:parents` |
| Previous litter pairing, puppy archive, parent photo, milestone photo | `npm run sync:previous-litters` |
| Public waitlist display rows | `npm run sync:waitlist` |

## Guardrail

`npm run publish:check` will fail if `docs/SHEET_SYNC_REVIEW.md` is not passing or if structured data changed after the last sheet review. That is intentional: the website and Website Hub sheets should stay aligned before a live publish.
