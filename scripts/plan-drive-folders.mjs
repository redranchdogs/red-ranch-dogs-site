import fs from "node:fs";
import path from "node:path";

const DEFAULT_WEBSITE_HUB_FOLDER_ID = "1ZaNby7ls-st08I49iVRcKV6Xfx-Ezaek";
const root = process.cwd();
const outputPath = path.join(root, "outputs", "drive-folder-plan.tsv");
const shouldWrite = process.argv.includes("--write");
const mediaOnly = process.argv.includes("--media-only");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
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

      const index = trimmed.indexOf("=");
      values[trimmed.slice(0, index)] = trimmed.slice(index + 1).replace(/^["']|["']$/g, "");
    });

  return values;
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

function pathPartsFromHint(hint = "") {
  const parts = String(hint)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (normalize(parts[0]) === "website hub") return parts.slice(1);

  return parts;
}

function parseWeekLabel(value = "") {
  const match = String(value).match(/\bweek\s*(\d+)\b/i);
  if (match) return `Week ${match[1]}`;
  if (normalize(value).includes("newborn")) return "Newborn Photos";
  return "";
}

function latestWeekLabel(litter, litterPuppies) {
  const labels = [
    parseWeekLabel(litter.weeklyUpdateStatus || ""),
    ...litterPuppies.flatMap((puppy) => puppy.weeklyPhotos || []).map((week) => parseWeekLabel(week.week || "")),
  ].filter(Boolean);

  if (!labels.length) return "";
  if (labels.includes("Newborn Photos") && labels.length === 1) return "Newborn Photos";

  const weekNumbers = labels
    .map((label) => Number(String(label).match(/\d+/)?.[0]))
    .filter((week) => Number.isFinite(week));

  if (!weekNumbers.length) return "Newborn Photos";
  return `Week ${Math.max(...weekNumbers)}`;
}

function nextWeekLabel(latest = "") {
  const parsed = Number(String(latest).match(/\d+/)?.[0]);
  if (Number.isFinite(parsed)) return `Week ${parsed + 1}`;
  return "Week 1";
}

function weekPathParts(baseFolderHint, weekLabel) {
  const parts = pathPartsFromHint(baseFolderHint);
  const last = normalize(parts.at(-1));

  if (last === "photos" || last === "videos") parts.pop();

  const normalizedWeek = normalize(weekLabel);
  if (parts.some((part) => normalize(part) === normalizedWeek)) return parts;

  if (normalizedWeek !== "newborn photos" && normalize(parts.at(-1)) === "newborn photos") {
    parts.pop();
  }

  return [...parts, weekLabel];
}

function addPlan({ category, label, pathParts, source }) {
  plans.push({ category, label, pathParts, source });
}

function addMediaWeekPlans({ category, label, weekParts, source }) {
  const photoLabel = normalize(label).endsWith("photos") ? `${label} Folder` : `${label} Photos`;
  addPlan({ category, label, pathParts: weekParts, source });
  addPlan({ category: `${category}-photos`, label: photoLabel, pathParts: [...weekParts, "Photos"], source });
  addPlan({ category: `${category}-videos`, label: `${label} Videos`, pathParts: [...weekParts, "Videos"], source });
}

function uniquePlans(plans) {
  const seen = new Set();

  return plans.filter((plan) => {
    const key = `${plan.category}|${plan.pathParts.join("/")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function tsvCell(value) {
  return String(value ?? "").replace(/\t/g, " ").replace(/\r?\n/g, " ");
}

async function readJsonResponse(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Bridge returned non-JSON response: ${text.slice(0, 240)}`);
  }
}

async function ensurePath({ bridgeUrl, bridgeSecret, parentFolderId, pathParts }) {
  const response = await fetch(bridgeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "ensurePath",
      secret: bridgeSecret,
      parentFolderId,
      pathParts,
    }),
  });
  const result = await readJsonResponse(response);

  if (!result.ok) {
    throw new Error(result.error || `Unable to ensure ${pathParts.join("/")}`);
  }

  return result;
}

const litters = readJson("src/data/litters.json");
const previousLitters = readJson("src/data/previousLitters.json");
const parents = readJson("src/data/parents.json");
const puppies = readJson("src/data/puppies.json");
const env = loadLocalEnv();
const bridgeUrl = process.env.RED_RANCH_BRIDGE_URL || env.RED_RANCH_BRIDGE_URL;
const bridgeSecret = process.env.RED_RANCH_BRIDGE_SECRET || env.RED_RANCH_BRIDGE_SECRET;
const parentFolderId =
  process.env.RED_RANCH_WEBSITE_HUB_FOLDER_ID || env.RED_RANCH_WEBSITE_HUB_FOLDER_ID || DEFAULT_WEBSITE_HUB_FOLDER_ID;
