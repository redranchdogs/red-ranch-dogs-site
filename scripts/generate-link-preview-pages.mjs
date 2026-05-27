import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distRoot = path.join(root, "dist");
const siteOrigin = "https://www.redranchdogs.com";
const logoImage = `${siteOrigin}/images/seed/red-ranch-dogs-link-preview.png`;
const logoAlt = "Red Ranch Dogs logo on a clean white background";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function isPublic(record = {}) {
  const visibility = String(record.visibility || "public").trim().toLowerCase();
  return visibility !== "hidden" && visibility !== "private";
}

function normalizeRoute(route) {
  if (!route || route === "/") return "/";
  return `/${String(route).replace(/^\/+|\/+$/g, "")}`;
}

function uniqueRoutes(routes) {
  const seen = new Set();
  return routes
    .map(normalizeRoute)
    .filter((route) => {
      if (seen.has(route)) return false;
      seen.add(route);
      return true;
    });
}

function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function concise(value, fallback) {
  return String(value || fallback || "")
    .replace(/\s+/g, " ")
    .trim();
}

function routeUrl(route) {
  return `${siteOrigin}${route === "/" ? "/" : route}`;
}

const breeds = readJson("src/data/breeds.json").filter(isPublic);
const puppies = readJson("src/data/puppies.json").filter(isPublic);
const litters = readJson("src/data/litters.json").filter(isPublic);
const parents = readJson("src/data/parents.json").filter(isPublic);
const previousLitters = readJson("src/data/previousLitters.json").filter(isPublic);

