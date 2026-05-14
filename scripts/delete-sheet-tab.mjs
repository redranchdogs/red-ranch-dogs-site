import fs from "node:fs";
import path from "node:path";

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

function usage() {
  console.log("Usage: node scripts/delete-sheet-tab.mjs <spreadsheetId> <sheetName>");
  console.log(
    'Example: node scripts/delete-sheet-tab.mjs 1oS382V4YJ9hMMYB78ixEDilJz2iETfIxwUuXMIxjK2U "Bridge Smoke Test"'
  );
}

async function main() {
  loadLocalEnv();

  const [, , spreadsheetId, ...sheetNameParts] = process.argv;
  const sheetName = sheetNameParts.join(" ");

  if (!spreadsheetId || !sheetName) {
    usage();
    process.exit(1);
  }

  const bridgeUrl = process.env.RED_RANCH_BRIDGE_URL;
  const bridgeSecret = process.env.RED_RANCH_BRIDGE_SECRET;

  if (!bridgeUrl || !bridgeSecret) {
    throw new Error("RED_RANCH_BRIDGE_URL and RED_RANCH_BRIDGE_SECRET are required.");
  }

  const response = await fetch(bridgeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: bridgeSecret,
      action: "deleteSheet",
      spreadsheetId,
      sheetName,
    }),
  });
  const result = await readJson(response);

  if (!result.ok) {
    throw new Error(result.error || "Bridge deleteSheet failed.");
  }

  if (result.deleted) {
    console.log(`Deleted sheet tab: ${result.sheetName}`);
  } else {
    console.log(`No delete needed: ${result.sheetName} did not exist.`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
