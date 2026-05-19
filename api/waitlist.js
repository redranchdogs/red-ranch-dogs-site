const waitlistSpreadsheetId = "1oChFvNCdwrtIAYWFQlsZKrTnz9tnu6Yr-Tc6WKMGSOI";
const waitlistSheetName = "Public Waitlist";
const publicHeaders = ["breed", "position", "display_name", "status", "show_publicly", "public_notes"];

function clean(value, maxLength = 240) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, maxLength);
}

function rowToMap(headers, row) {
  return Object.fromEntries(headers.map((header, index) => [header, clean(row[index])]));
}

function normalizeHeader(value) {
  return clean(value, 80).toLowerCase();
}

function normalizePublicRow(row) {
  return {
    breed: clean(row.breed, 80),
    position: Number(clean(row.position, 30)) || clean(row.position, 30),
    display_name: clean(row.display_name || row.displayName, 120),
    status: clean(row.status, 40) || "Active",
    show_publicly: clean(row.show_publicly || row.showPublicly, 20) || "Yes",
    public_notes: clean(row.public_notes || row.publicNotes, 180)
  };
}

function isPublicRow(row) {
  return (
    row.breed &&
    row.display_name &&
    String(row.status || "").toLowerCase() === "active" &&
    String(row.show_publicly || "").toLowerCase() === "yes"
  );
}

async function postBridge(payload) {
  const bridgeUrl = process.env.RED_RANCH_BRIDGE_URL;
  const bridgeSecret = process.env.RED_RANCH_BRIDGE_SECRET;

  if (!bridgeUrl || !bridgeSecret) {
    throw new Error("Waitlist bridge is not configured.");
  }

  const response = await fetch(bridgeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: bridgeSecret,
      ...payload
    })
  });
  const text = await response.text();
  let body;

  try {
    body = JSON.parse(text);
  } catch {
    throw new Error("Waitlist bridge returned an unreadable response.");
  }

  if (!response.ok || !body.ok) {
    throw new Error(body.error || "Waitlist bridge read failed.");
  }

  return body;
}

async function readWaitlistRows() {
  const body = await postBridge({
    action: "getSheetValues",
    spreadsheetId: waitlistSpreadsheetId,
    sheetName: waitlistSheetName
  });
  const values = Array.isArray(body.values) ? body.values : [];
  const headers = (values[0] || []).map(normalizeHeader);
  const missingHeaders = publicHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error("Public Waitlist is missing required public headers.");
  }

  return values
    .slice(1)
    .map((row) => normalizePublicRow(rowToMap(headers, row)))
    .filter(isPublicRow);
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ message: "Method not allowed." });
  }

  try {
    const publicRows = await readWaitlistRows();

    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return response.status(200).json({
      source: {
        name: "Waitlist Sheet",
        sheetId: waitlistSpreadsheetId,
        tab: waitlistSheetName,
        mode: "public-safe"
      },
      updatedAt: new Date().toISOString().slice(0, 10),
      publicRows
    });
  } catch (error) {
    response.setHeader("Cache-Control", "no-store");
    return response.status(503).json({
      message: "Public waitlist is temporarily using the last published version.",
      error: error.message || "Unable to read waitlist."
    });
  }
}
