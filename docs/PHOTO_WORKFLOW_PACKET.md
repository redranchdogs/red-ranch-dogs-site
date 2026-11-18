# Photo Workflow Packet

Generated: 11/18/2026, 2:31:39 PM Central

This is the working packet for weekly puppy media, parent photo cleanup, and previous-litter media backfill. It is intentionally internal: it describes Google Drive paths and matching rules so the public website can stay clean.

## Media Day Rules

1. Upload each litter's weekly media into the right week folder, with photos in `Photos` and videos in `Videos`.
2. Do not create individual puppy folders unless the photo set is confusing. A full dump is fine when every puppy has a clear collar-color identifier.
3. Make the first usable shot for each puppy a clear collar-identification shot. The matching key is puppy name plus collar color.
4. Keep public file names website-friendly: lowercase, hyphenated, puppy name, breed, litter, week, and `red-ranch-dogs`.
5. Public pages should never show internal upload notes such as Drive folders, media drops, or import reminders.
6. Keep videos in Drive for the future puppy portal unless Adam asks to publish a specific video on the website.
7. After a data/photo update, run the sheet sync and publish checks before pushing.

## Standard Weekly Media Runbook

1. Confirm the Drive path: `Website Hub / Weekly Media Drops / Current Litters or Previous Litters / Mama LitterNumber + Stud / Week N / Photos`.
2. Confirm the sibling `Videos` folder exists, even when there are no public videos yet.
3. Build or review a collar map from the photo set before selecting public images.
4. Copy selected images into the matching `public/images/puppies/.../` folder with website-safe file names.
5. Update `src/data/puppies.json` first, then `src/data/litters.json` for the litter gallery/status.
6. Run `npm run validate:content`, targeted sheet dry-runs, targeted sheet syncs, `npm run review:sheets`, and `npm run publish:check`.
7. Check one litter page and one puppy page on mobile before commit/push.
8. Do not deploy production unless Adam has approved the deploy step for that session.

## Photo Import Decision Rules

1. If a puppy has no live main photo, choose the best clear face/body shot first and use it for the puppy card.
2. If the puppy already has a main photo but no weekly groups, add the first weekly group below the puppy profile so families can follow growth over time.
3. If weekly groups already exist, add the next week as a new grouped gallery instead of replacing older weeks.
4. For current litters with no photo day yet, keep the public placeholder calm: puppy profiles can be live while photos are marked as coming soon.
5. After changing puppy, litter, parent, or previous-litter data, run the matching sheet sync command shown in the TSV before publishing.

## Current Litter Media Queue

| Litter | Latest website photos | Next photo upload folder | Puppies | Website statuses |
| --- | --- | --- | --- | --- |
| Birdie + Waylon | Week 3 | https: / drive.google.com / drive / folders / 19RqcMv9OAR8okpgvRo6IaGeLaQUUK6r- / Week 4 / Photos | 7 | 6 Available, 1 Reserved |
| Daisy + Waylon | Week 2 | https: / drive.google.com / drive / folders / 1XrvHH-bgM3Gmn32ZASqQOM87LtzeUJdG / Week 3 / Photos | 6 | 6 Available |
| Whitley + Waylon | Not started | _No folder hint_ | 0 | No public puppies yet |

## Puppy Matching Checklist

Includes previous litters with live puppy profiles. Locate their week folder in Weekly Media Drops and keep all older photo weeks.

