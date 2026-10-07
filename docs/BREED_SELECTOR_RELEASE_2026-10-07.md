# Breed selector clarity release, October 7, 2026

Adam selected displayed option one, requested removal of the helper sentence, and explicitly authorized build and deployment. The revised mock was shown before implementation.

Base: freshly fetched `origin/main` 4dd6539 in the existing clean isolated checkout. Branch: `codex/website-breed-selector-20261007`. Shared dirty work and the separate 4174 prototype are preserved.

Implementation commit: `f02dd67ac496bed1cee694c7d10c842174b88f8a`.

Scope: one shared Choose a breed heading and three outlined/filled breed buttons across Available Now, Current Litters and Upcoming Litters. No helper sentence. Individual empty results offer two direct other-breed actions and a breed-specific future link. All-empty Available/Current results preserve their global wording and existing exploration actions. URL selection, keyboard focus and history are preserved. The existing smoke test expectations reflect the approved wording.

No puppy/litter/source JSON, forms, tracking, dependencies, image assets, Sheet records, CRM/Barn state or hosting settings changed.

Validation: publish chain through lint passed; routes, build, bundle budget, public route smoke (26 routes x two viewports plus mobile menu), SEO, deploy-package, visual review, mobile-nav audit and application journey passed independently after the Sheet gate. Browser verifies 320/390/768/1440px without clipped names or overflow, 52px targets, both cross-breed routes, ArrowRight focus, Back restoration, all-empty states, loaded photos and development-only populated fixture. `design-qa.md` records the revised visual comparison and fixes.

Known unchanged limitation: authenticated read-only `review:sheets` still reports exactly the prior Kylie litter theme mismatch, Website blank versus Sheet `Moonlit Manor`. `check:publish-ready` therefore remains failed. This UI-only change does not alter that data or claim the complete aggregate publish gate passed. No Sheet sync or write was performed.

Release through scoped candidate push, merge `origin/codex/launch-candidate` into a clean branch based on `origin/main`, then push `main`. Deployment and production readback receipt saved under the task's `website-ui-audits/2026-10-07/breed-selector` folder after completion.
