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
