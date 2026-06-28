import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const startedAt = new Date();
const reportPath = path.join(root, "docs", "WEBSITE_HEALTH_LIGHT_REPORT.md");
const maxOutputLength = 3500;
const baseUrl = (process.env.WEBSITE_HEALTH_LIGHT_BASE_URL || "https://www.redranchdogs.com").replace(/\/+$/, "");
const liveRoutes = ["/", "/puppies/available", "/puppies/current-litters", "/apply"];
const checks = [
  {
    label: "Website QA agent rollup",
    command: "npm",
    args: ["run", "agent:website-qa"],
    urgent: false
  },
  {
    label: "Buyer-flow guardrails",
    command: "npm",
    args: ["run", "check:buyer-flow"],
    urgent: true
  },
  {
    label: "Form API handler tests",
    command: "npm",
    args: ["run", "test:forms"],
    urgent: true
  },
  {
    label: "Playwright public route smoke",
    command: "npm",
    args: ["run", "check:public-routes"],
    urgent: true
  }
];

function truncateOutput(output = "") {
  const cleanOutput = output.trim();

  if (cleanOutput.length <= maxOutputLength) return cleanOutput;

  return `${cleanOutput.slice(0, maxOutputLength)}\n... output truncated ...`;
}

function commandLine(check) {
  return `${check.command} ${check.args.join(" ")}`.trim();
}

function markdownStatus(ok) {
  return ok ? "PASS" : "FAIL";
}

function runCommand(check) {
  const started = Date.now();
  const result = spawnSync(check.command, check.args, {
    cwd: root,
    encoding: "utf8",
    env: process.env,
  });

  return {
    ...check,
    durationMs: Date.now() - started,
    ok: result.status === 0,
    output: truncateOutput(`${result.stdout || ""}${result.stderr || ""}`),
    status: result.status,
  };
}

async function checkLiveRoute(route) {
  const url = `${baseUrl}${route}`;
  const started = Date.now();

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: globalThis.AbortSignal?.timeout?.(15000),
    });

    return {
      durationMs: Date.now() - started,
      ok: response.status >= 200 && response.status < 400,
      route,
      status: response.status,
      statusText: response.statusText,
      url,
    };
  } catch (error) {
    return {
      durationMs: Date.now() - started,
      error: error.message,
      ok: false,
      route,
      status: 0,
      statusText: "FETCH_FAILED",
      url,
    };
  }
}

function writeReport({ commandResults, completedAt, liveResults }) {
  const failedLiveRoutes = liveResults.filter((result) => !result.ok);
  const failedUrgentChecks = commandResults.filter((result) => !result.ok && result.urgent);
  const failedNonUrgentChecks = commandResults.filter((result) => !result.ok && !result.urgent);
  const urgentFailures = [...failedLiveRoutes, ...failedUrgentChecks];
  const overallOk = urgentFailures.length === 0;
  const reportStatus = overallOk ? "PASS" : "FAIL";
  const lines = [
    "# Website Health Light Report",
    "",
    `Generated: ${completedAt.toLocaleString("en-US", { timeZone: "America/Chicago" })} Central`,
    "",
    `Status: **${reportStatus}**`,
    "",
    "Permission level: **read-only check/report**",
    "",
    "This Daily Light Check pings public website pages and runs existing local website QA commands. It does not sync sheets, submit live forms, deploy, change production data, or touch CRM, Breeding Ops, Google Drive, DNS, env vars, ads, or payments.",
    "",
    "## Live Page Pings",
    "",
    `Base URL: \`${baseUrl}\``,
    "",
    "| Route | Status | Duration |",
    "| --- | --- | ---: |",
    ...liveResults.map((result) => {
      const status = result.ok ? `PASS ${result.status}` : `FAIL ${result.status || result.statusText}`;
      return `| ${result.route} | ${status}${result.error ? ` - ${result.error}` : ""} | ${(result.durationMs / 1000).toFixed(1)}s |`;
    }),
    "",
    "## Local Checks",
    "",
    "| Check | Status | Duration | Command |",
    "| --- | --- | ---: | --- |",
    ...commandResults.map((result) => `| ${result.label} | ${markdownStatus(result.ok)} | ${(result.durationMs / 1000).toFixed(1)}s | \`${commandLine(result)}\` |`),
    "",
    "## Urgent Issues",
    "",
    urgentFailures.length
      ? urgentFailures.map((item) => `- ${item.label || item.route}: ${item.error || item.output || item.statusText || "Failed."}`).join("\n")
      : "- None flagged.",
    "",
    "## Watch Items",
    "",
    failedNonUrgentChecks.length
      ? failedNonUrgentChecks.map((item) => `- ${item.label}: ${item.output || "Failed."}`).join("\n")
      : "- None flagged.",
    "",
    "## Notes",
    "",
    "- Daily Light Check is intentionally small and urgent-issue focused.",
    "- Use `npm run health:weekly` for the deeper full check.",
    "- Use the targeted `health:change:*` commands after major website changes.",
    "",
  ];

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`);

  return overallOk;
}

const liveResults = [];

for (const route of liveRoutes) {
  liveResults.push(await checkLiveRoute(route));
}

const commandResults = checks.map(runCommand);
const completedAt = new Date();
const overallOk = writeReport({ commandResults, completedAt, liveResults });

console.log(`Website health light report written to ${path.relative(root, reportPath)}`);
console.log(`Status: ${markdownStatus(overallOk)}`);
console.log(`Runtime: ${((completedAt.getTime() - startedAt.getTime()) / 1000).toFixed(1)}s`);

if (!overallOk) {
  process.exit(1);
}
