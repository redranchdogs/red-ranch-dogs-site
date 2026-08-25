export async function submitFormPayload(payload, request = fetch) {
  const response = await request("/api/forms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => null);
  if (response.ok) {
    if (!result || typeof result !== "object") throw new Error("Invalid response.");
    return result.message || "";
  }
  throw new Error(result?.message || (response.status === 429
    ? "Too many requests. Retry."
    : "Submission failed."));
}
