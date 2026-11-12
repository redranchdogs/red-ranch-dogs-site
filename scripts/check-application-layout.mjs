import assert from "node:assert/strict";
import fs from "node:fs";
import { URL } from "node:url";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const port = Number(process.env.APPLICATION_LAYOUT_PORT || 5321);
const base = process.env.APPLICATION_LAYOUT_BASE_URL || `http://127.0.0.1:${port}`;
const server = process.env.APPLICATION_LAYOUT_BASE_URL ? null : spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "ignore" });
const puppies = JSON.parse(fs.readFileSync("src/data/puppies.json", "utf8"));
const puppy = puppies.find((item) => item.slug === "twain");
assert.equal(puppy.status, "Reserved", "The real Twain record must remain reserved.");
const fixture = { ...puppy, slug: "layout-fixture", name: "Layout Fixture", status: "Available" };
let browser;

try {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(base)).ok) break; } catch { /* Wait for local Vite. */ }
    if (attempt === 59) throw new Error("Application layout server did not become ready.");
    await delay(250);
  }
  browser = await chromium.launch({ headless: true });
  const errors = [];
  for (const width of [320, 390, 430, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/apply?interest=twain`);
    await page.locator("h1").waitFor();
    assert.equal(await page.locator(".application-reserve-hero").count(), 0, "A reserved puppy must not receive an available-puppy application hero.");
    await page.route("**/src/data/puppies.json*", (route) => route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: `export default ${JSON.stringify([...puppies, fixture])};`
    }));
    for (const query of ["interest=layout-fixture", `litter=${puppy.litterSlug}`, "breed=goldendoodle-puppies"]) {
      await page.goto(`${base}/apply?${query}`);
      await page.locator(".application-reserve-hero").waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `Overflow at ${width}px, ${query}`);
      const links = await page.locator(".application-interest-links a").evaluateAll((items) => items.map((item) => ({ height: item.getBoundingClientRect().height, width: item.clientWidth, scrollWidth: item.scrollWidth })));
      assert(links.every((link) => link.height >= 44 && link.scrollWidth <= link.width + 1), `Link target or clipping at ${width}px, ${query}`);
      if (query === "interest=layout-fixture") {
        assert.equal(await page.locator("h1").innerText(), "Apply for Layout Fixture");
        assert.equal(await page.locator(".application-puppy-price strong").innerText(), fixture.price);
        const hero = await page.locator(".application-reserve-hero").boundingBox();
        const actions = await page.locator(".application-interest-links").boundingBox();
        if (width <= 430) assert(actions.width > hero.width * 0.8, "Mobile actions must use full card width.");
        if (width === 390) assert(hero.height < 380, "Mobile puppy header should remain compact.");
        if (process.env.APPLICATION_LAYOUT_SCREENSHOT_DIR) {
          fs.mkdirSync(process.env.APPLICATION_LAYOUT_SCREENSHOT_DIR, { recursive: true });
          await page.screenshot({ path: path.join(process.env.APPLICATION_LAYOUT_SCREENSHOT_DIR, `application-${width}.png`) });
        }
      }
    }
    await page.goto(`${base}/apply?interest=layout-fixture`);
    await page.getByRole("textbox", { name: "Full name", exact: true }).fill("Layout QA");
    const link = page.getByRole("link", { name: "View litter details Beatrix + Enzo (opens in a new tab)", exact: true });
    assert.equal(await link.getAttribute("href"), `/litters/${puppy.litterSlug}`);
    const popupPromise = page.waitForEvent("popup");
    await link.click();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");
    assert.equal(new URL(popup.url()).pathname, `/litters/${puppy.litterSlug}`);
    await popup.close();
    assert.equal(await page.getByRole("textbox", { name: "Full name", exact: true }).inputValue(), "Layout QA");
    await page.getByRole("link", { name: "How our application process works", exact: true }).click();
    await page.waitForURL("**/process/how-it-works");
    await page.goBack();
    await page.locator("#application-reserve-title").waitFor();
    assert.equal(await page.locator("#application-reserve-title").innerText(), "Apply for Layout Fixture");
    await page.close();
  }
  assert.deepEqual(errors, [], "Application routes should not throw browser errors.");
  console.log("Application layout passed: 320–1440px puppy, litter and breed contexts; readable full-width mobile links; unchanged price; separate litter tab preserves form; process navigation and Back.");
} finally {
  await browser?.close();
  if (server && server.exitCode === null) {
    const exited = new Promise((resolve) => server.once("exit", resolve));
    server.kill("SIGTERM");
    await Promise.race([exited, delay(3000)]);
    if (server.exitCode === null) server.kill("SIGKILL");
  }
}
