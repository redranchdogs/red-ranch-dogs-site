import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "docs", "PUBLIC_SAFETY_REVIEW.md");
const blockers = [];
const warnings = [];
const notes = [];

const dataFiles = [
  "src/data/breeds.json",
  "src/data/faqs.json",
  "src/data/litters.json",
  "src/data/parents.json",
  "src/data/previousLitters.json",
  "src/data/pricing.json",
  "src/data/puppies.json",
  "src/data/team.json",
  "src/data/testimonials.json",
  "src/data/waitlist.json",
];

const skipKeyPatterns = [
  /(^|_)slug$/i,
  /^href$/i,
  /^route$/i,
  /^url$/i,
  /^image/i,
  /photo/i,
  /folder/i,
  /link/i,
  /testing/i,
  /^email$/i,
  /^phone$/i,
  /^sms$/i,
  /^source$/i,
  /^updatedAt$/i,
];

const internalCopyPatterns = [
  [/loaded\s+from/i, "loaded-from workflow note"],
  [/drive\s+photo\s+drop/i, "Drive photo drop note"],
  [/drive\s+media\s+drop/i, "Drive media drop note"],
  [/website\s+hub/i, "Website Hub folder note"],
  [/google\s+drive/i, "Google Drive note"],
  [/\bplaceholder\b/i, "placeholder copy"],
  [/\blorem\b/i, "lorem ipsum copy"],
  [/\bTODO\b/i, "TODO copy"],
  [/\bTBD\b/i, "TBD copy"],
  [/insert\s+real/i, "insert-real placeholder copy"],
  [/\bsample\s+placeholder\b/i, "sample placeholder copy"],
];

const rawUrlPatterns = [
  [/https:\/\/docs\.google\.com/i, "Google Docs or Sheets URL"],
  [/https:\/\/drive\.google\.com/i, "Google Drive URL"],
  [/https:\/\/script\.google\.com/i, "Apps Script URL"],
];

const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const phonePattern = /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function isPublicRecord(record = {}) {
  const visibility = String(record.visibility || "public").trim().toLowerCase();
  return visibility !== "hidden" && visibility !== "private";
}

function shouldSkipKey(key = "") {
  return skipKeyPatterns.some((pattern) => pattern.test(key));
}

function shouldSkipPath(pathParts = []) {
  return pathParts.some((part) => shouldSkipKey(part));
}

function describePath(filePath, pathParts) {
  return `${filePath}:${pathParts.join(".") || "root"}`;
}

function addUnique(bucket, value) {
  if (!bucket.includes(value)) bucket.push(value);
}

function collectStrings(value, filePath, pathParts = []) {
  if (value === null || value === undefined) return;

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, filePath, [...pathParts, String(index)]));
    return;
  }

  if (typeof value === "object") {
    if ("visibility" in value && !isPublicRecord(value)) return;

    Object.entries(value).forEach(([key, item]) => {
      collectStrings(item, filePath, [...pathParts, key]);
    });
    return;
  }

  if (typeof value !== "string") return;
  if (!value.trim()) return;
  if (shouldSkipPath(pathParts)) return;

  const location = describePath(filePath, pathParts);

  internalCopyPatterns.forEach(([pattern, label]) => {
    if (pattern.test(value)) {
      addUnique(blockers, `${location} contains public-facing ${label}: "${value.slice(0, 120)}"`);
    }
  });

  rawUrlPatterns.forEach(([pattern, label]) => {
    if (pattern.test(value)) {
      addUnique(blockers, `${location} contains a raw ${label}. Use a normal public route or remove it from public data.`);
    }
  });

  const emailMatch = value.match(emailPattern);
  if (emailMatch && !emailMatch[0].toLowerCase().endsWith("@redranchdogs.com")) {
    addUnique(blockers, `${location} contains a non-brand email address: ${emailMatch[0]}`);
  }

  const phoneMatch = value.match(phonePattern);
  if (phoneMatch) {
    addUnique(warnings, `${location} contains a phone-like value. Confirm it is intentional public contact copy.`);
  }
}

function reviewPreviousLitterPricing(previousLitters) {
  previousLitters.filter(isPublicRecord).forEach((litter) => {
    const hasPriceFact = (litter.facts || []).some(([label]) => String(label || "").trim().toLowerCase() === "price");

    if (hasPriceFact) {
      warnings.push(`${litter.name}: previous-litter source data includes a Price fact. Public archive pages should continue hiding old pricing.`);
    }
  });
}

function reviewWaitlistPrivacy(waitlist) {
  const rows = Array.isArray(waitlist) ? waitlist : waitlist.publicRows || [];

  rows.forEach((row, index) => {
    const rowText = JSON.stringify(row);

    if (emailPattern.test(rowText)) {
      blockers.push(`src/data/waitlist.json:publicRows.${index} contains an email address. Public waitlist should only show display names.`);
    }

    if (phonePattern.test(rowText)) {
      blockers.push(`src/data/waitlist.json:publicRows.${index} contains a phone number. Public waitlist should only show display names.`);
    }
  });
}

function reviewStaticFiles() {
  ["index.html", "public/robots.txt", "public/sitemap.xml", "public/llms.txt", "public/llms-full.txt"].forEach((filePath) => {
    const absolute = path.join(root, filePath);
    if (!fs.existsSync(absolute)) return;

    const contents = fs.readFileSync(absolute, "utf8");

    rawUrlPatterns.forEach(([pattern, label]) => {
      if (pattern.test(contents)) {
        blockers.push(`${filePath} contains a raw ${label}.`);
      }
    });

    if (/BRIDGE_SECRET|FORM_WEBHOOK_URL|RED_RANCH_BRIDGE_SECRET/i.test(contents)) {
      blockers.push(`${filePath} contains an environment variable or secret marker.`);
    }
  });
}

const loadedData = new Map();

dataFiles.forEach((filePath) => {
  if (!fs.existsSync(path.join(root, filePath))) {
    warnings.push(`${filePath} is missing from the public data audit.`);
    return;
  }

  const data = readJson(filePath);
  loadedData.set(filePath, data);
  collectStrings(data, filePath);
});

reviewPreviousLitterPricing(loadedData.get("src/data/previousLitters.json") || []);
reviewWaitlistPrivacy(loadedData.get("src/data/waitlist.json") || {});
reviewStaticFiles();

if (!blockers.length) {
  notes.push("No public blockers found in structured data, static HTML, robots, sitemap, or AI-search summary files.");
}

if (!warnings.length) {
  notes.push("No public safety warnings found.");
}

const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
const lines = [
  "# Public Safety Review",
  "",
  `Generated: ${generatedAt} Central`,
  "",
  "This scanner looks for public-facing workflow notes, private contact details, raw Google workspace links, and old pricing artifacts in structured website data.",
  "",
  `Status: **${blockers.length ? "FAIL" : "PASS"}**`,
  "",
  "## Blockers",
  "",
  blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- None flagged.",
  "",
  "## Warnings",
  "",
  warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- None flagged.",
  "",
  "## Notes",
  "",
  notes.map((item) => `- ${item}`).join("\n"),
  "",
].join("\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines);

console.log(`Public safety review written to ${path.relative(root, outputPath)}`);
console.log(`Status: ${blockers.length ? "FAIL" : "PASS"}`);

if (blockers.length) {
  blockers.forEach((blocker) => console.error(`- ${blocker}`));
  process.exit(1);
}
