import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicImagesRoot = path.join(root, "public", "images");
const backupRoot = path.join(root, "image-originals");
const skipBytes = 150 * 1024;
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function walk(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return walk(fullPath);
    if (!entry.isFile()) return [];
    if (!supportedExtensions.has(path.extname(entry.name).toLowerCase())) return [];

    return [fullPath];
  });
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function backupImage(filePath) {
  const relativePath = path.relative(path.join(root, "public"), filePath);
  const backupPath = path.join(backupRoot, relativePath);

  if (fs.existsSync(backupPath)) return false;

  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.copyFileSync(filePath, backupPath);
  return true;
}

function resizeOptions(metadata, maxDimension) {
  if (!metadata.width || metadata.width <= maxDimension) return {};

  return {
    width: maxDimension,
    withoutEnlargement: true
  };
}

async function encodeImage(filePath, metadata, width, quality) {
  const extension = path.extname(filePath).toLowerCase();
  let pipeline = sharp(filePath, { failOn: "none" }).rotate().resize(resizeOptions(metadata, width));

  if (extension === ".jpg" || extension === ".jpeg") {
    pipeline = pipeline.jpeg({ mozjpeg: true, quality });
  } else if (extension === ".webp") {
    pipeline = pipeline.webp({ effort: 5, quality });
  } else if (extension === ".png") {
    pipeline = pipeline.png({ adaptiveFiltering: true, compressionLevel: 9, palette: true, quality });
  }

  return pipeline.toBuffer();
}

function compressionProfile(bytes, extension) {
  if (extension === ".png") {
    if (bytes > 350 * 1024) return { width: 1100, quality: 62 };
    if (bytes > 250 * 1024) return { width: 1200, quality: 68 };
    return { width: 1400, quality: 74 };
  }

  if (bytes > 350 * 1024) return { width: 1000, quality: 58 };
  if (bytes > 250 * 1024) return { width: 1100, quality: 62 };
  return { width: 1200, quality: 66 };
}

async function compressedBuffer(filePath, metadata, beforeBytes) {
  const extension = path.extname(filePath).toLowerCase();
  const { width, quality } = compressionProfile(beforeBytes, extension);
  return encodeImage(filePath, metadata, width, quality);
}

const images = walk(publicImagesRoot);
let backedUp = 0;
let compressed = 0;
let skipped = 0;
let beforeBytes = 0;
let afterBytes = 0;

for (const filePath of images) {
  const before = fs.statSync(filePath).size;
  beforeBytes += before;

  if (before < skipBytes) {
    afterBytes += before;
    skipped += 1;
    continue;
  }

  const metadata = await sharp(filePath, { failOn: "none" }).metadata();

  backedUp += backupImage(filePath) ? 1 : 0;
  const output = await compressedBuffer(filePath, metadata, before);

  if (!output || output.length >= before) {
    afterBytes += before;
    skipped += 1;
    continue;
  }

  fs.writeFileSync(filePath, output);
  afterBytes += output.length;
  compressed += 1;
}

console.log(`Image compression complete.`);
console.log(`Files scanned: ${images.length}`);
console.log(`Compressed: ${compressed}`);
console.log(`Skipped/kept: ${skipped}`);
console.log(`Original backups created: ${backedUp}`);
console.log(`Before: ${formatBytes(beforeBytes)}`);
console.log(`After: ${formatBytes(afterBytes)}`);
