# Red Ranch CRM Build Handoff Packet

Generated: May 19, 2026 Central

Purpose: give the new Red Ranch CRM Build project a safe, current map of the live website form system without editing, redeploying, or breaking the live Red Ranch Dogs website.

## High-Level Rule

The live website is already in production. The CRM project should treat the website as an external intake source first. Do not refactor the website, change form fields, change DNS, change Vercel environment variables, or alter Google Sheet tab structures from the CRM project unless Adam explicitly asks for that change.

## Live Website And Source

- Live website URL: `https://www.redranchdogs.com/`
- Apex domain: `https://redranchdogs.com/`
- Local website repo path: `/Users/adamdietlein/Documents/New project/red-ranch-dogs-site`
- GitHub repo: `https://github.com/redranchdogs/red-ranch-dogs-site`
- Working branch used during launch: `codex/launch-candidate`
- Deployment host: Vercel
- Vercel project name: `red-ranch-dogs-site`
- Vercel project id: `prj_p7A73dLn3LVoqGaKWtcrKeGgLaCL`
- Vercel team/org id: `team_QH94e7KyiwgaldaCi7uiAgrQ`
- Current production aliases include:
  - `https://redranchdogs.com`
  - `https://www.redranchdogs.com`
  - `https://red-ranch-dogs-site.vercel.app`

## Current Website Forms

All current website lead forms are React forms rendered by `LeadForm` in `src/App.jsx`. All submit with `fetch("/api/forms", { method: "POST" })`.

The current accepted backend form types are:

- `application`
- `contact`
- `guardian`
- `newsletter`
- `stud`
- `waitlist`

### Common Client Payload Fields

Every form may include these shared fields:

- `formType`: set by the React form type.
- `formTitle`: set by the rendered form title.
- `page`: current pathname.
- `currentUrl`: full browser URL at submit time.
- `referrer`: `document.referrer`.
- `userAgent`: browser user agent.
- `submittedAt`: client timestamp, but the API replaces this with a server timestamp.
- `source`: hidden field, currently `red-ranch-dogs-site`.
- `companyWebsite`: honeypot spam field. If filled, the API returns a soft success and does not process as a real lead.
- `landingPage`: first page stored in session storage for the visit.
- `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`: collected from URL query params when present.

### Server-Enriched Fields

`api/forms.js` enriches submissions before writing to Sheets:

- `submittedAt`: server timestamp.
- `submissionId`: generated UUID unless provided by a test/UAT runner.
- `leadType`
- `leadLabel`
- `routingBucket`
- `replyPriority`
- `recommendedNextStep`
- `leadSummary`: compact, CRM-friendly summary string.
- `message`: expanded message including routing details and form-specific details.

## Form: Puppy Application

- Route: `/apply`
- React use: `<LeadForm formType="application" title="Application details" />`
- Backend form type: `application`
- Lead type: `Puppy Application`
- Routing bucket: `Puppy applications`
- Reply priority: `High`
- Recommended next step: `Review puppy fit, availability, and waitlist timing.`
- Submits to: `/api/forms`

Fields:

- `name` - required
- `email` - required, email validation
- `phone` - required
- `location`
- `preferredBreed` - required checkbox group; possible current values: `Goldendoodle`, `Cavapoo`, `Bernedoodle`, `Not sure yet`
- `genderPreference`; possible current values: `Male`, `Female`, `No preference`
- `sizePreference`; possible current values: `Micro mini (10-15 lbs)`, `Mini (15-35 lbs)`, `Not sure yet`
- `timing`; possible current values: `Ready now`, `Within 1-3 months`, `Within 3-6 months`, `6+ months from now`, `Flexible`
- `specificInterest`
- `homeDescription`; possible current values: `Family with children`, `Adult household`, `Single adult`, `Couple`, `Other`
- `puppyFitNotes`
- `pickupOrDelivery`; possible current values: `We can pick up in Salado, Texas`, `We may need delivery help`, `Not sure yet`
- `processAgreement` - required checkbox
- `message`
- `hearAbout`; possible current values: `Google search`, `Instagram`, `Facebook`, `Referral / friend`, `Previous Red Ranch Dogs family`, `Website / online search`, `Other`
- `signature` - required

## Form: Contact

- Route: `/contact`
- React use: `<LeadForm formType="contact" title="Send a Message" compact />`
- Backend form type: `contact`
- Lead type: `Website Contact`
- Routing bucket: `General inquiries`
- Reply priority: `Normal`
- Recommended next step: `Reply to the family's question or route it to the right follow-up.`
- Submits to: `/api/forms`

