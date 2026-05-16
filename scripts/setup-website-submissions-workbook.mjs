import fs from "node:fs";
import path from "node:path";

const DEFAULT_SUBMISSIONS_SHEET_ID = "1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE";
const EXPECTED_BRIDGE_VERSION = "3.2.0";
const root = process.cwd();
const envPath = path.join(root, ".env.local");

function loadLocalEnv() {
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

async function readJson(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Bridge returned non-JSON response: ${text.slice(0, 200)}`);
  }
}

async function main() {
  loadLocalEnv();

  const bridgeUrl = process.env.RED_RANCH_BRIDGE_URL;
  const bridgeSecret = process.env.RED_RANCH_BRIDGE_SECRET;
  const spreadsheetId = process.argv[2] || DEFAULT_SUBMISSIONS_SHEET_ID;

  if (!bridgeUrl || !bridgeSecret) {
    throw new Error("RED_RANCH_BRIDGE_URL and RED_RANCH_BRIDGE_SECRET are required.");
  }

  const healthResponse = await fetch(bridgeUrl);
  const health = await readJson(healthResponse);

  if (!health.ok) {
    throw new Error(`Bridge health check failed: ${health.error || "unknown error"}`);
  }

  console.log(`Bridge reachable: ${health.version || "unknown version"}`);

  if (health.version !== EXPECTED_BRIDGE_VERSION) {
    throw new Error(
      `Bridge version ${health.version || "unknown"} is live. Redeploy scripts/website-bridge-apps-script.js for compact sheet formatting and bridge-managed notification emails v${EXPECTED_BRIDGE_VERSION}, then rerun npm run bridge:setup-submissions.`
    );
  }

  const response = await fetch(bridgeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: bridgeSecret,
      action: "setupWebsiteSubmissionsWorkbook",
      spreadsheetId,
    }),
  });
  const result = await readJson(response);

  if (!result.ok) {
    throw new Error(result.error || "Workbook setup failed.");
  }

  console.log(`Formatted workbook: ${spreadsheetId}`);
  console.log(`Tabs: ${result.formattedTabs.join(", ")}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
