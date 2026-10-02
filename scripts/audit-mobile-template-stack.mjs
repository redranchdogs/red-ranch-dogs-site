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
const plannedLitters = litters.filter((litter) => /planned|upcoming/.test(normalize(litter.status)));
const browserBreeds = [
  { slug: "cavapoo-puppies", name: "Cavapoo" },
  { slug: "goldendoodle-puppies", name: "Goldendoodle" },
  { slug: "bernedoodle-puppies", name: "Bernedoodle" },
];

function browserRoute(mode, breed) {
  const records = (mode === "current" ? currentLitters : plannedLitters)
    .filter((litter) => litter.breedSlug === breed.slug);
  const allCurrentEmpty = mode === "current" && currentLitters.length === 0;
  const sameBreedUpcoming = plannedLitters.some((litter) => litter.breedSlug === breed.slug);
  const publicUpcomingBreeds = [...new Set(plannedLitters.map((litter) => litter.breedSlug))];
  const emptyHrefs = allCurrentEmpty
    ? (publicUpcomingBreeds.length ? publicUpcomingBreeds : [breed.slug])
      .map((slug) => `/puppies/upcoming-litters?breed=${slug}`)
    : mode === "current" && sameBreedUpcoming
    ? [`/puppies/upcoming-litters?breed=${breed.slug}`]
    : ["/process/application-and-waitlist"];

  return {
    route: `/puppies/${mode === "current" ? "current-litters" : "upcoming-litters"}?breed=${breed.slug}`,
    label: `${mode === "current" ? "Current" : "Upcoming"} ${breed.name} Litters`,
    requiredText: records.length
      ? records.map((litter) => litter.name)
      : [allCurrentEmpty ? "No current litters are listed right now." : `No ${mode} ${breed.name} litters are listed right now.`],
    selectors: [
      `.litter-browser-tabs #litter-tab-${mode}-${breed.slug}`,
      `#litter-panel-${mode}`,
      records.length ? ".litter-browser-list .litter-browser-card" : ".litter-browser-empty",
    ],
    browser: { mode, breed, records, emptyHrefs },
  };
}

const litterBrowserRoutes = ["current", "upcoming"]
  .flatMap((mode) => browserBreeds.map((breed) => browserRoute(mode, breed)));

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

const routes = [...litterBrowserRoutes, ...currentLitterDetails, ...puppyDetails];

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

  if (routeConfig.browser) {
    const { mode, breed, records, emptyHrefs } = routeConfig.browser;
    const panel = page.locator(`#litter-panel-${mode}`);
    const selectedTab = page.locator(`#litter-tab-${mode}-${breed.slug}`);
    const cardLinks = await panel.locator(".litter-browser-card-action").evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")));
    const expectedLinks = records.map((litter) => `/litters/${litter.slug}`);

    if (await selectedTab.getAttribute("aria-selected") !== "true" ||
        await panel.getAttribute("aria-labelledby") !== `litter-tab-${mode}-${breed.slug}`) {
      blockers.push(`Breed tab or panel did not select ${breed.name}.`);
    }
    if (JSON.stringify([...cardLinks].sort()) !== JSON.stringify([...expectedLinks].sort())) {
      blockers.push(`Visible litter links differ from public ${breed.name} ${mode} records: ${cardLinks.join(", ") || "none"}.`);
    }
    if (!records.length) {
      const action = panel.locator(".litter-browser-empty-link");
      const actionHref = await action.getAttribute("href");
      if (!emptyHrefs.includes(actionHref)) {
        blockers.push(`Empty-state destination ${actionHref || "missing"} is not an applicable public route: ${emptyHrefs.join(", ")}.`);
      }
    }

    const nextBreed = browserBreeds[(browserBreeds.findIndex((item) => item.slug === breed.slug) + 1) % browserBreeds.length];
    await page.locator(`#litter-tab-${mode}-${nextBreed.slug}`).click();
    const nextUrl = `${baseUrl}/puppies/${mode === "current" ? "current-litters" : "upcoming-litters"}?breed=${nextBreed.slug}`;
    if (page.url() !== nextUrl ||
        await page.locator(`#litter-tab-${mode}-${nextBreed.slug}`).getAttribute("aria-selected") !== "true") {
      blockers.push(`Breed tab did not navigate to ${nextBreed.name}.`);
    }
  }

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
  "This audit checks each current/upcoming litter breed tab against public source records, including populated and empty panels, card destinations, tab navigation, and private-record exclusion. It also checks current litter detail pages and current puppy pages with weekly photos when present, plus broken public images and horizontal overflow at mobile width.",
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
