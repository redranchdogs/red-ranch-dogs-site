import fs from "node:fs";
import path from "node:path";
import { resolveImageUrl } from "../src/imageVersions.js";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const maxReferencedImageBytes = 400 * 1024;
// Preserve earlier media while adding the Lulu, Evie, Birdie, and Daisy portraits.
// The per-image limit remains 400 KiB; the total budget increases by 1 MiB.
const maxTotalReferencedImageBytes = 98 * 1024 * 1024;
const optionCPhotoPrefix = "/images/puppies/2026-11-18-option-c/";
const maxOptionCPhotoBytes = 600 * 1024;
const maxOptionCBatchBytes = 18 * 1024 * 1024;
const daisyWeek3Prefix = `${optionCPhotoPrefix}daisy/`;
const maxDaisyWeek3Bytes = 6 * 1024 * 1024;
// A separate, fixed budget for the verified Nov 25 drop preserves the existing archive caps.
const nov25PortraitPrefix = "/images/puppies/2026-11-25-weekly-portraits/";
const maxNov25PortraitBytes = 250 * 1024;
const maxNov25PortraitBatchBytes = 18 * 1024 * 1024;
const warningImageBytes = 250 * 1024;
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
  const imagePath = normalizePublicImage(resolveImageUrl(value));
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
let optionCBytes = 0;
let daisyWeek3Bytes = 0;
let nov25PortraitBytes = 0;

for (const imagePath of [...referencedImages].sort()) {
  const localPath = path.join(publicRoot, imagePath.replace(/^\//, ""));
  if (!fs.existsSync(localPath)) {
    missing.push(imagePath);
    continue;
  }

  const bytes = fs.statSync(localPath).size;
  const isDaisyWeek3Photo = imagePath.startsWith(daisyWeek3Prefix);
  const isOptionCPhoto = !isDaisyWeek3Photo && imagePath.startsWith(optionCPhotoPrefix);
  const isNov25Portrait = imagePath.startsWith(nov25PortraitPrefix);
  if (isNov25Portrait) nov25PortraitBytes += bytes;
  else if (isDaisyWeek3Photo) daisyWeek3Bytes += bytes;
  else if (isOptionCPhoto) optionCBytes += bytes;
  else totalBytes += bytes;
  const perFileLimit = isNov25Portrait ? maxNov25PortraitBytes : isOptionCPhoto ? maxOptionCPhotoBytes : maxReferencedImageBytes;
  if (bytes > perFileLimit) {
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
  if (tooLarge.length) sections.push(`Referenced images over their per-file limit:\n${tooLarge.map((item) => `- ${item}`).join("\n")}`);
  console.error(sections.join("\n\n"));
  process.exit(1);
}

if (totalBytes > maxTotalReferencedImageBytes) {
  console.error(
    `Referenced image budget total is ${formatBytes(totalBytes)}, which is over the ${formatBytes(maxTotalReferencedImageBytes)} limit.`
  );
  process.exit(1);
}

if (optionCBytes > maxOptionCBatchBytes) {
  console.error(`Option C batch is ${formatBytes(optionCBytes)}, over its ${formatBytes(maxOptionCBatchBytes)} limit.`);
  process.exit(1);
}

if (daisyWeek3Bytes > maxDaisyWeek3Bytes) {
  console.error(`Daisy Week 3 photos total ${formatBytes(daisyWeek3Bytes)}, over the ${formatBytes(maxDaisyWeek3Bytes)} limit.`);
  process.exit(1);
}

if (nov25PortraitBytes > maxNov25PortraitBatchBytes) {
  console.error(`November 25 portraits total ${formatBytes(nov25PortraitBytes)}, over the ${formatBytes(maxNov25PortraitBatchBytes)} limit.`);
  process.exit(1);
}

console.log(`Referenced image budget passed: ${referencedImages.size} images, ${formatBytes(totalBytes + optionCBytes + daisyWeek3Bytes + nov25PortraitBytes)} total, including ${formatBytes(optionCBytes)} in the original Option C batch and ${formatBytes(daisyWeek3Bytes)} in Daisy Week 3, and ${formatBytes(nov25PortraitBytes)} in the November 25 portraits.`);
