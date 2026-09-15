# Litter Browser Release Review

Date: September 15, 2026

Status: **DEPLOYED AND VERIFIED**

## Result

Current Litters and Upcoming Litters now share a mobile-first breed browser. Cavapoos, Goldendoodles, and Bernedoodles are always visible in that order. The selected breed stays active when a visitor switches between Current and Upcoming, and query-backed links support direct sharing and browser Back.

Litter summaries use existing Red Ranch parent photos and public litter facts. Each card has one View litter action. Empty breeds stay selectable and show the approved Current or Upcoming message with one relevant next step.

## Scope preserved

- No homepage, form, handler, CRM, Breeding Ops, contract, webhook, sync, payment, analytics setting, or public content-data change.
- No generated dog imagery or lookalike parent assets.
- No application or other live form submission during QA.
- Shared dirty checkout remained untouched; release work used `/private/tmp/rrd-litter-tabs-20260915`.

## Verification

- `npm run publish:check`: PASS.
- Public route smoke: 21 routes across mobile and desktop plus mobile menu interaction, PASS.
- GA4 contract: 14 expected events, private form values excluded, PASS.
- Mobile layouts: 320 and 390 pixels, no horizontal overflow, three readable 52-pixel-high breed tabs.
- Desktop layout: 1440 pixels, coherent two-column cards.
- Deep link, timing-switch preservation, browser Back, keyboard tabs, empty, multiple-litter, all-matched, loading, failure, and reduced-motion states: PASS.
- Visual comparison: see `design-qa.md` and the referenced screenshot artifacts.

## Design references retained

The selected generated option is the implementation source. A1 Gallery, Refero Styles, and the supplied component-library screenshots remain optional inspiration for later work. They are not install authorization or instructions to broaden this release.

## Release state

- Released through `codex/launch-candidate` and merged to `main` in commit `f1506f5e4259fa1f01c43e1bb8c1b4d580e15f2c`.
- GitHub Website Health after-change run `35023576787`: PASS.
- `https://www.redranchdogs.com/puppies/upcoming-litters?breed=goldendoodle-puppies`: HTTP 200; three breed tabs, two Goldendoodle cards, real parent images, no horizontal overflow at 390 pixels.
- Live Current/Upcoming switch preserved `breed=goldendoodle-puppies`; browser Back restored Upcoming with Goldendoodles selected.
- `https://red-ranch-dogs-site.vercel.app` served the same release asset as the primary domain.
- Production screenshot: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-browser-release-2026-09-15/production-upcoming-goldendoodle-390.png`.

## Photo framing correction

Adam approved and requested an immediate production correction after the first release. All eight parent images used by the Current and Upcoming cards now share a taller mobile portrait crop and asset-specific focal points so each face remains centered without clipping eyes, ears, or muzzle. The original authorized files remain unchanged.

- Reviewed parents: Winnie, Wyatt Earp, Beatrix, Enzo, Lulu, Bram, Kylie, and Ranger.
- Verified Current Cavapoo, Upcoming Goldendoodle, and Upcoming Bernedoodle at 390 and 1440 pixels.
- Focused checks: public-route smoke, lint, and production build, all PASS.
- Before/after comparison: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-browser-face-framing-2026-09-15/all-mobile-before-after.png`.
- Deployed in code commit `0873b2d` and verified on the primary production domain at 390 and 1440 pixels for Current Cavapoo, Upcoming Goldendoodle, and Upcoming Bernedoodle. All eight images loaded with their intended focal positions and zero horizontal overflow. GitHub Website Health run `35024554809` passed.
