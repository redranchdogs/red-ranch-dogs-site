# Conversion Analytics Review

This is the lightweight analytics contract for the public Red Ranch Dogs website. Vercel Web Analytics shows traffic and device trends, while the Google Sheets / CRM intake path remains the source of truth for actual leads.

## Current Tracked Events

| Event | Source | How to read it |
| --- | --- | --- |
| `cta_apply_click` | Navigation click | Behavior signal only |
| `cta_call_click` | Navigation click | Behavior signal only |
| `cta_email_click` | Navigation click | Behavior signal only |
| `cta_text_click` | Navigation click | Behavior signal only |
| `form_start` | Form lifecycle | Behavior signal only |
| `form_submit_attempt` | Form lifecycle | Behavior signal only |
| `form_submit_error` | Form lifecycle | Behavior signal only |
| `form_submit_success` | Form lifecycle | Match to Lead Queue by submissionId |
| `form_validation_error` | Form lifecycle | Behavior signal only |
| `social_google_reviews_click` | Navigation click | Behavior signal only |
| `social_instagram_click` | Navigation click | Behavior signal only |
| `view_application_waitlist_click` | Navigation click | Behavior signal only |
| `view_available_puppies_click` | Navigation click | Behavior signal only |
| `view_breed_page_click` | Navigation click | Behavior signal only |
| `view_current_litters_click` | Navigation click | Behavior signal only |
| `view_guardian_program_click` | Navigation click | Behavior signal only |
| `view_litter_click` | Navigation click | Behavior signal only |
| `view_parent_click` | Navigation click | Behavior signal only |
| `view_pickup_delivery_click` | Navigation click | Behavior signal only |
| `view_pricing_click` | Navigation click | Behavior signal only |
| `view_process_click` | Navigation click | Behavior signal only |
| `view_puppy_or_breed_click` | Navigation click | Behavior signal only |
| `view_stud_services_click` | Navigation click | Behavior signal only |
| `view_upcoming_litters_click` | Navigation click | Behavior signal only |

## Action Tracking Review

| Buyer action | Expected event | Status | Path | Source of truth |
| --- | --- | --- | --- | --- |
| Apply CTA | `cta_apply_click` | Tracked | /apply | Lead Queue when the form submits |
| Text Us tap | `cta_text_click` | Tracked | sms link | Phone/message history |
| Available Puppies view | `view_available_puppies_click` | Tracked | /puppies/available | Vercel page view + CTA event |
| Current Litters view | `view_current_litters_click` | Tracked | /puppies/current-litters | Vercel page view + CTA event |
| Litter detail view | `view_litter_click` | Tracked | /litters/* | Vercel page view + CTA event |
| Successful form | `form_submit_success` | Tracked | /api/forms | Website Leads + Lead Queue + submissionId |

## Attribution Contract

The website preserves first-touch and last-touch marketing attribution in first-party browser storage, then submits the captured fields with successful lead forms.

Tracked attribution fields:

- `landingPage`
- `referrer`
- `utmSource`
- `utmMedium`
- `utmCampaign`
- `utmContent`
- `utmTerm`
- `gclid`
- `gbraid`
- `wbraid`
- `firstLandingPage`
- `firstReferrer`
- `firstUtmSource`
- `firstUtmMedium`
- `firstUtmCampaign`
- `firstUtmContent`
- `firstUtmTerm`
- `firstGclid`
- `firstGbraid`
- `firstWbraid`
- `lastLandingPage`
- `lastReferrer`
- `lastUtmSource`
- `lastUtmMedium`
- `lastUtmCampaign`
- `lastUtmContent`
- `lastUtmTerm`
- `lastGclid`
- `lastGbraid`
- `lastWbraid`

Google click IDs are stored as metadata only. Do not expose names, emails, phone numbers, message text, or private lead details through analytics events.

## First Live Readout

Use this as the first live analytics pass after the site has had a few real traffic days:

1. In Vercel Analytics, compare mobile, desktop, and tablet traffic for Home, Available Puppies, Current Litters, Apply, Contact, and litter detail pages.
2. Check whether Apply, Text Us, Current Litters, Available Puppies, and litter-detail clicks are visible as tracked events on the current Vercel plan.
3. Compare `form_submit_success` counts with rows added to Lead Queue for the same period.
4. If page views are high but form starts are low, review that page for CTA placement and clarity.
5. If form starts are high but successful submissions are low, review form validation, field burden, and error messaging before changing the CRM.

## Conversion Questions To Review Weekly

1. How many visitors reached Available Puppies, Current Litters, Apply, Contact, Guardian Application, and Stud Services?
2. How many form starts became successful submissions?
3. Which CTA paths are producing real rows in Lead Queue?
4. Are mobile visitors tapping Apply, Text Us, or View Current Litters from the expected pages?
5. Do any popular pages have traffic but no matching lead activity?

## Source Of Truth

- Vercel Analytics: page views, referrers, device and visitor behavior, and supported custom events.
- Website Leads: immutable raw submission archive.
- Lead Queue: daily working inbox and first CRM handoff point.
- Submission ID: stable join key between website submission, Lead Queue, email notification, and future CRM record.

## Notes For The CRM Build

- Treat `form_submit_success` as a helpful signal, but do not use analytics as the official lead record.
- Lead Queue should remain the CRM intake source until the CRM owns the form backend.
- If Vercel Analytics does not expose every custom event clearly on the current plan, continue using Lead Queue counts for conversion truth and analytics for visitor behavior.
