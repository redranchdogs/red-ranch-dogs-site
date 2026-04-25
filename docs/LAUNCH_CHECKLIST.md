# Launch Checklist

Last updated: April 25, 2026.

## Before Preview Deploy

- Run `npm run build`.
- Run `npm run lint`.
- Run `npm run verify:routes`.
- Review `docs/CONTENT_MIGRATION.md` for remaining content gaps.
- Confirm current puppy availability and waitlist data before sharing the preview link.

## Forms

- Follow `docs/FORM_SETUP.md`.
- Google Sheet created: `1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE`.
- Apps Script deployed as a web app and saved locally as `FORM_WEBHOOK_URL` in `.env.local`.
- Notification email confirmed with `adam@redranchdogs.com`.
- Add `FORM_WEBHOOK_URL` to the Vercel project environment variables before production launch.
- Optional: configure Resend with `RESEND_API_KEY`, `FORM_TO_EMAIL`, and `FORM_FROM_EMAIL`.
- Run `npm run test:forms` after any Apps Script redeploy to confirm spreadsheet logging and email delivery.
- Before launch, submit browser tests for puppy application, waitlist, contact, guardian application, and newsletter.

## URL And SEO Review

- Confirm all sitemap URLs load.
- Confirm legacy redirects in `vercel.json`:
  - `/new-page-2` -> `/previous-litters-bernedoodles`
  - `/june-enzo-1` -> `/previous-litters-cavapoos`
  - `/june-enzo-2` -> `/previous-litters-cavapoos`
  - `/services-6` -> `/`
- Review page titles, meta descriptions, and canonical URLs in the browser.
- Add any Squarespace admin-only SEO titles/descriptions if they differ from the migrated defaults.

## Final Launch

- Deploy a private Vercel preview.
- Review desktop and mobile layouts for the homepage, current litters, previous litters, dam profiles, stud profiles, forms, and navigation.
- Only after approval, update DNS away from Squarespace.
- After DNS changes, submit `https://www.redranchdogs.com/sitemap.xml` to Google Search Console.
