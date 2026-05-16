# Prelaunch Signoff
Generated: 5/16/2026, 11:00:15 AM Central
Status: **READY FOR ADAM REVIEW**
**This is not permission to launch. DNS/domain launch still requires Adam's explicit approval.**
## Automated Checks
| Area | Status | Report |
| --- | --- | --- |
| Operations and bridge | PASS | `docs/OPERATIONS_STATUS.md` |
| Visual QA | PASS | `docs/VISUAL_QA_REPORT.md` |
| SEO metadata | PASS | `docs/SEO_METADATA_REPORT.md` |
| Deploy package | PASS | `docs/DEPLOY_PACKAGE_REVIEW.md` |
| Sheet sync | PASS | `docs/SHEET_SYNC_REVIEW.md` |
| Public safety | PASS | `docs/PUBLIC_SAFETY_REVIEW.md` |
| Launch decision | READY FOR HUMAN SPOT-CHECK | `docs/LAUNCH_DECISION.md` |
## Current Numbers
- Visual viewport checks: 50
- SEO sitemap routes checked: 111
- Referenced deploy images checked: 147
- Missing image count: 0
- Business review-now items: 1
- Previous-litter archive backfill items: 22
- Photo workflow packet: generated
- Lead workflow packet: generated
## Adam Review
- Birdie + Waylon: go-home window begins May 23, 2026. Confirm pickup/payment/status copy is current.
- Confirm current availability: Available Puppies should show zero true available puppies unless a puppy is intentionally reopened.
- Confirm current litters: no delivered/go-home litters should stay in Current Litters.
- Confirm upcoming litters: pairings and timing should match what Red Ranch Dogs wants public today.
- Submit one real-world test for Apply, Contact, Stud Inquiry, and Guardian Application before launch.
- Run `npm run leads:uat:write` once, practice the fake client queue, then mark UAT rows `Test/delete` before launch.
- Open `docs/LEAD_WORKFLOW_PACKET.md` and confirm the Website Submissions process still matches how Adam wants to work leads before the CRM exists.
- Before a weekly photo update, open `docs/PHOTO_WORKFLOW_PACKET.md` and use `outputs/photo-intake-checklist.tsv` beside the Drive folder.
## Acceptable After-Launch Backfill
- Birdie + Waylon: previous litter needs separate parent photos.
- Birdie + Waylon: previous litter needs puppy gallery photos.
- June + Waylon: previous litter needs separate parent photos.
- June + Waylon: previous litter needs puppy gallery photos.
- Phoebe + Waylon: previous litter needs separate parent photos.
- Phoebe + Waylon: previous litter needs puppy gallery photos.
- Beatrix + Knox: previous litter needs separate parent photos.
- Beatrix + Knox: previous litter needs puppy gallery photos.
- Honey + Waylon: previous litter needs separate parent photos.
- Honey + Waylon: previous litter needs puppy gallery photos.
- ...and 12 more previous-litter archive items.
- Parent photo quality can continue improving as final photos are added to the Website Hub.
- CRM automation is still a later project; current launch is sheet-backed.
## One Command
```bash
npm run ops:full
```