import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";

// Test the already-built preview at the established origin; never start a new port.
const origin = process.env.GALLERY_TEST_ORIGIN || "http://127.0.0.1:5187";
const browser = await chromium.launch({ headless: true });
const archive = "/litters/winnie-wyatt-spring-2026";
const firstPhoto = (page) => page.locator(".gallery-photo-button").first();

async function fixture(mode) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const held = [];
  let requests = 0;
  let behavior = mode;
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (!url.startsWith(origin)) return route.abort();
    if (url.includes("/assets/PhotoLightbox") && /\.js(?:\?|$)/.test(url)) {
      requests += 1;
      if (behavior === "hold") { held.push(route); return; }
      if (behavior === "block") return route.abort();
      if (behavior === "render-error") return route.fulfill({ contentType: "text/javascript", body: 'export default function Viewer(){throw new Error("Synthetic viewer render failure")}' });
    }
    if (route.request().method() !== "GET") throw new Error("Unexpected write request");
    return route.continue();
  });
  return { page, context, requests: () => requests, release: (index = 0) => held[index].continue(), mode: (value) => { behavior = value; } };
}
const intact = async (page) => {
  assert(await page.getByRole("heading", { name: "Winnie + Wyatt", exact: true }).isVisible());
  assert((await page.locator("#root").innerHTML()).length > 1000, "React root must remain intact");
};
const closed = async (page) => {
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert.equal(await page.locator(".gallery-load-state").count(), 0);
  assert.equal(await page.evaluate(() => document.body.style.overflow), "");
  await page.waitForFunction(() => document.activeElement.className === "gallery-photo-button", null, { timeout: 2000 });
  assert.equal(await page.evaluate(() => document.activeElement.className), "gallery-photo-button");
};

