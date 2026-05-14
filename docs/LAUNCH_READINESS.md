# Red Ranch Dogs Launch Readiness

This checklist keeps the website workflow operational without relying on memory from chat.

## Before Custom Domain Launch

Run these checks from the project folder:

```bash
npm run launch:check
npm run lint
npm run build
```

`npm run launch:check` verifies buyer routes, form routing metadata, bridge
configuration, image references, public puppy, litter, and parent detail routes
in the sitemap, and the buyer-flow guardrails below.

## Latest QA Snapshot

Last checked: May 13, 2026.

Automated checks passed:

- `npm run launch:check`
- `npm run check:buyer-flow`
- `npm run check:source`
- `npm run validate:content`
- `npm run review:launch`
- `npm run test:forms`
- `npm run test:bridge`
- `npm run lint`
- `npm run build`
- `npm audit --omit=dev`

Browser QA passed on mobile, tablet, and desktop widths for:

- Home
- Current Litters
- Honey + Bram litter detail
- Birdie + Waylon litter detail
- Available Puppies
- Upcoming Litters
- Previous Litters
- Apply
- How It Works
- Pricing
- FAQ
- Mamas
- Studs
- Contact

The browser pass found no horizontal overflow, broken image loads, console
errors, missing page headings, or public internal workflow notes.

Current public data state:

- Available puppies: 0
- Current litter order: Honey + Bram, Birdie + Waylon, Penny + Wyatt, Ginny + Butch Cassidy
- Upcoming/planned litters: 6
- Public parent profiles: 29
- Puppy application, contact, guardian, newsletter, stud, and waitlist lead forms are present.
- Apps Script bridge authenticated read is working.
- Previous litter source data no longer carries old price facts.

Remaining launch decision:

- Adam needs to do one human content scan and approve the DNS/custom-domain
  switch. Do not change DNS or retire Squarespace routing before that approval.

## Buyer-Flow Guardrails

Run this focused check whenever availability, current litters, forms, SEO, or
navigation changes:

```bash
npm run check:buyer-flow
```

It confirms:

- Available Puppies only shows true `Available` puppies and has the empty state ready when there are no puppies open for a new family.
- Current Litters sorts by earliest go-home date, so Honey + Bram appears before Birdie + Waylon.
- Penny + Wyatt puppies are treated as waitlist matching, not reserved.
- Removed puppy routes like Messi and Ronaldo stay out of the public sitemap.
- Shared navigation and footer routes point to the current architecture.
- Puppy application, contact, guardian, newsletter, stud, and waitlist forms all keep lead-routing metadata.
- SEO authority markers for Red Ranch Dogs, Salado, Google reviews, team/person schema, FAQ schema, and ItemList schema are still present.
- Sheet sync, dry-run sync, bridge test, and form test scripts are still available.

Confirm these manually:

- Home, Available Puppies, Current Litters, Upcoming Litters, Apply, Contact, and Guardian Application open on mobile.
- Forms submit successfully and arrive in the Google Sheet.
- Test form rows are removed or clearly marked as tests.
- Current puppy availability matches the Puppy Tracker.
- Current and upcoming litters match the Litters Sheet.
- Parent dog profiles match the Parent Dogs Sheet.
- The real domain is not switched until Adam approves the DNS launch step.

## Weekly Puppy Photo Workflow

Use this pattern in Google Drive:

```text
Website Hub/
  Website Photos/
    Litters/
      Mama Number + Stud/
        Week 6/
```

Examples:

```text
Birdie 3 + Waylon/
  Week 4/

Honey 2 + Bram/
  Week 6/
```

For a full photo dump, include one clear collar-identification photo or make sure each image filename includes the puppy name or collar color.

Recommended filename pattern:

```text
puppy-name-week-6-red-ranch-dogs.jpg
```

If the name is not final yet:

```text
green-collar-week-6-red-ranch-dogs.jpg
```

## Sheet Sync Workflow

The site data remains the source that renders the website, and the Google Sheets are the working business trackers.

Use dry-run first:

```bash
npm run sync:sheets:dry-run
```

Confirm the bridge is accepting authenticated read requests:

```bash
npm run test:bridge
```

Then sync only when the generated rows look right:

```bash
npm run sync:sheets
```

The local `.env.local` file needs these values for sync to write to Google Sheets:

```text
RED_RANCH_BRIDGE_URL=
RED_RANCH_BRIDGE_SECRET=
```

Do not commit `.env.local`.

If `npm run test:bridge` says the bridge is reachable but the authenticated
read is unauthorized, the website is configured locally but the deployed Apps
Script does not have the matching `BRIDGE_SECRET` script property. Update the
script property in the Apps Script project, deploy a new version, and rerun
`npm run test:bridge` before syncing.

## Form Workflow

Local smoke test without sending external rows:

```bash
npm run test:forms
```

Live webhook test, which writes test rows:

```bash
npm run test:forms:webhook -- --all
```

After live tests, remove or mark the test rows in the destination sheet.

## Human Content Approval Pass

Before switching the custom domain, Adam should review these pages on a phone
and desktop and confirm the visible business facts are right:

- Home: hero, doodle section, process summary, reviews, and final CTA.
- Available Puppies: this should only show puppies truly open to a new family.
- Current Litters: order, status wording, go-home dates, and puppy statuses.
- Upcoming Litters: planned pairings, breed, timing, size range, and CTA wording.
- Previous Litters: previous pairings should show parent dogs and puppies, not
  old pricing or internal archive notes.
- Apply: application questions, deposit language, and form destination.
- Pricing: puppy prices, deposit amount, payment timing, and transportation note.
- FAQ: waitlist, pickup, coat, health, and payment answers.
- Contact: phone, email, location, and form wording.

If those pages are approved, the site is ready for the custom-domain launch
decision.

## Launch Hold

Do not change the custom domain, DNS, or production Squarespace routing until Adam explicitly approves the launch step.
