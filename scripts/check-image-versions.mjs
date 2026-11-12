import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";
import { imageVersions, resolveImageReferences, resolveImageUrl } from "../src/imageVersions.js";

const entries = Object.entries(imageVersions);
const ids = [8603, 8607, 8609, 8614, 8615, 8620, 8630, 8634, 8667, 8669, 8688, 8691, 8693, 8696, 8698, 8747, 8749, 8789, 8790, 8793, 8804, 8805];
assert.equal(entries.length, 22);
assert.deepEqual(entries.map(([source]) => Number(source.match(/img-(\d+)\.webp$/)?.[1])).sort((a, b) => a - b), ids);
const sourceData = ["puppies", "litters"].map((name) => JSON.parse(readFileSync(`src/data/${name}.json`, "utf8")));
const sourceText = JSON.stringify(sourceData);
const resolvedText = JSON.stringify(resolveImageReferences(sourceData));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const [source, alias] of entries) {
  assert(sourceText.includes(source), `Canonical path must be referenced: ${source}`);
  assert(!resolvedText.includes(source), `Rendered data must use the alias: ${source}`);
  assert(resolvedText.includes(alias), `Missing rendered alias: ${alias}`);
  const canonical = readFileSync(path.join("public", source));
  const versioned = readFileSync(path.join("public", alias));
  assert.deepEqual(versioned, canonical, `Canonical and versioned image bytes differ: ${source}`);
  assert(alias.endsWith(`-v${hash(canonical).slice(0, 12)}.webp`), `Alias must identify its content: ${alias}`);
  assert.deepEqual(readFileSync(path.join("dist", source)), canonical, `Built canonical image differs: ${source}`);
  assert.deepEqual(readFileSync(path.join("dist", alias)), canonical, `Built versioned image differs: ${alias}`);
}
// Previously published aliases must keep their original bytes for cached bundles.
const retainedAliases = [
  "/images/puppies/2026-11-10/daisy/betty-lou-week-2-img-8804-v7275460802a8.webp",
  "/images/puppies/2026-11-10/daisy/betty-lou-week-2-img-8805-vea135463a706.webp",
  "/images/puppies/2026-11-10/evie/columbo-week-4-img-8688-va89daf9a89de.webp",
  "/images/puppies/2026-11-10/evie/columbo-week-4-img-8691-v548c7ddb1f5e.webp",
  "/images/puppies/2026-11-10/evie/columbo-week-4-img-8693-vf0e98505ed44.webp",
  "/images/puppies/2026-11-10/daisy/grinch-week-2-img-8789-vf4d87a3c6510.webp",
  "/images/puppies/2026-11-10/daisy/grinch-week-2-img-8790-v286fbf3f1513.webp",
  "/images/puppies/2026-11-10/daisy/grinch-week-2-img-8793-v742b5c91b2d3.webp",
  "/images/puppies/2026-11-10/birdie/laurie-week-2-img-8696-v8574cdbb7a9c.webp",
  "/images/puppies/2026-11-10/birdie/laurie-week-2-img-8698-vd5e0237bd76d.webp",
  "/images/puppies/2026-11-10/birdie/marmee-week-2-img-8747-v56722a0df3a4.webp",
  "/images/puppies/2026-11-10/birdie/marmee-week-2-img-8749-v2881b452a0fe.webp",
  "/images/puppies/2026-11-10/lulu/merryweather-week-4-img-8620-v22bc5cfc539c.webp",
  "/images/puppies/2026-11-10/evie/evie-orange-collar-boy-week-4-img-8667-vb21127a129bf.webp",
  "/images/puppies/2026-11-10/evie/evie-orange-collar-boy-week-4-img-8669-v40f5237d9349.webp"
];
for (const alias of retainedAliases) {
  const bytes = readFileSync(path.join("public", alias));
  assert(alias.endsWith(`-v${hash(bytes).slice(0, 12)}.webp`), `Prior alias bytes changed: ${alias}`);
  assert.deepEqual(readFileSync(path.join("dist", alias)), bytes, `Prior alias missing from build: ${alias}`);
}
const unchanged = "/images/puppies/2026-11-10/beatrix/twain-week-6-img-8818.webp";
assert.equal(resolveImageUrl(unchanged), unchanged);
for (const value of ["toString", "constructor", "__proto__", "Reserved", "", null, 0]) assert.equal(resolveImageUrl(value), value);
assert.deepEqual(resolveImageReferences({ text: "Reserved", image: unchanged }), { text: "Reserved", image: unchanged });
assert.equal(resolveImageUrl(entries[0][0]), entries[0][1], "Link-preview image resolution must use the same alias map.");
for (const slug of ["columbo", "merryweather"]) {
  const preview = readFileSync(`dist/puppies/${slug}/index.html`, "utf8");
  assert(preview.includes('property="og:image" content="https://www.redranchdogs.com/images/seed/red-ranch-dogs-link-preview.png"'), "Existing puppy link previews must retain the site logo.");
}
const port = Number(process.env.IMAGE_VERSION_PORT || 5397);
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "ignore" });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch { /* Wait for the local preview. */ }
    await delay(250);
  }
  assert(ready, "Image version preview server did not become ready.");
  browser = await chromium.launch({ headless: true });
  const routes = ["/puppies/columbo", "/puppies/merryweather", "/puppies/posy", "/puppies/evie-orange-collar-boy", "/litters/birdie-waylon-final-2026", "/litters/daisy-waylon-october-2026"];
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    const found = new Set();
    for (const route of routes) {
      await page.goto(`${base}${route}`);
      await page.locator("main").waitFor();
      const sources = await page.locator("img").evaluateAll((images) => images.map((image) => image.getAttribute("src")));
      for (const [source, alias] of entries) {
        assert(!sources.includes(source), `Stale canonical image rendered on ${route}`);
        if (sources.includes(alias)) found.add(alias);
      }
    }
    assert.equal(found.size, entries.length, `Every approved alias must render at ${width}px.`);
    await page.goto(`${base}/puppies/twain`);
    await page.locator("main").waitFor();
    assert(await page.locator(`img[src="${unchanged}"]`).count(), "Twain's unchanged primary image must render.");
    await page.close();
  }
} finally {
  await browser?.close();
  if (server.exitCode === null) {
    const exited = new Promise((resolve) => server.once("exit", resolve));
    server.kill("SIGTERM");
    await Promise.race([exited, delay(3000)]);
    if (server.exitCode === null) server.kill("SIGKILL");
  }
}
console.log("Image versions passed: 22 mappings, canonical/alias/build bytes, mobile and desktop rendered URLs, unchanged Twain, and generated link previews.");
