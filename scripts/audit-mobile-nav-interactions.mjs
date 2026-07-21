import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const root = process.cwd();
const outputPath = path.join(root, "docs", "MOBILE_NAV_QA_REPORT.md");
const port = Number(process.env.MOBILE_NAV_QA_PORT || 5204);
const baseUrl = `http://127.0.0.1:${port}`;
const routes = [
  "/",
  "/puppies/current-litters",
  "/puppies/available",
  "/birdie-waylon-spring-2026",
  "/litters/whitley-waylon-april-2026",
  "/apply",
  "/contact",
];

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
      throw new Error(`Mobile nav QA server exited before startup at ${baseUrl}${serverOutput ? `\n${serverOutput.trim()}` : ""}`);
    }

    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Keep polling while Vite starts.
    }

    await delay(400);
  }

  throw new Error(`Mobile nav QA server did not start at ${baseUrl}${serverOutput ? `\n${serverOutput.trim()}` : ""}`);
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

async function auditRoute(page, route) {
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 20000 });
  await page.evaluate(() => window.scrollTo(0, Math.min(1200, document.body.scrollHeight / 3)));

  const buttonBeforeOpen = await page.locator(".premium-menu-button").boundingBox();
  await page.locator(".premium-menu-button").click();
  const isExpanded = await page.locator(".premium-menu-button").getAttribute("aria-expanded");
  const menuVisible = await page.locator("#mobile-primary-menu.open").isVisible();
  const puppiesTrigger = page.locator(".mobile-menu-trigger", { hasText: "Puppies" });
  await puppiesTrigger.click();
  const submenuText = await page.locator("#mobile-nav-puppies").innerText();
  const currentLittersLinkVisible = await page.locator("#mobile-nav-puppies a", { hasText: "Current Litters" }).isVisible();
  await page.locator(".premium-menu-button").click();
  const isClosed = await page.locator(".premium-menu-button").getAttribute("aria-expanded");

  const blockers = [];
  const warnings = [];

  if ((response?.status() || 0) >= 400) blockers.push(`HTTP status ${response.status()}`);
  if (!buttonBeforeOpen || buttonBeforeOpen.y < -1 || buttonBeforeOpen.y > 120) {
    blockers.push("Menu button is not reachable near the top of the mobile viewport after scrolling.");
  }
  if (isExpanded !== "true") blockers.push("Menu button did not report aria-expanded=true after tap.");
  if (!menuVisible) blockers.push("Mobile menu did not become visible after tap.");
  if (!currentLittersLinkVisible || !submenuText.includes("Available Puppies")) {
    blockers.push("Puppies submenu did not expose expected buyer links.");
  }
  if (isClosed !== "false") warnings.push("Menu button did not return aria-expanded=false after close tap.");
  if (pageErrors.length) blockers.push(`Page errors: ${pageErrors.slice(0, 3).join("; ")}`);
  if (consoleErrors.length) warnings.push(`Console errors: ${consoleErrors.slice(0, 3).join("; ")}`);

  return {
    blockers,
    route,
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
const lines = [
  "# Mobile Nav QA Report",
  "",
  `Generated: ${generatedAt} Central`,
  "",
  `Status: **${blockers.length ? "FAIL" : "PASS"}**`,
  "",
  "This audit opens buyer-critical routes at a phone viewport, scrolls down the page, taps the mobile menu, expands the Puppies submenu, confirms core buyer links are visible, and closes the menu again.",
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
  "| Route | Status | Title |",
  "| --- | ---: | --- |",
  ...results.map((result) => `| ${result.route} | ${result.status} | ${result.title} |`),
  "",
].join("\n");

fs.writeFileSync(outputPath, lines);

console.log(`Mobile nav QA report written to ${path.relative(root, outputPath)}`);
console.log(`Status: ${blockers.length ? "FAIL" : "PASS"}`);

if (serverOutput && process.env.MOBILE_NAV_QA_DEBUG) {
  console.log(serverOutput);
}

if (blockers.length) {
  blockers.forEach((result) => console.error(`- ${result.route}: ${result.blockers.join(" | ")}`));
  process.exit(1);
}
