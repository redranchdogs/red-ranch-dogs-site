import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "outputs", "content-sheet-exports");

const SHEETS = {
  puppies: {
    fileName: "puppy-tracker.tsv",
    source: "src/data/puppies.json",
    columns: [
      "slug",
      "name",
      "visibility",
      "breedSlug",
      "breed",
      "litterSlug",
      "litter",
      "mamaSlug",
      "mama",
      "studSlug",
      "stud",
      "gender",
      "collarColor",
      "status",
      "sizeCategory",
      "estimatedAdultWeight",
      "birthDate",
      "goHomeDate",
      "price",
      "color",
      "coat",
      "mainPhoto",
      "photos",
      "weeklyPhotos",
      "description",
      "availabilityNote",
      "personalityNote",
      "photoFolderHint",
      "publicPage",
      "internalNotes",
    ],
    mapRecord: (puppy) => ({
      ...puppy,
      photos: list(puppy.photos),
      weeklyPhotos: weeklyPhotos(puppy.weeklyPhotos),
      photoFolderHint: puppy.weeklyPhotos?.[0]?.folderHint?.replace(/ \/ Week \d+$/, "") || "",
      publicPage: `/puppies/${puppy.slug}`,
      internalNotes: "",
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
      publicPage: `/parents/${parent.slug}`,
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
  publicPage: "Website path generated from the slug.",
  internalNotes: "Working notes only. Do not publish private family, payment, phone, or email details.",
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

function weeklyPhotos(value = []) {
  if (!Array.isArray(value)) return "";
  return value
    .map((week) => [week.week, list(week.photos)].filter(Boolean).join(": "))
    .join(" | ");
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
