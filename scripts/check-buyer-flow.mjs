import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const blockers = [];
const warnings = [];

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function readJson(filePath) {
  return JSON.parse(read(filePath));
}

function isPublicRecord(item = {}) {
  const visibility = String(item.visibility || "public").trim().toLowerCase();
  return visibility !== "hidden" && visibility !== "private";
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function sitemapRoutes(sitemap) {
  return [...sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((match) => match[1] || "/");
}

function firstDateValue(value = "") {
  const text = String(value || "");
  const monthMap = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11
  };
  const match = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:-\d{1,2})?,?\s*(\d{4})?/i
  );

  if (!match) return Number.POSITIVE_INFINITY;

  const month = monthMap[match[1].toLowerCase()];
  const day = Number(match[2]);
  const year = Number(match[3] || "2026");

  return new Date(year, month, day).getTime();
}

function listLabels(items) {
  return items.map((item) => item.litterName || item.name || item.slug).join(", ");
}

const app = read("src/App.jsx");
const siteData = read("src/data/siteData.js");
const formsApi = read("api/forms.js");
const index = read("index.html");
const robots = read("public/robots.txt");
const sitemap = read("public/sitemap.xml");
const packageJson = readJson("package.json");
const puppies = readJson("src/data/puppies.json");
const litters = readJson("src/data/litters.json");
const parents = readJson("src/data/parents.json");
const routes = sitemapRoutes(sitemap);

const publicPuppies = puppies.filter(isPublicRecord);
const availablePuppies = publicPuppies.filter((puppy) => normalize(puppy.status) === "available");
const publicLitters = litters.filter(isPublicRecord);
const currentLitters = publicLitters
  .filter((litter) => normalize(litter.status).includes("current"))
  .sort((first, second) => firstDateValue(first.goHomeDate || first.goHome) - firstDateValue(second.goHomeDate || second.goHome));
const publicParents = parents.filter(isPublicRecord);
const requiredBuyerRoutes = [
  "/",
  "/puppies/available",
  "/puppies/current-litters",
  "/puppies/upcoming-litters",
  "/puppies/goldendoodle-puppies",
  "/puppies/cavapoo-puppies",
  "/puppies/bernedoodle-puppies",
  "/apply",
  "/process/how-it-works",
  "/process/pricing",
  "/process/application-and-waitlist",
  "/process/waitlist",
  "/process/faq",
  "/process/pickup-and-delivery",
  "/stud-services/our-studs",
  "/guardian-program/application",
  "/contact"
];
const disallowedPublicRoutes = ["/stud-services/shipping-and-collection-info"];
const expectedApiFormTypes = ["application", "contact", "guardian", "newsletter", "stud", "waitlist"];
const expectedRenderedFormTypes = ["application", "contact", "guardian", "newsletter", "stud"];
const requiredSeoMarkers = [
  'name="author"',
  'name="creator"',
  'name="geo.region"',
  'name="geo.placename"',
  'property="og:image"',
  'name="twitter:image"'
];

requiredBuyerRoutes.forEach((route) => {
  if (!routes.includes(route)) {
    blockers.push(`Sitemap is missing buyer journey route: ${route}`);
  }
});

disallowedPublicRoutes.forEach((route) => {
  if (routes.includes(route)) {
    blockers.push(`Removed page is still public in the sitemap: ${route}`);
  }
});

if (!robots.includes("https://www.redranchdogs.com/sitemap.xml")) {
  blockers.push("robots.txt does not point crawlers to the production sitemap.");
}

const primaryNavBlock = app.match(/const primaryNav = \[[\s\S]*?\n\];/)?.[0] || "";
const legacyPublicRoutes = [
  "/available-puppies",
  "/current-litters",
  "/upcoming-litters",
  "/goldendoodle-dams",
  "/bernedoodle-dams",
  "/poodle-dams",
  "/cavapoo-dams",
  "/golden-retriever-dams",
  "/our-studs",
  "/guardian-program/current-opportunities",
  "/stud-services/shipping-and-collection-info"
];

if (!primaryNavBlock) {
  blockers.push("Unable to find the shared primaryNav definition.");
} else {
  [
    "/puppies/available",
    "/puppies/current-litters",
    "/puppies/upcoming-litters",
    "/parents/mamas",
    "/parents/studs",
    "/process/how-it-works",
    "/process/pricing",
    "/stud-services/our-studs",
    "/guardian-program/application",
    "/apply"
  ].forEach((route) => {
    if (!primaryNavBlock.includes(`href: "${route}"`)) {
      blockers.push(`Shared primaryNav is missing ${route}`);
    }
  });

  legacyPublicRoutes.forEach((route) => {
    if (primaryNavBlock.includes(`href: "${route}"`)) {
      blockers.push(`Shared primaryNav still contains legacy route ${route}`);
    }
  });

  if (!/label:\s*"Apply"[\s\S]*?cta:\s*true/.test(primaryNavBlock)) {
    blockers.push("Shared primaryNav does not expose Apply as the main CTA.");
  }
}

