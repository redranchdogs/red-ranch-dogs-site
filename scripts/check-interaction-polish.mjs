import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";

const origin = process.env.INTERACTION_TEST_ORIGIN || "http://127.0.0.1:5187";
assert(new globalThis.URL(origin).hostname === "127.0.0.1", "This test may only use a local mocked site");
const browser = await chromium.launch({ headless: true });
const output = "output/interaction-polish";
await fs.mkdir(output, { recursive: true });
try {
  for (const { width, height, reducedMotion } of [
    { width: 390, height: 844, reducedMotion: "no-preference" },
    { width: 390, height: 844, reducedMotion: "reduce" },
    { width: 1440, height: 900, reducedMotion: "no-preference" }
  ]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion });
    const page = await context.newPage();
    const submissions = [];
    let responseMode = "failure";
    await page.route("**/*", async (route) => {
      const request = route.request();
      if (!request.url().startsWith(origin + "/")) return route.abort();
      if (new globalThis.URL(request.url()).pathname === "/api/forms") {
        submissions.push(request.postDataJSON());
        await new Promise((resolve) => globalThis.setTimeout(resolve, 200));
        return route.fulfill({ status: responseMode === "failure" ? 503 : 200, contentType: "application/json", body: JSON.stringify({ message: responseMode === "failure" ? "Controlled local delivery failure." : "Thank you. We received your submission." }) });
      }
      assert.equal(request.method(), "GET", "All other writes are blocked");
      return route.continue();
    });
    await page.goto(origin + "/process/faq");
    const detail = page.locator(".faq-item").nth(1);
    const summary = detail.locator("summary");
    await summary.scrollIntoViewIfNeeded();
    await summary.focus();
    const top = await summary.evaluate((element) => element.getBoundingClientRect().top);
    await page.keyboard.press("Enter");
    assert.equal(await detail.getAttribute("open"), "");
    assert.equal(await summary.evaluate((element) => element === document.activeElement), true);
    await page.keyboard.press("Space");
    assert.equal(await detail.getAttribute("open"), null);
    assert.equal(await detail.locator("p").isVisible(), false);
    // Reverse mid-animation without waiting for Playwright's stability check.
    for (let index = 0; index < 5; index += 1) await summary.dispatchEvent("click");
    await page.waitForTimeout(220);
    assert.equal(await detail.getAttribute("open"), "");
    assert(Math.abs((await summary.evaluate((element) => element.getBoundingClientRect().top)) - top) < 3, "FAQ trigger should not jump on toggle");
    assert.equal(await detail.evaluate((element) => element.style.height), "");
    if (reducedMotion === "reduce") assert.equal(await detail.evaluate((element) => element.getAnimations().length), 0);
    await page.screenshot({ path: `${output}/faq-${width}-${reducedMotion}.png` });
    await summary.dispatchEvent("click");
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(await detail.locator("p").isVisible(), false);
    await page.waitForTimeout(30);
    assert.equal(await detail.evaluate((element) => element.getAnimations().length), 0);
    await page.emulateMedia({ reducedMotion });

    await page.goto(origin + "/puppies/cavapoo-puppies");
    const apply = page.locator('main a[href="/apply?breed=cavapoo-puppies"]');
    // Existing route restoration retries run for 900ms; begin the reading journey after hydration settles.
    await page.waitForTimeout(1000);
    await apply.scrollIntoViewIfNeeded();
    const breedScroll = await page.evaluate(() => window.scrollY);
    assert(breedScroll > 1000);
    await apply.click();
    await page.locator(".application-reserve-hero").waitFor();
    assert.equal(await page.locator("h1").innerText(), "Apply for a Cavapoo");
    const hero = await page.locator(".application-reserve-hero").boundingBox();
    const heroCopy = await page.locator(".application-reserve-hero > div").boundingBox();
    assert(heroCopy.width > hero.width * 0.8, "No-photo context should use the full hero width");
    assert.equal(await page.locator('input[name="preferredBreed"][value="Cavapoo"]').isChecked(), true);
    assert.equal(await page.locator('input[name="specificInterest"]').inputValue(), "");
    assert.equal(await page.locator('input[name="specificInterest"][type="checkbox"]').count(), 0);
    await page.waitForFunction(() => window.scrollY < 5);
    await page.screenshot({ path: `${output}/breed-application-${width}-${reducedMotion}.png` });
    await page.goBack();
    await apply.waitFor();
    await page.waitForFunction((saved) => Math.abs(window.scrollY - saved) < 5, breedScroll, { timeout: 5000 });
    assert(Math.abs((await page.evaluate(() => window.scrollY)) - breedScroll) < 5, "Back should restore the breed page reading position");
    await page.goto(origin + "/apply?breed=unknown");
    assert.equal(await page.locator('input[name="preferredBreed"]:checked').count(), 0);
    assert.equal(await page.locator(".application-reserve-hero").count(), 0);

    const form = page.locator('form[data-form-type="application"]');
    await form.locator('[name="name"]').fill("Interaction Test");
    await form.locator('[name="email"]').fill("interaction@example.test");
    await form.locator('[name="phone"]').fill("5550109090");
    await form.locator('[name="processAgreement"]').check();
    await form.locator('[name="signature"]').fill("Interaction Test");
    await form.locator('button[type="submit"]').click();
    const breed = form.locator('[name="preferredBreed"]').first();
    await page.waitForFunction(() => document.activeElement?.name === "preferredBreed");
    assert.equal(await breed.getAttribute("aria-invalid"), "true");
    assert((await breed.getAttribute("aria-describedby"))?.length);
    assert.equal(submissions.length, 0);
    await breed.check();
    assert.equal(await breed.getAttribute("aria-invalid"), null);
    await form.locator('button[type="submit"]').click();
    await form.dispatchEvent("submit");
    await form.dispatchEvent("submit");
    await form.locator(".form-status.error").waitFor();
    assert.equal(submissions.length, 1, "Pending submissions must be guarded synchronously");
    assert.equal(await form.locator('[name="name"]').inputValue(), "Interaction Test");
    assert.equal(await form.locator(".form-status.error").evaluate((element) => element === document.activeElement), true);
    await page.screenshot({ path: `${output}/form-retry-${width}-${reducedMotion}.png` });
    responseMode = "success";
    await form.locator('button[type="submit"]').click();
    await form.locator(".form-success-panel").waitFor();
    assert.equal(submissions.length, 2);
    assert.equal(submissions[0].submissionId, submissions[1].submissionId, "Retry retains the idempotency key");
    assert.equal(await form.locator(".form-status.success").evaluate((element) => element === document.activeElement), true);
    assert((await form.locator(".form-success-panel").innerText()).includes("does not reserve a puppy or create a waitlist position"));
    await form.dispatchEvent("submit");
    assert.equal(submissions.length, 2);
    await page.screenshot({ path: `${output}/form-confirmation-${width}-${reducedMotion}.png` });

    await page.goto(origin + "/litters/georgia-waylon-may-2026");
    await page.locator(".gallery-photo-button").first().click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    const stage = dialog.locator(".photo-lightbox-stage");
    await page.waitForTimeout(180);
    const before = await stage.boundingBox();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(180);
    const after = await stage.boundingBox();
    assert.equal(before.y, after.y);
    assert.equal(before.height, after.height);
    assert.equal(await dialog.count(), 1);
    await page.screenshot({ path: `${output}/gallery-${width}-${reducedMotion}.png` });
    await page.keyboard.press("Escape");
    assert.equal(await dialog.count(), 0);
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    await context.close();
    console.log(`Interaction checks passed: ${width}px, ${reducedMotion}; all submissions mocked and external requests blocked.`);
  }
} finally {
  await browser.close();
}
