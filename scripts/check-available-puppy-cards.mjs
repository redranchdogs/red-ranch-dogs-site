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
const listedLitterSlugs = new Set(litters.filter((litter) => litter.featuredAvailable === true ||
  (litter.status === "Current Litter" && litter.availableDisplayMode === "current-litters")).map((litter) => litter.slug));
const puppies = allPuppies.filter((puppy) => isPublic(puppy) && String(puppy.status).trim().toLowerCase() === "available" && listedLitterSlugs.has(puppy.litterSlug));
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
  const page = await browser.newPage({ viewport: { width, height: 900 }, serviceWorkers: "block", reducedMotion: "reduce" });
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(base).origin || url.pathname.startsWith("/_vercel/") || route.request().method() !== "GET") return route.abort();
    return route.continue();
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (/Warning:|React.*error/i.test(message.text())) errors.push(message.text()); });
  return page;
}
async function checkLitterJumps(page, selectedPuppies, sourceLitters = litters) {
  const jumps = page.getByRole("navigation", { name: "Jump to a litter" });
  const slugs = [...new Set(selectedPuppies.map((puppy) => puppy.litterSlug))];
  assert.equal(await jumps.count(), Number(slugs.length > 0), "Only show navigation for a populated breed");
  assert.equal(await jumps.getByRole("link").count(), slugs.length);
  assert.equal(await page.locator(".available-litter-group").count(), slugs.length);
  for (const slug of slugs) {
    const litter = sourceLitters.find((item) => item.slug === slug);
    const members = selectedPuppies.filter((puppy) => puppy.litterSlug === slug);
    const target = `available-${slug}`;
    const link = jumps.locator(`a[href="#${target}"]`);
    const timing = litter.goHomeDate || litter.goHome;
    assert.equal((await link.innerText()).split(/\n+/).join(" "), [litter.name, `${members.length} available`, timing && `Go home ${timing}`].filter(Boolean).join(" "));
    assert((await link.boundingBox()).height >= 44);
    const group = page.getByRole("region", { name: litter.name, exact: true });
    const heading = group.getByRole("heading", { level: 2, name: litter.name, exact: true });
    assert.equal(await heading.getAttribute("id"), target);
    const profiles = await group.locator("h3 a").evaluateAll((links) => links.map((item) => item.getAttribute("href")).sort());
    assert.deepEqual(profiles, members.map((puppy) => `/puppies/${puppy.slug}`).sort(), "Every available profile appears in its own litter exactly once");
    await link.focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction((id) => document.activeElement?.id === id && window.location.hash === `#${id}`, target);
    await page.waitForFunction((id) => {
      const heading = document.getElementById(id).getBoundingClientRect();
      return heading.top >= document.querySelector(".premium-header").getBoundingClientRect().bottom && heading.bottom <= window.innerHeight;
    }, target);
    await page.keyboard.press("Tab");
    assert(await group.locator("h3 a").first().evaluate((item) => item === document.activeElement), "Tab continues into this litter");
  }
}
async function checkCard(page, puppy, width) {
  const card = cardFor(page, puppy);
  assert.equal(await card.count(), 1);
  const status = card.locator(".litter-puppy-status");
  assert.equal((await status.innerText()).toLowerCase(), "available");
  assert.equal(await status.evaluate((el) => window.getComputedStyle(el).backgroundColor), "rgb(43, 86, 61)");
  assert.equal(await card.locator("figcaption,.status-badge,.puppy-reserved-ribbon").count(), 0, "No legacy badges or duplicate status");
  const image = puppy.mainPhoto || puppy.image;
  if (image) {
    const img = card.locator(".litter-puppy-portrait img");
    await img.scrollIntoViewIfNeeded();
    await img.evaluate(async (el) => {
      el.loading = "eager";
      if (!el.complete) await new Promise((resolve, reject) => {
        el.addEventListener("load", resolve, { once: true });
        el.addEventListener("error", () => reject(new Error(`Image failed to load: ${el.src}`)), { once: true });
      });
      await el.decode();
    });
    assert.equal(new URL(await img.getAttribute("src"), base).pathname, new URL(resolveImageUrl(image), base).pathname);
    const frame = await img.evaluate((el) => {
      const box = el.getBoundingClientRect(), banner = el.closest("article").querySelector(".litter-puppy-status").getBoundingClientRect();
      return { ratio: box.width / box.height, original: el.naturalWidth / el.naturalHeight, gap: box.top - banner.top, bannerHeight: banner.height, bannerWidth: banner.width, imageWidth: box.width, fit: window.getComputedStyle(el).objectFit };
    });
    assert(Math.abs(frame.ratio - frame.original) < 0.005, "Full natural photo ratio");
    assert(Math.abs(frame.gap) < 1 && Math.abs(frame.bannerWidth - frame.imageWidth) < 1 && frame.bannerHeight <= 38, "Slim full-width status overlay");
    assert.equal(frame.fit, "contain");
  } else assert.equal(await card.locator(".litter-puppy-photo-placeholder").count(), 1);
  const text = await card.innerText();
  for (const fact of [puppy.breed || "Breed to be announced", puppy.gender || puppy.sex || "To be announced", puppy.estimatedAdultWeight || puppy.size || "Estimate to be announced", puppy.litter || puppy.litterName || "Litter to be announced", puppy.goHomeDate || puppy.goHome || "Go-home timing to be announced", puppy.collarColor, puppy.price, puppy.availabilityNote].filter(Boolean)) assert(text.includes(fact), `${puppy.slug}: preserve ${fact}`);
  const note = puppy.personalityNote || puppy.description || "";
  if (note && !/personality notes (will|are)/i.test(note)) assert(text.includes(note));
  const primary = card.locator(".litter-puppy-primary");
  assert.equal(await card.getByRole("heading", { level: 3 }).getByRole("link", { name: puppy.name, exact: true }).getAttribute("href"), `/puppies/${puppy.slug}`);
  assert.equal((await primary.innerText()).toLowerCase(), `apply for ${puppy.name}`.toLowerCase());
  assert.equal(await primary.getAttribute("href"), `/apply?interest=${encodeURIComponent(puppy.slug)}`);
  assert.equal(await primary.evaluate((el) => window.getComputedStyle(el).backgroundColor), "rgb(148, 31, 23)");
  assert.equal(await card.getByRole("link", { name: "View Litter", exact: true }).getAttribute("href"), puppy.litterSlug ? `/litters/${puppy.litterSlug}` : puppy.litterHref);
  const video = [puppy.youtube_video_url, puppy.youtubeVideoUrl, puppy.videoUrl, puppy.youtube_short_url, puppy.youtubeShortUrl, puppy.youtube_playlist_url, puppy.youtubePlaylistUrl].find(Boolean);
  let safeVideo = "";
  try { const url = new URL(video); if (["youtube.com", "youtube-nocookie.com", "youtu.be"].includes(url.hostname.replace(/^www\./, ""))) safeVideo = url.href; } catch { /* No valid source video. */ }
  assert.equal(await card.locator(".puppy-video-link").count(), safeVideo ? 1 : 0);
  if (safeVideo) {
    const label = puppy.featured_video_label || puppy.featuredVideoLabel || "Watch Video";
    assert.equal(await card.getByRole("link", { name: `${label} of ${puppy.name}`, exact: true }).getAttribute("href"), safeVideo);
  }
  assert.equal(await card.locator("h3,.litter-puppy-price,dd,.litter-puppy-primary").evaluateAll((els) => els.every((el) => el.scrollWidth <= el.clientWidth + 1)), true, `No clipped text at ${width}px`);
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
    const listedUrls = await page.locator('script[data-schema="red-ranch-dogs-schema"]').evaluate((el) =>
      JSON.parse(el.textContent)["@graph"].find((entry) => entry["@type"] === "ItemList")?.itemListElement.map((item) => item.url) || []
    );
    assert.deepEqual(listedUrls.sort(), puppies.map((puppy) => `https://www.redranchdogs.com/puppies/${puppy.slug}`).sort(), "Structured availability matches every public listed profile");
    const goldendoodles = puppies.filter((puppy) => puppy.breedSlug === "goldendoodle-puppies");
    const cavapoos = puppies.filter((puppy) => puppy.breedSlug === "cavapoo-puppies");
    await checkLitterJumps(page, goldendoodles);
    for (const puppy of goldendoodles) await checkCard(page, puppy, width);
    assert.equal(await page.locator(".available-puppy-card").count(), goldendoodles.length, "No reserved, unknown or private puppies listed");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    const multiCardGroup = page.locator(".available-litter-group").filter({ has: page.locator(".available-puppy-card:nth-child(2)") }).first();
    if (await multiCardGroup.count()) {
      const pair = await multiCardGroup.locator(".available-puppy-card").evaluateAll((els) => els.slice(0, 2).map((el) => el.getBoundingClientRect().toJSON()));
      assert(width <= 760 ? pair[1].y > pair[0].y : Math.abs(pair[0].y - pair[1].y) < 1, "Responsive shared card grid");
    }
    const gold = page.getByRole("tab", { name: "Goldendoodles", exact: true });
    await page.getByRole("tab", { name: "Cavapoos", exact: true }).click();
    assert.equal(await page.locator(".available-puppy-card").count(), cavapoos.length);
    await checkLitterJumps(page, cavapoos);
    await gold.click(); await gold.click();
    assert.equal(await page.locator(".available-puppy-card").count(), goldendoodles.length);
    await page.goBack();
    assert.equal(await page.getByRole("tab", { name: "Cavapoos", exact: true }).getAttribute("aria-selected"), "true", "Repeated selection creates no extra history entry");
    await page.goForward();
    await gold.focus(); await page.keyboard.press("ArrowRight");
    assert.equal(await page.getByRole("tab", { name: "Cavapoos", exact: true }).getAttribute("aria-selected"), "true");
    await page.close();
  }
  if (server) {
    for (const scenario of ["long-and-missing", "one-available", "none-available"]) {
      const fixture = JSON.parse(before[0]);
      const fixturePuppy = fixture.find((p) => p.slug === puppies[0].slug);
      const fixtureLitters = JSON.parse(before[1]);
      if (scenario === "long-and-missing") {
        Object.assign(fixturePuppy, { name: "A puppy with a very long name for responsive layout", mainPhoto: "", image: "", collarColor: "A long descriptive collar color", goHomeDate: "Timing to be confirmed with the family after the next update", youtube_video_url: "https://example.com/not-approved" });
        for (const [slug, overrides] of [
          ["hidden-puppy", { visibility: "hidden" }],
          ["private-puppy", { visibility: "private" }],
          ["unlisted-litter", { litterSlug: "unlisted-fixture" }],
          ["reserved-puppy", { status: "Reserved" }]
        ]) fixture.push({ ...fixturePuppy, name: slug, slug, ...overrides });
      } else if (scenario === "one-available") {
        for (const puppy of fixture) {
          if (puppy !== fixturePuppy && String(puppy.status).trim().toLowerCase() === "available") puppy.status = "Reserved";
        }
        const litter = fixtureLitters.find((item) => item.slug === fixturePuppy.litterSlug);
        Object.assign(litter, { name: "Fixture pairing", goHomeDate: "", goHome: "" });
      } else {
        fixture.filter((p) => String(p.status).trim().toLowerCase() === "available").forEach((p) => { p.status = "Availability to be confirmed"; });
      }
      for (const width of [320, 768]) {
        const page = await newPage(width);
        await page.route(`${base}/src/data/puppies.json*`, (route) => route.fulfill({ contentType: "application/javascript", body: `export default ${JSON.stringify(fixture)};` }));
        if (scenario === "one-available") {
          await page.route(`${base}/src/data/litters.json*`, (route) => route.fulfill({ contentType: "application/javascript", body: `export default ${JSON.stringify(fixtureLitters.filter(isPublic))};` }));
        }
        await page.goto(`${base}/puppies/available?breed=${fixturePuppy.breedSlug}`);
        await page.locator(".available-puppy-browser").waitFor();
        if (scenario === "none-available") {
          await checkLitterJumps(page, []);
          assert.equal(await page.locator(".available-puppy-card").count(), 0);
          assert.equal(await page.locator(".available-empty-hub").count(), 1);
        } else if (scenario === "one-available") {
          await checkLitterJumps(page, [fixturePuppy], fixtureLitters);
          assert.equal(await page.locator(".available-puppy-card").count(), 1);
        } else {
          await checkLitterJumps(page, puppies.filter((puppy) => puppy.breedSlug === fixturePuppy.breedSlug));
          await checkCard(page, fixturePuppy, width);
          assert.equal(await page.locator(".available-puppy-card").count(), puppies.filter((puppy) => puppy.breedSlug === fixturePuppy.breedSlug).length, "Hidden, private, reserved and unlisted profiles stay off Available Now");
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
        await page.close();
      }
    }
  }
  const page = await newPage(390);
  await page.goto(`${base}/puppies/available`);
  const selectedPuppy = puppies[0];
  assert(selectedPuppy, "An available puppy is needed for navigation coverage");
  await cardFor(page, selectedPuppy).getByRole("link", { name: selectedPuppy.name, exact: true }).click();
  await page.waitForURL(`${base}/puppies/${selectedPuppy.slug}`);
  assert.equal(await page.locator("h1").innerText(), selectedPuppy.name);
  if (selectedPuppy.weeklyPhotos?.length) await page.locator(".puppy-weekly-photo-section").waitFor();
  await page.goBack();
  await cardFor(page, selectedPuppy).locator(".litter-puppy-primary").click();
  await page.waitForURL(`${base}/apply?interest=${encodeURIComponent(selectedPuppy.slug)}`);
  await page.goBack();
  await cardFor(page, selectedPuppy).getByRole("link", { name: "View Litter", exact: true }).click();
  await page.waitForURL(`**/litters/${selectedPuppy.litterSlug}`);
  await page.goBack();
  await cardFor(page, selectedPuppy).waitFor();
  assert.deepEqual(errors, []);
  sourceFiles.forEach((file, index) => assert(fs.readFileSync(file).equals(before[index]), "No source data changes"));
  console.log(`Available puppy cards passed: ${checked} card/viewport checks, 320–1440px, full original photos, one green status, exact facts/notes, profile/Apply/View Litter/video actions, structured inventory, repeated breed tabs and Back/Forward, source-backed litter counts/timing, keyboard jumps below the header, and safe single/empty/long/missing states. No form submissions.`);
} finally {
  await browser?.close();
  if (server && server.exitCode === null) {
    const exited = new Promise((resolve) => server.once("exit", resolve));
    server.kill("SIGTERM"); await Promise.race([exited, delay(3000)]);
    if (server.exitCode === null) server.kill("SIGKILL");
  }
}
