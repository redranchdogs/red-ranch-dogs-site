# Website Health Light Report

Generated: 6/28/2026, 2:54:55 PM Central

Status: **PASS**

Permission level: **read-only check/report**

This Daily Light Check pings public website pages and runs existing local website QA commands. It does not sync sheets, submit live forms, deploy, change production data, or touch CRM, Breeding Ops, Google Drive, DNS, env vars, ads, or payments.

## Live Page Pings

Base URL: `https://www.redranchdogs.com`

| Route | Status | Duration |
| --- | --- | ---: |
| / | PASS 200 | 0.1s |
| /puppies/available | PASS 200 | 0.1s |
| /puppies/current-litters | PASS 200 | 0.0s |
| /apply | PASS 200 | 0.0s |

## Local Checks

| Check | Status | Duration | Command |
| --- | --- | ---: | --- |
| Website QA agent rollup | PASS | 0.2s | `npm run agent:website-qa` |
| Buyer-flow guardrails | PASS | 0.1s | `npm run check:buyer-flow` |
| Form API handler tests | PASS | 0.1s | `npm run test:forms` |
| Playwright public route smoke | PASS | 20.8s | `npm run check:public-routes` |

## Urgent Issues

- None flagged.

## Watch Items

- None flagged.

## Notes

- Daily Light Check is intentionally small and urgent-issue focused.
- Use `npm run health:weekly` for the deeper full check.
- Use the targeted `health:change:*` commands after major website changes.

