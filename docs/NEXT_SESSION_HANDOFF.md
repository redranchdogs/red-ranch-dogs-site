# Next Session Handoff

Last updated: September 16, 2026, 8:34 PM Central.

Use this file when starting a fresh Codex session to reduce RAM pressure without losing project context.


## September 16, 2026 Shared Litter Detail Template Release

- Shared template: planned, current, and previous litter detail routes now use the approved compact mobile hierarchy rather than a Beatrix-only page.
- Beatrix + Enzo reference: F1B-style Mini Goldendoodles, one Pregnancy confirmed badge, $2,800, 25-35 lbs, estimated September 29 birth, and estimated November 23-24 go-home.
- Photos and content: original full-body parent photos use `object-fit: contain`; Beatrix and Enzo names link to their profiles as Mama and Sire; About This Litter retains all detailed copy, genetics, highlights, and prior-litter evidence.
- Behavior: parent links stay in the same tab, Browser Back restores the litter scroll position, and existing puppy cards, galleries, videos, go-home sections, waitlist, and contact actions remain intact.
- Lifecycle verification: Georgia + Waylon shows Previous litter with five puppy cards and recorded date labels. Winnie + Wyatt shows Previous litter on its stable URL.
- Ridge crop follow-up: Find Your Puppy now uses `50% 30%`, leaving a small strip above Ridge's head while keeping the face above center.
- Release: data commit `12b2c25`, template commit `b6cfbab`, scroll hardening commit `253804e`; launch-candidate Website Health run `35170718093` and main run `35170854384` passed.
- Production verification: 390px and 1440px checks passed with zero overflow and no console errors. Browser Back restored 169px to 169px.
- Boundary: no Sheet, CRM, Breeding Ops, form, applicant, or communication record changed. The read-only Winnie Sheet mismatch remains intentional and unresolved.
- Detailed evidence: `docs/LITTER_DETAIL_TEMPLATE_RELEASE_2026-09-16.md` and root `design-qa.md`.


## September 16, 2026 No Current Litters Release

- Public state: no current litters are listed. Winnie + Wyatt moved from `Current Litter` to `Previous Litter` in website-owned public data; the record and stable `/litters/winnie-wyatt-spring-2026` URL remain intact.
- Current Litters: all breed views show the truthful global empty state and link to the first verified upcoming pairing, Kylie + Ranger.
- Find Your Puppy: the Current Litters preview says no current litters are posted and no longer presents Winnie as current.
- Puppy crop follow-up: the Ridge preview focal point was `50% 25%` in this release and was subsequently adjusted to `50% 30%` in the shared litter-detail release.
- Production verification: 390px and 1440px checks passed with zero horizontal overflow. Current Litters contains no Winnie card; the Upcoming link resolves to the Kylie + Ranger card; Winnie’s retained detail page shows `Previous Litter`; `llms-full.txt` says no current litters.
- Release: code/content commit `b6a1ddd9f24d4a940aa2f06e7e82fbec2f2d56a3`; launch-candidate Website Health run `35110116264` and main run `35110319913` passed.
- Boundary: the live Website Hub Litters sheet still says `Current Litter` for Winnie. The read-only sheet audit records this one intentional mismatch; no Sheet, CRM, Breeding Ops, form, or applicant workflow was changed.
- Detailed evidence: `docs/NO_CURRENT_LITTERS_RELEASE_2026-09-16.md`.


## September 15, 2026 Find Your Puppy Release

- Approved direction: combine the selected Find Your Puppy hub with the existing compact breed browser and keep the visual change restrained.
- Scope: Available Puppies presentation, the shared Available/Current/Upcoming route selector, the related hamburger entries, tests, and review documents.
- Public availability at implementation time: zero puppies qualified as Available. No availability was inferred from current-litter counts.
- Empty state: approved Ridge photo as an unlabeled Current Litters illustration, verified Beatrix + Enzo parent photos with a small below-image pairing caption, and real links to Current Litters, Upcoming Litters, and the waitlist process.
- Routing: all three existing URLs, page titles, canonicals, query-backed breed state, reload behavior, and browser history remain intact.
- Current and Upcoming: existing breed tabs, layouts, factual records, and parent-photo focal fixes remain in use.
- Mobile menu: one Find Your Puppy entry replaces the three redundant timing links; unrelated Puppy links remain present.
- QA: 320, 390, and 1440 pixel visual review passed; empty and development-only populated states passed; focused lint, build, route, metadata, reduced-motion, image, overflow, keyboard, and menu checks passed.
- Safety: no business data writes, Sheet sync, CRM write, message, or live form submission occurred.
- Detailed evidence: `docs/FIND_YOUR_PUPPY_RELEASE_2026-09-15.md` and root `design-qa.md`.
- Release state: deployed and verified through caption correction commit `99bcad5dadf67919ca024a7ff6491831a52d7359`; launch-candidate Website Health run `35032503681` and main run `35032634252` passed.
- Focal-point follow-up: Ridge moved to `50% 30%` in commit `907bbca`, briefly used `50% 25%` in the no-current-litters release, and returned to `50% 30%` after Adam requested slightly more room above the head.


