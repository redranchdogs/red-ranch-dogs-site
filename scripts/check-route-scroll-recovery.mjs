import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";

const origin = process.env.ROUTE_SCROLL_TEST_ORIGIN || "http://127.0.0.1:5187";
assert.equal(new globalThis.URL(origin).hostname, "127.0.0.1", "Recovery test uses local preview only");
const output = "output/route-scroll-recovery";
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const receipts = [];
try {
  for (const reducedMotion of ["no-preference", "reduce"]) {
    for (const input of ["keyboard", "pointer", "wheel", "touch"]) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion });
      await context.tracing.start({ screenshots: true, snapshots: true });
      const page = await context.newPage();
      await page.route("**/*", (route) => {
        if (!route.request().url().startsWith(origin + "/")) return route.abort();
        assert.equal(route.request().method(), "GET", "No writes permitted");
        return route.continue();
      });
      await page.addInitScript(() => {
        window.routeScrollCalls = [];
        const scroll = window.scrollTo.bind(window);
        window.scrollTo = (...args) => { window.routeScrollCalls.push(args); return scroll(...args); };
      });
      await page.clock.install();
      await page.clock.pauseAt(new Date());
      await page.goto(origin + "/litters/beatrix-enzo-planned-2026", { waitUntil: "domcontentloaded" });
      await page.locator("h1").waitFor();
      await page.clock.runFor(50);
      // Exercise real input listeners before late 100/250/500/900ms restoration callbacks.
      if (input === "keyboard") await page.keyboard.press("PageDown");
      if (input === "pointer") { await page.mouse.move(20, 180); await page.mouse.down(); await page.mouse.up(); }
      if (input === "wheel") await page.mouse.wheel(0, 710);
      if (input === "touch") await page.locator("main").dispatchEvent("touchstart");
      // Let native input scrolling finish while application timers remain paused,
      // then establish a repeatable reading position before advancing the retry clock.
      await new Promise((resolve) => globalThis.setTimeout(resolve, 350));
      await page.evaluate(() => window.scrollTo({ top: 710, behavior: "instant" }));
      const requestedPosition = await page.evaluate(() => { window.routeScrollCalls = []; return window.scrollY; });
      await page.clock.runFor(1000);
      await page.waitForTimeout(150);
      assert.deepEqual(await page.evaluate(() => window.routeScrollCalls), [], `${input}: a canceled route callback still scrolled`);
      const readingPosition = await page.evaluate(() => window.scrollY);
      // The existing compact header can shift the native scroll anchor by 16px.
      assert(Math.abs(readingPosition - requestedPosition) <= 24, `${input}: late restoration interrupted reading`);
      // Parent navigation records that position; Back restores without CSS smooth-scroll drift.
      await page.locator(".litter-parent-portrait-link").first().dispatchEvent("click");
      await page.waitForURL(/\/parents\//);
      await page.locator(".parent-profile-hero").waitFor();
      await page.clock.runFor(50);
      assert.equal(await page.evaluate(() => window.scrollY), 0, "New route starts at top");
      await page.goBack();
      await page.waitForURL(/\/litters\/beatrix-enzo-planned-2026$/);
      await page.locator(".litter-parent-portrait-link").first().waitFor();
      await page.clock.runFor(50);
      assert.equal(await page.evaluate(() => window.history.state.scrollY), readingPosition);
      assert(Math.abs((await page.evaluate(() => window.scrollY)) - readingPosition) <= 24, "Back should restore immediately within the compact-header anchor adjustment");
      const restoreCall = await page.evaluate(() => window.routeScrollCalls.at(-1)[0]);
      assert.equal(restoreCall.top, readingPosition);
      assert.equal(restoreCall.behavior, "instant", "History restoration must not inherit CSS smooth scrolling");
      await page.clock.runFor(1000);
      assert(Math.abs((await page.evaluate(() => window.scrollY)) - readingPosition) <= 24, "Settled Back should preserve the reading location within the compact-header adjustment");
      // Reverse navigation between the first and second animation frames.
      await page.locator(".litter-parent-portrait-link").first().dispatchEvent("click");
      await page.waitForURL(/\/parents\//);
      await page.locator(".parent-profile-hero").waitFor();
      await page.clock.runFor(17);
      await page.evaluate(() => { window.routeScrollCalls = []; });
      await page.goBack();
      await page.waitForURL(/\/litters\/beatrix-enzo-planned-2026$/);
      await page.locator(".litter-parent-portrait-link").first().waitFor();
      await page.clock.runFor(70);
      const callsAfterBack = await page.evaluate(() => window.routeScrollCalls);
      const savedAfterBack = await page.evaluate(() => Number(window.history.state.scrollY));
      assert(Math.abs(savedAfterBack - readingPosition) <= 24, "Rapid navigation must preserve the reading location");
      assert(callsAfterBack.length > 0);
      assert(callsAfterBack.every(([options]) => options.top === savedAfterBack), `${input}/${reducedMotion}: stale frame after Back: ${JSON.stringify(callsAfterBack)}; expected ${savedAfterBack}`);
      if (input === "keyboard") await page.screenshot({ path: `${output}/restored-${reducedMotion}.png` });
      await context.tracing.stop({ path: `${output}/${input}-${reducedMotion}.zip` });
      receipts.push({ input, reducedMotion, readingPosition, restored: true });
      await context.close();
    }
  }
  await fs.writeFile(`${output}/result.json`, JSON.stringify(receipts, null, 2) + "\n");
  console.log("Route scroll recovery PASS: keyboard/pointer/wheel/touch cancel pending retries; exact instant history targets and stable reading position; normal/reduced motion; no writes, external requests blocked.");
} finally {
  await browser.close();
}