| Litter | Puppy | Collar | Status | Recommended action | Next file name |
| --- | --- | --- | --- | --- | --- |
| Beatrix + Enzo | Atticus | Blue | Reserved | Add Week 7 weekly group | `atticus-f1b-style-mini-goldendoodle-puppy-beatrix-enzo-week-7-red-ranch-dogs.jpg` |
| Beatrix + Enzo | Twain | D. Blue | Reserved | Add Week 7 weekly group | `twain-f1b-style-mini-goldendoodle-puppy-beatrix-enzo-week-7-red-ranch-dogs.jpg` |
| Beatrix + Enzo | Wells | Gray | Reserved | Add Week 7 weekly group | `wells-f1b-style-mini-goldendoodle-puppy-beatrix-enzo-week-7-red-ranch-dogs.jpg` |
| Beatrix + Enzo | Edith | Maroon | Reserved | Add Week 7 weekly group | `edith-f1b-style-mini-goldendoodle-puppy-beatrix-enzo-week-7-red-ranch-dogs.jpg` |
| Beatrix + Enzo | Darcy | Mint | Reserved | Add Week 7 weekly group | `darcy-f1b-style-mini-goldendoodle-puppy-beatrix-enzo-week-7-red-ranch-dogs.jpg` |
| Beatrix + Enzo | Dickens | Orange | Reserved | Add Week 7 weekly group | `dickens-f1b-style-mini-goldendoodle-puppy-beatrix-enzo-week-7-red-ranch-dogs.jpg` |
| Beatrix + Enzo | Austen | Pink | Reserved | Add Week 7 weekly group | `austen-f1b-style-mini-goldendoodle-puppy-beatrix-enzo-week-7-red-ranch-dogs.jpg` |
| Beatrix + Enzo | Brontë | Purple | Reserved | Add Week 7 weekly group | `bronte-f1b-style-mini-goldendoodle-puppy-beatrix-enzo-week-7-red-ranch-dogs.jpg` |
| Beatrix + Enzo | Louisa | Yellow | Reserved | Add Week 7 weekly group | `louisa-f1b-style-mini-goldendoodle-puppy-beatrix-enzo-week-7-red-ranch-dogs.jpg` |
| Lulu + Bram | Penn | Blue | Reserved | Add Week 6 weekly group | `penn-multigen-micro-goldendoodle-puppy-lulu-bram-week-6-red-ranch-dogs.jpg` |
| Lulu + Bram | Dottie | Hot Pink | Reserved | Add Week 6 weekly group | `dottie-multigen-micro-goldendoodle-puppy-lulu-bram-week-6-red-ranch-dogs.jpg` |
| Lulu + Bram | Posy | Maroon | Reserved | Add Week 6 weekly group | `posy-multigen-micro-goldendoodle-puppy-lulu-bram-week-6-red-ranch-dogs.jpg` |
| Lulu + Bram | Merryweather | White | Reserved | Add Week 6 weekly group | `merryweather-multigen-micro-goldendoodle-puppy-lulu-bram-week-6-red-ranch-dogs.jpg` |
| Evie + Waylon | Moriarty | Black | Reserved | Add Week 6 weekly group | `moriarty-petite-mini-goldendoodle-puppy-evie-waylon-week-6-red-ranch-dogs.jpg` |
| Evie + Waylon | Sherlock | Blue | Reserved | Add Week 6 weekly group | `sherlock-petite-mini-goldendoodle-puppy-evie-waylon-week-6-red-ranch-dogs.jpg` |
| Evie + Waylon | Watson | Green | Matched | Add Week 6 weekly group | `watson-petite-mini-goldendoodle-puppy-evie-waylon-week-6-red-ranch-dogs.jpg` |
| Evie + Waylon | Moran | Orange | Reserved | Add Week 6 weekly group | `evie-orange-collar-boy-petite-mini-goldendoodle-puppy-evie-waylon-week-6-red-ranch-dogs.jpg` |
| Evie + Waylon | Nancy | Pink | Reserved | Add Week 6 weekly group | `nancy-petite-mini-goldendoodle-puppy-evie-waylon-week-6-red-ranch-dogs.jpg` |
| Evie + Waylon | Agatha | Purple | Reserved | Add Week 6 weekly group | `agatha-petite-mini-goldendoodle-puppy-evie-waylon-week-6-red-ranch-dogs.jpg` |
| Evie + Waylon | Columbo | Red | Reserved | Add Week 6 weekly group | `columbo-petite-mini-goldendoodle-puppy-evie-waylon-week-6-red-ranch-dogs.jpg` |
| Birdie + Waylon | Laurie | Blue | Available | Add Week 4 weekly group | `birdie-laurie-goldendoodle-puppy-birdie-waylon-week-4-red-ranch-dogs.jpg` |
| Birdie + Waylon | Jo | Pink | Reserved | Add Week 4 weekly group | `birdie-jo-goldendoodle-puppy-birdie-waylon-week-4-red-ranch-dogs.jpg` |
| Birdie + Waylon | Fredrich | Mint | Available | Add Week 4 weekly group | `birdie-fredrich-goldendoodle-puppy-birdie-waylon-week-4-red-ranch-dogs.jpg` |
| Birdie + Waylon | Meg | Yellow | Available | Add Week 4 weekly group | `birdie-meg-goldendoodle-puppy-birdie-waylon-week-4-red-ranch-dogs.jpg` |
| Birdie + Waylon | Beth | Purple | Available | Add Week 4 weekly group | `birdie-beth-goldendoodle-puppy-birdie-waylon-week-4-red-ranch-dogs.jpg` |
| Birdie + Waylon | Amy | Red | Available | Add Week 4 weekly group | `birdie-amy-goldendoodle-puppy-birdie-waylon-week-4-red-ranch-dogs.jpg` |
| Birdie + Waylon | Marmee | White | Available | Add Week 4 weekly group | `birdie-marmee-goldendoodle-puppy-birdie-waylon-week-4-red-ranch-dogs.jpg` |
| Daisy + Waylon | Max | Blue | Available | Add Week 3 weekly group | `daisy-max-goldendoodle-puppy-daisy-waylon-week-3-red-ranch-dogs.jpg` |
| Daisy + Waylon | Cindy Lou | Pink | Available | Add Week 3 weekly group | `daisy-cindy-lou-goldendoodle-puppy-daisy-waylon-week-3-red-ranch-dogs.jpg` |
| Daisy + Waylon | Martha May | Purple | Available | Add Week 3 weekly group | `daisy-martha-may-goldendoodle-puppy-daisy-waylon-week-3-red-ranch-dogs.jpg` |
| Daisy + Waylon | Donna Lou | White | Available | Add Week 3 weekly group | `daisy-donna-lou-goldendoodle-puppy-daisy-waylon-week-3-red-ranch-dogs.jpg` |
| Daisy + Waylon | Grinch | Green | Available | Add Week 3 weekly group | `daisy-grinch-goldendoodle-puppy-daisy-waylon-week-3-red-ranch-dogs.jpg` |
| Daisy + Waylon | Betty Lou | Yellow | Available | Add Week 3 weekly group | `daisy-betty-lou-goldendoodle-puppy-daisy-waylon-week-3-red-ranch-dogs.jpg` |

