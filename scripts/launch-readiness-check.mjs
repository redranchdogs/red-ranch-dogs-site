import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const blockers = [];
const warnings = [];

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function readJson(filePath) {
  return JSON.parse(read(filePath));
}

function loadLocalEnv() {
  const envPath = path.join(root, ".env.local");
  const values = {};

  if (!fs.existsSync(envPath)) return values;

  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;

      const [key, ...valueParts] = trimmed.split("=");
      values[key] = valueParts.join("=").trim();
    });

  return values;
}

function firstDefined(...values) {
  return values.find((value) => typeof value === "string" && value.trim());
}

function runCheck(label, command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    blockers.push(`${label} failed.\n${result.stdout}${result.stderr}`.trim());
    return;
  }

  console.log(result.stdout.trim());
}

function imageExists(imagePath) {
  if (!imagePath || !imagePath.startsWith("/")) return true;
  return fs.existsSync(path.join(root, "public", imagePath));
}

function isPublicRecord(item = {}) {
  const visibility = String(item.visibility || "public").trim().toLowerCase();
  return visibility !== "hidden" && visibility !== "private";
}

function collectImagePaths(value, results = []) {
  if (!value) return results;

  if (typeof value === "string") {
    if (value.startsWith("/images/")) results.push(value);
    return results;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectImagePaths(item, results));
    return results;
  }

  if (typeof value === "object") {
    Object.values(value).forEach((item) => collectImagePaths(item, results));
  }

  return results;
}

const localEnv = loadLocalEnv();
const formWebhook = firstDefined(process.env.FORM_WEBHOOK_URL, localEnv.FORM_WEBHOOK_URL);
const bridgeUrl = firstDefined(process.env.RED_RANCH_BRIDGE_URL, localEnv.RED_RANCH_BRIDGE_URL);
const bridgeSecret = firstDefined(process.env.RED_RANCH_BRIDGE_SECRET, localEnv.RED_RANCH_BRIDGE_SECRET);
const app = read("src/App.jsx");
const formsApi = read("api/forms.js");
const formsWebhookScript = read("scripts/google-apps-script.js");
const formsWebhookTest = read("scripts/test-form-webhook.mjs");
const websiteBridgeScript = read("scripts/website-bridge-apps-script.js");
const index = read("index.html");
const robots = read("public/robots.txt");
const sitemap = read("public/sitemap.xml");
const puppies = readJson("src/data/puppies.json");
const litters = readJson("src/data/litters.json");
const parents = readJson("src/data/parents.json");
const waitlist = readJson("src/data/waitlist.json");

runCheck("Route verification", process.execPath, ["scripts/verify-routes.mjs"]);
runCheck("Content validation", process.execPath, ["scripts/validate-content-data.mjs"]);
runCheck("Source-of-truth guardrails", process.execPath, ["scripts/check-source-of-truth.mjs"]);
runCheck("Buyer-flow QA", process.execPath, ["scripts/check-buyer-flow.mjs"]);

const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const activePuppies = puppies.filter(isPublicRecord);
const availablePuppies = activePuppies.filter((puppy) => puppy.status === "Available");
const publicLitters = litters.filter(isPublicRecord);
const currentLitters = publicLitters.filter((litter) => String(litter.status || "").toLowerCase().includes("current"));
const upcomingLitters = litters.filter((litter) => {
  const status = String(litter.status || "").toLowerCase();
  return isPublicRecord(litter) && (status.includes("upcoming") || status.includes("planned"));
});
const publicParents = parents.filter(isPublicRecord);
const publicWaitlistRows = Array.isArray(waitlist) ? waitlist : waitlist.publicRows || [];
const imagePaths = [
  ...collectImagePaths(activePuppies),
  ...collectImagePaths(publicLitters),
  ...collectImagePaths(publicParents),
];
const missingImages = [...new Set(imagePaths.filter((imagePath) => !imageExists(imagePath)))];
const requiredBuyerRoutes = [
  "/puppies/available",
  "/puppies/current-litters",
  "/puppies/upcoming-litters",
  "/puppies/previous-litters",
  "/puppies/goldendoodle-puppies",
  "/puppies/cavapoo-puppies",
  "/puppies/bernedoodle-puppies",
  "/apply",
  "/process/how-it-works",
  "/process/pricing",
  "/process/application-and-waitlist",
  "/process/waitlist",
  "/process/faq",
  "/stud-services/our-studs",
  "/guardian-program/application",
  "/contact"
];

