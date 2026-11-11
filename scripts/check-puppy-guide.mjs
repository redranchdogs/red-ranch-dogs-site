import assert from "node:assert/strict";
import fs from "node:fs";
import { guidePath, guideArticles, articlePath } from "../src/data/puppyGuide.js";

const sitemap = fs.readFileSync("public/sitemap.xml", "utf8");
const app = fs.readFileSync("src/App.jsx", "utf8");
const records = ["puppies", "litters", "parents", "previousLitters"];
assert.equal(guideArticles.length, 3, "The initial guide has three complete articles");
assert.equal(new Set(guideArticles.map((article) => article.slug)).size, guideArticles.length, "Unique article routes");
for (const route of [guidePath, ...guideArticles.map(articlePath)]) {
  assert.ok(sitemap.includes(`https://www.redranchdogs.com${route}</loc>`), `${route} is in sitemap`);
  const html = fs.readFileSync(`dist${route}/index.html`, "utf8");
  assert.ok(html.includes(`<link rel="canonical" href="https://www.redranchdogs.com${route}"`), `${route} has canonical`);
  assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1, `${route} has one build-time H1`);
  const schema = JSON.parse(html.match(/id="puppy-guide-static-schema">([^<]+)<\/script>/)[1]);
  assert.equal(schema.mainEntityOfPage, `https://www.redranchdogs.com${route}`);
}
for (const article of guideArticles) {
  const route = articlePath(article);
  const html = fs.readFileSync(`dist${route}/index.html`, "utf8");
  assert.ok(html.includes('property="og:type" content="article"'));
  assert.ok(html.includes(`property="og:image" content="https://www.redranchdogs.com${article.image}"`));
  assert.ok(fs.existsSync(`public${article.image}`), `Existing photo for ${article.slug}`);
  assert.ok(article.sources.length > 0, `${article.slug} cites sources`);
  assert.equal(new Set(article.sections.map((section) => section.id)).size, article.sections.length, "Unique section anchors");
  for (const section of article.sections) {
    assert.ok(html.includes(`id="${section.id}"`));
    for (const text of [...(section.paragraphs || []), ...(section.items || [])]) {
      assert.ok(html.includes(text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")), "Full article available without JavaScript");
    }
    for (const link of section.links || []) assert.ok(sitemap.includes(`https://www.redranchdogs.com${link.href}</loc>`), `Valid article link ${link.href}`);
  }
}
const nav = app.slice(app.indexOf("const primaryNav = ["), app.indexOf("const mobilePrimaryNav"));
assert.ok(nav.includes('label: "Resources"'));
assert.ok(!nav.includes('label: "Learn"'));
for (const route of [guidePath, "/guardian-program", "/guardian-program/application", "/process/faq", "/contact", "/puppies/available", "/puppies/upcoming-litters"]) assert.ok(nav.includes(`href: "${route}"`), `Navigation retains ${route}`);
for (const name of records) assert.ok(fs.existsSync(`src/data/${name}.json`));
console.log("Puppy Guide: 4 static routes, full article HTML, sources, photos, schema, internal links and Resources navigation passed.");