## Upcoming Litter Pairing Photos

| Pairing | Drive folder | Current website images | Rule |
| --- | --- | --- | --- |
| Sylvee + Rooster | Website Hub / Weekly Media Drops / Upcoming Litters / Sylvee + Rooster | 0 | Use parent pairing images only until puppy photos are ready. |
| Maisie + Wyatt | _No folder hint_ | 0 | Use parent pairing images only until puppy photos are ready. |

## Parent Photo Cleanup

| Role | Name | Breed | Website photo | Drive folder |
| --- | --- | --- | --- | --- |
| Mama | Faye | AKC Standard Poodle | Has website photo | Website Hub / Photos / Parents / Mamas / Faye |
| Mama | Maisie | F1 Cavapoo | Has website photo | Original Dog Breeder Pro parent portrait |
| Mama | Penny | F1 Cavapoo | Has website photo | Website Hub / Photos / Parents / Mamas / Penny |
| Mama | Reece | F1 Cavapoo | Has website photo | Website Hub / Photos / Parents / Mamas / Reece |
| Mama | Winnie | F1 Cavapoo | Has website photo | Website Hub / Photos / Parents / Mamas / Winnie |
| Mama | Beatrix | F1 Goldendoodle | Has website photo | Website Hub / Photos / Parents / Mamas / Beatrix |
| Mama | Ginny | F1 Goldendoodle | Has website photo | Website Hub / Photos / Parents / Mamas / Ginny |
| Mama | Whitley | F1 Goldendoodle | Has website photo | Website Hub / Photos / Parents / Mamas / Whitley |
| Mama | Birdie | F1 Mini Goldendoodle | Has website photo | Website Hub / Photos / Parents / Mamas / Birdie |
| Mama | Daisy | F1 Mini Goldendoodle | Has website photo | Website Hub / Photos / Parents / Mamas / Daisy |
| Mama | Georgia | F1 Mini Goldendoodle | Has website photo | Website Hub / Photos / Parents / Mamas / Georgia |
| Mama | June | F1 Mini Goldendoodle | Has website photo | Website Hub / Photos / Parents / Mamas / June |
| Mama | Sylvee | F1b Bernedoodle | Has website photo | Website Hub / Photos / Parents / Mamas / Sylvee |
| Mama | Phoebe | Multigen Goldendoodle | Has website photo | Website Hub / Photos / Parents / Mamas / Phoebe |
| Mama | Honey | Multigen Micro Goldendoodle | Has website photo | Website Hub / Photos / Parents / Mamas / Honey |
| Mama | Evie Nicks | Multigen Mini Goldendoodle | Has website photo | Website Hub / Photos / Parents / Mamas / Evie Nicks |
| Mama | Lulu | Multigen Mini Goldendoodle | Has website photo | Website Hub / Website Photos / Parents / Mamas / Lulu |
| Mama | Kylie | Ultra Bernedoodle | Has website photo | Website Hub / Photos / Parents / Mamas / Kylie |
| Mama | Tilly | Ultra Bernedoodle | Has website photo | Website Hub / Photos / Parents / Mamas / Tilly |
| Stud | Bodhe | AKC Cavalier King Charles Spaniel | Has website photo | Website Hub / Photos / Parents / Studs / Bodhe |
| Stud | Robert Redford | AKC Moyen Poodle | Has website photo | Website Hub / Photos / Parents / Studs / Robert Redford |
| Stud | Johnny Cash | AKC Toy Poodle | Has website photo | Website Hub / Photos / Parents / Studs / Johnny Cash |
| Stud | Wyatt Earp | AKC Toy Poodle | Has website photo | Website Hub / Photos / Parents / Studs / Wyatt Earp |
| Stud | Beau | F1 Mini Bernedoodle | Has website photo | Website Hub / Photos / Parents / Studs / Beau |
| Stud | Hank Williams | F1 Mini Bernedoodle | Has website photo | Website Hub / Photos / Parents / Studs / Hank Williams |
| Stud | Knox | F1b Mini Goldendoodle | Has website photo | Website Hub / Photos / Parents / Studs / Knox |
| Stud | Butch Cassidy | Micro Goldendoodle | Has website photo | Website Hub / Photos / Parents / Studs / Butch Cassidy |
| Stud | Enzo | Micro Goldendoodle | Has website photo | Website Hub / Photos / Parents / Studs / Enzo |
| Stud | Sundance | Micro Goldendoodle | Has website photo | Website Hub / Photos / Parents / Studs / Sundance |
| Stud | Tex | Micro Goldendoodle | Has website photo | _No folder hint_ |
| Stud | Garth Brooks | Multigen Mini Bernedoodle | Has website photo | Website Hub / Photos / Parents / Studs / Garth Brooks |
| Stud | Waylon Jennings | Multigen Mini Goldendoodle | Has website photo | Website Hub / Photos / Parents / Studs / Waylon Jennings |

