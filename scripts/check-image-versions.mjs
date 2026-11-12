import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { imageVersions, resolveImageReferences, resolveImageUrl } from "../src/imageVersions.js";

const entries = Object.entries(imageVersions);
const ids = [8620, 8667, 8669, 8688, 8691, 8693, 8696, 8698, 8747, 8749, 8789, 8790, 8793, 8804, 8805];
assert.equal(entries.length, 15);
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
const unchanged = "/images/puppies/2026-11-10/beatrix/twain-week-6-img-8818.webp";
assert.equal(resolveImageUrl(unchanged), unchanged);
assert.deepEqual(resolveImageReferences({ text: "Reserved", image: unchanged }), { text: "Reserved", image: unchanged });
assert.equal(resolveImageUrl(entries[0][0]), entries[0][1], "Link-preview image resolution must use the same alias map.");
for (const slug of ["columbo", "merryweather"]) {
  const preview = readFileSync(`dist/puppies/${slug}/index.html`, "utf8");
  assert(preview.includes('property="og:image" content="https://www.redranchdogs.com/images/seed/red-ranch-dogs-link-preview.png"'), "Existing puppy link previews must retain the site logo.");
}
console.log("Image versions passed: 15 exact mappings, canonical/alias/build bytes, rendered data, untouched paths, and generated link previews.");
