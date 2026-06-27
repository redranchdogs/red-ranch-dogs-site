import fs from "node:fs";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const root = process.cwd();
const port = Number(process.env.PUBLIC_ROUTE_SMOKE_PORT || 5214);
const baseUrl = process.env.PUBLIC_ROUTE_SMOKE_BASE_URL || `http://127.0.0.1:${port}`;
const useExternalServer = Boolean(process.env.PUBLIC_ROUTE_SMOKE_BASE_URL);
const viewports = [
  { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: "desktop", width: 1440, height: 900, isMobile: false, hasTouch: false }
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalize(value = "") {
  return String(value || "").trim().toLowerCase();
}

function isPublicRecord(item = {}) {
  const visibility = normalize(item.visibility || "public");
  return visibility !== "hidden" && visibility !== "private";
}

function startDevServer() {
  if (useExternalServer) return null;

  return spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

async function waitForServer() {
  const started = Date.now();

  while (Date.now() - started < 25000) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Keep polling while the local Vite server starts.
    }

    await delay(400);
  }

  throw new Error(`Public route smoke server did not respond at ${baseUrl}`);
}

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    return chromium.launch({ headless: true });
  }
}

const puppies = readJson("src/data/puppies.json").filter(isPublicRecord);
const litters = readJson("src/data/litters.json").filter(isPublicRecord);
const litterBySlug = new Map(litters.map((litter) => [litter.slug, litter]));
const availablePuppies = puppies.filter((puppy) => normalize(puppy.status) === "available");
const featuredAvailablePuppies = availablePuppies.filter((puppy) => litterBySlug.get(puppy.litterSlug)?.featuredAvailable === true);
const hiddenAvailablePuppies = availablePuppies.filter((puppy) => litterBySlug.get(puppy.litterSlug)?.featuredAvailable !== true);
const openGuardianNames = puppies
  .filter((puppy) => normalize(puppy.guardianOpportunity?.status) === "open")
  .map((puppy) => puppy.name);
const closedGuardianNames = puppies
  .filter((puppy) => puppy.guardianOpportunity && normalize(puppy.guardianOpportunity?.status) !== "open")
  .map((puppy) => puppy.name);

const routeExpectations = [
  {
    route: "/",
    requiredText: ["red ranch dogs", "available puppies", "apply"],
    requiredSelectors: [".premium-header", "main", ".premium-footer"]
  },
  {
    route: "/puppies/available",
    requiredText: [
      "available puppies",
      "open the breed group",
      ...featuredAvailablePuppies.map((puppy) => puppy.name)
    ],
    forbiddenText: hiddenAvailablePuppies.map((puppy) => puppy.name),
    requiredSelectors: [".available-puppy-tracker", ".available-puppy-breed-group"]
  },
  {
    route: "/puppies/goldendoodle-puppies",
    requiredText: ["goldendoodle", "how big will they get", "how to compare goldendoodle puppies", "most red ranch goldendoodles are multigen"],
    requiredSelectors: [".breed-program-card", ".breed-size-guide-asset", ".breed-priority-section"]
  },
  {
    route: "/puppies/cavapoo-puppies",
    requiredText: ["cavapoo", "how big will they get", "how to compare cavapoo puppies", "coat expectations still vary by pairing"],
    requiredSelectors: [".breed-program-card", ".breed-size-guide-asset", ".breed-priority-section"]
  },
  {
    route: "/puppies/bernedoodle-puppies",
    requiredText: ["bernedoodle", "how big will they get", "how to compare bernedoodle puppies"],
    requiredSelectors: [".breed-program-card", ".breed-size-guide-asset img[src*='bernedoodle-size-guide']", ".breed-priority-section"]
  },
  {
    route: "/stud-services",
    requiredText: ["stud services", "coat goals", "bernedoodle studs", "goldendoodle studs", "poodle studs"],
    requiredSelectors: [".stud-fit-guide-grid", ".stud-group-heading", ".stud-card-grid", ".stud-inquiry-shell"]
  },
  {
    route: "/apply",
    requiredText: ["puppy application", "no obligation", "guided choice", "clear next step"],
    requiredSelectors: [".application-intro-panel", ".application-reassurance-grid", ".lead-form"]
  },
  {
    route: "/guardian-program/current-guardian-opportunities",
    requiredText: ["current guardian opportunities", ...openGuardianNames],
    forbiddenText: closedGuardianNames,
    requiredSelectors: ["main", ".process-status-strip"]
  },
  {
    route: "/puppies/doodle-generations",
    requiredText: ["doodle generations explained", "multigen", "red ranch"],
    requiredSelectors: [".doodle-generation-hero", ".doodle-generation-grid"]
  }
];

