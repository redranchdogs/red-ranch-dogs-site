import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(root, "docs", "WEEKLY_UPDATE_QUEUE.md");
const rosterPath = path.join(root, "outputs", "weekly-photo-roster.tsv");

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

function publicPathExists(publicPath) {
  if (!publicPath || !publicPath.startsWith("/")) return false;
  return fs.existsSync(path.join(root, "public", publicPath));
}

function parseFirstDate(value = "") {
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
    december: 11,
  };
  const match = String(value).match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:-\d{1,2})?,?\s*(\d{4})?/i,
  );

  if (!match) return null;

  return new Date(Number(match[3] || new Date().getFullYear()), monthMap[match[1].toLowerCase()], Number(match[2]));
}

function sortableDate(value = "") {
  return parseFirstDate(value)?.getTime() ?? Number.POSITIVE_INFINITY;
}

function daysUntil(value = "") {
  const date = parseFirstDate(value);
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function titleCase(value = "") {
  return String(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function statusCounts(items) {
  return Object.entries(
    items.reduce((counts, item) => {
      const key = item.status || "No status";
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {}),
  )
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([status, count]) => `${count} ${status}`)
    .join(", ");
}

function latestWeekForLitter(litter, litterPuppies) {
  const directMatch = String(litter.weeklyUpdateStatus || "").match(/\bWeek\s+\d+/i);
  if (directMatch) return titleCase(directMatch[0]);

  const weeks = litterPuppies
    .flatMap((puppy) => puppy.weeklyPhotos || [])
    .map((week) => String(week.week || "").match(/\d+/)?.[0])
    .filter(Boolean)
    .map(Number);

  if (!weeks.length) return "No weekly photos listed";

  return `Week ${Math.max(...weeks)}`;
}

function issueList(items) {
  if (!items.length) return "- None flagged.";
  return items.map((item) => `- ${item}`).join("\n");
}

function tableRows(items, renderRow) {
  if (!items.length) return "| None | | | | |";
  return items.map(renderRow).join("\n");
}

function tsvCell(value) {
  return String(value ?? "").replace(/\t/g, " ").replace(/\r?\n/g, " ");
}

const puppies = readJson("src/data/puppies.json");
const litters = readJson("src/data/litters.json");
const previousLitters = readJson("src/data/previousLitters.json");
const parents = readJson("src/data/parents.json");

const publicPuppies = puppies.filter(isPublicRecord);
const publicLitters = litters.filter(isPublicRecord);
const publicParents = parents.filter(isPublicRecord);
const publicPreviousLitters = previousLitters.filter(isPublicRecord);
const currentLitters = publicLitters
  .filter((litter) => normalize(litter.status).includes("current"))
  .sort((first, second) => sortableDate(first.goHomeDate || first.goHome) - sortableDate(second.goHomeDate || second.goHome));
const upcomingLitters = publicLitters
  .filter((litter) => normalize(litter.status).includes("planned") || normalize(litter.status).includes("upcoming"))
  .sort((first, second) => first.breed.localeCompare(second.breed) || sortableDate(first.expectedTiming) - sortableDate(second.expectedTiming));

const currentLitterIssues = [];
const puppyIssues = [];
const parentIssues = [];
const previousLitterIssues = [];

currentLitters.forEach((litter) => {
  const litterPuppies = publicPuppies.filter((puppy) => puppy.litterSlug === litter.slug);
  const goHomeDistance = daysUntil(litter.goHomeDate || litter.goHome);

  if (!litterPuppies.length) {
    currentLitterIssues.push(`${litter.name}: current litter has no public puppy records yet.`);
  }

  if (!litter.weeklyUpdateGallery?.length) {
    currentLitterIssues.push(`${litter.name}: current litter has no weekly gallery images.`);
  }

  if (goHomeDistance !== null && goHomeDistance < 0) {
    currentLitterIssues.push(`${litter.name}: go-home window appears past (${litter.goHomeDate}). Confirm whether this should move to previous litters.`);
  }

  litterPuppies.forEach((puppy) => {
    if (!puppy.mainPhoto || !publicPathExists(puppy.mainPhoto)) {
      puppyIssues.push(`${puppy.name}: missing main photo for ${litter.name}.`);
    }

    if (!puppy.collarColor) {
      puppyIssues.push(`${puppy.name}: missing collar color for weekly photo matching.`);
    }
  });
});

publicParents.forEach((parent) => {
  if (!parent.mainPhoto || !publicPathExists(parent.mainPhoto)) {
    parentIssues.push(`${parent.name}: public parent profile needs a valid main photo.`);
  }

  if (!parent.photoFolderHint) {
    parentIssues.push(`${parent.name}: missing photoFolderHint for Drive workflow.`);
  }
});

publicPreviousLitters.forEach((litter) => {
  if (!litter.parentPhotos?.length) {
    previousLitterIssues.push(`${litter.name}: previous litter needs separate parent photos.`);
  }

  if (!litter.puppyPhotos?.length) {
    previousLitterIssues.push(`${litter.name}: previous litter needs puppy gallery photos.`);
  }
});

const rosterRows = [
  [
    "litter_slug",
    "litter_name",
    "drive_folder_hint",
    "latest_week",
    "puppy_slug",
    "puppy_name",
    "gender",
    "collar_color",
    "status",
    "main_photo",
  ],
];

currentLitters.forEach((litter) => {
  const litterPuppies = publicPuppies.filter((puppy) => puppy.litterSlug === litter.slug);
  const latestWeek = latestWeekForLitter(litter, litterPuppies);

  litterPuppies.forEach((puppy) => {
    rosterRows.push([
      litter.slug,
      litter.name,
      litter.photoFolderHint || "",
      latestWeek,
      puppy.slug,
      puppy.name,
      puppy.gender || "",
      puppy.collarColor || "",
      puppy.status || "",
      puppy.mainPhoto || "",
    ]);
  });
});

const currentRows = currentLitters.map((litter) => {
  const litterPuppies = publicPuppies.filter((puppy) => puppy.litterSlug === litter.slug);
  const latestWeek = latestWeekForLitter(litter, litterPuppies);
  const goHomeDistance = daysUntil(litter.goHomeDate || litter.goHome);
  const goHomeLabel = goHomeDistance === null ? "No date parsed" : goHomeDistance < 0 ? `${Math.abs(goHomeDistance)} days past` : `${goHomeDistance} days away`;

  return `| ${litter.name} | ${litter.goHomeDate || ""} (${goHomeLabel}) | ${latestWeek} | ${litterPuppies.length} | ${statusCounts(litterPuppies) || "No puppies"} |`;
});

const upcomingRows = upcomingLitters.map((litter) => {
  const pastLitter = litter.previousLitterHref ? `Yes (${litter.previousLitterHref})` : "No";

  return `| ${litter.breed} | ${litter.name} | ${litter.expectedTiming || ""} | ${litter.availabilitySummary || ""} | ${pastLitter} |`;
});

const parentRows = publicParents
  .filter((parent) => normalize(parent.status) === "active")
  .sort((first, second) => first.role.localeCompare(second.role) || first.breed.localeCompare(second.breed) || first.name.localeCompare(second.name))
  .map((parent) => `| ${titleCase(parent.role)} | ${parent.name} | ${parent.breed} | ${parent.mainPhoto && publicPathExists(parent.mainPhoto) ? "Yes" : "Needs photo"} | ${parent.photoFolderHint || ""} |`);

const report = `# Weekly Update Queue

Generated: ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })} Central

This report is generated from the website data files. Use it as the quick Tuesday photo/update checklist before touching individual pages.

## Current Litter Photo Queue

| Litter | Go-home timing | Latest website week | Puppies | Website statuses |
| --- | --- | --- | ---: | --- |
${tableRows(currentRows, (row) => row)}

## Current Litter Issues

${issueList(currentLitterIssues)}

## Puppy Photo Matching Issues

${issueList(puppyIssues)}

## Upcoming Litter Queue

| Breed | Pairing | Timing | Availability note | Past litter link |
| --- | --- | --- | --- | --- |
${tableRows(upcomingRows, (row) => row)}

## Active Parent Photo Queue

| Role | Name | Breed | Main photo | Drive folder hint |
| --- | --- | --- | --- | --- |
${tableRows(parentRows, (row) => row)}

## Parent Workflow Issues

${issueList(parentIssues)}

## Previous Litter Archive Issues

${issueList(previousLitterIssues)}

## Spreadsheet-Friendly Roster

The current puppy media roster was exported to:

\`\`\`text
outputs/weekly-photo-roster.tsv
\`\`\`

Use that TSV when you want a quick copy/paste checklist for the weekly media drop. It includes the litter, Drive folder hint, latest week, puppy name, collar, status, and current main photo path.

## Suggested Weekly Routine

1. Upload new photos into the week's \`Photos\` folder and videos into the matching \`Videos\` folder.
2. Keep a visible collar-color shot or clear sequence so each puppy can be matched without making individual folders.
3. Run the photo/update import or update the website data.
4. Run \`npm run ops:workflow\` to refresh this queue.
5. Run \`npm run ops:status\` before deploying.
`;

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.mkdirSync(path.dirname(rosterPath), { recursive: true });
fs.writeFileSync(reportPath, report);
fs.writeFileSync(rosterPath, rosterRows.map((row) => row.map(tsvCell).join("\t")).join("\n") + "\n");

console.log(`Weekly workflow report written to ${path.relative(root, reportPath)}`);
console.log(`Weekly photo roster written to ${path.relative(root, rosterPath)}`);
