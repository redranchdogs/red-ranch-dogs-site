import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distRoot = path.join(root, "dist");
const publicRoot = path.join(root, "public");
const outputPath = path.join(root, "docs", "DEPLOY_PACKAGE_REVIEW.md");
const blockers = [];
const warnings = [];
const referencedImages = new Set();

const sourceFiles = [
  "index.html",
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

const requiredDistFiles = [
  "index.html",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "llms-full.txt",
  "site.webmanifest",
  "images/seed/red-ranch-dogs-app-icon-192.png",
  "images/seed/red-ranch-dogs-app-icon-512.png",
  "images/seed/red-ranch-dogs-2026-logo-wide.png",
];

const forbiddenDistNames = new Set([
  ".env",
  ".env.local",
  ".env.production",
  ".git",
  "node_modules",
  "scripts",
  "src",
]);

const forbiddenTextPatterns = [
  /RED_RANCH_BRIDGE_SECRET/i,
  /FORM_WEBHOOK_URL/i,
  /BRIDGE_SECRET/i,
  /Website Submissions/i,
  /RedRanchBridge2026/i,
  /script\.google\.com\/macros\/s\//i,
];

function existsInDist(filePath) {
  return fs.existsSync(path.join(distRoot, filePath));
}

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function readJson(filePath) {
  return JSON.parse(read(filePath));
}

function walkFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];

  return fs.readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) return walkFiles(entryPath);
    return [entryPath];
  });
}

function collectImage(value) {
  if (typeof value !== "string") return;
  const [cleanPath] = value.trim().split("?");
  if (cleanPath.startsWith("/images/")) referencedImages.add(cleanPath);
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

function list(items) {
  if (!items.length) return "- None flagged.";
  return items.map((item) => `- ${item}`).join("\n");
}

if (!fs.existsSync(distRoot)) {
  blockers.push("dist/ does not exist. Run `npm run build` before auditing the deploy package.");
} else {
  requiredDistFiles.forEach((filePath) => {
    if (!existsInDist(filePath)) blockers.push(`Missing required deploy file: dist/${filePath}`);
  });

  const distFiles = walkFiles(distRoot);
  const distEntries = fs.readdirSync(distRoot, { withFileTypes: true }).map((entry) => entry.name);
  const forbiddenNamesFound = distEntries.filter((name) => forbiddenDistNames.has(name));
  forbiddenNamesFound.forEach((name) => blockers.push(`Forbidden top-level deploy entry found: dist/${name}`));

  const assetFiles = distFiles
    .map((filePath) => path.relative(distRoot, filePath).split(path.sep).join("/"))
    .filter((filePath) => filePath.startsWith("assets/"));
  const jsAssets = assetFiles.filter((filePath) => filePath.endsWith(".js"));
  const cssAssets = assetFiles.filter((filePath) => filePath.endsWith(".css"));

  if (!jsAssets.length) blockers.push("dist/assets does not include a JavaScript bundle.");
  if (!cssAssets.length) blockers.push("dist/assets does not include a CSS bundle.");

  const html = fs.readFileSync(path.join(distRoot, "index.html"), "utf8");
  if (!/\/assets\/[^"]+\.js/.test(html)) blockers.push("dist/index.html does not reference a built JavaScript asset.");
  if (!/\/assets\/[^"]+\.css/.test(html)) warnings.push("dist/index.html does not reference a built CSS asset.");

  sourceFiles
    .filter((filePath) => fs.existsSync(path.join(root, filePath)))
    .forEach((filePath) => collectImagesFromText(read(filePath)));
  dataFiles
    .filter((filePath) => fs.existsSync(path.join(root, filePath)))
    .forEach((filePath) => collectImagesFromObject(readJson(filePath)));

  [...referencedImages].forEach((imagePath) => {
    if (!fs.existsSync(path.join(publicRoot, imagePath)) && !fs.existsSync(path.join(distRoot, imagePath))) {
      blockers.push(`Referenced image missing from public/dist: ${imagePath}`);
      return;
    }

    if (!fs.existsSync(path.join(distRoot, imagePath))) {
      blockers.push(`Referenced image was not copied into dist: ${imagePath}`);
    }
  });

  const textFiles = distFiles.filter((filePath) => /\.(html|js|css|json|txt|xml|webmanifest)$/i.test(filePath));
  textFiles.forEach((filePath) => {
    const relativePath = path.relative(distRoot, filePath).split(path.sep).join("/");
    const text = fs.readFileSync(filePath, "utf8");
    forbiddenTextPatterns.forEach((pattern) => {
      if (pattern.test(text)) blockers.push(`Potential private/internal text leaked into dist/${relativePath}: ${pattern}`);
    });
  });

  const sitemap = existsInDist("sitemap.xml") ? fs.readFileSync(path.join(distRoot, "sitemap.xml"), "utf8") : "";
  const robots = existsInDist("robots.txt") ? fs.readFileSync(path.join(distRoot, "robots.txt"), "utf8") : "";
  if (sitemap && !sitemap.includes("https://www.redranchdogs.com/")) {
    blockers.push("dist/sitemap.xml does not use the production redranchdogs.com domain.");
  }
  if (robots && !robots.includes("https://www.redranchdogs.com/sitemap.xml")) {
    blockers.push("dist/robots.txt does not point to the production sitemap URL.");
  }

  const largeDeployAssets = distFiles
    .filter((filePath) => /\.(png|jpe?g|webp|gif)$/i.test(filePath))
    .map((filePath) => ({ filePath, bytes: fs.statSync(filePath).size }))
    .filter((item) => item.bytes > 3 * 1024 * 1024)
    .sort((a, b) => b.bytes - a.bytes);

  largeDeployAssets.forEach((item) => {
    warnings.push(`Large deploy image: dist/${path.relative(distRoot, item.filePath)} (${formatBytes(item.bytes)})`);
  });
}

const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
const report = [
  "# Deploy Package Review",
  "",
  `Generated: ${generatedAt} Central`,
  "",
  `Status: **${blockers.length ? "FAIL" : "PASS"}**`,
  "",
  `Referenced images checked: ${referencedImages.size}`,
  "",
  "## Blockers",
  "",
  list(blockers),
  "",
  "## Warnings",
  "",
  list(warnings),
  "",
  "## What This Checks",
  "",
  "- The production `dist/` folder exists and has built JS/CSS assets.",
  "- Required public files are present: `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, manifest, app icons, and logo.",
  "- Website image references are present in the deploy package.",
  "- Private bridge/form config names and Apps Script URLs are not leaking into the public build.",
  "- Production crawler files point to `www.redranchdogs.com`.",
  "",
].join("\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, report);

console.log(`Deploy package review written to ${path.relative(root, outputPath)}`);
console.log(`Status: ${blockers.length ? "FAIL" : "PASS"}`);

if (blockers.length) {
  blockers.forEach((blocker) => console.error(`- ${blocker}`));
  process.exit(1);
}
