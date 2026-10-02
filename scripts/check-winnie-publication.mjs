import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const origin = process.env.PUBLICATION_TEST_ORIGIN || "http://127.0.0.1:5187";
const slug = "winnie-wyatt-spring-2026";
const readJson = async (path) => JSON.parse(await fs.readFile(path, "utf8"));
const record = (await readJson("src/data/litters.json")).find((item) => item.slug === slug);
assert.equal(record.visibility, "hidden");
assert.equal(record.status, "Previous Litter");
assert.equal(record.birthDate, "September 7, 2026");
assert.equal(record.priceRange, "$3,200");
assert(record.aboutThisLitter.length && record.weeklyUpdateGallery.length, "Internal history is retained");
const parents = await readJson("src/data/parents.json");
for (const name of ["winnie", "wyatt-earp"]) assert(parents.find((parent) => parent.slug === name).relatedLitters.includes(slug), "Internal parent association is retained");

for (const name of ["sitemap.xml", "llms.txt", "llms-full.txt"]) {
  assert(!(await fs.readFile(`dist/${name}`, "utf8")).includes(`/litters/${slug}`), `${name} exposes hidden litter`);
}
for (const name of await fs.readdir("dist/assets")) {
  if (!name.endsWith(".js")) continue;
  const code = await fs.readFile(`dist/assets/${name}`, "utf8");
  assert(!code.includes(slug), `${name} exposes hidden litter associations`);
  assert(!/Winnie \+ Wyatt|Winnie and Wyatt|once Winnie's timing is confirmed/.test(code), `${name} contains unpublished litter copy`);
  const response = await fetch(`${origin}/assets/${name}`);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), code, "Served JavaScript must match the audited build");
}
const retiredAsset = "/images/litters/winnie-redford.webp";
await assert.rejects(fs.access(`dist${retiredAsset}`), { code: "ENOENT" });
const preservedAsset = await fs.readFile("internal-assets/litters/winnie-redford.webp");
assert.equal(createHash("sha256").update(preservedAsset).digest("hex"), "da256e3ca476ea3b34df1f3b52d8206312d3e96952f09166116b06e4512ada36", "Original pairing image must remain byte-identical internally");
for (const method of ["GET", "HEAD"]) {
  const response = await fetch(origin + retiredAsset, { method });
  assert.equal(response.status, 410, "Retired pairing image must no longer be served");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-robots-tag"), "noindex");
  assert(!response.headers.get("content-type").startsWith("image/"));
  assert.equal(await response.text(), method === "HEAD" ? "" : "Gone");
}
for (const path of ["/images/dams/winnie-red-ranch-dogs.webp", "/images/litters/penny-wyatt.webp"]) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, "Dam and other litter assets remain public");
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), new Uint8Array(await fs.readFile(`public${path}`)));
}
const hiddenPaths = [`/litters/${slug}`, `/litters/${slug}/past-puppies`, "/winnie-wyatt", "/winnie-redford"];
for (const path of hiddenPaths) {
  await assert.rejects(fs.access(`dist${path}/index.html`), { code: "ENOENT" });
}
const config = await readJson("vercel.json");
assert.deepEqual(config.rewrites[0], { source: retiredAsset, destination: "/api/retired-litter-media" }, "Exact retirement route must precede SPA fallback");
for (const path of ["/winnie-wyatt", "/winnie-redford"]) assert(!config.redirects.some((item) => item.source === path));
for (const source of [`/litters/${slug}/:path*`, "/winnie-wyatt", "/winnie-redford"]) {
  assert(config.headers.some((item) => item.source === source && item.headers.some((header) => header.key === "X-Robots-Tag" && header.value.includes("noindex"))));
}

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.route("**/*", (route) => {
      if (!route.request().url().startsWith(origin)) return route.abort();
      assert.equal(route.request().method(), "GET", "Publication audit must never submit forms");
      return route.continue();
    });
    for (const path of hiddenPaths) {
      await page.goto(origin + path);
      await page.getByRole("heading", { name: "Let's get you back on track", exact: true }).waitFor();
      assert((await page.locator('meta[name="robots"]').getAttribute("content")).includes("noindex"));
      assert.equal(await page.locator(".litter-detail-hero, .litter-puppy-list, .gallery-photo-button").count(), 0);
      assert(!/Winnie \+ Wyatt|September 7, 2026/.test(await page.locator("main").innerText()));
    }
    for (const path of ["/", "/puppies/current-litters", "/puppies/upcoming-litters", "/puppies/previous-litters", "/previous-litters-cavapoos", "/puppies/cavapoo-puppies", "/parents/winnie", "/parents/wyatt-earp", "/parents/mamas", `/apply?litter=${slug}`]) {
      await page.goto(origin + path);
      await page.locator("main h1").waitFor();
      assert(!/Winnie \+ Wyatt/.test(await page.locator("main").innerText()), `${path} exposes pairing`);
      assert.equal(await page.locator(`a[href*="${slug}"], a[href="/winnie-wyatt"], a[href="/winnie-redford"]`).count(), 0);
      if (path === "/parents/winnie") {
        assert(await page.getByRole("heading", { name: "Winnie", exact: true }).isVisible());
        assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "index, follow");
      }
      if (path === "/parents/mamas") {
        const card = page.locator(".parent-profile-card").filter({ has: page.getByRole("heading", { name: "Winnie", exact: true }) });
        assert(!/related litter/i.test(await card.innerText()), "Hidden litter must not contribute to Winnie's public count");
      }
      if (path.startsWith("/apply?")) assert.equal(await page.locator(".application-reserve-hero").count(), 0);
    }
    await context.close();
  }
  console.log("Winnie publication PASS: source history/associations/asset retained; actual served JS excludes hidden slug and copy; retired pairing image absent from dist and returns HTTP410/no-store/noindex for GET/HEAD; dam and unrelated litter images unchanged; crawler/static pages exclude litter; direct and legacy links unavailable/noindex; public listings, parent counts and application context omit litter; dam profile remains public. Mobile and desktop, read-only requests, external browser requests blocked.");
} finally {
  await browser.close();
}
