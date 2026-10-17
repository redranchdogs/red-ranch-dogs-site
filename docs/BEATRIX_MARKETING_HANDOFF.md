# Beatrix puppy buyer handoff

## Destination and offer

- Advertising destination: https://www.redranchdogs.com/litters/beatrix-enzo-planned-2026
- Beatrix + Enzo, F1B-style Mini Goldendoodles, born September 28, 2026, in Salado, Texas.
- Expected adult weight: 25–35 lb. Price: $2,800. Planned go-home: November 19–21, 2026.
- Confirmed open by Adam October 17: Atticus, Twain, Edith, Dickens, Austen, Brontë, Louisa. Wells and Darcy remain reserved. Beatrix is the only litter displayed with available puppies; Kylie status is awaiting confirmation and no Kylie puppy is advertised as available.
- The short inquiry offers a puppy selection and timing question. The full application remains at `/apply?interest=<puppy_slug>` or `/apply?litter=beatrix-enzo-planned-2026`. Existing family assignments and selection priority remain with CRM.

## Conversion and attribution contract

- Successful short inquiry: `puppy_buyer_inquiry_success`. Successful Beatrix puppy or litter application: `puppy_buyer_application_success`. Both are emitted only after the form API confirms submission; the shared `form_submit_success` remains for all forms.
- GA4 parameters: `form_type`, `breed_slug`, `litter_slug`, `puppy_slug`, `page_path`; the three slugs are non-private. Vercel Analytics receives the same event names and context through the site adapter. No contact details are sent as analytics parameters.
- Supported campaign query parameters: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `gbraid`, `wbraid`. Forms preserve current, first, and last touch fields, landing pages, and referrers. A puppy link keeps its `interest` slug through the short form or full application.
- CRM/form distinction: the short form has `formType=contact`, `inquiryType=Available puppy`, `leadType=Puppy Buyer Inquiry`, and routing bucket `Puppy inquiries`; the full form has `formType=application` and `leadType=Puppy Application`. Both carry `breedSlug`, `litterSlug`, `puppySlug` when selected, plus a unique `submissionId`. Repeat inquiries have different submission IDs; a later application is a separate lead submission that CRM may associate using contact identity and the stable slugs. A submission does not reserve a puppy.

## Verification and release

- Local: content validation, source and buyer-flow checks, form contract, GA4 contract, application journey, form API/security tests, lint, build, and 47 public routes at two viewport sizes passed. At 390 px, the current Atticus photo loaded above the fold, the seven-puppy offer and actions were visible, the `interest=atticus` inquiry preselected Atticus, and horizontal overflow was absent. A two-visit browser check retained first-touch Google/GCLID and last-touch Instagram/WBRAID values. No live buyer form was submitted.
- Preview: Vercel preview for commit `23575b5` is READY and the Beatrix page was read back at the preview URL with seven available choices, Wells/Darcy reserved, and the short form present.
- Website Hub sheet mirror: Adam approved the exact Kylie change. Four puppy rows and one litter row were updated and read back without touching reserved rows, family fields, waitlist, or other sheets. The bridge-backed sheet review and `check:publish-ready` both passed.
- Full `npm run publish:check` passed, including the 47-route desktop/mobile browser sweep, SEO audit, and deploy package review.
- Release status: **live**. Production deployment of `fb33390` reached READY with `www.redranchdogs.com` attached. The live Beatrix page showed the seven confirmed openings, Wells/Darcy reserved, offer details, and the short form; Available Puppies and Goldendoodles showed Beatrix openings without an empty state. A small homepage accessibility-label follow-up is included in the final release after this verified deployment.
