# Sheet Sync Review
Generated: 10/7/2026, 11:57:47 AM Central
Status: **FAIL**
This is a read-only comparison between website-generated sheet exports and the live Website Hub sheets. It does not write to Google Sheets.
## Sheet Summary
| Sheet | Website rows | Live rows | Missing columns | Missing rows | Extra rows | Cell mismatches |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Puppy Tracker | 47 | 47 | 0 | 0 | 0 | 0 |
| Litters | 12 | 12 | 0 | 0 | 0 | 1 |
| Previous Litters | 21 | 21 | 0 | 0 | 0 | 0 |
| Parent Dogs | 33 | 33 | 0 | 0 | 0 | 0 |
## Items To Fix
- Litters: kylie-ranger-late-summer-2026 column "theme" is out of sync. Website="" Sheet="Moonlit Manor".
## Recommended Fix
Run `npm run sync:sheets` after confirming the website data is the source of truth, then rerun `npm run review:sheets`.