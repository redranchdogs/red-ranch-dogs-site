# Red Ranch Dogs Website Agent Instructions

This is the public Red Ranch Dogs website project.

Use the shared Red Ranch ecosystem and agent operating model:

- `/Users/adamdietlein/Documents/New project/red-ranch-ecosystem-architect/RED_RANCH_AGENT_OPERATING_MODEL.md`
- `/Users/adamdietlein/Documents/New project/red-ranch-ecosystem-architect/AGENT_REGISTRY.md`
- `/Users/adamdietlein/Documents/New project/red-ranch-ecosystem-architect/DATA_ACCESS_MATRIX.md`
- `/Users/adamdietlein/Documents/New project/red-ranch-ecosystem-architect/AUTOMATION_APPROVAL_MATRIX.md`
- `/Users/adamdietlein/Documents/New project/red-ranch-ecosystem-architect/WEEKLY_ECOSYSTEM_BRIEF_SPEC.md`
- `/Users/adamdietlein/Documents/New project/red-ranch-ecosystem-architect/INFRASTRUCTURE_AND_OPERATIONS_BASELINE.md`
- `/Users/adamdietlein/Documents/New project/red-ranch-ecosystem-architect/BROWSER_TOOLING_POLICY.md`
- `/Users/adamdietlein/.codex/skills/red-ranch-ecosystem/SKILL.md`

## Approval Friction

Do not ask for repeated approval during normal local website development once Adam has asked for the task. Safe local file reads, code edits, local tests/builds, and preview checks can proceed to a natural checkpoint.

Still ask for explicit approval before production deploys, DNS or GoDaddy changes, Vercel settings, env vars/secrets, source sheet mutations, Google Drive changes, payment/email/ad settings, destructive actions, or changes that affect live website behavior outside the requested scope.

Browser tooling: use the Codex in-app browser for local/public website QA. Use Chrome with the Codex Chrome extension for logged-in Vercel, GoDaddy, Google, Meta, Amazon, or other account dashboards.

## Ownership

The website owns:

- public marketing pages
- public forms
- approved public puppy/litter/parent display
- landing page implementation
- website deployment behavior

The website should not own:

- CRM lead state
- family records
- applications beyond form submission
- waitlist decisions
- payments
- puppy-family matching
- Breeding Ops barn records

## Agent Rules

Website agents should start read-only.

Allowed early agent work:

- page QA
- form checks
- broken link checks
- sitemap/canonical/redirect checks
- source sheet sync status checks
- analytics implementation checks
- UTM/source attribution checks through website forms
- landing page recommendations

Do not let an agent edit the live website, source sheets, DNS, domains, Vercel aliases, production env vars, or tracking settings without explicit approval.

Marketing Engine may recommend website changes. This website project implements approved changes.

Analytics boundary:

- This website currently uses Vercel Web Analytics.
- Website form submissions include UTM/source fields when present.
- Website owns analytics/tracking implementation.
- Marketing Engine owns analytics interpretation and campaign reporting.
- CRM owns lead outcomes and lead-quality attribution.
- Do not treat Vercel Analytics events as lead records.
