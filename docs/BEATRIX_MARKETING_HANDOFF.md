# Beatrix puppy buyer handoff

## October 22 buyer journey corrections (prepared)

The quality-pass preview corrects same-page puppy inquiry selection and preserves entered contact details and questions when visitors change puppies or use Back. The mobile litter Apply button now carries the same litter identifier as the main button. `puppy_buyer_application_success` covers every successful puppy application, including general and breed-only applications; available breed/litter/puppy identifiers remain optional and no identifiers are invented. Event names, CRM routing, attribution fields, duplicate prevention, and the parent-led litter template are unchanged. These corrections are prepared pending the production release decision. See `WEBSITE_QUALITY_PASS_2026-10-22.md`.

## October 21 reservation update

Louisa is Reserved following the saved CRM reservation. The six available Beatrix puppies are Atticus, Twain, Edith, Dickens, Austen, and Brontë; Wells, Darcy, and Louisa are reserved. Public price, size, and litter go-home dates are unchanged. The earlier availability and release counts below are historical snapshots, not current inventory. Source and exact Sheet readbacks are recorded in `red-ranch-ecosystem-architect/private-runs.nosync/website-louisa-reserved-20261021/`.

## Destination and offer

- Advertising destination: https://www.redranchdogs.com/litters/beatrix-enzo-planned-2026
- Beatrix + Enzo, F1B-style Mini Goldendoodles, born September 28, 2026, in Salado, Texas.
- Expected adult weight: 25–35 lb. Price: $2,800. Planned go-home: November 19–21, 2026.
- Confirmed open by Adam October 17: Atticus, Twain, Edith, Dickens, Austen, Brontë, Louisa. Wells and Darcy remain reserved. Later October 17 correction: Kylie + Ranger's October, Bram, Hugo Poe, and Salem are also available and must appear alongside Beatrix puppies on the homepage and Available Puppies page. Ophelia Shadow and Raven remain reserved.
- The short inquiry offers a puppy selection and timing question. The full application remains at `/apply?interest=<puppy_slug>` or `/apply?litter=beatrix-enzo-planned-2026`. Existing family assignments and selection priority remain with CRM.

## Conversion and attribution contract

- Successful short inquiry: `puppy_buyer_inquiry_success`. Successful Beatrix puppy or litter application: `puppy_buyer_application_success`. Both are emitted only after the form API confirms submission; the shared `form_submit_success` remains for all forms.
- GA4 parameters: `form_type`, `breed_slug`, `litter_slug`, `puppy_slug`, `page_path`; the three slugs are non-private. Vercel Analytics receives the same event names and context through the site adapter. No contact details are sent as analytics parameters.
- Supported campaign query parameters: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `gbraid`, `wbraid`. Forms preserve current, first, and last touch fields, landing pages, and referrers. A puppy link keeps its `interest` slug through the short form or full application.
- CRM/form distinction: the short form has `formType=contact`, `inquiryType=Available puppy`, `leadType=Puppy Buyer Inquiry`, and routing bucket `Puppy inquiries`; the full form has `formType=application` and `leadType=Puppy Application`. Both carry `breedSlug`, `litterSlug`, `puppySlug` when selected, plus a unique `submissionId`. Repeat inquiries have different submission IDs; a later application is a separate lead submission that CRM may associate using contact identity and the stable slugs. A submission does not reserve a puppy.

## Verification and release

- Local: content validation, source and buyer-flow checks, form contract, GA4 contract, application journey, form API/security tests, lint, build, and 47 public routes at two viewport sizes passed. At 390 px, the current Atticus photo loaded above the fold, the seven-puppy offer and actions were visible, the `interest=atticus` inquiry preselected Atticus, and horizontal overflow was absent. A two-visit browser check retained first-touch Google/GCLID and last-touch Instagram/WBRAID values. No live buyer form was submitted.
- Preview: Vercel preview for commit `23575b5` is READY and the Beatrix page was read back at the preview URL with seven available choices, Wells/Darcy reserved, and the short form present.
- Website Hub sheet mirror: Adam approved the exact Kylie correction October 17. Puppy Tracker rows 49, 50, 51, and 53 now read Available/Yes/Yes with matching availability notes. Row 52 Ophelia Shadow remains Reserved/No/No. Kylie litter row 8 names the four openings and preserves Ophelia Shadow and Raven as reserved. All changed cells were read back after the scoped edits.
- Full `npm run publish:check` passed after sheet alignment, including the 48-route desktop/mobile browser sweep, SEO audit, and deploy package review.
- Release status: **live**. Commit `7e6e8d1` deployed from `main`; the Vercel production deployment reached READY. A fresh mobile read of `www.redranchdogs.com` found 11 homepage puppy cards, including all four Kylie Bernedoodles and seven Beatrix Goldendoodles. The live Beatrix page showed Beatrix and Enzo portraits before puppy cards, no promotional puppy hero, and no horizontal overflow. The live Available Puppies Bernedoodle route showed all four Kylie openings.

## October 17 correction review

- The homepage uses the same puppy cards for four Kylie Bernedoodles and seven Beatrix Goldendoodles. The Available Puppies breed tabs and Bernedoodle page expose the Kylie puppies; existing reservations stay closed.
- The Beatrix litter top is back on the shared template: price, size, birth and go-home facts, then Beatrix and Enzo parent photos. The separate puppy-photo promotional block was removed. The short inquiry remains below the puppy cards.
- Local verification: 48 public routes at mobile and desktop widths passed. A 390 px visual check showed both parent portraits above About This Litter, with no puppy promo block or horizontal overflow. The homepage rendered all 11 cards with breed labels and no horizontal overflow.