## Previous Litter Backfill

| Previous litter | Missing fields | Drive folder |
| --- | --- | --- |
| Birdie + Waylon | parentPhotos, puppyPhotos | _No folder hint_ |
| June + Waylon | parentPhotos, puppyPhotos | _No folder hint_ |
| Phoebe + Waylon | parentPhotos, puppyPhotos | _No folder hint_ |
| Beatrix + Knox | parentPhotos, puppyPhotos | _No folder hint_ |
| Honey + Waylon | parentPhotos, puppyPhotos | _No folder hint_ |
| Birdie + Leo | puppyPhotos | _No folder hint_ |
| Phoebe + Fynn | parentPhotos, puppyPhotos | _No folder hint_ |
| Phoebe + Fynn 2 | parentPhotos, puppyPhotos | _No folder hint_ |
| Tilly + Redford | parentPhotos, puppyPhotos | _No folder hint_ |
| Faye + Bodhe | parentPhotos, puppyPhotos | _No folder hint_ |
| Faye + Bodhe 2 | parentPhotos, puppyPhotos | _No folder hint_ |

## Spreadsheet-Friendly Checklist

The full task list was exported to:

```text
outputs/photo-intake-checklist.tsv
```

Use that TSV when a weekly media day has a lot of puppies and you want a copy/paste checklist beside the Drive folder.

## After Photo Import Publishing Steps

After weekly puppy photos or litter notes are added to website data, keep the Website Hub sheets aligned before pushing live:

```bash
npm run validate:content
npm run sync:puppies:dry-run
npm run sync:litters:dry-run
npm run sync:puppies
npm run sync:litters
npm run review:sheets
npm run publish:check
```

If parent photos or previous-litter archive images changed too, run the matching targeted sync before `review:sheets`:

```bash
npm run sync:parents
npm run sync:previous-litters
```
