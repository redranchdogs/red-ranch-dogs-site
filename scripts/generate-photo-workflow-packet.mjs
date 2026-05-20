import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(root, "docs", "PHOTO_WORKFLOW_PACKET.md");
const checklistPath = path.join(root, "outputs", "photo-intake-checklist.tsv");

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

function isUpcomingLitter(litter = {}) {
  const status = normalize(litter.status);
  return status.includes("planned") || status.includes("upcoming");
}

function titleCase(value = "") {
  return String(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function publicPathExists(publicPath) {
  if (!publicPath || !publicPath.startsWith("/")) return false;
  return fs.existsSync(path.join(root, "public", publicPath));
}

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

  if (allWeeks.length) {
    const max = Math.max(...allWeeks);
    return max === 0 ? "Newborn Photos" : `Week ${max}`;
  }

  if (normalize(litter.weeklyUpdateStatus || "").includes("newborn")) return "Newborn Photos";

  return "Not started";
}

function nextWeekLabel(latest) {
  const parsed = parseWeekNumber(latest);
  if (parsed === null) return "Week 1";
  return `Week ${parsed + 1}`;
}

function folderForWeek(baseFolderHint, weekLabel) {
  if (!baseFolderHint) return "";
  const normalizedWeek = normalize(weekLabel);
  const parts = String(baseFolderHint)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  const alreadyIncludesWeek = parts.some((part) => normalize(part) === normalizedWeek);

  if (alreadyIncludesWeek) return parts.join(" / ");

  const baseParts =
    normalizedWeek !== "newborn photos" && normalize(parts.at(-1)) === "newborn photos"
      ? parts.slice(0, -1)
      : parts;

  return [...baseParts, weekLabel].join(" / ");
}

function imageFolder(publicPath = "") {
  return path.dirname(publicPath).replace(/^\.$/, "");
}

function suggestedPhotoName({ puppy, litter, weekLabel }) {
  const puppySlug = slugify(puppy.slug || puppy.name);
  const breedSlug = slugify(puppy.breed || litter.breed || "puppy");
  const litterSlug = slugify(litter.name || litter.slug);
  const weekSlug = slugify(weekLabel);

  return `${puppySlug}-${breedSlug}-puppy-${litterSlug}-${weekSlug}-red-ranch-dogs.jpg`;
}

function statusCounts(items) {
  const counts = items.reduce((result, item) => {
    const key = item.status || "No status";
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});

  return Object.entries(counts)
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([status, count]) => `${count} ${status}`)
    .join(", ");
}

function table(items, headers, renderRow) {
  if (!items.length) return "_None right now._";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...items.map(renderRow),
  ].join("\n");
}

function tsvCell(value) {
  return String(value ?? "").replace(/\t/g, " ").replace(/\r?\n/g, " ");
}

function writeTsv(rows) {
  fs.mkdirSync(path.dirname(checklistPath), { recursive: true });
  fs.writeFileSync(checklistPath, rows.map((row) => row.map(tsvCell).join("\t")).join("\n") + "\n");
}

const puppies = readJson("src/data/puppies.json").filter(isPublicRecord);
const litters = readJson("src/data/litters.json").filter(isPublicRecord);
const parents = readJson("src/data/parents.json").filter(isPublicRecord);
const previousLitters = readJson("src/data/previousLitters.json").filter(isPublicRecord);

const currentLitters = litters.filter(isCurrentLitter);
const upcomingLitters = litters.filter(isUpcomingLitter);
const activeParents = parents.filter((parent) => normalize(parent.status) === "active");
const puppiesByLitter = new Map();

puppies.forEach((puppy) => {
  if (!puppy.litterSlug) return;
  puppiesByLitter.set(puppy.litterSlug, [...(puppiesByLitter.get(puppy.litterSlug) || []), puppy]);
});

const currentLitterRows = currentLitters.map((litter) => {
  const litterPuppies = puppiesByLitter.get(litter.slug) || [];
  const latest = latestWeek(litter, litterPuppies);
  const next = nextWeekLabel(latest);

  return {
    litter,
    puppyCount: litterPuppies.length,
    latest,
    next,
    nextFolder: folderForWeek(litter.photoFolderHint, next),
    statuses: statusCounts(litterPuppies) || "No public puppies yet",
  };
});