function hasSitemapRoute(route) {
  return sitemapUrls.some((url) => url.endsWith(route));
}

function humanLabel(record, fallback) {
  return record.name || record.litterName || record.title || record.slug || fallback;
}

if (!index.includes('name="application-name"')) {
  warnings.push("index.html is missing the application-name meta tag.");
}

if (!index.includes('name="author"')) {
  warnings.push("index.html is missing the author meta tag.");
}

if (!index.includes('name="creator"')) {
  warnings.push("index.html is missing the creator meta tag.");
}

if (!index.includes('name="geo.region"') || !index.includes('name="geo.placename"')) {
  warnings.push("index.html is missing local geo meta tags for Salado, Texas.");
}

if (index.includes("squarespace-cdn.com") || index.includes("static1.squarespace.com")) {
  warnings.push("index.html still references Squarespace-hosted favicon/preconnect assets.");
}

if (!index.includes('property="og:image"') || !index.includes('name="twitter:image"')) {
  warnings.push("index.html is missing static social image fallbacks for crawlers.");
}

if (!index.includes('property="og:image:alt"') || !index.includes('name="twitter:image:alt"')) {
  warnings.push("index.html is missing static social image alt text fallbacks.");
}

if (!app.includes("SearchAction")) {
  warnings.push("Structured data is missing WebSite SearchAction.");
}

if (!app.includes("FAQPage")) {
  warnings.push("Structured data is missing FAQPage support for FAQ routes.");
}

if (!app.includes("ItemList")) {
  warnings.push("Structured data is missing ItemList support for puppy, litter, and parent list pages.");
}

if (!app.includes("author:")) {
  warnings.push("Structured data is missing WebPage author attribution.");
}

if (!app.includes("socialProfiles") || !app.includes("brand.googleReviews")) {
  warnings.push("Structured data is missing social/review profile authority links.");
}

if (!app.includes("employee: teamProfiles.map(teamPersonSchema)")) {
  warnings.push("Structured data is missing team/person authority entries.");
}

if (!app.includes('meta[property="og:locale"]')) {
  warnings.push("Dynamic SEO is missing og:locale.");
}

if (!app.includes('meta[name="geo.region"]') || !app.includes('meta[name="geo.placename"]')) {
  warnings.push("Dynamic SEO is missing local geo meta tags.");
}

if (!app.includes('meta[property="og:image:secure_url"]')) {
  warnings.push("Dynamic SEO is missing og:image:secure_url.");
}

["leadRoutingByForm", "leadType", "routingBucket", "replyPriority", "recommendedNextStep"].forEach((marker) => {
  if (!formsApi.includes(marker)) {
    blockers.push(`Form API is missing launch routing metadata marker: ${marker}.`);
  }
});

["Lead Type", "Routing Bucket", "Reply Priority", "Recommended Next Step", "Lead Summary"].forEach((marker) => {
  if (!formsWebhookScript.includes(marker)) {
    blockers.push(`Google Apps Script form logger is missing sheet routing header: ${marker}.`);
  }
});

["MailApp.sendEmail", "NOTIFY_EMAIL", "Website Leads"].forEach((marker) => {
  if (!websiteBridgeScript.includes(marker)) {
    blockers.push(`Website bridge is missing notification support marker: ${marker}.`);
  }
});

["leadRoutingByForm", "withRouting", "recommendedNextStep", "leadSummary"].forEach((marker) => {
  if (!formsWebhookTest.includes(marker)) {
    blockers.push(`Live form webhook smoke test is missing routing payload marker: ${marker}.`);
  }
});

requiredBuyerRoutes.forEach((route) => {
  if (!hasSitemapRoute(route)) {
    blockers.push(`Sitemap is missing buyer route: ${route}.`);
  }
});

