import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const assetsDir = path.join(root, "dist", "assets");
const maxJsAssetBytes = Number(process.env.BUNDLE_MAX_JS_ASSET_BYTES || 505 * 1024);
const maxCssAssetBytes = Number(process.env.BUNDLE_MAX_CSS_ASSET_BYTES || 220 * 1024);

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

if (!fs.existsSync(assetsDir)) {
  console.error("Bundle budget check requires dist/assets. Run npm run build first.");
  process.exit(1);
}

const assets = fs.readdirSync(assetsDir)
  .filter((fileName) => /\.(js|css)$/.test(fileName))
  .map((fileName) => {
    const filePath = path.join(assetsDir, fileName);
    return {
      bytes: fs.statSync(filePath).size,
      fileName
    };
  })
  .sort((first, second) => second.bytes - first.bytes);

const oversized = assets.filter((asset) => {
  if (asset.fileName.endsWith(".js")) return asset.bytes > maxJsAssetBytes;
  if (asset.fileName.endsWith(".css")) return asset.bytes > maxCssAssetBytes;
  return false;
});

console.log("Bundle budget:");
assets.forEach((asset) => {
  console.log(`- ${asset.fileName}: ${formatKb(asset.bytes)}`);
});

if (oversized.length) {
  console.error("\nBundle budget failed:");
  oversized.forEach((asset) => {
    const limit = asset.fileName.endsWith(".js") ? maxJsAssetBytes : maxCssAssetBytes;
    console.error(`- ${asset.fileName} is ${formatKb(asset.bytes)}, over ${formatKb(limit)}.`);
  });
  process.exit(1);
}

console.log("Bundle budget passed.");
