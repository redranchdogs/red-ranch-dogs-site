import assert from "node:assert/strict";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";
import { litterCardAvailability, litterCardPrice } from "../src/litterCardAvailability.js";

const current = { status: "Current Litter", birthConfirmed: true };
const puppiesWith = (...statuses) => statuses.map((status) => ({ status }));
const cases = [
  [current, [], "", "Availability pending", "neutral"],
  [current, puppiesWith("Reserved", "Matched"), "", "Fully reserved", "reserved"],
  [current, puppiesWith("Reserved", "Availability to be confirmed"), "", "Availability pending", "neutral"],
  [current, puppiesWith("Pending"), "", "Availability pending", "neutral"],
  [current, puppiesWith("Available", "Reserved"), "", "1 puppy available", "available"],
  [current, puppiesWith("Available", "Available", "Matched"), "", "2 puppies available", "available"],
  [current, puppiesWith("Waitlist matching", "Reserved"), "", "Waitlist matching", "neutral"],
  [{ status: "Planned Litter" }, [], "Planning", "Planning", "neutral"],
  [{ status: "Planned Litter", pregnancyConfirmed: true }, [], "Pregnancy confirmed", "Pregnancy confirmed", "neutral"],
  [{ status: "Planned Litter", birthConfirmed: true }, [], "Puppies born", "Availability pending", "neutral"],
  [{ ...current, puppySlugs: ["one", "missing"] }, [{ slug: "one", status: "Reserved" }], "", "Availability pending", "neutral"],
  [{ status: "Previous Litter" }, puppiesWith("Available"), "", "Previous litter", "neutral"]
];
for (const [litter, puppies, fallback, label, tone] of cases) {
  assert.deepEqual(litterCardAvailability(litter, puppies, fallback), { label, tone });
}

const priced = (status, price) => ({ status, price });
const exactPrice = (value) => ({ label: "Puppy price", value, isRange: false });
const priceCases = [
  [current, [], null],
  [current, [priced("Available", "$4,500")], exactPrice("$4,500")],
  [current, [priced(" available ", "$3200.00"), priced("Available", "$3,200")], exactPrice("$3,200")],
  [current, [priced("Available", "$2,800"), priced("Available", "$3,200")], { label: "Price range", value: "$2,800–$3,200", isRange: true }],
  [current, [priced("Available", "$3,200.50")], exactPrice("$3,200.50")],
  [current, [priced("Available", "$3,200"), priced("Reserved", "$2,800")], exactPrice("$3,200")],
  [current, [priced("Available", "$3,200"), priced("Availability to be confirmed", "$2,800")], exactPrice("$3,200")],
  [current, [priced("Reserved", "$2,800"), priced("Matched", "$2,800")], null],
  [current, [priced("Availability to be confirmed", "$2,800")], null],
  [current, [priced("Waitlist matching", "$2,800")], null],
  [{ status: "Planned Litter", priceRange: "$3,200" }, [], null],
  [{ status: "Previous Litter" }, [priced("Available", "$3,200")], null],
  ...[undefined, "", "$0", "$-10", "$3,20", "USD 3200", "$2,800–$3,200", "From $3,200"].map((value) => [current, [priced("Available", value)], null]),
  [current, [priced("Available", "$3,200"), priced("Available", "")], null]
];
for (const [litter, puppies, expectedPrice] of priceCases) {
  assert.deepEqual(litterCardPrice(litter, puppies), expectedPrice);
}

const sourcePaths = ["src/data/puppies.json", "src/data/litters.json"];
const preimages = sourcePaths.map((file) => fs.readFileSync(file));
const isPublic = (item) => !["private", "hidden"].includes(String(item.visibility || "public").toLowerCase());
const publicPuppies = JSON.parse(preimages[0]).filter(isPublic);
const publicLitters = JSON.parse(preimages[1]).filter(isPublic);
const expected = publicLitters.filter((litter) => litter.status === "Current Litter" && litter.breedSlug === "goldendoodle-puppies")
  .map((litter) => {
    const availability = litterCardAvailability(litter, publicPuppies.filter((puppy) => puppy.litterSlug === litter.slug));
    return [litter.name, availability.label, availability.tone, litterCardPrice(litter, publicPuppies.filter((puppy) => puppy.litterSlug === litter.slug))];
  });
