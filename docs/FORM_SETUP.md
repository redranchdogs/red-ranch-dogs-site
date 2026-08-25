# Form Setup

Last updated: May 13, 2026.

## Notification Email

Use `adam@redranchdogs.com`.

This is the direct mailbox for launch notifications. `support@redranchdogs.com` is available as a public alias, but Apps Script notification tests did not reliably arrive there.

## Google Sheet

Target title:

`Website Submissions`

Google Sheet URL:

`https://docs.google.com/spreadsheets/d/1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE/edit`

Google Sheet ID:

`1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE`

Raw intake tab:

`Website Leads`

The bridge and Apps Script fallback manage the raw header row automatically. Keep this tab as the raw form history and use the cleaner working tabs around it:

- `Lead Queue`: the daily inbox view for reviewing new submissions, marking status, follow-up date, owner, and notes.
- `Reply Templates`: starter language for common response types.
- `Workflow Notes`: the simple manual process before a full CRM exists.
- `Closed Leads`: a manual archive for completed leads when the queue gets noisy.
- `Submissions`: legacy/test history; keep it for reference, but do not use it as the primary intake tab.

The raw `Website Leads` tab is organized around these column groups:

- Submission basics: submitted time, submission ID, form type, form title, page, current URL, landing page, and referrer.
- Lead routing: lead type, lead label, routing bucket, reply priority, recommended next step, and lead summary.
- Tracking: UTM source, medium, campaign, content, term, Google click IDs, and first-touch / last-touch attribution fields.
- Contact details: name, email, phone, location, inquiry type, and message.
- Form-specific details: puppy application, stud inquiry, guardian application, waitlist, and newsletter fields.
- Internal context: source and user agent.

## Apps Script Bridge

Use `scripts/website-bridge-apps-script.js` for the main website bridge.

The bridge writes form rows to Google Sheets, supports the compact lead workbook setup, and sends notification emails when a new row is appended to `Website Leads`.

The website supplies the target spreadsheet through Vercel environment variables. The bridge needs these script properties:

- `BRIDGE_SECRET`: set this as a script property, matching `RED_RANCH_BRIDGE_SECRET`
- `NOTIFY_EMAIL`: optional, defaults to `adam@redranchdogs.com`

The retired legacy script in `scripts/google-apps-script.js` remains formula-safe for teardown/forensic use, but it is no longer a supported `/api/forms` delivery path.

## Paid Attribution Fields

The website now preserves first-touch and last-touch attribution for form submissions. This is the minimum contract needed before scaling Google Ads.

The raw `Website Leads` row includes:

- `Google Click ID`, `GBRAID`, and `WBRAID`.
- First-touch fields: landing page, referrer, UTM source, UTM medium, UTM campaign, UTM content, UTM term, Google click ID, GBRAID, and WBRAID.
- Last-touch fields: landing page, referrer, UTM source, UTM medium, UTM campaign, UTM content, UTM term, Google click ID, GBRAID, and WBRAID.

The API response also returns `submissionId`, `formType`, `leadType`, and `routingBucket` so frontend analytics can match `form_submit_success` back to `Website Leads` and `Lead Queue`.

Deployment:

- Type: Web app
- Execute as: Me
- Who has access: Anyone

After deployment, copy the web app URL into the Vercel environment variable:

`RED_RANCH_BRIDGE_URL`

Do not configure `FORM_WEBHOOK_URL`; remove it from Vercel during the form-security release and disable or restrict the old public Apps Script deployment.

## Vercel Environment Variables

Required:

- `RED_RANCH_BRIDGE_URL`
- `RED_RANCH_BRIDGE_SECRET`
- `FORM_SHEET_ID=1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE`
- `FORM_SHEET_NAME=Website Leads`

Optional if using Resend for direct email delivery:

- `FORM_WEBHOOK_URL` is retired and must be absent.
- `RESEND_API_KEY`
- `FORM_TO_EMAIL=adam@redranchdogs.com`
- `FORM_FROM_EMAIL=Red Ranch Dogs <forms@redranchdogs.com>`

## Current Status

The Google Sheet has been created manually in the `adam@redranchdogs.com` account.

