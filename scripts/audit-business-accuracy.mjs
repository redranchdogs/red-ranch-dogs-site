import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const today = new Date();
const outputPath = path.join(root, "docs", "BUSINESS_ACCURACY_REVIEW.md");

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
    day: "numeric",
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
    december: 11,
  };
  const match = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:-\d{1,2})?,?\s*(\d{4})?/i,
  );

  if (!match) return null;

  return new Date(Number(match[3] || today.getFullYear()), monthMap[match[1].toLowerCase()], Number(match[2]));
}

function parseMonthYear(value = "") {
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
    december: 11,
  };
  const match = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/i,
  );

  if (!match) return null;

  return new Date(Number(match[2]), monthMap[match[1].toLowerCase()], 1);
}

function daysBetween(first, second) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((first.getTime() - second.getTime()) / msPerDay);
}

function bulletList(items) {
  if (!items.length) return "- None flagged.";
  return items.map((item) => `- ${item}`).join("\n");
}

function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    groups[key] ||= [];
    groups[key].push(item);
    return groups;
  }, {});
}

const puppies = readJson("src/data/puppies.json");
const litters = readJson("src/data/litters.json");
const previousLitters = readJson("src/data/previousLitters.json");
const parents = readJson("src/data/parents.json");
const waitlist = readJson("src/data/waitlist.json");
const publicPuppies = puppies.filter(isPublicRecord);
const publicLitters = litters.filter(isPublicRecord);
const publicParents = parents.filter(isPublicRecord);
const publicPreviousLitters = previousLitters.filter(isPublicRecord);
const availablePuppies = publicPuppies.filter((puppy) => normalize(puppy.status) === "available");
const currentLitters = publicLitters.filter((litter) => normalize(litter.status).includes("current"));
const plannedLitters = publicLitters.filter((litter) => normalize(litter.status).includes("planned"));
const waitlistRows = Array.isArray(waitlist) ? waitlist : waitlist.publicRows || [];
const reviewNow = [];
const reviewSoon = [];
const dataWorkflow = [];

currentLitters.forEach((litter) => {
  const goHomeDate = parseFirstCalendarDate(litter.goHomeDate || litter.goHome || "");
  const litterPuppies = publicPuppies.filter((puppy) => puppy.litterSlug === litter.slug);
  const statusCounts = groupBy(litterPuppies, (puppy) => puppy.status || "No status");
  const statusSummary = Object.entries(statusCounts)
    .map(([status, items]) => `${items.length} ${status}`)
    .join(", ");

  if (goHomeDate) {
    const distance = daysBetween(goHomeDate, today);

    if (distance < 0) {
      reviewNow.push(`${litter.name}: go-home window begins ${formatDate(goHomeDate)}, which is already past. Confirm this should still be a Current Litter.`);
    } else if (distance <= 14) {
      reviewNow.push(`${litter.name}: go-home window begins ${formatDate(goHomeDate)}. Confirm pickup/payment/status copy is current.`);
    }
  }

  if (litterPuppies.length && !Object.keys(statusCounts).some((status) => normalize(status) === "available")) {
    reviewSoon.push(`${litter.name}: public puppy statuses are ${statusSummary}. Confirm no puppy should appear on Available Puppies.`);
  }

  if (litter.weeklyUpdateStatus && /drive|folder|drop|loaded/i.test(litter.weeklyUpdateStatus)) {
    reviewNow.push(`${litter.name}: weekly update status may expose internal workflow language: "${litter.weeklyUpdateStatus}".`);
  }
});

plannedLitters.forEach((litter) => {
  const expectedDate = parseFirstCalendarDate(litter.expectedTiming || "") || parseMonthYear(litter.expectedTiming || "");

  if (expectedDate && daysBetween(expectedDate, today) < 0) {
    reviewNow.push(`${litter.name}: expected timing "${litter.expectedTiming}" may be stale. Confirm whether it is now current, born, hidden, or still planned.`);
  }

  if (/to be announced/i.test(litter.goHomeDate || "")) {
    reviewSoon.push(`${litter.name}: go-home date is still "To be announced." Fine for early planning, but confirm before launch.`);
  }

  if (!litter.previousLitterHref) {
    reviewSoon.push(`${litter.name}: no past-litter link is attached. Add one later if this pairing has a useful previous example.`);
  }
});

