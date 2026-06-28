import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const blockers = [];

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function readJson(filePath) {
  return JSON.parse(read(filePath));
}

function isPublicRecord(item = {}) {
  const visibility = String(item.visibility || "public").trim().toLowerCase();
  return visibility !== "hidden" && visibility !== "private";
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function textIncludesAvailabilityClaim(text) {
  const lower = normalize(text);
  if (!lower) return false;

  const safePhrases = [
    "not currently available",
    "no available",
    "without available",
    "future availability",
    "view available",
    "available page"
  ];

  if (safePhrases.some((phrase) => lower.includes(phrase))) return false;

  return /\b(currently available|available now|available from|available puppy|available puppies|has openings|with openings)\b/.test(
    lower
  );
}

function textSuggestsDeliveredLitter(text) {
  const lower = normalize(text);
  if (!lower) return false;

  return /\b(born|delivered|welcomed|arrived)\b/.test(lower);
}

function publicTextFiles() {
  const files = [];
  const stack = ["src"];

  while (stack.length) {
    const current = stack.pop();
    const absolute = path.join(root, current);

    fs.readdirSync(absolute, { withFileTypes: true }).forEach((entry) => {
      const relative = path.join(current, entry.name);

      if (entry.isDirectory()) {
        stack.push(relative);
        return;
      }

      if (/\.(jsx?|json|css)$/.test(entry.name)) {
        files.push(relative);
      }
    });
  }

  return files;
}

const app = read("src/App.jsx");
const puppies = readJson("src/data/puppies.json");
const litters = readJson("src/data/litters.json");
const vercel = readJson("vercel.json");

const deployGuardrailFiles = [
  "AGENTS.md",
  "docs/NEXT_SESSION_HANDOFF.md",
  "scripts/generate-session-handoff.mjs",
  "package.json"
];

deployGuardrailFiles.forEach((filePath) => {
  const contents = read(filePath);
  const hasMergeRule =
    /merg(?:e|ing)\s+`codex\/launch-candidate`\s+into\s+`main`/i.test(contents) ||
    /merg(?:e|ing)\s+\\`codex\/launch-candidate\\`\s+into\s+\\`main\\`/i.test(contents);
  const namesOldProdCommand = /Production deploy command:/i.test(contents);
  const includesDirectProdCommand = /npx\s+vercel\s+deploy\s+--prod/i.test(contents);
  const packageScriptUsesProdDeploy =
    filePath === "package.json" && /vercel\s+deploy\s+--prod/i.test(contents);

  if (namesOldProdCommand || includesDirectProdCommand || packageScriptUsesProdDeploy) {
    blockers.push(`${filePath} contains a direct Vercel production deploy command. Use the merge-to-main deploy rule instead.`);
  }

  if (filePath !== "package.json" && !hasMergeRule) {
    blockers.push(`${filePath} is missing the codex/launch-candidate to main production deploy rule.`);
  }
});

if (/availablePuppies\s*,/.test(app) || /availablePuppies\s*}/.test(app)) {
  blockers.push("src/App.jsx is importing legacy availablePuppies from siteData.js.");
}

if (/publicPuppyProfiles\.length\s*\?[\s\S]{0,160}availablePuppies/.test(app)) {
  blockers.push("src/App.jsx still contains a legacy availablePuppies fallback.");
}

if (!/const\s+puppyData\s*=\s*publicPuppyProfiles\s*;/.test(app)) {
  blockers.push("src/App.jsx should derive puppyData directly from structured puppies.json data.");
}

function extractClientRedirects(source) {
  const declaration = source.match(/const\s+clientRedirects\s*=\s*Object\.fromEntries\(\[\s*([\s\S]*?)\s*\]\);/);

  if (!declaration) {
    blockers.push("src/App.jsx is missing the clientRedirects Object.fromEntries redirect map.");
    return new Map();
  }

  const redirects = new Map();
  const entryPattern = /\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g;
  let match;

  while ((match = entryPattern.exec(declaration[1])) !== null) {
    redirects.set(match[1], match[2]);
  }

  return redirects;
}

const clientRedirectMap = extractClientRedirects(app);
const isHostCanonicalRedirect = (redirect = {}) => {
  return (redirect.has || []).some((condition) => condition.type === "host");
};
const vercelRedirectMap = new Map(
  (vercel.redirects || [])
    .filter((redirect) => !isHostCanonicalRedirect(redirect))
    .map((redirect) => [redirect.source, redirect.destination])
);

vercelRedirectMap.forEach((destination, source) => {
  const clientDestination = clientRedirectMap.get(source);

  if (!clientDestination) {
    blockers.push(`Client redirect map is missing Vercel redirect ${source} -> ${destination}.`);
    return;
  }

  if (clientDestination !== destination) {
    blockers.push(`Client redirect map sends ${source} to ${clientDestination}, but Vercel sends it to ${destination}.`);
  }
});