Fields:

- `name` - required
- `email` - required, email validation
- `phone`
- `preferredContactMethod`; possible current values: `Text`, `Call`, `Email`, `No preference`
- `inquiryType`; possible current values: `Available puppy`, `Upcoming litter`, `Application or waitlist`, `Guardian program`, `Stud services`, `General question`
- `preferredBreed`; possible current values: `Goldendoodle`, `Cavapoo`, `Bernedoodle`, `Not sure yet`
- `message` - required

Note: `preferredContactMethod` is currently collected by the frontend but is not part of the raw `Website Leads` column contract in `api/forms.js`. It should be added deliberately later if the CRM needs it as a first-class field.

## Form: Guardian Application

- Route: `/guardian-program/application`
- React use: `<LeadForm formType="guardian" title="Guardian Application" guardianFields />`
- Backend form type: `guardian`
- Lead type: `Guardian Application`
- Routing bucket: `Guardian program`
- Reply priority: `High`
- Recommended next step: `Review location, fenced yard, housing, and schedule fit before a phone call.`
- Submits to: `/api/forms`

Fields:

- `name` - required
- `email` - required, email validation
- `phone` - required
- `location` - required
- `guardianType` - required; possible current values: `Female guardian`, `Stud guardian`, `Either / not sure yet`
- `guardianDistance` - required; possible current values: `In Salado or very close`, `Within 30 minutes`, `30-60 minutes away`, `More than 1 hour away`
- `housing` - required; possible current values: `Own home`, `Long-term renter`, `Other`
- `fencedYard` - required; possible current values: `Yes`, `No`, `Planning to add one`
- `childrenInHome`; possible current values: `Yes`, `No`
- `otherPets`; possible current values: `No other pets`, `Yes - all spayed/neutered`, `Yes - one or more intact pets`, `Other / needs explanation`
- `preferredBreed`; possible current values: `Goldendoodle`, `Cavapoo`, `Bernedoodle`, `Not sure yet`
- `dogExperience`
- `guardianReason`
- `phoneCallTiming`; possible current values: `Weekdays`, `Evenings`, `Weekends`, `Flexible`
- `guardianAgreement` - required checkbox

## Form: Stud Inquiry

- Route: `/stud-services`, section id `#stud-inquiry`
- React use: `<LeadForm formType="stud" title="Stud Inquiry" />`
- Backend form type: `stud`
- Lead type: `Stud Inquiry`
- Routing bucket: `Stud services`
- Reply priority: `High`
- Recommended next step: `Review preferred stud, cycle timing, brucellosis status, and service type.`
- Submits to: `/api/forms`

Fields:

- `name` - required
- `programName`
- `email` - required, email validation
- `phone` - required
- `preferredStud`; current options are generated from public stud data, plus `Not sure yet`
- `serviceType`; possible current values: `Artificial insemination at Red Ranch Dogs`, `Shipped semen`, `Not sure yet`
- `cycleTiming`; possible current values: `Planning ahead`, `Currently in heat`, `Next cycle soon`, `Progesterone testing has started`, `Not sure yet`
- `studGoals` - required
- `femaleDogName` - required
- `femaleDogBreed` - required
- `brucellosisStatus` - required; possible current values: `Negative test completed`, `Test is scheduled`, `Will complete before service`, `I have questions about the requirement`
- `studPolicyAgreement` - required checkbox
- `message`

## Form: Waitlist Interest

- Route: `/process/application-and-waitlist`
- React use: `<LeadForm formType="waitlist" title="Join Our Waitlist" />`
- Backend form type: `waitlist`
- Lead type: `Waitlist Interest`
- Routing bucket: `Waitlist`
- Reply priority: `High`
- Recommended next step: `Confirm preferred breed and explain deposit and waitlist timing.`
- Submits to: `/api/forms`

Fields:

- `name` - required
- `email` - required, email validation
- `phone`
- `preferredBreed` - required; possible current values: `Goldendoodle`, `Cavapoo`, `Bernedoodle`, `Not sure yet`
- `message`

## Form: Puppy Alert Email

