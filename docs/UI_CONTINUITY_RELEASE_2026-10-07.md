# Puppy finder UI continuity release, October 7, 2026

Adam authorized building, fixing and deploying the bounded continuity pass. Implementation starts at `origin/main` / `origin/codex/launch-candidate` commit `4c50ece` in an isolated checkout; all pre-existing dirty work is preserved.

Code commit: `4cf86fc`. Only `src/App.jsx` and `src/styles.css` changed: equivalent exploration actions now share the existing primary button style and dimensions; the availability message has a quiet bordered panel and weight 700; the exploration heading is smaller; main empty-state actions match; the waitlist supporting sentence reflects whether current litters exist. Destination URLs, source data, forms, tracking and images are unchanged.

Verification: lint, content validation, freshness/current-media/image-budget, source/buyer-flow/form contracts, GA4 contract, public safety, mocked form/security tests, routes, build, bundle budget, public route smoke (26 routes across mobile/desktop), SEO, deploy-package and visual review passed. Manual in-app browser checks verified loaded images, both action destinations and matching 52px buttons at 320/390/768/1024/1440px without horizontal overflow.

The aggregate `publish:check` stopped at the sheet alignment gate. A subsequent authenticated read-only sheet comparison found one pre-existing mismatch: `kylie-ranger-late-summer-2026.theme` is blank in the Website source and `Moonlit Manor` in the Sheet. No structured data changed in this patch and no Sheet write was made. `check:publish-ready` therefore remains failed; this UI-only release records the unchanged drift explicitly rather than altering unrelated business data or claiming the gate passed. All subsequent publish-chain checks were run independently as listed above.

The originally observed `4174` preview is a separate local prototype (`Documents/Codex/2026-09-30/task-17/puppy-home`) that does not serve the source image assets; photos load in the canonical Website checkout. Screenshots are saved under `/Users/adamdietlein/Documents/New project/website-ui-audits/2026-10-07/06-fixed-mobile.png` and `07-fixed-desktop.png`.

Release route: push the scoped branch tip to `codex/launch-candidate`, then merge that remote candidate into a clean branch based on `origin/main` and push the merge to `main`. Production confirmation will be recorded separately after Vercel completes.
