import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const startedAt = new Date();
const reportPath = path.join(root, "docs", "OPERATIONS_STATUS.md");
const maxOutputLength = 5000;

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

function truncateOutput(output = "") {
  const cleanOutput = output.trim();

  if (cleanOutput.length <= maxOutputLength) return cleanOutput;

  return `${cleanOutput.slice(0, maxOutputLength)}\n... output truncated ...`;
}

function runCommand(label, command, args) {
  const start = Date.now();
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: process.env,
  });
  const durationMs = Date.now() - start;
  const output = truncateOutput(`${result.stdout || ""}${result.stderr || ""}`);

  return {
    args,
    command,
    durationMs,
    label,
    ok: result.status === 0,
    output,
    status: result.status,
  };
}

async function readJson(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON bridge response: ${text.slice(0, 240)}`);
  }
}

async function checkBridge(env) {
  const bridgeUrl = env.RED_RANCH_BRIDGE_URL || process.env.RED_RANCH_BRIDGE_URL;
  const bridgeSecret = env.RED_RANCH_BRIDGE_SECRET || process.env.RED_RANCH_BRIDGE_SECRET;
  const submissionsSpreadsheetId =
    env.FORM_SHEET_ID || process.env.FORM_SHEET_ID || "1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE";
  const tabs = ["Lead Dashboard", "Lead Queue", "Reply Templates", "Workflow Notes", "Closed Leads", "Website Leads"];

  if (!bridgeUrl || !bridgeSecret) {
    return {
      ok: false,
      message: "Bridge URL or secret is missing. Add RED_RANCH_BRIDGE_URL and RED_RANCH_BRIDGE_SECRET.",
      tabs: [],
    };
  }

  try {
    const healthResponse = await fetch(bridgeUrl);
    const health = await readJson(healthResponse);

    if (!health.ok) {
      return {
        ok: false,
        message: `Bridge health failed: ${health.error || "unknown error"}`,
        tabs: [],
        version: health.version || "unknown",
      };
    }

    const tabResults = [];

    for (const sheetName of tabs) {
      const response = await fetch(bridgeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getSheetValues",
          secret: bridgeSecret,
          sheetName,
          spreadsheetId: submissionsSpreadsheetId,
        }),
      });
      const json = await readJson(response);

      if (!json.ok) {
        tabResults.push({
          columns: 0,
          error: json.error || "unknown error",
          ok: false,
          rows: 0,
          sheetName,
        });
        continue;
      }

      tabResults.push({
        columns: json.values?.[0]?.length || 0,
        ok: true,
        rows: json.values?.length || 0,
        sheetName,
      });
    }

    return {
      ok: tabResults.every((tab) => tab.ok),
      message: "Bridge is reachable and Website Submissions tabs are readable.",
      tabs: tabResults,
      version: health.version || "unknown",
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message,
      tabs: [],
    };
  }
}

function markdownStatus(ok) {
  return ok ? "PASS" : "FAIL";
}

function commandLine(check) {
  return `${check.command} ${check.args.join(" ")}`.trim();
}

function writeReport({ bridge, checks, completedAt }) {
  const failedChecks = checks.filter((check) => !check.ok);
  const bridgeStatus = bridge.ok ? "PASS" : "FAIL";
  const overallOk = bridge.ok && failedChecks.length === 0;
  const lines = [
    "# Operations Status",
    "",
    `Generated: ${completedAt.toLocaleString("en-US", { timeZone: "America/Chicago" })} Central`,
    "",
    `Overall status: **${markdownStatus(overallOk)}**`,
    "",
    "## Bridge",
    "",
    `Status: **${bridgeStatus}**`,
    bridge.version ? `Version: ${bridge.version}` : "",
    `Message: ${bridge.message}`,
    "",
    "| Sheet tab | Status | Rows | Columns |",
    "| --- | --- | ---: | ---: |",
    ...bridge.tabs.map((tab) => `| ${tab.sheetName} | ${markdownStatus(tab.ok)}${tab.error ? ` - ${tab.error}` : ""} | ${tab.rows} | ${tab.columns} |`),
    "",
    "## Checks",
    "",
    "| Check | Status | Duration | Command |",
    "| --- | --- | ---: | --- |",
    ...checks.map((check) => `| ${check.label} | ${markdownStatus(check.ok)} | ${(check.durationMs / 1000).toFixed(1)}s | \`${commandLine(check)}\` |`),
    "",
  ].filter(Boolean);

  if (failedChecks.length) {
    lines.push("## Failed Check Output", "");

    failedChecks.forEach((check) => {
      lines.push(`### ${check.label}`, "");
      lines.push("```text");
      lines.push(check.output || "No output.");
      lines.push("```", "");
    });
  }

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`);

  return overallOk;
}

const env = loadLocalEnv();
const checks = [
  runCommand("Apps Script bridge syntax", process.execPath, ["--check", "scripts/website-bridge-apps-script.js"]),
  runCommand("Lead workflow packet", "npm", ["run", "leads:packet"]),
  runCommand("Weekly workflow report", "npm", ["run", "ops:workflow"]),
  runCommand("Drive folder plan", "npm", ["run", "drive:folders"]),
  runCommand("Business accuracy review", "npm", ["run", "review:business"]),
  runCommand("Page review packet", "npm", ["run", "review:pages"]),
  runCommand("Image asset review", "npm", ["run", "review:images"]),
  runCommand("Public safety review", "npm", ["run", "review:safety"]),
  runCommand("Form API handler tests", "npm", ["run", "test:forms"]),
  runCommand("Route verification", "npm", ["run", "verify:routes"]),
  runCommand("Content validation", "npm", ["run", "validate:content"]),
  runCommand("Source-of-truth guardrails", "npm", ["run", "check:source"]),
  runCommand("Buyer-flow guardrails", "npm", ["run", "check:buyer-flow"]),
  runCommand("Lint", "npm", ["run", "lint"]),
  runCommand("Production build", "npm", ["run", "build"]),
];
const bridge = await checkBridge(env);
const completedAt = new Date();
const overallOk = writeReport({ bridge, checks, completedAt });

console.log(`Operations status written to ${path.relative(root, reportPath)}`);
console.log(`Overall status: ${markdownStatus(overallOk)}`);
console.log(`Runtime: ${((completedAt.getTime() - startedAt.getTime()) / 1000).toFixed(1)}s`);

if (!overallOk) {
  process.exit(1);
}
