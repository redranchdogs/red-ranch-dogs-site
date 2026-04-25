import fs from "node:fs";

const sitemap = fs.readFileSync("public/sitemap.xml", "utf8");
const app = fs.readFileSync("src/App.jsx", "utf8");
const data = fs.readFileSync("src/data/siteData.js", "utf8");
const siteData = `${app}\n${data}`;

const urls = [...sitemap.matchAll(/<loc>https:\/\/www\.redranchdogs\.com([^<]+)<\/loc>/g)].map((match) => match[1]);
const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index);
const missing = urls.filter((url) => url !== "/" && !siteData.includes(`"${url}"`) && !siteData.includes(`href: "${url}"`));
const tooLongDescriptions = [...app.matchAll(/description: "([^"]+)"/g)]
  .map((match) => match[1])
  .filter((description) => description.length > 170);

if (duplicates.length > 0) {
  console.error(`Duplicate sitemap URLs:\n${[...new Set(duplicates)].join("\n")}`);
}

if (missing.length > 0) {
  console.error(`Sitemap URLs not found in app/data:\n${missing.join("\n")}`);
}

if (tooLongDescriptions.length > 0) {
  console.error(`SEO descriptions over 170 characters:\n${tooLongDescriptions.join("\n")}`);
}

if (duplicates.length || missing.length || tooLongDescriptions.length) {
  process.exit(1);
}

console.log(`Verified ${urls.length} sitemap URLs and route metadata checks.`);