const puppyChecklist = currentLitters.flatMap((litter) => {
  const litterPuppies = puppiesByLitter.get(litter.slug) || [];
  const latest = latestWeek(litter, litterPuppies);
  const next = nextWeekLabel(latest);
  const nextFolder = folderForWeek(litter.photoFolderHint, next);

  return litterPuppies.map((puppy) => {
    const hasMainPhoto = Boolean(puppy.mainPhoto && publicPathExists(puppy.mainPhoto));
    const hasWeeklyPhotos = Boolean(puppy.weeklyPhotos?.length);
    const recommendedAction = hasMainPhoto
      ? hasWeeklyPhotos
        ? `Add ${next} weekly group`
        : "Add first weekly group"
      : "Select main photo and first weekly group";
    const notes = [
      puppy.collarColor
        ? `Match by ${puppy.collarColor} collar.`
        : "Needs a collar-color note before photo matching.",
      hasMainPhoto ? "Main photo is live." : "Needs main website photo.",
      hasWeeklyPhotos ? "Weekly photos already started." : "No weekly photo groups yet.",
    ].join(" ");

    return {
      taskType: "current-puppy-photo",
      litter,
      puppy,
      weekLabel: next,
      driveFolder: nextFolder,
      currentPhoto: puppy.mainPhoto || "",
      currentPublicFolder: imageFolder(puppy.mainPhoto || ""),
      suggestedFileName: suggestedPhotoName({ puppy, litter, weekLabel: next }),
      hasMainPhoto,
      hasWeeklyPhotos,
      recommendedAction,
      sheetSyncCommand: "npm run sync:puppies && npm run sync:litters && npm run review:sheets",
      notes,
    };
  });
});

const upcomingChecklist = upcomingLitters.map((litter) => ({
  taskType: "upcoming-litter-parent-photo",
  label: litter.name,
  driveFolder: litter.photoFolderHint || "",
  notes: "Use parent pairing images only until puppy photos are ready.",
  currentPhotoCount: litter.weeklyUpdateGallery?.filter(publicPathExists).length || 0,
}));

const parentChecklist = activeParents
  .slice()
  .sort((first, second) => first.role.localeCompare(second.role) || first.breed.localeCompare(second.breed) || first.name.localeCompare(second.name))
  .map((parent) => ({
    taskType: "parent-photo",
    parent,
    driveFolder: parent.photoFolderHint || "",
    currentPhoto: parent.mainPhoto || "",
    photoStatus: parent.mainPhoto && publicPathExists(parent.mainPhoto) ? "Has website photo" : "Needs website photo",
  }));

const previousBackfill = previousLitters
  .map((litter) => {
    const missing = [];
    if (!litter.parentPhotos?.length) missing.push("parentPhotos");
    if (!litter.puppyPhotos?.length) missing.push("puppyPhotos");

    return {
      litter,
      missing,
      driveFolder: litter.photoFolderHint || "",
    };
  })
  .filter((item) => item.missing.length);

const checklistRows = [
  [
    "task_type",
    "litter_or_parent",
    "breed",
    "week_or_status",
    "puppy_name",
    "collar_color",
    "puppy_status",
    "drive_folder",
    "current_public_photo",
    "suggested_file_name",
    "import_action",
    "has_main_photo",
    "has_weekly_photos",
    "sheet_sync_command",
    "notes",
  ],
];

puppyChecklist.forEach((item) => {
  checklistRows.push([
    item.taskType,
    item.litter.name,
    item.litter.breed,
    item.weekLabel,
    item.puppy.name,
    item.puppy.collarColor || "",
    item.puppy.status || "",
    item.driveFolder,
    item.currentPhoto,
    item.suggestedFileName,
    item.recommendedAction,
    item.hasMainPhoto ? "yes" : "no",
    item.hasWeeklyPhotos ? "yes" : "no",
    item.sheetSyncCommand,
    item.notes,
  ]);
});

upcomingChecklist.forEach((item) => {
  checklistRows.push([
    item.taskType,
    item.label,
    "",
    `${item.currentPhotoCount} current images`,
    "",
    "",
    "",
    item.driveFolder,
    "",
    "",
    "Hold until puppy photos are ready",
    "",
    "",
    "npm run sync:litters && npm run review:sheets",
    item.notes,
  ]);
});

parentChecklist.forEach((item) => {
  checklistRows.push([
    item.taskType,
    item.parent.name,
    item.parent.breed,
    item.photoStatus,
    "",
    "",
    item.parent.status || "",
    item.driveFolder,
    item.currentPhoto,
    "",
    item.photoStatus === "Has website photo" ? "Review only" : "Select website photo",
    item.photoStatus === "Has website photo" ? "yes" : "no",
    "",
    "npm run sync:parents && npm run review:sheets",
    titleCase(item.parent.role || ""),
  ]);
});

