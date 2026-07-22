import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const root = process.cwd();
const outputPath = path.join(root, "docs", "MOBILE_TEMPLATE_QA.md");
const port = Number(process.env.MOBILE_TEMPLATE_QA_PORT || 5205);
const baseUrl = `http://127.0.0.1:${port}`;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function normalize(value = "") {
  return String(value || "").trim().toLowerCase();
}

function isPublicRecord(record = {}) {
  const visibility = normalize(record.visibility || "public");
  return visibility !== "hidden" && visibility !== "private";
}

const litters = readJson("src/data/litters.json").filter(isPublicRecord);
const puppies = readJson("src/data/puppies.json").filter(isPublicRecord);
const currentLitters = litters.filter((litter) => normalize(litter.status).includes("current"));
const currentLitterSlugs = new Set(currentLitters.map((litter) => litter.slug));
const currentPuppies = puppies.filter((puppy) => currentLitterSlugs.has(puppy.litterSlug));
const puppiesByLitter = new Map(
  currentLitters.map((litter) => [litter.slug, currentPuppies.filter((puppy) => puppy.litterSlug === litter.slug)]),
);

const currentLitterRoute = currentLitters.length
  ? {
      route: "/puppies/current-litters",
      label: "Current Litters",
      requiredText: ["current litters"],
      expandSelector: ".current-litter-list .upcoming-breed-toggle",
      selectors: [".current-litter-list .upcoming-breed-toggle", ".current-litter-list .litter-card"],
    }
  : {
      route: "/puppies/current-litters",
      label: "Current Litters Empty State",
      requiredText: ["planned pairings are ahead", "join the waitlist"],
      selectors: [".smart-empty-state"],
    };

const currentLitterDetails = currentLitters.slice(0, 2).map((litter, index) => {
  const litterPuppies = puppiesByLitter.get(litter.slug) || [];
  const hasGallery = Array.isArray(litter.weeklyUpdateGallery) && litter.weeklyUpdateGallery.length > 0;
  const litterName = String(litter.name || [litter.mama, litter.stud].filter(Boolean).join(" + ") || litter.slug).trim();

  return {
    route: `/litters/${litter.slug}`,
    label: index ? "Additional Current Litter Detail" : "Current Litter Detail",
    requiredText: [litterName],
    selectors: [
      ".litter-summary-panel",
      ...(litterPuppies.length ? [".litter-puppy-list .puppy-card"] : []),
      ...(hasGallery ? [".litter-gallery-section img"] : []),
    ],
  };
});

const puppyDetails = currentPuppies
  .filter((puppy) => Array.isArray(puppy.weeklyPhotos) && puppy.weeklyPhotos.length > 0)
  .slice(0, 2)
  .map((puppy, index) => ({
    route: `/puppies/${puppy.slug}`,
    label: index ? "Additional Puppy Detail With Weekly Photos" : "Puppy Detail With Weekly Photos",
    requiredText: [puppy.name],
    selectors: [".puppy-detail-section .puppy-card", ".puppy-weekly-photo-section img"],
  }));

const routes = [currentLitterRoute, ...currentLitterDetails, ...puppyDetails];

function startDevServer() {
  return spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function waitForServer(server) {
  const started = Date.now();

  while (Date.now() - started < 20000) {
    if (server.exitCode !== null) {
      throw new Error(`Mobile template QA server exited before startup at ${baseUrl}${serverOutput ? `\n${serverOutput.trim()}` : ""}`);
    }

    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Keep polling while Vite starts.
    }

    await delay(400);
  }

  throw new Error(`Mobile template QA server did not start at ${baseUrl}${serverOutput ? `\n${serverOutput.trim()}` : ""}`);
}