- Route/location: footer alert component shown site-wide through `PuppyAlertSignup`
- React use: `<LeadForm formType="newsletter" title="Puppy Alert Email" compact newsletterOnly />`
- Backend form type: `newsletter`
- Lead type: `Puppy Alert Signup`
- Routing bucket: `Email list`
- Reply priority: `Low`
- Recommended next step: `Add this family to puppy alert updates.`
- Submits to: `/api/forms`

Fields:

- `email` - required, email validation

## Submission Endpoint And Delivery Order

Endpoint:

- `POST /api/forms`
- File: `api/forms.js`

Handler behavior:

1. Rejects non-POST requests.
2. Parses JSON body.
3. Soft-accepts honeypot spam when `companyWebsite` is filled.
4. Validates `formType` against allowed forms.
5. Validates required fields and email format.
6. Enriches the payload with routing fields and lead summary.
7. Attempts email and sheet delivery in parallel.
8. In production, if both email and sheet delivery are skipped, returns `500` with `Form delivery is not configured yet.`

Delivery integrations:

- Primary sheet path: Apps Script bridge via `RED_RANCH_BRIDGE_URL` and `RED_RANCH_BRIDGE_SECRET`.
- Legacy fallback sheet path: `FORM_WEBHOOK_URL`.
- Optional direct email path: Resend via `RESEND_API_KEY`, `FORM_TO_EMAIL`, and `FORM_FROM_EMAIL`.
- Current bridge also sends Apps Script notification email when rows are appended to `Website Leads`.

## Google Sheets

Primary submissions workbook:

- Title: `Website Submissions`
- Spreadsheet URL: `https://docs.google.com/spreadsheets/d/1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE/edit`
- Spreadsheet ID: `1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE`

Current tabs used by the submissions workflow:

- `Lead Dashboard`: quick daily counts and workflow guide.
- `Lead Queue`: daily working inbox for Adam/Callie/Nicole.
- `Reply Templates`: starter responses.
- `Workflow Notes`: manual process notes before a CRM exists.
- `Closed Leads`: quiet archive for completed leads.
- `Website Leads`: raw intake/history tab. Keep this untouched.
- Legacy/test history may exist in `Submissions`; do not use it as the current source of truth.

Current verified operations status:

- Apps Script bridge status: PASS
- Live bridge version: `3.2.0`
- Authenticated bridge read: PASS
- Current redacted queue count: 29 raw website submissions and 29 lead queue rows
- Current notable queue cleanup item: 12 UAT/test rows exist and should be marked `Test/delete` or archived when Adam is done reviewing them.

## Raw Website Leads Columns

The `Website Leads` tab is the raw archive. Current header contract:

1. `Submitted At`
2. `Submission ID`
3. `Form Type`
4. `Form Title`
5. `Lead Type`
6. `Lead Label`
7. `Routing Bucket`
8. `Reply Priority`
9. `Recommended Next Step`
10. `Lead Summary`
11. `Page`
12. `Current URL`
13. `Landing Page`
14. `Referrer`
15. `UTM Source`
16. `UTM Medium`
17. `UTM Campaign`
18. `UTM Content`
19. `UTM Term`
20. `Name`
21. `Email`
22. `Phone`
23. `Inquiry Type`
24. `Preferred Breed`
25. `Program Name`
26. `Preferred Stud`
27. `Service Type`
28. `Cycle Timing`
29. `Female Dog Name`
30. `Female Dog Breed`
31. `Brucellosis Status`
32. `Stud Goals`
33. `Stud Policy Agreement`
34. `Guardian Type`
35. `Guardian Distance`
36. `Location`
37. `Housing`
38. `Fenced Yard`
39. `Children In Home`
40. `Other Pets`
41. `Dog Experience`
42. `Gender Preference`
43. `Size Preference`
44. `Timing`
45. `Specific Interest`
46. `Home Description`
47. `Puppy Fit Notes`
48. `Pickup Or Delivery`
49. `Process Agreement`
50. `Hear About`
51. `Guardian Reason`
52. `Phone Call Timing`
53. `Guardian Agreement`
54. `Signature`
55. `Message`
56. `Source`
57. `User Agent`

## Lead Queue Columns And Statuses

`Lead Queue` is the CRM-ready working view. It is rebuilt from `Website Leads` while preserving manual workflow columns by `Submission ID`.

Current queue columns:

1. `Status`
2. `Follow Up Date`
3. `Owner`
4. `Next Action`
5. `Outcome`
6. `Submitted At`
7. `Name`
8. `Email`
9. `Phone`
10. `Lead Type`
11. `Priority`
12. `Breed / Interest`
13. `Timing`
14. `Location`
15. `Recommended Next Step`
16. `Lead Summary`
17. `Submission ID`
18. `Notes`

