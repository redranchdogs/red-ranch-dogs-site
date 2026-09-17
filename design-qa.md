# Design QA: Current and Upcoming litter browser

Final result: passed

## Source

- Selected visual: `/Users/adamdietlein/.codex/generated_images/01a05e23-7840-7ad2-b872-56105195c3dd/exec-45fe5c6b-0028-41d7-bd53-b792cfa2bc9a.png`
- Combined comparison: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-browser-release-2026-09-15/source-vs-implementation.png`

The selected visual supplied the compact timing switch, three always-visible breed tabs, clear selected state, and direct litter cards. The implementation intentionally omits the generated dog image, script slogan, ranch scenery, and decorative footer art. It uses the existing Red Ranch header, exact approved parent photos, source-backed litter text, and a plain cream page background.

## Implementation captures

| State | Viewport | Screenshot |
| --- | --- | --- |
| Current Cavapoo with one litter | 390 x 844, full page | `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-browser-release-2026-09-15/current-cavapoo-390.png` |
| Upcoming Goldendoodle with multiple litters | 390 x 844, full page | `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-browser-release-2026-09-15/upcoming-goldendoodle-390.png` |
| Upcoming Cavapoo empty state | 320 x 700, full page | `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-browser-release-2026-09-15/upcoming-cavapoo-empty-320.png` |
| Upcoming Goldendoodle desktop | 1440 x 1000, full page | `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-browser-release-2026-09-15/upcoming-goldendoodle-1440.png` |
| Production Upcoming Goldendoodle | 390 x 844, full page | `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-browser-release-2026-09-15/production-upcoming-goldendoodle-390.png` |

## Full-page comparison

The implementation preserves the reference hierarchy while matching the live brand. All three breed choices appear before any litter card. Multiple litters use a vertical list. Each summary uses one primary View litter action. Desktop uses the same information order with a wider two-column card.

## Focused comparison and findings

| Area | Result | Evidence |
| --- | --- | --- |
| Mobile hierarchy | Passed | Timing switch and all three breed tabs remain above the first card at 320 and 390 pixels. |
| Selected state | Passed | Active timing is red-filled; active breed is red with a persistent underline and `aria-selected=true`. |
| Real imagery | Passed | Rendered sources resolve to the existing Beatrix, Enzo, Lulu, Bram, Winnie, Wyatt, and Kylie/Ranger project assets. |
| Truthful content | Passed | Names, status, timing, go-home text, and availability labels come from existing public records. |
| Empty states | Passed | Current and Upcoming keep every breed selectable and use the approved copy and one relevant link. |
| Multiple litters | Passed | Two Goldendoodle pairings render as an ordinary vertical list. |
| Deep links and history | Passed | `?breed=` links restore the selected breed across timing switches and browser Back. |
| Keyboard behavior | Passed | Tabs use tab semantics, roving focus, Arrow keys, Home, and End. |
| Reduced motion | Passed | Panel animation resolves to 0.001ms when reduced motion is requested. |
| Overflow and touch size | Passed | No horizontal overflow at 320, 390, or 1440 pixels; tabs measure at least 99 x 52 pixels on the narrowest view. |
| Loading and failure | Passed | Development-only loading and error fixtures use distinct status and alert presentations and never reuse empty-state copy. |
| All-matched lifecycle | Passed | The development fixture keeps the current litter card visible and shows Reserved separately from Current Litter. |

## Iteration history

1. Replaced the Current and Upcoming accordion presentations with one shared selector.
2. Reordered the selector to Cavapoos, Goldendoodles, Bernedoodles without changing broader site navigation or data order.
3. Added query-backed breed state and keyboard tab behavior.
4. Reduced card facts and actions to the source-backed essentials.
5. Removed the background grid behind this flow to keep the approved plain cream presentation.
6. Updated public route and GA4 browser contracts for the new interaction.

## Photo framing follow-up

Adam requested that every dog face be centered after reviewing the first production release. A focused before/after review covered all eight parent images in the affected cards at 390 and 1440 pixels. Mobile pairing images now use a 4:5 portrait treatment instead of the earlier landscape crop, and each authorized source image has a small presentation focal point. All faces remain visible with eyes, ears, and muzzles intact. The card order, copy, actions, and data did not change.

Comparison: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-browser-face-framing-2026-09-15/all-mobile-before-after.png`.

