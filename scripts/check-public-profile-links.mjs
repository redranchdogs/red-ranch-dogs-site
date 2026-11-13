import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { URL } from "node:url";
import { publicParentProfileHref, publicPuppyLitterHref } from "../src/publicProfileLinks.js";

const publicLitters = Object.freeze([
  Object.freeze({ slug: "current-litter", visibility: "public", status: "Current Litter" }),
  Object.freeze({ slug: "upcoming-litter", visibility: "public", status: "Planned Litter" }),
  Object.freeze({ slug: "public-previous-litter", visibility: "public", status: "Previous Litter" }),
  Object.freeze({ slug: "legacy-litter" })
]);
const archives = Object.freeze({
  "/retired-litter": Object.freeze({ name: "Retired litter" }),
  "/current-litter": Object.freeze({ name: "Current litter archive" }),
  "/public-archive": Object.freeze({ name: "Public archive", visibility: "public" })
});
const publicParents = Object.freeze([
  Object.freeze({ slug: "public-mama", visibility: "public" }),
  Object.freeze({ slug: "legacy-sire" })
]);
let checked = 0;
function check(actual, expected, label) {
  assert.equal(actual, expected, label);
  checked += 1;
}
function litter(puppy, litters = publicLitters, details = archives) {
  return publicPuppyLitterHref(puppy, litters, details);
}

for (const record of publicLitters) {
  check(litter({ litterSlug: record.slug }), `/litters/${record.slug}`, `${record.slug} keeps its public route`);
}
check(litter({ litterSlug: "current-litter", litterHref: "/public-archive" }), "/litters/current-litter", "Public profile takes priority over archive and explicit href");
check(litter({ litterSlug: "retired-litter", litterHref: "/litters/current-litter" }), "/retired-litter", "Verified matching archive takes priority over explicit href");
check(litter({ litterSlug: "retired-litter" }, []), "/retired-litter", "Archive lookup needs no private litter record");
check(litter({ litterSlug: "unknown-litter" }), "", "Unknown slugs never invent a route");
check(litter({ litterSlug: "unknown-litter", litterHref: "/public-archive" }), "/public-archive", "An explicit approved archive is a valid fallback");
check(litter({ litterHref: "/litters/current-litter" }), "/litters/current-litter", "Missing litter slug can use a verified explicit public route");
check(litter({ litterHref: "/public-archive" }), "/public-archive", "Missing litter slug can use a verified explicit archive");
check(litter({ litterHref: "/litters/retired-litter" }), "", "An explicit retired profile route is not automatically rewritten");
check(litter({ litterSlug: "private-litter" }, [{ slug: "private-litter", visibility: "private" }]), "", "Private data in a mixed array cannot authorize a profile");
check(litter({ litterSlug: "retired-litter" }, [{ slug: "retired-litter", visibility: "private" }]), "/retired-litter", "An approved archive remains separate from a private profile");

for (const visibility of ["private", "hidden", " PRIVATE ", "Hidden", "draft", "unlisted", false, 1, {}]) {
  const record = { slug: "restricted", visibility };
  check(litter({ litterSlug: "restricted" }, [record]), "", `Reject non-public litter visibility: ${String(visibility)}`);
  check(litter({ litterHref: "/litters/restricted" }, [record]), "", "Explicit href cannot bypass litter visibility");
  check(litter({ litterSlug: "restricted" }, [], { "/restricted": record }), "", "Archive values cannot override an explicit visibility restriction");
  check(litter({ litterHref: "/restricted" }, [], { "/restricted": record }), "", "Explicit archive href cannot bypass visibility");
  check(litter({ litterSlug: "current-litter", visibility }), "", "Private or unknown puppy visibility is not linkable");
  check(publicParentProfileHref(record, [record]), "", "Private or unknown parent visibility is not linkable");
  check(publicParentProfileHref({ slug: "restricted" }, [record]), "", "Parent reference cannot bypass collection visibility");
  check(publicParentProfileHref({ slug: "public-mama", visibility }, publicParents), "", "Parent visibility cannot be overridden by a matching public slug");
}

for (const visibility of [undefined, null, "", "public", " PUBLIC "]) {
  check(litter({ litterSlug: "current-litter", visibility }), "/litters/current-litter", "Public and legacy visibility are supported");
  check(publicParentProfileHref({ slug: "public-mama", visibility }, publicParents), "/parents/public-mama", "Public and legacy parent visibility are supported");
}

const invalidSlugs = [undefined, null, "", 42, {}, [], " current-litter", "current-litter ", "Current-Litter", "../current-litter", "current/litter", "current\\litter", "current%2Flitter", "current-litter?x=1", "current-litter#gallery", "current-litter\n", "-current-litter", "current-litter-"];
for (const slug of invalidSlugs) {
  check(litter({ litterSlug: slug }, [{ slug }], { [`/${String(slug)}`]: {} }), "", "Malformed slugs cannot become public or archive routes");
  check(litter({ litterSlug: slug, litterHref: "/public-archive" }), "/public-archive", "Malformed slug does not block a separately verified fallback");
  check(publicParentProfileHref({ slug }, [{ slug }]), "", "Malformed parent slugs cannot become routes");
}