Current `Status` dropdown values:

- `New`
- `Needs reply`
- `Replied`
- `Follow up`
- `Deposit info sent`
- `Waiting on family`
- `On waitlist`
- `Not a fit`
- `Closed`
- `Test/delete`

Current `Owner` dropdown values:

- `Adam`
- `Callie`
- `Nicole`
- `Unassigned`

Current `Next Action` dropdown values:

- `Reply today`
- `Text family`
- `Send deposit info`
- `Ask one question`
- `Schedule call`
- `Add to waitlist`
- `Check payment`
- `Archive/ignore`
- `No action`

Current `Outcome` dropdown values:

- `Approved to waitlist`
- `Ask about available puppy`
- `Sent deposit info`
- `Joined waitlist`
- `Needs more info`
- `Not ready`
- `Not a fit`
- `Closed`
- `Test/delete`

Current redacted queue counts from the refreshed lead packet:

- Raw website submission rows: 29
- Lead queue rows: 29
- Open/non-closed rows: 29
- UAT/test scenario rows: 12
- Blank status rows: 27
- Needs reply rows: 1
- Follow up rows: 0
- Overdue follow-up rows: 0

Current lead type counts:

- `Puppy Application`: 10
- `Website Contact`: 7
- `Guardian Application`: 3
- `Puppy Alert Signup`: 3
- `Stud Inquiry`: 3
- `Waitlist Interest`: 3

## Apps Script Bridge

Main bridge source:

- `scripts/website-bridge-apps-script.js`
- Current local bridge version: `3.2.0`
- Current live bridge version: `3.2.0`
- Live authenticated read was verified with `npm run bridge:status`

Bridge purpose:

- Read and replace sheet values for controlled scripts.
- Append website lead rows.
- Rebuild or format the submissions workbook.
- Send notification email when a new row is appended to `Website Leads`.
- Support Drive folder creation for website photo workflows.

Apps Script script properties:

- `BRIDGE_SECRET`: required; must match `RED_RANCH_BRIDGE_SECRET`.
- `NOTIFY_EMAIL`: optional; defaults to `adam@redranchdogs.com`.

Supported bridge actions currently used by this repo:

- `getSheetValues`
- `replaceSheet`
- `appendRows`
- `deleteSheet`
- `setupWebsiteSubmissionsWorkbook`
- `ensureFolder`
- `ensurePath`

## Environment Variable Names And Integrations

Do not expose or copy secret values into the CRM repo.

Website/Vercel env var names:

- `RED_RANCH_BRIDGE_URL`: Apps Script bridge web app URL.
- `RED_RANCH_BRIDGE_SECRET`: shared bridge secret.
- `FORM_SHEET_ID`: target submissions spreadsheet id.
- `FORM_SHEET_NAME`: target raw tab, currently `Website Leads`.
- `FORM_WEBHOOK_URL`: legacy fallback Apps Script web app URL.
- `RESEND_API_KEY`: optional direct email provider key.
- `FORM_TO_EMAIL`: optional direct email recipient, usually `adam@redranchdogs.com`.
- `FORM_FROM_EMAIL`: optional direct email sender.
- `VERCEL_ENV`: Vercel-provided environment marker; production handler fails loudly if no delivery path is configured.
- Vercel Web Analytics is enabled for the live project. The website includes `@vercel/analytics` and `<Analytics />`; Vercel Hobby analytics should be used for page/device trends, while `Website Leads` and `Lead Queue` remain the conversion source.

Apps Script property names:

- `BRIDGE_SECRET`
- `NOTIFY_EMAIL`
- Legacy fallback only: `SHEET_ID`, `SHEET_NAME`, `NOTIFY_EMAIL`

## Known Form Or Submission Issues

- No current blocker is known for live form submission delivery. Bridge health is passing and reports version `3.2.0`.
- Direct Resend email notification is configured through Vercel env vars, and the Apps Script bridge notification path remains available. If an email appears missing, check Resend Activity and Gmail Spam/Inbox placement before changing website code.
- There are UAT/test rows in the lead queue. They are useful evidence from launch testing but should not become real CRM contacts.
- Many lead queue rows currently have blank manual status. The CRM should import those as `Unworked` or map blank to `New`, not drop them.
- The frontend `contact` form collects `preferredContactMethod`, but the current backend raw column contract does not store it as a dedicated column. It may appear only if explicitly added later. Do not assume it is available in `Website Leads`.
- The direct Resend email path is optional. The bridge-managed Apps Script notification email is the current first-class notification path.
- `Website Leads` is intentionally compact/clipped in Google Sheets. Long detail should be read from `Lead Summary`, `Message`, and the raw field columns, not by changing row wrapping.