const staticMeta = new Map([
  ["/", ["Red Ranch Dogs | Country Raised Doodles", "Country-raised Goldendoodle, Cavapoo, and Bernedoodle puppies from Red Ranch Dogs in Salado, Texas."]],
  ["/puppies", ["Puppies | Red Ranch Dogs", "Browse available puppies, current litters, upcoming pairings, previous litters, and breed pages from Red Ranch Dogs."]],
  ["/puppies/available", ["Available Puppies | Red Ranch Dogs", "See Red Ranch Dogs puppies currently available to reserve, with breed and litter details kept current."]],
  ["/puppies/current-litters", ["Current Litters | Red Ranch Dogs", "Follow current Red Ranch Dogs litters, weekly puppy photos, go-home timing, and simple availability notes."]],
  ["/puppies/upcoming-litters", ["Upcoming Litters | Red Ranch Dogs", "Browse planned Red Ranch Dogs pairings by breed and expected timing."]],
  ["/puppies/previous-litters", ["Previous Litters | Red Ranch Dogs", "Browse previous Red Ranch Dogs litters by breed and pairing."]],
  ["/puppies/what-comes-with-your-puppy", ["What Comes With Your Puppy | Red Ranch Dogs", "Review what comes home with each Red Ranch Dogs puppy, including records, starter guidance, and go-home basics."]],
  ["/puppies/coat-traits", ["Coat Traits | Red Ranch Dogs", "Learn common doodle coat colors, patterns, markings, and traits used by Red Ranch Dogs families."]],
  ["/parents", ["Parent Dogs | Red Ranch Dogs", "Meet the Red Ranch Dogs mamas and studs behind current and future Goldendoodle, Cavapoo, and Bernedoodle litters."]],
  ["/parents/mamas", ["Mamas | Red Ranch Dogs", "Meet the Red Ranch Dogs mamas in the Goldendoodle, Cavapoo, and Bernedoodle programs."]],
  ["/parents/studs", ["Studs | Red Ranch Dogs", "Meet the Red Ranch Dogs studs and outside studs used in current and future pairings."]],
  ["/parents/goldendoodle-parents", ["Goldendoodle Parents | Red Ranch Dogs", "Meet the Red Ranch Dogs parent dogs connected to Goldendoodle litters."]],
  ["/parents/cavapoo-parents", ["Cavapoo Parents | Red Ranch Dogs", "Meet the Red Ranch Dogs parent dogs connected to Cavapoo litters."]],
  ["/parents/bernedoodle-parents", ["Bernedoodle Parents | Red Ranch Dogs", "Meet the Red Ranch Dogs parent dogs connected to Bernedoodle litters."]],
  ["/process", ["Process | Red Ranch Dogs", "Review pricing, applications, waitlist details, FAQs, pickup, and delivery guidance from Red Ranch Dogs."]],
  ["/process/how-it-works", ["How It Works | Red Ranch Dogs", "See the Red Ranch Dogs puppy process from application through waitlist matching, puppy picks, and go-home day."]],
  ["/process/pricing", ["Pricing | Red Ranch Dogs", "Review Red Ranch Dogs puppy pricing, deposits, and what families can expect before joining the waitlist."]],
  ["/process/application-and-waitlist", ["Application & Waitlist | Red Ranch Dogs", "Learn how the Red Ranch Dogs puppy application and breed waitlists work."]],
  ["/process/waitlist", ["Current Waitlist | Red Ranch Dogs", "See public Red Ranch Dogs waitlist guidance and how families are contacted for breed matches."]],
  ["/process/faq", ["FAQ | Red Ranch Dogs", "Read common Red Ranch Dogs questions about puppies, timing, pricing, pickup, and the waitlist."]],
  ["/process/pickup-and-delivery", ["Puppy Pickup & Delivery | Red Ranch Dogs", "Review Red Ranch Dogs puppy pickup, travel, and go-home guidance."]],
  ["/stud-services", ["Stud Services | Red Ranch Dogs", "Explore Red Ranch Dogs stud services and breeder-support resources."]],
  ["/stud-services/our-studs", ["Our Studs | Red Ranch Dogs", "Meet the Red Ranch Dogs studs used for in-house and breeder-support pairings."]],
  ["/stud-services/reproductive-services", ["Reproductive Services | Red Ranch Dogs", "Review Red Ranch Dogs reproductive service support for breeders."]],
  ["/stud-services/reproductive-education", ["Reproductive Education | Red Ranch Dogs", "Read breeder education resources from Red Ranch Dogs."]],
  ["/guardian-program", ["Guardian Program | Red Ranch Dogs", "Learn about the Red Ranch Dogs guardian family program near Salado, Texas."]],
  ["/guardian-program/application", ["Guardian Application | Red Ranch Dogs", "Start the Red Ranch Dogs guardian family application."]],
  ["/guardian-program/current-guardian-opportunities", ["Guardian Opportunities | Red Ranch Dogs", "See current Red Ranch Dogs guardian family opportunities."]],
  ["/guardian-program/faq", ["Guardian FAQ | Red Ranch Dogs", "Read common questions about the Red Ranch Dogs guardian family program."]],
  ["/about", ["About Red Ranch Dogs", "Learn more about the Red Ranch Dogs family, team, reviews, and ways to contact us."]],
  ["/about/our-family", ["Our Family | Red Ranch Dogs", "Meet the family behind Red Ranch Dogs in Salado, Texas."]],
  ["/about/meet-the-team", ["Meet the Team | Red Ranch Dogs", "Meet the people helping keep puppy care, parent dog care, communication, and updates moving at Red Ranch Dogs."]],
  ["/about/reviews", ["Reviews | Red Ranch Dogs", "Read Red Ranch Dogs reviews and family experiences."]],
  ["/contact", ["Contact | Red Ranch Dogs", "Contact Red Ranch Dogs about puppies, current litters, waitlists, guardian families, or stud services."]],
  ["/privacy", ["Privacy Policy | Red Ranch Dogs", "Read the Red Ranch Dogs website privacy policy."]],
  ["/apply", ["Apply | Red Ranch Dogs", "Start the Red Ranch Dogs puppy application and waitlist process."]],
  ["/previous-litters", ["Previous Litters | Red Ranch Dogs", "Browse previous Red Ranch Dogs litters and past pairings."]],
  ["/previous-litters-goldendoodles", ["Previous Goldendoodle Litters | Red Ranch Dogs", "Browse previous Red Ranch Dogs Goldendoodle litters."]],
  ["/previous-litters-bernedoodles", ["Previous Bernedoodle Litters | Red Ranch Dogs", "Browse previous Red Ranch Dogs Bernedoodle litters."]],
  ["/previous-litters-cavapoos", ["Previous Cavapoo Litters | Red Ranch Dogs", "Browse previous Red Ranch Dogs Cavapoo litters."]],
  ["/stop-the-marking", ["Stop the Marking | Red Ranch Dogs", "A Red Ranch Dogs resource page for dog marking guidance."]]
]);

function breedMeta(route) {
  const breed = breeds.find((item) => item.route === route);
  if (!breed) return null;
  return [
    `${breed.pluralName} in Texas | Red Ranch Dogs`,
    `${breed.pluralName} raised by Red Ranch Dogs for families in Austin, San Antonio, Dallas-Fort Worth, Houston, and Central Texas.`
  ];
}

