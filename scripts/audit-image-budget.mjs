import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const maxReferencedImageBytes = 3 * 1024 * 1024;
const warningImageBytes = 1024 * 1024;
const referencedImages = new Set();

const sourceFiles = [
  "src/App.jsx",
  "src/styles.css",
  "src/data/siteData.js",
];

const dataFiles = [
  "src/data/breeds.json",
  "src/data/litters.json",
  "src/data/parents.json",
  "src/data/previousLitters.json",
  "src/data/puppies.json",
  "src/data/team.json",
  "src/data/testimonials.json",
];

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function readJson(filePath) {
  return JSON.parse(read(filePath));
}

function normalizePublicImage(value) {
  if (typeof value !== "string") return null;
  const imagePath = value.trim().split("?")[0];
  if (!imagePath.startsWith("/images/")) return null;
  if (!/\.(?:png|jpe?g|webp|gif|svg|ico)$/i.test(imagePath)) return null;
  return imagePath;
}

function collectImage(value) {
  const imagePath = normalizePublicImage(value);
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
  for (const match of text.matchAll(directImagePattern)) {
    collectImage(match[0]);
  }

  const seedMatch = text.match(/const\s+seed\s*=\s*["']([^"']+)["']/);
  const seedBase = seedMatch ? seedMatch[1] : null;
  if (!seedBase) return;

  const seedImagePattern = /\$\{seed\}\/([^"'`]+\.(?:png|jpe?g|webp|gif|svg|ico))/gi;
  for (const match of text.matchAll(seedImagePattern)) {
    collectImage(`${seedBase}/${match[1]}`);
  }
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

sourceFiles
  .filter((filePath) => fs.existsSync(path.join(root, filePath)))
  .forEach((filePath) => collectImagesFromText(read(filePath)));

dataFiles
  .filter((filePath) => fs.existsSync(path.join(root, filePath)))
  .forEach((filePath) => collectImagesFromObject(readJson(filePath)));

const missing = [];
const tooLarge = [];
const warnings = [];
let totalBytes = 0;

for (const imagePath of [...referencedImages].sort()) {
  const localPath = path.join(publicRoot, imagePath.replace(/^\//, ""));
  if (!fs.existsSync(localPath)) {
    missing.push(imagePath);
    continue;
  }

  const bytes = fs.statSync(localPath).size;
  totalBytes += bytes;
  if (bytes > maxReferencedImageBytes) {
    tooLarge.push(`${imagePath} (${formatBytes(bytes)})`);
  } else if (bytes > warningImageBytes) {
    warnings.push(`${imagePath} (${formatBytes(bytes)})`);
  }
}

if (warnings.length) {
  console.warn(`Referenced image budget warnings over ${formatBytes(warningImageBytes)}:\n${warnings.slice(0, 40).map((item) => `- ${item}`).join("\n")}`);
  if (warnings.length > 40) console.warn(`- ...and ${warnings.length - 40} more.`);
}

if (missing.length || tooLarge.length) {
  const sections = [];
  if (missing.length) sections.push(`Missing referenced images:\n${missing.map((item) => `- ${item}`).join("\n")}`);
  if (tooLarge.length) sections.push(`Referenced images over ${formatBytes(maxReferencedImageBytes)}:\n${tooLarge.map((item) => `- ${item}`).join("\n")}`);
  console.error(sections.join("\n\n"));
  process.exit(1);
}

console.log(`Referenced image budget passed: ${referencedImages.size} images, ${formatBytes(totalBytes)} total referenced image weight.`);
