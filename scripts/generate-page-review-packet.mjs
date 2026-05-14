import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "docs", "PAGE_REVIEW_PACKET.md");
const productionBase = "https://www.redranchdogs.com";
const localBase = "http://127.0.0.1:5181";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function normalize(value = "") {
  return String(value).trim().toLowerCase();
}

function isPublicRecord(item = {}) {
  const visibility = normalize(item.visibility || "public");
  return visibility !== "hidden" && visibility !== "private";
}

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function line(text = "") {
  return `${text}\n`;
}

function link(route) {
  return `[local](${localBase}${route}) | [production path](${productionBase}${route})`;
}

function checkbox(text) {
  return `- [ ] ${text}`;
}

function section(title, body) {
  return line(`## ${title}`) + line() + body + line();
}

function pageBlock({ title, route, priority = "Standard", checks = [], notes = [] }) {
  return [
    `### ${title}`,
    "",
    `Route: \`${route}\``,
    `Links: ${link(route)}`,
    `Priority: ${priority}`,
    "",
    "Confirm:",
    ...checks.map(checkbox),
    ...(notes.length ? ["", "Notes:", ...notes.map((note) => `- ${note}`)] : []),
    "",
  ].join("\n");
}

function byStatus(items) {
  return items.reduce((counts, item) => {
    const key = item.status || "No status";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function statusSummary(items) {
  const counts = byStatus(items);
  return Object.entries(counts)
    .map(([status, count]) => `${count} ${status}`)
    .join(", ") || "No public records";
}

const puppies = readJson("src/data/puppies.json");
const litters = readJson("src/data/litters.json");
const previousLitters = readJson("src/data/previousLitters.json");
const parents = readJson("src/data/parents.json");
const publicPuppies = puppies.filter(isPublicRecord);
const publicLitters = litters.filter(isPublicRecord);
const publicPreviousLitters = previousLitters.filter(isPublicRecord);
const publicParents = parents.filter(isPublicRecord);
const currentLitters = publicLitters.filter((litter) => normalize(litter.status).includes("current"));
const plannedLitters = publicLitters.filter((litter) => normalize(litter.status).includes("planned"));
const availablePuppies = publicPuppies.filter((puppy) => normalize(puppy.status) === "available");
const parentProfilesToSpotCheck = publicParents
  .filter((parent) => parent.relatedLitters?.length || ["birdie", "honey", "penny", "ginny", "waylon-jennings", "wyatt-earp", "butch-cassidy"].includes(parent.slug))
  .slice(0, 12);

const buyerPages = [
  pageBlock({
    title: "Homepage",
    route: "/",
    priority: "High",
    checks: [
      "Hero still feels approved and unchanged.",
      "Trust strip, Our Doodles, process, testimonials, final CTA, and footer feel cohesive on mobile.",
      "Primary CTAs lead to Apply, Available Puppies, Current Litters, or text/contact as intended.",
    ],
  }),
  pageBlock({
    title: "Available Puppies",
    route: "/puppies/available",
    priority: "Critical",
    checks: [
      `True available puppy count is correct (${availablePuppies.length} currently in data).`,
      "If there are no available puppies, empty-state copy routes families to waitlist/current litters without sounding broken.",
      "Only truly available puppies appear here.",
    ],
  }),
  pageBlock({
    title: "Current Litters",
    route: "/puppies/current-litters",
    priority: "Critical",
    checks: [
      "Current litters are ordered in the way families should see them.",
      "Each litter status, go-home window, and availability note is accurate.",
      "Past litter links appear only where a helpful previous pairing exists.",
    ],
    notes: currentLitters.map((litter) => {
      const litterPuppies = publicPuppies.filter((puppy) => puppy.litterSlug === litter.slug);
      return `${litter.name}: ${litter.goHomeDate || "no go-home date"}; ${statusSummary(litterPuppies)}.`;
    }),
  }),
  pageBlock({
    title: "Upcoming Litters",
    route: "/puppies/upcoming-litters",
    priority: "Critical",
    checks: [
      "Expected timing is still current.",
      "Breed, mama, stud, expected size, and waitlist CTA are correct.",
      "Anything not confirmed yet is worded as planned, expected, or tentative.",
    ],
    notes: plannedLitters.map((litter) => `${litter.name}: ${litter.expectedTiming || "no timing"}; ${litter.breed}.`),
  }),
  pageBlock({
    title: "Previous Litters",
    route: "/puppies/previous-litters",
    priority: "Medium",
    checks: [
      "Only pairings you still want to show publicly are visible.",
      "Old pricing is not shown to visitors.",
      "Pairing photos and parent cards are attractive enough for families asking what past puppies looked like.",
    ],
    notes: [`Public previous litter pages in data: ${publicPreviousLitters.length}.`],
  }),
  pageBlock({
    title: "Pricing",
    route: "/process/pricing",
    priority: "Critical",
    checks: [
      "Current breed pricing ranges are accurate.",
      "$500 non-refundable deposit language is correct.",
      "Payment method wording matches current policy.",
    ],
  }),
  pageBlock({
    title: "Apply",
    route: "/apply",
    priority: "Critical",
    checks: [
      "Application questions are concise but sufficient.",
      "Breed and size options match the current program.",
      "Submission reaches the correct sheet/routing bucket.",
    ],
  }),
  pageBlock({
    title: "How It Works",
    route: "/process/how-it-works",
    priority: "High",
    checks: [
      "Waitlist process matches the real breed-specific deposit workflow.",
      "Pick/pass wording is clear.",
      "No in-person puppy pick policy is present where needed without overloading the homepage.",
    ],
  }),
];

const litterPages = currentLitters
  .map((litter) =>
    pageBlock({
      title: `Litter Detail: ${litter.name}`,
      route: `/litters/${litter.slug}`,
      priority: "High",
      checks: [
        "Hero shows the correct parent pairing.",
        "About-this-litter copy is accurate and not too long.",
        "Puppy statuses and photos match the latest weekly update.",
      ],
    }),
  )
  .join("");

const parentPages = [
  pageBlock({
    title: "Mamas Directory",
    route: "/parents/mamas",
    priority: "High",
    checks: [
      "Only public/current mamas you want families to see are listed.",
      "Cards are not cramped on mobile.",
      "No tally/stat block is visible.",
    ],
  }),
  pageBlock({
    title: "Studs Directory",
    route: "/parents/studs",
    priority: "High",
    checks: [
      "Only public/current studs you want families to see are listed.",
      "Stud cards use the same clean parent-card template.",
      "Retired or outside-only studs are handled intentionally.",
    ],
  }),
  ...parentProfilesToSpotCheck.map((parent) =>
    pageBlock({
      title: `Parent Profile: ${parent.name}`,
      route: `/parents/${parent.slug}`,
      priority: "Standard",
      checks: [
        "Photo crop looks good on mobile.",
        "Role, breed, weight, coat, color, and status are accurate.",
        "Related litters and CTA behavior make sense.",
      ],
    }),
  ),
].join("");

const formPages = [
  pageBlock({
    title: "Contact",
    route: "/contact",
    priority: "High",
    checks: [
      "Contact copy is simple and routes general questions correctly.",
      "Form submission works.",
      "Phone, email, and location are correct.",
    ],
  }),
  pageBlock({
    title: "Guardian Application",
    route: "/guardian-program/application",
    priority: "High",
    checks: [
      "Distance and fenced-yard expectations are clear.",
      "Question set is concise enough for real families.",
      "Form submission routes as guardian lead.",
    ],
  }),
  pageBlock({
    title: "Stud Inquiry",
    route: "/stud-services/our-studs",
    priority: "High",
    checks: [
      "Stud pricing and Garth Brooks exception are correct wherever shown.",
      "Brucellosis requirement is clear without making the form feel heavy.",
      "Form submission routes as stud lead.",
    ],
  }),
].join("");

const report = `# Page Review Packet

Generated: ${formatToday()}

Use this when Adam has time for the human business-accuracy pass. It is intentionally practical: open each page, confirm the bullets, and move on.

${section("Critical Buyer Pages", buyerPages.join(""))}
${section("Current Litter Detail Pages", litterPages)}
${section("Parent Pages To Spot Check", parentPages)}
${section("Forms And Lead Routing", formPages)}
## Final Mobile Pass

- [ ] Check the homepage on a phone-sized viewport.
- [ ] Check Available Puppies, Current Litters, Upcoming Litters, Apply, and Contact on a phone-sized viewport.
- [ ] Confirm footer is compact and readable.
- [ ] Confirm no text is clipped in cards, buttons, or nav dropdowns.

## Final Decision

- [ ] Business facts approved.
- [ ] Forms tested.
- [ ] Preview approved.
- [ ] DNS launch approved by Adam.
`;

fs.writeFileSync(outputPath, report);
console.log(report);
console.log(`\nPage review packet written to ${path.relative(root, outputPath)}.`);
