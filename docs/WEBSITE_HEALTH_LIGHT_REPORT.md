# Website Health Light Report

Generated: 10/19/2026, 6:19:49 PM Central

Status: **PASS**

Permission level: **read-only check/report**

This Daily Light Check pings public website pages and runs existing local website QA commands. It does not sync sheets, submit live forms, deploy, change production data, or touch CRM, Breeding Ops, Google Drive, DNS, env vars, ads, or payments.

## Live Page Pings

Base URL: `https://www.redranchdogs.com`

| Route | Status | Duration |
| --- | --- | ---: |
| / | PASS 200 | 0.2s |
| /puppies/available | PASS 200 | 0.1s |
| /puppies/current-litters | PASS 200 | 0.1s |
| /apply | PASS 200 | 0.1s |

## Local Checks

| Check | Status | Duration | Command |
| --- | --- | ---: | --- |
| Source-of-truth guardrails | PASS | 0.1s | `npm run check:source` |
| Route and redirect verification | PASS | 0.1s | `npm run verify:routes` |
| Website QA agent rollup | FAIL | 0.1s | `npm run agent:website-qa` |
| Buyer-flow guardrails | PASS | 0.1s | `npm run check:buyer-flow` |
| Form API handler tests | PASS | 0.1s | `npm run test:forms` |
| Playwright public route smoke | PASS | 26.1s | `npm run check:public-routes` |

## Urgent Issues

- None flagged.

## Watch Items

- Website QA agent rollup: > red-ranch-dogs-site@0.1.0 agent:website-qa
> node scripts/generate-website-qa-agent-report.mjs

Website QA Agent report written to docs/WEBSITE_QA_AGENT_REPORT.md
Status: FAIL
- Agent Registry does not include Website QA Agent.
- Data Access Matrix does not identify website public-content ownership.
- Sitemap routes missing from known app/data routes: /litters/beatrix-enzo-planned-2026/past-puppies, /litters/reece-wyatt-summer-2026/past-puppies
- Internal links missing routes or redirects: /agreements/red-ranch-dogs-puppy-purchase-agreement-2026-09-17.pdf

## Notes

- Daily Light Check is intentionally small and urgent-issue focused.
- Use `npm run health:weekly` for the deeper full check.
- Use the targeted `health:change:*` commands after major website changes.

