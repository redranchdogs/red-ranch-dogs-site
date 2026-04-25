# Content Migration Checklist

Last public migration pass: April 24, 2026.

This checklist tracks what has been migrated from the current public Squarespace site into the owned Red Ranch Dogs project.

## Migrated From Public Site

- Homepage: core copy, breed summaries, trust points, waitlist CTA, puppy-alert CTA.
- Pricing: Goldendoodle, Bernedoodle, Cavapoo, Poodle prices; deposit language; Zelle payment recipient.
- FAQ: location, pricing, puppy inclusions, payment, reservation, waitlist, health testing, health guarantee, visits, doodle generations, allergy note.
- What Comes With Your Puppy: health, vaccines, microchip, genetic guarantee, ENS/ESI, crate/potty/litterbox foundations, puppy take-home kit, support, optional transport.
- Current Litters: public 4/21/26 Honey + Bram and Birdie + Waylon data.
- Upcoming Litters: public 4/21/2026 Goldendoodle, Bernedoodle, and Cavapoo planned pairings.
- Dam Breed Pages: Goldendoodle, Bernedoodle, Poodle, Cavapoo, and Golden Retriever dam group pages.
- Individual Dam Profiles: Birdie, Honey, Phoebe, Daisy, Beatrix, June, Georgia, Evie Nicks, Ginny, Whitley, Kylie, Tilly, Sylvee, Trudy, Faye, Penny, Winnie, Reece, Flora, and Lady profile routes with main images and visible public testing notes.
- Previous Litters Archive: breed archive routes for Goldendoodles, Bernedoodles, Cavapoos, and Poodles, plus working public litter routes with summary facts, puppy names, milestones, and representative images.
- Waitlist: public rules and update date. Names still need admin confirmation because public page extraction did not expose all live list details clearly.
- Meet Our Team: Callie, Nicole, Adam and team-care copy.
- Our Family: Red Ranch Dogs family story and breeding-program overview.
- Reviews: visible public review excerpts.
- Guardian Program: benefits, expectations, and primary FAQ content.
- Guardian Application: public application landing page rebuilt with a guardian-specific local form.
- Stop the Marking: public marking reset guide migrated as a native local guide page.
- Reproductive Education: progesterone timing, machine differences, stalls, observational signs, and breeder inquiry CTA.
- Stud Services: public stud catalog by breed, name, weight, type, and visible genetics summary.
- Individual Stud Profiles: Garth Brooks, Hank Williams, Beau, Waylon Jennings, Sundance, Enzo, Butch Cassidy, Knox, Robert Redford, John Wayne, Johnny Cash, Wyatt Earp, and Bodhe profile routes with downloaded flyer images and visible testing/eval notes.
- Navigation: current public Squarespace paths and folder structure.

## Needs Squarespace Admin Or Export

- Original-resolution images and any images hidden behind Squarespace blocks.
- Current available-puppy cards, if any exist in product/summary blocks but are not visible in the public text scrape.
- Full dam/future-mom galleries and any hidden testing-result files stored behind links or admin-only blocks.
- Full previous-litter age-by-age galleries and any broken legacy archive links that need redirects instead of rebuilds.
- `services-6` returned a public 404 and should be handled as a redirect or removed legacy URL.
- Full stud galleries and linked testing PDFs/results where Squarespace stores those as external private documents.
- Individual litter detail pages, including puppy galleries and reservation status.
- Zelle QR code image from the pricing page.
- Embedded review widgets or exact Google review link/widget settings.
- Existing form field definitions, required questions, and routing rules.
- SEO titles/descriptions for every page, if customized in Squarespace.
- Any redirects, hidden pages, password-protected pages, or unpublished draft pages.

See `docs/SQUARESPACE_ADMIN_INVENTORY.md` for the admin-only page tree. The WordPress export path was checked and Squarespace reported no compatible collections to export, so migration will proceed page-by-page from the admin page manager.

## Launch Readiness Gaps

- Configure production form delivery with email plus Google Sheet logging.
- Replace seed images with the full exported media library.
- Review every page against Squarespace visually and textually.
- Create redirects for old URLs that do not have a one-to-one page in the new site.
- Deploy a private preview URL before changing DNS.
- Change DNS only after final content, forms, redirects, and mobile review are approved.

## Routine Puppy Update Workflow

When new puppy content is ready, provide:

- Puppy name
- Sex
- Breed
- Parent/litter
- Birth date
- Go-home date
- Color
- Coat
- Estimated adult size
- Price
- Status: available, reserved, pending, or keep private
- Photos, ideally original size
- Any short notes for the card or litter page

Codex updates `src/data/siteData.js`, adds images under `public/images/`, runs verification, and prepares the site for deploy.