## What The CRM Should Not Touch In The Live Website

Do not touch these from the CRM project without explicit Adam approval:

- DNS or GoDaddy records.
- Vercel production aliases, custom domain routing, or Squarespace retirement.
- Live website routes, React templates, public copy, public data files, or image assets.
- Vercel env vars for the live website.
- Apps Script bridge deployment, script properties, or the bridge secret.
- `Website Leads` raw tab headers or history.
- `Lead Queue` dropdown/status contract unless the CRM migration plan intentionally replaces it.
- Public waitlist or puppy/litter content sheets while building the CRM prototype.
- Any real customer lead data copied into repo docs, test fixtures, screenshots, or public logs.

## Recommended First CRM Scope

Start with a read-only CRM importer and review dashboard. Do not make the CRM write back to the website or Google Sheets on day one.

Recommended phase 1:

1. Connect to the `Website Submissions` workbook in read-only mode.
2. Import `Website Leads` as immutable raw submission records keyed by `Submission ID`.
3. Import `Lead Queue` as the current working lead state keyed by `Submission ID`.
4. Normalize lead people into contacts using email and phone, but keep the original raw submission attached.
5. Map blank `Status` to `New` or `Unworked`.
6. Build CRM views:
   - New leads
   - Needs reply
   - Follow up due
   - Puppy applications
   - Guardian applications
   - Stud inquiries
   - Waitlist interest
   - Puppy alerts/newsletter
   - Test/delete rows
7. Preserve the current status, owner, next action, outcome, follow-up date, notes, lead type, priority, interest, timing, location, recommended next step, and lead summary.
8. Add a safe test import using only redacted or UAT rows first.

Recommended phase 2:

1. Add CRM-native status editing.
2. Decide whether Google Sheets remains a source, becomes a backup, or receives one-way CRM exports.
3. Add contact timeline, reply notes, deposit state, waitlist placement, litter interest, puppy assignment, contract status, and go-home checklist.
4. Add role-based views for Adam, Callie, and Nicole if needed.

## Data Structure Notes For Future CRM

The website form system already separates raw intake from daily workflow:

- `Website Leads` is the raw event log.
- `Lead Queue` is the daily operational state.
- `Submission ID` is the safest stable key between the two.
- Lead routing fields are already normalized enough for CRM queues.
- Current lead types are a good starting enum:
  - `Puppy Application`
  - `Website Contact`
  - `Guardian Application`
  - `Puppy Alert Signup`
  - `Stud Inquiry`
  - `Waitlist Interest`
- `Lead Summary` is designed as a compact, scan-friendly CRM preview.
- Raw form-specific fields should remain attached to each submission for auditability.

Suggested CRM entities:

- `Contact`: name, email, phone, location, household notes.
- `Lead`: lead type, routing bucket, priority, status, owner, next action, outcome, follow-up date.
- `Submission`: immutable raw website payload keyed by submission id.
- `PuppyPreference`: preferred breed, size, gender, timing, specific interest, pickup/delivery needs.
- `GuardianCandidate`: guardian type, distance, housing, fenced yard, children, pets, dog experience.
- `StudInquiry`: program name, preferred stud, service type, cycle timing, female dog details, brucellosis status.
- `WaitlistRecord`: breed, deposit status, position/order, joined date, pass/pick history.
- `Communication`: notes, replies, calls, texts, email history.

## Useful Website Commands

Run from `/Users/adamdietlein/Documents/New project/red-ranch-dogs-site`:

```bash
npm run bridge:status
npm run leads:packet
npm run leads:rebuild-queue
npm run leads:uat
npm run test:forms
npm run ops:status
```

Use `npm run leads:uat:write` only when Adam intentionally wants fake UAT rows written into the live submissions workbook.

## CRM Build Reminder

The website is live and should stay boring. The CRM can move fast by reading the current sheet workflow, but it should not change the live intake contract until the CRM has proven it can safely preserve every current field and manual workflow status.
