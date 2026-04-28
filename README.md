# Red Ranch Dogs Site

Standalone rebuild of `redranchdogs.com` for managed hosting and Codex-driven updates.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run lint
npm run verify:routes
```

## Content Updates

Most public puppy, litter, parent, pricing, FAQ, and waitlist updates live in structured files under `src/data/`.

The public waitlist page uses `src/data/waitlist.json`, which mirrors the `Public Waitlist` tab in the Website Hub waitlist sheet. Only display-safe fields should be copied into the public data file: breed, position, display name, status, and whether the row should show publicly.

Migration notes:

- `docs/CONTENT_MIGRATION.md` tracks what has been moved from Squarespace and what still needs admin/export access.
- `docs/ACCESS_HANDOFF.md` explains exactly what access is needed and when.
- `docs/FORM_SETUP.md` lists the Google Sheet headers, Apps Script setup, and form environment variables.
- `docs/LAUNCH_CHECKLIST.md` tracks the final preview, forms, SEO, redirects, and DNS checklist.

When new puppy photos arrive:

1. Add optimized images under `public/images/puppies/` or replace the seeded Squarespace CDN URLs after the Squarespace media export.
2. Update the matching structured data file in `src/data/`.
3. Run `npm run build`.
4. Deploy through Vercel after review.

## Forms

The frontend submits puppy application, waitlist, contact, guardian application, and newsletter forms to `/api/forms`.

Production environment variables:

- `FORM_WEBHOOK_URL`: Google Apps Script web app URL for spreadsheet logging.
- `RESEND_API_KEY`: optional Resend API key for email delivery.
- `FORM_TO_EMAIL`: destination email, for example `adam@redranchdogs.com`.
- `FORM_FROM_EMAIL`: verified sender email for Resend.

The included `scripts/google-apps-script.js` logs submissions to Google Sheets and can send a notification email through Google Apps Script. If Resend and Apps Script are both unset, local previews accept submissions with a preview message, but production returns a configuration error.

Form smoke test:

```bash
npm run test:forms
```

This uses `FORM_WEBHOOK_URL` from `.env.local`, writes a clearly marked fake row to the Google Sheet, and sends the Apps Script notification email.

## Deployment

This project is configured for Vercel:

- Static app served from Vite output.
- `/api/forms` handled as a Vercel serverless function.
- SPA rewrites preserve Squarespace-style paths.

Do not move DNS from Squarespace until every public page has been reviewed and the final URL/redirect map has been approved.
