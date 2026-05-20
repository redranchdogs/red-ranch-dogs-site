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
- GitHub repo: https://github.com/redranchdogs/red-ranch-dogs-site
- Working branch: \`codex/launch-candidate\`
- Local dev command: \`npm run dev -- --port 5181\`
- Production deploy command: \`npx vercel deploy --prod --yes\`
- Latest operations status: **${extractOverallStatus(operationsStatus)}**
- Apps Script bridge version: ${extractBridgeVersion(operationsStatus)}
- Expected bridge version for compact lead sheets and notification emails: 3.2.0

## Start-of-Session Routine

Run these first in a fresh Codex session:

\`\`\`bash
cd "/Users/adamdietlein/Documents/New project/red-ranch-dogs-site"
git status --short
git branch --show-current
git pull
npm run ops:status
\`\`\`

If the user has made iPhone/cloud Codex changes, \`git pull\` is mandatory before local coding. GitHub is the shared source of truth; the MacBook local checkout does not update automatically.

## New Thread Starter Prompt

Adam can paste this into a new Codex thread:

> Continue the Red Ranch Dogs website work. Repo path: \`/Users/adamdietlein/Documents/New project/red-ranch-dogs-site\`. Branch: \`codex/launch-candidate\`. First read \`docs/NEXT_SESSION_HANDOFF.md\`, then run \`git status --short\`, \`git branch --show-current\`, \`git pull\`, and \`npm run ops:status\`. Use GitHub as source of truth, Vercel as the live website, and keep changes template-based rather than one-off. Do not switch DNS or retire Squarespace unless Adam explicitly asks.

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

## Google Sheets / Bridge Workflow

- Website data is primarily stored in \`src/data/*.json\` and synced outward to Google Sheets when needed.
- The Apps Script bridge is configured by env variable names \`RED_RANCH_BRIDGE_URL\` and \`RED_RANCH_BRIDGE_SECRET\`; never commit the secret value.
- Bridge v3.2.0 is the template that supports compact Website Submissions formatting and bridge-managed notification emails to \`adam@redranchdogs.com\`.
- Website form submissions write to the Website Submissions workbook. \`Website Leads\` is the raw intake tab; \`Lead Queue\` is Adam's daily working tab; \`Reply Templates\` and \`Workflow Notes\` support follow-up.
- Content sheets to keep aligned: Puppy Tracker, Litters, Parent Dogs, Public Waitlist, Previous Litters, and Website Submissions.
- Use dry-run commands before sheet writes when the business change is non-trivial:
  - \`npm run sync:puppies:dry-run\`
  - \`npm run sync:litters:dry-run\`
  - \`npm run sync:parents:dry-run\`
  - \`npm run sync:waitlist:dry-run\`
  - \`npm run sync:previous-litters:dry-run\`

## Photo / Drive Workflow

- Website Hub is the organizing concept in Google Drive.
- Use clean folders for reusable assets: Website Photos / Parents / Mamas, Website Photos / Parents / Studs, Website Photos / Litters, and weekly puppy media drops.
- Current litter puppy media folders generally follow \`Weekly Media Drops / Current Litters / Mama number + Stud / Week N / Photos\` and \`Videos\`.
- Previous litter media folders generally live under \`Weekly Media Drops / Previous Litters\`.
- Public pages should not show internal housekeeping notes like "photos loaded from Drive drop."
- Previous litters should show the pairing and puppy photos, not old pricing.

## Cloud / iPhone Codex Workflow

- iPhone/cloud Codex works from GitHub, not from the MacBook's local files.
- A cloud change should commit/push or open a PR; Vercel then deploys the pushed code.
- When returning to the MacBook after a cloud change, run \`git pull\` before editing.
- Small on-the-go updates are good candidates for cloud Codex: status changes, simple copy edits, pricing/size corrections, replacing one image, or adding a clear litter note.
- Larger design/template work is safer from the MacBook so desktop and mobile can be visually checked.

## Design Rules To Preserve

- Keep the public site warm, trustworthy, premium, compact, and family-oriented.
- Prefer reusable templates over one-off page fixes.
- Mobile is often the priority, but desktop must not have clipped text, hidden dropdowns, unreadable overlays, or awkward oversized sections.
- Puppy, parent, litter, previous-litter, and team cards should show clear photos with readable text on clean panels.
- Do not expose private data: emails, phone numbers, deposit dates, full waitlist details, internal notes, bridge secrets, or worksheet-only process notes.

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
