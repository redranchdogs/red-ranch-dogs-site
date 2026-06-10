import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appPath = path.join(root, "src", "App.jsx");
const reportPath = path.join(root, "docs", "CONVERSION_ANALYTICS_REVIEW.md");
const appSource = fs.readFileSync(appPath, "utf8");

function unique(values) {
  return [...new Set(values)].sort((first, second) => first.localeCompare(second));
}

function matchAll(source, regex, group = 1) {
  return [...source.matchAll(regex)].map((match) => match[group]).filter(Boolean);
}

function sectionBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  if (startIndex === -1) return "";
  const endIndex = source.indexOf(end, startIndex);
  return endIndex === -1 ? source.slice(startIndex) : source.slice(startIndex, endIndex);
}

const navigationSection = sectionBetween(appSource, "function analyticsEventForHref", "function trackNavigationIntent");
const navigationEvents = unique(matchAll(navigationSection, /return "([^"]+)";/g));
const directEvents = unique(matchAll(appSource, /trackSiteEvent\("([^"]+)"/g));
const allEvents = unique([...navigationEvents, ...directEvents]);

const criticalEvents = [
  "cta_apply_click",
  "cta_text_click",
  "form_start",
  "form_submit_attempt",
  "form_submit_success",
  "form_submit_error",
  "view_available_puppies_click",
  "view_current_litters_click",
  "view_litter_click",
];

const missingCriticalEvents = criticalEvents.filter((eventName) => !allEvents.includes(eventName));
const actionPaths = [
  { action: "Apply CTA", expectedEvent: "cta_apply_click", path: "/apply", sourceOfTruth: "Lead Queue when the form submits" },
  { action: "Text Us tap", expectedEvent: "cta_text_click", path: "sms link", sourceOfTruth: "Phone/message history" },
  { action: "Available Puppies view", expectedEvent: "view_available_puppies_click", path: "/puppies/available", sourceOfTruth: "Vercel page view + CTA event" },
  { action: "Current Litters view", expectedEvent: "view_current_litters_click", path: "/puppies/current-litters", sourceOfTruth: "Vercel page view + CTA event" },
  { action: "Litter detail view", expectedEvent: "view_litter_click", path: "/litters/*", sourceOfTruth: "Vercel page view + CTA event" },
  { action: "Successful form", expectedEvent: "form_submit_success", path: "/api/forms", sourceOfTruth: "Website Leads + Lead Queue + submissionId" },
];

const eventRows = allEvents.map((eventName) => {
  const source = navigationEvents.includes(eventName) ? "Navigation click" : "Form lifecycle";
  const crmSignal = eventName === "form_submit_success" ? "Match to Lead Queue by submissionId" : "Behavior signal only";
  return `| \`${eventName}\` | ${source} | ${crmSignal} |`;
});

const actionRows = actionPaths.map((item) => (
  `| ${item.action} | \`${item.expectedEvent}\` | ${allEvents.includes(item.expectedEvent) ? "Tracked" : "Missing"} | ${item.path} | ${item.sourceOfTruth} |`
));

const attributionFields = [
  "landingPage",
  "referrer",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmContent",
  "utmTerm",
  "gclid",
  "gbraid",
  "wbraid",
  "firstLandingPage",
  "firstReferrer",
  "firstUtmSource",
  "firstUtmMedium",
  "firstUtmCampaign",
  "firstUtmContent",
  "firstUtmTerm",
  "firstGclid",
  "firstGbraid",
  "firstWbraid",
  "lastLandingPage",
  "lastReferrer",
  "lastUtmSource",
  "lastUtmMedium",
  "lastUtmCampaign",
  "lastUtmContent",
  "lastUtmTerm",
  "lastGclid",
  "lastGbraid",
  "lastWbraid"
];

const report = `# Conversion Analytics Review

This is the lightweight analytics contract for the public Red Ranch Dogs website. Vercel Web Analytics shows traffic and device trends, while the Google Sheets / CRM intake path remains the source of truth for actual leads.

## Current Tracked Events

| Event | Source | How to read it |
| --- | --- | --- |
${eventRows.join("\n")}

## Action Tracking Review

| Buyer action | Expected event | Status | Path | Source of truth |
| --- | --- | --- | --- | --- |
${actionRows.join("\n")}

## Attribution Contract

The website preserves first-touch and last-touch marketing attribution in first-party browser storage, then submits the captured fields with successful lead forms.

Tracked attribution fields:

${attributionFields.map((field) => `- \`${field}\``).join("\n")}

Google click IDs are stored as metadata only. Do not expose names, emails, phone numbers, message text, or private lead details through analytics events.

## First Live Readout

Use this as the first live analytics pass after the site has had a few real traffic days:

1. In Vercel Analytics, compare mobile, desktop, and tablet traffic for Home, Available Puppies, Current Litters, Apply, Contact, and litter detail pages.
2. Check whether Apply, Text Us, Current Litters, Available Puppies, and litter-detail clicks are visible as tracked events on the current Vercel plan.
3. Compare \`form_submit_success\` counts with rows added to Lead Queue for the same period.
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

- Treat \`form_submit_success\` as a helpful signal, but do not use analytics as the official lead record.
- Lead Queue should remain the CRM intake source until the CRM owns the form backend.
- If Vercel Analytics does not expose every custom event clearly on the current plan, continue using Lead Queue counts for conversion truth and analytics for visitor behavior.
`;

fs.writeFileSync(reportPath, report);

console.log(`Conversion analytics review written to ${path.relative(root, reportPath)}`);

if (missingCriticalEvents.length) {
  console.error(`Missing critical analytics events: ${missingCriticalEvents.join(", ")}`);
  process.exit(1);
}
