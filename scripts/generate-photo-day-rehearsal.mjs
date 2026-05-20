import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "docs", "PHOTO_DAY_REHEARSAL.md");

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

function publicPathExists(publicPath) {
  return Boolean(publicPath && publicPath.startsWith("/") && fs.existsSync(path.join(root, "public", publicPath)));
}

function parseWeekNumber(value = "") {
  const match = String(value).match(/\bweek\s*(\d+)\b/i);
  if (match) return Number(match[1]);
  if (normalize(value).includes("newborn")) return 0;
  return null;
}

function latestWeek(litter, litterPuppies) {
  const direct = parseWeekNumber(litter.weeklyUpdateStatus || "");
  const weeks = litterPuppies
    .flatMap((puppy) => puppy.weeklyPhotos || [])
    .map((week) => parseWeekNumber(week.week || ""))
    .filter((week) => week !== null);
  const allWeeks = direct !== null ? [...weeks, direct] : weeks;
  if (!allWeeks.length) return "Not started";
  const max = Math.max(...allWeeks);
  return max === 0 ? "Newborn Photos" : `Week ${max}`;
}

function nextWeekLabel(latest) {
  const parsed = parseWeekNumber(latest);
  if (parsed === null) return "Week 1";
  return `Week ${parsed + 1}`;
}

function folderForWeek(baseFolderHint, weekLabel, childFolder = "Photos") {
  if (!baseFolderHint) return "";
  const normalizedWeek = normalize(weekLabel);
  const parts = String(baseFolderHint)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  const last = normalize(parts.at(-1));

  if (last === "photos" || last === "videos") parts.pop();

  const alreadyIncludesWeek = parts.some((part) => normalize(part) === normalizedWeek);
  const weekParts = alreadyIncludesWeek ? parts : [...(normalizedWeek !== "newborn photos" && normalize(parts.at(-1)) === "newborn photos" ? parts.slice(0, -1) : parts), weekLabel];

  return [...weekParts, childFolder].join(" / ");
}

function puppyAction(puppy, nextWeek) {
  const hasMainPhoto = publicPathExists(puppy.mainPhoto);
  const hasWeeklyPhotos = Boolean(puppy.weeklyPhotos?.length);
  if (!hasMainPhoto) return "Choose main photo and create first weekly group";
  if (!hasWeeklyPhotos) return "Create first weekly group";
  return `Add ${nextWeek} group`;
}

function table(items, headers, renderRow) {
  if (!items.length) return "_None right now._";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...items.map(renderRow),
  ].join("\n");
}

const puppies = readJson("src/data/puppies.json").filter(isPublicRecord);
const litters = readJson("src/data/litters.json").filter(isPublicRecord).filter(isCurrentLitter);
const puppiesByLitter = new Map();

puppies.forEach((puppy) => {
  if (!puppy.litterSlug) return;
  puppiesByLitter.set(puppy.litterSlug, [...(puppiesByLitter.get(puppy.litterSlug) || []), puppy]);
});

const litterRows = litters.map((litter) => {
  const litterPuppies = puppiesByLitter.get(litter.slug) || [];
  const latest = latestWeek(litter, litterPuppies);
  const nextWeek = nextWeekLabel(latest);
  const missingMainPhotos = litterPuppies.filter((puppy) => !publicPathExists(puppy.mainPhoto));
  const missingWeeklyGroups = litterPuppies.filter((puppy) => !puppy.weeklyPhotos?.length);

  return {
    litter,
    litterPuppies,
    latest,
    missingMainPhotos,
    missingWeeklyGroups,
    nextFolder: folderForWeek(litter.photoFolderHint, nextWeek),
    nextWeek,
  };
});

const puppyRows = litterRows.flatMap((row) =>
  row.litterPuppies.map((puppy) => ({
    action: puppyAction(puppy, row.nextWeek),
    collar: puppy.collarColor || "Missing",
    litter: row.litter.name,
    name: puppy.name,
    status: puppy.status || "",
  })),
);

const blockers = [];
const warnings = [];

litterRows.forEach((row) => {
  if (!row.litter.photoFolderHint) blockers.push(`${row.litter.name} is missing a photoFolderHint.`);
  if (!row.litterPuppies.length) warnings.push(`${row.litter.name} has no public puppy profiles yet.`);
  if (row.missingMainPhotos.length) warnings.push(`${row.litter.name}: ${row.missingMainPhotos.length} puppies need main photos.`);
  if (row.missingWeeklyGroups.length) warnings.push(`${row.litter.name}: ${row.missingWeeklyGroups.length} puppies need first weekly groups.`);
});

const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
const report = `# Photo Day Rehearsal

Generated: ${generatedAt} Central

Status: **${blockers.length ? "FAIL" : "READY"}**

This is the pre-media-day rehearsal for current litters. It does not move files, edit Google Drive, write Sheets, or publish website changes. It tells us what the next photo or video import should do.

## Current Litter Readiness

${table(
  litterRows,
  ["Litter", "Latest website photos", "Next photo folder", "Puppies", "Main-photo needs", "Weekly-group needs"],
  (row) =>
    `| ${row.litter.name} | ${row.latest} | ${row.nextFolder || "_Missing folder hint_"} | ${row.litterPuppies.length} | ${row.missingMainPhotos.length} | ${row.missingWeeklyGroups.length} |`,
)}

## Puppy-Level Import Actions

${table(
  puppyRows,
  ["Litter", "Puppy", "Collar", "Status", "Import action"],
  (row) => `| ${row.litter} | ${row.name} | ${row.collar} | ${row.status} | ${row.action} |`,
)}

## Rehearsal Notes

${blockers.length ? blockers.map((item) => `- BLOCKER: ${item}`).join("\n") : "- No folder blockers flagged."}
${warnings.length ? warnings.map((item) => `- NOTE: ${item}`).join("\n") : "- No photo readiness notes flagged."}

## After Media Day

\`\`\`bash
npm run photos:packet
npm run sync:puppies
npm run sync:litters
npm run review:sheets
npm run publish:check
\`\`\`
`;

fs.writeFileSync(outputPath, report);

console.log(`Photo day rehearsal written to ${path.relative(root, outputPath)}`);
console.log(`Status: ${blockers.length ? "FAIL" : "READY"}`);

if (blockers.length) {
  blockers.forEach((blocker) => console.error(`- ${blocker}`));
  process.exit(1);
}