legacyPublicRoutes.forEach((route) => {
  if (siteData.includes(`href: "${route}"`)) {
    blockers.push(`Structured site data still contains legacy route ${route}`);
  }
});

if (availablePuppies.length === 0 && !app.includes("No puppies available right now")) {
  blockers.push("Available Puppies needs the zero-availability empty state when no puppies are Available.");
}

if (availablePuppies.length > 0 && !app.includes("truly open for an approved family")) {
  warnings.push("Available Puppies has available records, but the page copy may not emphasize true public availability.");
}

if (!app.includes("currentLitterProfiles") || !app.includes("sortableLitterDate")) {
  blockers.push("Current litters page should use sorted currentLitterProfiles instead of raw litter order.");
}

if (currentLitters[0]?.slug !== "birdie-waylon-spring-2026") {
  blockers.push(`Current litters should sort by earliest go-home date first. Current computed order: ${listLabels(currentLitters)}`);
}

const pennyWyattPuppies = publicPuppies.filter((puppy) => puppy.litterSlug === "penny-wyatt-spring-2026");
const badPennyWyattStatuses = pennyWyattPuppies.filter((puppy) => normalize(puppy.status) === "reserved");
if (badPennyWyattStatuses.length) {
  blockers.push(`Penny + Wyatt should be waitlist matching, not reserved: ${badPennyWyattStatuses.map((puppy) => puppy.name).join(", ")}`);
}

const hiddenPuppySlugs = ["messi", "ronaldo"];
hiddenPuppySlugs.forEach((slug) => {
  if (routes.includes(`/puppies/${slug}`)) {
    blockers.push(`Puppy route should stay removed from public sitemap: /puppies/${slug}`);
  }
});

expectedApiFormTypes.forEach((formType) => {
  if (!formsApi.includes(`${formType}:`) && !formsApi.includes(`"${formType}"`)) {
    blockers.push(`Form API is missing routing/validation support for ${formType}.`);
  }
});

expectedRenderedFormTypes.forEach((formType) => {
  if (!app.includes(`formType="${formType}"`)) {
    blockers.push(`App is missing a rendered LeadForm for ${formType}.`);
  }
});

if (!app.includes('primaryHref="/apply"') || !app.includes('primaryLabel="Start Puppy Application"')) {
  blockers.push("Public waitlist CTA should route families to the puppy application instead of the old mini waitlist form.");
}

["leadType", "routingBucket", "replyPriority", "recommendedNextStep", "leadSummary"].forEach((marker) => {
  if (!formsApi.includes(marker)) {
    blockers.push(`Lead routing payload is missing ${marker}.`);
  }
});

requiredSeoMarkers.forEach((marker) => {
  if (!index.includes(marker)) {
    blockers.push(`index.html is missing SEO/authority marker ${marker}.`);
  }
});

[
  "SearchAction",
  "LocalBusiness",
  "FAQPage",
  "ItemList",
  "employee: teamProfiles.map(teamPersonSchema)",
  "brand.googleReviews",
  "Salado"
].forEach((marker) => {
  if (!app.includes(marker)) {
    blockers.push(`Dynamic SEO/schema authority is missing marker: ${marker}`);
  }
});

if (!packageJson.scripts?.["sync:sheets"] || !packageJson.scripts?.["sync:sheets:dry-run"]) {
  blockers.push("Package scripts must keep both sync:sheets and sync:sheets:dry-run available.");
}

if (!packageJson.scripts?.["test:bridge"]) {
  blockers.push("Package scripts must keep test:bridge available for Google bridge checks.");
}

if (!packageJson.scripts?.["test:forms"] || !packageJson.scripts?.["test:forms:webhook"]) {
  blockers.push("Package scripts must keep local and live form tests available.");
}

if (publicParents.length < 1) {
  blockers.push("No public parent records are available for parent cards and parent detail pages.");
}

console.log("Buyer-flow QA snapshot");
console.log(`- Buyer routes checked: ${requiredBuyerRoutes.length}`);
console.log(`- Public available puppies: ${availablePuppies.length}`);
console.log(`- Current litter order: ${listLabels(currentLitters)}`);
console.log(`- Public parent profiles: ${publicParents.length}`);
console.log(`- Lead API form types checked: ${expectedApiFormTypes.join(", ")}`);
console.log(`- Rendered LeadForm types checked: ${expectedRenderedFormTypes.join(", ")}`);
console.log("- SEO authority markers checked: yes");
console.log("- Sheet sync scripts checked: yes");

if (warnings.length) {
  console.log("");
  console.log("Warnings");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (blockers.length) {
  console.error("");
  console.error("Buyer-flow blockers");
  blockers.forEach((blocker) => console.error(`- ${blocker}`));
  process.exit(1);
}

console.log("");
console.log("Buyer-flow QA passed.");
