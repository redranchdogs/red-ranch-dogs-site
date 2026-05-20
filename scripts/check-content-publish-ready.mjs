import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(root, "docs", "SHEET_SYNC_REVIEW.md");
const dataDir = path.join(root, "src", "data");
const blockers = [];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function walkJsonFiles(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) return walkJsonFiles(entryPath);
      return entry.name.endsWith(".json") ? [entryPath] : [];
    });
}

function newestMtime(filePaths) {
  return filePaths.reduce((newest, filePath) => {
    const mtime = fs.statSync(filePath).mtimeMs;
    return Math.max(newest, mtime);
  }, 0);
}

if (!fs.existsSync(reportPath)) {
  blockers.push("docs/SHEET_SYNC_REVIEW.md is missing. Run `npm run review:sheets` after syncing Website Hub sheets.");
} else {
  const report = read(reportPath);
  const reportMtime = fs.statSync(reportPath).mtimeMs;
  const dataFiles = walkJsonFiles(dataDir);
  const newestDataMtime = newestMtime(dataFiles);

  if (!/Status:\s+\*\*PASS\*\*/.test(report)) {
    blockers.push("Sheet sync review is not passing. Run the targeted sheet sync, then `npm run review:sheets`.");
  }

  if (/## Items To Fix[\s\S]*?-\s+(?!None\.)/.test(report)) {
    blockers.push("Sheet sync review still lists items to fix.");
  }

  if (newestDataMtime > reportMtime) {
    blockers.push(
      "Structured website data changed after the last sheet sync review. Sync the affected sheets, then rerun `npm run review:sheets`."
    );
  }
}

if (blockers.length) {
  console.error("Content publish readiness failed:");
  blockers.forEach((blocker) => console.error(`- ${blocker}`));
  process.exit(1);
}

console.log("Content publish readiness passed: Website Hub sheets are reviewed and aligned with current website data.");
