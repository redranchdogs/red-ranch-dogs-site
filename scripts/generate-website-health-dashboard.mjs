import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const reportPath = path.join(root, "docs", "WEBSITE_HEALTH_DASHBOARD.md");

const reportInputs = [
  {
    label: "Daily Light Check",
    command: "npm run health:daily",
    path: "docs/WEBSITE_HEALTH_LIGHT_REPORT.md",
    purpose: "Obvious live-page, buyer-flow, form, and public-route issues."
  },
  {
    label: "Website QA Agent",
    command: "npm run agent:website-qa",
    path: "docs/WEBSITE_QA_AGENT_REPORT.md",
    purpose: "Read-only guardrail, public data, route, form, and ownership rollup."
  },
  {
    label: "SEO Metadata",
    command: "npm run review:seo",
    path: "docs/SEO_METADATA_REPORT.md",
    purpose: "Titles, descriptions, canonicals, heading structure, and JSON-LD presence."
  },
  {
    label: "AI Search",
    command: "npm run review:ai-search",
    path: "docs/AI_SEARCH_REVIEW.md",
    purpose: "Crawler summary, entity clarity, structured-data markers, and AI-search readiness."
  },
  {
    label: "Sheet Sync Review",
    command: "npm run review:sheets",
    path: "docs/SHEET_SYNC_REVIEW.md",
    purpose: "Website Hub sheet alignment after source-of-truth content changes."
  },
  {
    label: "Public Safety",
    command: "npm run review:safety",
    path: "docs/PUBLIC_SAFETY_REVIEW.md",
    purpose: "Public-data leak checks for private records, old pricing artifacts, and internal notes."
  },
  {
    label: "Deploy Package",
    command: "npm run review:deploy",
    path: "docs/DEPLOY_PACKAGE_REVIEW.md",
    purpose: "Pre-deploy package and public route readiness report."
  }
];

function readIfExists(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return "";
  return fs.readFileSync(fullPath, "utf8");
}

function statusFromDoc(source = "") {
  return source.match(/(?:Overall status|Status):\s+\*\*(PASS|FAIL|WATCH)\*\*/)?.[1] || "UNKNOWN";
}

function generatedFromDoc(source = "") {
  return source.match(/^Generated:\s+(.+)$/m)?.[1] || "Not generated yet";
}

function existsStatus(relativePath) {
  return fs.existsSync(path.join(root, relativePath)) ? "Yes" : "No";
}

function scriptCommand(name) {
  return packageJson.scripts?.[name] || "";
}

const changeCommands = Object.keys(packageJson.scripts || {})
  .filter((name) => name.startsWith("health:change:"))
  .sort()
  .map((name) => ({ name, command: scriptCommand(name) }));

const reportRows = reportInputs.map((input) => {
  const source = readIfExists(input.path);
  return {
    ...input,
    exists: existsStatus(input.path),
    generated: generatedFromDoc(source),
    status: source ? statusFromDoc(source) : "MISSING"
  };
});

const blockers = [
  !scriptCommand("health:daily") ? "Missing `health:daily` script." : "",
  !scriptCommand("health:weekly") ? "Missing `health:weekly` script." : "",
  !scriptCommand("health:dashboard") ? "Missing `health:dashboard` script." : "",
  changeCommands.length < 5 ? "Expected targeted `health:change:*` scripts are incomplete." : ""
].filter(Boolean);

const report = [
  "# Website Health Dashboard",
  "",
  `Generated: ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })} Central`,
  "",
  "Owner: **Red Ranch Dogs Website**",
  "",
  "Permission level: **read-only reporting**",
  "",
  "This dashboard summarizes existing website health reports and commands. It does not sync sheets, submit live forms, deploy, edit CRM, edit Breeding Ops, change Google Drive or Google Sheets, change DNS, change Vercel settings, change ads, change payments, or mutate production data.",
  "",
  `Status: **${blockers.length ? "FAIL" : "PASS"}**`,
  "",
  "## Current Report Snapshot",
  "",
  "| Area | Status | Last generated | Report exists | Command | Purpose |",
  "| --- | --- | --- | --- | --- | --- |",
  ...reportRows.map((row) => `| ${row.label} | ${row.status} | ${row.generated} | ${row.exists} | \`${row.command}\` | ${row.purpose} |`),
  "",
  "## Operating Modes",
  "",
  "| Mode | Command | Use when | Notes |",
  "| --- | --- | --- | --- |",
  "| Daily Light Check | `npm run health:daily` | You want a low-noise daily pulse. | Catches obvious urgent issues only. |",
  "| Weekly Full Health Check | `npm run health:weekly` | You want a deeper weekly pass or pre-review confidence. | Runs the publish gate plus QA/visual rollups. |",
  "| After Major Change | `npm run health:change:*` | Puppy, litter, form, SEO, mobile, or predeploy changes just happened. | Pick the targeted command instead of running everything by habit. |",
  "",
  "## Targeted After-Change Commands",
  "",
  "| Command | Script |",
  "| --- | --- |",
  ...changeCommands.map((item) => `| \`npm run ${item.name}\` | \`${item.command}\` |`),
  "",
  "## Approval Boundaries",
  "",
  "- Reporting and local checks can run without extra approval.",
  "- Production deploys still require Adam's explicit approval and happen only by merging `codex/launch-candidate` into `main` and pushing.",
  "- If website content touches puppy, litter, parent, previous-litter, or public-waitlist source-of-truth sheets, run the existing sync/review process and `npm run review:sheets` before calling the change done.",
  "- Do not change CRM, Breeding Ops, Google Drive, Google Sheets, DNS, Vercel settings, env vars, ads, payments, or production data from this dashboard.",
  "",
  "## Blockers",
  "",
  blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- None flagged.",
  "",
  "## Recommended Next Use",
  "",
  "1. Run `npm run health:dashboard` after weekly health checks or major website QA passes.",
  "2. Read the dashboard first, then open the specific report whose status is not PASS.",
  "3. Keep fixes as normal website-code changes; do not make the dashboard auto-fix production issues.",
  ""
].join("\n");

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${report}\n`);

console.log(`Website health dashboard written to ${path.relative(root, reportPath)}`);
console.log(`Status: ${blockers.length ? "FAIL" : "PASS"}`);

if (blockers.length) {
  blockers.forEach((blocker) => console.error(`- ${blocker}`));
  process.exit(1);
}
