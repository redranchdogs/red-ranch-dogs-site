# Website Health Check / Website Debugger Workflow

Owner: **Red Ranch Dogs Website**

Default permission: **read-only inspect, report, and recommend**

This workflow keeps the live Red Ranch Dogs website healthy as puppy/litter data, forms, media, SEO, analytics, and CRM intake continue changing. It reuses the existing website repo checks instead of creating a separate app.

## Ownership Boundary

The Website project owns:

- public marketing pages
- public forms and `/api/forms`
- approved public puppy, litter, parent, guardian, stud-service, pricing, FAQ, and waitlist display
- website analytics/tracking implementation
- website deployment workflow
- Website Hub alignment checks for public website data

The Website Health Check may inspect and report on:

- public website routes
- public form behavior and local/API contracts
- generated review docs
- source data files
- Website Hub sheet alignment status
- public-safe CRM intake handoff contract
- analytics implementation signals

It must not edit CRM, Breeding Ops, Google Sheets, Google Drive, ads, payment systems, DNS, hosting settings, Vercel settings, production env vars, or production data unless Adam explicitly approves that exact action.

## Existing Checks To Reuse

The repo already has strong health-check scripts. Use these as the first layer before adding anything new.

| Area | Existing command | Output |
| --- | --- | --- |
| Website QA agent rollup | `npm run agent:website-qa` | `docs/WEBSITE_QA_AGENT_REPORT.md` |
| Live/content operations status | `npm run ops:status` | `docs/OPERATIONS_STATUS.md` |
| Public data validation | `npm run validate:content` | terminal result |
| Buyer journey and form contract | `npm run check:buyer-flow` | terminal result |
| Local form API safety tests | `npm run test:forms` | terminal result |
| Website Hub sheet alignment | `npm run review:sheets` | `docs/SHEET_SYNC_REVIEW.md` |
| Current litter media paths | `npm run review:current-media` | terminal result |
| Mobile/desktop route rendering | `npm run review:visual` | `docs/VISUAL_QA_REPORT.md` |
| SEO metadata and route basics | `npm run review:seo` | `docs/SEO_METADATA_REPORT.md` |
| Sitemap/AI crawler files | `npm run seo:crawler` | `public/sitemap.xml`, `public/llms.txt`, `public/llms-full.txt` |
| Analytics/event contract | `npm run review:analytics` | `docs/CONVERSION_ANALYTICS_REVIEW.md` |
| CRM intake handoff contract | `npm run review:crm-intake` | `docs/CRM_INTAKE_ALIGNMENT_REVIEW.md` |
| Public safety scan | `npm run review:safety` | `docs/PUBLIC_SAFETY_REVIEW.md` |
| Broken routes and redirects | `node scripts/verify-routes.mjs` | terminal result |
| Full publish gate | `npm run publish:check` | multiple review docs and build checks |

## Daily Light Check

Purpose: catch obvious urgent issues without creating daily noise.

Run daily or when Adam asks, especially during active puppy availability windows.

Recommended command set:

```bash
npm run agent:website-qa
npm run check:buyer-flow
npm run test:forms
```

Optional live public route sanity check:

```bash
curl -I https://www.redranchdogs.com/
curl -I https://www.redranchdogs.com/puppies/available
curl -I https://www.redranchdogs.com/apply
```

Daily report should stay short:

- Site live: pass/fail
- Homepage loads: pass/fail
- Key pages load: pass/fail
- Forms contract looks functional: pass/fail
- Latest generated QA report status: pass/fail
- Urgent issues only

Daily Light Check should not:

- run the full debugger unless something looks wrong
- write production test leads
- sync sheets
- deploy
- change website content
- change analytics/tracking

## Weekly Full Health Check

Purpose: full Website QA pass, once per week.

Recommended command set:

```bash
npm run validate:content
npm run check:buyer-flow
npm run test:forms
npm run ops:status
npm run agent:website-qa
npm run review:current-media
npm run review:visual
npm run review:seo
npm run review:analytics
npm run review:crm-intake
npm run review:safety
npm run review:sheets
npm run check:publish-ready
node scripts/verify-routes.mjs
```

Use `npm run publish:check` when the weekly pass should also prove the production build/package path:

```bash
npm run publish:check
```

Weekly report format:

```text
Website Health Check - Weekly Full

Status: PASS / WATCH / FAIL

Urgent Issues:
- ...

Recommended Fixes:
- ...

Optional Improvements:
- ...

Needs Adam Approval:
- ...

Checks Run:
- ...

Notes:
- ...
```

