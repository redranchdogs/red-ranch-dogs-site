import assert from "node:assert/strict";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { URL } from "node:url";
import { chromium } from "playwright";
import { resolveImageUrl } from "../src/imageVersions.js";
import { litterPuppyStatus } from "../src/litterPuppyStatus.js";

const statusCases = [
  ["Available", "Available", "available"], [" available ", "Available", "available"],
  ["Reserved", "Reserved", "reserved"], ["Matched", "Reserved", "reserved"],
  ["Pending", "Pending", "neutral"], ["Waitlist matching", "Waitlist matching", "neutral"],
  ["Availability to be confirmed", "Availability to be confirmed", "neutral"],
  ["", "Availability to be confirmed", "neutral"], [null, "Availability to be confirmed", "neutral"]
];
for (const [status, label, tone] of statusCases) assert.deepEqual(litterPuppyStatus(status), { label, tone });
const files = ["src/data/puppies.json", "src/data/litters.json"];
const before = files.map((file) => fs.readFileSync(file));
const isPublic = (item) => !["private", "hidden"].includes(String(item.visibility || "public").toLowerCase());
const puppies = JSON.parse(before[0]).filter(isPublic);
const litters = JSON.parse(before[1]).filter(isPublic);
const current = litters.filter((litter) => litter.status === "Current Litter");
const port = Number(process.env.LITTER_PUPPY_PORT || 5340);
const base = process.env.LITTER_PUPPY_BASE_URL || `http://127.0.0.1:${port}`;
const server = process.env.LITTER_PUPPY_BASE_URL ? null : spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "ignore" });
const screenshotDir = process.env.LITTER_PUPPY_SCREENSHOT_DIR;
if (screenshotDir) fs.mkdirSync(screenshotDir, { recursive: true });
const errors = [];
let browser;
let checked = 0;
const pageFor = async (width) => {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (/Warning:|React.*error/i.test(message.text())) errors.push(message.text()); });
  return page;
};
const cardFor = (page, puppy) => page.locator(".litter-puppy-profile").filter({ has: page.getByRole("heading", { name: puppy.name, exact: true }) });
async function checkCard(page, puppy, width, screenshot = false) {
  const card = cardFor(page, puppy);
  const { label, tone } = litterPuppyStatus(puppy.status);
  assert.equal(await card.count(), 1, `${puppy.slug}: one card`);
  const banner = card.locator(".litter-puppy-status");
  assert.equal((await banner.innerText()).toLowerCase(), label.toLowerCase());
  assert((await banner.getAttribute("class")).includes(`is-${tone}`));
  assert.equal(await banner.locator("svg, img, span").count(), 0, "No icons or extra status adornments");
  assert.equal(await banner.evaluate((el) => window.getComputedStyle(el).backgroundColor),
    { available: "rgb(43, 86, 61)", reserved: "rgb(148, 31, 23)", neutral: "rgb(232, 226, 216)" }[tone], "Correct actual status color");
  const primary = card.locator(".litter-puppy-primary");
  assert((await primary.getAttribute("class")).split(" ").includes(tone === "available" ? "primary" : "secondary"));
  const ctaStyle = await primary.evaluate((el) => ({ background: window.getComputedStyle(el).backgroundColor, color: window.getComputedStyle(el).color }));
  assert.deepEqual(ctaStyle, tone === "available" ? { background: "rgb(148, 31, 23)", color: "rgb(255, 255, 255)" } : { background: "rgba(0, 0, 0, 0)", color: "rgb(111, 22, 15)" }, "Filled available action / outlined other actions");
  const photo = puppy.mainPhoto || puppy.image;
  if (photo) {
    const img = card.locator(".litter-puppy-portrait img");
    await img.scrollIntoViewIfNeeded();
    await img.evaluate((el) => el.decode());
    assert.equal(await img.getAttribute("alt"), `${puppy.name} - ${puppy.breed || "Breed to be announced"}`);
    assert.equal(new URL(await img.getAttribute("src"), base).pathname, new URL(resolveImageUrl(photo), base).pathname, "Original source image/version");
    const geometry = await img.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const figure = el.parentElement.getBoundingClientRect();
      const status = el.closest("article").querySelector(".litter-puppy-status").getBoundingClientRect();
      return { width: rect.width, height: rect.height, natural: el.naturalWidth / el.naturalHeight, fit: window.getComputedStyle(el).objectFit, figureWidth: figure.width, gap: rect.top - status.bottom };
    });
    assert.equal(geometry.fit, "contain");
    assert(Math.abs(geometry.width / geometry.height - geometry.natural) < 0.005, `${puppy.slug}: full natural image ratio, ${width}px`);
    assert(Math.abs(geometry.width - geometry.figureWidth) < 1, "Photo occupies the full card width");
    assert(Math.abs(geometry.gap) < 1, "Status is separate, directly above, never overlapping photo");
  } else assert.equal(await card.locator(".litter-puppy-photo-placeholder").count(), 1);
  const { bounds, statusBounds } = await card.evaluate((el) => ({
    bounds: el.getBoundingClientRect().toJSON(),
    statusBounds: el.querySelector(".litter-puppy-status").getBoundingClientRect().toJSON()
  }));
  assert(Math.abs(statusBounds.width - bounds.width + 2) < 2, "Full-width top bar");
  assert(Math.abs(statusBounds.y - bounds.y - 1) < 2, `${puppy.slug}: bar at top of card, delta ${statusBounds.y - bounds.y}, ${width}px`);
  if (tone !== "neutral") assert(statusBounds.height <= 38, "Known status stays slim");
  const text = await card.innerText();
  for (const value of [puppy.breed || "Breed to be announced", puppy.gender || puppy.sex || "To be announced", puppy.estimatedAdultWeight || puppy.size || "Estimate to be announced", puppy.goHomeDate || puppy.goHome || "Go-home timing to be announced", puppy.collarColor].filter(Boolean)) assert(text.includes(value), `${puppy.slug}: retains ${value}`);
  assert.equal(await card.locator(".litter-puppy-price").count(), puppy.price ? 1 : 0);
  if (puppy.price) assert((await card.locator(".litter-puppy-price").innerText()).includes(puppy.price));
  const route = puppy.slug ? `/puppies/${puppy.slug}` : puppy.litterHref;
  assert.equal(await card.locator(".litter-puppy-primary").getAttribute("href"), route);
  assert.equal((await card.locator(".litter-puppy-primary").innerText()).toLowerCase(), `view ${puppy.name}`.toLowerCase());
  const inquiry = String(puppy.status).trim().toLowerCase() === "available" && puppy.litterSlug === "beatrix-enzo-planned-2026";
  assert.equal(await card.locator(".litter-puppy-inquiry").count(), inquiry ? 1 : 0);
  if (inquiry) assert.equal(await card.locator(".litter-puppy-inquiry").getAttribute("href"), `/litters/${puppy.litterSlug}?interest=${encodeURIComponent(puppy.slug)}#beatrix-inquiry`);
  const video = [puppy.youtube_video_url, puppy.youtubeVideoUrl, puppy.videoUrl, puppy.youtube_short_url, puppy.youtubeShortUrl, puppy.youtube_playlist_url, puppy.youtubePlaylistUrl].find(Boolean);
  let safeVideo = "";
  try { const url = new URL(video); if (["youtube.com", "youtube-nocookie.com", "youtu.be"].includes(url.hostname.replace(/^www\./, ""))) safeVideo = url.href; } catch { /* Missing or invalid source URL. */ }
  assert.equal(await card.locator(".puppy-video-link").count(), safeVideo ? 1 : 0);
  if (safeVideo) {
    const link = card.locator(".puppy-video-link");
    assert.equal(await link.getAttribute("href"), safeVideo);
    assert.equal(await link.getAttribute("target"), "_blank");
    assert.equal(await link.getAttribute("rel"), "noreferrer");
  }
  assert.equal(await card.locator("h2,.litter-puppy-price,.litter-puppy-status,dd,.litter-puppy-primary").evaluateAll((els) => els.every((el) => el.scrollWidth <= el.clientWidth + 1)), true, `${puppy.slug}: no text clipped at ${width}px`);
  for (const link of await card.locator("a").all()) assert((await link.boundingBox()).height >= 44, "44px action targets");
  if (screenshot && screenshotDir && ["penn", "dottie"].includes(puppy.slug)) await card.screenshot({ path: `${screenshotDir}/${puppy.slug}-${width}.png`, style: ".premium-header, .sticky-mobile-cta { visibility: hidden !important; }" });
  checked += 1;
}
try {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(base)).ok) break; } catch { /* Wait for test server. */ }
    if (attempt === 59) throw new Error("Litter puppy test server did not become ready.");
    await delay(250);
  }
  browser = await chromium.launch({ headless: true });
  for (const width of [320, 390, 430, 768, 980, 981, 1440]) {
    const page = await pageFor(width);
    for (const litter of current) {
      await page.goto(`${base}/litters/${litter.slug}`);
      await page.locator(".litter-puppy-list").waitFor();
      await page.evaluate(() => document.fonts.ready);
      const expected = puppies.filter((puppy) => puppy.litterSlug === litter.slug);
      assert.equal(await page.locator(".litter-puppy-profile").count(), expected.length, "Same public puppy roster");
      for (const puppy of expected) await checkCard(page, puppy, width, [390, 1440].includes(width));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${litter.slug}: no page overflow ${width}px`);
      if (expected.length > 1) {
        const cards = page.locator(".litter-puppy-profile");
        // Both viewport-relative rects must come from the same frame: the
        // site's smooth scroll can move between separate boundingBox awaits.
        const layout = await cards.evaluateAll((elements) => ({
          columns: window.getComputedStyle(elements[0].parentElement).gridTemplateColumns,
          rects: elements.slice(0, 2).map((element) => element.getBoundingClientRect().toJSON())
        }));
        const [a, b] = layout.rects;
        assert(width <= 760 ? b.y > a.y : Math.abs(a.y - b.y) < 1,
          `One column on phones, two on larger screens: ${litter.slug} at ${width}px, ${JSON.stringify(layout)}`);
      }
    }
    await page.close();
  }
  // Local-only edge cases: no fixtures or interceptions against production.
  if (server) {
    const fixture = JSON.parse(before[0]);
    const targets = fixture.filter((puppy) => puppy.litterSlug === "beatrix-enzo-planned-2026");
    for (let i = 0; i < targets.length; i += 1) targets[i].status = statusCases[i % statusCases.length][0];
    Object.assign(targets[0], { name: "A very long puppy name for responsive layout testing", collarColor: "A long descriptive collar color", goHomeDate: "Timing to be confirmed with the family after the next update" });
    Object.assign(targets[4], { mainPhoto: "", image: "", price: "", gender: "", sex: "", estimatedAdultWeight: "", size: "" });
    targets[5].youtube_video_url = "https://example.com/not-an-approved-puppy-video";
    for (const width of [320, 390, 768, 1440]) {
      const page = await pageFor(width);
      await page.route(`${base}/src/data/puppies.json*`, (route) => route.fulfill({ contentType: "application/javascript", body: `export default ${JSON.stringify(fixture)};` }));
      await page.goto(`${base}/litters/beatrix-enzo-planned-2026`);
      await page.locator(".litter-puppy-profile").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      for (const puppy of targets.filter(isPublic)) await checkCard(page, puppy, width);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, "Edge cases fit");
      await cardFor(page, targets[0]).locator(".litter-puppy-inquiry").click();
      await page.waitForURL(/#beatrix-inquiry$/);
      assert(new URL(page.url()).searchParams.get("interest") === targets[0].slug);
      await page.close();
    }
  }
  const page = await pageFor(390);
  await page.goto(`${base}/litters/lulu-bram-fall-2026`);
  const penn = cardFor(page, puppies.find((puppy) => puppy.slug === "penn"));
  await penn.locator(".litter-puppy-primary").focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  assert.equal(await penn.locator(".litter-puppy-primary").evaluate((el) => el.matches(":focus-visible") && window.getComputedStyle(el).outlineStyle === "solid"), true, "Keyboard focus has a visible outline");
  await penn.locator(".litter-puppy-primary").click();
  await page.waitForURL(/\/puppies\/penn$/);
  await page.locator(".puppy-profile-card").waitFor();
  await page.goBack();
  await penn.waitFor();
  await page.goForward();
  await page.waitForURL(/\/puppies\/penn$/);
  for (const litter of litters.filter((item) => item.status !== "Current Litter")) {
    await page.goto(`${base}/litters/${litter.slug}`);
    await page.locator("h1").waitFor();
    assert.equal(await page.locator(".litter-puppy-profile").count(), 0, "No cards added to planned/archive litters");
  }
  assert.deepEqual(errors, [], "No runtime or React warnings");
  files.forEach((file, index) => assert(fs.readFileSync(file).equals(before[index]), "Source data unchanged"));
  console.log(`Litter puppy cards passed: ${checked} card/viewport checks, ${current.length} current litters at 320–1440px; ${statusCases.length} status cases; full-ratio original photos, separate slim solid bars, exact source facts and routes, video validation, Beatrix inquiry, empty/missing/long-content states, Back/Forward, no form submissions.`);
} finally {
  await browser?.close();
  if (server && server.exitCode === null) {
    const exited = new Promise((resolve) => server.once("exit", resolve));
    server.kill("SIGTERM");
    await Promise.race([exited, delay(3000)]);
    if (server.exitCode === null) server.kill("SIGKILL");
  }
}
