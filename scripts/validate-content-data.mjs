import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

const puppies = readJson("src/data/puppies.json");
const litters = readJson("src/data/litters.json");
const parents = readJson("src/data/parents.json");
const waitlist = readJson("src/data/waitlist.json");

const errors = [];
const warnings = [];

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

uniqueBy(puppies, "slug", "Puppy");
uniqueBy(litters, "slug", "Litter");
uniqueBy(parents, "slug", "Parent");

const puppySlugs = new Set(puppies.map((puppy) => puppy.slug));
const litterSlugs = new Set(litters.map((litter) => litter.slug));
const parentSlugs = new Set(parents.map((parent) => parent.slug));

puppies.forEach((puppy) => {
  ["name", "breed", "litterSlug", "gender", "status", "birthDate", "goHomeDate"].forEach((field) => {
    if (!puppy[field]) {
      addError(`Puppy ${puppy.slug || puppy.name || "unknown"} is missing ${field}.`);
    }
  });

  if (puppy.litterSlug && !litterSlugs.has(puppy.litterSlug)) {
    addError(`Puppy ${puppy.slug} points to missing litterSlug ${puppy.litterSlug}.`);
  }

  if (puppy.mamaSlug && !parentSlugs.has(puppy.mamaSlug)) {
    addError(`Puppy ${puppy.slug} points to missing mamaSlug ${puppy.mamaSlug}.`);
  }

  if (puppy.studSlug && !parentSlugs.has(puppy.studSlug)) {
    addError(`Puppy ${puppy.slug} points to missing studSlug ${puppy.studSlug}.`);
  }

  pathExists(puppy.mainPhoto, `Puppy ${puppy.slug}`);
  checkImageList(puppy.photos, `Puppy ${puppy.slug}`);
  (puppy.weeklyPhotos || []).forEach((week) => checkImageList(week.photos, `Puppy ${puppy.slug} ${week.week}`));
});

litters.forEach((litter) => {
  ["name", "mamaSlug", "studSlug", "breed", "availabilitySummary"].forEach((field) => {
    if (!litter[field]) {
      addError(`Litter ${litter.slug || litter.name || "unknown"} is missing ${field}.`);
    }
  });

  if (litter.mamaSlug && !parentSlugs.has(litter.mamaSlug)) {
    addError(`Litter ${litter.slug} points to missing mamaSlug ${litter.mamaSlug}.`);
  }

  if (litter.studSlug && !parentSlugs.has(litter.studSlug)) {
    addError(`Litter ${litter.slug} points to missing studSlug ${litter.studSlug}.`);
  }

  (litter.puppySlugs || []).forEach((slug) => {
    if (!puppySlugs.has(slug)) {
      addError(`Litter ${litter.slug} includes missing puppy slug ${slug}.`);
    }
  });

  checkImageList(litter.weeklyUpdateGallery, `Litter ${litter.slug}`);
});

parents.forEach((parent) => {
  ["name", "role", "breed", "weight", "status"].forEach((field) => {
    if (!parent[field]) {
      addError(`Parent ${parent.slug || parent.name || "unknown"} is missing ${field}.`);
    }
  });

  pathExists(parent.mainPhoto, `Parent ${parent.slug}`);
  checkImageList(parent.photos, `Parent ${parent.slug}`);
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

console.log(`Validated ${puppies.length} puppies, ${litters.length} litters, ${parents.length} parents, and ${waitlist.publicRows.length} waitlist rows.`);
