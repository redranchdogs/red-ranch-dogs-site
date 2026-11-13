const normalize = (value) => String(value || "").trim().toLowerCase();

// Presentation only. Source puppy statuses and the detail-page status rules stay unchanged.
export function litterCardAvailability(litter, puppies = [], fallbackLabel = "") {
  const status = normalize(litter?.status);
  if (status.includes("previous")) return { label: "Previous litter", tone: "neutral" };

  const available = puppies.filter((puppy) => normalize(puppy.status) === "available").length;
  if (available) return { label: `${available} ${available === 1 ? "puppy" : "puppies"} available`, tone: "available" };
  if (puppies.some((puppy) => normalize(puppy.status) === "waitlist matching")) {
    return { label: "Waitlist matching", tone: "neutral" };
  }
  const expectedProfiles = Array.isArray(litter?.puppySlugs) ? litter.puppySlugs : [];
  const profilesComplete = expectedProfiles.every((slug) => puppies.some((puppy) => puppy.slug === slug));
  if (puppies.length && profilesComplete && puppies.every((puppy) => ["reserved", "matched"].includes(normalize(puppy.status)))) {
    return { label: "Fully reserved", tone: "reserved" };
  }
  if (status.includes("current") || litter?.birthConfirmed || puppies.length) {
    return { label: "Availability pending", tone: "neutral" };
  }
  return { label: fallbackLabel || "Planning", tone: "neutral" };
}
