import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const imageRoot = path.join(publicRoot, "images");
const outputPath = path.join(root, "docs", "IMAGE_ASSET_REVIEW.md");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".ico"]);
const largeImageBytes = 2.5 * 1024 * 1024;

const sourceFiles = [
  "src/App.jsx",
  "src/styles.css",
  "src/data/siteData.js"
];

const dataFiles = [
  "src/data/breeds.json",
  "src/data/litters.json",
  "src/data/parents.json",
  "src/data/previousLitters.json",
  "src/data/puppies.json",
  "src/data/team.json",
  "src/data/testimonials.json"
];

const missing = [];
const recordWarnings = [];
const referencedImages = new Set();

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function isPublicRecord(record = {}) {
  const visibility = String(record.visibility || "public").trim().toLowerCase();
  return visibility !== "hidden" && visibility !== "private";
}

function walkFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];

  return fs.readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      return walkFiles(entryPath);
    }

    return [entryPath];
  });
}

function normalizePublicPath(value) {
  if (typeof value !== "string") return null;

  const withoutQuery = value.split("?")[0].trim();
  if (!withoutQuery.startsWith("/images/")) return null;

  return withoutQuery;
}

function collectImage(value) {
  const imagePath = normalizePublicPath(value);
  if (imagePath) referencedImages.add(imagePath);
}

function collectImagesFromObject(value) {
  if (Array.isArray(value)) {
    value.forEach(collectImagesFromObject);
    return;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach(collectImagesFromObject);
    return;
  }

  collectImage(value);
}

function collectImagesFromText(text) {
  const directImagePattern = /\/images\/[^"'`\s)<>]+\.(?:png|jpe?g|webp|gif|svg|ico)/gi;
  const directMatches = text.match(directImagePattern) || [];
  directMatches.forEach(collectImage);

  const seedMatch = text.match(/const\s+seed\s*=\s*["']([^"']+)["']/);
  const seedBase = seedMatch ? seedMatch[1] : null;
  if (!seedBase) return;

  const seedImagePattern = /\$\{seed\}\/([^"'`]+\.(?:png|jpe?g|webp|gif|svg|ico))/gi;
  for (const match of text.matchAll(seedImagePattern)) {
    collectImage(`${seedBase}/${match[1]}`);
  }
}

function checkPublicReference(imagePath, context) {
  if (!imagePath) return;

  const localPath = path.join(publicRoot, imagePath);
  if (!fs.existsSync(localPath)) {
    missing.push(`${context}: ${imagePath}`);
  }
}

function listActualImages() {
  return walkFiles(imageRoot)
    .filter((filePath) => imageExtensions.has(path.extname(filePath).toLowerCase()))
    .map((filePath) => `/${path.relative(publicRoot, filePath).split(path.sep).join("/")}`)
    .sort((a, b) => a.localeCompare(b));
}

function fileSize(imagePath) {
  return fs.statSync(path.join(publicRoot, imagePath)).size;
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function imageList(items) {
  if (!items.length) return "- None found.";
  return items.map((item) => `- ${item}`).join("\n");
}

sourceFiles.forEach((filePath) => {
  collectImagesFromText(fs.readFileSync(path.join(root, filePath), "utf8"));
});

dataFiles
  .filter((filePath) => fs.existsSync(path.join(root, filePath)))
  .forEach((filePath) => collectImagesFromObject(readJson(filePath)));

const puppies = readJson("src/data/puppies.json");
const litters = readJson("src/data/litters.json");
const previousLitters = readJson("src/data/previousLitters.json");
const parents = readJson("src/data/parents.json");

puppies.filter(isPublicRecord).forEach((puppy) => {
  if (!puppy.mainPhoto) {
    recordWarnings.push(`Puppy ${puppy.slug || puppy.name} is public but has no mainPhoto.`);
  }
});

parents.filter(isPublicRecord).forEach((parent) => {
  if (!parent.mainPhoto) {
    recordWarnings.push(`Parent ${parent.slug || parent.name} is public but has no mainPhoto.`);
  }
});

previousLitters.filter(isPublicRecord).forEach((litter) => {
  if (!litter.image) {
    recordWarnings.push(`Previous litter ${litter.href || litter.name} is public but has no image.`);
  }
});

litters.filter(isPublicRecord).forEach((litter) => {
  if (!litter.weeklyUpdateGallery?.length && String(litter.status || "").toLowerCase().includes("current")) {
    recordWarnings.push(`Current litter ${litter.slug || litter.name} has no weeklyUpdateGallery images.`);
  }
});

[...referencedImages].sort().forEach((imagePath) => checkPublicReference(imagePath, "Referenced asset"));

const actualImages = listActualImages();
const unusedImages = actualImages.filter((imagePath) => !referencedImages.has(imagePath));
const largeImages = actualImages
  .map((imagePath) => ({ imagePath, bytes: fileSize(imagePath) }))
  .filter((item) => item.bytes > largeImageBytes)
  .sort((a, b) => b.bytes - a.bytes);

const report = `# Image Asset Review

Last updated: ${new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric"
})}.

This review checks public image references, data records that should have photos, oversized assets, and unused files in \`public/images\`. It is meant to support launch QA and the weekly puppy photo workflow.

## Summary

- Referenced website images: ${referencedImages.size}
- Files in \`public/images\`: ${actualImages.length}
- Missing referenced files: ${missing.length}
- Public records needing image attention: ${recordWarnings.length}
- Large images over ${formatBytes(largeImageBytes)}: ${largeImages.length}
- Unused image review candidates: ${unusedImages.length}

## Missing Referenced Images

${imageList(missing)}

## Public Records Needing Image Attention

${imageList(recordWarnings)}

## Large Images To Review

${imageList(largeImages.slice(0, 30).map((item) => `${item.imagePath} (${formatBytes(item.bytes)})`))}

## Unused Public Image Candidates

These are not automatically bad. Some may be kept for upcoming pages, backups, or migration safety. Do not delete without a quick visual/content check.

${imageList(unusedImages.slice(0, 80))}
${unusedImages.length > 80 ? `\n\n- ...and ${unusedImages.length - 80} more.` : ""}

## Notes

- Missing referenced images should be fixed before launch.
- Large images are review candidates, especially if they appear on mobile-heavy pages.
- Unused image candidates are informational only. This script does not delete files.
`;

fs.writeFileSync(outputPath, report);

console.log(`Image asset review written to ${path.relative(root, outputPath)}.`);
console.log(`Referenced ${referencedImages.size} images and found ${actualImages.length} files in public/images.`);

if (recordWarnings.length) {
  console.warn(`Image record warnings:\n${recordWarnings.map((warning) => `- ${warning}`).join("\n")}`);
}

if (missing.length) {
  console.error(`Missing referenced images:\n${missing.map((item) => `- ${item}`).join("\n")}`);
  process.exit(1);
}