previousBackfill.forEach((item) => {
  checklistRows.push([
    "previous-litter-backfill",
    item.litter.name,
    item.litter.breed,
    item.missing.join(", "),
    "",
    "",
    "",
    item.driveFolder,
    item.litter.image || "",
    "",
    "Backfill archive photos",
    "",
    "",
    "npm run sync:previous-litters && npm run review:sheets",
    "Backfill only when Adam wants this previous pairing expanded.",
  ]);
});

writeTsv(checklistRows);

const generated = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
const report = `# Photo Workflow Packet

Generated: ${generated} Central

This is the working packet for weekly puppy photos, parent photo cleanup, and previous-litter photo backfill. It is intentionally internal: it describes Google Drive paths and photo matching rules so the public website can stay clean.

## Photo Day Rules

1. Upload each litter's weekly photo dump into the litter folder, using a simple week folder such as \`Week 6\`.
2. Do not create individual puppy folders unless the photo set is confusing. A full dump is fine when every puppy has a clear collar-color identifier.
3. Make the first usable shot for each puppy a clear collar-identification shot. The matching key is puppy name plus collar color.
4. Keep public file names website-friendly: lowercase, hyphenated, puppy name, breed, litter, week, and \`red-ranch-dogs\`.
5. Public pages should never show internal upload notes such as Drive folders, photo drops, or import reminders.
6. After a data/photo update, run \`npm run ops:full\` and check \`docs/PRELAUNCH_SIGNOFF.md\`.

## Photo Import Decision Rules

1. If a puppy has no live main photo, choose the best clear face/body shot first and use it for the puppy card.
2. If the puppy already has a main photo but no weekly groups, add the first weekly group below the puppy profile so families can follow growth over time.
3. If weekly groups already exist, add the next week as a new grouped gallery instead of replacing older weeks.
4. For current litters with no photo day yet, keep the public placeholder calm: puppy profiles can be live while photos are marked as coming soon.
5. After changing puppy, litter, parent, or previous-litter data, run the matching sheet sync command shown in the TSV before publishing.

## Current Litter Photo Queue

${table(
  currentLitterRows,
  ["Litter", "Latest website photos", "Next upload folder", "Puppies", "Website statuses"],
  (item) =>
    `| ${item.litter.name} | ${item.latest} | ${item.nextFolder || "_No folder hint_"} | ${item.puppyCount} | ${item.statuses} |`,
)}

## Puppy Matching Checklist

${table(
  puppyChecklist,
  ["Litter", "Puppy", "Collar", "Status", "Recommended action", "Next file name"],
  (item) =>
    `| ${item.litter.name} | ${item.puppy.name} | ${item.puppy.collarColor || "_Missing_"} | ${item.puppy.status || ""} | ${item.recommendedAction} | \`${item.suggestedFileName}\` |`,
)}

## Upcoming Litter Pairing Photos

${table(
  upcomingChecklist,
  ["Pairing", "Drive folder", "Current website images", "Rule"],
  (item) => `| ${item.label} | ${item.driveFolder || "_No folder hint_"} | ${item.currentPhotoCount} | ${item.notes} |`,
)}

## Parent Photo Cleanup

${table(
  parentChecklist,
  ["Role", "Name", "Breed", "Website photo", "Drive folder"],
  (item) =>
    `| ${titleCase(item.parent.role || "")} | ${item.parent.name} | ${item.parent.breed} | ${item.photoStatus} | ${item.driveFolder || "_No folder hint_"} |`,
)}

## Previous Litter Backfill

${table(
  previousBackfill,
  ["Previous litter", "Missing fields", "Drive folder"],
  (item) => `| ${item.litter.name} | ${item.missing.join(", ")} | ${item.driveFolder || "_No folder hint_"} |`,
)}

## Spreadsheet-Friendly Checklist

The full task list was exported to:

\`\`\`text
outputs/photo-intake-checklist.tsv
\`\`\`

Use that TSV when a weekly photo day has a lot of puppies and you want a copy/paste checklist beside the Drive folder.

## After Photo Import Publishing Steps

After weekly puppy photos or litter notes are added to website data, keep the Website Hub sheets aligned before pushing live:

\`\`\`bash
npm run sync:puppies
npm run sync:litters
npm run review:sheets
npm run publish:check
\`\`\`

If parent photos or previous-litter archive images changed too, run the matching targeted sync before \`review:sheets\`:

\`\`\`bash
npm run sync:parents
npm run sync:previous-litters
\`\`\`
`;

fs.writeFileSync(reportPath, report);

console.log(`Photo workflow packet written to ${path.relative(root, reportPath)}`);
console.log(`Photo intake checklist written to ${path.relative(root, checklistPath)}`);
