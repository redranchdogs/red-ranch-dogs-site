import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const shouldWrite = args.has("--write");
const strict = args.has("--strict");
const outputPath = path.join(root, "docs", "CONTENT_FRESHNESS_REVIEW.md");
const today = new Date();

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

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function parseFirstCalendarDate(value = "") {
  const text = String(value || "");
  const monthMap = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11
  };
  const match = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:-\d{1,2})?,?\s*(\d{4})?/i
  );

  if (!match) return null;

  return new Date(Number(match[3] || today.getFullYear()), monthMap[match[1].toLowerCase()], Number(match[2]));
}

function daysBetween(first, second) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const firstDate = new Date(first.getFullYear(), first.getMonth(), first.getDate());
  const secondDate = new Date(second.getFullYear(), second.getMonth(), second.getDate());
  return Math.round((firstDate.getTime() - secondDate.getTime()) / msPerDay);
}

function timingNoteForGoHome(goHomeDate) {
  if (!goHomeDate) return "No parsed go-home date";

  const daysFromGoHome = daysBetween(today, goHomeDate);
  if (daysFromGoHome > 0) {
    return `${daysFromGoHome} ${daysFromGoHome === 1 ? "day" : "days"} after go-home start`;
  }
  if (daysFromGoHome < 0) {
    const daysUntilGoHome = Math.abs(daysFromGoHome);
    return `${daysUntilGoHome} ${daysUntilGoHome === 1 ? "day" : "days"} before go-home start`;
  }

  return "Go-home starts today";
}

function bulletList(items) {
  if (!items.length) return "- None.";
  return items.map((item) => `- ${item}`).join("\n");
}

function names(items) {
  if (!items.length) return "None";
  return items.map((item) => item.name).join(", ");
}

function byLitter(items) {
  return items.reduce((groups, puppy) => {
    const key = puppy.litter || puppy.litterSlug || "Unknown litter";
    groups[key] ||= [];
    groups[key].push(puppy);
    return groups;
  }, {});
}

const puppies = readJson("src/data/puppies.json");
const litters = readJson("src/data/litters.json");
const publicPuppies = puppies.filter(isPublicRecord);
const publicLitters = litters.filter(isPublicRecord);
const litterBySlug = new Map(publicLitters.map((litter) => [litter.slug, litter]));
const availablePuppies = publicPuppies.filter((puppy) => normalize(puppy.status) === "available");
const featuredAvailablePuppies = availablePuppies.filter((puppy) => litterBySlug.get(puppy.litterSlug)?.featuredAvailable === true);
const hiddenAvailablePuppies = availablePuppies.filter((puppy) => litterBySlug.get(puppy.litterSlug)?.featuredAvailable !== true);
const guardianPuppies = publicPuppies.filter((puppy) => puppy.guardianOpportunity);
const openGuardianPuppies = guardianPuppies.filter((puppy) => normalize(puppy.guardianOpportunity?.status) === "open");
const closedGuardianPuppies = guardianPuppies.filter((puppy) => normalize(puppy.guardianOpportunity?.status) !== "open");
const currentLitters = publicLitters.filter((litter) => normalize(litter.status).includes("current"));
const warnings = [];
const blockers = [];

Object.entries(byLitter(hiddenAvailablePuppies)).forEach(([litterName, litterPuppies]) => {
  const litter = litterBySlug.get(litterPuppies[0]?.litterSlug);
  warnings.push(
    `${litterName}: ${names(litterPuppies)} ${litterPuppies.length === 1 ? "is" : "are"} public Available but hidden from /puppies/available because featuredAvailable is ${String(litter?.featuredAvailable)}.`
  );
});

currentLitters.forEach((litter) => {
  const goHomeDate = parseFirstCalendarDate(litter.goHomeDate || litter.goHome || "");
  if (!goHomeDate) return;

  const daysFromGoHome = daysBetween(today, goHomeDate);
  if (daysFromGoHome >= 21) {
    warnings.push(`${litter.name}: go-home window started ${formatDate(goHomeDate)}. Confirm this should still be a Current Litter.`);
  }
});

