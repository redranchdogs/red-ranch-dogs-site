import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "outputs", "content-sheet-exports");
const normalizedStatus = (value = "") => String(value).trim().toLowerCase();
const litterData = JSON.parse(fs.readFileSync(path.join(root, "src/data/litters.json"), "utf8"));
const featuredAvailableLitterSlugs = new Set(
  litterData
    .filter((litter) => litter.featuredAvailable === true)
    .map((litter) => litter.slug)
);
const shouldDisplayOnHomepage = (puppy) =>
  normalizedStatus(puppy.status) === "available" && featuredAvailableLitterSlugs.has(puppy.litterSlug);

const SHEETS = {
  puppies: {
    fileName: "puppy-tracker.tsv",
    source: "src/data/puppies.json",
    columns: [
      "publish_status",
      "puppy_name",
      "slug",
      "breed_group",
      "breed",
      "litter_name",
      "litter_slug",
      "gender",
      "collar_color",
      "birth_date",
      "go_home_date",
      "estimated_adult_weight",
      "price",
      "availability_status",
      "display_on_available_puppies",
      "display_on_homepage",
      "matched_family_display",
      "main_photo_file",
      "gallery_folder",
      "personality_note",
      "availability_note",
      "weekly_update_folder",
      "last_photo_update",
      "public_page",
      "internal_notes",
    ],
    mapRecord: (puppy) => ({
      publish_status: puppy.visibility === "public" ? "Public" : "Private",
      puppy_name: puppy.name,
      slug: puppy.slug,
      breed_group: breedGroup(puppy.breed),
      breed: puppy.breed,
      litter_name: puppy.litter,
      litter_slug: puppy.litterSlug,
      gender: puppy.gender,
      collar_color: puppy.collarColor,
      birth_date: puppy.birthDate,
      go_home_date: puppy.goHomeDate,
      estimated_adult_weight: puppy.estimatedAdultWeight,
      price: puppy.price,
      availability_status: puppy.status,
      display_on_available_puppies: normalizedStatus(puppy.status) === "available" ? "Yes" : "No",
      display_on_homepage: shouldDisplayOnHomepage(puppy) ? "Yes" : "No",
      matched_family_display: puppy.matchedFamilyDisplay || "",
      main_photo_file: fileName(puppy.mainPhoto),
      gallery_folder: photoFolder(puppy.weeklyPhotos),
      personality_note: puppy.personalityNote,
      availability_note: puppy.availabilityNote,
      weekly_update_folder: puppy.weeklyPhotos?.[0]?.folderHint || "",
      last_photo_update: puppy.weeklyPhotos?.[0]?.week || "",
      public_page: `/puppies/${puppy.slug}`,
      internal_notes: "",
    }),
  },
  litters: {
    fileName: "litters.tsv",
    source: "src/data/litters.json",
    columns: [
      "slug",
      "name",
      "visibility",
      "status",
      "litterNumber",
      "mamaSlug",
      "mama",
      "studSlug",
      "stud",
      "breedSlug",
      "breed",
      "theme",
      "birthDate",
      "goHomeDate",
      "expectedSize",
      "expectedTiming",
      "expectedColors",
      "expectedCoatTraits",
      "priceRange",
      "availabilitySummary",
      "availabilityNote",
      "puppySlugs",
      "photoFolderHint",
      "weeklyUpdateStatus",
      "weeklyUpdateGallery",
      "previousLitterHref",
      "publicPage",
      "internalNotes",
    ],
    mapRecord: (litter) => ({
      ...litter,
      puppySlugs: list(litter.puppySlugs),
      weeklyUpdateGallery: list(litter.weeklyUpdateGallery),
      publicPage: `/litters/${litter.slug}`,
      internalNotes: "",
    }),
  },
  previousLitters: {
    fileName: "previous-litters.tsv",
    source: "src/data/previousLitters.json",
    columns: [
      "href",
      "visibility",
      "name",
      "group",
      "breed",
      "parents",
      "mama",
      "stud",
      "theme",
      "born",
      "goHome",
      "coloring",
      "size",
      "coat",
      "image",
      "parentPhotos",
      "puppies",
      "puppyPhotos",
      "milestones",
      "photoFolderHint",
      "publicPage",
      "internalNotes",
    ],
    mapRecord: (litter) => ({
      ...litter,
      mama: splitParents(litter.parents).mama,
      stud: splitParents(litter.parents).stud,
      born: fact(litter, ["Born", "Delivery", "Expected"]),
      goHome: fact(litter, ["Go Home"]),
      coloring: fact(litter, ["Coloring"]),
      size: fact(litter, ["Size"]),
      coat: fact(litter, ["Coat"]),
      parentPhotos: nameImageList(litter.parentPhotos),
      puppies: list(litter.puppies),
      puppyPhotos: nameImageList(litter.puppyPhotos),
      milestones: list(litter.milestones),
      photoFolderHint: litter.photoFolderHint || "",
      publicPage: litter.visibility === "public" ? litter.href : "",
      internalNotes: "",
    }),
  },
  parents: {
    fileName: "parent-dogs.tsv",
    source: "src/data/parents.json",
    columns: [
      "slug",
      "name",
      "visibility",
      "role",
      "breedSlug",
      "breed",
      "weight",
      "color",
      "coat",
      "status",
      "mainPhoto",
      "photos",
      "healthTestingLinks",
      "geneticTestingLinks",
      "relatedLitters",
      "photoFolderHint",
      "description",
      "publicPage",
      "internalNotes",
    ],
    mapRecord: (parent) => ({
      ...parent,
      photos: list(parent.photos),
      healthTestingLinks: links(parent.healthTestingLinks),
      geneticTestingLinks: links(parent.geneticTestingLinks),
      relatedLitters: list(parent.relatedLitters),
      publicPage: parent.visibility === "hidden" ? "" : `/parents/${parent.slug}`,
      internalNotes: "",
    }),
  },
};

