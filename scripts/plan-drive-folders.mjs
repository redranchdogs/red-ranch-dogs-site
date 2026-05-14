import fs from "node:fs";
import path from "node:path";

const DEFAULT_WEBSITE_HUB_FOLDER_ID = "1ZaNby7ls-st08I49iVRcKV6Xfx-Ezaek";
const root = process.cwd();
const outputPath = path.join(root, "outputs", "drive-folder-plan.tsv");
const shouldWrite = process.argv.includes("--write");

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

function pathPartsFromHint(hint = "") {
  const parts = String(hint)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (normalize(parts[0]) === "website hub") return parts.slice(1);

  return parts;
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
    plans.push({
      category: "litter",
      label: litter.name,
      pathParts: pathPartsFromHint(litter.photoFolderHint),
      source: `src/data/litters.json:${litter.slug}`,
    });
  }

  const litterPuppies = puppies.filter((puppy) => puppy.litterSlug === litter.slug);
  const weekNumbers = new Set(
    litterPuppies
      .flatMap((puppy) => puppy.weeklyPhotos || [])
      .map((week) => String(week.week || "").match(/\d+/)?.[0])
      .filter(Boolean),
  );

  [...weekNumbers].forEach((week) => {
    const baseParts = pathPartsFromHint(litter.photoFolderHint || `Weekly Photo Drops / ${litter.name}`);
    const alreadyHasWeek = baseParts.some((part) => normalize(part) === `week ${week}`);

    plans.push({
      category: "litter-week",
      label: `${litter.name} Week ${week}`,
      pathParts: alreadyHasWeek ? baseParts : [...baseParts, `Week ${week}`],
      source: `src/data/puppies.json:${litter.slug}`,
    });
  });
});

previousLitters.filter(isPublicRecord).forEach((litter) => {
  if (litter.photoFolderHint) {
    plans.push({
      category: "previous-litter",
      label: litter.name,
      pathParts: pathPartsFromHint(litter.photoFolderHint),
      source: `src/data/previousLitters.json:${litter.href}`,
    });
  }
});

parents.filter(isPublicRecord).forEach((parent) => {
  if (parent.photoFolderHint) {
    plans.push({
      category: "parent",
      label: parent.name,
      pathParts: pathPartsFromHint(parent.photoFolderHint),
      source: `src/data/parents.json:${parent.slug}`,
    });
  }
});

const unique = uniquePlans(plans).sort(
  (first, second) => first.category.localeCompare(second.category) || first.label.localeCompare(second.label),
);
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

console.log(`${shouldWrite ? "Ensured" : "Planned"} ${unique.length} Drive folder paths.`);
console.log(`Drive folder plan written to ${path.relative(root, outputPath)}`);
if (!shouldWrite) {
  console.log("No Drive folders were created. Run `npm run drive:folders:write` when you intentionally want to create missing folders.");
}
