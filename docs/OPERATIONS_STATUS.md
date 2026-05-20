# Operations Status
Generated: 5/20/2026, 2:59:31 PM Central
Overall status: **PASS**
## Bridge
Status: **PASS**
Version: 3.2.0
Message: Bridge is reachable and Website Submissions tabs are readable.
| Sheet tab | Status | Rows | Columns |
| --- | --- | ---: | ---: |
| Lead Dashboard | PASS | 18 | 4 |
| Lead Queue | PASS | 33 | 18 |
| Reply Templates | PASS | 8 | 6 |
| Workflow Notes | PASS | 9 | 4 |
| Closed Leads | PASS | 1 | 19 |
| Website Leads | PASS | 33 | 57 |
## Checks
| Check | Status | Duration | Command |
| --- | --- | ---: | --- |
| Apps Script bridge syntax | PASS | 0.0s | `/Users/adamdietlein/.local/share/fnm/node-versions/v24.14.0/installation/bin/node --check scripts/website-bridge-apps-script.js` |
| Lead workflow packet | PASS | 8.2s | `npm run leads:packet` |
| Weekly workflow report | PASS | 0.1s | `npm run ops:workflow` |
| Drive folder plan | PASS | 0.1s | `npm run drive:folders` |
| Business accuracy review | PASS | 0.1s | `npm run review:business` |
| Page review packet | PASS | 0.1s | `npm run review:pages` |
| Image asset review | PASS | 0.1s | `npm run review:images` |
| Public safety review | PASS | 0.1s | `npm run review:safety` |
| Conversion analytics review | PASS | 0.1s | `npm run review:analytics` |
| CRM intake alignment review | PASS | 0.1s | `npm run review:crm-intake` |
| Current litter clarity review | PASS | 0.1s | `npm run review:litter-clarity` |
| Mobile CTA review | PASS | 0.1s | `npm run review:mobile-ctas` |
| CRM integration checklist | PASS | 0.1s | `npm run review:crm-integration` |
| Photo day rehearsal | PASS | 0.1s | `npm run photos:rehearsal` |
| Photo import checklist | PASS | 0.1s | `npm run photos:import-checklist` |
| Sheet sync review | PASS | 11.4s | `npm run review:sheets` |
| Content publish readiness | PASS | 0.1s | `npm run check:publish-ready` |
| Form API handler tests | PASS | 0.1s | `npm run test:forms` |
| Route verification | PASS | 0.1s | `npm run verify:routes` |
| Content validation | PASS | 0.1s | `npm run validate:content` |
| Source-of-truth guardrails | PASS | 0.1s | `npm run check:source` |
| Buyer-flow guardrails | PASS | 0.1s | `npm run check:buyer-flow` |
| Lint | PASS | 0.9s | `npm run lint` |
| Production build | PASS | 0.7s | `npm run build` |
