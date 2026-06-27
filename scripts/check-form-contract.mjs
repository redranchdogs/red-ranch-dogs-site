import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const appPath = path.join(rootDir, "src/App.jsx");
const apiPath = path.join(rootDir, "api/forms.js");
const appsScriptPath = path.join(rootDir, "scripts/google-apps-script.js");
const testPath = path.join(rootDir, "scripts/test-form-api-handler.mjs");
const packagePath = path.join(rootDir, "package.json");

const appSource = fs.readFileSync(appPath, "utf8");
const apiSource = fs.readFileSync(apiPath, "utf8");
const appsScriptSource = fs.readFileSync(appsScriptPath, "utf8");
const testSource = fs.readFileSync(testPath, "utf8");
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

const publicFormTypes = ["application", "contact", "guardian", "newsletter", "stud"];
const apiFormTypes = [...publicFormTypes, "waitlist"];
const attributionFields = [
  "submittedAt",
  "submissionId",
  "page",
  "currentUrl",
  "landingPage",
  "referrer",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmContent",
  "utmTerm",
  "gclid",
  "gbraid",
  "wbraid",
  "firstLandingPage",
  "firstReferrer",
  "firstUtmSource",
  "firstUtmMedium",
  "firstUtmCampaign",
  "firstUtmContent",
  "firstUtmTerm",
  "firstGclid",
  "firstGbraid",
  "firstWbraid",
  "lastLandingPage",
  "lastReferrer",
  "lastUtmSource",
  "lastUtmMedium",
  "lastUtmCampaign",
  "lastUtmContent",
  "lastUtmTerm",
  "lastGclid",
  "lastGbraid",
  "lastWbraid",
  "source",
  "userAgent"
];

const blockerMessages = [];

function addBlocker(condition, message) {
  if (!condition) {
    blockerMessages.push(message);
  }
}

function extractQuotedArray(source, declarationName) {
  const declarationIndex = source.indexOf(declarationName);
  if (declarationIndex === -1) return [];

  const openIndex = source.indexOf("[", declarationIndex);
  const closeIndex = source.indexOf("];", openIndex);
  if (openIndex === -1 || closeIndex === -1) return [];

  return Array.from(source.slice(openIndex, closeIndex).matchAll(/"([^"]+)"/g), (match) => match[1]);
}

function extractLeadFormTypes() {
  return Array.from(appSource.matchAll(/<LeadForm\b[^>]*\bformType="([^"]+)"/g), (match) => match[1]).sort();
}

function extractAllowedForms() {
  const allowedFormsMatch = apiSource.match(/allowedForms\s*=\s*new Set\(\[([\s\S]*?)\]\)/);
  if (!allowedFormsMatch) return [];

  return Array.from(allowedFormsMatch[1].matchAll(/"([^"]+)"/g), (match) => match[1]).sort();
}

function describeList(values) {
  return values.length ? values.join(", ") : "(none)";
}

function sameMembers(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

const renderedFormTypes = extractLeadFormTypes();
const allowedFormTypes = extractAllowedForms();
const apiSubmissionKeys = extractQuotedArray(apiSource, "submissionHeaderKeys");
const appsScriptHeaders = extractQuotedArray(appsScriptSource, "SUBMISSION_HEADERS");

addBlocker(
  sameMembers(renderedFormTypes, [...publicFormTypes].sort()),
  `Public LeadForm types drifted. Expected ${describeList(publicFormTypes)}, found ${describeList(renderedFormTypes)}.`
);
addBlocker(
  sameMembers(allowedFormTypes, [...apiFormTypes].sort()),
  `API allowed form types drifted. Expected ${describeList(apiFormTypes)}, found ${describeList(allowedFormTypes)}.`
);

apiFormTypes.forEach((formType) => {
  addBlocker(
    apiSource.includes(`${formType}: {`),
    `api/forms.js is missing leadRoutingByForm.${formType}.`
  );
  addBlocker(
    testSource.includes(`formType: "${formType}"`),
    `scripts/test-form-api-handler.mjs does not exercise the ${formType} form type.`
  );
});

const frontendTrackingMarkers = [
  'utm_source: "utmSource"',
  'utm_medium: "utmMedium"',
  'utm_campaign: "utmCampaign"',
  'utm_content: "utmContent"',
  'utm_term: "utmTerm"',
  'gclid: "gclid"',
  'gbraid: "gbraid"',
  'wbraid: "wbraid"',
  "collectTrackingPayload()",
  "captureCurrentAttribution()",
  '<input type="hidden" name="source" value="red-ranch-dogs-site" />',
  'fetch("/api/forms"'
];

frontendTrackingMarkers.forEach((marker) => {
  addBlocker(appSource.includes(marker), `src/App.jsx is missing frontend form marker: ${marker}`);
});

attributionFields.forEach((field) => {
  addBlocker(
    apiSubmissionKeys.includes(field),
    `api/forms.js submissionHeaderKeys is missing ${field}.`
  );
  addBlocker(apiSource.includes(`${field}: clean(body.${field})`) || field === "submittedAt", `api/forms.js payload is missing body.${field}.`);
  addBlocker(
    appsScriptSource.includes(`payload.${field}`),
    `scripts/google-apps-script.js append row is missing payload.${field}.`
  );
  addBlocker(
    testSource.includes(field),
    `scripts/test-form-api-handler.mjs fixture/assertions do not mention ${field}.`
  );
});

[
  "Google Click ID",
  "GBRAID",
  "WBRAID",
  "First Landing Page",
  "First UTM Source",
  "Last UTM Source"
].forEach((header) => {
  addBlocker(appsScriptHeaders.includes(header), `Google Apps Script headers are missing ${header}.`);
  addBlocker(testSource.includes(header), `Form handler tests do not assert the ${header} column.`);
});

addBlocker(
  packageJson.scripts?.["test:forms"] === "node scripts/test-form-api-handler.mjs",
  'package.json is missing the "test:forms" local handler smoke test.'
);
addBlocker(
  packageJson.scripts?.["publish:check"]?.includes("npm run check:form-contract"),
  'package.json publish:check must run "npm run check:form-contract".'
);

if (blockerMessages.length) {
  console.error("Form contract check failed:");
  blockerMessages.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(
  `Form contract check passed: ${publicFormTypes.length} public forms, ${apiFormTypes.length} API form types, and ${attributionFields.length} tracking fields stay aligned.`
);
