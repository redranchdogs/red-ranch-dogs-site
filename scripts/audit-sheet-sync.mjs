import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outputDir = path.join(root, "outputs", "content-sheet-exports");
const outputPath = path.join(root, "docs", "SHEET_SYNC_REVIEW.md");

function loadLocalEnv() {
  const envPath = path.join(root, ".env.local");

  if (!fs.existsSync(envPath)) return;

  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;

      const [key, ...valueParts] = trimmed.split("=");

      if (!process.env[key]) {
        process.env[key] = valueParts.join("=").trim();
      }
    });
}

loadLocalEnv();

const BRIDGE_URL = process.env.RED_RANCH_BRIDGE_URL;
const BRIDGE_SECRET = process.env.RED_RANCH_BRIDGE_SECRET;

const JOBS = [
  {
    label: "Puppy Tracker",
    spreadsheetId: "1u3E1OeSyQ5ua5CDVz1GMxNVJilma20FGB0lWjfBHc-Q",
    sheetName: "Puppy Tracker",
    generatedFile: "puppy-tracker.tsv",
    keyColumns: ["slug"],
    ignoredColumns: ["matched_family_display", "internal_notes"],
  },
  {
    label: "Litters",
    spreadsheetId: "1oS382V4YJ9hMMYB78ixEDilJz2iETfIxwUuXMIxjK2U",
    sheetName: "Litters",
    generatedFile: "litters.tsv",
    keyColumns: ["slug"],
    ignoredColumns: ["internalNotes"],
  },
  {
    label: "Previous Litters",
    spreadsheetId: "1oS382V4YJ9hMMYB78ixEDilJz2iETfIxwUuXMIxjK2U",
    sheetName: "Previous Litters",
    generatedFile: "previous-litters.tsv",
    keyColumns: ["href"],
    ignoredColumns: ["internalNotes"],
    allowExtraLiveRows: true,
  },
  {
    label: "Parent Dogs",
    spreadsheetId: "1uBmBUkYR-8PZiMsfi9NNJKWkCtQDv_-Zn1NN0OFXU_0",
    sheetName: "Parent Dogs",
    generatedFile: "parent-dogs.tsv",
    keyColumns: ["slug"],
    ignoredColumns: ["internalNotes"],
  },
];