const port = Number(process.env.LITTER_CARDS_PORT || 5326);
const base = process.env.LITTER_CARDS_BASE_URL || `http://127.0.0.1:${port}`;
const server = process.env.LITTER_CARDS_BASE_URL ? null : spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "ignore" });
let browser;
try {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(base)).ok) break; } catch { /* Wait for local Vite. */ }
    if (attempt === 59) throw new Error("Litter-card server did not become ready.");
    await delay(250);
  }
  browser = await chromium.launch({ headless: true });
  const errors = [];
  for (const width of [320, 390, 430, 768, 980, 981, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/puppies/current-litters?breed=goldendoodle-puppies`);
    await page.locator(".litter-availability-banner").first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    for (const [name, label, tone, price] of expected) {
      const card = page.locator(".litter-browser-card").filter({ has: page.getByRole("heading", { name, exact: true }) });
      assert.equal((await card.locator(".litter-availability-banner").innerText()).toLowerCase(), label.toLowerCase());
      assert.equal(await card.locator(`.litter-availability-banner.is-${tone}`).count(), 1);
      assert.equal(await card.locator(".litter-browser-card-status").count(), 0, "No duplicate Current Litter pill.");
      assert.equal(await card.locator(".litter-browser-card-body > p").count(), 0, "No card summary/update sentence.");
      const bounds = await card.boundingBox();
      const banner = await card.locator(".litter-availability-banner").boundingBox();
      assert(banner.width >= bounds.width - 3, `Banner not full width: ${name}, ${width}px`);
      assert(banner.height >= 54, `Banner too small: ${name}, ${width}px`);
      assert.equal(await card.locator(".litter-availability-banner").evaluate((el) => el.scrollWidth <= el.clientWidth + 1), true);
      assert.equal(await card.locator(".litter-card-price").count(), price ? 1 : 0, `Price visibility: ${name}`);
      if (price) {
        assert.equal(await card.locator(".litter-card-price strong").innerText(), price.value);
        const priceBounds = await card.locator(".litter-card-price").boundingBox();
        const textBounds = await card.locator(".litter-price-heading-text").boundingBox();
        assert(priceBounds.x >= textBounds.x + textBounds.width, `Price must stay right of title at ${width}px`);
        assert(priceBounds.y < textBounds.y + textBounds.height && priceBounds.y + priceBounds.height > textBounds.y, "Price shares title row");
        assert.equal(await card.locator("h2,.litter-browser-breed,.litter-card-price").evaluateAll((elements) => elements.every((el) => el.scrollWidth <= el.clientWidth + 1)), true, `No clipped price/title: ${name}, ${width}px`);
      }
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `Overflow at ${width}px`);
    if (process.env.LITTER_CARDS_SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.LITTER_CARDS_SCREENSHOT_DIR, { recursive: true });
      await page.locator(".litter-browser-card").first().screenshot({ path: `${process.env.LITTER_CARDS_SCREENSHOT_DIR}/reserved-${width}.png` });
      await page.locator(".litter-browser-card.is-available").first().screenshot({ path: `${process.env.LITTER_CARDS_SCREENSHOT_DIR}/available-${width}.png` });
    }
    const reservedLink = page.getByRole("link", { name: "View litter updates", exact: true }).first();
    assert.equal(await reservedLink.getAttribute("href"), "/litters/beatrix-enzo-planned-2026");
    await reservedLink.click();
    await page.waitForURL("**/litters/beatrix-enzo-planned-2026");
    await page.goBack();
    await page.getByRole("tab", { name: "Bernedoodles", exact: true }).click();
    await page.getByRole("tab", { name: "Bernedoodles", exact: true }).click();
    assert.equal((await page.locator(".litter-availability-banner").innerText()).toLowerCase(), "fully reserved");
    await page.goBack();
    assert.equal(await page.locator(".litter-browser-card").count(), expected.length, "Back restores the prior selected breed.");
    await page.goto(`${base}/puppies/upcoming-litters?breed=cavapoo-puppies`);
    await page.locator(".litter-availability-banner").waitFor();
    assert.equal((await page.locator(".litter-availability-banner").innerText()).toLowerCase(), "planning");
    assert.equal(await page.locator(".litter-browser-card-body > p").count(), 0);
    assert.equal(await page.locator(".litter-card-price").count(), 0, "No speculative price on upcoming cards");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await page.goto(`${base}/puppies/goldendoodle-puppies`);
    await page.locator(".litter-card.has-availability-banner").first().waitFor();
    assert.equal(await page.locator(".litter-card-heading > p").count(), 0);
    for (const card of await page.locator(".litter-card.has-availability-banner").all()) {
      const bounds = await card.boundingBox();
      const banner = await card.locator(".litter-availability-banner").boundingBox();
      assert(Math.abs(banner.x - bounds.x - 1) < 2 && Math.abs(banner.y - bounds.y - 1) < 2, `Legacy card banner clipped at ${width}px`);
      const name = await card.locator("h2").innerText();
      const litter = publicLitters.find((item) => item.name.toLowerCase() === name.toLowerCase());
      assert(litter, `Legacy card source found: ${name}`);
      const price = litterCardPrice(litter, publicPuppies.filter((puppy) => puppy.litterSlug === litter.slug));
      assert.equal(await card.locator(".litter-card-price").count(), price ? 1 : 0);
      assert.equal(await card.locator("dt").filter({ hasText: /^Price$/ }).count(), 0, "No duplicated or reserved price facts");
      if (price) assert.equal(await card.locator(".litter-card-price strong").innerText(), price.value);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await page.close();
  }
  if (server) {
    // Test alternate prices/statuses via a local-only response fixture. Never
    // change the source records or intercept a production response.
    for (const scenario of ["range", "missing-price", "fully-reserved"]) {
      const fixture = JSON.parse(preimages[0]);
      for (const puppy of fixture.filter((item) => item.litterSlug === "evie-waylon-october-2026" && item.status === "Available")) {
        if (scenario === "range" && puppy.name === "Moran") puppy.price = "$2,800";
        if (scenario === "missing-price" && puppy.name === "Moran") puppy.price = "";
        if (scenario === "fully-reserved") puppy.status = "Reserved";
      }
      for (const width of [320, 390, 768]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        await page.route(`${base}/src/data/puppies.json*`, (route) => route.fulfill({
          contentType: "application/javascript", body: `export default ${JSON.stringify(fixture)};`
        }));
        await page.goto(`${base}/puppies/current-litters?breed=goldendoodle-puppies`);
        const card = page.locator(".litter-browser-card").filter({ has: page.getByRole("heading", { name: "Evie + Waylon", exact: true }) });
        await card.waitFor();
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await card.locator(".litter-card-price").count(), scenario === "range" ? 1 : 0);
        if (scenario === "range") {
          assert.equal(await card.locator(".litter-card-price strong").innerText(), "$2,800–$3,200");
          assert.equal(await card.locator("h2,.litter-browser-breed,.litter-card-price").evaluateAll((elements) => elements.every((el) => el.scrollWidth <= el.clientWidth + 1)), true, `Range layout at ${width}px`);
        }
        if (scenario === "fully-reserved") assert.equal((await card.locator(".litter-availability-banner").innerText()).toLowerCase(), "fully reserved");
        await page.close();
      }
    }
  }
  assert.deepEqual(errors, [], "No runtime errors.");
  sourcePaths.forEach((file, index) => assert.deepEqual(fs.readFileSync(file), preimages[index], `${file} remains unchanged.`));
  console.log(`Litter cards passed: ${cases.length} status cases and ${priceCases.length} price cases; 320–1440px banners and right-aligned actionable prices; exact counts and neutral pending states; no reserved/unknown prices; removed summaries; reserved links; repeated breed selection and Back; upcoming and breed-page cards; source records unchanged.`);
} finally {
  await browser?.close();
  if (server && server.exitCode === null) {
    const exited = new Promise((resolve) => server.once("exit", resolve));
    server.kill("SIGTERM");
    await Promise.race([exited, delay(3000)]);
    if (server.exitCode === null) server.kill("SIGKILL");
  }
}