try {
  const failed = await fixture("block");
  await failed.page.goto(origin + archive);
  await firstPhoto(failed.page).click();
  await failed.page.getByRole("button", { name: "Retry gallery", exact: true }).waitFor();
  await intact(failed.page);
  await fs.mkdir("output/gallery-interruptions", { recursive: true });
  await failed.page.screenshot({ path: "output/gallery-interruptions/recoverable-error.png", fullPage: false });
  await failed.page.getByRole("button", { name: "Retry gallery", exact: true }).click();
  await failed.page.getByRole("alert").waitFor();
  await intact(failed.page);
  failed.mode("normal");
  await failed.page.getByRole("button", { name: "Retry gallery", exact: true }).click();
  await failed.page.getByRole("dialog").waitFor();
  assert.equal(failed.requests(), 3, "Retry must download the failed chunk again");
  await failed.page.keyboard.press("Escape");
  await failed.page.getByRole("dialog").waitFor({ state: "detached" });
  await closed(failed.page);
  await failed.context.close();

  for (const cancel of ["escape", "button"]) {
    const pending = await fixture("hold");
    await pending.page.goto(origin + archive);
    await firstPhoto(pending.page).click();
    await pending.page.getByRole("button", { name: "Cancel gallery", exact: true }).waitFor();
    if (cancel === "escape") await pending.page.keyboard.press("Escape");
    else await pending.page.getByRole("button", { name: "Cancel gallery", exact: true }).click();
    await pending.page.locator(".gallery-load-state").waitFor({ state: "detached" });
    const response = pending.page.waitForResponse((value) => value.url().includes("/assets/PhotoLightbox"));
    await pending.release();
    await (await response).finished();
    await pending.page.waitForTimeout(150);
    await intact(pending.page);
    await closed(pending.page);
    await firstPhoto(pending.page).click();
    await pending.page.getByRole("dialog").waitFor();
    await pending.context.close();
  }

  const superseded = await fixture("hold");
  await superseded.page.goto(origin + archive);
  await firstPhoto(superseded.page).click();
  await superseded.page.getByRole("button", { name: "Cancel gallery", exact: true }).waitFor();
  await superseded.page.keyboard.press("Escape");
  await superseded.page.locator(".gallery-load-state").waitFor({ state: "detached" });
  await superseded.page.locator(".gallery-photo-button").nth(1).click();
  await superseded.page.getByRole("button", { name: "Cancel gallery", exact: true }).waitFor();
  const oldResponse = superseded.page.waitForResponse((value) => value.url().includes("galleryRequest=1"));
  await superseded.release(0);
  await (await oldResponse).finished();
  await superseded.page.waitForTimeout(150);
  assert.equal(await superseded.page.getByRole("dialog").count(), 0, "Old intent must not mount a viewer while the new request is pending");
  assert.equal(await superseded.page.evaluate(() => document.body.style.overflow), "");
  await superseded.release(1);
  await superseded.page.getByRole("dialog").waitFor();
  assert.equal(await superseded.page.locator(".photo-lightbox-count").innerText(), "2 / 2", "Only the newer photo intent may mount");
  await superseded.context.close();

  const ownershipReceipts = [];
  for (const releaseOrder of [[0, 1], [1, 0]]) {
    const multiple = await fixture("hold");
    await multiple.page.goto(origin + "/puppies/ranger");
    const galleries = multiple.page.locator(".image-gallery");
    assert.equal(await galleries.count(), 2, "Regression must exercise separate Week 5 and Week 4 galleries");
    await galleries.nth(0).locator(".gallery-photo-button").first().click();
    await multiple.page.getByRole("button", { name: "Cancel gallery", exact: true }).waitFor();
    await galleries.nth(1).locator(".gallery-photo-button").first().click();
    await multiple.page.waitForFunction(() => document.querySelectorAll(".gallery-load-state").length === 1);
    for (let i = 0; multiple.requests() < 2 && i < 40; i += 1) await multiple.page.waitForTimeout(25);
    assert.equal(multiple.requests(), 2);
    const counts = [];
    for (const index of releaseOrder) {
      const downloaded = multiple.page.waitForResponse((value) => value.url().includes(`galleryRequest=${index + 1}`));
      await multiple.release(index);
      await (await downloaded).finished();
      await multiple.page.waitForTimeout(150);
      const count = await multiple.page.getByRole("dialog").count();
      assert.equal(count, index === 1 || counts.includes(1) ? 1 : 0, "Only newest weekly gallery may mount");
      counts.push(count);
    }
    assert((await multiple.page.getByRole("dialog").getAttribute("aria-label")).includes("Week 4"));
    await multiple.page.keyboard.press("Escape");
    await multiple.page.getByRole("dialog").waitFor({ state: "detached" });
    await multiple.page.waitForTimeout(250);
    await closed(multiple.page);
    assert(await galleries.nth(1).locator(".gallery-photo-button").first().evaluate((element) => element === document.activeElement), "Focus must return to newest gallery only");
    ownershipReceipts.push({ releaseOrder, dialogsAfterResponses: counts, dialogsAfterEscape: 0, overflowAfterEscape: await multiple.page.evaluate(() => document.body.style.overflow), activeGallery: "Week 4" });
    await multiple.context.close();
  }
  await fs.writeFile("output/gallery-interruptions/ownership-results.json", JSON.stringify(ownershipReceipts, null, 2));

  const crash = await fixture("render-error");
  await crash.page.goto(origin + archive);
  await firstPhoto(crash.page).click();
  await crash.page.getByRole("button", { name: "Retry gallery", exact: true }).waitFor();
  await intact(crash.page);
  await crash.page.keyboard.press("Escape");
  await crash.page.locator(".gallery-load-state").waitFor({ state: "detached" });
  await closed(crash.page);
  await crash.context.close();

  const shared = await fixture("hold");
  await shared.page.goto(origin + "/parents/winnie");
  await firstPhoto(shared.page).click();
  await shared.page.getByRole("button", { name: "Cancel gallery", exact: true }).waitFor();
  await shared.page.keyboard.press("Escape");
  const done = shared.page.waitForResponse((value) => value.url().includes("/assets/PhotoLightbox"));
  await shared.release();
  await (await done).finished();
  await shared.page.waitForTimeout(150);
  await closed(shared.page);
  await firstPhoto(shared.page).click();
  await shared.page.getByRole("dialog").waitFor();
  await shared.page.keyboard.press("Escape");
  await shared.page.getByRole("dialog").waitFor({ state: "detached" });

  for (const slug of ["winnie-wyatt-spring-2026", "georgia-waylon-may-2026", "reece-wyatt-summer-2026"]) {
    await shared.page.goto(origin + "/litters/" + slug);
    assert.equal((await shared.page.locator(".litter-detail-status").innerText()).toLowerCase(), "previous litter");
    const facts = await shared.page.locator(".litter-primary-facts").innerText();
    assert(!/price|go-home/i.test(facts), "Archive facts must not offer old price or projected go-home");
    const main = await shared.page.locator("main").innerText();
    assert(!/currently reserved|ready to go home|as the puppies grow|will appear here/i.test(main));
    await shared.page.locator(".litter-about-disclosure summary").click();
    await shared.page.getByText("Historical pairing notes", { exact: true }).waitFor();
    if (!slug.startsWith("winnie")) {
      assert.equal(await shared.page.getByRole("link", { name: "View Litter History", exact: true }).getAttribute("href"), "/" + slug);
      await shared.page.getByRole("link", { name: "View Litter History", exact: true }).click();
      await shared.page.locator(".previous-litter-detail-shell").waitFor();
    }
  }
  await shared.context.close();

  console.log("Gallery interruption PASS: blocked chunk retains site; repeated Retry downloads and opens; paused load canceled by Escape/button never reopens or locks scroll; superseded requests cannot mount; both gallery callers reopen; render error boundary retains site and dismisses; all three archive routes and history links verified; two distinct weekly galleries retain one owner and restore scroll in both response orders. External requests blocked, no writes; origin 5187 reused.");
} finally {
  await browser.close();
}
