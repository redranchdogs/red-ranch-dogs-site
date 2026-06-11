import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

const puppies = readJson("src/data/puppies.json");
const litters = readJson("src/data/litters.json");
const previousLitters = readJson("src/data/previousLitters.json");
const parents = readJson("src/data/parents.json");
const waitlist = readJson("src/data/waitlist.json");

const errors = [];
const warnings = [];
const normalizedStatus = (value = "") => String(value).trim().toLowerCase();
const puppyStatuses = new Set(["available", "pending", "reserved", "matched", "guardian candidate", "waitlist matching"]);
const publicLitterStatuses = new Set(["current litter", "planned litter", "previous litter"]);
const parentRoles = new Set(["mama", "stud"]);

function isPublicRecord(item = {}) {
  const visibility = normalizedStatus(item.visibility || "public");
  return visibility !== "hidden" && visibility !== "private";
}

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function uniqueBy(items, field, label) {
  const seen = new Set();
  items.forEach((item) => {
    if (!item[field]) {
      addError(`${label} is missing ${field}.`);
      return;
    }

    if (seen.has(item[field])) {
      addError(`${label} has duplicate ${field}: ${item[field]}.`);
    }

    seen.add(item[field]);
  });
}

function pathExists(publicPath, context) {
  if (!publicPath || !publicPath.startsWith("/")) return;

  const localPath = path.join(root, "public", publicPath);
  if (!fs.existsSync(localPath)) {
    addWarning(`${context} references a missing public file: ${publicPath}`);
  }
}

function checkImageList(images = [], context) {
  images.forEach((image) => pathExists(image, context));
}

