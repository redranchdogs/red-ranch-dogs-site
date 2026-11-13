const publicSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPublicRecord(record) {
  if (!isRecord(record)) return false;
  // Existing public profiles may omit visibility. Explicit non-public values fail closed.
  const visibility = record.visibility;
  return visibility == null || (
    typeof visibility === "string" && ["", "public"].includes(visibility.trim().toLowerCase())
  );
}

function isSlug(value) {
  return typeof value === "string" && publicSlug.test(value);
}

function hasPublicSlug(records, slug) {
  return isSlug(slug) && Array.isArray(records) && records.some((record) => (
    isPublicRecord(record) && record.slug === slug
  ));
}

function isPublicArchiveHref(href, previousLitterDetails) {
  // Archive pages use exact root paths. Do not normalize or guess missing routes.
  return typeof href === "string" && href.startsWith("/") && isSlug(href.slice(1)) &&
    isRecord(previousLitterDetails) && Object.hasOwn(previousLitterDetails, href) &&
    isPublicRecord(previousLitterDetails[href]);
}

/** Resolve only routes backed by public litter records or the approved archive map. */
export function publicPuppyLitterHref(puppy, publicLitters = [], previousLitterDetails = {}) {
  if (!isPublicRecord(puppy)) return "";

  if (hasPublicSlug(publicLitters, puppy.litterSlug)) return `/litters/${puppy.litterSlug}`;

  if (isSlug(puppy.litterSlug)) {
    const archiveHref = `/${puppy.litterSlug}`;
    if (isPublicArchiveHref(archiveHref, previousLitterDetails)) return archiveHref;
  }

  const explicitHref = puppy.litterHref;
  if (typeof explicitHref !== "string") return "";
  if (explicitHref.startsWith("/litters/") && hasPublicSlug(publicLitters, explicitHref.slice(9))) {
    return explicitHref;
  }
  return isPublicArchiveHref(explicitHref, previousLitterDetails) ? explicitHref : "";
}

/** A visible parent portrait does not itself authorize a parent profile link. */
export function publicParentProfileHref(parent, publicParents = []) {
  return isPublicRecord(parent) && hasPublicSlug(publicParents, parent.slug)
    ? `/parents/${parent.slug}`
    : "";
}