function includesText(pageText, phrase) {
  return pageText.includes(normalize(phrase));
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

async function pageHealth(page) {
  return page.evaluate(() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const viewportWidth = window.innerWidth;
    const horizontalOverflow = Math.max(documentElement.scrollWidth, body.scrollWidth) - viewportWidth;
    const visibleBrokenImages = Array.from(document.images)
      .filter((image) => {
        const rect = image.getBoundingClientRect();
        return rect.width > 20 && rect.height > 20 && image.complete && image.naturalWidth === 0;
      })
      .map((image) => image.currentSrc || image.src || image.alt || "unknown image")
      .slice(0, 8);
    const bodyHeight = Math.max(body.scrollHeight, documentElement.scrollHeight);

    return {
      bodyHeight,
      horizontalOverflow,
      visibleBrokenImages
    };
  });
}

async function auditRoute(context, config, viewportName) {
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const failures = [];

  try {
    const response = await page.goto(`${baseUrl}${config.route}`, { waitUntil: "networkidle", timeout: 20000 });
    const status = response?.status() || 0;
    if (status >= 400 || status === 0) failures.push(`HTTP status ${status || "unknown"}`);

    const pageText = normalize(await page.locator("body").innerText());
    const missingText = (config.requiredText || []).filter((phrase) => !includesText(pageText, phrase));
    const forbiddenText = (config.forbiddenText || []).filter((phrase) => includesText(pageText, phrase));

    missingText.forEach((phrase) => failures.push(`Missing text: ${phrase}`));
    forbiddenText.forEach((phrase) => failures.push(`Unexpected text: ${phrase}`));

    for (const selector of config.requiredSelectors || []) {
      const count = await visibleCount(page, selector);
      if (count < 1) failures.push(`Missing visible selector: ${selector}`);
    }

    const health = await pageHealth(page);
    if (health.bodyHeight < 500) failures.push(`Body height looks too small: ${health.bodyHeight}px`);
    if (health.horizontalOverflow > 6) failures.push(`Horizontal overflow: ${Math.round(health.horizontalOverflow)}px`);
    if (health.visibleBrokenImages.length) failures.push(`Broken visible images: ${health.visibleBrokenImages.join("; ")}`);
    if (pageErrors.length) failures.push(`Page errors: ${pageErrors.slice(0, 3).join("; ")}`);
    if (consoleErrors.length) failures.push(`Console errors: ${consoleErrors.slice(0, 3).join("; ")}`);

    return {
      failures,
      route: config.route,
      title: await page.title(),
      viewportName
    };
  } catch (error) {
    failures.push(`Navigation failed: ${error.message}`);
    return {
      failures,
      route: config.route,
      title: "",
      viewportName
    };
  } finally {
    await page.close();
  }
}

const server = startDevServer();
let serverOutput = "";

if (server) {
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
}

const results = [];
let browser;

try {
  await waitForServer();
  browser = await launchBrowser();

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      hasTouch: viewport.hasTouch
    });

    for (const route of routeExpectations) {
      results.push(await auditRoute(context, route, viewport.name));
    }

    await context.close();
  }
} finally {
  if (browser) await browser.close();
  if (server) server.kill("SIGTERM");
}

const failed = results.filter((result) => result.failures.length);

console.log(`Public route smoke checked ${routeExpectations.length} routes across ${viewports.length} viewports.`);
console.log(`Featured available puppies: ${featuredAvailablePuppies.map((puppy) => puppy.name).join(", ") || "none"}`);
console.log(`Hidden public Available puppies: ${hiddenAvailablePuppies.map((puppy) => puppy.name).join(", ") || "none"}`);
console.log(`Open guardian opportunities: ${openGuardianNames.join(", ") || "none"}`);

if (failed.length) {
  failed.forEach((result) => {
    console.error(`- ${result.viewportName} ${result.route}: ${result.failures.join(" | ")}`);
  });
  if (serverOutput && process.env.PUBLIC_ROUTE_SMOKE_DEBUG) {
    console.error(serverOutput);
  }
  process.exit(1);
}

console.log("Public route smoke passed.");