## Find Your Puppy hub

Final result: passed

### Source and implementation

- Selected visual: `/Users/adamdietlein/.codex/generated_images/01a05e23-7840-7ad2-b872-56105195c3dd/exec-fc639d65-0bf0-477e-8684-9b6197c5f016.png`
- Combined comparison: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-release-2026-09-15/source-vs-implementation.png`
- Empty state at 320 pixels: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-release-2026-09-15/available-empty-320.png`
- Empty state at 390 pixels: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-release-2026-09-15/available-empty-390.png`
- Empty state at 1440 pixels: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-release-2026-09-15/available-empty-1440.png`
- Populated layout fixture at 390 pixels: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-release-2026-09-15/available-populated-390.png`
- Production empty state at 390 pixels: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-release-2026-09-15/production-available-empty-390.png`

The implementation preserves the selected concept's cream, red, and charcoal hierarchy, three destination selector, compact image-and-copy rows, and direct calls to action. It intentionally uses the existing Red Ranch header and footer, uses Ridge as an unlabeled Current Litters navigation illustration, and uses the verified Beatrix + Enzo parent photos instead of generated dogs.

### Findings

| Area | Result | Evidence |
| --- | --- | --- |
| Mobile hierarchy | Passed | Available Now, Current Litters, and Upcoming Litters stay visible above the first decision point at 320 and 390 pixels. |
| Empty availability | Passed | The page states that no puppies are listed as available and offers current and upcoming paths without treating current litter counts as availability. |
| Populated safety | Passed | A development-only fixture exercises the Available card layout and is labeled as illustrative local content. Production data remains unchanged. |
| Real imagery | Passed | Ridge renders from a 1200 x 1800 approved project asset. Beatrix and Enzo render from their 900 x 1350 approved parent assets with retained focal positions. |
| Navigation | Passed | The three destinations are real links with distinct URLs, titles, canonicals, reload behavior, and browser Back and Forward behavior. |
| Mobile menu | Passed | The three redundant puppy-timing choices are replaced by one Find Your Puppy entry. Previous Litters and breed pages remain present. |
| Current and Upcoming | Passed | Existing breed tabs, litter cards, empty states, and parent-photo focal fixes remain in use. |
| Accessibility | Passed | Route controls expose `aria-current`, breed controls retain keyboard tab behavior, and reduced motion collapses the panel animation to 0.001ms. |
| Layout | Passed | No horizontal overflow at 320, 390, or 1440 pixels. Mobile route controls are 48 pixels high and desktop controls are at least 46 pixels high. |
| Visual restraint | Passed | The new flow uses a plain cream surface and existing type, color, spacing, cards, and footer conventions. |

### Iteration history

1. Unified the three discovery routes with a shared, crawlable selector while preserving their individual URLs and metadata.
2. Replaced the zero-availability dead end with two truthful preview paths.
3. Chose one approved historical puppy image and one verified upcoming pairing.
4. Kept Available puppy browsing compact with the existing three-breed order for future populated states.
5. Removed the global grid only behind the new finder flow and preserved it elsewhere.
6. Added empty, populated, history, metadata, mobile menu, keyboard, reduced-motion, image, and overflow checks.

### Preview caption correction

Adam reported that the original dark image banners obscured the puppy photos. The Current Litters illustration now has no visible caption. The Beatrix + Enzo pairing name remains as a small caption below its images. Production checks at 320, 390, and 1440 pixels confirmed zero caption overlap, full image loading, retained focal positions, and no horizontal overflow.

Production screenshot: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-caption-fix-2026-09-15/production-final-full-390.png`.

### Current Litters puppy focal point

Adam requested a little more space above the puppy's head while keeping the face above center. Ridge now uses an asset-specific `50% 30%` focal point. Local checks at 320, 390, and 1440 pixels confirmed the same crop, full source-image loading, no caption, and no horizontal overflow. Production verification is recorded in the September 16 release evidence.

Production card capture: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/find-your-puppy-focal-fix-2026-09-15/production-final-ridge-card-390.png`.