## September 15, 2026 Litter Browser Release

- Approved direction: compact Current/Upcoming switch plus three always-visible breed tabs in the order Cavapoos, Goldendoodles, Bernedoodles.
- Scope: `/puppies/current-litters` and `/puppies/upcoming-litters` presentation only, plus directly necessary tests and review documents.
- Behavior: `?breed=` deep links, breed preservation across Current/Upcoming, browser Back restoration, keyboard tab behavior, vertical multi-litter lists, and truthful breed-specific empty states.
- Assets and facts: existing Red Ranch parent photos and public litter records only.
- QA: `npm run publish:check` passed; 320, 390, and 1440 pixel visual checks passed; no live form submissions or business data writes occurred.
- Detailed evidence: `docs/LITTER_BROWSER_RELEASE_2026-09-15.md` and root `design-qa.md`.
- Release state: deployed to production and verified at commit `f1506f5e4259fa1f01c43e1bb8c1b4d580e15f2c`; GitHub Website Health run `35023576787` passed.
- Follow-up: parent-photo face centering was corrected for all eight Current/Upcoming card images using asset-specific focal points and a taller mobile portrait crop; deployed in code commit `0873b2d`, production verified at 390 and 1440 pixels, and GitHub Website Health run `35024554809` passed.

## Project

```text
/Users/adamdietlein/Documents/New project/red-ranch-dogs-site
```

Website:

- Preview/live: https://red-ranch-dogs-site.vercel.app/
- GitHub repo: https://github.com/redranchdogs/red-ranch-dogs-site
- Working branch: `codex/launch-candidate`
- Local dev command: `npm run dev -- --port 5181`
- Production deploy rule: merge `codex/launch-candidate` into `main` and push only after Adam explicitly approves deploy. Never use `vercel deploy --prod`.
- Latest operations status: **PASS**
- Apps Script bridge version: 3.2.0
- Expected bridge version for compact lead sheets and notification emails: 3.2.0

## Start-of-Session Routine

Run these first in a fresh Codex session:

```bash
cd "/Users/adamdietlein/Documents/New project/red-ranch-dogs-site"
git status --short
git branch --show-current
git pull
npm run ops:status
```

If the user has made iPhone/cloud Codex changes, `git pull` is mandatory before local coding. GitHub is the shared source of truth; the MacBook local checkout does not update automatically.

## New Thread Starter Prompt

Adam can paste this into a new Codex thread:

> Continue the Red Ranch Dogs website work. Repo path: `/Users/adamdietlein/Documents/New project/red-ranch-dogs-site`. Branch: `codex/launch-candidate`. First read `docs/NEXT_SESSION_HANDOFF.md`, then run `git status --short`, `git branch --show-current`, `git pull`, and `npm run ops:status`. Use GitHub as source of truth, Vercel as the live website, and keep changes template-based rather than one-off. Do not switch DNS or retire Squarespace unless Adam explicitly asks.
> Production deploys happen only by merging `codex/launch-candidate` into `main` and pushing after explicit approval. Never deploy with `vercel deploy --prod`.

## Current Website Snapshot

- True available puppies: 12 (Goalie, Ridge, Minnow, Tackle, Skipper, Marine, Major, Trooper, Pilot, Victory, Valor, Jubilee)
- Public puppy status snapshot: 12 Available, 24 Reserved
- Current litters: 5
- Upcoming/planned litters: 3
- Previous litter archive records: 13
- Public parent profiles: 29 (17 Mama, 12 Stud)

## Current Litters

- Whitley + Waylon: June 24-26, 2026; 3 Available, 3 Reserved
- Faye + Sundance: July 14-16, 2026; 5 Available, 1 Reserved
- Georgia + Waylon: July 14-16, 2026; 2 Available, 3 Reserved
- Penny + Wyatt: June 14-16, 2026; 1 Available, 5 Reserved
- Ginny + Butch Cassidy: June 14-16, 2026; 1 Available, 5 Reserved

## Automation Commands

```bash
npm run ops:full
npm run ops:status
npm run ops:workflow
npm run drive:folders
npm run leads:rebuild-queue
```

