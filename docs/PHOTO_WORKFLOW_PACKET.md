# Photo Workflow Packet

Generated: 5/19/2026, 8:02:57 PM Central

This is the working packet for weekly puppy photos, parent photo cleanup, and previous-litter photo backfill. It is intentionally internal: it describes Google Drive paths and photo matching rules so the public website can stay clean.

## Photo Day Rules

1. Upload each litter's weekly photo dump into the litter folder, using a simple week folder such as `Week 6`.
2. Do not create individual puppy folders unless the photo set is confusing. A full dump is fine when every puppy has a clear collar-color identifier.
3. Make the first usable shot for each puppy a clear collar-identification shot. The matching key is puppy name plus collar color.
4. Keep public file names website-friendly: lowercase, hyphenated, puppy name, breed, litter, week, and `red-ranch-dogs`.
5. Public pages should never show internal upload notes such as Drive folders, photo drops, or import reminders.
6. After a data/photo update, run `npm run ops:full` and check `docs/PRELAUNCH_SIGNOFF.md`.

## Photo Import Decision Rules

1. If a puppy has no live main photo, choose the best clear face/body shot first and use it for the puppy card.
2. If the puppy already has a main photo but no weekly groups, add the first weekly group below the puppy profile so families can follow growth over time.
3. If weekly groups already exist, add the next week as a new grouped gallery instead of replacing older weeks.
4. For current litters with no photo day yet, keep the public placeholder calm: puppy profiles can be live while photos are marked as coming soon.
5. After changing puppy, litter, parent, or previous-litter data, run the matching sheet sync command shown in the TSV before publishing.

## Current Litter Photo Queue

| Litter | Latest website photos | Next upload folder | Puppies | Website statuses |
| --- | --- | --- | --- | --- |
| Birdie + Waylon | Week 5 | Website Hub / Weekly Photo Drops / Birdie 3 + Waylon / Week 6 | 7 | 7 Reserved |
| Whitley + Waylon | Newborn Photos | Website Hub / Weekly Photo Drops / Whitley 1 + Waylon / Week 1 | 6 | 6 Waitlist Matching |
| Penny + Wyatt | Newborn Photos | Website Hub / Weekly Photo Drops / Penny 1 + Wyatt / Week 1 | 6 | 6 Waitlist Matching |
| Ginny + Butch Cassidy | Newborn Photos | Website Hub / Weekly Photo Drops / Ginny 1 + Butch Cassidy / Week 1 | 6 | 6 Waitlist Matching |

## Puppy Matching Checklist

