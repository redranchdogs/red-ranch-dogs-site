# Guardian Opportunities Source Of Truth

The public Guardian Opportunities page is a website display surface. It should show only approved, public-facing guardian openings.

## Source Of Truth

Current public guardian opportunities are controlled in `src/data/puppies.json` with the `guardianOpportunity` object on a puppy record.

The page at `/guardian-program/current-guardian-opportunities` lists public puppies where:

- `visibility` is public through the normal website data rules.
- `guardianOpportunity.status` is `"open"`.

Normal puppy availability status is separate. A puppy can have `status: "Reserved"` because Red Ranch Dogs is keeping her for the program, while still having `guardianOpportunity.status: "open"` if the guardian family placement is pending.

## Status Rules

- Use `guardianOpportunity.status: "open"` only when the puppy should appear on the public Guardian Opportunities page.
- Use `guardianOpportunity.status: "closed"` when a guardian family has been selected, the opportunity is reserved, or the opening should no longer be public.
- If a puppy is no longer a guardian candidate at all, remove the `guardianOpportunity` object or keep it closed with a short `closedReason`.

## Update Process

1. Confirm the public display decision with Adam.
2. Update the puppy record in `src/data/puppies.json`.
3. For an open opportunity, include:
   - `status`
   - `badge`
   - `programRole`
   - `placementStatus`
   - `summary`
   - `bestFit`
   - optional `sortOrder`
4. For a reserved or selected guardian opportunity, set `guardianOpportunity.status` to `"closed"` and add `placementStatus` or `closedReason` when useful.
5. Run `npm run validate:content`, `npm run check:buyer-flow`, `npm run lint`, and `npm run build`.
6. Browser-check `/guardian-program/current-guardian-opportunities` on desktop and mobile before deploying.

## Ownership Boundary

The website owns the public display. CRM should own guardian-family applications, follow-up, agreements, and communication history. Breeding Ops should own dog-care and breeding logistics after an actual guardian dog handoff exists.

