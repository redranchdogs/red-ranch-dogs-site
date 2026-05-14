import handler from "../api/forms.js";

const externalEnvKeys = [
  "FORM_WEBHOOK_URL",
  "FORM_SHEET_ID",
  "FORM_SHEET_NAME",
  "RED_RANCH_BRIDGE_SECRET",
  "RED_RANCH_BRIDGE_URL",
  "RESEND_API_KEY",
  "FORM_TO_EMAIL",
  "FORM_FROM_EMAIL"
];

externalEnvKeys.forEach((key) => {
  delete process.env[key];
});

process.env.VERCEL_ENV = "preview";

function createResponse() {
  const state = {
    headers: {},
    statusCode: 200
  };

  return {
    setHeader(key, value) {
      state.headers[key] = value;
    },
    status(code) {
      state.statusCode = code;
      return this;
    },
    json(body) {
      return {
        body,
        headers: state.headers,
        statusCode: state.statusCode
      };
    }
  };
}

async function post(body) {
  return handler({ method: "POST", body }, createResponse());
}

async function request(method, body) {
  return handler({ method, body }, createResponse());
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const basePayload = {
  currentUrl: "https://red-ranch-dogs-site.vercel.app/codex-form-handler-test",
  email: "test@example.com",
  landingPage: "https://red-ranch-dogs-site.vercel.app/?utm_source=codex&utm_medium=handler&utm_campaign=forms",
  message: "Codex local handler smoke test.",
  name: "Codex Form Test",
  page: "/codex-form-handler-test",
  phone: "555-0103",
  referrer: "Codex local smoke test",
  source: "local-handler-smoke-test",
  submittedAt: new Date().toISOString(),
  submissionId: `codex-handler-${Date.now()}`,
  userAgent: "Codex local test"
};

const validPayloads = [
  {
    ...basePayload,
    formType: "contact",
    inquiryType: "General question",
    preferredBreed: "Goldendoodle"
  },
  {
    ...basePayload,
    formType: "application",
    formTitle: "Application details",
    preferredBreed: "Goldendoodle",
    processAgreement: "Understands process, pricing, deposit policy, and spay/neuter agreement",
    signature: "Codex Form Test"
  },
  {
    ...basePayload,
    formType: "guardian",
    formTitle: "Guardian Application",
    fencedYard: "Yes",
    guardianAgreement: "Understands guardian requirements and phone conversation before placement",
    guardianDistance: "Within 30 minutes",
    guardianType: "Female guardian",
    housing: "Own home",
    location: "Salado, Texas"
  },
  {
    ...basePayload,
    formType: "stud",
    formTitle: "Stud Inquiry",
    brucellosisStatus: "Will complete before service",
    femaleDogBreed: "Goldendoodle",
    femaleDogName: "Test Dam",
    studGoals: "Looking for a compatible Red Ranch Dogs stud.",
    studPolicyAgreement: "Understands negative brucellosis and payment timing requirements"
  },
  {
    ...basePayload,
    formType: "waitlist",
    formTitle: "Join Our Waitlist",
    preferredBreed: "Cavapoo"
  },
  {
    ...basePayload,
    formType: "newsletter",
    formTitle: "Puppy Alert Email"
  }
];

for (const payload of validPayloads) {
  const result = await post(payload);
  assert(result.statusCode === 200, `${payload.formType} should pass validation, received ${result.statusCode}`);
}

process.env.VERCEL_ENV = "production";
const unconfiguredProduction = await post({
  ...basePayload,
  formType: "newsletter",
  formTitle: "Puppy Alert Email"
});
assert(unconfiguredProduction.statusCode === 500, "production forms without email or sheet delivery should fail loudly");
assert(
  unconfiguredProduction.body.message.includes("not configured"),
  "unconfigured production response should explain that form delivery is not configured"
);
process.env.VERCEL_ENV = "preview";

const missingEmail = await post({ ...basePayload, email: "", formType: "contact" });
assert(missingEmail.statusCode === 400, "contact form without email should fail");
assert(missingEmail.body.message.includes("email"), "missing email response should mention email");

const invalidEmail = await post({ ...basePayload, email: "not-an-email", formType: "newsletter" });
assert(invalidEmail.statusCode === 400, "newsletter form with invalid email should fail");
assert(invalidEmail.body.message.includes("valid email"), "invalid email response should mention a valid email");

const missingApplicationAgreement = await post({
  ...basePayload,
  formType: "application",
  preferredBreed: "Goldendoodle",
  signature: "Codex Form Test"
});
assert(missingApplicationAgreement.statusCode === 400, "application without process agreement should fail");
assert(
  missingApplicationAgreement.body.message.includes("process agreement"),
  "missing agreement response should mention process agreement"
);

const spamTrap = await post({ ...basePayload, companyWebsite: "https://example.com", formType: "contact" });
assert(spamTrap.statusCode === 200, "honeypot submissions should return a soft success");

const malformedJson = await post("{");
assert(malformedJson.statusCode === 400, "malformed JSON should fail");

const wrongMethod = await request("GET", {});
assert(wrongMethod.statusCode === 405, "GET requests should fail with 405");

const originalFetch = globalThis.fetch;
const webhookRequests = [];
process.env.FORM_WEBHOOK_URL = "https://example.test/red-ranch-dogs-form-webhook";
process.env.VERCEL_ENV = "production";
globalThis.fetch = async (url, options = {}) => {
  webhookRequests.push({
    body: JSON.parse(options.body || "{}"),
    headers: options.headers,
    method: options.method,
    url
  });

  return { ok: true };
};

const richApplication = await post({
  ...basePayload,
  formType: "application",
  formTitle: "Application details",
  genderPreference: "No preference",
  hearAbout: "Instagram",
  homeDescription: "Family with children",
  pickupOrDelivery: "We can pick up in Salado, Texas",
  preferredBreed: "Goldendoodle, Cavapoo",
  processAgreement: "Understands process, pricing, deposit policy, and spay/neuter agreement",
  puppyFitNotes: "Looking for a steady family companion.",
  signature: "Codex Form Test",
  sizePreference: "Mini (15-35 lbs)",
  specificInterest: "Birdie + Waylon",
  timing: "Ready now"
});
assert(richApplication.statusCode === 200, "configured production application should submit successfully");
assert(webhookRequests.length === 1, "configured sheet logging should send one webhook request");
assert(webhookRequests[0].method === "POST", "sheet webhook should use POST");
assert(webhookRequests[0].headers["Content-Type"] === "application/json", "sheet webhook should send JSON");
assert(webhookRequests[0].body.formType === "application", "sheet webhook payload should preserve form type");
assert(webhookRequests[0].body.leadType === "Puppy Application", "sheet webhook payload should include lead type");
assert(
  webhookRequests[0].body.routingBucket === "Puppy applications",
  "sheet webhook payload should include the routing bucket"
);
assert(webhookRequests[0].body.replyPriority === "High", "sheet webhook payload should include reply priority");
assert(
  webhookRequests[0].body.recommendedNextStep.includes("Review puppy fit"),
  "sheet webhook payload should include a recommended next step"
);
assert(
  webhookRequests[0].body.leadSummary.includes("Goldendoodle, Cavapoo"),
  "sheet webhook payload should include a compact lead summary"
);
assert(
  webhookRequests[0].body.leadSummary.includes("Size: Mini (15-35 lbs)"),
  "sheet webhook payload should include size preference in the compact lead summary"
);
assert(
  webhookRequests[0].body.leadSummary.includes("Interest: Birdie + Waylon"),
  "sheet webhook payload should include specific puppy or litter interest in the compact lead summary"
);
assert(
  webhookRequests[0].body.leadSummary.includes("Pickup: We can pick up in Salado, Texas"),
  "sheet webhook payload should include pickup or delivery notes in the compact lead summary"
);
assert(
  webhookRequests[0].body.leadSummary.includes("Heard: Instagram"),
  "sheet webhook payload should include source attribution in the compact lead summary"
);
assert(
  webhookRequests[0].body.preferredBreed === "Goldendoodle, Cavapoo",
  "sheet webhook payload should preserve multi-value breed interest"
);
assert(
  webhookRequests[0].body.message.includes("Lead Routing"),
  "sheet webhook message should include the lead routing summary"
);
assert(
  webhookRequests[0].body.message.includes("Application Details"),
  "sheet webhook message should include the expanded application summary"
);
assert(
  webhookRequests[0].body.message.includes("How they heard about us: Instagram"),
  "sheet webhook message should include application detail fields"
);

delete process.env.FORM_WEBHOOK_URL;
process.env.RED_RANCH_BRIDGE_URL = "https://example.test/red-ranch-bridge";
process.env.RED_RANCH_BRIDGE_SECRET = "test-secret";
process.env.FORM_SHEET_ID = "test-form-sheet";
process.env.FORM_SHEET_NAME = "Website Leads";

const bridgeRequests = [];
globalThis.fetch = async (url, options = {}) => {
  const body = JSON.parse(options.body || "{}");

  bridgeRequests.push({
    body,
    headers: options.headers,
    method: options.method,
    url
  });

  if (body.action === "getSheetValues") {
    return {
      ok: true,
      text: async () => JSON.stringify({ ok: true, values: [] })
    };
  }

  if (body.action === "replaceSheet" || body.action === "appendRows") {
    return {
      ok: true,
      text: async () => JSON.stringify({ ok: true })
    };
  }

  return {
    ok: false,
    text: async () => JSON.stringify({ ok: false, error: `Unexpected bridge action: ${body.action}` })
  };
};

const bridgeNewsletter = await post({
  ...basePayload,
  formType: "newsletter",
  formTitle: "Puppy Alert Email"
});
assert(bridgeNewsletter.statusCode === 200, "bridge configured newsletter should submit successfully");
assert(
  bridgeRequests.map((request) => request.body.action).join(",") ===
    "getSheetValues,replaceSheet,appendRows,getSheetValues,replaceSheet,appendRows",
  "bridge logging should read and write both Website Leads and Lead Queue"
);

const replaceRequest = bridgeRequests.find(
  (request) => request.body.action === "replaceSheet" && request.body.sheetName === "Website Leads"
);
const appendRequest = bridgeRequests.find(
  (request) => request.body.action === "appendRows" && request.body.sheetName === "Website Leads"
);
const queueReplaceRequest = bridgeRequests.find(
  (request) => request.body.action === "replaceSheet" && request.body.sheetName === "Lead Queue"
);
const queueAppendRequest = bridgeRequests.find(
  (request) => request.body.action === "appendRows" && request.body.sheetName === "Lead Queue"
);

assert(replaceRequest.body.values[0].includes("Lead Type"), "bridge header row should include lead routing columns");
assert(appendRequest.body.spreadsheetId === "test-form-sheet", "bridge append should use configured sheet ID");
assert(appendRequest.body.sheetName === "Website Leads", "bridge append should use configured sheet name");
assert(appendRequest.body.values[0][4] === "Puppy Alert Signup", "bridge row should include lead type");
assert(
  appendRequest.body.values[0][9].includes("Codex Form Test"),
  "bridge row should include the compact lead summary"
);
assert(queueReplaceRequest.body.values[0].includes("Next Action"), "lead queue header row should include workflow columns");
assert(queueAppendRequest.body.spreadsheetId === "test-form-sheet", "lead queue append should use configured sheet ID");
assert(queueAppendRequest.body.values[0][9] === "Puppy Alert Signup", "lead queue row should include lead type");
assert(queueAppendRequest.body.values[0][15].includes("Codex Form Test"), "lead queue row should include lead summary");

process.env.FORM_WEBHOOK_URL = "https://example.test/red-ranch-dogs-form-webhook";

const fallbackRequests = [];
globalThis.fetch = async (url, options = {}) => {
  const body = JSON.parse(options.body || "{}");

  fallbackRequests.push({ body, url });

  if (String(url).includes("red-ranch-bridge")) {
    return {
      ok: true,
      text: async () => JSON.stringify({ ok: false, error: "Temporary bridge outage" })
    };
  }

  return { ok: true };
};

const webhookFallback = await post({
  ...basePayload,
  formType: "contact",
  inquiryType: "Fallback route test",
  message: "Codex bridge fallback test."
});
assert(webhookFallback.statusCode === 200, "webhook should rescue submissions when the bridge errors");
assert(
  fallbackRequests.some((request) => request.body.action === "getSheetValues"),
  "fallback test should attempt bridge logging first"
);
assert(
  fallbackRequests.some((request) => request.body.formType === "contact"),
  "fallback test should send the form payload to the legacy webhook"
);

delete process.env.RED_RANCH_BRIDGE_URL;
delete process.env.RED_RANCH_BRIDGE_SECRET;
delete process.env.FORM_SHEET_ID;
delete process.env.FORM_SHEET_NAME;
process.env.FORM_WEBHOOK_URL = "https://example.test/red-ranch-dogs-form-webhook";

globalThis.fetch = async () => ({ ok: false });
const failedSheetDelivery = await post({
  ...basePayload,
  formType: "newsletter",
  formTitle: "Puppy Alert Email"
});
assert(failedSheetDelivery.statusCode === 502, "failed sheet logging should return a delivery error");
assert(
  failedSheetDelivery.body.message.includes("Spreadsheet logging failed"),
  "failed sheet logging should explain the spreadsheet failure"
);

globalThis.fetch = originalFetch;
externalEnvKeys.forEach((key) => {
  delete process.env[key];
});
process.env.VERCEL_ENV = "preview";

console.log("Local form API handler smoke tests passed without sending external emails or sheet rows.");