function isYouTubeUrl(value = "") {
  if (!value) return true;

  try {
    const url = new globalThis.URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return Boolean(url.pathname.replace(/\//g, ""));
    if (!["youtube.com", "youtube-nocookie.com"].includes(host)) return false;
    if (url.searchParams.get("v") || url.searchParams.get("list")) return true;
    return /^\/(?:embed|shorts)\//.test(url.pathname);
  } catch {
    return false;
  }
}

uniqueBy(puppies, "slug", "Puppy");
uniqueBy(litters, "slug", "Litter");
uniqueBy(previousLitters, "href", "Previous litter");
uniqueBy(parents, "slug", "Parent");

const puppySlugs = new Set(puppies.map((puppy) => puppy.slug));
const litterSlugs = new Set(litters.map((litter) => litter.slug));
const parentSlugs = new Set(parents.map((parent) => parent.slug));
const previousLitterHrefs = new Set(previousLitters.map((litter) => litter.href));

puppies.forEach((puppy) => {
  ["name", "breed", "litterSlug", "gender", "status", "birthDate", "goHomeDate"].forEach((field) => {
    if (!puppy[field]) {
      addError(`Puppy ${puppy.slug || puppy.name || "unknown"} is missing ${field}.`);
    }
  });

  const status = normalizedStatus(puppy.status);
  if (status && !puppyStatuses.has(status)) {
    addWarning(`Puppy ${puppy.slug} has an unrecognized status: ${puppy.status}`);
  }

  if (puppy.videoUrl && !isYouTubeUrl(puppy.videoUrl)) {
    addError(`Puppy ${puppy.slug} videoUrl must be a valid YouTube URL.`);
  }

  if (status === "available" && !isPublicRecord(puppy)) {
    addError(`Puppy ${puppy.slug} is marked Available but not public on the site.`);
  }

  if (status === "available") {
    ["mainPhoto", "price", "availabilityNote", "personalityNote"].forEach((field) => {
      if (!puppy[field]) {
        addWarning(`Available puppy ${puppy.slug} is missing ${field}.`);
      }
    });

    if (/\b(waitlist|pending|matching|pick first)\b/i.test(puppy.availabilityNote || "")) {
      addError(`Available puppy ${puppy.slug} availabilityNote should not use waitlist or pending language.`);
    }
  }

  if (puppy.litterSlug && !litterSlugs.has(puppy.litterSlug)) {
    addError(`Puppy ${puppy.slug} points to missing litterSlug ${puppy.litterSlug}.`);
  }

  if (puppy.mamaSlug && !parentSlugs.has(puppy.mamaSlug)) {
    addError(`Puppy ${puppy.slug} points to missing mamaSlug ${puppy.mamaSlug}.`);
  }

  if (puppy.studSlug && !parentSlugs.has(puppy.studSlug)) {
    addError(`Puppy ${puppy.slug} points to missing studSlug ${puppy.studSlug}.`);
  }

  if (isPublicRecord(puppy)) {
    pathExists(puppy.mainPhoto, `Puppy ${puppy.slug}`);
    checkImageList(puppy.photos, `Puppy ${puppy.slug}`);
    (puppy.weeklyPhotos || []).forEach((week) => checkImageList(week.photos, `Puppy ${puppy.slug} ${week.week}`));
  }
});

litters.forEach((litter) => {
  ["name", "mamaSlug", "studSlug", "breed", "availabilitySummary"].forEach((field) => {
    if (!litter[field]) {
      addError(`Litter ${litter.slug || litter.name || "unknown"} is missing ${field}.`);
    }
  });

  const status = normalizedStatus(litter.status);
  if (status && !publicLitterStatuses.has(status)) {
    addWarning(`Litter ${litter.slug} has an unrecognized status: ${litter.status}`);
  }

  if ("featuredAvailable" in litter && typeof litter.featuredAvailable !== "boolean") {
    addError(`Litter ${litter.slug} featuredAvailable must be a boolean when present.`);
  }

  if (status === "current litter" && typeof litter.featuredAvailable !== "boolean") {
    addError(`Current litter ${litter.slug} must declare featuredAvailable as true or false.`);
  }

  if (litter.videoPlaylistUrl && !isYouTubeUrl(litter.videoPlaylistUrl)) {
    addError(`Litter ${litter.slug} videoPlaylistUrl must be a valid YouTube URL.`);
  }

  if (litter.mamaSlug && !parentSlugs.has(litter.mamaSlug)) {
    addError(`Litter ${litter.slug} points to missing mamaSlug ${litter.mamaSlug}.`);
  }

  if (litter.studSlug && !parentSlugs.has(litter.studSlug)) {
    addError(`Litter ${litter.slug} points to missing studSlug ${litter.studSlug}.`);
  }

  if (litter.previousLitterHref && !previousLitterHrefs.has(litter.previousLitterHref)) {
    addError(`Litter ${litter.slug} points to missing previousLitterHref ${litter.previousLitterHref}.`);
  }

  (litter.puppySlugs || []).forEach((slug) => {
    if (!puppySlugs.has(slug)) {
      addError(`Litter ${litter.slug} includes missing puppy slug ${slug}.`);
      return;
    }

    const puppy = puppies.find((item) => item.slug === slug);
    if (puppy?.litterSlug && puppy.litterSlug !== litter.slug) {
      addError(`Litter ${litter.slug} includes puppy ${slug}, but that puppy points to ${puppy.litterSlug}.`);
    }
  });

  if (isPublicRecord(litter)) {
    checkImageList(litter.weeklyUpdateGallery, `Litter ${litter.slug}`);
  }
});

previousLitters.forEach((litter) => {
  ["href", "name", "group", "breed", "parents", "image"].forEach((field) => {
    if (!litter[field]) {
      addError(`Previous litter ${litter.href || litter.name || "unknown"} is missing ${field}.`);
    }
  });

  if (litter.href && !litter.href.startsWith("/")) {
    addError(`Previous litter ${litter.href} must use a website path beginning with /.`);
  }

  if (isPublicRecord(litter) && litter.group === "Poodles") {
    addWarning(`Previous litter ${litter.href} is public but belongs to the hidden Poodles archive.`);
  }

  if (isPublicRecord(litter)) {
    pathExists(litter.image, `Previous litter ${litter.href}`);
    (litter.parentPhotos || []).forEach((parentPhoto) => {
      if (!parentPhoto.name || !parentPhoto.image) {
        addWarning(`Previous litter ${litter.href} has a parentPhotos entry missing name or image.`);
      }
      pathExists(parentPhoto.image, `Previous litter ${litter.href} parent ${parentPhoto.name || "photo"}`);
    });
    (litter.puppyPhotos || []).forEach((puppyPhoto) => {
      if (!puppyPhoto.name || !puppyPhoto.image) {
        addWarning(`Previous litter ${litter.href} has a puppyPhotos entry missing name or image.`);
      }
      pathExists(puppyPhoto.image, `Previous litter ${litter.href} puppy ${puppyPhoto.name || "photo"}`);
    });
  }
});

parents.forEach((parent) => {
  ["name", "role", "breed", "weight", "status"].forEach((field) => {
    if (!parent[field]) {
      addError(`Parent ${parent.slug || parent.name || "unknown"} is missing ${field}.`);
    }
  });

  const role = normalizedStatus(parent.role);
  if (role && !parentRoles.has(role)) {
    addError(`Parent ${parent.slug} has an invalid role: ${parent.role}. Expected Mama or Stud.`);
  }

  if (isPublicRecord(parent)) {
    pathExists(parent.mainPhoto, `Parent ${parent.slug}`);
    checkImageList(parent.photos, `Parent ${parent.slug}`);
  }
  (parent.relatedLitters || []).forEach((slug) => {
    if (!litterSlugs.has(slug)) {
      addError(`Parent ${parent.slug} points to missing related litter ${slug}.`);
    }
  });
});

(waitlist.publicRows || []).forEach((row, index) => {
  ["breed", "position", "display_name", "status", "show_publicly"].forEach((field) => {
    if (!row[field]) {
      addError(`Waitlist row ${index + 1} is missing ${field}.`);
    }
  });
});

if (warnings.length) {
  console.warn(`Content warnings:\n${warnings.map((warning) => `- ${warning}`).join("\n")}`);
}

if (errors.length) {
  console.error(`Content errors:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}

console.log(`Validated ${puppies.length} puppies, ${litters.length} litters, ${previousLitters.length} previous litters, ${parents.length} parents, and ${waitlist.publicRows.length} waitlist rows.`);
