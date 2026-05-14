import fs from "node:fs";
import path from "node:path";

const DEFAULT_SUBMISSIONS_SHEET_ID = "1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE";
const root = process.cwd();
const envPath = path.join(root, ".env.local");
const reportPath = path.join(root, "docs", "LEAD_WORKFLOW_PACKET.md");
const snapshotPath = path.join(root, "outputs", "lead-queue-snapshot.tsv");

function loadLocalEnv() {
  if (!fs.existsSync(envPath)) return;

  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;

      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index);
      const value = trimmed.slice(index + 1).replace(/^["']|["']$/g, "");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
}

async function readJson(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Bridge returned non-JSON response: ${text.slice(0, 240)}`);
  }
}

async function postBridge(payload) {
  const response = await fetch(process.env.RED_RANCH_BRIDGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.RED_RANCH_BRIDGE_SECRET,
      ...payload,
    }),
  });
  const result = await readJson(response);

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Bridge request failed.");
  }

  return result;
}

function cell(row, index) {
  return row?.[index] || "";
}

function countBy(rows, index) {
  const counts = new Map();

  rows.forEach((row) => {
    const value = cell(row, index) || "(blank)";
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function markdownCountTable(rows, emptyLabel = "No rows found.") {
  if (!rows.length) {
    return `- ${emptyLabel}`;
  }

  return [
    "| Value | Count |",
    "| --- | ---: |",
    ...rows.map(([value, count]) => `| ${value} | ${count} |`),
  ].join("\n");
}

function parseCentralDate(value) {
  if (!value) return null;
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return null;

  return new Date(parsed.toLocaleDateString("en-US", { timeZone: "America/Chicago" }));
}

function tsvEscape(value) {
  return String(value ?? "").replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function redactedSnapshotRows(queueRows) {
  const headers = [
    "submission_id",
    "submitted_at",
    "status",
    "follow_up_date",
    "owner",
    "next_action",
    "outcome",
    "lead_type",
    "priority",
    "breed_or_interest",
    "timing",
    "recommended_next_step",
  ];

  const rows = queueRows.map((row) => [
    cell(row, 16),
    cell(row, 5),
    cell(row, 0),
    cell(row, 1),
    cell(row, 2),
    cell(row, 3),
    cell(row, 4),
    cell(row, 9),
    cell(row, 10),
    cell(row, 11),
    cell(row, 12),
    cell(row, 14),
  ]);

  return [headers, ...rows].map((row) => row.map(tsvEscape).join("\t")).join("\n");
}

function buildReport({ queueRows, rawRows, spreadsheetId }) {
  const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  const today = new Date(new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago" }));
  const openRows = queueRows.filter((row) => !["Closed", "Test/delete", "Not a fit"].includes(cell(row, 0)));
  const uatRows = queueRows.filter((row) => cell(row, 16).startsWith("uat-"));
  const unarchivedUatRows = uatRows.filter((row) => cell(row, 0) !== "Test/delete");
  const blankStatusRows = queueRows.filter((row) => !cell(row, 0));
  const needsReplyRows = queueRows.filter((row) => cell(row, 0) === "Needs reply");
  const followUpRows = queueRows.filter((row) => cell(row, 0) === "Follow up");
  const overdueRows = queueRows.filter((row) => {
    const date = parseCentralDate(cell(row, 1));
    return date && date < today && !["Closed", "Test/delete", "Not a fit"].includes(cell(row, 0));
  });

  return [
    "# Lead Workflow Packet",
    "",
    `Generated: ${generatedAt} Central`,
    "",
    `Spreadsheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    "",
    "This packet is intentionally CRM-friendly without copying personal contact details into repo docs. Work the actual names, emails, and phone numbers inside the `Lead Queue` tab.",
    "",
    "## Daily Use",
    "",
    "1. Open `Lead Dashboard` for the quick counts.",
    "2. Work from `Lead Queue`, not the raw `Website Leads` tab.",
    "3. Use dropdowns for `Status`, `Owner`, `Next Action`, and `Outcome`.",
    "4. Set `Follow Up Date` only when a family needs a later touch.",
    "5. Keep `Website Leads` untouched so raw form history stays clean for the future CRM.",
    "",
    "## Current Queue",
    "",
    `- Raw website submission rows: ${rawRows.length}`,
    `- Lead queue rows: ${queueRows.length}`,
    `- Open/non-closed rows: ${openRows.length}`,
    `- UAT/test scenario rows: ${uatRows.length}`,
    `- UAT rows not marked Test/delete: ${unarchivedUatRows.length}`,
    `- Blank status rows: ${blankStatusRows.length}`,
    `- Needs reply rows: ${needsReplyRows.length}`,
    `- Follow up rows: ${followUpRows.length}`,
    `- Overdue follow-up rows: ${overdueRows.length}`,
    "",
    "## Status Counts",
    "",
    markdownCountTable(countBy(queueRows, 0), "No lead queue statuses found."),
    "",
    "## Lead Type Counts",
    "",
    markdownCountTable(countBy(queueRows, 9), "No lead types found."),
    "",
    "## Recommended Routine",
    "",
    "- Morning: filter `Status` to blank, `New`, and `Needs reply`.",
    "- Midday: filter `Next Action` to `Text family`, `Send deposit info`, and `Schedule call`.",
    "- End of day: move finished leads to `Replied`, `Waiting on family`, `On waitlist`, or `Closed`.",
    "- Weekly: archive obvious tests and closed rows into `Closed Leads` if the queue starts feeling noisy.",
    "",
    "## Automation Notes",
    "",
    "- `npm run leads:rebuild-queue` rebuilds the working queue from raw submissions while preserving manual status, owner, next action, outcome, follow-up date, and notes.",
    "- `npm run leads:packet` refreshes this packet and the redacted TSV snapshot.",
    "- `npm run leads:uat` previews fake client scenarios without writing rows.",
    "- `npm run leads:uat:write` submits fake clients through the real form handler into Google Sheets. Mark those rows `Test/delete` after review.",
    "- `npm run bridge:setup-submissions` reapplies the compact workbook layout after the latest bridge code is deployed.",
    "",
    "## Files",
    "",
    "- `docs/LEAD_WORKFLOW_PACKET.md`",
    "- `outputs/lead-queue-snapshot.tsv`",
    "",
  ].join("\n");
}