function runExport() {
  const result = spawnSync(process.execPath, ["scripts/export-content-sheets.mjs"], {
    cwd: root,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error("Sheet export failed.");
  }
}

function readTsv(fileName) {
  const filePath = path.join(outputDir, fileName);
  return fs
    .readFileSync(filePath, "utf8")
    .trimEnd()
    .split(/\r?\n/)
    .map((line) => line.split("\t"));
}

function rowToMap(headers, row) {
  return Object.fromEntries(headers.map((header, index) => [header, String(row[index] || "").trim()]));
}

function makeKey(rowMap, keyColumns) {
  return keyColumns.map((column) => String(rowMap[column] || "").trim().toLowerCase()).join("::");
}

function normalizeForCompare(value) {
  const text = String(value || "").trim();
  const monthYear = text.match(
    /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i
  );
  const firstOfMonth = text.match(
    /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+1,\s+(\d{4})$/i
  );

  if (monthYear) {
    return `${monthYear[1].toLowerCase()} ${monthYear[2]}`;
  }

  if (firstOfMonth) {
    return `${firstOfMonth[1].toLowerCase()} ${firstOfMonth[2]}`;
  }

  return text;
}

function asRowsByKey(values, keyColumns) {
  const headers = values[0] || [];
  const rows = new Map();

  values.slice(1).forEach((row) => {
    const rowMap = rowToMap(headers, row);
    const key = makeKey(rowMap, keyColumns);

    if (key.replace(/:/g, "")) {
      rows.set(key, rowMap);
    }
  });

  return { headers, rows };
}

async function callBridge(payload) {
  if (!BRIDGE_URL || !BRIDGE_SECRET) {
    throw new Error("RED_RANCH_BRIDGE_URL and RED_RANCH_BRIDGE_SECRET are required.");
  }

  const response = await fetch(BRIDGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: BRIDGE_SECRET, ...payload }),
  });
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Bridge returned non-JSON response: ${text.slice(0, 200)}`);
  }
}

function compareJob(job, generatedValues, liveValues) {
  const generated = asRowsByKey(generatedValues, job.keyColumns);
  const live = asRowsByKey(liveValues, job.keyColumns);
  const ignoredColumns = new Set(job.ignoredColumns || []);
  const missingRows = [];
  const extraRows = [];
  const mismatches = [];
  const missingHeaders = generated.headers.filter((header) => header && !live.headers.includes(header));

  generated.rows.forEach((generatedRow, key) => {
    const liveRow = live.rows.get(key);

    if (!liveRow) {
      missingRows.push(key);
      return;
    }

    generated.headers.forEach((header) => {
      if (!header || ignoredColumns.has(header)) return;

      const expected = generatedRow[header] || "";
      const actual = liveRow[header] || "";

      if (normalizeForCompare(expected) !== normalizeForCompare(actual)) {
        mismatches.push({ key, header, expected, actual });
      }
    });
  });

  if (!job.allowExtraLiveRows) {
    live.rows.forEach((_, key) => {
      if (!generated.rows.has(key)) {
        extraRows.push(key);
      }
    });
  }

  return {
    label: job.label,
    generatedRows: generated.rows.size,
    liveRows: live.rows.size,
    missingHeaders,
    missingRows,
    extraRows,
    mismatches,
  };
}

function bulletList(items, formatter = (item) => item) {
  if (!items.length) return "- None.";
  return items.map((item) => `- ${formatter(item)}`).join("\n");
}

runExport();

const results = [];

for (const job of JOBS) {
  const live = await callBridge({
    action: "getSheetValues",
    spreadsheetId: job.spreadsheetId,
    sheetName: job.sheetName,
  });

  if (!live.ok) {
    throw new Error(`${job.label}: ${live.error || "could not read live sheet"}`);
  }

  results.push(compareJob(job, readTsv(job.generatedFile), live.values || []));
}

const blockers = results.flatMap((result) => [
  ...result.missingHeaders.map((header) => `${result.label}: live sheet is missing column "${header}".`),
  ...result.missingRows.map((key) => `${result.label}: live sheet is missing generated record "${key}".`),
  ...result.extraRows.map((key) => `${result.label}: live sheet has extra record "${key}".`),
  ...result.mismatches.map(
    (mismatch) =>
      `${result.label}: ${mismatch.key} column "${mismatch.header}" is out of sync. Website="${mismatch.expected}" Sheet="${mismatch.actual}".`
  ),
]);
const status = blockers.length ? "FAIL" : "PASS";
const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });

const report = [
  "# Sheet Sync Review",
  "",
  `Generated: ${generatedAt} Central`,
  "",
  `Status: **${status}**`,
  "",
  "This is a read-only comparison between website-generated sheet exports and the live Website Hub sheets. It does not write to Google Sheets.",
  "",
  "## Sheet Summary",
  "",
  "| Sheet | Website rows | Live rows | Missing columns | Missing rows | Extra rows | Cell mismatches |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...results.map(
    (result) =>
      `| ${result.label} | ${result.generatedRows} | ${result.liveRows} | ${result.missingHeaders.length} | ${result.missingRows.length} | ${result.extraRows.length} | ${result.mismatches.length} |`
  ),
  "",
  "## Items To Fix",
  "",
  bulletList(blockers.slice(0, 50)),
  blockers.length > 50 ? `- ...and ${blockers.length - 50} more sheet sync items.` : "",
  "",
  "## Recommended Fix",
  "",
  blockers.length
    ? "Run `npm run sync:sheets` after confirming the website data is the source of truth, then rerun `npm run review:sheets`."
    : "No sheet sync fixes are needed right now.",
  "",
].filter(Boolean).join("\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, report);

console.log(`Sheet sync review written to ${path.relative(root, outputPath)}`);
console.log(`Status: ${status}`);

if (blockers.length) {
  process.exit(1);
}
