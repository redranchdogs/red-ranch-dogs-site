# Squarespace Admin Inventory

Captured from Squarespace admin on April 24, 2026 after contributor access was accepted.

## Export Attempt

Squarespace path checked: `Settings > Website > Import & Export Content`.

Result:

- Export option exists only for WordPress.
- Squarespace reported: `No compatible collections to export`.
- Conclusion: there is no useful one-click content export for this site. Migration should proceed by admin page inventory, public/admin page inspection, media capture, and targeted form/settings review.

## Main Navigation

- Home
- About
  - Prices
  - FAQ
  - Contact
  - Meet our Team
  - Our Family
  - Reviews
- Puppies
  - What Come With Your Puppy?
  - Available Puppies
  - Current Litters
  - Upcoming Litters
  - Previous Litters
  - Coat Traits
- Parents
  - Dams
  - Studs
- Application & Waitlist
  - Puppy Application
  - Application Process
  - Waitlist
- Stud Services
  - Our Studs
  - Reproductive Education
- Guardian Program
- Puppy Application

## Not Linked Pages And Groups

### Studs

- Beau
- Bodhe
- Butch Cassidy
- Enzo
- Garth Brooks
- Hank Williams
- Johnn Cash
- Knox
- Robert Redford
- Sundance
- Waylon Jennings
- Wayne
- Wyatt

### Standalone / Utility

- Stop the Marking
- Guardian Application
- Services 6
- Current Litters (Copy)

### Future Moms / Sires

- Evie Nicks
- Ginny
- Sylvee
- Whitley
- Winnie

### Mommas

- Beatrix
- Birdie
- Daisy
- Faye
- Flora
- Georgia
- Honey
- June (2)
- Kylie
- Lady
- Penny 2
- Phoebe
- Reece
- Tilly
- Lady + Redford 4
- Trudy
- Kylie + Ranger

### Retired Mommas

- Ruby

### Dam Breed Pages

- Poodle Dams
- Golden Retriever Dams
- Cavapoo Dams
- Bernedoodle Dams
- Goldendoodle Dams

### Future Litters

- Whitley + Waylon
- Ginny + Butch
- Georgia + Waylon 2
- Penny + Wyatt
- Faye + Sundance
- Winnie + Redford
- Future Litters (NEW)

### Current Litters

- Birdie + Waylon (2)
- Honey + Bram

### Previous Litters

- Sylvee + Cash
- Tilly + Redford (2)
- Phoebe + Waylon (2)
- Flora + Enzo 4
- June + Redford
- Reece + Wayne
- Trudy + Wayne
- Faye + Bodhe (2)
- Daisy + Waylon
- Penny + Butch
- Georgia + Waylon
- Beatrix + Enzo
- Honey + Waylon
- Phoebe + Waylon
- Tilly + Redford
- June + Waylon
- Lady + Enzo 2
- Faye + Beau
- Birdie + Waylon Jennings
- Daisy + Waylon Jennings
- Ruby + Bodhe 3
- Beatrix + Knox
- Trudy+ Wayne 2
- Birdie + Leo
- Flora + Enzo 3
- Faye + Bodhe
- Ruby + Bodhe 2
- Phoebe + Fynn 2
- Lady + Enzo
- Ruby + Bodhe

### Previous Litter Breed Pages

- Previous Litters Goldendoodles
- Previous Litters Bernedoodles
- Previous Litters Cavapoos
- Previous Litters Poodles

### Social / Footer Links

- Facebook
- Instagram
- Home
- Puppy Application
- Contact

## Migration Priority

1. Current Litters: `Honey + Bram`, `Birdie + Waylon (2)`.
2. Future Litters: `Ginny + Butch`, `Whitley + Waylon`, `Faye + Sundance`, `Georgia + Waylon 2`, `Penny + Wyatt`, `Winnie + Redford`.
3. Duplicated or legacy pages that need redirects rather than rebuilds.

## Stud Page Migration Pass

Completed April 24, 2026 from the public stud pages plus admin inventory.

- Added local routes for `Garth Brooks`, `Hank Williams`, `Beau`, `Waylon Jennings`, `Sundance`, `Enzo`, `Butch Cassidy`, `Knox`, `Robert Redford`, `Wayne`, `Johnn Cash`, `Wyatt`, and `Bodhe`.
- Downloaded the visible Squarespace stud flyer images into `public/images/studs/`.
- Preserved the current public URL slugs, including `/wayne` and `/johnn-cash`.
- Kept richer gallery sections and external testing-result files marked for a later admin pass where needed.

## Dam Page Migration Pass

Completed April 24, 2026 from the public dam group pages, individual dam pages, and admin inventory.

- Added local dam breed routes for `Goldendoodle Dams`, `Bernedoodle Dams`, `Poodle Dams`, `Cavapoo Dams`, and `Golden Retriever Dams`.
- Added local profile routes for `Birdie`, `Honey`, `Phoebe`, `Daisy`, `Beatrix`, `June`, `Georgia`, `Evie Nicks`, `Ginny`, `Whitley`, `Kylie`, `Tilly`, `Sylvee`, `Trudy`, `Faye`, `Penny`, `Winnie`, `Reece`, `Flora`, and `Lady`.
- Downloaded one main public profile image per dam into `public/images/dams/`.
- Kept full gallery migration and external/private testing-result links marked for a later admin pass.

## Previous Litter Migration Pass

Completed April 24, 2026 from the public previous-litter archive pages.

- Added local archive routes for Goldendoodles, Bernedoodles, Cavapoos, and Poodles.
- Added working public litter detail routes for Goldendoodle, Bernedoodle, Cavapoo, and Toy Poodle archive pages.
- Downloaded one representative image per migrated archive litter into `public/images/previous-litters/`.
- Preserved public slugs such as `/birdie-waylon-jennings`, `/floraenzo`, `/ruby-bodhe-2`, and `/trudy-wayne-2`.
- Noted broken public archive links `/new-page-2`, `/june-enzo-1`, and `/june-enzo-2` for redirect cleanup rather than rebuilding them as live pages.

## Utility Page Migration Pass

Completed April 24, 2026 from the public utility pages.

- Added local `/guardian-application` page with a guardian-specific form.
- Added local `/stop-the-marking` marking reset guide.
- Updated form handling to accept `guardian` submissions and guardian-specific fields.
- Confirmed `/services-6` returns a public Squarespace 404, so it should be handled as redirect cleanup if it appears in analytics or old links.
