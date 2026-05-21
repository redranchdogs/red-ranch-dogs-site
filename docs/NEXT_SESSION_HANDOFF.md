# Next Session Handoff

Last updated: 5/21/2026, 12:15:39 PM Central.

Use this file when starting a fresh Codex session to reduce RAM pressure without losing project context.

## Project

```text
/Users/adamdietlein/Documents/New project/red-ranch-dogs-site
```

Website:

- Preview/live: https://red-ranch-dogs-site.vercel.app/
- GitHub repo: https://github.com/redranchdogs/red-ranch-dogs-site
- Working branch: `codex/launch-candidate`
- Local dev command: `npm run dev -- --port 5181`
- Production deploy command: `npx vercel deploy --prod --yes`
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

## Current Website Snapshot

- True available puppies: 0
- Public puppy status snapshot: 7 Reserved, 18 Waitlist Matching
- Current litters: 4
- Upcoming/planned litters: 5
- Previous litter archive records: 12
- Public parent profiles: 29 (17 Mama, 12 Stud)

## Current Litters

- Birdie + Waylon: May 23-25, 2026; 7 Reserved
- Whitley + Waylon: June 24-26, 2026; 6 Waitlist Matching
- Penny + Wyatt: June 14-16, 2026; 6 Waitlist Matching
- Ginny + Butch Cassidy: June 14-16, 2026; 6 Waitlist Matching

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

- Birdie + Waylon: go-home window begins May 23, 2026. Confirm pickup/payment/status copy is current.
- Faye + Sundance: expected timing "Expected delivery May 2026" may be stale. Confirm whether it is now current, born, hidden, or still planned.
- Georgia + Waylon: expected timing "Expected delivery May 2026" may be stale. Confirm whether it is now current, born, hidden, or still planned.

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
