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

  return spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

async function stopDevServer(server) {
  if (!server || server.exitCode !== null) return;

  const exited = new Promise((resolve) => server.once("exit", resolve));
  server.kill("SIGTERM");

  await Promise.race([
    exited,
    delay(3000).then(() => {
      if (server.exitCode === null) server.kill("SIGKILL");
    })
  ]);
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
const currentLitters = litters.filter((litter) => normalize(litter.status).includes("current"));
const plannedLitters = litters.filter((litter) => /planned|upcoming/.test(normalize(litter.status)));
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
      ...(featuredAvailablePuppies.length ? [] : ["explore our upcoming litters", "join the waitlist"])
    ],
    availableAccordionCheck: true,
    forbiddenText: hiddenAvailablePuppies.map((puppy) => puppy.name),
    requiredSelectors: [featuredAvailablePuppies.length ? ".available-puppy-breed-group" : ".smart-empty-state"]
  },
  {
    route: "/puppies/current-litters",
    requiredText: [
      "current litters",
      ...(currentLitters.length ? [] : ["planned pairings are ahead", "join the waitlist"])
    ],
    requiredSelectors: currentLitters.length
      ? [".current-litter-list"]
      : [".smart-empty-state", ...(plannedLitters.length ? [".zero-inventory-upcoming-path"] : [])]
  },
  ...litters
    .filter((litter) => litter.pastPuppyGallery?.images?.length)
    .map((litter) => ({
      route: `/litters/${litter.slug}/past-puppies`,
      requiredText: [
        litter.pastPuppyGallery.title,
        litter.pastPuppyGallery.ageLabel,
        "helpful reference, not a guarantee"
      ],
      requiredSelectors: [".past-pairing-context", ".past-puppy-photo-grid"]
    })),
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
    route: "/stud-services/our-studs",
    requiredText: ["health-tested stud services", "stud inquiry", "preferred stud", "brucellosis status"],
    requiredSelectors: [".stud-card-grid", ".stud-inquiry-shell", ".lead-form", "select[name='preferredStud']", "select[name='serviceType']"]
  },
  {
    route: "/apply",
    requiredText: ["puppy application", "no obligation", "guided choice", "clear next step"],
    requiredSelectors: [".application-intro-panel", ".application-reassurance-grid", ".lead-form"]
  },
  {
    route: "/contact",
    requiredText: ["contact us", "send us a note", "preferred reply", "what can we help with"],
    requiredSelectors: [".contact-page-grid", ".lead-form", "select[name='preferredContactMethod']", "select[name='inquiryType']"]
  },
  {
    route: "/guardian-program/application",
    requiredText: ["guardian application", "guardian interest", "distance from salado", "secure fenced yard"],
    requiredSelectors: [".guardian-before-apply", ".form-shell", ".lead-form", "select[name='guardianType']", "input[name='guardianAgreement']"]
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
    const visibleElement = (node) => {
      if (!node || node.closest("[hidden], [aria-hidden='true']")) return false;

      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      return rect.width > 1 && rect.height > 1 && style.visibility !== "hidden" && style.display !== "none";
    };
    const textForIdRefs = (idRefs = "") => {
      return idRefs
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent || "")
        .join(" ")
        .trim();
    };
    const accessibleName = (node) => {
      if (!node) return "";

      const labelledBy = node.getAttribute("aria-labelledby");
      const ariaName = node.getAttribute("aria-label") || "";
      const labelText = Array.from(node.labels || [])
        .map((label) => label.textContent || "")
        .join(" ");
      const closestLabelText = node.closest("label")?.textContent || "";
      const textName = node.textContent || "";
      const imageAltText = Array.from(node.querySelectorAll?.("img") || [])
        .map((image) => image.getAttribute("alt") || "")
        .join(" ");

      return [
        ariaName,
        textForIdRefs(labelledBy || ""),
        labelText,
        closestLabelText,
        node.getAttribute("title") || "",
        node.getAttribute("placeholder") || "",
        node.getAttribute("value") || "",
        textName,
        imageAltText
      ]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    };
    const describeElement = (node) => {
      const tag = node.tagName.toLowerCase();
      const name = node.getAttribute("name");
      const type = node.getAttribute("type");
      const href = node.getAttribute("href");
      const label = accessibleName(node).slice(0, 48);

      return [tag, name ? `[name="${name}"]` : "", type ? `[type="${type}"]` : "", href ? `[href="${href}"]` : "", label ? `"${label}"` : ""]
        .filter(Boolean)
        .join("");
    };
    const horizontalOverflow = Math.max(documentElement.scrollWidth, body.scrollWidth) - viewportWidth;
    const visibleBrokenImages = Array.from(document.images)
      .filter((image) => {
        return visibleElement(image) && image.getBoundingClientRect().width > 20 && image.getBoundingClientRect().height > 20 && image.complete && image.naturalWidth === 0;
      })
      .map((image) => image.currentSrc || image.src || image.alt || "unknown image")
      .slice(0, 8);
    const missingImageAlt = Array.from(document.images)
      .filter((image) => visibleElement(image) && !image.hasAttribute("alt"))
      .map((image) => image.currentSrc || image.src || "visible image without alt")
      .slice(0, 8);
    const unnamedControls = Array.from(document.querySelectorAll("input, select, textarea"))
      .filter((control) => {
        const type = String(control.getAttribute("type") || "").trim().toLowerCase();
        return !["hidden", "submit", "button", "reset"].includes(type) && visibleElement(control) && !accessibleName(control);
      })
      .map(describeElement)
      .slice(0, 8);
    const unnamedButtons = Array.from(document.querySelectorAll("button, input[type='button'], input[type='submit'], input[type='reset']"))
      .filter((button) => visibleElement(button) && !accessibleName(button))
      .map(describeElement)
      .slice(0, 8);
    const unnamedLinks = Array.from(document.querySelectorAll("a[href]"))
      .filter((link) => visibleElement(link) && !accessibleName(link))
      .map(describeElement)
      .slice(0, 8);
    const duplicateIds = Object.entries(
      Array.from(document.querySelectorAll("[id]")).reduce((counts, node) => {
        counts[node.id] = (counts[node.id] || 0) + 1;
        return counts;
      }, {})
    )
      .filter(([, count]) => count > 1)
      .map(([id, count]) => `${id} (${count})`)
      .slice(0, 8);
    const h1Count = Array.from(document.querySelectorAll("h1")).filter(visibleElement).length;
    const bodyHeight = Math.max(body.scrollHeight, documentElement.scrollHeight);

    return {
      bodyHeight,
      duplicateIds,
      horizontalOverflow,
      h1Count,
      missingImageAlt,
      unnamedButtons,
      unnamedControls,
      unnamedLinks,
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

    if (config.availableAccordionCheck && featuredAvailablePuppies.length) {
      const initiallyOpenPanels = await visibleCount(page, ".available-puppy-panel");
      const initiallyVisibleCards = await visibleCount(page, ".available-puppy-card");
      const toggles = page.locator(".available-puppy-breed-group .upcoming-breed-toggle");
      const toggleCount = await toggles.count();

      if (initiallyOpenPanels !== 0) failures.push(`Available puppy accordions should start closed, found ${initiallyOpenPanels} open panels.`);
      if (initiallyVisibleCards !== 0) failures.push(`Available puppy cards should be hidden until a breed group opens, found ${initiallyVisibleCards} visible cards.`);
      const summaryText = normalize(await page.locator(".available-puppy-summary").allTextContents().then((items) => items.join(" ")));
      const missingSummaryNames = featuredAvailablePuppies
        .map((puppy) => puppy.name)
        .filter((name) => !includesText(summaryText, name));
      if (missingSummaryNames.length) failures.push(`Closed available-puppy summaries are missing: ${missingSummaryNames.join(", ")}`);
      if (toggleCount < 1) {
        failures.push("Available puppy breed toggles were not found.");
      } else {
        const firstToggle = toggles.first();
        const initialExpanded = await firstToggle.getAttribute("aria-expanded");
        if (initialExpanded !== "false") failures.push(`First available puppy breed toggle should start aria-expanded=false, got ${initialExpanded}`);

        await firstToggle.click();

        const openedExpanded = await firstToggle.getAttribute("aria-expanded");
        const openedPanels = await visibleCount(page, ".available-puppy-panel");
        const openedCards = await visibleCount(page, ".available-puppy-card");

        if (openedExpanded !== "true") failures.push(`First available puppy breed toggle should be aria-expanded=true after click, got ${openedExpanded}`);
        if (openedPanels < 1) failures.push("Opening an available puppy breed group did not reveal a panel.");
        if (openedCards < 1) failures.push("Opening an available puppy breed group did not reveal puppy cards.");
      }
    }

    const health = await pageHealth(page);
    if (health.bodyHeight < 500) failures.push(`Body height looks too small: ${health.bodyHeight}px`);
    if (health.h1Count !== 1) failures.push(`Expected exactly one visible h1, found ${health.h1Count}`);
    if (health.horizontalOverflow > 6) failures.push(`Horizontal overflow: ${Math.round(health.horizontalOverflow)}px`);
    if (health.visibleBrokenImages.length) failures.push(`Broken visible images: ${health.visibleBrokenImages.join("; ")}`);
    if (health.missingImageAlt.length) failures.push(`Visible images missing alt attributes: ${health.missingImageAlt.join("; ")}`);
    if (health.unnamedControls.length) failures.push(`Visible form controls missing accessible names: ${health.unnamedControls.join("; ")}`);
    if (health.unnamedButtons.length) failures.push(`Visible buttons missing accessible names: ${health.unnamedButtons.join("; ")}`);
    if (health.unnamedLinks.length) failures.push(`Visible links missing accessible names: ${health.unnamedLinks.join("; ")}`);
    if (health.duplicateIds.length) failures.push(`Duplicate element IDs: ${health.duplicateIds.join("; ")}`);
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

async function auditMobileMenu(context) {
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const failures = [];

  try {
    const response = await page.goto(`${baseUrl}/puppies/available`, { waitUntil: "networkidle", timeout: 20000 });
    const status = response?.status() || 0;
    if (status >= 400 || status === 0) failures.push(`HTTP status ${status || "unknown"}`);

    await page.evaluate(() => window.scrollTo(0, Math.min(1200, document.body.scrollHeight / 3)));

    const menuButton = page.getByRole("button", { name: "Open menu" });
    const menuButtonCount = await menuButton.count();
    if (menuButtonCount !== 1) {
      failures.push(`Expected one Open menu button, found ${menuButtonCount}`);
    } else {
      const buttonBox = await menuButton.boundingBox();
      if (!buttonBox || buttonBox.y < -1 || buttonBox.y > 120) {
        failures.push("Open menu button is not reachable near the top of the mobile viewport after scrolling.");
      }

      await menuButton.click();

      const menu = page.locator("#mobile-primary-menu");
      const menuOpen = page.locator("#mobile-primary-menu.open");
      const expanded = await page.locator(".premium-menu-button").getAttribute("aria-expanded");
      const ariaHidden = await menu.getAttribute("aria-hidden");
      const inert = await menu.getAttribute("inert");
      const menuVisible = await menuOpen.isVisible();

      if (expanded !== "true") failures.push(`Mobile menu aria-expanded should be true after opening, got ${expanded}`);
      if (ariaHidden !== "false") failures.push(`Mobile menu aria-hidden should be false after opening, got ${ariaHidden}`);
      if (inert !== null) failures.push("Mobile menu should not keep inert after opening.");
      if (!menuVisible) failures.push("Mobile menu did not become visible after tap.");

      const menuText = normalize(await menu.innerText());
      for (const phrase of ["home", "puppies", "available puppies", "apply", "text us now"]) {
        if (!includesText(menuText, phrase)) failures.push(`Mobile menu missing text: ${phrase}`);
      }

      const puppiesTrigger = page.locator(".mobile-menu-trigger", { hasText: "Puppies" });
      if ((await puppiesTrigger.count()) !== 1) {
        failures.push("Expected one mobile Puppies submenu trigger.");
      } else {
        await puppiesTrigger.click();
        const puppiesSubmenu = page.locator("#mobile-nav-puppies");
        const submenuText = normalize(await puppiesSubmenu.innerText());
        const currentLittersLinkVisible = await page.locator("#mobile-nav-puppies a", { hasText: "Current Litters" }).isVisible();
        const availableLinkVisible = await page.locator("#mobile-nav-puppies a", { hasText: "Available Puppies" }).isVisible();

        if (!currentLittersLinkVisible) failures.push("Puppies submenu did not expose Current Litters.");
        if (!availableLinkVisible || !includesText(submenuText, "available puppies")) {
          failures.push("Puppies submenu did not expose Available Puppies.");
        }
      }

      const closeButton = page.getByRole("button", { name: "Close menu" });
      if ((await closeButton.count()) !== 1) {
        failures.push("Expected one Close menu button after opening.");
      } else {
        await closeButton.click();
        const collapsed = await page.locator(".premium-menu-button").getAttribute("aria-expanded");
        const closedAriaHidden = await menu.getAttribute("aria-hidden");
        const closedInert = await menu.getAttribute("inert");

        if (collapsed !== "false") failures.push(`Mobile menu aria-expanded should be false after closing, got ${collapsed}`);
        if (closedAriaHidden !== "true") failures.push(`Mobile menu aria-hidden should be true after closing, got ${closedAriaHidden}`);
        if (closedInert === null) failures.push("Mobile menu should restore inert after closing.");
      }
    }

    const health = await pageHealth(page);
    if (health.horizontalOverflow > 6) failures.push(`Horizontal overflow after menu interaction: ${Math.round(health.horizontalOverflow)}px`);
    if (pageErrors.length) failures.push(`Page errors: ${pageErrors.slice(0, 3).join("; ")}`);
    if (consoleErrors.length) failures.push(`Console errors: ${consoleErrors.slice(0, 3).join("; ")}`);

    return {
      failures,
      route: "/puppies/available mobile menu",
      title: await page.title(),
      viewportName: "mobile"
    };
  } catch (error) {
    failures.push(`Mobile menu check failed: ${error.message}`);
    return {
      failures,
      route: "/puppies/available mobile menu",
      title: "",
      viewportName: "mobile"
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

    if (viewport.isMobile) {
      results.push(await auditMobileMenu(context));
    }

    await context.close();
  }
} finally {
  if (browser) await browser.close();
  await stopDevServer(server);
}

const failed = results.filter((result) => result.failures.length);

console.log(`Public route smoke checked ${routeExpectations.length} routes across ${viewports.length} viewports plus mobile menu interaction.`);
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
