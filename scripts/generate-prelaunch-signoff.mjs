import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "docs", "PRELAUNCH_SIGNOFF.md");

function readIfExists(filePath) {
  const absolutePath = path.join(root, filePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
}

function statusFor(markdown = "") {
  const overall = markdown.match(/Overall status:\s+\*\*(PASS|FAIL)\*\*/i)?.[1];
  const status = markdown.match(/Status:\s+\*\*([^*]+)\*\*/i)?.[1];
  return overall || status || "UNKNOWN";
}

function extractNumber(markdown = "", label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`${escaped}:\\s*(\\d+)`, "i"));
  return match ? Number(match[1]) : null;
}

function section(markdown, heading) {
  const pattern = new RegExp(`## ${heading}\\n\\n([\\s\\S]*?)(?:\\n## |$)`, "i");
  return markdown.match(pattern)?.[1]?.trim() || "";
}

function activeBullets(markdown, heading) {
  return section(markdown, heading)
    .split(/\r?\n/)
    .filter((line) => /^- /.test(line))
    .filter((line) => !/None flagged/i.test(line));
}

function verdictIsPassing(value) {
  return ["PASS", "READY FOR HUMAN SPOT-CHECK"].includes(String(value).toUpperCase());
}

function checkLine(label, status, filePath) {
  return `| ${label} | ${status} | \`${filePath}\` |`;
}

const reports = {
  operations: readIfExists("docs/OPERATIONS_STATUS.md"),
  visual: readIfExists("docs/VISUAL_QA_REPORT.md"),
  seo: readIfExists("docs/SEO_METADATA_REPORT.md"),
  deploy: readIfExists("docs/DEPLOY_PACKAGE_REVIEW.md"),
  sheets: readIfExists("docs/SHEET_SYNC_REVIEW.md"),
  launch: readIfExists("docs/LAUNCH_DECISION.md"),
  business: readIfExists("docs/BUSINESS_ACCURACY_REVIEW.md"),
  weekly: readIfExists("docs/WEEKLY_UPDATE_QUEUE.md"),
  photo: readIfExists("docs/PHOTO_WORKFLOW_PACKET.md"),
  lead: readIfExists("docs/LEAD_WORKFLOW_PACKET.md"),
  image: readIfExists("docs/IMAGE_ASSET_REVIEW.md"),
  safety: readIfExists("docs/PUBLIC_SAFETY_REVIEW.md"),
};

const statuses = {
  operations: statusFor(reports.operations),
  visual: statusFor(reports.visual),
  seo: statusFor(reports.seo),
  deploy: statusFor(reports.deploy),
  sheets: statusFor(reports.sheets),
  launch: statusFor(reports.launch),
  safety: statusFor(reports.safety),
};

const businessReviewNow = activeBullets(reports.business, "Review Now");
const previousArchiveGaps = activeBullets(reports.weekly, "Previous Litter Archive Issues");
const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
const automatedOk = Object.values(statuses).every(verdictIsPassing);
const signoffStatus = automatedOk ? "READY FOR ADAM REVIEW" : "AUTOMATION NEEDS ATTENTION";

const report = [
  "# Prelaunch Signoff",
  "",
  `Generated: ${generatedAt} Central`,
  "",
  `Status: **${signoffStatus}**`,
  "",
  "**This is not permission to launch. DNS/domain launch still requires Adam's explicit approval.**",
  "",
  "## Automated Checks",
  "",
  "| Area | Status | Report |",
  "| --- | --- | --- |",
  checkLine("Operations and bridge", statuses.operations, "docs/OPERATIONS_STATUS.md"),
  checkLine("Visual QA", statuses.visual, "docs/VISUAL_QA_REPORT.md"),
  checkLine("SEO metadata", statuses.seo, "docs/SEO_METADATA_REPORT.md"),
  checkLine("Deploy package", statuses.deploy, "docs/DEPLOY_PACKAGE_REVIEW.md"),
  checkLine("Sheet sync", statuses.sheets, "docs/SHEET_SYNC_REVIEW.md"),
  checkLine("Public safety", statuses.safety, "docs/PUBLIC_SAFETY_REVIEW.md"),
  checkLine("Launch decision", statuses.launch, "docs/LAUNCH_DECISION.md"),
  "",
  "## Current Numbers",
  "",
  `- Visual viewport checks: ${extractNumber(reports.visual, "Viewport checks") ?? "unknown"}`,
  `- SEO sitemap routes checked: ${extractNumber(reports.seo, "Sitemap routes checked") ?? "unknown"}`,
  `- Referenced deploy images checked: ${extractNumber(reports.deploy, "Referenced images checked") ?? "unknown"}`,
  `- Missing image count: ${extractNumber(reports.image, "Missing referenced files") ?? "unknown"}`,
  `- Business review-now items: ${businessReviewNow.length}`,
  `- Previous-litter archive backfill items: ${previousArchiveGaps.length}`,
  `- Photo workflow packet: ${reports.photo ? "generated" : "missing"}`,
  `- Lead workflow packet: ${reports.lead ? "generated" : "missing"}`,
  "",
  "## Adam Review",
  "",
  businessReviewNow.length
    ? businessReviewNow.join("\n")
    : "- No business review-now items are currently flagged.",
  "- Confirm current availability: Available Puppies should show zero true available puppies unless a puppy is intentionally reopened.",
  "- Confirm current litters: no delivered/go-home litters should stay in Current Litters.",
  "- Confirm upcoming litters: pairings and timing should match what Red Ranch Dogs wants public today.",
  "- Submit one real-world test for Apply, Contact, Stud Inquiry, and Guardian Application before launch.",
  "- Run `npm run leads:uat:write` once, practice the fake client queue, then mark UAT rows `Test/delete` before launch.",
  "- Open `docs/LEAD_WORKFLOW_PACKET.md` and confirm the Website Submissions process still matches how Adam wants to work leads before the CRM exists.",
  "- Before a weekly photo update, open `docs/PHOTO_WORKFLOW_PACKET.md` and use `outputs/photo-intake-checklist.tsv` beside the Drive folder.",
  "",
  "## Acceptable After-Launch Backfill",
  "",
  previousArchiveGaps.length
    ? previousArchiveGaps.slice(0, 10).join("\n")
    : "- No previous-litter archive gaps are currently flagged.",
  previousArchiveGaps.length > 10 ? `- ...and ${previousArchiveGaps.length - 10} more previous-litter archive items.` : "",
  "- Parent photo quality can continue improving as final photos are added to the Website Hub.",
  "- CRM automation is still a later project; current launch is sheet-backed.",
  "",
  "## One Command",
  "",
  "```bash",
  "npm run ops:full",
  "```",
  "",
].filter(Boolean).join("\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, report);

console.log(`Prelaunch signoff written to ${path.relative(root, outputPath)}`);
console.log(`Status: ${signoffStatus}`);

if (!automatedOk) {
  process.exit(1);
}
