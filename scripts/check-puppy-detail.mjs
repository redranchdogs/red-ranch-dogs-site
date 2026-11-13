import assert from "node:assert/strict";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { URL } from "node:url";
import { chromium } from "playwright";
import { resolveImageUrl } from "../src/imageVersions.js";

const dataFile = "src/data/puppies.json";
const before = fs.readFileSync(dataFile);
const puppies = JSON.parse(before).filter((p) => !["private", "hidden"].includes(String(p.visibility || "public").toLowerCase()));
const publicRecord = (p) => !["private", "hidden"].includes(String(p.visibility || "public").trim().toLowerCase());
const litters = JSON.parse(fs.readFileSync("src/data/litters.json")).filter(publicRecord);
const archives = JSON.parse(fs.readFileSync("src/data/previousLitters.json")).filter(publicRecord);
const expectedLitterHref = (puppy) => litters.some((litter) => litter.slug === puppy.litterSlug)
  ? `/litters/${puppy.litterSlug}`
  : archives.find((archive) => archive.href === `/${puppy.litterSlug}`)?.href || "";
const statuses = new Set();
const sampled = puppies.filter((p) => {
  const key = String(p.status || "").trim().toLowerCase();
  if (["penn", "columbo", "sherlock"].includes(p.slug) || p.litterSlug === "beatrix-enzo-planned-2026" && key === "available" && !statuses.has("beatrix")) {
    if (p.litterSlug === "beatrix-enzo-planned-2026") statuses.add("beatrix");
    statuses.add(key); return true;
  }
  if (!statuses.has(key)) { statuses.add(key); return true; }
  return false;
});
const port = Number(process.env.PUPPY_DETAIL_PORT || 5338);
const base = process.env.PUPPY_DETAIL_BASE_URL || `http://127.0.0.1:${port}`;
const server = process.env.PUPPY_DETAIL_BASE_URL ? null : spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "ignore" });
const screenshotDir = process.env.PUPPY_DETAIL_SCREENSHOT_DIR;
if (screenshotDir) fs.mkdirSync(screenshotDir, { recursive: true });
let browser;
const errors = [];
let checked = 0;
try {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(base)).ok) break; } catch { /* Wait for test server. */ }
    if (attempt === 59) throw new Error("Puppy detail test server did not become ready.");
    await delay(250);
  }
  browser = await chromium.launch({ headless: true });
  for (const width of [320, 390, 430, 768, 980, 981, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on("pageerror", (error) => errors.push(error.message));
    const checkSet = width === 390 ? puppies : sampled;
    for (const puppy of checkSet) {
      await page.goto(`${base}/puppies/${puppy.slug}`);
      const card = page.locator(".puppy-profile-card");
      await card.waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator("h1").count(), 1, `${puppy.slug}: one h1`);
      assert.equal(await card.locator("h1").innerText(), puppy.name);
      const status = puppy.status || "Status to be announced";
      const normalized = status.trim().toLowerCase();
      const isAvailable = normalized === "available";
      assert.equal(await card.locator("figcaption").innerText(), ["reserved", "matched"].includes(normalized) ? "Reserved" : normalized === "available" ? "Available" : status);
      assert.equal(await card.locator(".puppy-profile-primary").innerText(), isAvailable ? `RESERVE ${puppy.name.toUpperCase()}` : "JOIN WAITLIST");
      assert.equal(await card.locator(".puppy-profile-primary").getAttribute("href"), isAvailable ? `/apply?interest=${encodeURIComponent(puppy.slug)}` : "/apply");
      const photo = puppy.mainPhoto || puppy.image;
      if (photo) {
        const img = card.locator("img");
        assert.equal(await img.getAttribute("alt"), `${puppy.name} - ${puppy.breed || "Breed to be announced"}`);
        await img.evaluate((el) => el.decode());
        assert.equal(await img.evaluate((el) => window.getComputedStyle(el).objectFit), "contain", "Real photos retain full frame");
        assert.equal(new URL(await img.getAttribute("src"), base).pathname, new URL(resolveImageUrl(photo), base).pathname, "Same source photo and approved cache-version alias");
      }
      const facts = await card.locator(".puppy-profile-facts").innerText();
      for (const value of [puppy.litter || puppy.litterName || "Litter to be announced", puppy.goHomeDate || puppy.goHome || "Go-home timing to be announced", puppy.birthDate || puppy.born, puppy.collarColor].filter(Boolean)) assert(facts.includes(value), `${puppy.slug}: preserve ${value}`);
      assert.equal(await card.locator(".puppy-profile-price").count(), puppy.price ? 1 : 0);
      if (puppy.price) assert((await card.locator(".puppy-profile-price").innerText()).includes(puppy.price));
      const hasInquiry = isAvailable && puppy.litterSlug === "beatrix-enzo-planned-2026";
      assert.equal(await card.locator(".puppy-profile-inquiry").count(), hasInquiry ? 1 : 0);
      if (hasInquiry) assert.equal(await card.locator(".puppy-profile-inquiry").getAttribute("href"), `/litters/${puppy.litterSlug}?interest=${encodeURIComponent(puppy.slug)}#beatrix-inquiry`);
      const expectedLitter = expectedLitterHref(puppy);
      const litterLink = card.getByRole("link", { name: "View Litter", exact: true });
      assert.equal(await litterLink.count(), expectedLitter ? 1 : 0);
      if (expectedLitter) assert.equal(await litterLink.getAttribute("href"), expectedLitter);
      assert.equal(await page.locator(".sticky-mobile-cta a").last().getAttribute("href"), expectedLitter || "/puppies/current-litters");
      assert.equal(await card.locator(".puppy-profile-status > span").evaluate((el) => window.getComputedStyle(el).backgroundColor), isAvailable ? "rgb(43, 86, 61)" : ["reserved", "matched"].includes(normalized) ? "rgb(148, 31, 23)" : "rgb(83, 75, 67)", "Consistent truthful status colors");
      const note = puppy.personalityNote || puppy.description || "";
      const text = await card.innerText();
      if (note && !/personality notes (will|are)/i.test(note)) assert(text.includes(note), "Preserve personality note");
      if (puppy.availabilityNote && normalized !== "waitlist matching") assert(text.includes(puppy.availabilityNote), "Preserve availability note");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${puppy.slug}: page overflow ${width}`);
      assert.equal(await card.locator("h1,.puppy-profile-price,dd,.puppy-profile-status,.puppy-profile-primary").evaluateAll((els) => els.every((el) => el.scrollWidth <= el.clientWidth + 1)), true, `${puppy.slug}: clipped text ${width}`);
      for (const link of await card.locator("a").all()) assert((await link.boundingBox()).height >= 44, "44px action targets");
      if (screenshotDir && [390, 1440].includes(width) && ["penn", "sherlock"].includes(puppy.slug)) await card.screenshot({ path: `${screenshotDir}/${puppy.slug}-${width}.png` });
      checked += 1;
    }
    await page.close();
  }
  // Navigation only. Do not submit any application or production form.
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await page.goto(`${base}/puppies/penn`);
  const card = page.locator(".puppy-profile-card");
  await card.locator(".puppy-profile-primary").click();
  await page.waitForURL(/\/apply\?interest=penn$/);
  await page.goBack();
  await card.waitFor();
  await card.getByRole("link", { name: "View Litter", exact: true }).click();
  await page.waitForURL(/\/litters\/lulu-bram-fall-2026$/);
  await page.goBack();
  await card.waitFor();
  await page.goForward();
  await page.waitForURL(/\/litters\/lulu-bram-fall-2026$/);
  assert.deepEqual(errors, []);
  assert(fs.readFileSync(dataFile).equals(before), "Test never modifies puppy source data");
  console.log(`Puppy detail QA passed: ${checked} route/viewport checks, ${puppies.length} public profiles, ${sampled.length} representative profiles at 320–1440px, full-frame real photos, preserved statuses/details/links, Reserve/View Litter and Back/Forward verified. No form submissions.`);
} finally {
  await browser?.close();
  server?.kill();
}
