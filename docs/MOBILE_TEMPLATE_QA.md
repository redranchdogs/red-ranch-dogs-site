# Mobile Template QA

Generated: 10/22/2026, 11:56:40 AM Central

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
- /litters/beatrix-enzo-planned-2026: Overflow candidates: input; input
- /litters/kylie-ranger-late-summer-2026: Overflow candidates: input
- /puppies/october: Overflow candidates: gallery-photo-button; img; gallery-photo-button; img; gallery-photo-button; img; gallery-photo-button; img
- /puppies/bram: Overflow candidates: gallery-photo-button; img; gallery-photo-button; img; gallery-photo-button; img; gallery-photo-button; img

## Checked Routes

| Route | Template | Status | Visible images | Key selectors |
| --- | --- | ---: | ---: | --- |
| /puppies/current-litters?breed=cavapoo-puppies | Current Cavapoo Litters | 200 | 2 | .litter-browser-tabs #litter-tab-current-cavapoo-puppies: 1<br>#litter-panel-current: 1<br>.litter-browser-empty: 1 |
| /puppies/current-litters?breed=goldendoodle-puppies | Current Goldendoodle Litters | 200 | 4 | .litter-browser-tabs #litter-tab-current-goldendoodle-puppies: 1<br>#litter-panel-current: 1<br>.litter-browser-list .litter-browser-card: 1 |
| /puppies/current-litters?breed=bernedoodle-puppies | Current Bernedoodle Litters | 200 | 4 | .litter-browser-tabs #litter-tab-current-bernedoodle-puppies: 1<br>#litter-panel-current: 1<br>.litter-browser-list .litter-browser-card: 1 |
| /puppies/upcoming-litters?breed=cavapoo-puppies | Upcoming Cavapoo Litters | 200 | 2 | .litter-browser-tabs #litter-tab-upcoming-cavapoo-puppies: 1<br>#litter-panel-upcoming: 1<br>.litter-browser-empty: 1 |
| /puppies/upcoming-litters?breed=goldendoodle-puppies | Upcoming Goldendoodle Litters | 200 | 6 | .litter-browser-tabs #litter-tab-upcoming-goldendoodle-puppies: 1<br>#litter-panel-upcoming: 1<br>.litter-browser-list .litter-browser-card: 2 |
| /puppies/upcoming-litters?breed=bernedoodle-puppies | Upcoming Bernedoodle Litters | 200 | 2 | .litter-browser-tabs #litter-tab-upcoming-bernedoodle-puppies: 1<br>#litter-panel-upcoming: 1<br>.litter-browser-empty: 1 |
| /litters/beatrix-enzo-planned-2026 | Current Litter Detail | 200 | 22 | .litter-detail-overview: 1<br>.litter-detail-overview .litter-primary-facts: 1<br>.litter-detail-overview .litter-pairing-card: 1<br>.litter-puppy-list .puppy-card: 9<br>.litter-gallery-section img: 9 |
| /litters/kylie-ranger-late-summer-2026 | Additional Current Litter Detail | 200 | 16 | .litter-detail-overview: 1<br>.litter-detail-overview .litter-primary-facts: 1<br>.litter-detail-overview .litter-pairing-card: 1<br>.litter-puppy-list .puppy-card: 6<br>.litter-gallery-section img: 6 |
| /puppies/october | Puppy Detail With Weekly Photos | 200 | 13 | .puppy-detail-section .puppy-card: 1<br>.puppy-weekly-photo-section img: 9 |
| /puppies/bram | Additional Puppy Detail With Weekly Photos | 200 | 14 | .puppy-detail-section .puppy-card: 1<br>.puppy-weekly-photo-section img: 10 |
