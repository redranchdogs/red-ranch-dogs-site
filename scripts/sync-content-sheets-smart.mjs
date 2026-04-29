import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outputDir = path.join(root, "outputs", "content-sheet-exports");
const dryRun = process.argv.includes("--dry-run");

const BRIDGE_URL = process.env.RED_RANCH_BRIDGE_URL;
const BRIDGE_SECRET = process.env.RED_RANCH_BRIDGE_SECRET;

const JOBS = [
  {
    label: "Puppy Tracker",
    spreadsheetId: "1u3E1OeSyQ5ua5CDVz1GMxNVJilma20FGB0lWjfBHc-Q",
    sheetName: "Puppy Tracker",
    generatedFile: "puppy-tracker.tsv",
    keyColumns: ["slug"],
    preserveIfExisting: ["matched_family_display", "internal_notes"],
  },
  {
    label: "Litters",
    spreadsheetId: "1oS382V4YJ9hMMYB78ixEDilJz2iETfIxwUuXMIxjK2U",
    sheetName: "Litters",
    generatedFile: "litters.tsv",
    keyColumns: ["slug"],
    preserveIfExisting: ["internalNotes"],
  },
  {
    label: "Parent Dogs",
    spreadsheetId: "1uBmBUkYR-8PZiMsfi9NNJKWkCtQDv_-Zn1NN0OFXU_0",
    sheetName: "Parent Dogs",
    generatedFile: "parent-dogs.tsv",
    keyColumns: ["slug"],
    preserveIfExisting: ["internalNotes"],
  },
  {
    label: "Public Waitlist",
    spreadsheetId: "1oChFvNCdwrtIAYWFQlsZKrTnz9tnu6Yr-Tc6WKMGSOI",
    sheetName: "Public Waitlist",
    generatedValues: waitlistValues,
    keyColumns: ["breed", "position"],
    preserveIfExisting: ["notes", "internal_notes"],
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

function waitlistValues() {
  const data = JSON.parse(fs.readFileSync(path.join(root, "src/data/waitlist.json"), "utf8"));
  const records = Array.isArray(data) ? data : data.publicRows || [];
  const headers = ["breed", "position", "display_name", "status", "show_publicly", "public_notes"];
  const rows = records.map((record) => [
    record.breed,
    record.position,
    record.display_name || record.displayName,
    record.status || "Active",
    record.show_publicly || "Yes",
    record.public_notes || record.publicNotes || "",
  ]);

  return [headers, ...rows];
}

function rowToMap(headers, row) {
  return Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]));
}

function makeKey(rowMap, keyColumns) {
  return keyColumns.map((column) => String(rowMap[column] || "").trim().toLowerCase()).join("::");
}

function mergeValues(existingValues, generatedValues, { keyColumns, preserveIfExisting }) {
  const generatedHeaders = generatedValues[0] || [];
  const existingHeaders = existingValues[0] || [];
  const extraExistingHeaders = existingHeaders.filter(
    (header) => header && !generatedHeaders.includes(header)
  );
  const headers = [...generatedHeaders, ...extraExistingHeaders];
  const preserveColumns = new Set(preserveIfExisting || []);
  const existingByKey = new Map();
  const seenKeys = new Set();

  existingValues.slice(1).forEach((row) => {
    const rowMap = rowToMap(existingHeaders, row);
    const key = makeKey(rowMap, keyColumns);

    if (key.replace(/:/g, "")) {
      existingByKey.set(key, rowMap);
    }
  });

  const mergedRows = generatedValues.slice(1).map((row) => {
    const generatedMap = rowToMap(generatedHeaders, row);
    const key = makeKey(generatedMap, keyColumns);
    const existingMap = existingByKey.get(key) || {};

    seenKeys.add(key);

    return headers.map((header) => {
      const generatedValue = generatedMap[header] || "";
      const existingValue = existingMap[header] || "";

      if (existingValue && preserveColumns.has(header)) {
        return existingValue;
      }

      if (!generatedValue && existingValue) {
        return existingValue;
      }

      return generatedValue;
    });
  });

  existingValues.slice(1).forEach((row) => {
    const existingMap = rowToMap(existingHeaders, row);
    const key = makeKey(existingMap, keyColumns);

    if (key.replace(/:/g, "") && !seenKeys.has(key)) {
      mergedRows.push(headers.map((header) => existingMap[header] || ""));
    }
  });

  return [headers, ...mergedRows];
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

async function syncJob(job) {
  const generatedValues =
    typeof job.generatedValues === "function" ? job.generatedValues() : readTsv(job.generatedFile);

  if (dryRun) {
    console.log(
      `[dry run] ${job.label}: ${generatedValues.length - 1} generated rows x ${
        generatedValues[0]?.length || 0
      } columns`
    );
    return;
  }

  const existing = await callBridge({
    action: "getSheetValues",
    spreadsheetId: job.spreadsheetId,
    sheetName: job.sheetName,
  });

  if (!existing.ok) {
    throw new Error(`${job.label}: ${existing.error || "could not read live sheet"}`);
  }

  const mergedValues = mergeValues(existing.values || [], generatedValues, job);
  const writeResult = await callBridge({
    action: "replaceSheet",
    spreadsheetId: job.spreadsheetId,
    sheetName: job.sheetName,
    values: mergedValues,
  });

  if (!writeResult.ok) {
    throw new Error(`${job.label}: ${writeResult.error || "could not write merged sheet"}`);
  }

  console.log(
    `${job.label}: synced ${writeResult.rows} rows x ${writeResult.columns} columns with smart merge`
  );
}

runExport();

for (const job of JOBS) {
  await syncJob(job);
}
