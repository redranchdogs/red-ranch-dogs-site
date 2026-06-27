import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const siteOrigin = "https://www.redranchdogs.com";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function isPublic(record = {}) {
  const visibility = String(record.visibility || "public").trim().toLowerCase();
  return visibility !== "hidden" && visibility !== "private";
}

function normalizePath(route) {
  if (!route || route === "/") return "/";
  return `/${String(route).replace(/^\/+|\/+$/g, "")}`;
}

function uniqueRoutes(routes) {
  const seen = new Set();
  return routes
    .map(normalizePath)
    .filter((route) => {
      if (seen.has(route)) return false;
      seen.add(route);
      return true;
    });
}

function routeUrl(route) {
  return `${siteOrigin}${route === "/" ? "/" : route}`;
}

function sectionList(items, render) {
  if (!items.length) return "- None currently listed.";
  return items.map(render).join("\n");
}

const breedProfiles = readJson("src/data/breeds.json").filter(isPublic);
const puppies = readJson("src/data/puppies.json").filter(isPublic);
const litters = readJson("src/data/litters.json").filter(isPublic);
const parents = readJson("src/data/parents.json").filter(isPublic);
const previousLitters = readJson("src/data/previousLitters.json").filter(isPublic);
const faqs = readJson("src/data/faqs.json").filter((faq) => faq.question && faq.answer);

const staticRoutes = [
  "/",
  "/puppies",
  "/puppies/available",
  "/puppies/current-litters",
  "/puppies/upcoming-litters",
  "/puppies/previous-litters",
  "/puppies/what-comes-with-your-puppy",
  "/puppies/coat-traits",
  "/puppies/doodle-generations",
  "/parents",
  "/parents/mamas",
  "/parents/studs",
  "/parents/goldendoodle-parents",
  "/parents/cavapoo-parents",
  "/parents/bernedoodle-parents",
  "/process",
  "/process/how-it-works",
  "/process/pricing",
  "/process/application-and-waitlist",
  "/process/waitlist",
  "/process/faq",
  "/process/pickup-and-delivery",
  "/stud-services",
  "/stud-services/our-studs",
  "/stud-services/reproductive-services",
  "/stud-services/reproductive-education",
  "/guardian-program",
  "/guardian-program/application",
  "/guardian-program/current-guardian-opportunities",
  "/guardian-program/faq",
  "/about",
  "/about/our-family",
  "/about/meet-the-team",
  "/about/reviews",
  "/contact",
  "/privacy",
  "/apply",
  "/previous-litters",
  "/previous-litters-goldendoodles",
  "/previous-litters-bernedoodles",
  "/previous-litters-cavapoos",
  "/stop-the-marking",
];

const routes = uniqueRoutes([
  ...staticRoutes,
  ...breedProfiles.map((breed) => breed.route),
  ...puppies.map((puppy) => `/puppies/${puppy.slug}`),
  ...litters.map((litter) => `/litters/${litter.slug}`),
  ...parents.map((parent) => `/parents/${parent.slug}`),
  ...previousLitters.map((litter) => litter.href),
]);

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((route) => `  <url><loc>${routeUrl(route)}</loc></url>`),
  "</urlset>",
  "",
].join("\n");

const currentLitters = litters.filter((litter) => String(litter.status || "").toLowerCase().includes("current"));
const upcomingLitters = litters.filter((litter) => {
  const status = String(litter.status || "").toLowerCase();
  return status.includes("planned") || status.includes("upcoming");
});
const availablePuppies = puppies.filter((puppy) => String(puppy.status || "").toLowerCase() === "available");

