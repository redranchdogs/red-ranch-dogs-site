import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distPath = path.join(root, "dist");

if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
}

console.log("Cleaned dist output directory.");
