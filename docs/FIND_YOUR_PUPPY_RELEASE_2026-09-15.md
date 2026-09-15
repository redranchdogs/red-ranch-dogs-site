# Find Your Puppy Release Review

Date: September 15, 2026

Release state: deployed and production verified

## Result

The Available Puppies experience now acts as a compact Find Your Puppy hub. It keeps three clear routes in the same order everywhere in the browsing flow:

1. Available Now
2. Current Litters
3. Upcoming Litters

Each item is a real link to its existing public route. Current and Upcoming preserve the selected breed in `?breed=`. The pages retain separate titles and canonical URLs, and browser Back, Forward, reload, and shared direct links restore the correct route.

## Mobile navigation

Inside the hamburger menu, the former Available Puppies, Current Litters, and Upcoming Litters entries are replaced by one Find Your Puppy link. Previous Litters and all existing breed pages remain present. Desktop navigation remains unchanged.

## Empty availability

The current public source returns zero puppies that qualify as Available. The page says this directly and provides two useful next steps:

- Current Litters uses Ridge from Ginny + Butch Cassidy as an approved navigation illustration without an over-image label.
- Upcoming Litters uses the existing Beatrix and Enzo parent photos and links to the Goldendoodle view.

The copy does not infer availability from a current litter or from survivor counts. It also reminds visitors that current litters may already have families waiting.

## Populated behavior

A development-only `?fixture=populated` state exercises the future Available puppy card layout. The card is explicitly labeled as an illustrative local fixture. The fixture does not alter public data and cannot appear in a production build.

## Visual review

The approved concept is implemented with the existing Red Ranch cream, red, and charcoal palette, typography, header, footer, and card system. The finder flow uses a plain cream surface. Generated dogs, ranch scenery, slogans, and ornamental art from concept exploration were not used.

Evidence:

- Source comparison: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-release-2026-09-15/source-vs-implementation.png`
- Empty mobile at 320: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-release-2026-09-15/available-empty-320.png`
- Empty mobile at 390: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-release-2026-09-15/available-empty-390.png`
- Empty desktop at 1440: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-release-2026-09-15/available-empty-1440.png`
- Populated mobile fixture: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-release-2026-09-15/available-populated-390.png`

## Verification

- `npm run publish:check`: passed against the final local implementation
- `npm run check:public-routes`: covered 22 routes at mobile and desktop sizes plus mobile menu interaction
- 320, 390, and 1440 pixel overflow: 0 pixels
- Route control height: 48 pixels on mobile and at least 46 pixels on desktop
- Reduced-motion panel animation: 0.001ms
- Preview images: loaded at their expected natural dimensions with explicit focal positions
- Public data writes: none
- Live form submissions: none

## Production checkpoint

Deployed code and review commit: `565bc04ab628cd5e8c38166ad9d82afa05795290`

GitHub Website Health:

- Launch candidate run `35029478117`: passed
- Main run `35029635978`: passed

Production verification at `https://www.redranchdogs.com/puppies/available` passed at 390 pixels. The correct title and canonical were present, the zero-availability statement and both real-image previews rendered, all three images loaded at their expected source dimensions and focal positions, the page had no horizontal overflow, the consolidated hamburger menu was correct, and route navigation preserved separate Current and Upcoming URLs, titles, canonicals, and browser history.

Production screenshot: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-release-2026-09-15/production-available-empty-390.png`

### Caption follow-up

Adam reported that the first production image banners covered too much of the photos. Code commit `99bcad5dadf67919ca024a7ff6491831a52d7359` removed the Current Litters label and moved the Beatrix + Enzo pairing name below its images. Launch-candidate Website Health run `35032503681` and main run `35032634252` passed. Fresh production measurements at 320, 390, and 1440 pixels showed no caption overlap and no horizontal overflow.

Corrected production screenshot: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-caption-fix-2026-09-15/production-final-full-390.png`