Use `npm run ops:full` for the heavier pass: it rebuilds the lead queue, refreshes weekly workflow docs, runs the bridge check, refreshes review docs, validates routes/content/buyer flow, lints, and builds.

## Google Sheets / Bridge Workflow

- Website data is primarily stored in `src/data/*.json` and synced outward to Google Sheets when needed.
- The Apps Script bridge is configured by env variable names `RED_RANCH_BRIDGE_URL` and `RED_RANCH_BRIDGE_SECRET`; never commit the secret value.
- Bridge v3.2.0 is the template that supports compact Website Submissions formatting and bridge-managed notification emails to `adam@redranchdogs.com`.
- Website form submissions write to the Website Submissions workbook. `Website Leads` is the raw intake tab; `Lead Queue` is Adam's daily working tab; `Reply Templates` and `Workflow Notes` support follow-up.
- Content sheets to keep aligned: Puppy Tracker, Litters, Parent Dogs, Public Waitlist, Previous Litters, and Website Submissions.
- Use dry-run commands before sheet writes when the business change is non-trivial:
  - `npm run sync:puppies:dry-run`
  - `npm run sync:litters:dry-run`
  - `npm run sync:parents:dry-run`
  - `npm run sync:waitlist:dry-run`
  - `npm run sync:previous-litters:dry-run`

## Photo / Drive Workflow

- Website Hub is the organizing concept in Google Drive.
- Use clean folders for reusable assets: Website Photos / Parents / Mamas, Website Photos / Parents / Studs, Website Photos / Litters, and weekly puppy media drops.
- Current litter puppy media folders generally follow `Weekly Media Drops / Current Litters / Mama number + Stud / Week N / Photos` and `Videos`.
- Previous litter media folders generally live under `Weekly Media Drops / Previous Litters`.
- Public pages should not show internal housekeeping notes like "photos loaded from Drive drop."
- Previous litters should show the pairing and puppy photos, not old pricing.

## Cloud / iPhone Codex Workflow

- iPhone/cloud Codex works from GitHub, not from the MacBook's local files.
- A cloud change should commit/push or open a PR; Vercel then deploys the pushed code.
- When returning to the MacBook after a cloud change, run `git pull` before editing.
- Small on-the-go updates are good candidates for cloud Codex: status changes, simple copy edits, pricing/size corrections, replacing one image, or adding a clear litter note.
- Larger design/template work is safer from the MacBook so desktop and mobile can be visually checked.

## Design Rules To Preserve

- Keep the public site warm, trustworthy, premium, compact, and family-oriented.
- Prefer reusable templates over one-off page fixes.
- Mobile is often the priority, but desktop must not have clipped text, hidden dropdowns, unreadable overlays, or awkward oversized sections.
- Puppy, parent, litter, previous-litter, and team cards should show clear photos with readable text on clean panels.
- Do not expose private data: emails, phone numbers, deposit dates, full waitlist details, internal notes, bridge secrets, or worksheet-only process notes.

## Do Not Do Without Adam's Approval

- Do not switch DNS or custom domain routing.
- Do not retire Squarespace routing.
- Do not delete public images just because they are unused candidates.
- Do not create Drive folders with `npm run drive:folders:write` unless the Website Hub folder path has been confirmed.
- Do not deploy/go live unless Adam explicitly asks for it.

## Human Review Priorities

- Whitley + Waylon: go-home window begins June 24, 2026. Confirm pickup/payment/status copy is current.
- Penny + Wyatt: go-home window begins June 14, 2026, which is already past. Confirm this should still be a Current Litter.
- Ginny + Butch Cassidy: go-home window begins June 14, 2026, which is already past. Confirm this should still be a Current Litter.

## Previous Litter Archive Backfill

- Birdie + Waylon: previous litter needs separate parent photos.
- Birdie + Waylon: previous litter needs puppy gallery photos.
- June + Waylon: previous litter needs separate parent photos.
- June + Waylon: previous litter needs puppy gallery photos.
- Phoebe + Waylon: previous litter needs separate parent photos.
- Phoebe + Waylon: previous litter needs puppy gallery photos.
- Beatrix + Knox: previous litter needs separate parent photos.
- Beatrix + Knox: previous litter needs puppy gallery photos.

## Image Review

- None found.

## RAM-Friendly Workflow

- Keep one browser window focused on the page being reviewed.
- Close extra Google Sheets, Drive, Squarespace, and Vercel tabs when not actively using them.
- Run the local dev server only while checking local changes.
- Prefer `npm run ops:status` before opening many browser pages.
- Start a fresh Codex thread after major checkpoints and point it to this file.