const FIELD_NOTES = {
  slug: "Stable website ID. Lowercase words separated by hyphens.",
  name: "Public display name.",
  visibility: "Use public for website-ready records, private for records we are not showing yet.",
  breedSlug: "Matches one breed route, such as goldendoodle-puppies.",
  litterSlug: "Connects a puppy to a litter.",
  mamaSlug: "Connects a puppy or litter to the mama record.",
  studSlug: "Connects a puppy or litter to the stud record.",
  status: "Public status such as Available, Pending, Reserved, Matched, Current Litter, Planned Litter, or Active.",
  mainPhoto: "Primary public website image path.",
  photos: "Additional public image paths separated by |.",
  weeklyPhotos: "Weekly puppy image notes separated by |.",
  photoFolderHint: "Google Drive folder path where the working photos live.",
  previousLitterHref: "Optional path to the matching previous litter page, such as /birdie-waylon-jennings.",
  href: "Stable website path for this previous litter page.",
  group: "Previous litter group. Use Goldendoodles, Cavapoos, or Bernedoodles for public archives.",
  parents: "Public parent pairing display, such as Birdie + Waylon.",
  mama: "Mama display name parsed from the parent pairing when available.",
  stud: "Stud display name parsed from the parent pairing when available.",
  theme: "Optional litter theme or nickname.",
  born: "Previous litter birth, delivery, or expected date.",
  coloring: "Coloring notes for the previous litter.",
  size: "Expected or actual size range.",
  coat: "Coat notes for the previous litter.",
  parentPhotos: "Previous litter parent photo pairs formatted as Name: /image/path.jpg separated by |. Optional href can be added as Name: /image/path.jpg: /parent/path.",
  puppies: "Public puppy names from the previous litter separated by |.",
  puppyPhotos: "Previous litter puppy photo pairs formatted as Name: /image/path.jpg separated by |.",
  milestones: "Public photo milestone labels separated by |.",
  publicPage: "Website path generated from the slug.",
  internalNotes: "Working notes only. Do not publish private family, payment, phone, or email details.",
  publish_status: "Use Public for website-ready records and Private for working records.",
  puppy_name: "Public puppy display name.",
  breed_group: "High-level breed group, such as Goldendoodle, Cavapoo, or Bernedoodle.",
  litter_name: "Public litter name, such as Birdie + Waylon.",
  litter_slug: "Connects the puppy to a litter detail page.",
  collar_color: "Collar color used to identify the puppy.",
  birth_date: "Puppy's birth date.",
  go_home_date: "Expected go-home window.",
  estimated_adult_weight: "Estimated adult weight range.",
  availability_status: "Public status such as Available, Pending, Reserved, Matched, or Guardian Candidate.",
  display_on_available_puppies: "Yes only when the puppy should appear on the Available Puppies page.",
  display_on_homepage: "Optional homepage feature flag. Default No.",
  matched_family_display: "Optional public first-name display for reserved or matched puppies.",
  main_photo_file: "Primary public image file name.",
  gallery_folder: "Google Drive folder where this puppy's working photo set lives.",
  personality_note: "Short public personality or fit note.",
  availability_note: "Short public availability status note.",
  weekly_update_folder: "Exact Google Drive folder for the current weekly media drop.",
  last_photo_update: "Latest weekly photo update label.",
  public_page: "Website path generated from the slug.",
  internal_notes: "Working notes only. Do not publish private family, payment, phone, or email details.",
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function list(value = []) {
  return Array.isArray(value) ? value.join(" | ") : value || "";
}

function links(value = []) {
  if (!Array.isArray(value)) return value || "";
  return value.map((link) => [link.label, link.url].filter(Boolean).join(": ")).join(" | ");
}

function nameImageList(value = []) {
  if (!Array.isArray(value)) return value || "";
  return value
    .map((item) => [item.name, item.image, item.href].filter(Boolean).join(": "))
    .filter(Boolean)
    .join(" | ");
}

function fact(record = {}, labels = []) {
  const normalizedLabels = labels.map((label) => label.toLowerCase());
  const match = (record.facts || []).find(([label]) => normalizedLabels.includes(String(label).toLowerCase()));
  return match?.[1] || "";
}

function splitParents(parents = "") {
  const [mama = "", stud = ""] = String(parents)
    .split("+")
    .map((part) => part.replace(/,.*$/, "").trim());

  return { mama, stud };
}

function breedGroup(breed = "") {
  const normalized = breed.toLowerCase();
  if (normalized.includes("cavapoo")) return "Cavapoo";
  if (normalized.includes("bernedoodle")) return "Bernedoodle";
  return "Goldendoodle";
}

function fileName(value = "") {
  return value.split("/").filter(Boolean).pop() || "";
}

function photoFolder(weeklyPhotos = []) {
  const folderHint = weeklyPhotos?.[0]?.folderHint || "";
  return folderHint.replace(/ \/ Week \d+$/, "");
}

function clean(value) {
  return String(value ?? "")
    .replace(/\t/g, " ")
    .replace(/\r?\n/g, " ")
    .trim();
}

function toTsv(rows) {
  return rows.map((row) => row.map(clean).join("\t")).join("\n");
}

function writeSheet({ fileName, source, columns, mapRecord }) {
  const records = readJson(source).map(mapRecord);
  const rows = [
    columns,
    ...records.map((record) => columns.map((column) => record[column])),
  ];

  fs.writeFileSync(path.join(outputDir, fileName), `${toTsv(rows)}\n`);
  return { fileName, rows: records.length, columns };
}

function writeColumnGuide(results) {
  const rows = [["sheet", "column", "note"]];

  results.forEach((result) => {
    result.columns.forEach((column) => {
      rows.push([result.fileName, column, FIELD_NOTES[column] || "Website data field. Keep the value short and consistent."]);
    });
  });

  fs.writeFileSync(path.join(outputDir, "column-guide.tsv"), `${toTsv(rows)}\n`);
}

fs.mkdirSync(outputDir, { recursive: true });

const results = Object.values(SHEETS).map(writeSheet);
writeColumnGuide(results);

console.log(`Exported sheet-ready TSV files to ${path.relative(root, outputDir)}:`);
results.forEach((result) => {
  console.log(`- ${result.fileName}: ${result.rows} rows, ${result.columns.length} columns`);
});
console.log("- column-guide.tsv: field notes for the sheet columns");
