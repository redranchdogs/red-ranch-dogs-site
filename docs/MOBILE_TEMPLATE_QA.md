# Mobile Template QA

Generated: 5/20/2026, 3:49:01 PM Central

Status: **PASS**

This audit checks the mobile template stack for current litters, current litter detail pages, and individual puppy pages. It is meant to catch missing weekly photos, broken public images, and horizontal overflow before Adam spots it on an iPhone.

## Blockers

- None flagged.

## Warnings

- /puppies/current-litters: Overflow candidates: input
- /litters/penny-wyatt-spring-2026: Overflow candidates: input
- /litters/whitley-waylon-april-2026: Overflow candidates: input
- /puppies/striker: Overflow candidates: input
- /puppies/hook: Overflow candidates: input

## Checked Routes

| Route | Template | Status | Visible images | Key selectors |
| --- | --- | ---: | ---: | --- |
| /puppies/current-litters | Current Litters | 200 | 10 | .current-litter-list .litter-card: 4 |
| /litters/penny-wyatt-spring-2026 | Current Litter Detail | 200 | 18 | .litter-summary-panel: 1<br>.litter-puppy-list .puppy-card: 6<br>.litter-gallery-section img: 6 |
| /litters/whitley-waylon-april-2026 | Newest Current Litter Detail | 200 | 18 | .litter-summary-panel: 1<br>.litter-puppy-list .puppy-card: 6<br>.litter-gallery-section img: 6 |
| /puppies/striker | Puppy Detail With Weekly Photos | 200 | 9 | .puppy-detail-section .puppy-card: 1<br>.puppy-weekly-photo-section img: 6 |
| /puppies/hook | Newest Puppy Detail With Weekly Photos | 200 | 6 | .puppy-detail-section .puppy-card: 1<br>.puppy-weekly-photo-section img: 3 |
