const allowedForms = new Set(["application", "contact", "guardian", "newsletter", "waitlist"]);

function clean(value) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 4000);
}

function submissionText(payload) {
  return Object.entries(payload)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

async function sendEmail(payload) {
  if (!process.env.RESEND_API_KEY || !process.env.FORM_TO_EMAIL || !process.env.FORM_FROM_EMAIL) {
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.FORM_FROM_EMAIL,
      to: process.env.FORM_TO_EMAIL,
      subject: `Red Ranch Dogs ${payload.formType} submission`,
      text: submissionText(payload)
    })
  });

  if (!response.ok) {
    throw new Error("Email delivery failed.");
  }

  return { skipped: false };
}

async function appendSheet(payload) {
  if (!process.env.FORM_WEBHOOK_URL) {
    return { skipped: true };
  }

  const response = await fetch(process.env.FORM_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Spreadsheet logging failed.");
  }

  return { skipped: false };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ message: "Method not allowed." });
  }

  const body = typeof request.body === "object" ? request.body : JSON.parse(request.body || "{}");
  if (clean(body.companyWebsite)) {
    return response.status(200).json({ message: "Thank you. We received your submission." });
  }

  const formType = clean(body.formType);

  if (!allowedForms.has(formType)) {
    return response.status(400).json({ message: "Unknown form type." });
  }

  const payload = {
    submittedAt: new Date().toISOString(),
    formType,
    page: clean(body.page),
    source: clean(body.source),
    name: clean(body.name),
    email: clean(body.email),
    phone: clean(body.phone),
    preferredBreed: clean(body.preferredBreed),
    location: clean(body.location),
    housing: clean(body.housing),
    fencedYard: clean(body.fencedYard),
    otherPets: clean(body.otherPets),
    dogExperience: clean(body.dogExperience),
    message: clean(body.message)
  };

  if (!payload.email) {
    return response.status(400).json({ message: "Email is required." });
  }

  try {
    const [emailResult, sheetResult] = await Promise.all([sendEmail(payload), appendSheet(payload)]);

    if (emailResult.skipped && sheetResult.skipped && process.env.VERCEL_ENV === "production") {
      return response.status(500).json({ message: "Form delivery is not configured yet." });
    }

    return response.status(200).json({
      message:
        emailResult.skipped && sheetResult.skipped
          ? "Preview submission received. Configure production form credentials before launch."
          : "Thank you. We received your submission."
    });
  } catch (error) {
    return response.status(502).json({ message: error.message || "Unable to submit right now." });
  }
}