async function stopDevServer(server) {
  if (!server || server.exitCode !== null) return;

  const exited = new Promise((resolve) => server.once("exit", resolve));
  server.kill("SIGTERM");

  await Promise.race([
    exited,
    delay(3000).then(() => {
      if (server.exitCode === null) server.kill("SIGKILL");
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

async function visibleCount(page, selector) {
  return page.locator(selector).evaluateAll((nodes) => {
    return nodes.filter((node) => {
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      return rect.width > 1 && rect.height > 1 && style.visibility !== "hidden" && style.display !== "none";
    }).length;
  });
}

async function imageHealth(page) {
  return page.locator("img").evaluateAll((images) => {
    const visibleImages = images.filter((image) => {
      const rect = image.getBoundingClientRect();
      return rect.width > 20 && rect.height > 20;
    });

    return {
      visible: visibleImages.length,
      broken: visibleImages
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.getAttribute("src") || image.getAttribute("alt") || "unknown image")
        .slice(0, 5),
    };
  });
}

async function layoutHealth(page) {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const overflowing = [...document.body.querySelectorAll("body *")]
      .filter((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.width <= 1 || rect.height <= 1) return false;
        if (rect.left < -2 || rect.right > viewportWidth + 2) return true;
        return false;
      })
      .map((node) => ({
        tag: node.tagName.toLowerCase(),
        className: typeof node.className === "string" ? node.className : "",
        text: (node.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
      }))
      .slice(0, 8);

    return {
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth,
      overflowing,
    };
  });
}

async function auditRoute(page, routeConfig) {
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const response = await page.goto(`${baseUrl}${routeConfig.route}`, { waitUntil: "networkidle", timeout: 20000 });
  await page.evaluate(() => window.scrollTo(0, 0));

  if (routeConfig.expandSelector) {
    const toggle = page.locator(routeConfig.expandSelector).first();
    if (await toggle.count()) await toggle.click();
  }

  const text = (await page.locator("body").innerText()).toLowerCase();
  const missingText = routeConfig.requiredText.filter((required) => !text.includes(required.toLowerCase()));
  const selectorResults = [];

  for (const selector of routeConfig.selectors) {
    selectorResults.push({ selector, count: await visibleCount(page, selector) });
  }

  const images = await imageHealth(page);
  const layout = await layoutHealth(page);
  const blockers = [];
  const warnings = [];

  if ((response?.status() || 0) >= 400) blockers.push(`HTTP status ${response.status()}`);
  if (missingText.length) blockers.push(`Missing expected text: ${missingText.join(", ")}`);
  selectorResults
    .filter((result) => result.count < 1)
    .forEach((result) => blockers.push(`Missing visible selector: ${result.selector}`));
  if (images.broken.length) blockers.push(`Broken visible images: ${images.broken.join(", ")}`);
  if (layout.scrollWidth > layout.viewportWidth + 2) {
    blockers.push(`Horizontal overflow: ${layout.scrollWidth}px document inside ${layout.viewportWidth}px viewport`);
  }
  if (layout.overflowing.length) {
    warnings.push(`Overflow candidates: ${layout.overflowing.map((node) => node.className || node.tag).join("; ")}`);
  }
  if (pageErrors.length) blockers.push(`Page errors: ${pageErrors.slice(0, 3).join("; ")}`);
  if (consoleErrors.length) warnings.push(`Console errors: ${consoleErrors.slice(0, 3).join("; ")}`);

  return {
    blockers,
    imageCount: images.visible,
    label: routeConfig.label,
    route: routeConfig.route,
    selectorResults,
    status: response?.status() || 0,
    title: await page.title(),
    warnings,
  };
}

const server = startDevServer();
let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

const results = [];
let browser;

try {
  await waitForServer(server);
  browser = await launchBrowser();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  for (const route of routes) {
    const page = await context.newPage();
    results.push(await auditRoute(page, route));
    await page.close();
  }

  await context.close();
} finally {
  if (browser) await browser.close();
  await stopDevServer(server);
}

const blockers = results.filter((result) => result.blockers.length);
const warnings = results.filter((result) => result.warnings.length);
const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });

const report = [
  "# Mobile Template QA",
  "",
  `Generated: ${generatedAt} Central`,
  "",
  `Status: **${blockers.length ? "FAIL" : "PASS"}**`,
  "",
  "This audit checks the mobile template stack for the current-litter listing, current litter detail pages, and current puppy pages with weekly photos. When no current litters are posted, it validates the public empty state instead. It is meant to catch missing weekly photos, broken public images, and horizontal overflow before Adam spots it on an iPhone.",
  "",
  "## Blockers",
  "",
  blockers.length
    ? blockers.map((result) => `- ${result.route}: ${result.blockers.join(" | ")}`).join("\n")
    : "- None flagged.",
  "",
  "## Warnings",
  "",
  warnings.length
    ? warnings.map((result) => `- ${result.route}: ${result.warnings.join(" | ")}`).join("\n")
    : "- None flagged.",
  "",
  "## Checked Routes",
  "",
  "| Route | Template | Status | Visible images | Key selectors |",
  "| --- | --- | ---: | ---: | --- |",
  ...results.map(
    (result) =>
      `| ${result.route} | ${result.label} | ${result.status} | ${result.imageCount} | ${result.selectorResults
        .map((selector) => `${selector.selector}: ${selector.count}`)
        .join("<br>")} |`,
  ),
  "",
].join("\n");

fs.writeFileSync(outputPath, report);

console.log(`Mobile template QA written to ${path.relative(root, outputPath)}`);
console.log(`Status: ${blockers.length ? "FAIL" : "PASS"}`);

if (serverOutput && process.env.MOBILE_TEMPLATE_QA_DEBUG) {
  console.log(serverOutput);
}

if (blockers.length) {
  blockers.forEach((result) => console.error(`- ${result.route}: ${result.blockers.join(" | ")}`));
  process.exit(1);
}