const unsafeHrefs = [
  "https://example.com/litters/current-litter", "https://www.redranchdogs.com/litters/current-litter",
  "//example.com/current-litter", "javascript:alert(1)", "data:text/html,unsafe", "mailto:owner@example.com",
  "litters/current-litter", "/litters/current-litter/", "/litters/current-litter?next=/private",
  "/litters/current-litter#photos", "/litters/../current-litter", "/litters/%63urrent-litter",
  "/litters/current-litter\n", "/litters\\current-litter", "/public-archive/", "/public-archive?x=1",
  "/public-archive#photos", "/%70ublic-archive", " /public-archive", "/public-archive ", "/../public-archive",
  "/parents/public-mama", "/puppies/available", "", undefined, null, 42, {}, []
];
for (const litterHref of unsafeHrefs) {
  check(litter({ litterHref }), "", "Only exact known public litter paths are allowed");
  check(litter({ litterHref }, [], { [String(litterHref)]: {} }), "", "Unsafe paths cannot be authorized by malformed archive-map keys");
}
check(litter({ litterHref: "/unknown-archive" }), "", "Syntactically safe but unapproved archive routes are rejected");

for (const malformed of [undefined, null, false, 42, "public", [], {}]) {
  check(litter(malformed), "", "Malformed puppy input is safe");
  check(publicParentProfileHref(malformed, publicParents), "", "Malformed parent input is safe");
}
for (const malformed of [null, false, 42, "public", {}, new Map()]) {
  check(litter({ litterSlug: "current-litter" }, malformed, {}), "", "Malformed public litter collection is safe");
  check(litter({ litterSlug: "retired-litter" }, [], malformed), "", "Malformed archive map is safe");
  check(publicParentProfileHref({ slug: "public-mama" }, malformed), "", "Malformed public parent collection is safe");
}
for (const value of [null, false, "details", [], 42]) {
  check(litter({ litterHref: "/retired-litter" }, [], { "/retired-litter": value }), "", "Malformed archive entries cannot authorize paths");
}
check(litter({ litterHref: "/retired-litter" }, [], Object.create(archives)), "", "Inherited archive entries are not approved routes");
check(litter({ litterHref: "/retired-litter" }, [], Object.assign(Object.create(null), archives)), "/retired-litter", "Null-prototype archive maps are supported");
check(litter({ litterSlug: "current-litter" }, [null, false, "current-litter", {}, ...publicLitters]), "/litters/current-litter", "Mixed litter input skips malformed entries");
check(publicParentProfileHref({ slug: "public-mama" }, [null, false, "public-mama", {}, ...publicParents]), "/parents/public-mama", "Mixed parent input skips malformed entries");
check(publicParentProfileHref({ slug: "public-mama" }, publicParents), "/parents/public-mama", "Known public parent links to its profile");
check(publicParentProfileHref({ slug: "legacy-sire" }, publicParents), "/parents/legacy-sire", "Legacy public parent remains linkable");
check(publicParentProfileHref({ slug: "unknown-parent" }, publicParents), "", "Unknown parent has no invented route");
check(publicParentProfileHref({ href: "/parents/public-mama" }, publicParents), "", "A raw parent href alone does not authorize a profile");
check(litter(Object.freeze({ litterSlug: "retired-litter" })), "/retired-litter", "Resolver does not mutate frozen records or collections");
check(publicParentProfileHref(Object.freeze({ slug: "public-mama" }), publicParents), "/parents/public-mama", "Parent resolver does not mutate frozen input");

// Regression coverage reads the already-approved public projection, never private fields.
const readPublicRecords = async (name) => JSON.parse(await readFile(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"))
  .filter((record) => record.visibility === "public");
const [sitePuppies, siteLitters, siteParents, previousLitters] = await Promise.all(
  ["puppies", "litters", "parents", "previousLitters"].map(readPublicRecords)
);
const siteArchives = Object.fromEntries(previousLitters
  .filter((record) => ["Goldendoodles", "Bernedoodles", "Cavapoos"].includes(record.group))
  .map(({ href, ...details }) => [href, details]));
const retiredSlugs = ["birdie-waylon-spring-2026", "penny-wyatt-spring-2026", "ginny-butch-spring-2026", "whitley-waylon-april-2026", "faye-sundance-may-2026"];
let repairedPuppies = 0;
for (const slug of retiredSlugs) {
  const puppies = sitePuppies.filter((puppy) => puppy.litterSlug === slug);
  assert.ok(puppies.length > 0, `Regression fixture must retain public puppies for ${slug}`);
  for (const puppy of puppies) {
    check(publicPuppyLitterHref(puppy, siteLitters, siteArchives), `/${slug}`, `${puppy.name} uses its verified archive`);
    repairedPuppies += 1;
  }
}
for (const puppy of sitePuppies.filter((puppy) => siteLitters.some((record) => record.slug === puppy.litterSlug))) {
  check(publicPuppyLitterHref(puppy, siteLitters, siteArchives), `/litters/${puppy.litterSlug}`, `${puppy.name} keeps its current public litter route`);
}
for (const slug of ["bram", "ranger-outside-stud"]) {
  check(publicParentProfileHref({ slug }, siteParents), "", `${slug} has no public parent route`);
}
for (const parent of siteParents) {
  check(publicParentProfileHref(parent, siteParents), `/parents/${parent.slug}`, `${parent.name} keeps its approved parent profile route`);
}
console.log(`Public profile links passed: ${checked} assertions; ${repairedPuppies} archived puppy links resolve across ${retiredSlugs.length} verified archives; private parent links remain absent.`);
