import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const readJson = (path) => JSON.parse(read(path));

const sitemap = read("public/sitemap.xml");
const app = read("src/App.jsx");
const data = read("src/data/siteData.js");
const vercel = readJson("vercel.json");
const puppies = readJson("src/data/puppies.json");
const litters = readJson("src/data/litters.json");
const previousLitters = readJson("src/data/previousLitters.json");
const parents = readJson("src/data/parents.json");
const siteData = `${app}\n${data}`;

const urls = [...sitemap.matchAll(/<loc>https:\/\/www\.redranchdogs\.com([^<]+)<\/loc>/g)].map((match) => match[1]);
const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index);
const routeKeyPattern = /"((?:\/|\/[a-z0-9][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*)*))"\s*:/g;
const hrefPattern = /href:\s*"([^"]+)"/g;
const jsxHrefPattern = /(?:href|to)=["']([^"']+)["']/g;
const normalizedStatus = (value = "") => String(value).trim().toLowerCase();

const isPublicRecord = (item = {}) => {
  const visibility = normalizedStatus(item.visibility || "public");
  return visibility !== "hidden" && visibility !== "private";
};

const normalizePath = (href) => {
  if (!href) return null;
  const [path] = href.split("#");
  if (!path || path === "") return null;
  return path.replace(/\/+$/, "") || "/";
};

const isInternalHref = (href) => {
  if (!href || href.startsWith("#")) return false;
  return !/^(https?:|mailto:|sms:|tel:)/.test(href);
};

const routeFor = (section) => (item) => item.slug && `/${section}/${item.slug}`;
const previousLitterArchiveRoutes = new Set(
  previousLitters
    .filter(isPublicRecord)
    .map((item) => item.group)
    .filter((group, index, groups) => group && group !== "Poodles" && groups.indexOf(group) === index)
    .map((group) => `/previous-litters-${group.toLowerCase()}`)
);
const dynamicRoutes = new Set([
  ...puppies.filter(isPublicRecord).map(routeFor("puppies")).filter(Boolean),
  ...litters.filter(isPublicRecord).map(routeFor("litters")).filter(Boolean),
  ...previousLitters.filter(isPublicRecord).map((item) => item.href).filter(Boolean),
  ...previousLitterArchiveRoutes,
  ...parents.filter(isPublicRecord).map(routeFor("parents")).filter(Boolean)
]);
const privateDynamicRoutes = new Set([
  ...puppies.filter((item) => !isPublicRecord(item)).map(routeFor("puppies")).filter(Boolean),
  ...litters.filter((item) => !isPublicRecord(item)).map(routeFor("litters")).filter(Boolean),
  ...previousLitters.filter((item) => !isPublicRecord(item)).map((item) => item.href).filter(Boolean),
  ...parents.filter((item) => !isPublicRecord(item)).map(routeFor("parents")).filter(Boolean)
]);
const knownRoutes = new Set([
  "/",
  ...[...app.matchAll(routeKeyPattern)].map((match) => normalizePath(match[1])).filter(Boolean),
  ...[...data.matchAll(routeKeyPattern)].map((match) => normalizePath(match[1])).filter(Boolean),
  ...dynamicRoutes
]);
const redirects = vercel.redirects ?? [];
const redirectSources = new Set(redirects.map((redirect) => normalizePath(redirect.source)).filter(Boolean));
const redirectDestinations = new Set(redirects.map((redirect) => normalizePath(redirect.destination)).filter(Boolean));
const internalHrefs = [
  ...[...siteData.matchAll(hrefPattern)].map((match) => match[1]),
  ...[...siteData.matchAll(jsxHrefPattern)].map((match) => match[1])
]
  .filter(isInternalHref)
  .map(normalizePath)
  .filter(Boolean);
const uniqueInternalHrefs = [...new Set(internalHrefs)].sort();
const missing = urls.filter((url) => !knownRoutes.has(url));
const privateUrlsInSitemap = urls.filter((url) => privateDynamicRoutes.has(url));
const redirectedInSitemap = urls.filter((url) => redirectSources.has(url));
const missingInternalLinks = uniqueInternalHrefs.filter((href) => {
  return !knownRoutes.has(href) && !redirectSources.has(href) && !redirectDestinations.has(href);
});
const missingRedirectDestinations = [...redirectDestinations].filter((destination) => !knownRoutes.has(destination));
const tooLongDescriptions = [...app.matchAll(/description: "([^"]+)"/g)]
  .map((match) => match[1])
  .filter((description) => description.length > 170);

if (duplicates.length > 0) {
  console.error(`Duplicate sitemap URLs:\n${[...new Set(duplicates)].join("\n")}`);
}

if (missing.length > 0) {
  console.error(`Sitemap URLs not found in app/data:\n${missing.join("\n")}`);
}

if (privateUrlsInSitemap.length > 0) {
  console.error(`Sitemap should not include private data routes:\n${privateUrlsInSitemap.join("\n")}`);
}

if (redirectedInSitemap.length > 0) {
  console.error(`Sitemap should not include redirected legacy URLs:\n${redirectedInSitemap.join("\n")}`);
}

if (missingInternalLinks.length > 0) {
  console.error(`Internal links without a matching route or redirect:\n${missingInternalLinks.join("\n")}`);
}

if (missingRedirectDestinations.length > 0) {
  console.error(`Redirect destinations without a matching route:\n${missingRedirectDestinations.join("\n")}`);
}

if (tooLongDescriptions.length > 0) {
  console.error(`SEO descriptions over 170 characters:\n${tooLongDescriptions.join("\n")}`);
}

if (
  duplicates.length ||
  missing.length ||
  privateUrlsInSitemap.length ||
  redirectedInSitemap.length ||
  missingInternalLinks.length ||
  missingRedirectDestinations.length ||
  tooLongDescriptions.length
) {
  process.exit(1);
}

console.log(`Verified ${urls.length} sitemap URLs, ${uniqueInternalHrefs.length} internal links, and ${redirects.length} redirects.`);
