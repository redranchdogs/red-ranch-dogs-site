# Website quality pass, October 22, 2026

Status: prepared and locally verified; production release decision pending.

## Baseline

Production and remote main verified at `806f1bd65b88d617c1b4e9d9582a2948ffa19e24`, Vercel `dpl_48YzXPeeXV8FrAdxH3ixxkT3uHtd` READY with both public domains. The original main CI run `39713852548` completed successfully. Work continues on `codex/website-quality-20261022` in `/tmp/rrd-louisa-reserved-20261021`. The original dirty checkout is preserved; `/tmp/rrd-weekly-release-20261014` no longer exists. Pending outside-stud/Sylvee work at `/tmp/rrd-weekly-media-20261020` remains separate and unpublished.

## Corrected defects

1. Live reproduction: clicking Ask about Atticus on Beatrix's litter changed the URL but left the inquiry set to the litter in general. The inquiry now responds to query navigation and Back. Changing puppy resets only the selection, preserving typed contact details and the question.
2. The mobile litter Apply button previously linked to generic `/apply`. It now carries the litter identifier, matching the primary application button. Archived-litter behavior is preserved.
3. Successful general and breed-only applications were omitted from `puppy_buyer_application_success`. Every successful application now emits it once, with optional non-private identifiers. Failure and duplicate attempts do not count as successful conversions.
4. The mobile-template audit used obsolete empty-state and parent-template selectors, causing a timeout. Updated assertions still require the correct visible CTA/destination, public record links, facts and parent pairing.

## Verification

- Baseline full `health:change:ci` passed.
- Changed application journey passed using intercepted local submissions: Atticus to Twain to Back, draft preservation, mobile litter context, general/breed conversions, failed delivery, loading, confirmed receipt, explicit openness choice, duplicate prevention.
- Form contract, GA4 privacy/adapter contract, form API/security tests, lint, build, and bundle budget passed.
- Public route sweep passed: 48 routes at 390px mobile and 1440px desktop. Mobile navigation passed; all 10 mobile template checks passed after repairing the stale audit assertions.
- In-app browser confirmed selected puppy, litter-aware sticky application link, and no document overflow at 390px. Existing Beatrix and Enzo parent template retained.
- No live form submitted. No source JSON, reservation, pricing, Sheet, Drive, CRM or Breeding Ops changes. Available roster remains Hugo Poe plus Atticus, Twain, Edith, Dickens, Austen and Brontë.

Local preview: `http://localhost:5200/litters/beatrix-enzo-planned-2026?interest=twain#beatrix-inquiry`.

Production forms and analytics changes require the scoped release checkpoint under the current website instructions. The unrelated outside-stud/Sylvee source Sheet decision remains separate.
