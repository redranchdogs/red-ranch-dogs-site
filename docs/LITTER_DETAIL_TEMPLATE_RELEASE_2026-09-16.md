# Litter Detail Template Release

Released: September 16, 2026

## Production result

The shared litter-detail template now uses the approved compact, mobile-first hierarchy on planned, current, and previous litter pages. Beatrix + Enzo is the verified reference page:

- Live page: https://www.redranchdogs.com/litters/beatrix-enzo-planned-2026
- Descriptor: F1B-style Mini Goldendoodles
- Status: Pregnancy confirmed
- Price: $2,800
- Expected adult size: 25-35 lbs
- Estimated birth: September 29, 2026
- Estimated go-home: November 23-24, 2026

The template presents one lifecycle badge, the main facts without an extra at-a-glance heading, original full-body parent photos, linked Mama and Sire labels, a compact About This Litter disclosure, and the existing application and contact actions. The disclosure retains all detailed copy, genetic notes, highlights, and prior-litter links and photos. Puppy cards, galleries, videos, and go-home sections remain available when the litter has them.

## Mobile image follow-up

Ridge's Find Your Puppy preview uses `object-position: 50% 30%`. This leaves a visible strip above the head while keeping the face above center. The setting is isolated to Ridge and does not alter other puppy or parent images.

## Lifecycle and navigation behavior

- Planned litters use Estimated Birth and Estimated Go-Home labels.
- Previous litters use recorded Birth Date and Go-Home labels when the record is final.
- Georgia + Waylon shows Previous litter and retains all five puppy cards.
- Winnie + Wyatt shows Previous litter on its stable public URL.
- Parent portraits open in the same tab. Browser Back restores the litter-page scroll position.

## Verification

- Local `npm run health:change:ci`: passed.
- Public route smoke: 24 routes across mobile and desktop, passed three consecutive times after the Back-navigation timing hardening.
- Launch-candidate Website Health: run `35170718093`, passed on commit `253804ee5f570210cb13bab0ae839b1178438f41`.
- Main Website Health: run `35170854384`, passed on the same commit.
- Production checks: 390 x 844 and 1440 x 1000, zero horizontal overflow, no console errors, both original parent images loaded with `object-fit: contain`, About disclosure opened with six paragraphs and supporting sections, and Back restored 169px to 169px.
- Ridge crop checks: 320, 390, and 1440 pixels, `50% 30%`, zero overflow, no console errors.

Production evidence:

- `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-detail-template-2026-09-16/production-beatrix-mobile-390.png`
- `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-detail-template-2026-09-16/production-beatrix-desktop-1440.png`
- `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-detail-template-2026-09-16/production-beatrix-about-open-390.png`
- `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-detail-template-2026-09-16/production-ridge-crop-390.png`

## Mobile fact-fit follow-up

The shared mobile template now uses the full content width for the breed descriptor and reduces the responsive size of the descriptor and emphasized facts. Kylie + Ranger displays `Multigen Micro Bernedoodles`, `$4,500`, and `~25 lbs` on one line at ordinary mobile widths. `~25 lbs` is a display-only normalization of the existing `Around 25 lbs` source value; no litter data changed.

- Tested all existing litter descriptors and size values locally at 320, 375, 390, 430, and 1440 pixels.
- Rechecked the deployed Kylie + Ranger page at the same five widths.
- At simulated 200% text size, the descriptor wraps to two visible lines. Overflow remains visible, text-overflow remains clip, and the page has zero horizontal overflow.
- Price, dates, Mama/Sire labels, parent photos, accordion, CTAs, puppy sections, SEO, forms, and integrations were unchanged.
- Runtime commit: `d454061e86e1955755d344821c241d4084b4914a`.
- Final release commit: `dffee82eb89cc6f5fd2ac984c28782c864bc51ab`.
- Launch-candidate Website Health: run `35172831209`, passed.
- Main Website Health: run `35172939440`, passed.
- Production screenshot: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-fact-fit-2026-09-16/production-kylie-ranger-390.png`.

## Ownership boundary

No generated dog assets were published. No Sheet, CRM, Breeding Ops, form, applicant, or communication record was changed. The read-only Sheet review still reports the pre-existing Winnie mismatch: website `Previous Litter`, live Sheet `Current Litter`. That mismatch was not created or changed by this release.
