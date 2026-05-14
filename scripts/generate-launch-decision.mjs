import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "docs", "LAUNCH_DECISION.md");

function readIfExists(filePath) {
  const absolute = path.join(root, filePath);
  if (!fs.existsSync(absolute)) return "";
  return fs.readFileSync(absolute, "utf8");
}

function hasPassStatus(markdown = "") {
  return /Overall status:\s*\*\*PASS\*\*/i.test(markdown) || /Status:\s*\*\*PASS\*\*/i.test(markdown);
}

function hasFailStatus(markdown = "") {
  return /Overall status:\s*\*\*FAIL\*\*/i.test(markdown) || /Status:\s*\*\*FAIL\*\*/i.test(markdown);
}

function extractSection(markdown, heading) {
  const pattern = new RegExp(`## ${heading}\\n\\n([\\s\\S]*?)(?:\\n## |$)`, "i");
  const match = markdown.match(pattern);
  return match ? match[1].trim() : "";
}

function countBullets(section = "") {
  return section
    .split(/\r?\n/)
    .filter((line) => /^- /.test(line) && !/^- None flagged\./i.test(line))
    .length;
}

function tableRows(markdown = "") {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.startsWith("|") && !/---/.test(line) && !/^| Check |/i.test(line) && !/^| Sheet tab |/i.test(line));
}

function extractNumber(markdown = "", label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`${escaped}:\\s*(\\d+)`, "i"));
  return match ? Number(match[1]) : null;
}

function countPageSections(markdown = "") {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^###\s+/.test(line))
    .length;
}

const operations = readIfExists("docs/OPERATIONS_STATUS.md");
const publicSafety = readIfExists("docs/PUBLIC_SAFETY_REVIEW.md");
const business = readIfExists("docs/BUSINESS_ACCURACY_REVIEW.md");
const workflow = readIfExists("docs/WEEKLY_UPDATE_QUEUE.md");
const images = readIfExists("docs/IMAGE_ASSET_REVIEW.md");
const pages = readIfExists("docs/PAGE_REVIEW_PACKET.md");
const visual = readIfExists("docs/VISUAL_QA_REPORT.md");
const seo = readIfExists("docs/SEO_METADATA_REPORT.md");
const deploy = readIfExists("docs/DEPLOY_PACKAGE_REVIEW.md");
const sheets = readIfExists("docs/SHEET_SYNC_REVIEW.md");

const operationsPass = hasPassStatus(operations) && !hasFailStatus(operations);
const safetyPass = hasPassStatus(publicSafety) && !hasFailStatus(publicSafety);
const visualPass = visual ? hasPassStatus(visual) && !hasFailStatus(visual) : false;
const seoPass = seo ? hasPassStatus(seo) && !hasFailStatus(seo) : false;
const deployPass = deploy ? hasPassStatus(deploy) && !hasFailStatus(deploy) : false;
const sheetsPass = sheets ? hasPassStatus(sheets) && !hasFailStatus(sheets) : false;
const businessReviewNow = countBullets(extractSection(business, "Review Now"));
const workflowIssues =
  countBullets(extractSection(workflow, "Current Litter Issues")) +
  countBullets(extractSection(workflow, "Puppy Photo Matching Issues")) +
  countBullets(extractSection(workflow, "Parent Workflow Issues"));
const previousArchiveIssues = countBullets(extractSection(workflow, "Previous Litter Archive Issues"));
const imageMissing = extractNumber(images, "Missing referenced files");
const visualViewportChecks = extractNumber(visual, "Viewport checks");
const seoRoutesChecked = extractNumber(seo, "Sitemap routes checked");
const pageRows = tableRows(pages).length || countPageSections(pages);
const automatedBlockers =
  !operationsPass ||
  !safetyPass ||
  !visualPass ||
  !seoPass ||
  !deployPass ||
  !sheetsPass ||
  workflowIssues > 0 ||
  (imageMissing !== null && imageMissing > 0);
const readyForSpotCheck = !automatedBlockers;

const status = readyForSpotCheck ? "READY FOR HUMAN SPOT-CHECK" : "AUTOMATED BLOCKERS NEED ATTENTION";
const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
const lines = [
  "# Launch Decision Report",
  "",
  `Generated: ${generatedAt} Central`,
  "",
  `Status: **${status}**`,
  "",
  "**Do not launch or change DNS without Adam's explicit approval.**",
  "",
  "## Automated Evidence",
  "",
  `- Operations pass: ${operationsPass ? "PASS" : "NEEDS ATTENTION"}`,
  `- Public safety review: ${safetyPass ? "PASS" : "NEEDS ATTENTION"}`,
  `- Visual QA review: ${visualPass ? "PASS" : "NEEDS ATTENTION"}`,
  `- SEO metadata review: ${seoPass ? "PASS" : "NEEDS ATTENTION"}`,
  `- Deploy package review: ${deployPass ? "PASS" : "NEEDS ATTENTION"}`,
  `- Sheet sync review: ${sheetsPass ? "PASS" : "NEEDS ATTENTION"}`,
  `- Business review-now items: ${businessReviewNow}`,
  `- Current weekly workflow issues: ${workflowIssues}`,
  `- Previous-litter archive backfill items: ${previousArchiveIssues}`,
  `- Missing image count from image review: ${imageMissing ?? "unknown"}`,
  `- Visual viewport checks completed: ${visualViewportChecks ?? "unknown"}`,
  `- SEO sitemap routes checked: ${seoRoutesChecked ?? "unknown"}`,
  `- Page review rows generated: ${pageRows}`,
  "",
  "## Final Human Spot-Check",
  "",
  businessReviewNow
    ? `- Business review has ${businessReviewNow} review-now item(s). Open \`docs/BUSINESS_ACCURACY_REVIEW.md\` first.`
    : "- Business review has no review-now items.",
  "- Home page on phone and desktop.",
  "- Available Puppies should show zero true available puppies unless a puppy is intentionally reopened.",
  "- Current Litters should show only current litters with accurate status language.",
  "- Upcoming Litters should show planned pairings only, not delivered litters waiting on photos.",
  "- Apply, Contact, Stud Inquiry, and Guardian Application should submit successfully.",
  "- Pricing should match the current Red Ranch Dogs pricing decision.",
  "- Public Waitlist should show only first name and last initial style public rows.",
  "",
  "## Known Acceptable Gaps",
  "",
  "- Previous-litter archive photo backfill can continue after launch as long as current litters, available puppies, pricing, forms, and navigation are correct.",
  "- Parent photo quality can keep improving as Adam uploads final mama and stud photos into the Website Hub.",
  "- CRM automation is a future project; this site is using sheet-backed operations for launch.",
  "",
  "## Commands",
  "",
  "```bash",
  "npm run ops:full",
  "npm run launch:decision",
  "```",
  "",
].join("\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines);

console.log(`Launch decision report written to ${path.relative(root, outputPath)}`);
console.log(`Status: ${status}`);
