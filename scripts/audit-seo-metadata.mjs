import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { URL } from "node:url";
import { chromium } from "playwright";

const root = process.cwd();
const outputPath = path.join(root, "docs", "SEO_METADATA_REPORT.md");
const port = Number(process.env.SEO_QA_PORT || 5199);
const baseUrl = `http://127.0.0.1:${port}`;
const blockers = [];
const warnings = [];

function normalizePathname(value) {
  if (!value) return "/";
  return value.replace(/\/+$/, "") || "/";
}

function sitemapRoutes() {
  const sitemap = fs.readFileSync(path.join(root, "public", "sitemap.xml"), "utf8");
  return [...sitemap.matchAll(/<loc>https:\/\/www\.redranchdogs\.com([^<]*)<\/loc>/g)]
    .map((match) => normalizePathname(match[1] || "/"))
    .filter((route, index, routes) => routes.indexOf(route) === index);
}

function startPreview() {
  return spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function waitForPreview() {
  const started = Date.now();

  while (Date.now() - started < 20000) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Keep polling while Vite preview starts.
    }

    await delay(500);
  }

  throw new Error(`Vite preview did not start at ${baseUrl}`);
}

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    return chromium.launch({ headless: true });
  }
}

async function auditRoute(page, route) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 20000 });
  const status = response?.status() || 0;

  const metadata = await page.evaluate(() => {
    const meta = (selector) => document.querySelector(selector)?.getAttribute("content")?.trim() || "";
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href")?.trim() || "";
    const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map((script) => script.textContent || "")
      .filter(Boolean);
    const h1s = Array.from(document.querySelectorAll("h1"))
      .map((heading) => heading.textContent.trim().replace(/\s+/g, " "))
      .filter(Boolean);

    return {
      canonical,
      description: meta('meta[name="description"]'),
      h1s,
      jsonLdCount: jsonLd.length,
      ogDescription: meta('meta[property="og:description"]'),
      ogImage: meta('meta[property="og:image"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogType: meta('meta[property="og:type"]'),
      ogUrl: meta('meta[property="og:url"]'),
      robots: meta('meta[name="robots"]'),
      title: document.title.trim(),
      twitterCard: meta('meta[name="twitter:card"]'),
      twitterDescription: meta('meta[name="twitter:description"]'),
      twitterTitle: meta('meta[name="twitter:title"]'),
    };
  });

  const routeBlockers = [];
  const routeWarnings = [];

  if (status >= 400 || status === 0) routeBlockers.push(`HTTP status ${status || "unknown"}`);
  if (!metadata.title) routeBlockers.push("Missing document title");
  if (!metadata.description) routeBlockers.push("Missing meta description");
  if (metadata.description && (metadata.description.length < 45 || metadata.description.length > 170)) {
    routeWarnings.push(`Meta description length is ${metadata.description.length}`);
  }
  if (!metadata.canonical) {
    routeBlockers.push("Missing canonical URL");
  } else {
    try {
      const canonicalPath = normalizePathname(new URL(metadata.canonical).pathname);
      if (canonicalPath !== route) routeWarnings.push(`Canonical path is ${canonicalPath}`);
      if (!metadata.canonical.startsWith("https://www.redranchdogs.com")) {
        routeBlockers.push(`Canonical is not production domain: ${metadata.canonical}`);
      }
    } catch {
      routeBlockers.push(`Invalid canonical URL: ${metadata.canonical}`);
    }
  }
  if (!metadata.h1s.length) routeBlockers.push("Missing H1");
  if (metadata.h1s.length > 1) routeWarnings.push(`Multiple H1s: ${metadata.h1s.join(" | ")}`);
  if (!metadata.ogTitle || !metadata.ogDescription || !metadata.ogUrl || !metadata.ogImage) {
    routeWarnings.push("Open Graph metadata is incomplete");
  }
  if (!metadata.twitterCard || !metadata.twitterTitle || !metadata.twitterDescription) {
    routeWarnings.push("Twitter metadata is incomplete");
  }
  if (!metadata.jsonLdCount) routeWarnings.push("No JSON-LD structured data found");

  return {
    ...metadata,
    blockers: routeBlockers,
    route,
    status,
    warnings: routeWarnings,
  };
}

const preview = startPreview();
let previewOutput = "";
preview.stdout.on("data", (chunk) => {
  previewOutput += chunk.toString();
});
preview.stderr.on("data", (chunk) => {
  previewOutput += chunk.toString();
});

const routes = sitemapRoutes();
const results = [];
let browser;

try {
  await waitForPreview();
  browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  for (const route of routes) {
    try {
      const result = await auditRoute(page, route);
      results.push(result);
      result.blockers.forEach((blocker) => blockers.push(`${route}: ${blocker}`));
      result.warnings.forEach((warning) => warnings.push(`${route}: ${warning}`));
    } catch (error) {
      blockers.push(`${route}: ${error.message}`);
      results.push({
        blockers: [error.message],
        canonical: "",
        description: "",
        h1s: [],
        jsonLdCount: 0,
        route,
        status: 0,
        title: "",
        warnings: [],
      });
    }
  }

  await context.close();
} finally {
  if (browser) await browser.close();
  preview.kill("SIGTERM");
}

const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
const report = [
  "# SEO Metadata Report",
  "",
  `Generated: ${generatedAt} Central`,
  "",
  `Status: **${blockers.length ? "FAIL" : "PASS"}**`,
  "",
  `Sitemap routes checked: ${routes.length}`,
  `Routes with blockers: ${results.filter((result) => result.blockers.length).length}`,
  `Routes with warnings: ${results.filter((result) => result.warnings.length).length}`,
  "",
  "## Blockers",
  "",
  blockers.length ? blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None flagged.",
  "",
  "## Warnings",
  "",
  warnings.length ? warnings.slice(0, 120).map((warning) => `- ${warning}`).join("\n") : "- None flagged.",
  warnings.length > 120 ? `\n- ...and ${warnings.length - 120} more.` : "",
  "",
  "## Route Snapshot",
  "",
  "| Route | Status | Title | Description Length | H1 | JSON-LD | Canonical |",
  "| --- | ---: | --- | ---: | --- | ---: | --- |",
  ...results.map((result) => {
    const h1 = result.h1s?.[0] || "";
    return `| ${result.route} | ${result.status} | ${result.title || ""} | ${result.description?.length || 0} | ${h1} | ${result.jsonLdCount || 0} | ${result.canonical || ""} |`;
  }),
  "",
].join("\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, report);

console.log(`SEO metadata report written to ${path.relative(root, outputPath)}`);
console.log(`Status: ${blockers.length ? "FAIL" : "PASS"}`);

if (previewOutput && process.env.SEO_QA_DEBUG) {
  console.log(previewOutput);
}

if (blockers.length) {
  blockers.slice(0, 20).forEach((blocker) => console.error(`- ${blocker}`));
  process.exit(1);
}