Weekly Full Health Check should cover:

- forms and submission paths
- puppy, litter, parent dog, available puppy, upcoming litter, application, waitlist, pricing, FAQ, guardian, and stud-service pages
- Website Hub / source-of-truth alignment where applicable
- media/photo/video paths
- mobile layout and important responsive pages
- broken links, redirects, and route coverage
- SEO basics: titles, meta descriptions, sitemap, robots, redirects, canonical URLs, indexing posture
- analytics and conversion tracking signals
- CRM intake path and lead attribution handoff
- public safety: no private CRM/Breeding Ops data leaking into public website data

## After Major Website Changes

Purpose: focused check tied to what changed.

Run after any of these:

- add a litter
- update available puppies
- update puppy photos/videos
- change forms
- change application or waitlist flow
- change pricing/application pages
- deploy code
- update analytics/tracking
- change media folders
- change public puppy/litter/parent dog data

Use the smallest relevant check set first:

| Change type | Focused checks |
| --- | --- |
| Puppy data/status/photos | `npm run validate:content`, `npm run check:buyer-flow`, `npm run review:current-media`, `npm run review:sheets`, `npm run check:publish-ready` |
| Litter data/gallery | `npm run validate:content`, `npm run review:current-media`, `npm run review:sheets`, `node scripts/verify-routes.mjs` |
| Parent profiles | `npm run validate:content`, `npm run review:sheets`, `npm run review:seo` |
| Forms/API | `npm run test:forms`, `npm run check:buyer-flow`, `npm run review:crm-intake`, `npm run review:analytics` |
| SEO/routes | `npm run seo:crawler`, `npm run review:seo`, `node scripts/verify-routes.mjs` |
| Analytics/tracking | `npm run review:analytics`, `npm run test:forms`, `npm run check:buyer-flow` |
| Mobile/template UX | `npm run review:visual`, `npm run review:mobile-nav`, `npm run review:mobile-templates`, `npm run lint` |
| Pre-deploy confidence | `npm run publish:check` |

If a website content change touches source-of-truth sheets, run the appropriate sync/review process before calling it done:

```bash
npm run sync:puppies
npm run sync:litters
npm run sync:parents
npm run sync:previous-litters
npm run sync:waitlist
npm run review:sheets
npm run check:publish-ready
```

Only run the specific sync command for the data area that changed unless Adam approves a broader sync.

## Approval Rules

No approval needed for:

- reading repo files
- running local read-only checks
- generating local review docs
- recommending fixes
- local code changes Adam has requested, as long as they do not publish or mutate production systems

Approval required before:

- deploying or changing live public behavior
- syncing or mutating Google Sheets
- changing Google Drive folders/files
- changing Vercel settings, DNS, env vars, domains, or hosting settings
- submitting a live production form test row
- touching CRM, Breeding Ops, ads, payments, or customer communication systems
- making cross-app writes

## Issue Severity

Urgent:

- site down
- homepage unavailable
- apply/contact/guardian/stud forms broken
- available puppies missing or clearly wrong
- private CRM/Breeding Ops data exposed publicly
- sitemap/robots/canonical failure that blocks indexing
- broken deploy or route failure on major buyer pages

Recommended Fix:

- sheet drift
- media folder/photo mismatch
- mobile layout issue on key pages
- analytics attribution gap
- stale public availability copy
- broken non-critical internal links

Optional Improvement:

- copy refinement
- SEO polish
- image compression
- design polish
- expanded reporting
- better automation after the workflow is proven

## First Practical Implementation Step

Create one small wrapper script for the **Daily Light Check** before adding any scheduling:

```text
scripts/run-website-health-light.mjs
```

Recommended behavior:

1. Fetch `https://www.redranchdogs.com/`, `/puppies/available`, `/puppies/current-litters`, and `/apply`.
2. Confirm each returns a successful response.
3. Run `npm run agent:website-qa`, `npm run check:buyer-flow`, and `npm run test:forms`.
4. Write a short report to `docs/WEBSITE_HEALTH_LIGHT_REPORT.md`.
5. Exit non-zero only for urgent failures.

After that is stable, add:

```json
"health:daily": "node scripts/run-website-health-light.mjs",
"health:weekly": "npm run publish:check && npm run agent:website-qa && npm run review:visual"
```

Do not schedule the daily or weekly runs until Adam explicitly approves the automation schedule and destination for reports.

