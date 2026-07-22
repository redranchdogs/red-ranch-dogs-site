import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const root = process.cwd();
const outputPath = path.join(root, "docs", "VISUAL_QA_REPORT.md");
const port = Number(process.env.VISUAL_QA_PORT || 5198);
const baseUrl = `http://127.0.0.1:${port}`;
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];
const extraRoutes = [
  "/",
  "/puppies/available",
  "/puppies/current-litters",
  "/puppies/upcoming-litters",
  "/puppies/previous-litters",
  "/puppies/goldendoodle-puppies",
  "/puppies/cavapoo-puppies",
  "/puppies/bernedoodle-puppies",
  "/process/pricing",
  "/process/how-it-works",
  "/process/waitlist",
  "/apply",
  "/contact",
  "/guardian-program/application",
  "/stud-services/our-studs",
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function isPublicRecord(record = {}) {
  const visibility = String(record.visibility || "public").trim().toLowerCase();
  return visibility !== "hidden" && visibility !== "private";
}

function routeList() {
  const litters = readJson("src/data/litters.json")
    .filter(isPublicRecord)
    .filter((litter) => String(litter.status || "").toLowerCase().includes("current"))
    .map((litter) => `/litters/${litter.slug}`);
  const parents = readJson("src/data/parents.json")
    .filter(isPublicRecord)
    .filter((parent) => ["birdie", "honey", "penny", "ginny", "waylon-jennings", "wyatt-earp", "butch-cassidy"].includes(parent.slug))
    .map((parent) => `/parents/${parent.slug}`);

  return [...new Set([...extraRoutes, ...litters, ...parents])];
}

function wait(ms) {
  return delay(ms);
}

async function waitForPreview(preview) {
  const started = Date.now();

  while (Date.now() - started < 20000) {
    if (preview.exitCode !== null) {
      throw new Error(`Vite server exited before startup at ${baseUrl}${previewOutput ? `\n${previewOutput.trim()}` : ""}`);
    }

    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Keep polling while Vite preview starts.
    }

    await wait(500);
  }

  throw new Error(`Vite server did not start at ${baseUrl}${previewOutput ? `\n${previewOutput.trim()}` : ""}`);
}

function startPreview() {
  return spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function stopPreview(preview) {
  if (!preview || preview.exitCode !== null) return;

  const exited = new Promise((resolve) => preview.once("exit", resolve));
  preview.kill("SIGTERM");

  await Promise.race([
    exited,
    delay(3000).then(() => {
      if (preview.exitCode === null) preview.kill("SIGKILL");
    }),
  ]);
}

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    return chromium.launch({ headless: true });
  }
}

async function auditPage(page, route, viewportName) {
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  let status = 0;
  try {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 20000 });
    status = response?.status() || 0;
  } catch (error) {
    return {
      blockers: [`Navigation failed: ${error.message}`],
      consoleErrors,
      pageErrors,
      route,
      status,
      viewportName,
      warnings: [],
    };
  }

  const metrics = await page.evaluate(() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const horizontalOverflow = Math.max(documentElement.scrollWidth, body.scrollWidth) - window.innerWidth;
    const brokenImages = Array.from(document.images)
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src || image.alt || "unknown image")
      .slice(0, 8);
    const overflowingText = Array.from(document.querySelectorAll("h1,h2,h3,p,a,button,li,span,strong"))
      .filter((element) => {
        const style = window.getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") return false;
        const rect = element.getBoundingClientRect();
        if (rect.width < 8 || rect.height < 8) return false;
        return element.scrollWidth - element.clientWidth > 2 && !["nowrap", "pre"].includes(style.whiteSpace);
      })
      .map((element) => element.textContent.trim().replace(/\s+/g, " ").slice(0, 80))
      .filter(Boolean)
      .slice(0, 8);

    return {
      brokenImages,
      horizontalOverflow,
      overflowingText,
      title: document.title,
    };
  });

  const blockers = [];
  const warnings = [];

  if (status >= 400 || status === 0) blockers.push(`HTTP status ${status || "unknown"}`);
  if (metrics.brokenImages.length) blockers.push(`Broken images: ${metrics.brokenImages.join("; ")}`);
  if (metrics.horizontalOverflow > 8) blockers.push(`Horizontal overflow: ${Math.round(metrics.horizontalOverflow)}px`);
  if (pageErrors.length) blockers.push(`Page errors: ${pageErrors.slice(0, 3).join("; ")}`);
  if (consoleErrors.length) warnings.push(`Console errors: ${consoleErrors.slice(0, 3).join("; ")}`);
  if (metrics.overflowingText.length) warnings.push(`Possible clipped text: ${metrics.overflowingText.join("; ")}`);

  return {
    blockers,
    consoleErrors,
    pageErrors,
    route,
    status,
    title: metrics.title,
    viewportName,
    warnings,
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

const results = [];
let browser;

try {
  await waitForPreview(preview);
  browser = await launchBrowser();

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });

    for (const route of routeList()) {
      const page = await context.newPage();
      results.push(await auditPage(page, route, viewport.name));
      await page.close();
    }

    await context.close();
  }
} finally {
  if (browser) await browser.close();
  await stopPreview(preview);
}

const blockers = results.filter((result) => result.blockers.length);
const warnings = results.filter((result) => result.warnings.length);
const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
const lines = [
  "# Visual QA Report",
  "",
  `Generated: ${generatedAt} Central`,
  "",
  `Status: **${blockers.length ? "FAIL" : "PASS"}**`,
  "",
  `Routes checked: ${routeList().length}`,
  `Viewport checks: ${results.length}`,
  "",
  "## Blockers",
  "",
  blockers.length
    ? blockers
        .map((result) => `- ${result.viewportName} ${result.route}: ${result.blockers.join(" | ")}`)
        .join("\n")
    : "- None flagged.",
  "",
  "## Warnings",
  "",
  warnings.length
    ? warnings
        .map((result) => `- ${result.viewportName} ${result.route}: ${result.warnings.join(" | ")}`)
        .join("\n")
    : "- None flagged.",
  "",
  "## Checked Routes",
  "",
  "| Viewport | Route | Status | Title |",
  "| --- | --- | ---: | --- |",
  ...results.map((result) => `| ${result.viewportName} | ${result.route} | ${result.status} | ${result.title || ""} |`),
  "",
].join("\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines);

console.log(`Visual QA report written to ${path.relative(root, outputPath)}`);
console.log(`Status: ${blockers.length ? "FAIL" : "PASS"}`);

if (previewOutput && process.env.VISUAL_QA_DEBUG) {
  console.log(previewOutput);
}

if (blockers.length) {
  blockers.forEach((result) => console.error(`- ${result.viewportName} ${result.route}: ${result.blockers.join(" | ")}`));
  process.exit(1);
}
