import assert from "node:assert/strict";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { URL } from "node:url";
import { chromium } from "playwright";
import { resolveImageUrl } from "../src/imageVersions.js";

const sourceFiles = ["src/data/puppies.json", "src/data/litters.json"];
const before = sourceFiles.map((file) => fs.readFileSync(file));
const allPuppies = JSON.parse(before[0]);
const isPublic = (record) => !["private", "hidden"].includes(String(record.visibility || "public").trim().toLowerCase());
const litters = JSON.parse(before[1]).filter(isPublic);
const expectedPuppies = (records) => records.filter((puppy) => isPublic(puppy) && String(puppy.status).trim().toLowerCase() === "available" && litters.find((litter) => litter.slug === puppy.litterSlug)?.featuredAvailable === true);
const puppies = expectedPuppies(allPuppies);
const port = Number(process.env.AVAILABLE_PUPPY_PORT || 5344);
const base = process.env.AVAILABLE_PUPPY_BASE_URL || `http://127.0.0.1:${port}`;
const server = process.env.AVAILABLE_PUPPY_BASE_URL ? null : spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "ignore" });
const screenshotDir = process.env.AVAILABLE_PUPPY_SCREENSHOT_DIR;
if (screenshotDir) fs.mkdirSync(screenshotDir, { recursive: true });
const errors = [];
let browser;
let checked = 0;
const cardFor = (page, puppy) => page.locator(".available-puppy-card").filter({ has: page.getByRole("heading", { name: puppy.name, exact: true }) });
async function newPage(width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (/Warning:|React.*error/i.test(message.text())) errors.push(message.text()); });
  return page;
}
async function checkCard(page, puppy, width) {
  const card = cardFor(page, puppy);
  assert.equal(await card.count(), 1);
  const status = card.locator(".litter-puppy-status");
  assert.equal((await status.innerText()).toLowerCase(), "available");
  assert.equal(await status.evaluate((el) => window.getComputedStyle(el).backgroundColor), "rgb(43, 86, 61)");
  assert.equal(await card.locator("figcaption,.status-badge,.puppy-reserved-ribbon").count(), 0, "No photo/name overlays or duplicate status");
  const image = puppy.mainPhoto || puppy.image;
  if (image) {
    const img = card.locator(".litter-puppy-portrait img");
    await img.scrollIntoViewIfNeeded();
    await img.evaluate((el) => el.decode());
    assert.equal(new URL(await img.getAttribute("src"), base).pathname, new URL(resolveImageUrl(image), base).pathname);
    const frame = await img.evaluate((el) => {
      const box = el.getBoundingClientRect(), banner = el.closest("article").querySelector(".litter-puppy-status").getBoundingClientRect();
      return { ratio: box.width / box.height, original: el.naturalWidth / el.naturalHeight, gap: box.top - banner.bottom, bannerHeight: banner.height, bannerWidth: banner.width, imageWidth: box.width, fit: window.getComputedStyle(el).objectFit };
    });
    assert(Math.abs(frame.ratio - frame.original) < 0.005, "Full natural photo ratio");
    assert(Math.abs(frame.gap) < 1 && Math.abs(frame.bannerWidth - frame.imageWidth) < 1 && frame.bannerHeight <= 38, "Slim separate full-width status block");
    assert.equal(frame.fit, "contain");
  } else assert.equal(await card.locator(".litter-puppy-photo-placeholder").count(), 1);
  const text = await card.innerText();
  for (const fact of [puppy.breed || "Breed to be announced", puppy.gender || puppy.sex || "To be announced", puppy.estimatedAdultWeight || puppy.size || "Estimate to be announced", puppy.litter || puppy.litterName || "Litter to be announced", puppy.goHomeDate || puppy.goHome || "Go-home timing to be announced", puppy.collarColor, puppy.price, puppy.availabilityNote].filter(Boolean)) assert(text.includes(fact), `${puppy.slug}: preserve ${fact}`);
  const note = puppy.personalityNote || puppy.description || "";
  if (note && !/personality notes (will|are)/i.test(note)) assert(text.includes(note));
  const primary = card.locator(".litter-puppy-primary");
  assert.equal((await primary.innerText()).toLowerCase(), `reserve ${puppy.name}`.toLowerCase());
  assert.equal(await primary.getAttribute("href"), `/apply?interest=${encodeURIComponent(puppy.slug)}`);
  assert.equal(await primary.evaluate((el) => window.getComputedStyle(el).backgroundColor), "rgb(148, 31, 23)");
  assert.equal(await card.getByRole("link", { name: "View Litter", exact: true }).getAttribute("href"), puppy.litterSlug ? `/litters/${puppy.litterSlug}` : puppy.litterHref);
  const video = [puppy.youtube_video_url, puppy.youtubeVideoUrl, puppy.videoUrl, puppy.youtube_short_url, puppy.youtubeShortUrl, puppy.youtube_playlist_url, puppy.youtubePlaylistUrl].find(Boolean);
  let safeVideo = "";
  try { const url = new URL(video); if (["youtube.com", "youtube-nocookie.com", "youtu.be"].includes(url.hostname.replace(/^www\./, ""))) safeVideo = url.href; } catch { /* No valid source video. */ }
  assert.equal(await card.locator(".puppy-video-link").count(), safeVideo ? 1 : 0);
  if (safeVideo) assert.equal(await card.locator(".puppy-video-link").getAttribute("href"), safeVideo);
  assert.equal(await card.locator("h2,.litter-puppy-price,dd,.litter-puppy-primary").evaluateAll((els) => els.every((el) => el.scrollWidth <= el.clientWidth + 1)), true, `No clipped text at ${width}px`);
  for (const link of await card.locator("a").all()) assert((await link.boundingBox()).height >= 44, "Accessible action targets");
  if (screenshotDir && puppy.slug === "penn" && [390, 1440].includes(width)) await card.screenshot({ path: `${screenshotDir}/penn-${width}.png`, style: ".premium-header,.sticky-mobile-cta,.skip-link{visibility:hidden!important}" });
  checked += 1;
}
try {
  for (let i = 0; i < 60; i += 1) {
    try { if ((await fetch(base)).ok) break; } catch { /* Waiting for local server. */ }
    if (i === 59) throw new Error("Available puppy test server not ready");
    await delay(250);
  }
  browser = await chromium.launch({ headless: true });
  for (const width of [320, 390, 430, 768, 980, 981, 1440]) {
    const page = await newPage(width);
    await page.goto(`${base}/puppies/available`);
    await page.locator(".available-puppy-browser").waitFor();
    await page.evaluate(() => document.fonts.ready);
    for (const puppy of puppies) await checkCard(page, puppy, width);
    assert.equal(await page.locator(".available-puppy-card").count(), puppies.length, "No reserved, unknown or private puppies listed");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    if (puppies.length > 1) {
      const pair = await page.locator(".available-puppy-card").evaluateAll((els) => els.slice(0, 2).map((el) => el.getBoundingClientRect().toJSON()));
      assert(width <= 760 ? pair[1].y > pair[0].y : Math.abs(pair[0].y - pair[1].y) < 1, "Responsive shared card grid");
    }
    const gold = page.getByRole("tab", { name: "Goldendoodles", exact: true });
    await page.getByRole("tab", { name: "Cavapoos", exact: true }).click();
    assert.equal(await page.locator(".available-puppy-card").count(), 0);
    await gold.click(); await gold.click();
    assert.equal(await page.locator(".available-puppy-card").count(), puppies.length);
    await page.goBack();
    assert.equal(await page.getByRole("tab", { name: "Cavapoos", exact: true }).getAttribute("aria-selected"), "true", "Repeated selection creates no extra history entry");
    await page.goForward();
    await gold.focus(); await page.keyboard.press("ArrowRight");
    assert.equal(await page.getByRole("tab", { name: "Bernedoodles", exact: true }).getAttribute("aria-selected"), "true");
    await page.close();
  }
  if (server) {
    for (const scenario of ["long-and-missing", "none-available"]) {
      const fixture = JSON.parse(before[0]);
      const penn = fixture.find((p) => p.slug === "penn");
      if (scenario === "long-and-missing") Object.assign(penn, { name: "Penn with a very long puppy name for responsive layout", mainPhoto: "", image: "", collarColor: "A long descriptive collar color", goHomeDate: "Timing to be confirmed with the family after the next update", youtube_video_url: "https://example.com/not-approved" });
      else fixture.filter((p) => String(p.status).trim().toLowerCase() === "available").forEach((p) => { p.status = "Availability to be confirmed"; });
      for (const width of [320, 768]) {
        const page = await newPage(width);
        await page.route(`${base}/src/data/puppies.json*`, (route) => route.fulfill({ contentType: "application/javascript", body: `export default ${JSON.stringify(fixture)};` }));
        await page.goto(`${base}/puppies/available`);
        await page.locator(".available-puppy-browser").waitFor();
        if (scenario === "none-available") {
          assert.equal(await page.locator(".available-puppy-card").count(), 0);
          assert.equal(await page.locator(".available-empty-hub").count(), 1);
        } else for (const puppy of expectedPuppies(fixture)) await checkCard(page, puppy, width);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
        await page.close();
      }
    }
  }
  const page = await newPage(390);
  await page.goto(`${base}/puppies/available`);
  const penn = puppies.find((p) => p.slug === "penn");
  await cardFor(page, penn).locator(".litter-puppy-primary").click();
  await page.waitForURL(/\/apply\?interest=penn$/);
  await page.goBack();
  await cardFor(page, penn).getByRole("link", { name: "View Litter", exact: true }).click();
  await page.waitForURL(/\/litters\/lulu-bram-fall-2026$/);
  await page.goBack();
  await cardFor(page, penn).waitFor();
  assert.deepEqual(errors, []);
  sourceFiles.forEach((file, index) => assert(fs.readFileSync(file).equals(before[index]), "No source data changes"));
  console.log(`Available puppy cards passed: ${checked} card/viewport checks, 320–1440px, full original photos, one green status, exact facts/notes, Reserve/View Litter/video actions, repeated breed tabs and Back/Forward, keyboard navigation, safe empty/long/missing states. No form submissions.`);
} finally {
  await browser?.close();
  if (server && server.exitCode === null) {
    const exited = new Promise((resolve) => server.once("exit", resolve));
    server.kill("SIGTERM"); await Promise.race([exited, delay(3000)]);
    if (server.exitCode === null) server.kill("SIGKILL");
  }
}