clientRedirectMap.forEach((destination, source) => {
  if (!vercelRedirectMap.has(source)) {
    blockers.push(`Client redirect map contains ${source} -> ${destination}, but vercel.json does not.`);
  }
});

const leakedCopyPatterns = [
  [/Week\s+\d+\s+photos\s+loaded/i, "weekly photo load note"],
  [/Drive\s+photo\s+drop/i, "Drive photo drop note"],
  [/Drive\s+media\s+drop/i, "Drive media drop note"],
  [/loaded\s+from\s+the\s+.*Drive/i, "Drive source note"],
  [/\bhousekeeping\b/i, "housekeeping note"]
];

publicTextFiles().forEach((filePath) => {
  const contents = read(filePath);

  leakedCopyPatterns.forEach(([pattern, label]) => {
    if (pattern.test(contents)) {
      blockers.push(`${filePath} contains public-facing ${label}.`);
    }
  });
});

const publicPuppies = puppies.filter(isPublicRecord);
const publicGuardianOpportunities = publicPuppies.filter((puppy) => puppy.guardianOpportunity);
const availableByLitter = publicPuppies.reduce((counts, puppy) => {
  if (normalize(puppy.status) !== "available") return counts;

  const litterSlug = puppy.litterSlug || puppy.litter;
  if (!litterSlug) return counts;

  counts.set(litterSlug, (counts.get(litterSlug) || 0) + 1);
  return counts;
}, new Map());

const statusesByLitter = publicPuppies.reduce((statuses, puppy) => {
  const litterSlug = puppy.litterSlug || puppy.litter;
  if (!litterSlug) return statuses;

  const currentStatuses = statuses.get(litterSlug) || new Set();
  currentStatuses.add(normalize(puppy.status));
  statuses.set(litterSlug, currentStatuses);
  return statuses;
}, new Map());

litters.filter(isPublicRecord).forEach((litter) => {
  const litterSlug = litter.slug;
  const availableCount = availableByLitter.get(litterSlug) || 0;
  const availabilityText = `${litter.availabilitySummary || ""} ${litter.availabilityNote || ""}`;
  const timingText = `${litter.expectedTiming || ""} ${litter.aboutTitle || ""} ${(litter.about || []).join(" ")}`;
  const statusText = normalize(litter.status);
  const statuses = statusesByLitter.get(litterSlug) || new Set();

  if (availableCount === 0 && textIncludesAvailabilityClaim(availabilityText)) {
    blockers.push(
      `${litter.litterName || litterSlug} claims public availability, but no public puppy in puppies.json is Available.`
    );
  }

  if (statuses.has("waitlist matching") && /reserved/i.test(availabilityText) && !/waitlist|matching/i.test(availabilityText)) {
    blockers.push(
      `${litter.litterName || litterSlug} has waitlist matching puppies but the litter availability text reads reserved only.`
    );
  }

  if (statusText.includes("planned") && textSuggestsDeliveredLitter(`${timingText} ${availabilityText}`)) {
    blockers.push(
      `${litter.litterName || litterSlug} is public as a planned litter, but its timing/copy suggests it has delivered. Make it current with puppy photos/details, or set visibility to hidden until ready.`
    );
  }
});

if (!/\.filter\(isOpenGuardianOpportunity\)/.test(app)) {
  blockers.push("Guardian opportunities page should filter public puppy records through isOpenGuardianOpportunity.");
}

publicGuardianOpportunities.forEach((puppy) => {
  const opportunity = puppy.guardianOpportunity || {};
  const opportunityStatus = normalize(opportunity.status);
  const placementStatus = normalize(opportunity.placementStatus);
  const summary = `${opportunity.summary || ""} ${opportunity.bestFit || ""}`;
  const selectedPlacement = /\b(selected|placed|reserved|closed)\b/.test(placementStatus);

  if (opportunityStatus === "open" && selectedPlacement) {
    blockers.push(
      `${puppy.name} is marked as an open guardian opportunity, but placementStatus is "${opportunity.placementStatus}". Close the opportunity or update the placement status before publishing.`
    );
  }

  if (opportunityStatus !== "open" && textIncludesAvailabilityClaim(summary)) {
    blockers.push(
      `${puppy.name} has a closed guardian opportunity, but the public guardian copy still reads like an active opening.`
    );
  }
});

if (blockers.length) {
  console.error("Source-of-truth guardrails failed:");
  blockers.forEach((blocker) => console.error(`- ${blocker}`));
  process.exit(1);
}

console.log("Source-of-truth guardrails passed.");
