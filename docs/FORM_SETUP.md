# Form Setup

Last updated: April 25, 2026.

## Notification Email

Use `adam@redranchdogs.com`.

This is the direct mailbox for launch notifications. `support@redranchdogs.com` is available as a public alias, but Apps Script notification tests did not reliably arrive there.

## Google Sheet

Target title:

`Red Ranch Dogs Website Submissions`

Google Sheet URL:

`https://docs.google.com/spreadsheets/d/1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE/edit`

Google Sheet ID:

`1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE`

Required tab:

`Submissions`

Required headers:

1. Submitted At
2. Form Type
3. Page
4. Name
5. Email
6. Phone
7. Preferred Breed
8. Location
9. Housing
10. Fenced Yard
11. Other Pets
12. Dog Experience
13. Message
14. Source

## Apps Script

Use `scripts/google-apps-script.js`.

The script already includes defaults for:

- `SHEET_ID`: `1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE`
- `NOTIFY_EMAIL`: `adam@redranchdogs.com`

Optional script properties with those same names can override the defaults later.

Deployment:

- Type: Web app
- Execute as: Me
- Who has access: Anyone

After deployment, copy the web app URL into the Vercel environment variable:

`FORM_WEBHOOK_URL`

## Vercel Environment Variables

Required:

- `FORM_WEBHOOK_URL`

Optional if using Resend for direct email delivery:

- `RESEND_API_KEY`
- `FORM_TO_EMAIL=adam@redranchdogs.com`
- `FORM_FROM_EMAIL=Red Ranch Dogs <forms@redranchdogs.com>`

## Current Status

The Google Sheet has been created manually in the `adam@redranchdogs.com` account.

The Apps Script web app has been deployed and the live `/exec` URL has been saved locally in `.env.local` as `FORM_WEBHOOK_URL`.

Spreadsheet logging and notification email delivery to `adam@redranchdogs.com` were confirmed on April 25, 2026.

Run this command after future Apps Script changes:

```bash
npm run test:forms
```

Next required deployment step: add the same `FORM_WEBHOOK_URL` value to the Vercel project environment variables before production launch.
