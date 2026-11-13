import assert from "node:assert/strict";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { URL } from "node:url";
import { chromium } from "playwright";
import { resolveImageUrl } from "../src/imageVersions.js";
import { guidePath, guideArticles, articlePath } from "../src/data/puppyGuide.js";

const isPublic = (p) => !["private", "hidden"].includes(String(p.visibility || "public").trim().toLowerCase());
const sourceFiles = ["puppies", "litters", "parents", "previousLitters", "breeds"].map((name) => `src/data/${name}.json`);
const before = sourceFiles.map((file) => fs.readFileSync(file));
const [puppies, litters, parents, archives, breeds] = before.map((data) => JSON.parse(data).filter(isPublic));
const available = puppies.filter((p) => String(p.status).trim().toLowerCase() === "available");
const featured = available.filter((p) => litters.find((l) => l.slug === p.litterSlug)?.featuredAvailable === true);
const parentRoutes = ["/parents", "/parents/mamas", "/parents/studs", "/parents/goldendoodle-parents", "/parents/cavapoo-parents", "/parents/bernedoodle-parents"];
const port = Number(process.env.SITE_COHESION_PORT || 5352);
const base = process.env.SITE_COHESION_BASE_URL || `http://127.0.0.1:${port}`;
const server = process.env.SITE_COHESION_BASE_URL ? null : spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "ignore" });
const screenshotDir = process.env.SITE_COHESION_SCREENSHOT_DIR;
if (screenshotDir) fs.mkdirSync(screenshotDir, { recursive: true });
const errors = [];
let browser;
let checks = 0;
async function visit(page, route) {
  await page.goto(`${base}${route}`);
  await page.locator("h1").waitFor();
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator("h1").count(), 1, `${route}: one page title`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${route}: no horizontal page overflow`);
  assert.equal(await page.getByRole("heading", { name: /get you back on track/i }).count(), 0, `${route}: real page, not fallback`);
  checks += 1;
}
async function fullPhoto(card, selector, puppy) {
  const img = card.locator(selector);
  await img.scrollIntoViewIfNeeded();
  await img.evaluate((el) => el.decode());
  assert.equal(new URL(await img.getAttribute("src"), base).pathname, new URL(resolveImageUrl(puppy.mainPhoto || puppy.image), base).pathname);
  const frame = await img.evaluate((el) => {
    const r = el.getBoundingClientRect(), b = el.closest("article").querySelector(".litter-puppy-status").getBoundingClientRect();
    return { ratio: r.width / r.height, natural: el.naturalWidth / el.naturalHeight, gap: r.top - b.bottom, fit: window.getComputedStyle(el).objectFit, bar: b.height };
  });
  assert(Math.abs(frame.ratio - frame.natural) < .005, `${puppy.slug}: unaltered photo ratio`);
  assert.equal(frame.fit, "contain");
  assert(Math.abs(frame.gap) < 1 && frame.bar <= 38, "Slim status uses its own row, not photo space");
}
async function cardSurface(card) {
  assert.equal(await card.evaluate((el) => window.getComputedStyle(el).borderRadius), "12px");
  assert.equal(await card.evaluate((el) => window.getComputedStyle(el).backgroundColor), "rgb(255, 250, 240)");
}
try {
  for (let i = 0; i < 60; i += 1) {
    try { if ((await fetch(base)).ok) break; } catch { /* Wait for local test server. */ }
    if (i === 59) throw new Error("Site cohesion test server not ready");
    await delay(250);
  }
  browser = await chromium.launch({ headless: true });
  for (const width of [320, 390, 430, 768, 980, 981, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on("pageerror", (e) => errors.push(e.message));
    await visit(page, "/");
    assert.equal(await page.locator(".home-ready-puppy-card").count(), featured.length);
    for (const puppy of featured) {
      const card = page.locator(".home-ready-puppy-card").filter({ has: page.getByRole("heading", { name: puppy.name, exact: true }) });
      assert.equal(await card.locator(".litter-puppy-status").innerText(), "AVAILABLE");
      await cardSurface(card);
      await fullPhoto(card, ".home-ready-puppy-photo img", puppy);
      const reserve = card.getByRole("link", { name: `Reserve ${puppy.name}`, exact: true });
      assert.equal(await reserve.getAttribute("href"), `/apply?interest=${encodeURIComponent(puppy.slug)}`);
      assert((await reserve.boundingBox()).height >= 48);
      assert.equal(await reserve.evaluate((el) => window.getComputedStyle(el).backgroundColor), "rgb(148, 31, 23)");
      assert.equal(await card.locator(".home-ready-puppy-photo").getAttribute("href"), `/puppies/${puppy.slug}`);
      assert.equal(await card.locator(".home-ready-puppy-price").innerText(), puppy.price);
    }
    if (screenshotDir && [390, 1440].includes(width)) await page.locator(".home-ready-strip-section").screenshot({ path: `${screenshotDir}/home-${width}.png`, style: ".premium-header,.sticky-mobile-cta,.skip-link{visibility:hidden!important}" });
    for (const breed of breeds) {
      await visit(page, breed.route);
      const expected = available.filter((p) => p.breedSlug === breed.slug);
      assert.equal(await page.locator(".breed-puppy-card").count(), expected.length);
      for (const puppy of expected) {
        const card = page.locator(".breed-puppy-card").filter({ has: page.getByRole("heading", { name: puppy.name, exact: true }) });
        await cardSurface(card);
        await fullPhoto(card, ".litter-puppy-portrait img", puppy);
        const text = await card.innerText();
        for (const fact of [puppy.breed, puppy.gender || puppy.sex, puppy.collarColor, puppy.price, puppy.birthDate || puppy.born, puppy.litter || puppy.litterName, puppy.goHomeDate || puppy.goHome, puppy.estimatedAdultWeight || puppy.size].filter(Boolean)) assert(text.includes(fact), `${puppy.slug}: preserve ${fact}`);
        assert.equal(await card.getByRole("link", { name: "View Puppy", exact: true }).getAttribute("href"), `/puppies/${puppy.slug}`);
        assert.equal(await card.locator("figcaption,.status-badge,.puppy-reserved-ribbon").count(), 0);
        if (screenshotDir && puppy.slug === "penn" && [390, 1440].includes(width)) await card.screenshot({ path: `${screenshotDir}/breed-penn-${width}.png` });
      }
    }
    for (const route of parentRoutes) {
      await visit(page, route);
      const nav = page.getByRole("navigation", { name: "Parent dog categories" });
      assert.equal(await nav.locator('[aria-current="page"]').count(), 1);
      assert.equal(await nav.locator('[aria-current="page"]').getAttribute("href"), route);
      for (const card of await page.locator(".parent-profile-card").all()) {
        await cardSurface(card);
        for (const link of await card.locator(".parent-profile-link").all()) assert((await link.boundingBox()).height >= 48, `${route} at ${width}px: 48px profile action target`);
      }
    }
    for (const route of [guidePath, ...guideArticles.map(articlePath)]) {
      await visit(page, route);
      for (const card of await page.locator(".guide-card").all()) await cardSurface(card);
      for (const link of await page.locator(".guide-read-link,.guide-contact,.guide-all-link,.guide-related-links a,.guide-section-heading > a,.guide-contents nav a,.puppy-guide .button").all()) assert((await link.boundingBox()).height >= 44, "Guide action target");
    }
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  for (const litter of litters.filter((l) => ["lulu-bram-fall-2026", "kylie-ranger-late-summer-2026"].includes(l.slug))) {
    await visit(page, `/litters/${litter.slug}`);
    const portraits = page.locator(".litter-parent-portrait");
    assert.equal(await portraits.count(), 2);
    for (let i = 0; i < 2; i += 1) {
      const slug = [litter.mamaSlug, litter.studSlug][i];
      const portrait = portraits.nth(i);
      const isPublicParent = parents.some((p) => p.slug === slug);
      assert.equal(await portrait.evaluate((el) => el.tagName), isPublicParent ? "A" : "DIV");
      assert.equal(await portrait.getAttribute("href"), isPublicParent ? `/parents/${slug}` : null);
      await portrait.locator("img").evaluate((el) => el.decode());
    }
  }
  const archiveHrefs = [...new Set(puppies.filter((p) => !litters.some((l) => l.slug === p.litterSlug)).map((p) => `/${p.litterSlug}`).filter((href) => archives.some((a) => a.href === href)))];
  assert.equal(archiveHrefs.length, 5, "Regression covers all five repaired archives");
  for (const href of archiveHrefs) await visit(page, href);
  await visit(page, "/parents/mamas");
  await page.getByRole("navigation", { name: "Parent dog categories" }).getByRole("link", { name: "Studs", exact: true }).click();
  await page.waitForURL("**/parents/studs");
  assert.equal(await page.locator('.parent-directory-nav [aria-current="page"]').textContent(), "Studs");
  await page.goBack(); await page.waitForURL("**/parents/mamas");
  assert.equal(await page.locator('.parent-directory-nav [aria-current="page"]').textContent(), "Mamas");
  assert.deepEqual(errors, []);
  sourceFiles.forEach((file, index) => assert(fs.readFileSync(file).equals(before[index]), "No source data changes"));
  console.log(`Site cohesion passed: ${checks} route/viewport checks, seven widths 320–1440px, home/breed full photos and facts, parent card surfaces and category navigation, guide targets, five archive destinations and private-parent non-links. No form submissions.`);
} finally {
  await browser?.close();
  if (server && server.exitCode === null) {
    const exited = new Promise((resolve) => server.once("exit", resolve));
    server.kill("SIGTERM"); await Promise.race([exited, delay(3000)]);
    if (server.exitCode === null) server.kill("SIGKILL");
  }
}
