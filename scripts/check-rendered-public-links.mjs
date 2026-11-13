// Complements browser QA: render every public route and follow all emitted local
// destinations, query states and fragment links. No network requests or submits.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { URL, URLSearchParams } from "node:url";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const root = process.cwd();
const output = path.resolve(process.env.RENDERED_LINK_OUTPUT || "output/rendered-public-links.json");
const origin = "https://www.redranchdogs.com";
const decode = (text) => text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const sitemap = [...fs.readFileSync("public/sitemap.xml", "utf8").matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const seeds = [...sitemap, ...["available", "current-litters", "upcoming-litters"].flatMap((section) =>
  ["goldendoodle-puppies", "cavapoo-puppies", "bernedoodle-puppies"].map((breed) => `${origin}/puppies/${section}?breed=${breed}`)
)];
const queue = [...new Set(seeds)];
const queued = new Set(queue);
const pages = new Map();
const links = [];
const external = new Set();
const staticFiles = new Set();
const fingerprints = Object.fromEntries(["src/App.jsx", "src/PuppyListingCard.jsx", "src/PuppyDetailCard.jsx", "src/publicProfileLinks.js", "src/styles.css"].map((file) => [file, createHash("sha256").update(fs.readFileSync(file)).digest("hex")]));
const savedError = console.error;
console.error = (...args) => {
  if (!String(args[0]).includes("useLayoutEffect does nothing")) savedError(...args);
};
const savedWindow = globalThis.window;
const server = await createServer({ root, server: { middlewareMode: true }, appType: "custom", mode: "production" });
try {
  const { default: App } = await server.ssrLoadModule("/src/App.jsx");
  for (let i = 0; i < queue.length; i += 1) {
    if (i > 1500) throw new Error("Unexpected route expansion; stopped at safety limit.");
    const url = queue[i];
    globalThis.window = { location: new URL(url), URL, URLSearchParams, history: { state: {} }, innerWidth: 1440, matchMedia: () => ({ matches: false }) };
    let html;
    try { html = renderToStaticMarkup(React.createElement(App)); }
    catch (error) { pages.set(url, { url, error: String(error) }); continue; }
    const ids = [...html.matchAll(/\sid="([^"]*)"/g)].map((match) => decode(match[1]));
    const headings = [...html.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/g)].map((match) => decode(match[1].replace(/<[^>]+>/g, "")));
    pages.set(url, {
      url, ids, headings,
      notFound: headings.some((heading) => /get you back on track/i.test(heading)),
      duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
      missingImageAlt: [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]).filter((tag) => !/\salt=/.test(tag))
    });
    for (const match of html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>/g)) {
      const href = decode(match[1]);
      let target;
      try { target = new URL(href, url); }
      catch { links.push({ from: url, href, error: "Invalid URL" }); continue; }
      if (target.origin !== origin) { external.add(target.href); continue; }
      links.push({ from: url, to: target.href });
      const local = path.join(root, "public", target.pathname);
      if (fs.existsSync(local) && fs.statSync(local).isFile()) { staticFiles.add(target.href); continue; }
      target.hash = "";
      if (!queued.has(target.href)) { queued.add(target.href); queue.push(target.href); }
    }
  }
  const problems = [];
  for (const link of links) {
    if (link.error) { problems.push(link); continue; }
    if (staticFiles.has(link.to)) continue;
    const url = new URL(link.to);
    let fragment;
    try { fragment = decodeURIComponent(url.hash.slice(1)); }
    catch { problems.push({ ...link, reason: "Malformed fragment encoding" }); continue; }
    url.hash = "";
    const target = pages.get(url.href);
    if (!target || target.error || target.notFound) problems.push({ ...link, reason: target?.error || "Destination renders NotFound" });
    else if (fragment && !target.ids.includes(fragment)) problems.push({ ...link, reason: "Fragment ID missing from initial render" });
  }
  const rows = [...pages.values()];
  const summary = {
    sitemapPages: sitemap.length, renderedStates: rows.length,
    internalLinkOccurrences: links.length, distinctInternalHrefs: new Set(links.map((link) => link.to || link.href)).size,
    externalHrefs: external.size, staticFiles: staticFiles.size,
    renderErrors: rows.filter((row) => row.error).length, notFoundRoutes: rows.filter((row) => row.notFound).length,
    linkProblems: problems.length, headingProblems: rows.filter((row) => row.headings && row.headings.length !== 1).length,
    duplicateIdPages: rows.filter((row) => row.duplicateIds?.length).length,
    missingAltPages: rows.filter((row) => row.missingImageAlt?.length).length
  };
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({ createdAt: new Date().toISOString(), fingerprints, scope: "SSR only. Browser behavior, layout, image loading, HTTP status and external sites are tested separately.", summary, problems, pages: rows, external: [...external] }, null, 2));
  console.log(JSON.stringify({ output, summary, problems }, null, 2));
  if (problems.length || summary.renderErrors || summary.notFoundRoutes || summary.headingProblems || summary.duplicateIdPages || summary.missingAltPages) process.exitCode = 1;
} finally {
  await server.close();
  console.error = savedError;
  if (savedWindow === undefined) delete globalThis.window;
  else globalThis.window = savedWindow;
}