| Litter | Puppy | Collar | Status | Recommended action | Next file name |
| --- | --- | --- | --- | --- | --- |
| Birdie + Waylon | Ranger | Brown | Reserved | Add Week 6 weekly group | `ranger-mini-goldendoodle-puppy-birdie-waylon-week-6-red-ranch-dogs.jpg` |
| Birdie + Waylon | Axel | Orange | Reserved | Add Week 6 weekly group | `axel-mini-goldendoodle-puppy-birdie-waylon-week-6-red-ranch-dogs.jpg` |
| Birdie + Waylon | Diesel | Blue | Reserved | Add Week 6 weekly group | `diesel-mini-goldendoodle-puppy-birdie-waylon-week-6-red-ranch-dogs.jpg` |
| Birdie + Waylon | Dakota | Red | Reserved | Add Week 6 weekly group | `dakota-mini-goldendoodle-puppy-birdie-waylon-week-6-red-ranch-dogs.jpg` |
| Birdie + Waylon | Sedona | Yellow | Reserved | Add Week 6 weekly group | `sedona-mini-goldendoodle-puppy-birdie-waylon-week-6-red-ranch-dogs.jpg` |
| Birdie + Waylon | Arizona | Pink | Reserved | Add Week 6 weekly group | `arizona-mini-goldendoodle-puppy-birdie-waylon-week-6-red-ranch-dogs.jpg` |
| Birdie + Waylon | Indie | Purple | Reserved | Add Week 6 weekly group | `indie-mini-goldendoodle-puppy-birdie-waylon-week-6-red-ranch-dogs.jpg` |
| Whitley + Waylon | Hook | Blue | Waitlist Matching | Select main photo and first weekly group | `hook-multigen-mini-goldendoodle-puppy-whitley-waylon-week-1-red-ranch-dogs.jpg` |
| Whitley + Waylon | Minnow | Pink | Waitlist Matching | Select main photo and first weekly group | `minnow-multigen-mini-goldendoodle-puppy-whitley-waylon-week-1-red-ranch-dogs.jpg` |
| Whitley + Waylon | Tackle | Orange | Waitlist Matching | Select main photo and first weekly group | `tackle-multigen-mini-goldendoodle-puppy-whitley-waylon-week-1-red-ranch-dogs.jpg` |
| Whitley + Waylon | Bass | Grey | Waitlist Matching | Select main photo and first weekly group | `bass-multigen-mini-goldendoodle-puppy-whitley-waylon-week-1-red-ranch-dogs.jpg` |
| Whitley + Waylon | Bobber | Maroon | Waitlist Matching | Select main photo and first weekly group | `bobber-multigen-mini-goldendoodle-puppy-whitley-waylon-week-1-red-ranch-dogs.jpg` |
| Whitley + Waylon | Skipper | Black | Waitlist Matching | Select main photo and first weekly group | `skipper-multigen-mini-goldendoodle-puppy-whitley-waylon-week-1-red-ranch-dogs.jpg` |
| Penny + Wyatt | Striker | Orange | Waitlist Matching | Add Week 1 weekly group | `striker-f1b-micro-cavapoo-puppy-penny-wyatt-week-1-red-ranch-dogs.jpg` |
| Penny + Wyatt | Samba | Dark Blue | Waitlist Matching | Add Week 1 weekly group | `samba-f1b-micro-cavapoo-puppy-penny-wyatt-week-1-red-ranch-dogs.jpg` |
| Penny + Wyatt | Goalie | Dark Gray | Waitlist Matching | Add Week 1 weekly group | `goalie-f1b-micro-cavapoo-puppy-penny-wyatt-week-1-red-ranch-dogs.jpg` |
| Penny + Wyatt | Ref | Black | Waitlist Matching | Add Week 1 weekly group | `ref-f1b-micro-cavapoo-puppy-penny-wyatt-week-1-red-ranch-dogs.jpg` |
| Penny + Wyatt | Pitch | Red | Waitlist Matching | Add Week 1 weekly group | `pitch-f1b-micro-cavapoo-puppy-penny-wyatt-week-1-red-ranch-dogs.jpg` |
| Penny + Wyatt | FIFA | Light Gray | Waitlist Matching | Add Week 1 weekly group | `fifa-f1b-micro-cavapoo-puppy-penny-wyatt-week-1-red-ranch-dogs.jpg` |
| Ginny + Butch Cassidy | Meadow | Red | Waitlist Matching | Add Week 1 weekly group | `meadow-multigen-mini-goldendoodle-puppy-ginny-butch-cassidy-week-1-red-ranch-dogs.jpg` |
| Ginny + Butch Cassidy | Vista | Maroon | Waitlist Matching | Add Week 1 weekly group | `vista-multigen-mini-goldendoodle-puppy-ginny-butch-cassidy-week-1-red-ranch-dogs.jpg` |
| Ginny + Butch Cassidy | Camper | Gray | Waitlist Matching | Add Week 1 weekly group | `camper-multigen-mini-goldendoodle-puppy-ginny-butch-cassidy-week-1-red-ranch-dogs.jpg` |
| Ginny + Butch Cassidy | Sage | Pink | Waitlist Matching | Add Week 1 weekly group | `sage-multigen-mini-goldendoodle-puppy-ginny-butch-cassidy-week-1-red-ranch-dogs.jpg` |
| Ginny + Butch Cassidy | Ridge | Orange | Waitlist Matching | Add Week 1 weekly group | `ridge-multigen-mini-goldendoodle-puppy-ginny-butch-cassidy-week-1-red-ranch-dogs.jpg` |
| Ginny + Butch Cassidy | Trek | Black | Waitlist Matching | Add Week 1 weekly group | `trek-multigen-mini-goldendoodle-puppy-ginny-butch-cassidy-week-1-red-ranch-dogs.jpg` |

## Upcoming Litter Pairing Photos

| Pairing | Drive folder | Current website images | Rule |
| --- | --- | --- | --- |
| Faye + Sundance | Website Hub / Photos / Litters / Faye + Sundance | 2 | Use parent pairing images only until puppy photos are ready. |
| Georgia + Waylon | Website Hub / Photos / Litters / Georgia + Waylon | 2 | Use parent pairing images only until puppy photos are ready. |
| Winnie + Wyatt | Website Hub / Photos / Litters / Winnie + Wyatt | 2 | Use parent pairing images only until puppy photos are ready. |
| Reece + Wyatt | Website Hub / Photos / Litters / Reece + Wyatt | 2 | Use parent pairing images only until puppy photos are ready. |
| Kylie + Ranger | Website Hub / Photos / Litters / Kylie + Ranger | 2 | Use parent pairing images only until puppy photos are ready. |

## Parent Photo Cleanup

| Role | Name | Breed | Website photo | Drive folder |
| --- | --- | --- | --- | --- |
| Mama | Faye | AKC Standard Poodle | Has website photo | Website Hub / Photos / Parents / Mamas / Faye |
| Mama | Trudy | AKC Toy Poodle | Has website photo | Website Hub / Photos / Parents / Mamas / Trudy |
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

Use that TSV when a weekly photo day has a lot of puppies and you want a copy/paste checklist beside the Drive folder.

## After Photo Import Publishing Steps

After weekly puppy photos or litter notes are added to website data, keep the Website Hub sheets aligned before pushing live:

```bash
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