The Apps Script web app has been deployed and the live `/exec` URL has been saved locally in `.env.local` as `RED_RANCH_BRIDGE_URL`. Do not duplicate that URL into the retired `FORM_WEBHOOK_URL` variable.

Spreadsheet logging and notification email delivery to `adam@redranchdogs.com` were confirmed on April 25, 2026.

Run this command to test the local `/api/forms` handler without writing external rows:

```bash
npm run test:forms
```

Run this command after future Apps Script bridge changes to confirm authenticated bridge access:

```bash
npm run test:bridge
```

Run this command after deploying bridge v3.2 to format the `Website Submissions` workbook into the working lead-management layout:

```bash
npm run bridge:setup-submissions
```

That command applies the reusable sheet setup:

- `Lead Dashboard`: a quick daily overview and workflow reminder.
- `Lead Queue`: the working inbox with dropdown columns for status, owner, next action, outcome, follow-up date, and notes.
- `Reply Templates`: starter response language for common inquiry types.
- `Workflow Notes`: simple instructions for using the sheet before the CRM exists.
- `Closed Leads`: a quiet archive for completed rows.
- `Website Leads`: the raw form intake log. Do not edit this tab unless you are intentionally correcting a raw submission.

The current bridge layout keeps the workbook compact for daily use:

- `Lead Queue` has frozen working columns, filters, dropdowns, and compact row heights.
- `Website Leads` is intentionally clipped instead of fully wrapped, so raw form details do not create giant rows.
- Long context belongs in `Lead Summary` and `Notes`; use those fields briefly until the future CRM exists.

Run this command when you want a redacted lead operations snapshot:

```bash
npm run leads:packet
```

It writes `docs/LEAD_WORKFLOW_PACKET.md` and `outputs/lead-queue-snapshot.tsv` without copying names, emails, or phone numbers into repo docs.

Run this command to preview fake client scenarios without writing anything:

```bash
npm run leads:uat
```

Run this command when you want to send fake-but-realistic client scenarios through the real `/api/forms` handler and into Google Sheets:

```bash
npm run leads:uat:write
```

That is the website's UAT pass, or User Acceptance Testing. The fake rows use submission IDs that begin with `uat-` and emails at `example.com`, so they are safe to identify. After reviewing them in `Lead Queue`, mark them `Test/delete`.

Useful workflow terms:

- UAT: fake client scenarios used to prove the system works the way the business actually works.
- Happy path: the normal clean version of a workflow.
- Edge case: a realistic odd situation that should still behave clearly.
- Acceptance criteria: the pass/fail rule for a scenario.
- Source of truth: the place we trust as correct. For form intake, `Website Leads` is raw history and `Lead Queue` is the daily working view.
- Data contract: the agreed meaning of the columns so the future CRM can read them later.
- Lead lifecycle: the movement from new lead to replied, follow-up, deposit info sent, waitlist, closed, or not a fit.

Daily use:

1. Open `Lead Dashboard` first.
2. Go to `Lead Queue`.
3. New rows show up from `Website Leads` automatically.
4. Use the dropdowns in `Status`, `Owner`, `Next Action`, and `Outcome` instead of typing.
5. Add a `Follow Up Date` only when the next step is not finished today.
6. Use `Notes` for short context like “sent Zelle info” or “asked about timing.”
7. Keep `Website Leads` untouched so the raw submission history stays clean.

Run this command only for an explicitly approved legacy retirement diagnostic; it is not a supported fallback:

```bash
npm run test:forms:webhook -- --all
```

The live webhook test writes clearly marked fake rows to the `Website Leads` tab and may send Apps Script notification emails. It should populate the lead routing columns so the sheet can be filtered by application, general inquiry, stud inquiry, guardian candidate, puppy alert signup, and waitlist interest.

Next required deployment step: add `RED_RANCH_BRIDGE_URL`, `RED_RANCH_BRIDGE_SECRET`, `FORM_SHEET_ID`, and `FORM_SHEET_NAME` to the Vercel project environment variables before production launch. Remove `FORM_WEBHOOK_URL` and retire its old public deployment.