## September 16, 2026 Litter Detail Template

Final result: passed

### Source and evidence

- Selected visual truth: `/Users/adamdietlein/.codex/generated_images/01a05e23-7840-7ad2-b872-56105195c3dd/exec-1505c1b7-e242-4b87-a3ff-205f253f4bdf.png`
- Source pixels: 853 x 1844. The comparison board normalizes the source to 390 CSS pixels wide at density 1.
- Local mobile implementation: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-detail-template-2026-09-16/local-beatrix-mobile-390.png`
- Local desktop implementation: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-detail-template-2026-09-16/local-beatrix-desktop-1440.png`
- Full-view comparison: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-detail-template-2026-09-16/source-vs-local-mobile.png`
- Browser state: Beatrix + Enzo planned litter, About This Litter collapsed for the comparison and opened for interaction verification.
- Viewports: 390 x 844 mobile and 1440 x 1000 desktop, device scale factor 1.

### Findings

No actionable P0, P1, or P2 differences remain.

| Fidelity surface | Result | Evidence |
| --- | --- | --- |
| Fonts and typography | Passed | Existing Bebas Neue headings and Libre Franklin body text reproduce the mockup's condensed editorial hierarchy while preserving the live brand. Names, descriptor, facts, and CTA remain readable at both viewports. |
| Spacing and layout rhythm | Passed | The final mobile pass tightened the title, facts, disclosure, and CTA after the first comparison showed excess vertical space. The site header and Ask a question link make the live page slightly taller than the concept by design. |
| Colors and visual tokens | Passed | Existing ivory, burgundy, charcoal, line, and subtle grid tokens match the selected direction without introducing a second visual system. |
| Image quality and fidelity | Passed | Production assets are the original 900 x 1350 Beatrix and Enzo photos. Both render at `object-fit: contain`, with heads and paws visible. No generated dog image is used. |
| Copy and content | Passed | Verified price, expected size, estimated dates, F1B-style Mini Goldendoodles descriptor, and pregnancy status render once in the main hierarchy. The redundant news paragraph and at-a-glance title are absent. |
| Interaction | Passed | Both parent portraits and names link in the same tab. Browser Back restores the litter scroll position. The accordion opens and retains all six detail paragraphs, genetic notes, highlights, and previous-puppy photo link. |
| Lifecycle behavior | Passed | A public previous litter renders recorded Birth Date and Go-Home labels, `Previous litter` status, and all five existing puppy cards. Planned litters keep estimated labels. |
| Accessibility and resilience | Passed | One visible H1, accessible parent-link names, native details disclosure, no missing alt text, no console errors, and zero horizontal overflow at mobile and desktop. |

### Comparison history

1. First comparison found a P2 density mismatch below the title and around the CTA. The implementation was materially taller than the selected mobile concept.
2. Reduced mobile hero spacing, fact padding, disclosure spacing, and CTA copy while preserving the existing header and contact route.
3. Second comparison passed. The remaining height difference comes from intentional live-site elements: the existing header, Ask a question link, newsletter, and footer.

### Focused regions

- Header and facts: one pregnancy badge, prominent $2,800 and 25-35 lbs, estimated date labels, and no repeated title.
- Parent portraits: original full-body images, visible heads and paws, and Mama/Sire labels.
- Disclosure and CTA: compact closed state, complete open content, Join the Waitlist action, and preserved contact path.

### Production verification

- Production mobile: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-detail-template-2026-09-16/production-beatrix-mobile-390.png`
- Production desktop: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-detail-template-2026-09-16/production-beatrix-desktop-1440.png`
- Open disclosure: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-detail-template-2026-09-16/production-beatrix-about-open-390.png`
- Ridge crop: `/Users/adamdietlein/.codex/visualizations/2026/09/08/01a0833e-7820-7550-934b-bf5c4cbb8c0c/litter-detail-template-2026-09-16/production-ridge-crop-390.png`
- Website Health: launch-candidate run `35170718093` and main run `35170854384` passed on commit `253804ee5f570210cb13bab0ae839b1178438f41`.