guardianPuppies.forEach((puppy) => {
  const opportunity = puppy.guardianOpportunity || {};
  const opportunityStatus = normalize(opportunity.status);
  const placementStatus = normalize(opportunity.placementStatus);
  const selectedPlacement = /\b(selected|placed|reserved|closed)\b/.test(placementStatus);

  if (opportunityStatus === "open" && selectedPlacement) {
    blockers.push(`${puppy.name}: guardianOpportunity.status is open, but placementStatus is "${opportunity.placementStatus}".`);
  }
});

const featuredRows = Object.entries(byLitter(featuredAvailablePuppies))
  .map(([litterName, litterPuppies]) => `| ${litterName} | ${litterPuppies.length} | ${names(litterPuppies)} |`)
  .join("\n");

const hiddenRows = Object.entries(byLitter(hiddenAvailablePuppies))
  .map(([litterName, litterPuppies]) => {
    const litter = litterBySlug.get(litterPuppies[0]?.litterSlug);
    return `| ${litterName} | ${litterPuppies.length} | ${String(litter?.featuredAvailable)} | ${names(litterPuppies)} |`;
  })
  .join("\n");

const guardianRows = guardianPuppies
  .map((puppy) => {
    const opportunity = puppy.guardianOpportunity || {};
    return `| ${puppy.name} | ${puppy.status || ""} | ${opportunity.status || ""} | ${opportunity.placementStatus || ""} | ${opportunity.badge || ""} |`;
  })
  .join("\n");

const currentLitterRows = currentLitters
  .map((litter) => {
    const litterPuppies = publicPuppies.filter((puppy) => puppy.litterSlug === litter.slug);
    const availableCount = litterPuppies.filter((puppy) => normalize(puppy.status) === "available").length;
    const goHomeDate = parseFirstCalendarDate(litter.goHomeDate || litter.goHome || "");
    const timingNote = timingNoteForGoHome(goHomeDate);
    return `| ${litter.name} | ${litter.goHomeDate || litter.goHome || ""} | ${String(litter.featuredAvailable)} | ${availableCount} | ${timingNote} |`;
  })
  .join("\n");

const report = `# Content Freshness Review

Generated: ${formatDate(today)}

This is a read-only website audit for public availability, guardian opportunities, and current-litter freshness. It does not sync sheets, update CRM, or change production data.

## Summary

- Public Available puppy records: ${availablePuppies.length}
- Featured on /puppies/available: ${featuredAvailablePuppies.length}
- Public Available but not featured: ${hiddenAvailablePuppies.length}
- Open guardian opportunities: ${openGuardianPuppies.length}
- Closed guardian opportunity records: ${closedGuardianPuppies.length}

## Blockers

${bulletList(blockers)}

## Review Warnings

${bulletList(warnings)}

## Featured Available Puppies

| Litter | Count | Puppies |
| --- | ---: | --- |
${featuredRows || "| None | 0 | |"}

## Public Available But Not Featured

These puppies are public and marked Available, but they will not appear on /puppies/available unless their litter has \`featuredAvailable: true\`.

| Litter | Count | featuredAvailable | Puppies |
| --- | ---: | --- | --- |
${hiddenRows || "| None | 0 | | |"}

## Guardian Opportunities

Guardian opportunity visibility is controlled by \`src/data/puppies.json\` on each puppy's \`guardianOpportunity.status\`.

| Puppy | Puppy status | Guardian status | Placement | Badge |
| --- | --- | --- | --- | --- |
${guardianRows || "| None | | | | |"}

## Current Litters

| Litter | Go-home | featuredAvailable | Available puppies | Timing note |
| --- | --- | --- | ---: | --- |
${currentLitterRows || "| None | | | 0 | |"}

## Recommended Use

1. Run this before publishing puppy availability or guardian opportunity changes.
2. If a puppy is truly available but should be merchandised publicly, confirm the litter should have \`featuredAvailable: true\`.
3. If a guardian family is selected, set \`guardianOpportunity.status\` to \`closed\` before publishing.
4. Run \`npm run validate:content\`, \`npm run check:source\`, and \`npm run check:buyer-flow\` before deploy review.
`;

console.log(report);

if (shouldWrite) {
  fs.writeFileSync(outputPath, report);
  console.log(`\nContent freshness review written to ${path.relative(root, outputPath)}.`);
}

if (strict && blockers.length) {
  process.exit(1);
}
