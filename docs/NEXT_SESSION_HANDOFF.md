# Next Session Handoff

Last updated: 5/13/2026, 10:31:59 PM Central.

Use this file when starting a fresh Codex session to reduce RAM pressure without losing project context.

## Project

```text
/Users/adamdietlein/Documents/New project/red-ranch-dogs-site
```

Website:

- Preview/live: https://red-ranch-dogs-site.vercel.app/
- Local dev command: `npm run dev -- --port 5181`
- Latest operations status: **PASS**
- Apps Script bridge version: 3.0.0

## Current Website Snapshot

- True available puppies: 0
- Public puppy status snapshot: 7 Reserved, 12 Waitlist Matching
- Current litters: 3
- Upcoming/planned litters: 5
- Previous litter archive records: 12
- Public parent profiles: 29 (17 Mama, 12 Stud)

## Current Litters

- Birdie + Waylon: May 23-25, 2026; 7 Reserved
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

## Do Not Do Without Adam's Approval

- Do not switch DNS or custom domain routing.
- Do not retire Squarespace routing.
- Do not delete public images just because they are unused candidates.
- Do not create Drive folders with `npm run drive:folders:write` unless the Website Hub folder path has been confirmed.
- Do not deploy/go live unless Adam explicitly asks for it.

## Human Review Priorities

- Birdie + Waylon: go-home window begins May 23, 2026. Confirm pickup/payment/status copy is current.

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
