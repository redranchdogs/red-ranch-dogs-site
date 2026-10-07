# Breed selector design QA, October 7, 2026

final result: passed

Source visual truth: `/Users/adamdietlein/.codex/generated_images/01a0833e-7820-7550-934b-bf5c4cbb8c0c/exec-1db5d378-6127-4ea2-b6e1-ae0804e730f8.png`, the revised displayed option one with the helper sentence removed. Adam explicitly authorized building and deploying this revision without another selection checkpoint.

Implementation: `http://127.0.0.1:5297/puppies/upcoming-litters?breed=cavapoo-puppies`.
Screenshot: `/Users/adamdietlein/Documents/New project/website-ui-audits/2026-10-07/breed-selector/implementation-mobile.png`.
Viewport: 390 x 844 CSS px. Source pixels: 853 x 1844; implementation pixels: 390 x 844. Source normalized to 390 x 844 for comparison; implementation density is 1. State: Upcoming Litters, Cavapoos selected, empty breed result.

Full-view comparison: `/Users/adamdietlein/Documents/New project/website-ui-audits/2026-10-07/breed-selector/comparison-mobile-final.png`, source left, implementation right. Focused comparison: `comparison-focused.png` in the same folder. Both were viewed together. Desktop evidence: `implementation-desktop.png`, 1440 x 900. Available and Current evidence: `available-mobile.png`, `current-mobile.png`.

## Findings and comparison history

Initial [P2] cross-breed action labels were left-aligned whereas the selected target centers them with the chevron nearby. Fixed to center the group. Initial desktop actions stretched to 950px; capped them at 480px while retaining full mobile width. Final paired comparison and desktop capture confirm those fixes. No actionable P0/P1/P2 findings remain.

Intentional retained product constraints: the real Website header, logo, eyebrow, hero typography and vertical spacing remain unchanged. The generated reference simplifies those existing regions; recreating that simplification would expand this scoped selector change into a header/hero redesign. Real logo and icon assets replace the mock's generated approximations. The preview watermark is omitted from the production UI.

## Required fidelity surfaces

- Typography: existing Bebas Neue display and Libre Franklin body/UI; visible Choose a breed heading and fully readable breed names. Controls use responsive type without wrapping or truncation at 320/390/768/1440px.
- Spacing: 12px heading-to-selector gap, three equal columns, 52px breed and cross-breed targets, full mobile action width, compact waitlist link. No horizontal overflow at tested sizes.
- Colors: existing cream, ranch red, dark ink tokens; active tab filled red, inactive buttons outlined red. Existing visible focus outline retained.
- Asset quality: real existing Red Ranch logo and Lucide icons retained; no generated image used as interactive UI or replacement logo. All three Available page photos loaded. Existing litter photos retained.
- Copy: helper sentence removed; selected-breed empty message retained, other-breed actions visible, breed-specific future action clear. Global Available and Current empty messages remain truthful when all breeds are empty.

## Interaction verification

Upcoming Cavapoo Browse Goldendoodles and Browse Bernedoodles open their selected breed and listings. ArrowRight changes selection and moves focus; Back restores Cavapoos. Current and Available route navigation works. The development-only populated Available fixture verifies selected-breed emptiness and switching to its puppy card without data mutation. All-empty Available retains the global message and photos when changing breeds. Browser error-log read returned no errors. Automated public route smoke passes 26 routes across mobile and desktop plus mobile menu interaction; visual audit passes.

## Implementation checklist

- Complete: shared selector across Available Now, Current Litters and Upcoming Litters.
- Complete: cross-breed escape actions for individual empty results.
- Complete: responsive, keyboard, history, image and route verification.
- Follow-up polish: none required for this scoped release.
