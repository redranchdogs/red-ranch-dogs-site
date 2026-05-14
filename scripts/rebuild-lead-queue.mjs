import fs from "node:fs";
import path from "node:path";

const DEFAULT_SUBMISSIONS_SHEET_ID = "1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE";
const EXPECTED_BRIDGE_VERSION = "3.1.0";
const root = process.cwd();
const envPath = path.join(root, ".env.local");

const leadQueueHeaders = [
  "Status",
  "Follow Up Date",
  "Owner",
  "Next Action",
  "Outcome",
  "Submitted At",
  "Name",
  "Email",
  "Phone",
  "Lead Type",
  "Priority",
  "Breed / Interest",
  "Timing",
  "Location",
  "Recommended Next Step",
  "Lead Summary",
  "Submission ID",
  "Notes"
];

const dashboardRows = [
  ["Website Submissions Dashboard", "", "", ""],
  ["Use this as the quick daily view. The Lead Queue is the only tab you need to work from most days.", "", "", ""],
  ["Metric", "Formula / Value", "What it means", "Action"],
  ["Total raw submissions", "=MAX(COUNTA('Website Leads'!A2:A),0)", "Everything that has come through the website.", "No action needed."],
  [
    "Unworked / blank status",
    '=COUNTIFS(\'Lead Queue\'!F2:F,"<>",\'Lead Queue\'!A2:A,"")',
    "Rows without a status chosen yet.",
    "Start here each day."
  ],
  [
    "Needs reply",
    '=COUNTIFS(\'Lead Queue\'!F2:F,"<>",\'Lead Queue\'!A2:A,"Needs reply")',
    "People who still need a response.",
    "Reply or text."
  ],
  [
    "Follow up",
    '=COUNTIFS(\'Lead Queue\'!F2:F,"<>",\'Lead Queue\'!A2:A,"Follow up")',
    "People waiting on a later follow-up.",
    "Check Follow Up Date."
  ],
  [
    "Waiting on family",
    '=COUNTIFS(\'Lead Queue\'!F2:F,"<>",\'Lead Queue\'!A2:A,"Waiting on family")',
    "You have replied and they owe you an answer.",
    "No action unless date is due."
  ],
  [
    "On waitlist",
    '=COUNTIFS(\'Lead Queue\'!F2:F,"<>",\'Lead Queue\'!A2:A,"On waitlist")',
    "Families who have moved into waitlist tracking.",
    "Confirm they are also on the public/internal waitlist if needed."
  ],
  ["", "", "", ""],
  ["Quick status guide", "", "", ""],
  ["New", "", "Fresh lead that has not been worked yet.", "Choose a next action."],
  ["Needs reply", "", "Needs Adam/Callie/Nicole to reply.", "Reply today if possible."],
  ["Replied", "", "You responded and no follow-up is needed yet.", "Add follow-up date only if needed."],
  ["Follow up", "", "You need to check back later.", "Set Follow Up Date."],
  ["Deposit info sent", "", "Deposit/payment instructions were sent.", "Watch for payment and update outcome."],
  ["Waiting on family", "", "They owe you an answer.", "Leave alone unless due."],
  ["On waitlist", "", "They joined a breed waitlist.", "Make sure waitlist sheet is updated."]
];

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
    throw new Error(`Bridge returned non-JSON response: ${text.slice(0, 200)}`);
  }
}

async function postBridge(payload) {
  const response = await fetch(process.env.RED_RANCH_BRIDGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.RED_RANCH_BRIDGE_SECRET,
      ...payload
    })
  });
  const result = await readJson(response);

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Bridge request failed.");
  }

  return result;
}

async function getBridgeHealth() {
  const response = await fetch(process.env.RED_RANCH_BRIDGE_URL);
  const result = await readJson(response);

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Bridge health check failed.");
  }

  return result;
}

function cell(row, index) {
  return row?.[index] || "";
}

function queueInterest(rawRow) {
  return cell(rawRow, 23) || cell(rawRow, 24) || cell(rawRow, 25) || cell(rawRow, 44) || cell(rawRow, 22);
}

function queueTiming(rawRow) {
  return cell(rawRow, 43) || cell(rawRow, 27) || cell(rawRow, 51);
}

function queueRowFromRaw(rawRow, previousBySubmissionId) {
  const submissionId = cell(rawRow, 1);
  const existing = previousBySubmissionId.get(submissionId) || [];

  return [
    cell(existing, 0),
    cell(existing, 1),
    cell(existing, 2),
    cell(existing, 3),
    cell(existing, 4),
    cell(rawRow, 0),
    cell(rawRow, 19),
    cell(rawRow, 20),
    cell(rawRow, 21),
    cell(rawRow, 4),
    cell(rawRow, 7),
    queueInterest(rawRow),
    queueTiming(rawRow),
    cell(rawRow, 35),
    cell(rawRow, 8),
    cell(rawRow, 9),
    submissionId,
    cell(existing, 17)
  ];
}

async function main() {
  loadLocalEnv();

  const spreadsheetId = process.argv[2] || process.env.FORM_SHEET_ID || DEFAULT_SUBMISSIONS_SHEET_ID;

  if (!process.env.RED_RANCH_BRIDGE_URL || !process.env.RED_RANCH_BRIDGE_SECRET) {
    throw new Error("RED_RANCH_BRIDGE_URL and RED_RANCH_BRIDGE_SECRET are required.");
  }

  const health = await getBridgeHealth();

  const bridgeSupportsCompactLayout = health.version === EXPECTED_BRIDGE_VERSION;

  if (!bridgeSupportsCompactLayout) {
    console.warn(
      `Bridge version ${health.version || "unknown"} is live. Redeploy scripts/website-bridge-apps-script.js for compact sheet formatting v${EXPECTED_BRIDGE_VERSION}.`
    );
  }

  const raw = await postBridge({
    action: "getSheetValues",
    spreadsheetId,
    sheetName: "Website Leads"
  });
  const queue = await postBridge({
    action: "getSheetValues",
    spreadsheetId,
    sheetName: "Lead Queue"
  });

  const previousBySubmissionId = new Map();
  (queue.values || []).slice(1).forEach((row) => {
    const submissionId = cell(row, 16);

    if (submissionId) {
      previousBySubmissionId.set(submissionId, row);
    }
  });

  const queueRows = (raw.values || [])
    .slice(1)
    .filter((row) => cell(row, 0) || cell(row, 1))
    .map((row) => queueRowFromRaw(row, previousBySubmissionId));

  await postBridge({
    action: "replaceSheet",
    spreadsheetId,
    sheetName: "Lead Dashboard",
    values: dashboardRows
  });

  await postBridge({
    action: "replaceSheet",
    spreadsheetId,
    sheetName: "Lead Queue",
    values: [leadQueueHeaders, ...queueRows]
  });

  if (bridgeSupportsCompactLayout) {
    await postBridge({
      action: "setupWebsiteSubmissionsWorkbook",
      spreadsheetId
    });
  } else {
    console.warn("Skipped workbook formatting so the older deployed bridge does not reapply oversized wrapped rows.");
  }

  console.log(`Rebuilt Lead Queue from ${queueRows.length} raw website submission rows.`);
  console.log("Dashboard formulas refreshed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