const plans = [];

litters.filter(isPublicRecord).forEach((litter) => {
  if (litter.photoFolderHint) {
    addPlan({
      category: "litter",
      label: litter.name,
      pathParts: pathPartsFromHint(litter.photoFolderHint),
      source: `src/data/litters.json:${litter.slug}`,
    });
  }

  const litterPuppies = puppies.filter((puppy) => puppy.litterSlug === litter.slug);
  const recordedWeeks = new Map();
  litterPuppies.flatMap((puppy) => puppy.weeklyPhotos || []).forEach((week) => {
    const label = parseWeekLabel(week.week || "");
    if (!label) return;
    recordedWeeks.set(label, week.folderHint || litter.photoFolderHint || `Weekly Media Drops / Current Litters / ${litter.name}`);
  });

  recordedWeeks.forEach((folderHint, weekLabel) => {
    addMediaWeekPlans({
      category: "litter-week",
      label: `${litter.name} ${weekLabel}`,
      weekParts: weekPathParts(folderHint, weekLabel),
      source: `src/data/puppies.json:${litter.slug}`,
    });
  });

  if (isCurrentLitter(litter)) {
    const latest = latestWeekLabel(litter, litterPuppies);
    const next = nextWeekLabel(latest);

    addMediaWeekPlans({
      category: "litter-next-week",
      label: `${litter.name} ${next}`,
      weekParts: weekPathParts(litter.photoFolderHint || `Weekly Media Drops / Current Litters / ${litter.name}`, next),
      source: `src/data/litters.json:${litter.slug}`,
    });
  }
});

previousLitters.filter(isPublicRecord).forEach((litter) => {
  if (litter.photoFolderHint) {
    addPlan({
      category: "previous-litter",
      label: litter.name,
      pathParts: pathPartsFromHint(litter.photoFolderHint),
      source: `src/data/previousLitters.json:${litter.href}`,
    });
  }

  if (!litter.photoFolderHint) return;

  (litter.milestones || []).map(parseWeekLabel).filter(Boolean).forEach((weekLabel) => {
    addMediaWeekPlans({
      category: "previous-litter-week",
      label: `${litter.name} ${weekLabel}`,
      weekParts: weekPathParts(litter.photoFolderHint || `Weekly Media Drops / Previous Litters / ${litter.name}`, weekLabel),
      source: `src/data/previousLitters.json:${litter.href}`,
    });
  });
});

parents.filter(isPublicRecord).forEach((parent) => {
  if (parent.photoFolderHint) {
    addPlan({
      category: "parent",
      label: parent.name,
      pathParts: pathPartsFromHint(parent.photoFolderHint),
      source: `src/data/parents.json:${parent.slug}`,
    });
  }
});

const unique = uniquePlans(plans)
  .filter((plan) => !mediaOnly || normalize(plan.pathParts[0]) === "weekly media drops")
  .sort((first, second) => first.category.localeCompare(second.category) || first.label.localeCompare(second.label));
const rows = [["category", "label", "folder_path_inside_website_hub", "source", "status"]];

if (shouldWrite) {
  if (!bridgeUrl || !bridgeSecret) {
    throw new Error("RED_RANCH_BRIDGE_URL and RED_RANCH_BRIDGE_SECRET are required for --write.");
  }

  for (const plan of unique) {
    const result = await ensurePath({
      bridgeSecret,
      bridgeUrl,
      parentFolderId,
      pathParts: plan.pathParts,
    });

    rows.push([plan.category, plan.label, plan.pathParts.join(" / "), plan.source, `ensured: ${result.url}`]);
  }
} else {
  unique.forEach((plan) => {
    rows.push([plan.category, plan.label, plan.pathParts.join(" / "), plan.source, "planned"]);
  });
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, rows.map((row) => row.map(tsvCell).join("\t")).join("\n") + "\n");

console.log(`${shouldWrite ? "Ensured" : "Planned"} ${unique.length} Drive folder paths${mediaOnly ? " for weekly media" : ""}.`);
console.log(`Drive folder plan written to ${path.relative(root, outputPath)}`);
if (!shouldWrite) {
  console.log(
    `No Drive folders were created. Run \`${mediaOnly ? "npm run drive:media-folders:write" : "npm run drive:folders:write"}\` when you intentionally want to create missing folders.`,
  );
}
