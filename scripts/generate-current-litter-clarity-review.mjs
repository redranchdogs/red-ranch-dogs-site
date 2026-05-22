import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "docs", "CURRENT_LITTER_CLARITY_REVIEW.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function normalize(value = "") {
  return String(value).trim().toLowerCase();
}

function isPublicRecord(record = {}) {
  const visibility = normalize(record.visibility || "public");
  return visibility !== "hidden" && visibility !== "private";
}

function isCurrentLitter(litter = {}) {
  return normalize(litter.status).includes("current");
}

function isAvailable(status = "") {
  return normalize(status).includes("available");
}

function isReserved(status = "") {
  return normalize(status).includes("reserved");
}

function isWaitlist(status = "") {
  return normalize(status).includes("waitlist");
}

function table(items, headers, renderRow) {
  if (!items.length) return "_None right now._";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...items.map(renderRow),
  ].join("\n");
}

const appSource = fs.readFileSync(path.join(root, "src", "App.jsx"), "utf8");
const puppies = readJson("src/data/puppies.json").filter(isPublicRecord);
const litters = readJson("src/data/litters.json").filter(isPublicRecord).filter(isCurrentLitter);
const puppiesByLitter = new Map();

puppies.forEach((puppy) => {
  if (!puppy.litterSlug) return;
  puppiesByLitter.set(puppy.litterSlug, [...(puppiesByLitter.get(puppy.litterSlug) || []), puppy]);
});

const rows = litters.map((litter) => {
  const litterPuppies = puppiesByLitter.get(litter.slug) || [];
  const available = litterPuppies.filter((puppy) => isAvailable(puppy.status));
  const reserved = litterPuppies.filter((puppy) => isReserved(puppy.status));
  const waitlist = litterPuppies.filter((puppy) => isWaitlist(puppy.status));
  const galleryCount = litter.weeklyUpdateGallery?.length || 0;
  const recommendation = available.length
    ? "Available puppies are public; keep Apply CTA prominent."
    : waitlist.length
      ? "Waitlist-first language should explain that public openings post after picks."
      : reserved.length === litterPuppies.length && litterPuppies.length
        ? "Fully reserved; future-litter CTA should stay prominent."
        : "Keep page in follow/update mode until availability is clearer.";

  return {
    available: available.length,
    galleryCount,
    litter,
    puppies: litterPuppies.length,
    recommendation,
    reserved: reserved.length,
    waitlist: waitlist.length,
  };
});

const blockers = [];

if (!appSource.includes("Waitlist Picks First")) blockers.push("Waitlist badge copy is missing from the current litter template.");
if (!appSource.includes("availability will be posted here")) blockers.push("Waitlist-first next-step copy does not tell families where availability will appear.");
if (!appSource.includes("No public puppies are available right now")) {
  blockers.push("Available Puppies empty state does not clarify public availability.");
}
if (!appSource.includes("Photos Coming Soon")) blockers.push("Current litter empty photo-gallery state is missing.");

rows.forEach((row) => {
  if (!row.puppies) blockers.push(`${row.litter.name} is current but has no public puppy profiles.`);
  if (row.waitlist && !row.litter.availabilitySummary && !row.litter.availabilityNote) {
    blockers.push(`${row.litter.name} has waitlist puppies but no litter availability summary/note.`);
  }
});

const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
const report = `# Current Litter Clarity Review

Generated: ${generatedAt} Central

Status: **${blockers.length ? "FAIL" : "PASS"}**

This review reads the current litter data and the public template language so the current-litter experience stays clear for a first-time buyer.

## Buyer Clarity Goals

1. Families can tell whether puppies are available now, waitlist-first, or reserved.
2. Waitlist matching does not feel like a dead end; it explains that public openings will be posted after waitlist picks.
3. Current litter pages can go live before photo day without looking broken.
4. The next step stays obvious: apply, view current litters, or ask a question.

## Current Litter Snapshot

${table(
  rows,
  ["Litter", "Puppies", "Available", "Waitlist-first", "Reserved", "Gallery photos", "Recommendation"],
  (row) =>
    `| ${row.litter.name} | ${row.puppies} | ${row.available} | ${row.waitlist} | ${row.reserved} | ${row.galleryCount} | ${row.recommendation} |`,
)}

## Template Checks

${blockers.length ? blockers.map((item) => `- BLOCKER: ${item}`).join("\n") : "- Waitlist-first, public-openings, no-public-puppies, and photos-coming-soon language are present."}

## Next Human Spot Check

- Open Current Litters on a phone and confirm each litter card makes sense without prior Red Ranch context.
- Open one waitlist-first litter and confirm the snapshot, puppy cards, gallery status, and CTA all tell the same story.
- After the next photo drop, confirm the Photos Coming Soon panel disappears for litters that now have gallery photos.
`;

fs.writeFileSync(outputPath, report);

console.log(`Current litter clarity review written to ${path.relative(root, outputPath)}`);
console.log(`Status: ${blockers.length ? "FAIL" : "PASS"}`);

if (blockers.length) {
  blockers.forEach((blocker) => console.error(`- ${blocker}`));
  process.exit(1);
}
