import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicRoot = path.join(root, "public");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function normalize(value = "") {
  return String(value).trim().toLowerCase();
}

function weekNumber(value = "") {
  const match = String(value).match(/week\s+(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function publicPathExists(publicPath) {
  return Boolean(publicPath) && fs.existsSync(path.join(publicRoot, publicPath.replace(/^\//, "")));
}

function hasWeekPath(publicPath, week) {
  const number = weekNumber(week);
  return number > 0 && String(publicPath).includes(`week-${number}`);
}

const puppies = readJson("src/data/puppies.json");
const litters = readJson("src/data/litters.json");
const puppyBySlug = new Map(puppies.map((puppy) => [puppy.slug, puppy]));
const currentLitters = litters.filter((litter) => normalize(litter.status) === "current litter");

const errors = [];
const warnings = [];
const summary = [];

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

for (const litter of currentLitters) {
  const litterPuppies = (litter.puppySlugs || [])
    .map((slug) => puppyBySlug.get(slug))
    .filter(Boolean);

  if (!litter.puppySlugs?.length) {
    const currentWeek = String(litter.weeklyUpdateStatus || "").match(/Week\s+\d+/i)?.[0] || "";

    if (!litter.weeklyUpdateGallery?.length) {
      addError(`Current litter ${litter.slug} has no puppy profiles or weeklyUpdateGallery.`);
    }

    for (const galleryPhoto of litter.weeklyUpdateGallery || []) {
      if (!publicPathExists(galleryPhoto)) {
        addError(`Litter ${litter.slug} gallery photo is missing from public/: ${galleryPhoto}`);
      }
      if (currentWeek && !hasWeekPath(galleryPhoto, currentWeek)) {
        addWarning(`Litter ${litter.slug} gallery photo does not appear to use ${currentWeek}: ${galleryPhoto}`);
      }
    }

    summary.push({
      litter: litter.name || litter.slug,
      puppies: 0,
      latestWeek: currentWeek || "profiles pending",
      latestPhotos: 0,
      galleryPhotos: litter.weeklyUpdateGallery?.length || 0,
    });
    continue;
  }

  if (litterPuppies.length !== litter.puppySlugs.length) {
    const missing = litter.puppySlugs.filter((slug) => !puppyBySlug.has(slug));
    addError(`Current litter ${litter.slug} references missing puppies: ${missing.join(", ")}.`);
  }

  const latestWeeks = new Map();
  let newestWeek = "";
  let newestWeekNumber = 0;
  let latestPhotoCount = 0;

  for (const puppy of litterPuppies) {
    if (puppy.litterSlug !== litter.slug) {
      addError(`Puppy ${puppy.slug} is listed in ${litter.slug}, but points to ${puppy.litterSlug}.`);
    }

    const weeklyPhotos = puppy.weeklyPhotos || [];
    if (!weeklyPhotos.length) {
      addError(`Puppy ${puppy.slug} in current litter ${litter.slug} has no weeklyPhotos.`);
      continue;
    }

    const latest = weeklyPhotos[0];
    const latestNumber = weekNumber(latest.week);
    const maxNumber = Math.max(...weeklyPhotos.map((group) => weekNumber(group.week)));

    if (!latestNumber) {
      addError(`Puppy ${puppy.slug} has a latest weeklyPhotos entry without a parseable week label.`);
    }

    if (latestNumber !== maxNumber) {
      addError(`Puppy ${puppy.slug} weeklyPhotos are not newest-first. First is ${latest.week}; newest found is Week ${maxNumber}.`);
    }

    if (!latest.photos?.length) {
      addError(`Puppy ${puppy.slug} latest weeklyPhotos entry has no photos.`);
    }

    for (const photo of latest.photos || []) {
      latestPhotoCount += 1;
      if (!publicPathExists(photo)) {
        addError(`Puppy ${puppy.slug} latest photo is missing from public/: ${photo}`);
      }
      if (!hasWeekPath(photo, latest.week)) {
        addWarning(`Puppy ${puppy.slug} latest photo path does not include ${latest.week}: ${photo}`);
      }
    }

    if (puppy.mainPhoto && latest.photos?.length && puppy.mainPhoto !== latest.photos[0]) {
      addWarning(`Puppy ${puppy.slug} mainPhoto is not the first photo in the latest week.`);
    }

    if (puppy.mainPhoto && !publicPathExists(puppy.mainPhoto)) {
      addError(`Puppy ${puppy.slug} mainPhoto is missing from public/: ${puppy.mainPhoto}`);
    }

    latestWeeks.set(latest.week, (latestWeeks.get(latest.week) || 0) + 1);
    if (latestNumber > newestWeekNumber) {
      newestWeekNumber = latestNumber;
      newestWeek = latest.week;
    }
  }

  if (latestWeeks.size > 1) {
    const breakdown = [...latestWeeks.entries()].map(([week, count]) => `${week}: ${count}`).join(", ");
    addWarning(`Current litter ${litter.slug} has mixed latest puppy weeks (${breakdown}).`);
  }

  if (newestWeek && !String(litter.weeklyUpdateStatus || "").includes(newestWeek)) {
    addError(`Litter ${litter.slug} weeklyUpdateStatus should mention ${newestWeek}; found "${litter.weeklyUpdateStatus || ""}".`);
  }

  if (!litter.weeklyUpdateGallery?.length) {
    addError(`Current litter ${litter.slug} has no weeklyUpdateGallery.`);
  }

  for (const galleryPhoto of litter.weeklyUpdateGallery || []) {
    if (!publicPathExists(galleryPhoto)) {
      addError(`Litter ${litter.slug} gallery photo is missing from public/: ${galleryPhoto}`);
    }
    if (newestWeek && !hasWeekPath(galleryPhoto, newestWeek)) {
      addWarning(`Litter ${litter.slug} gallery photo does not appear to use ${newestWeek}: ${galleryPhoto}`);
    }
  }

  summary.push({
    litter: litter.name || litter.slug,
    puppies: litterPuppies.length,
    latestWeek: newestWeek || "unknown",
    latestPhotos: latestPhotoCount,
    galleryPhotos: litter.weeklyUpdateGallery?.length || 0,
  });
}

if (warnings.length) {
  console.warn(`Current litter media warnings:\n${warnings.map((warning) => `- ${warning}`).join("\n")}`);
}

if (errors.length) {
  console.error(`Current litter media errors:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}

console.log("Current litter media audit passed.");
summary.forEach((item) => {
  console.log(`- ${item.litter}: ${item.puppies} puppies, ${item.latestWeek}, ${item.latestPhotos} latest photos, ${item.galleryPhotos} gallery photos.`);
});
