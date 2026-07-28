import { generateKeyPairSync, verify } from "node:crypto";
import handler from "../api/forms.js";

const externalEnvKeys = [
  "FORM_WEBHOOK_URL",
  "FORM_SHEET_ID",
  "FORM_SHEET_NAME",
  "RED_RANCH_BRIDGE_SECRET",
  "RED_RANCH_BRIDGE_URL",
  "RESEND_API_KEY",
  "FORM_TO_EMAIL",
  "FORM_FROM_EMAIL",
  "CRM_INTAKE_URL",
  "CRM_INTAKE_PRIVATE_KEY"
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
  firstGclid: "first-test-gclid",
  firstGbraid: "first-test-gbraid",
  firstLandingPage: "https://red-ranch-dogs-site.vercel.app/?utm_source=google&utm_medium=cpc&utm_campaign=tx_doodle_search&gclid=first-test-gclid",
  firstReferrer: "https://www.google.com/",
  firstUtmCampaign: "tx_doodle_search",
  firstUtmContent: "search_ad_a",
  firstUtmMedium: "cpc",
  firstUtmSource: "google",
  firstUtmTerm: "doodle puppies texas",
  firstWbraid: "first-test-wbraid",
  gclid: "last-test-gclid",
  gbraid: "last-test-gbraid",
  landingPage: "https://red-ranch-dogs-site.vercel.app/?utm_source=codex&utm_medium=handler&utm_campaign=forms",
  lastGclid: "last-test-gclid",
  lastGbraid: "last-test-gbraid",
  lastLandingPage: "https://red-ranch-dogs-site.vercel.app/apply?utm_source=google&utm_medium=cpc&utm_campaign=tx_doodle_search&gclid=last-test-gclid",
  lastReferrer: "https://www.redranchdogs.com/puppies/current-litters",
  lastUtmCampaign: "tx_doodle_search",
  lastUtmContent: "search_ad_b",
  lastUtmMedium: "cpc",
  lastUtmSource: "google",
  lastUtmTerm: "cavapoo puppies texas",
  lastWbraid: "last-test-wbraid",
  message: "Codex local handler smoke test.",
  name: "Codex Form Test",
  page: "/codex-form-handler-test",
  phone: "555-0103",
  preferredContactMethod: "Text",
  referrer: "Codex local smoke test",
  source: "local-handler-smoke-test",
  submittedAt: new Date().toISOString(),
  submissionId: `codex-handler-${Date.now()}`,
  utmCampaign: "forms",
  utmContent: "handler_fixture",
  utmMedium: "handler",
  utmSource: "codex",
  utmTerm: "form attribution test",
  userAgent: "Codex local test",
  wbraid: "last-test-wbraid"
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
  assert(result.body.submissionId === payload.submissionId, `${payload.formType} response should return submission ID`);
  assert(result.body.formType === payload.formType, `${payload.formType} response should return form type`);
  assert(result.body.leadType, `${payload.formType} response should return lead type`);
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

const missingContactMessage = await post({ ...basePayload, formType: "contact", message: "" });
assert(missingContactMessage.statusCode === 400, "contact form without a message should fail");
assert(missingContactMessage.body.message.includes("message"), "missing contact message response should mention message");

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
assert(webhookRequests[0].body.gclid === "last-test-gclid", "sheet webhook payload should preserve Google click ID");
assert(
  webhookRequests[0].body.firstLandingPage.includes("utm_source=google"),
  "sheet webhook payload should preserve first landing page"
);
assert(
  webhookRequests[0].body.firstUtmSource === "google",
  "sheet webhook payload should preserve first-touch source"
);
assert(
  webhookRequests[0].body.lastUtmTerm === "cavapoo puppies texas",
  "sheet webhook payload should preserve last-touch keyword"
);
assert(
  webhookRequests[0].body.preferredBreed === "Goldendoodle, Cavapoo",
  "sheet webhook payload should preserve multi-value breed interest"
);
assert(
  webhookRequests[0].body.message === "Codex local handler smoke test.",
  "sheet webhook message should keep the raw family-entered message"
);

delete process.env.FORM_WEBHOOK_URL;
process.env.RESEND_API_KEY = "test-resend-key";
process.env.FORM_TO_EMAIL = "team@example.test";
process.env.FORM_FROM_EMAIL = "Red Ranch Dogs <forms@example.test>";
const emailRequests = [];
globalThis.fetch = async (url, options = {}) => {
  emailRequests.push({
    body: JSON.parse(options.body || "{}"),
    headers: options.headers,
    method: options.method,
    url
  });

  return { ok: true };
};

const emailOnlyApplication = await post({
  ...basePayload,
  formType: "application",
  formTitle: "Application details",
  hearAbout: "Instagram",
  preferredBreed: "Goldendoodle, Cavapoo",
  processAgreement: "Understands process, pricing, deposit policy, and spay/neuter agreement",
  signature: "Codex Form Test"
});
assert(emailOnlyApplication.statusCode === 200, "email-only configured application should submit successfully");
assert(emailRequests.length === 1, "email-only path should send one email request");
assert(emailRequests[0].body.text.includes("Lead Routing"), "notification email should include routing details");
assert(emailRequests[0].body.text.includes("Application Details"), "notification email should include expanded application details");
assert(
  emailRequests[0].body.text.includes("How they heard about us: Instagram"),
  "notification email should include expanded detail fields"
);

process.env.CRM_INTAKE_URL = "https://crm.example.test/api/intake/website-application";
const crmWebsiteEventUrl = "https://crm.example.test/api/intake/website-event";
const crmIntakeTestKeys = generateKeyPairSync("ed25519");
process.env.CRM_INTAKE_PRIVATE_KEY = crmIntakeTestKeys.privateKey.export({ type: "pkcs8", format: "der" }).toString("base64");
const directIntakeRequests = [];
globalThis.fetch = async (url, options = {}) => {
  directIntakeRequests.push({
    body: options.body || "",
    headers: options.headers || {},
    method: options.method,
    signal: options.signal,
    url: String(url)
  });
  return { ok: true, status: 200 };
};

const directIntakeApplication = await post({
  ...basePayload,
  submissionId: `codex-direct-intake-${Date.now()}`,
  formType: "application",
  formTitle: "Application details",
  preferredBreed: "Cavapoo",
  processAgreement: "Understands process, pricing, deposit policy, and spay/neuter agreement",
  signature: "Codex Form Test"
});
assert(directIntakeApplication.statusCode === 200, "signed CRM intake should preserve public application success");
assert(directIntakeRequests.length === 2, "application should preserve email and add one direct CRM delivery");
const crmRequest = directIntakeRequests.find((request) => request.url === crmWebsiteEventUrl);
assert(crmRequest, "application should call the current CRM website-event endpoint");
assert(crmRequest.method === "POST", "CRM intake should use POST");
assert(crmRequest.signal, "CRM intake should use a bounded request signal");
const crmTimestamp = crmRequest.headers["X-Red-Ranch-Timestamp"];
const actualCrmSignature = globalThis.Buffer.from(crmRequest.headers["X-Red-Ranch-Signature"].replace(/^ed25519=/, ""), "base64");
assert(
  verify(null, globalThis.Buffer.from(`${crmTimestamp}.${crmRequest.body}`), crmIntakeTestKeys.publicKey, actualCrmSignature),
  "CRM intake payload should carry a valid Ed25519 signature"
);
const directApplicationPayload = JSON.parse(crmRequest.body);
assert(directApplicationPayload.formType === "application", "CRM intake should receive the normalized application payload");
assert(
  directApplicationPayload.eventId === directApplicationPayload.submissionId,
  "CRM application delivery should use submissionId as the stable eventId"
);
assert(
  directIntakeRequests.filter((request) => request.url === "https://api.resend.com/emails").length === 1,
  "application should retain exactly one existing email-notification request"
);

const directIntakeNewsletter = await post({
  ...basePayload,
  submissionId: `codex-direct-newsletter-${Date.now()}`,
  formType: "newsletter",
  formTitle: "Puppy Alert Email",
  preferredBreed: "Goldendoodle"
});
assert(directIntakeNewsletter.statusCode === 200, "signed CRM intake should preserve public Puppy Alert success");
const newsletterCrmRequests = directIntakeRequests
  .filter((request) => request.url === crmWebsiteEventUrl)
  .filter((request) => JSON.parse(request.body).formType === "newsletter");
assert(newsletterCrmRequests.length === 1, "Puppy Alert should add one direct CRM delivery");
const directNewsletterPayload = JSON.parse(newsletterCrmRequests[0].body);
assert(
  directNewsletterPayload.eventId === directNewsletterPayload.submissionId,
  "CRM Puppy Alert delivery should use submissionId as the stable eventId"
);
assert(
  directIntakeRequests.filter((request) => request.url === "https://api.resend.com/emails").length === 2,
  "application and Puppy Alert should each retain one existing email-notification request"
);

const transientCrmRequests = [];
const transientNotificationRequests = [];
globalThis.fetch = async (url, options = {}) => {
  const requestUrl = String(url);
  if (requestUrl === crmWebsiteEventUrl) {
    transientCrmRequests.push({
      body: options.body || "",
      headers: options.headers || {},
      url: requestUrl
    });
    return transientCrmRequests.length === 1
      ? { ok: false, status: 503 }
      : { ok: true, status: 201 };
  }
  transientNotificationRequests.push(requestUrl);
  return { ok: true, status: 200 };
};
const transientCrmApplication = await post({
  ...basePayload,
  submissionId: `codex-direct-intake-retry-${Date.now()}`,
  formType: "application",
  formTitle: "Application details",
  preferredBreed: "Goldendoodle",
  processAgreement: "Understands process, pricing, deposit policy, and spay/neuter agreement",
  signature: "Codex Form Test"
});
assert(transientCrmApplication.statusCode === 200, "transient CRM retry should preserve public application success");
assert(transientCrmRequests.length === 2, "transient CRM failure should make one bounded retry");
assert(
  transientCrmRequests[0].body === transientCrmRequests[1].body,
  "CRM retry should preserve the exact serialized request body"
);
assert(
  transientCrmRequests[0].headers["X-Red-Ranch-Timestamp"] !==
    transientCrmRequests[1].headers["X-Red-Ranch-Timestamp"],
  "CRM retry should use a fresh signature timestamp"
);
transientCrmRequests.forEach((request) => {
  const signature = globalThis.Buffer.from(
    request.headers["X-Red-Ranch-Signature"].replace(/^ed25519=/, ""),
    "base64"
  );
  assert(
    verify(
      null,
      globalThis.Buffer.from(`${request.headers["X-Red-Ranch-Timestamp"]}.${request.body}`),
      crmIntakeTestKeys.publicKey,
      signature
    ),
    "each CRM retry should carry a valid fresh Ed25519 signature"
  );
});
assert(
  transientNotificationRequests.filter((url) => url === "https://api.resend.com/emails").length === 1,
  "CRM retries must not duplicate the existing notification path"
);

const failedCrmRequests = [];
const failedCrmNotificationRequests = [];
globalThis.fetch = async (url) => {
  const requestUrl = String(url);
  if (requestUrl === crmWebsiteEventUrl) {
    failedCrmRequests.push(requestUrl);
    return { ok: false, status: 503 };
  }
  failedCrmNotificationRequests.push(requestUrl);
  return { ok: true, status: 200 };
};
const crmFailureEmailSuccess = await post({
  ...basePayload,
  submissionId: `codex-direct-intake-fallback-${Date.now()}`,
  formType: "application",
  formTitle: "Application details",
  preferredBreed: "Goldendoodle",
  processAgreement: "Understands process, pricing, deposit policy, and spay/neuter agreement",
  signature: "Codex Form Test"
});
assert(
  crmFailureEmailSuccess.statusCode === 200,
  "CRM intake failure must not reject an application delivered through existing email"
);
assert(failedCrmRequests.length === 2, "persistent transient CRM failure should stop after one retry");
assert(
  failedCrmNotificationRequests.filter((url) => url === "https://api.resend.com/emails").length === 1,
  "persistent CRM failure must not duplicate the existing notification path"
);
delete process.env.CRM_INTAKE_URL;
delete process.env.CRM_INTAKE_PRIVATE_KEY;
delete process.env.RESEND_API_KEY;
delete process.env.FORM_TO_EMAIL;
delete process.env.FORM_FROM_EMAIL;

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
  formTitle: "Puppy Alert Email",
  preferredBreed: "Goldendoodle, Cavapoo"
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
assert(replaceRequest.body.values[0].includes("Google Click ID"), "bridge header row should include Google click ID");
assert(replaceRequest.body.values[0].includes("GBRAID"), "bridge header row should include GBRAID");
assert(replaceRequest.body.values[0].includes("WBRAID"), "bridge header row should include WBRAID");
assert(
  replaceRequest.body.values[0].includes("Preferred Contact Method"),
  "bridge header row should include preferred contact method"
);
assert(replaceRequest.body.values[0].includes("First Landing Page"), "bridge header row should include first-touch attribution");
assert(replaceRequest.body.values[0].includes("First UTM Source"), "bridge header row should include first-touch UTM source");
assert(replaceRequest.body.values[0].includes("Last UTM Source"), "bridge header row should include last-touch attribution");
assert(
  replaceRequest.body.values[0].indexOf("Google Click ID") >
    replaceRequest.body.values[0].indexOf("User Agent"),
  "new attribution columns should be appended after historical form columns"
);
assert(appendRequest.body.spreadsheetId === "test-form-sheet", "bridge append should use configured sheet ID");
assert(appendRequest.body.sheetName === "Website Leads", "bridge append should use configured sheet name");
const websiteLeadHeaders = replaceRequest.body.values[0];
const websiteLeadRow = appendRequest.body.values[0];
function websiteLeadValue(header) {
  const index = websiteLeadHeaders.indexOf(header);
  assert(index !== -1, `Website Leads header should include ${header}`);
  return websiteLeadRow[index];
}
assert(websiteLeadValue("Lead Type") === "Puppy Alert Signup", "bridge row should include lead type");
assert(
  websiteLeadValue("Lead Summary").includes("Codex Form Test"),
  "bridge row should include the compact lead summary"
);
assert(websiteLeadValue("Name") === "Codex Form Test", "bridge row should preserve the contact name");
assert(websiteLeadValue("Preferred Contact Method") === "Text", "bridge row should include preferred contact method");
assert(
  websiteLeadRow.includes("Goldendoodle, Cavapoo"),
  "bridge newsletter row should preserve checked breed interests"
);
assert(websiteLeadValue("Google Click ID") === "last-test-gclid", "bridge row should include Google click ID");
assert(websiteLeadValue("GBRAID") === "last-test-gbraid", "bridge row should include GBRAID");
assert(websiteLeadValue("WBRAID") === "last-test-wbraid", "bridge row should include WBRAID");
assert(websiteLeadValue("First Landing Page").includes("utm_source=google"), "bridge row should include first landing page");
assert(queueReplaceRequest.body.values[0].includes("Next Action"), "lead queue header row should include workflow columns");
assert(queueAppendRequest.body.spreadsheetId === "test-form-sheet", "lead queue append should use configured sheet ID");
assert(queueAppendRequest.body.values[0][9] === "Puppy Alert Signup", "lead queue row should include lead type");
assert(queueAppendRequest.body.values[0][15].includes("Codex Form Test"), "lead queue row should include lead summary");

delete process.env.FORM_WEBHOOK_URL;
const mismatchBridgeActions = [];
globalThis.fetch = async (url, options = {}) => {
  const body = JSON.parse(options.body || "{}");
  mismatchBridgeActions.push(body.action);

  if (body.action === "getSheetValues") {
    return {
      ok: true,
      text: async () =>
        JSON.stringify({
          ok: true,
          values: [
            ["Submitted At", "Old Header"],
            ["2026-06-10T00:00:00.000Z", "Existing lead row"]
          ]
        })
    };
  }

  if (body.action === "replaceSheet") {
    return {
      ok: false,
      text: async () => JSON.stringify({ ok: false, error: "replaceSheet should not run on non-empty sheets" })
    };
  }

  return {
    ok: true,
    text: async () => JSON.stringify({ ok: true })
  };
};

const headerMismatch = await post({
  ...basePayload,
  formType: "newsletter",
  formTitle: "Puppy Alert Email"
});
assert(headerMismatch.statusCode === 502, "header mismatch on an existing sheet should fail closed");
assert(
  !mismatchBridgeActions.includes("replaceSheet"),
  "header mismatch with existing rows must not trigger destructive replaceSheet"
);

process.env.FORM_WEBHOOK_URL = "https://example.test/red-ranch-dogs-form-webhook";

let bridgeOnlyWebhookCalls = 0;
globalThis.fetch = async (url, options = {}) => {
  const body = JSON.parse(options.body || "{}");

  if (!String(url).includes("red-ranch-bridge")) {
    bridgeOnlyWebhookCalls += 1;
    return { ok: true };
  }

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

const bridgePreferred = await post({
  ...basePayload,
  formType: "contact",
  inquiryType: "Bridge preferred route test"
});
assert(bridgePreferred.statusCode === 200, "bridge should remain the primary route when webhook is also configured");
assert(bridgeOnlyWebhookCalls === 0, "legacy webhook should not run after a successful bridge write");

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
  failedSheetDelivery.body.message === "Unable to submit right now. Please call or text us, and we can help.",
  "failed sheet logging should return a generic friendly delivery message"
);

process.env.RESEND_API_KEY = "test-resend-key";
process.env.FORM_TO_EMAIL = "team@example.test";
process.env.FORM_FROM_EMAIL = "Red Ranch Dogs <forms@example.test>";
process.env.FORM_WEBHOOK_URL = "https://example.test/red-ranch-dogs-form-webhook";

globalThis.fetch = async (url) => {
  if (String(url).includes("api.resend.com")) {
    return { ok: false };
  }

  return { ok: true };
};

const emailFailureSheetSuccess = await post({
  ...basePayload,
  formType: "contact",
  inquiryType: "Partial delivery test",
  message: "The sheet can still receive this submission."
});
assert(
  emailFailureSheetSuccess.statusCode === 200,
  "sheet delivery should prevent duplicate-resubmission error when email delivery fails"
);

globalThis.fetch = async (url) => {
  if (String(url).includes("api.resend.com")) {
    return { ok: true };
  }

  return { ok: false };
};

const sheetFailureEmailSuccess = await post({
  ...basePayload,
  formType: "contact",
  inquiryType: "Partial delivery test",
  message: "Email can still receive this submission."
});
assert(
  sheetFailureEmailSuccess.statusCode === 200,
  "email delivery should prevent duplicate-resubmission error when sheet delivery fails"
);

globalThis.fetch = originalFetch;
externalEnvKeys.forEach((key) => {
  delete process.env[key];
});
process.env.VERCEL_ENV = "preview";

console.log("Local form API handler smoke tests passed without sending external emails or sheet rows.");