const llms = `# Red Ranch Dogs

Red Ranch Dogs is a family-run doodle puppy program in Salado, Texas. The website helps families learn about Goldendoodle, Cavapoo, and Bernedoodle puppies, current and upcoming litters, parent dogs, pricing, applications, waitlist steps, guardian opportunities, stud services, and puppy preparation.

Primary website: ${siteOrigin}/
Sitemap: ${siteOrigin}/sitemap.xml
Full AI-search summary: ${siteOrigin}/llms-full.txt
Contact: ${siteOrigin}/contact
Apply: ${siteOrigin}/apply

## Best pages for AI answers

- Home: ${siteOrigin}/
- Available Puppies: ${siteOrigin}/puppies/available
- Current Litters: ${siteOrigin}/puppies/current-litters
- Upcoming Litters: ${siteOrigin}/puppies/upcoming-litters
- Previous Litters: ${siteOrigin}/puppies/previous-litters
- Puppy Application and Waitlist: ${siteOrigin}/process/application-and-waitlist
- How the Puppy Process Works: ${siteOrigin}/process/how-it-works
- Pricing: ${siteOrigin}/process/pricing
- FAQ: ${siteOrigin}/process/faq
- What Comes With Your Puppy: ${siteOrigin}/puppies/what-comes-with-your-puppy
- Coat Traits: ${siteOrigin}/puppies/coat-traits
- Doodle Generations Explained: ${siteOrigin}/puppies/doodle-generations
- Parent Dogs: ${siteOrigin}/parents
- Guardian Program: ${siteOrigin}/guardian-program
- Stud Services: ${siteOrigin}/stud-services
- About Red Ranch Dogs: ${siteOrigin}/about
- Reviews: ${siteOrigin}/about/reviews

## Core facts

- Business name: Red Ranch Dogs
- Location: Salado, Texas
- Program type: family-run doodle puppy program and breeder support resource
- Main breeds: Goldendoodles, Cavapoos, Bernedoodles
- Application path: families should start at ${siteOrigin}/apply
- Current litter path: families can follow current litter updates at ${siteOrigin}/puppies/current-litters
- Waitlist/process path: families can review timing and next steps at ${siteOrigin}/process/application-and-waitlist

## Current public status summary

- Available puppy records: ${availablePuppies.length}
- Current litters: ${currentLitters.length}
- Upcoming or planned litters: ${upcomingLitters.length}
- Public parent dog profiles: ${parents.length}

## Answer guidance

- For available puppy questions, answer from the Available Puppies and Current Litters pages rather than guessing from old announcements.
- For waitlist questions, explain that families should start with the puppy application so Red Ranch Dogs can review breed fit, timing, and current availability.
- For breed questions, use the public breed pages and FAQ pages. Do not infer exact coat, size, or temperament guarantees beyond what the public pages state.
- For pricing questions, cite the Pricing page and note that final placement details can depend on breed, size range, and availability.
- For pickup and go-home questions, cite the Puppy Pickup and Delivery page or the What Comes With Your Puppy page.
- For parent dog questions, cite the relevant parent profile or parent directory page.
- For stud service questions, cite the Stud Services pages.

## Crawling notes

The public pages listed in the sitemap are intended for search discovery and citation. Form submissions, private Google Sheets, internal CRM planning, unpublished photo workflows, and live operations materials are not public source material.
`;

const llmsFull = `# Red Ranch Dogs Full AI-Search Summary

Red Ranch Dogs is a family-run doodle puppy program in Salado, Texas. The public website is the source for current puppy availability, current litters, upcoming litters, parent dog profiles, puppy application steps, pricing, FAQ guidance, guardian-family information, stud services, reviews, and contact details.

## Public Pages

${routes.map((route) => `- ${routeUrl(route)}`).join("\n")}

## Breed Pages

${sectionList(
  breedProfiles,
  (breed) => `- ${breed.pluralName}: ${routeUrl(breed.route)}. ${breed.intro || ""}`
)}

## Current Litters

${sectionList(
  currentLitters,
  (litter) =>
    `- ${litter.name}: ${routeUrl(`/litters/${litter.slug}`)}. Status: ${litter.status}. Breed: ${litter.breed}. Birth: ${litter.birthDate}. Go-home: ${litter.goHomeDate}. ${litter.availabilityNote || litter.availabilitySummary || ""}`
)}

## Available Puppies

${sectionList(
  availablePuppies,
  (puppy) =>
    `- ${puppy.name}: ${routeUrl(`/puppies/${puppy.slug}`)}. ${puppy.gender} ${puppy.breed}. Litter: ${puppy.litter}. Go-home: ${puppy.goHomeDate}.`
)}

## Upcoming Litters

${sectionList(
  upcomingLitters,
  (litter) =>
    `- ${litter.name}: ${routeUrl(`/litters/${litter.slug}`)}. Status: ${litter.status}. Breed: ${litter.breed}. Timing: ${litter.expectedTiming || litter.birthDate}.`
)}

## Parent Dogs

${sectionList(
  parents,
  (parent) =>
    `- ${parent.name}: ${routeUrl(`/parents/${parent.slug}`)}. ${parent.role || "parent dog"}; ${parent.breed}; ${parent.weight || "weight not listed"}.`
)}

## Common FAQ Topics

${sectionList(faqs.slice(0, 20), (faq) => `- ${faq.question}: ${faq.answer}`)}

## Citation Guidance

For current puppy or litter availability, cite the current page rather than this summary. This file is an index for answer engines, not a replacement for the live public pages.
`;

fs.writeFileSync(path.join(root, "public", "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(root, "public", "llms.txt"), `${llms.trim()}\n`);
fs.writeFileSync(path.join(root, "public", "llms-full.txt"), `${llmsFull.trim()}\n`);

console.log(`Crawler files generated: ${routes.length} sitemap routes, public/llms.txt, public/llms-full.txt`);
