# Mobile Template QA

Generated: 10/2/2026, 8:45:48 AM Central

Status: **PASS**

This audit checks each current/upcoming litter breed tab against public source records, including populated and empty panels, card destinations, tab navigation, and private-record exclusion. It also checks current litter detail pages and current puppy pages with weekly photos when present, plus broken public images and horizontal overflow at mobile width.

## Blockers

- None flagged.

## Warnings

- /puppies/current-litters?breed=cavapoo-puppies: Overflow candidates: input
- /puppies/current-litters?breed=goldendoodle-puppies: Overflow candidates: input
- /puppies/current-litters?breed=bernedoodle-puppies: Overflow candidates: input
- /puppies/upcoming-litters?breed=cavapoo-puppies: Overflow candidates: input
- /puppies/upcoming-litters?breed=goldendoodle-puppies: Overflow candidates: input
- /puppies/upcoming-litters?breed=bernedoodle-puppies: Overflow candidates: input

## Checked Routes

| Route | Template | Status | Visible images | Key selectors |
| --- | --- | ---: | ---: | --- |
| /puppies/current-litters?breed=cavapoo-puppies | Current Cavapoo Litters | 200 | 2 | .litter-browser-tabs #litter-tab-current-cavapoo-puppies: 1<br>#litter-panel-current: 1<br>.litter-browser-empty: 1 |
| /puppies/current-litters?breed=goldendoodle-puppies | Current Goldendoodle Litters | 200 | 2 | .litter-browser-tabs #litter-tab-current-goldendoodle-puppies: 1<br>#litter-panel-current: 1<br>.litter-browser-empty: 1 |
| /puppies/current-litters?breed=bernedoodle-puppies | Current Bernedoodle Litters | 200 | 2 | .litter-browser-tabs #litter-tab-current-bernedoodle-puppies: 1<br>#litter-panel-current: 1<br>.litter-browser-empty: 1 |
| /puppies/upcoming-litters?breed=cavapoo-puppies | Upcoming Cavapoo Litters | 200 | 2 | .litter-browser-tabs #litter-tab-upcoming-cavapoo-puppies: 1<br>#litter-panel-upcoming: 1<br>.litter-browser-empty: 1 |
| /puppies/upcoming-litters?breed=goldendoodle-puppies | Upcoming Goldendoodle Litters | 200 | 6 | .litter-browser-tabs #litter-tab-upcoming-goldendoodle-puppies: 1<br>#litter-panel-upcoming: 1<br>.litter-browser-list .litter-browser-card: 2 |
| /puppies/upcoming-litters?breed=bernedoodle-puppies | Upcoming Bernedoodle Litters | 200 | 4 | .litter-browser-tabs #litter-tab-upcoming-bernedoodle-puppies: 1<br>#litter-panel-upcoming: 1<br>.litter-browser-list .litter-browser-card: 1 |
