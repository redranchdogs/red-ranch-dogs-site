# No Current Litters Release

Date: September 16, 2026

## Result

The public website now reports that Red Ranch Dogs has no current litters. Winnie + Wyatt is preserved as a previous litter at the same stable URL. No loss details are published.

The Find Your Puppy Current Litters preview uses the existing Ridge illustration at focal point `50% 25%`. This keeps the puppy above center while leaving visible space above the head.

## Public Behavior

- `/puppies/current-litters` shows zero current-litter cards and a clear no-current-litters message.
- The empty state links to the verified Kylie + Ranger upcoming pairing.
- `/puppies/available` says no current litters are posted and does not name Winnie.
- `/litters/winnie-wyatt-spring-2026` remains available and labels the litter `Previous Litter` in both the hero and summary.
- `public/llms-full.txt` reports `None currently listed` under Current Litters.

## Verification

- Local content validation, source-of-truth checks, lint, route smoke tests, production build, bundle budget, SEO review, public safety review, form contract tests, and deploy-package review passed.
- Public route smoke covered 22 routes at mobile and desktop sizes.
- Production was verified at 390px and 1440px with zero horizontal overflow.
- The production Ridge crop resolves to `object-position: 50% 25%`.
- The production Upcoming link resolves to a page containing the Kylie + Ranger card.
- Launch-candidate Website Health run `35110116264` passed.
- Main Website Health run `35110319913` passed.
- Deployed code/content commit: `b6a1ddd9f24d4a940aa2f06e7e82fbec2f2d56a3`.

## Ownership Boundary

The live Website Hub Litters sheet still records Winnie as `Current Litter`, while the website-owned public data records `Previous Litter`. `docs/SHEET_SYNC_REVIEW.md` records this one mismatch. No sync was run because the authorized scope was public website display only. CRM, Breeding Ops, applications, forms, applicant workflows, and upcoming pairings were not changed.
