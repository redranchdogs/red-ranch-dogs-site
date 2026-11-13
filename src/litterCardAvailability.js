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

// Only prices of currently available puppies are actionable. Never substitute a
// litter's historical/estimated price or infer a missing puppy price.
export function litterCardPrice(litter, puppies = []) {
  if (litterCardAvailability(litter, puppies).tone !== "available") return null;
  const available = puppies.filter((puppy) => normalize(puppy.status) === "available");
  const prices = available.map((puppy) => {
    const value = String(puppy.price ?? "").trim();
    if (!/^\$(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{2})?$/.test(value)) return null;
    const amount = Number(value.slice(1).replaceAll(",", ""));
    return Number.isFinite(amount) && amount > 0 ? amount : null;
  });
  if (prices.some((price) => price === null)) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const format = (amount) => new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: Number.isInteger(amount) ? 0 : 2
  }).format(amount);
  return min === max
    ? { label: "Puppy price", value: format(min), isRange: false }
    : { label: "Price range", value: `${format(min)}–${format(max)}`, isRange: true };
}
