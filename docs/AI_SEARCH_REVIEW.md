# AI Search Review

Generated: 5/21/2026, 1:00:24 PM Central

Status: **PASS**

This report checks the public signals that help Google and AI-answer systems understand Red Ranch Dogs without exposing private CRM, Google Sheets, Drive, or Apps Script details.

## Checks

| Check | Status | Detail |
| --- | --- | --- |
| robots.txt points to production sitemap | PASS | Crawlers can discover the canonical sitemap. |
| sitemap uses production domain | PASS | 119 sitemap URLs found. |
| AI summary file exists and points to full summary | PASS | llms.txt exposes a concise public index for answer engines. |
| Full AI summary excludes private operations | PASS | The full summary is public-facing and directs answers back to live pages. |
| Structured data includes local business and FAQ support | PASS | Public templates expose answer-engine-friendly JSON-LD markers. |
| Required buyer routes are in sitemap | PASS | Core buyer, breed, process, review, and contact pages are discoverable. |
| AI summary names Red Ranch Dogs location and breeds | PASS | The summary carries the location and breed entities Adam wants AI search to understand. |

## Public Answer-Engine Scope

- Website pages, sitemap, public JSON-LD, `llms.txt`, and `llms-full.txt` are public source material.
- Current availability should be answered from live current-litter and available-puppy pages, not from old social posts or internal sheets.
- CRM notes, lead records, private waitlist order, deposits, payment details, and Google Drive working folders should stay out of public AI-search material.

## Next Manual Checks

1. Submit the production sitemap in Google Search Console after meaningful public content updates.
2. Periodically search for Red Ranch Dogs, Salado doodle puppies, Goldendoodle puppies Texas, Cavapoo puppies Texas, and Bernedoodle puppies Texas.
3. When litters change status, rerun `npm run seo:crawler`, `npm run review:seo`, and this review so AI-search summaries stay current.