[
  ...activePuppies.map((puppy) => ({
    type: "Puppy",
    label: humanLabel(puppy, "unnamed puppy"),
    route: `/puppies/${puppy.slug}`,
  })),
  ...publicLitters.map((litter) => ({
    type: "Litter",
    label: humanLabel(litter, "unnamed litter"),
    route: `/litters/${litter.slug}`,
  })),
  ...publicParents.map((parent) => ({
    type: "Parent",
    label: humanLabel(parent, "unnamed parent"),
    route: `/parents/${parent.slug}`,
  })),
].forEach((record) => {
  if (!record.route || record.route.endsWith("/undefined")) {
    blockers.push(`${record.type} "${record.label}" is missing a slug for its detail route.`);
    return;
  }

  if (!hasSitemapRoute(record.route)) {
    blockers.push(`${record.type} "${record.label}" is missing sitemap route: ${record.route}.`);
  }
});

availablePuppies.forEach((puppy) => {
  const missingFields = ["mainPhoto", "personalityNote", "availabilityNote", "price"].filter(
    (field) => !puppy[field]
  );

  if (missingFields.length > 0) {
    blockers.push(
      `Available puppy "${humanLabel(puppy, "unnamed puppy")}" is missing launch-facing fields: ${missingFields.join(", ")}.`
    );
  }
});

currentLitters.forEach((litter) => {
  const litterPuppies = activePuppies.filter((puppy) => puppy.litterSlug === litter.slug);

  if (litterPuppies.length === 0) {
    warnings.push(`Current litter "${humanLabel(litter, "unnamed litter")}" has no public puppy records yet.`);
  }

  if (!Array.isArray(litter.weeklyUpdateGallery) || litter.weeklyUpdateGallery.length === 0) {
    warnings.push(`Current litter "${humanLabel(litter, "unnamed litter")}" has no weekly update gallery images yet.`);
  }
});

if (!robots.includes("https://www.redranchdogs.com/sitemap.xml")) {
  blockers.push("robots.txt does not reference the production sitemap URL.");
}

if (!bridgeUrl || !bridgeSecret) {
  blockers.push("RED_RANCH_BRIDGE_URL and RED_RANCH_BRIDGE_SECRET are not both configured. Live form submissions would not reach the sheet/email workflow.");
}

if (!formWebhook) {
  warnings.push("FORM_WEBHOOK_URL is not configured. That is acceptable if the bridge is deployed with notification support, but it removes the legacy fallback.");
}

if (missingImages.length > 0) {
  blockers.push(`Missing image files referenced by structured data:\n${missingImages.join("\n")}`);
}

console.log("");
console.log("Launch readiness snapshot");
console.log(`- Sitemap URLs: ${sitemapUrls.length}`);
console.log(`- Public puppy records: ${activePuppies.length}`);
console.log(`- Available puppies: ${availablePuppies.length}`);
console.log(`- Current litters: ${currentLitters.length}`);
console.log(`- Upcoming/planned litters: ${upcomingLitters.length}`);
console.log(`- Public parent dogs: ${publicParents.length}`);
console.log(`- Public waitlist rows: ${publicWaitlistRows.length}`);
console.log(`- Image references checked: ${new Set(imagePaths).size}`);
console.log(`- Dynamic puppy routes checked: ${activePuppies.length}`);
console.log(`- Dynamic litter routes checked: ${publicLitters.length}`);
console.log(`- Dynamic parent routes checked: ${publicParents.length}`);
console.log(`- Form webhook configured: ${formWebhook ? "yes" : "no"}`);
console.log("- Form lead routing metadata: yes");
console.log(`- Sheet bridge configured: ${bridgeUrl && bridgeSecret ? "yes" : "no"}`);
console.log("- Bridge notification support: yes");

if (warnings.length > 0) {
  console.log("");
  console.log("Warnings");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (blockers.length > 0) {
  console.error("");
  console.error("Launch blockers");
  blockers.forEach((blocker) => console.error(`- ${blocker}`));
  process.exit(1);
}

console.log("");
console.log("Launch readiness checks passed.");