publicPuppies.forEach((puppy) => {
  if (normalize(puppy.status) === "available" && !puppy.availabilityNote) {
    reviewNow.push(`${puppy.name}: marked Available but missing an availability note.`);
  }

  if (/personality notes will be updated/i.test(puppy.personalityNote || "")) {
    reviewSoon.push(`${puppy.name}: personality note is still generic and can be refreshed after the next temperament update.`);
  }
});

publicPreviousLitters.forEach((litter) => {
  const hasPriceFact = (litter.facts || []).some(([label]) => normalize(label) === "price");

  if (hasPriceFact) {
    dataWorkflow.push(`${litter.name}: previous-litter data still contains a Price fact. The current page should hide old pricing, but remove this from source data later if you want the sheet cleaner.`);
  }
});

publicParents.forEach((parent) => {
  if (/pending/i.test(`${parent.healthTestingLinks || ""} ${parent.geneticTestingLinks || ""} ${parent.description || ""}`)) {
    reviewSoon.push(`${parent.name}: testing details include pending language. Confirm this is intentional before launch.`);
  }
});

if (availablePuppies.length === 0) {
  dataWorkflow.push("Available Puppies currently has zero true Available records. This is okay if intentional, and the page should route families to waitlist/current litters.");
} else {
  dataWorkflow.push(`Available Puppies has ${availablePuppies.length} true Available record(s): ${availablePuppies.map((puppy) => puppy.name).join(", ")}.`);
}

dataWorkflow.push(`Public waitlist rows currently loaded: ${waitlistRows.length}. Confirm this matches the public waitlist sheet before launch.`);

const statusRows = Object.entries(groupBy(publicPuppies, (puppy) => puppy.status || "No status"))
  .sort(([first], [second]) => first.localeCompare(second))
  .map(([status, items]) => `| ${status} | ${items.length} | ${items.map((item) => item.name).join(", ")} |`)
  .join("\n");

const currentLitterRows = currentLitters
  .map((litter) => {
    const litterPuppies = publicPuppies.filter((puppy) => puppy.litterSlug === litter.slug);
    const counts = Object.entries(groupBy(litterPuppies, (puppy) => puppy.status || "No status"))
      .map(([status, items]) => `${items.length} ${status}`)
      .join(", ");

    return `| ${litter.name} | ${litter.goHomeDate || ""} | ${counts || "No public puppies"} |`;
  })
  .join("\n");

const plannedLitterRows = plannedLitters
  .map((litter) => `| ${litter.name} | ${litter.breed} | ${litter.expectedTiming || ""} | ${litter.goHomeDate || ""} |`)
  .join("\n");

const report = `# Business Accuracy Review

Generated: ${formatDate(today)}

This is a human-review helper. It does not replace the automated launch checks; it points out business facts that may need Adam/Red Ranch Dogs confirmation before launch.

## Review Now

${bulletList(reviewNow)}

## Review Soon

${bulletList(reviewSoon)}

## Data Workflow Notes

${bulletList(dataWorkflow)}

## Public Puppy Status Snapshot

| Status | Count | Puppies |
| --- | ---: | --- |
${statusRows || "| None | 0 | |"}

## Current Litter Snapshot

| Litter | Go-home | Public puppy statuses |
| --- | --- | --- |
${currentLitterRows || "| None | | |"}

## Planned Litter Snapshot

| Litter | Breed | Expected timing | Go-home |
| --- | --- | --- | --- |
${plannedLitterRows || "| None | | | |"}

## Suggested Manual Review Order

1. Available Puppies
2. Current Litters
3. Upcoming Litters
4. Pricing
5. Apply
6. Parent profiles
7. FAQ and pickup/delivery
`;

fs.writeFileSync(outputPath, report);

console.log(report);
console.log(`\nBusiness accuracy review written to ${path.relative(root, outputPath)}.`);
