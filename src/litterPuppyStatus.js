// Only confirmed source states receive green or red. Pending/unknown states
// must never look like a puppy is available or already reserved.
export function litterPuppyStatus(status) {
  const source = String(status || "").trim();
  const normalized = source.toLowerCase();
  if (normalized === "available") return { label: "Available", tone: "available" };
  if (["reserved", "matched"].includes(normalized)) return { label: "Reserved", tone: "reserved" };
  return { label: source || "Availability to be confirmed", tone: "neutral" };
}
