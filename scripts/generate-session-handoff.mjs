import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "docs", "NEXT_SESSION_HANDOFF.md");

function read(filePath) {
  const absolutePath = path.join(root, filePath);
  if (!fs.existsSync(absolutePath)) return "";
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(read(filePath));
}

function normalize(value = "") {
  return String(value).trim().toLowerCase();
}

function isPublicRecord(record = {}) {
  const visibility = normalize(record.visibility || "public");
  return visibility !== "hidden" && visibility !== "private";
}

function statusLabel(status) {
  return status ? status[0].toUpperCase() + status.slice(1).toLowerCase() : "Unknown";
}

function countBy(items, getKey) {
  return items.reduce((counts, item) => {
    const key = getKey(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function formatCounts(counts) {
  return Object.entries(counts)
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([label, count]) => `${count} ${label}`)
    .join(", ");
}

function extractOverallStatus(operationsStatus) {
  const match = operationsStatus.match(/Overall status:\s+\*\*(PASS|FAIL)\*\*/);
  return match?.[1] || "unknown";
}

function extractBridgeVersion(operationsStatus) {
  const match = operationsStatus.match(/Version:\s+([^\n]+)/);
  return match?.[1]?.trim() || "unknown";
}

function currentLitterSummary(litter, publicPuppies) {
  const litterPuppies = publicPuppies.filter((puppy) => puppy.litterSlug === litter.slug);
  const counts = formatCounts(countBy(litterPuppies, (puppy) => puppy.status || "No status"));

  return `${litter.name}: ${litter.goHomeDate || "No go-home date"}; ${counts || "no public puppies"}`;
}

function reviewBulletsFromSection(markdown, heading, limit = 5) {
  const pattern = new RegExp(`## ${heading}\\n\\n([\\s\\S]*?)(?:\\n## |$)`);
  const section = markdown.match(pattern)?.[1] || "";

  return section
    .split(/\r?\n/)
    .filter((line) => line.startsWith("- "))
    .filter((line) => !line.includes("None flagged"))
    .slice(0, limit);
}

const puppies = readJson("src/data/puppies.json");
const litters = readJson("src/data/litters.json");
const previousLitters = readJson("src/data/previousLitters.json");
const parents = readJson("src/data/parents.json");
const operationsStatus = read("docs/OPERATIONS_STATUS.md");
const businessReview = read("docs/BUSINESS_ACCURACY_REVIEW.md");
const imageReview = read("docs/IMAGE_ASSET_REVIEW.md");
const publicPuppies = puppies.filter(isPublicRecord);
const publicLitters = litters.filter(isPublicRecord);
const publicParents = parents.filter(isPublicRecord);
const currentLitters = publicLitters.filter((litter) => normalize(litter.status).includes("current"));
const upcomingLitters = publicLitters.filter((litter) => normalize(litter.status).includes("planned") || normalize(litter.status).includes("upcoming"));
const availablePuppies = publicPuppies.filter((puppy) => normalize(puppy.status) === "available");
const puppyStatusSnapshot = formatCounts(countBy(publicPuppies, (puppy) => puppy.status || "No status"));
const parentSnapshot = formatCounts(countBy(publicParents, (parent) => statusLabel(parent.role)));
const previousLitterGaps = reviewBulletsFromSection(read("docs/WEEKLY_UPDATE_QUEUE.md"), "Previous Litter Archive Issues", 8);
const reviewNow = reviewBulletsFromSection(businessReview, "Review Now", 8);
const missingImages = reviewBulletsFromSection(imageReview, "Missing Referenced Images", 6);
const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });

const report = `# Next Session Handoff

Last updated: ${generatedAt} Central.

Use this file when starting a fresh Codex session to reduce RAM pressure without losing project context.

## Project

\`\`\`text
/Users/adamdietlein/Documents/New project/red-ranch-dogs-site
\`\`\`

Website:

- Preview/live: https://red-ranch-dogs-site.vercel.app/
- Local dev command: \`npm run dev -- --port 5181\`
- Latest operations status: **${extractOverallStatus(operationsStatus)}**
- Apps Script bridge version: ${extractBridgeVersion(operationsStatus)}

## Current Website Snapshot

- True available puppies: ${availablePuppies.length}${availablePuppies.length ? ` (${availablePuppies.map((puppy) => puppy.name).join(", ")})` : ""}
- Public puppy status snapshot: ${puppyStatusSnapshot || "none"}
- Current litters: ${currentLitters.length}
- Upcoming/planned litters: ${upcomingLitters.length}
- Previous litter archive records: ${previousLitters.filter(isPublicRecord).length}
- Public parent profiles: ${publicParents.length} (${parentSnapshot || "none"})

## Current Litters

${currentLitters.map((litter) => `- ${currentLitterSummary(litter, publicPuppies)}`).join("\n") || "- None currently public."}

## Automation Commands

\`\`\`bash
npm run ops:full
npm run ops:status
npm run ops:workflow
npm run drive:folders
npm run leads:rebuild-queue
\`\`\`

Use \`npm run ops:full\` for the heavier pass: it rebuilds the lead queue, refreshes weekly workflow docs, runs the bridge check, refreshes review docs, validates routes/content/buyer flow, lints, and builds.

## Do Not Do Without Adam's Approval

- Do not switch DNS or custom domain routing.
- Do not retire Squarespace routing.
- Do not delete public images just because they are unused candidates.
- Do not create Drive folders with \`npm run drive:folders:write\` unless the Website Hub folder path has been confirmed.
- Do not deploy/go live unless Adam explicitly asks for it.

## Human Review Priorities

${reviewNow.length ? reviewNow.join("\n") : "- No immediate business-review items are currently flagged by automation."}

## Previous Litter Archive Backfill

${previousLitterGaps.length ? previousLitterGaps.join("\n") : "- No previous-litter archive gaps are currently flagged."}

## Image Review

${missingImages.length ? missingImages.join("\n") : "- No missing referenced images are currently flagged."}

## RAM-Friendly Workflow

- Keep one browser window focused on the page being reviewed.
- Close extra Google Sheets, Drive, Squarespace, and Vercel tabs when not actively using them.
- Run the local dev server only while checking local changes.
- Prefer \`npm run ops:status\` before opening many browser pages.
- Start a fresh Codex thread after major checkpoints and point it to this file.
`;

fs.writeFileSync(outputPath, report);
console.log(`Next-session handoff written to ${path.relative(root, outputPath)}`);