function recordMeta(route) {
  const puppy = puppies.find((item) => `/puppies/${item.slug}` === route);
  if (puppy) {
    return [
      `${puppy.name} | ${puppy.breed} Puppy | Red Ranch Dogs`,
      `${puppy.name} is a ${puppy.gender || ""} ${puppy.breed} puppy from the ${puppy.litter} litter.`
    ];
  }

  const litter = litters.find((item) => `/litters/${item.slug}` === route);
  if (litter) {
    return [
      `${litter.name} | ${litter.breed} Litter | Red Ranch Dogs`,
      concise(litter.availabilitySummary || litter.description, `Follow the ${litter.name} ${litter.breed} litter from Red Ranch Dogs.`)
    ];
  }

  const parent = parents.find((item) => `/parents/${item.slug}` === route);
  if (parent) {
    return [
      `${parent.name} | Parent Dog | Red Ranch Dogs`,
      concise(parent.description, `${parent.name} is a Red Ranch Dogs ${parent.role || "parent dog"}.`)
    ];
  }

  const previousLitter = previousLitters.find((item) => normalizeRoute(item.href) === route);
  if (previousLitter) {
    return [
      `${previousLitter.name} | Previous Litter | Red Ranch Dogs`,
      `Archive details for the ${previousLitter.name} ${previousLitter.breed} litter from Red Ranch Dogs.`
    ];
  }

  return null;
}

function metaFor(route) {
  const meta = recordMeta(route) || breedMeta(route) || staticMeta.get(route);
  if (meta) {
    return {
      title: concise(meta[0], "Red Ranch Dogs"),
      description: concise(meta[1], "Country-raised Goldendoodle, Cavapoo, and Bernedoodle puppies from Red Ranch Dogs in Salado, Texas.")
    };
  }

  return {
    title: "Red Ranch Dogs",
    description: "Country-raised Goldendoodle, Cavapoo, and Bernedoodle puppies from Red Ranch Dogs in Salado, Texas."
  };
}

function upsertTag(html, selectorRegex, replacement, insertBefore = "</head>") {
  if (selectorRegex.test(html)) return html.replace(selectorRegex, replacement);
  return html.replace(insertBefore, `    ${replacement}\n  ${insertBefore}`);
}

function applyMeta(html, route) {
  const { title, description } = metaFor(route);
  const canonical = routeUrl(route);
  const escapedTitle = escapeAttribute(title);
  const escapedDescription = escapeAttribute(description);
  const escapedCanonical = escapeAttribute(canonical);

  let output = html;
  output = output.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeText(title)}</title>`);
  output = upsertTag(output, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapedDescription}" />`);
  output = upsertTag(output, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapedCanonical}" />`);
  output = upsertTag(output, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapedTitle}" />`);
  output = upsertTag(output, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapedDescription}" />`);
  output = upsertTag(output, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${escapedCanonical}" />`);
  output = upsertTag(output, /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="website" />`);
  output = upsertTag(output, /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${logoImage}" />`);
  output = upsertTag(output, /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image:secure_url" content="${logoImage}" />`);
  output = upsertTag(output, /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image:alt" content="${logoAlt}" />`);
  output = upsertTag(output, /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:card" content="summary_large_image" />`);
  output = upsertTag(output, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escapedTitle}" />`);
  output = upsertTag(output, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escapedDescription}" />`);
  output = upsertTag(output, /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${logoImage}" />`);
  output = upsertTag(output, /<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image:alt" content="${logoAlt}" />`);
  return output;
}

const routes = uniqueRoutes([
  ...staticMeta.keys(),
  ...breeds.map((breed) => breed.route),
  ...puppies.map((puppy) => `/puppies/${puppy.slug}`),
  ...litters.map((litter) => `/litters/${litter.slug}`),
  ...parents.map((parent) => `/parents/${parent.slug}`),
  ...previousLitters.map((litter) => litter.href)
]);

const baseHtmlPath = path.join(distRoot, "index.html");
if (!fs.existsSync(baseHtmlPath)) {
  throw new Error("dist/index.html is missing. Run this script after vite build.");
}

const baseHtml = fs.readFileSync(baseHtmlPath, "utf8");

for (const route of routes) {
  const html = applyMeta(baseHtml, route);
  if (route === "/") {
    fs.writeFileSync(baseHtmlPath, html);
    continue;
  }

  const routeDir = path.join(distRoot, route.replace(/^\//, ""));
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, "index.html"), html);
}

console.log(`Generated ${routes.length} route-specific link preview pages in dist/.`);