async function main() {
  loadLocalEnv();

  const spreadsheetId = process.argv[2] || process.env.FORM_SHEET_ID || DEFAULT_SUBMISSIONS_SHEET_ID;

  if (!process.env.RED_RANCH_BRIDGE_URL || !process.env.RED_RANCH_BRIDGE_SECRET) {
    throw new Error("RED_RANCH_BRIDGE_URL and RED_RANCH_BRIDGE_SECRET are required.");
  }

  const queue = await postBridge({
    action: "getSheetValues",
    spreadsheetId,
    sheetName: "Lead Queue",
  });
  const raw = await postBridge({
    action: "getSheetValues",
    spreadsheetId,
    sheetName: "Website Leads",
  });

  const queueRows = (queue.values || []).slice(1).filter((row) => cell(row, 5) || cell(row, 16));
  const rawRows = (raw.values || []).slice(1).filter((row) => cell(row, 0) || cell(row, 1));

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
  fs.writeFileSync(reportPath, buildReport({ queueRows, rawRows, spreadsheetId }));
  fs.writeFileSync(snapshotPath, `${redactedSnapshotRows(queueRows)}\n`);

  console.log(`Lead workflow packet written to ${path.relative(root, reportPath)}`);
  console.log(`Redacted lead snapshot written to ${path.relative(root, snapshotPath)}`);
  console.log(`Lead queue rows: ${queueRows.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
