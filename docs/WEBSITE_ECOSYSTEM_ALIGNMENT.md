# Website Ecosystem Alignment

Generated: May 19, 2026, 2:15 PM CDT

Purpose: keep the live Red Ranch Dogs website aligned with the CRM, breeding ops, Google Sheets, Vercel Analytics, and future puppy/guardian portals without turning the public site into the system of record for every internal workflow.

## Current Decision

The live website is the public front door. It should stay stable, fast, searchable, and form-friendly.

The CRM should own lead follow-up, family/contact records, application review, waitlist status, deposits, communication, and matching decisions.

Breeding Ops should own heat cycles, breeding records, pregnancies, litters, puppies, weights, microchips, barn tasks, and internal puppy-care workflows.

The future puppy portal and guardian hub should read from the same operational records after CRM/Breeding Ops are ready. They should not force public website form rewrites during the first build.

## Step 1: Analytics Baseline

Vercel Web Analytics is enabled for `red-ranch-dogs-site`.

Important baseline notes:

- Analytics started collecting after enablement on May 19, 2026. It does not backfill May 18 or earlier traffic.
- The first visible data included a Codex proof visit, so the first day should be treated as a setup day, not a marketing-performance day.
- Device breakdown is available in the Vercel Analytics `Devices` panel.
- Page views and top pages should be reviewed after a full day of organic traffic.
- Vercel Hobby analytics does not expose custom event reporting. The website can safely call `track(...)`, but form submissions in `Website Leads`, `Lead Queue`, and the CRM should be treated as the true conversion source for now.

Daily review once traffic has accumulated:

1. Visitors.
2. Page views.
3. Mobile / desktop / tablet device split.
4. Top pages.
5. Referrers and UTM sources.
6. Form submissions by lead type from `Lead Queue`.
7. Conversion notes: pages with traffic but no applications, contact forms, puppy alerts, or text/email clicks.

## Step 2: Website To CRM Intake Contract

The first CRM integration should treat website submissions as immutable intake events.

Stable join key:

- `Submission ID`

Raw intake source:

- Google Sheet: `Website Submissions`
- Raw tab: `Website Leads`

Working lead state:

- Google Sheet: `Website Submissions`
- Working tab: `Lead Queue`

CRM import rule:

- Import `Website Leads` as the raw event.
- Import `Lead Queue` as the working status.
- Join them by `Submission ID`.
- Keep blank `Status` as `New` or `Unworked`; do not drop blank-status rows.
- Keep `Test/delete` rows visible in a test/archive view until Adam intentionally purges them.

Do not have the CRM change website form fields, website routes, sheet headers, Apps Script bridge behavior, Vercel env vars, DNS, or GoDaddy records during CRM V1.

## Step 3: Current Litter And Weekly Photo Workflow

When a litter moves from upcoming to current, the repeatable workflow is:

1. Confirm the birth date, mama, stud, breed, expected adult size, go-home window, puppy count, puppy names, collar colors, and genders from the source sheet or Breeding Ops.
2. Update website structured data files, especially `src/data/litters.json` and `src/data/puppies.json`.
3. Create or confirm the Drive folder under `Website Hub / Weekly Photo Drops / Mama litter number + Stud`.
4. Add newborn placeholders if photos are not ready yet.
5. Keep public copy compact: status, waitlist matching, puppy count, parent notes, and where availability will be posted.
6. Run `npm run photos:plan`.
7. Run `npm run ops:status`.
8. After weekly photos are uploaded, add puppy galleries grouped by week.
9. Run the full verification pass before deploy when a public litter/page change is significant.

The public current litter page should show family-facing confidence. Go-home instructions, detailed pickup notes, payment status, and assignment details belong in CRM, Breeding Ops, or the future puppy portal unless there is a simple public-facing note.

## Step 4: SEO And AI Search Pass

Current public discovery assets:

- `public/sitemap.xml`
- `public/robots.txt`
- `public/llms.txt`
- route-specific titles and descriptions
- Open Graph and Twitter metadata
- JSON-LD graph with Organization, LocalBusiness, WebSite, WebPage, BreadcrumbList, FAQPage, ItemList, and page-specific Service/Contact/About data where applicable

Ongoing rules:

- Keep breed + location language natural: Goldendoodles, Cavapoos, Bernedoodles, Salado, Central Texas, Texas.
- Use the most specific public page for each topic instead of one giant catch-all page.
- Avoid making static AI files promise live availability counts that can go stale.
- Keep `llms.txt` pointed at public pages, not Google Sheets, CRM routes, Apps Script URLs, Drive folders, or internal docs.
- Run `npm run review:seo` after template or route changes.

## Step 5: Launch Cleanup

Safe cleanup completed or tracked in this pass:

- Vercel Web Analytics is enabled.
- The website already includes `@vercel/analytics` and `<Analytics />`.
- ESLint now recognizes the browser `AbortController` global.
- `.DS_Store` is ignored so local Mac metadata does not pollute website work.

Items that still need explicit Adam approval before action:

- Deleting old or unused Resend API keys.
- Deleting or archiving test rows from `Website Leads`, `Lead Queue`, or the CRM.
- Changing Vercel plan, billing, custom domains, DNS, GoDaddy, or Squarespace.
- Letting CRM write back to Google Sheets or website data.

Recommended next human rhythm:

- Daily for the first launch week: check Vercel Analytics plus new `Lead Queue` rows.
- Weekly: run `npm run ops:full` before or after photo/update day.
- Before CRM changes website behavior: update `docs/CRM_HANDOFF_PACKET.md` and confirm the ownership boundary.
