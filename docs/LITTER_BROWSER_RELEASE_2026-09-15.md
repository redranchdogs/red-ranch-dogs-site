# Litter Browser Release Review

Date: September 15, 2026

Status: **PASS, release authorized**

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

Deployment evidence will be added after the authorized launch-candidate to main release completes and production is verified.
