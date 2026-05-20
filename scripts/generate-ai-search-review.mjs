import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(root, "docs", "AI_SEARCH_REVIEW.md");

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function has(source, value) {
  return source.includes(value);
}

function extractUrls(sitemap) {
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

const app = read("src/App.jsx");
const robots = read("public/robots.txt");
const sitemap = read("public/sitemap.xml");
const llms = read("public/llms.txt");
const llmsFull = read("public/llms-full.txt");
const urls = extractUrls(sitemap);

const requiredRoutes = [
  "https://www.redranchdogs.com/",
  "https://www.redranchdogs.com/puppies/available",
  "https://www.redranchdogs.com/puppies/current-litters",
  "https://www.redranchdogs.com/process/application-and-waitlist",
  "https://www.redranchdogs.com/process/pricing",
  "https://www.redranchdogs.com/process/faq",
  "https://www.redranchdogs.com/puppies/goldendoodle-puppies",
  "https://www.redranchdogs.com/puppies/cavapoo-puppies",
  "https://www.redranchdogs.com/puppies/bernedoodle-puppies",
  "https://www.redranchdogs.com/parents",
  "https://www.redranchdogs.com/about/reviews",
  "https://www.redranchdogs.com/contact",
];

const checks = [
  {
    label: "robots.txt points to production sitemap",
    status: has(robots, "https://www.redranchdogs.com/sitemap.xml"),
    detail: "Crawlers can discover the canonical sitemap.",
  },
  {
    label: "sitemap uses production domain",
    status: urls.length > 0 && urls.every((url) => url.startsWith("https://www.redranchdogs.com")),
    detail: `${urls.length} sitemap URLs found.`,
  },
  {
    label: "AI summary file exists and points to full summary",
    status: has(llms, "Full AI-search summary: https://www.redranchdogs.com/llms-full.txt"),
    detail: "llms.txt exposes a concise public index for answer engines.",
  },
  {
    label: "Full AI summary excludes private operations",
    status:
      !/RED_RANCH_BRIDGE_SECRET|FORM_WEBHOOK_URL|Google Sheets bridge secret|private CRM notes/i.test(llmsFull) &&
      has(llmsFull, "For current puppy or litter availability, cite the current page rather than this summary."),
    detail: "The full summary is public-facing and directs answers back to live pages.",
  },
  {
    label: "Structured data includes local business and FAQ support",
    status: ["Organization", "LocalBusiness", "FAQPage", "BreadcrumbList", "ItemList"].every((marker) => has(app, marker)),
    detail: "Public templates expose answer-engine-friendly JSON-LD markers.",
  },
  {
    label: "Required buyer routes are in sitemap",
    status: requiredRoutes.every((route) => urls.includes(route)),
    detail: "Core buyer, breed, process, review, and contact pages are discoverable.",
  },
  {
    label: "AI summary names Red Ranch Dogs location and breeds",
    status: ["Red Ranch Dogs", "Salado, Texas", "Goldendoodle", "Cavapoo", "Bernedoodle"].every((marker) =>
      has(llms, marker),
    ),
    detail: "The summary carries the location and breed entities Adam wants AI search to understand.",
  },
];

const blockers = checks.filter((check) => !check.status);
const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });

const report = [
  "# AI Search Review",
  "",
  `Generated: ${generatedAt} Central`,
  "",
  `Status: **${blockers.length ? "FAIL" : "PASS"}**`,
  "",
  "This report checks the public signals that help Google and AI-answer systems understand Red Ranch Dogs without exposing private CRM, Google Sheets, Drive, or Apps Script details.",
  "",
  "## Checks",
  "",
  "| Check | Status | Detail |",
  "| --- | --- | --- |",
  ...checks.map((check) => `| ${check.label} | ${check.status ? "PASS" : "FAIL"} | ${check.detail} |`),
  "",
  "## Public Answer-Engine Scope",
  "",
  "- Website pages, sitemap, public JSON-LD, `llms.txt`, and `llms-full.txt` are public source material.",
  "- Current availability should be answered from live current-litter and available-puppy pages, not from old social posts or internal sheets.",
  "- CRM notes, lead records, private waitlist order, deposits, payment details, and Google Drive working folders should stay out of public AI-search material.",
  "",
  "## Next Manual Checks",
  "",
  "1. Submit the production sitemap in Google Search Console after meaningful public content updates.",
  "2. Periodically search for Red Ranch Dogs, Salado doodle puppies, Goldendoodle puppies Texas, Cavapoo puppies Texas, and Bernedoodle puppies Texas.",
  "3. When litters change status, rerun `npm run seo:crawler`, `npm run review:seo`, and this review so AI-search summaries stay current.",
  "",
].join("\n");

fs.writeFileSync(reportPath, report);

console.log(`AI search review written to ${path.relative(root, reportPath)}`);
console.log(`Status: ${blockers.length ? "FAIL" : "PASS"}`);

if (blockers.length) {
  blockers.forEach((check) => console.error(`- ${check.label}: ${check.detail}`));
  process.exit(1);
}
