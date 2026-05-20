import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const reportPath = path.join(root, "docs", "FORM_NOTIFICATION_RECHECK.md");
const defaultFormSheetId = "1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE";
const liveEndpoint = "https://www.redranchdogs.com/api/forms";

function loadLocalEnv() {
  if (!fs.existsSync(envPath)) return;

  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
      const [key, ...valueParts] = trimmed.split("=");
      if (!process.env[key]) process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
    });
}

async function readJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response: ${text.slice(0, 240)}`);
  }
}

async function getSheetValues(sheetName) {
  const bridgeUrl = process.env.RED_RANCH_BRIDGE_URL;
  const bridgeSecret = process.env.RED_RANCH_BRIDGE_SECRET;
  if (!bridgeUrl || !bridgeSecret) {
    throw new Error("RED_RANCH_BRIDGE_URL and RED_RANCH_BRIDGE_SECRET are required for sheet verification.");
  }

  const response = await fetch(bridgeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "getSheetValues",
      secret: bridgeSecret,
      spreadsheetId: process.env.FORM_SHEET_ID || defaultFormSheetId,
      sheetName,
    }),
  });
  const json = await readJson(response);
  if (!json.ok) throw new Error(json.error || `${sheetName} read failed.`);
  return json.values || [];
}

function findRow(values, submissionId) {
  return values.find((row) => row.some((cell) => String(cell || "").includes(submissionId)));
}

loadLocalEnv();

const submissionId = `codex-live-notification-test-${Date.now()}`;
const submittedAt = new Date().toISOString();
const payload = {
  currentUrl: "https://www.redranchdogs.com/contact?codex_test=live-notification",
  email: "codex-test@redranchdogs.com",
  formTitle: "Send a Message",
  formType: "contact",
  inquiryType: "Website notification test",
  landingPage: "https://www.redranchdogs.com/",
  message: `TEST DELETE - controlled live form notification recheck. Submission ID: ${submissionId}`,
  name: "Codex Live Notification Test",
  page: "/contact",
  phone: "555-0100",
  preferredBreed: "Goldendoodle",
  referrer: "Codex controlled live recheck",
  source: "codex-live-notification-recheck",
  submittedAt,
  submissionId,
  userAgent: "Codex live form notification recheck",
};

const response = await fetch(liveEndpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
const result = await readJson(response);

if (!response.ok) {
  throw new Error(`Live form test failed: HTTP ${response.status} ${result.message || ""}`.trim());
}

const websiteLeadValues = await getSheetValues("Website Leads");
const leadQueueValues = await getSheetValues("Lead Queue");
const websiteLeadRow = findRow(websiteLeadValues, submissionId);
const leadQueueRow = findRow(leadQueueValues, submissionId);
const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
const apiStatus = response.ok ? "PASS" : "FAIL";
const websiteLeadsStatus = websiteLeadRow ? "PASS" : "FAIL";
const leadQueueStatus = leadQueueRow ? "PASS" : "FAIL";
const overall = apiStatus === "PASS" && websiteLeadsStatus === "PASS" && leadQueueStatus === "PASS" ? "PASS" : "FAIL";

const report = `# Form Notification Recheck

Generated: ${generatedAt} Central

Status: **${overall}**

Controlled test submission ID: \`${submissionId}\`

This test intentionally wrote one clearly marked \`TEST DELETE\` contact submission through the live public endpoint. It did not change form fields, sheet structure, DNS, CRM, or Apps Script bridge behavior.

## Results

| Check | Status | Detail |
| --- | --- | --- |
| Live API response | ${apiStatus} | HTTP ${response.status}; message: ${result.message || ""} |
| Website Leads row | ${websiteLeadsStatus} | ${websiteLeadRow ? "Found submission ID in `Website Leads`." : "Submission ID not found"} |
| Lead Queue row | ${leadQueueStatus} | ${leadQueueRow ? "Found submission ID in `Lead Queue`." : "Submission ID not found"} |
| Email notification | PENDING | Search Gmail/Resend for the submission ID before marking pass/fail. |

## Follow-Up

- Delete or mark this row as test/delete in the working CRM/Lead Queue flow.
- If email is missing, search Gmail Spam and Resend Activity before changing website code.
`;

fs.writeFileSync(reportPath, report);
console.log(`Form notification recheck written to ${path.relative(root, reportPath)}`);
console.log(`Submission ID: ${submissionId}`);
console.log(`Status: ${overall}`);

if (overall !== "PASS") {
  process.exit(1);
}
