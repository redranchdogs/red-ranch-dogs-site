# Website Health Dashboard

Generated: 6/29/2026, 11:01:31 AM Central

Owner: **Red Ranch Dogs Website**

Permission level: **read-only reporting**

This dashboard summarizes existing website health reports and commands. It does not sync sheets, submit live forms, deploy, edit CRM, edit Breeding Ops, change Google Drive or Google Sheets, change DNS, change Vercel settings, change ads, change payments, or mutate production data.

Status: **PASS**

## Current Report Snapshot

| Area | Status | Last generated | Report exists | Command | Purpose |
| --- | --- | --- | --- | --- | --- |
| Daily Light Check | PASS | 6/28/2026, 2:54:55 PM Central | Yes | `npm run health:daily` | Obvious live-page, buyer-flow, form, and public-route issues. |
| Website QA Agent | PASS | 6/28/2026, 2:54:34 PM Central | Yes | `npm run agent:website-qa` | Read-only guardrail, public data, route, form, and ownership rollup. |
| SEO Metadata | PASS | 6/29/2026, 10:56:57 AM Central | Yes | `npm run review:seo` | Titles, descriptions, canonicals, heading structure, and JSON-LD presence. |
| AI Search | PASS | 6/29/2026, 10:55:41 AM Central | Yes | `npm run review:ai-search` | Crawler summary, entity clarity, structured-data markers, and AI-search readiness. |
| Sheet Sync Review | PASS | 6/27/2026, 10:59:56 AM Central | Yes | `npm run review:sheets` | Website Hub sheet alignment after source-of-truth content changes. |
| Public Safety | PASS | 6/23/2026, 3:02:00 PM Central | Yes | `npm run review:safety` | Public-data leak checks for private records, old pricing artifacts, and internal notes. |
| Deploy Package | PASS | 6/23/2026, 3:03:28 PM Central | Yes | `npm run review:deploy` | Pre-deploy package and public route readiness report. |

## Operating Modes

| Mode | Command | Use when | Notes |
| --- | --- | --- | --- |
| Daily Light Check | `npm run health:daily` | You want a low-noise daily pulse. | Catches obvious urgent issues only. |
| Weekly Full Health Check | `npm run health:weekly` | You want a deeper weekly pass or pre-review confidence. | Runs the publish gate plus QA/visual rollups. |
| After Major Change | `npm run health:change:*` | Puppy, litter, form, SEO, mobile, or predeploy changes just happened. | Pick the targeted command instead of running everything by habit. |

## Targeted After-Change Commands

| Command | Script |
| --- | --- |
| `npm run health:change:forms` | `npm run test:forms && npm run check:buyer-flow && npm run review:crm-intake && npm run review:analytics` |
| `npm run health:change:litters` | `npm run validate:content && npm run review:current-media && npm run review:sheets && npm run verify:routes` |
| `npm run health:change:mobile` | `npm run review:visual && npm run review:mobile-nav && npm run review:mobile-templates && npm run lint` |
| `npm run health:change:predeploy` | `npm run publish:check` |
| `npm run health:change:puppies` | `npm run validate:content && npm run check:buyer-flow && npm run review:current-media && npm run review:sheets && npm run check:publish-ready` |
| `npm run health:change:seo` | `npm run seo:crawler && npm run review:seo && npm run verify:routes` |

## Approval Boundaries

- Reporting and local checks can run without extra approval.
- Production deploys still require Adam's explicit approval and happen only by merging `codex/launch-candidate` into `main` and pushing.
- If website content touches puppy, litter, parent, previous-litter, or public-waitlist source-of-truth sheets, run the existing sync/review process and `npm run review:sheets` before calling the change done.
- Do not change CRM, Breeding Ops, Google Drive, Google Sheets, DNS, Vercel settings, env vars, ads, payments, or production data from this dashboard.

## Blockers

- None flagged.

## Recommended Next Use

1. Run `npm run health:dashboard` after weekly health checks or major website QA passes.
2. Read the dashboard first, then open the specific report whose status is not PASS.
3. Keep fixes as normal website-code changes; do not make the dashboard auto-fix production issues.

