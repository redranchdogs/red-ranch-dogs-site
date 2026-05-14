const allowedForms = new Set(["application", "contact", "guardian", "newsletter", "stud", "waitlist"]);
const defaultFormSheetId = "1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE";
const defaultLeadSheetName = "Website Leads";
const leadQueueSheetName = "Lead Queue";

const submissionHeaders = [
  "Submitted At",
  "Submission ID",
  "Form Type",
  "Form Title",
  "Lead Type",
  "Lead Label",
  "Routing Bucket",
  "Reply Priority",
  "Recommended Next Step",
  "Lead Summary",
  "Page",
  "Current URL",
  "Landing Page",
  "Referrer",
  "UTM Source",
  "UTM Medium",
  "UTM Campaign",
  "UTM Content",
  "UTM Term",
  "Name",
  "Email",
  "Phone",
  "Inquiry Type",
  "Preferred Breed",
  "Program Name",
  "Preferred Stud",
  "Service Type",
  "Cycle Timing",
  "Female Dog Name",
  "Female Dog Breed",
  "Brucellosis Status",
  "Stud Goals",
  "Stud Policy Agreement",
  "Guardian Type",
  "Guardian Distance",
  "Location",
  "Housing",
  "Fenced Yard",
  "Children In Home",
  "Other Pets",
  "Dog Experience",
  "Gender Preference",
  "Size Preference",
  "Timing",
  "Specific Interest",
  "Home Description",
  "Puppy Fit Notes",
  "Pickup Or Delivery",
  "Process Agreement",
  "Hear About",
  "Guardian Reason",
  "Phone Call Timing",
  "Guardian Agreement",
  "Signature",
  "Message",
  "Source",
  "User Agent"
];

const submissionHeaderKeys = [
  "submittedAt",
  "submissionId",
  "formType",
  "formTitle",
  "leadType",
  "leadLabel",
  "routingBucket",
  "replyPriority",
  "recommendedNextStep",
  "leadSummary",
  "page",
  "currentUrl",
  "landingPage",
  "referrer",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmContent",
  "utmTerm",
  "name",
  "email",
  "phone",
  "inquiryType",
  "preferredBreed",
  "programName",
  "preferredStud",
  "serviceType",
  "cycleTiming",
  "femaleDogName",
  "femaleDogBreed",
  "brucellosisStatus",
  "studGoals",
  "studPolicyAgreement",
  "guardianType",
  "guardianDistance",
  "location",
  "housing",
  "fencedYard",
  "childrenInHome",
  "otherPets",
  "dogExperience",
  "genderPreference",
  "sizePreference",
  "timing",
  "specificInterest",
  "homeDescription",
  "puppyFitNotes",
  "pickupOrDelivery",
  "processAgreement",
  "hearAbout",
  "guardianReason",
  "phoneCallTiming",
  "guardianAgreement",
  "signature",
  "message",
  "source",
  "userAgent"
];

const leadQueueHeaders = [
  "Status",
  "Follow Up Date",
  "Owner",
  "Next Action",
  "Outcome",
  "Submitted At",
  "Name",
  "Email",
  "Phone",
  "Lead Type",
  "Priority",
  "Breed / Interest",
  "Timing",
  "Location",
  "Recommended Next Step",
  "Lead Summary",
  "Submission ID",
  "Notes"
];

const formLabels = {
  application: "puppy application",
  contact: "contact form",
  guardian: "guardian application",
  newsletter: "puppy alert signup",
  stud: "stud inquiry",
  waitlist: "waitlist note"
};

const leadRoutingByForm = {
  application: {
    leadType: "Puppy Application",
    leadLabel: "Puppy application",
    routingBucket: "Puppy applications",
    replyPriority: "High",
    nextStep: "Review puppy fit, availability, and waitlist timing."
  },
  contact: {
    leadType: "Website Contact",
    leadLabel: "Website contact",
    routingBucket: "General inquiries",
    replyPriority: "Normal",
    nextStep: "Reply to the family's question or route it to the right follow-up."
  },
  guardian: {
    leadType: "Guardian Application",
    leadLabel: "Guardian application",
    routingBucket: "Guardian program",
    replyPriority: "High",
    nextStep: "Review location, fenced yard, housing, and schedule fit before a phone call."
  },
  newsletter: {
    leadType: "Puppy Alert Signup",
    leadLabel: "Puppy alert signup",
    routingBucket: "Email list",
    replyPriority: "Low",
    nextStep: "Add this family to puppy alert updates."
  },
  stud: {
    leadType: "Stud Inquiry",
    leadLabel: "Stud inquiry",
    routingBucket: "Stud services",
    replyPriority: "High",
    nextStep: "Review preferred stud, cycle timing, brucellosis status, and service type."
  },
  waitlist: {
    leadType: "Waitlist Interest",
    leadLabel: "Waitlist interest",
    routingBucket: "Waitlist",
    replyPriority: "High",
    nextStep: "Confirm preferred breed and explain deposit and waitlist timing."
  }
};

const requiredFieldsByForm = {
  application: [
    ["name", "name"],
    ["email", "email"],
    ["phone", "phone number"],
    ["preferredBreed", "breed interest"],
    ["processAgreement", "process agreement"],
    ["signature", "electronic signature"]
  ],
  contact: [
    ["name", "name"],
    ["email", "email"],
    ["message", "message"]
  ],
  guardian: [
    ["name", "name"],
    ["email", "email"],
    ["phone", "phone number"],
    ["location", "city or area"],
    ["guardianType", "guardian interest"],
    ["guardianDistance", "distance from Salado"],
    ["housing", "housing"],
    ["fencedYard", "fenced yard"],
    ["guardianAgreement", "guardian agreement"]
  ],
  newsletter: [["email", "email"]],
  stud: [
    ["name", "name"],
    ["email", "email"],
    ["phone", "phone number"],
    ["femaleDogName", "female dog name"],
    ["femaleDogBreed", "female dog breed"],
    ["brucellosisStatus", "brucellosis status"],
    ["studGoals", "what you are looking for"],
    ["studPolicyAgreement", "stud policy agreement"]
  ],
  waitlist: [
    ["name", "name"],
    ["email", "email"],
    ["preferredBreed", "breed interest"]
  ]
};

function clean(value) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 4000);
}

function createSubmissionId() {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }

  return `rrd-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function submissionText(payload) {
  return Object.entries(payload)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function submissionRow(payload) {
  return submissionHeaderKeys.map((key) => payload[key] || "");
}

function leadQueueInterest(payload) {
  return (
    payload.preferredBreed ||
    payload.programName ||
    payload.preferredStud ||
    payload.specificInterest ||
    payload.inquiryType ||
    ""
  );
}

function leadQueueRow(payload) {
  return [
    "",
    "",
    "",
    "",
    "",
    payload.submittedAt || "",
    payload.name || "",
    payload.email || "",
    payload.phone || "",
    payload.leadType || payload.formType || "",
    payload.replyPriority || "",
    leadQueueInterest(payload),
    payload.timing || payload.cycleTiming || payload.phoneCallTiming || "",
    payload.location || "",
    payload.recommendedNextStep || "",
    payload.leadSummary || "",
    payload.submissionId || "",
    ""
  ];
}

function headersMatch(values, expectedHeaders = submissionHeaders) {
  const firstRow = values?.[0] || [];
  return (
    firstRow.length === expectedHeaders.length &&
    expectedHeaders.every((header, index) => firstRow[index] === header)
  );
}

async function ensureSheetHeaders(spreadsheetId, sheetName, headers) {
  const currentSheet = await postBridge({
    action: "getSheetValues",
    spreadsheetId,
    sheetName
  });

  if (!headersMatch(currentSheet.values || [], headers)) {
    await postBridge({
      action: "replaceSheet",
      spreadsheetId,
      sheetName,
      values: [headers]
    });
  }
}

async function postBridge(payload) {
  const response = await fetch(process.env.RED_RANCH_BRIDGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.RED_RANCH_BRIDGE_SECRET,
      ...payload
    })
  });
  const text = await response.text();

  let body;

  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`Bridge returned non-JSON response: ${text.slice(0, 120)}`);
  }

  if (!response.ok || !body.ok) {
    throw new Error(body.error || "Bridge sheet logging failed.");
  }

  return body;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePayload(payload) {
  const requiredFields = requiredFieldsByForm[payload.formType] || [["email", "email"]];
  const missingLabels = requiredFields
    .filter(([key]) => !payload[key])
    .map(([, label]) => label);

  if (missingLabels.length > 0) {
    return `Please add ${missingLabels.join(", ")} before submitting this ${formLabels[payload.formType] || "form"}.`;
  }

  if (!isValidEmail(payload.email)) {
    return "Please enter a valid email address before submitting.";
  }

  return "";
}

function routingFor(formType) {
  return (
    leadRoutingByForm[formType] || {
      leadType: "Website Lead",
      leadLabel: "Website lead",
      routingBucket: "General inquiries",
      replyPriority: "Normal",
      nextStep: "Review and route to the right follow-up."
    }
  );
}

function summaryItem(label, value, maxLength = 180) {
  const cleaned = clean(value);
  if (!cleaned) return "";
  const trimmed = cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 1).trim()}...` : cleaned;
  return label ? `${label}: ${trimmed}` : trimmed;
}

function compactLeadSummary(payload) {
  const summaryParts = [
    summaryItem("", payload.name),
    summaryItem("Email", payload.email),
    summaryItem("Phone", payload.phone),
    summaryItem("Breed", payload.preferredBreed),
    summaryItem("Size", payload.sizePreference),
    summaryItem("Timing", payload.timing),
    summaryItem("Interest", payload.specificInterest),
    summaryItem("Inquiry", payload.inquiryType),
    summaryItem("Pickup", payload.pickupOrDelivery),
    summaryItem("Preferred stud", payload.preferredStud),
    summaryItem("Service", payload.serviceType),
    summaryItem("Cycle", payload.cycleTiming),
    summaryItem("Female", payload.femaleDogName),
    summaryItem("Female breed", payload.femaleDogBreed),
    summaryItem("Brucellosis", payload.brucellosisStatus),
    summaryItem("Stud goals", payload.studGoals),
    summaryItem("Guardian", payload.guardianType),
    summaryItem("Distance", payload.guardianDistance),
    summaryItem("Housing", payload.housing),
    summaryItem("Fence", payload.fencedYard),
    summaryItem("Guardian note", payload.guardianReason || payload.dogExperience),
    summaryItem("Heard", payload.hearAbout),
    summaryItem("Location", payload.location),
    summaryItem("Note", payload.message)
  ].filter(Boolean);

  return summaryParts.join(" | ");
}

const detailFieldsByForm = {
  application: [
    ["Preferred breed", "preferredBreed"],
    ["Gender preference", "genderPreference"],
    ["Size preference", "sizePreference"],
    ["Timing", "timing"],
    ["Specific interest", "specificInterest"],
    ["Home description", "homeDescription"],
    ["Puppy fit notes", "puppyFitNotes"],
    ["Pickup or delivery", "pickupOrDelivery"],
    ["Process agreement", "processAgreement"],
    ["How they heard about us", "hearAbout"],
    ["Signature", "signature"]
  ],
  contact: [
    ["Inquiry type", "inquiryType"],
    ["Preferred breed", "preferredBreed"],
    ["Location", "location"]
  ],
  guardian: [
    ["Guardian interest", "guardianType"],
    ["Distance from Salado", "guardianDistance"],
    ["Preferred breed", "preferredBreed"],
    ["Location", "location"],
    ["Housing", "housing"],
    ["Fenced yard", "fencedYard"],
    ["Children in home", "childrenInHome"],
    ["Other pets", "otherPets"],
    ["Dog experience", "dogExperience"],
    ["Guardian reason", "guardianReason"],
    ["Phone call timing", "phoneCallTiming"],
    ["Guardian agreement", "guardianAgreement"]
  ],
  stud: [
    ["Program / kennel", "programName"],
    ["Preferred stud", "preferredStud"],
    ["Service type", "serviceType"],
    ["Cycle timing", "cycleTiming"],
    ["Female dog name", "femaleDogName"],
    ["Female dog breed", "femaleDogBreed"],
    ["Brucellosis status", "brucellosisStatus"],
    ["Stud goals", "studGoals"],
    ["Stud policy agreement", "studPolicyAgreement"]
  ]
};

function expandedMessage(payload) {
  const originalMessage = payload.message;
  const routingDetails = [
    ["Lead type", "leadType"],
    ["Routing bucket", "routingBucket"],
    ["Reply priority", "replyPriority"],
    ["Recommended next step", "recommendedNextStep"],
    ["Lead summary", "leadSummary"]
  ]
    .map(([label, key]) => [label, payload[key]])
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
  const fields = detailFieldsByForm[payload.formType];

  if (!fields) {
    return [routingDetails && `Lead Routing:\n${routingDetails}`, originalMessage].filter(Boolean).join("\n\n");
  }

  const details = fields
    .map(([label, key]) => [label, payload[key]])
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  const heading = payload.formType === "application" ? "Application Details" : "Submission Details";
  return [
    routingDetails && `Lead Routing:\n${routingDetails}`,
    originalMessage,
    details && `${heading}:\n${details}`
  ]
    .filter(Boolean)
    .join("\n\n");
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
      subject: ["Red Ranch Dogs", payload.leadType || payload.formType, payload.preferredBreed || payload.inquiryType]
        .filter(Boolean)
        .join(" - "),
      text: submissionText(payload)
    })
  });

  if (!response.ok) {
    throw new Error("Email delivery failed.");
  }

  return { skipped: false };
}

async function appendSheetViaBridge(payload) {
  if (!process.env.RED_RANCH_BRIDGE_URL || !process.env.RED_RANCH_BRIDGE_SECRET) {
    return { skipped: true };
  }

  const spreadsheetId = process.env.FORM_SHEET_ID || defaultFormSheetId;
  const sheetName = process.env.FORM_SHEET_NAME || defaultLeadSheetName;

  await ensureSheetHeaders(spreadsheetId, sheetName, submissionHeaders);

  await postBridge({
    action: "appendRows",
    spreadsheetId,
    sheetName,
    values: [submissionRow(payload)]
  });

  await ensureSheetHeaders(spreadsheetId, leadQueueSheetName, leadQueueHeaders);

  await postBridge({
    action: "appendRows",
    spreadsheetId,
    sheetName: leadQueueSheetName,
    values: [leadQueueRow(payload)]
  });

  return { skipped: false };
}

async function appendSheetViaWebhook(payload) {
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

async function appendSheet(payload) {
  let bridgeResult = { skipped: true };
  let bridgeError;

  try {
    bridgeResult = await appendSheetViaBridge(payload);
  } catch (error) {
    bridgeError = error;
  }

  try {
    const webhookResult = await appendSheetViaWebhook(payload);

    if (!bridgeResult.skipped || !webhookResult.skipped) {
      return { skipped: false };
    }
  } catch (error) {
    if (bridgeResult.skipped && !bridgeError) {
      throw error;
    }
  }

  if (bridgeError) {
    throw bridgeError;
  }

  return bridgeResult;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ message: "Method not allowed." });
  }

  let body;

  try {
    body = typeof request.body === "object" ? request.body : JSON.parse(request.body || "{}");
  } catch {
    return response.status(400).json({ message: "Invalid form payload." });
  }

  if (clean(body.companyWebsite)) {
    return response.status(200).json({ message: "Thank you. We received your submission." });
  }

  const formType = clean(body.formType);

  if (!allowedForms.has(formType)) {
    return response.status(400).json({ message: "Unknown form type." });
  }

  const routing = routingFor(formType);
  const payload = {
    submittedAt: new Date().toISOString(),
    submissionId: clean(body.submissionId) || createSubmissionId(),
    formType,
    leadType: routing.leadType,
    leadLabel: routing.leadLabel,
    routingBucket: routing.routingBucket,
    replyPriority: routing.replyPriority,
    recommendedNextStep: routing.nextStep,
    formTitle: clean(body.formTitle),
    page: clean(body.page),
    currentUrl: clean(body.currentUrl),
    landingPage: clean(body.landingPage),
    referrer: clean(body.referrer),
    utmSource: clean(body.utmSource),
    utmMedium: clean(body.utmMedium),
    utmCampaign: clean(body.utmCampaign),
    utmContent: clean(body.utmContent),
    utmTerm: clean(body.utmTerm),
    userAgent: clean(body.userAgent),
    source: clean(body.source),
    name: clean(body.name),
    email: clean(body.email),
    phone: clean(body.phone),
    inquiryType: clean(body.inquiryType),
    programName: clean(body.programName),
    preferredStud: clean(body.preferredStud),
    serviceType: clean(body.serviceType),
    cycleTiming: clean(body.cycleTiming),
    femaleDogName: clean(body.femaleDogName),
    femaleDogBreed: clean(body.femaleDogBreed),
    brucellosisStatus: clean(body.brucellosisStatus),
    studGoals: clean(body.studGoals),
    studPolicyAgreement: clean(body.studPolicyAgreement),
    preferredBreed: clean(body.preferredBreed),
    location: clean(body.location),
    guardianType: clean(body.guardianType),
    guardianDistance: clean(body.guardianDistance),
    housing: clean(body.housing),
    fencedYard: clean(body.fencedYard),
    childrenInHome: clean(body.childrenInHome),
    otherPets: clean(body.otherPets),
    dogExperience: clean(body.dogExperience),
    genderPreference: clean(body.genderPreference),
    sizePreference: clean(body.sizePreference),
    timing: clean(body.timing),
    specificInterest: clean(body.specificInterest),
    homeDescription: clean(body.homeDescription),
    puppyFitNotes: clean(body.puppyFitNotes),
    pickupOrDelivery: clean(body.pickupOrDelivery),
    processAgreement: clean(body.processAgreement),
    hearAbout: clean(body.hearAbout),
    guardianReason: clean(body.guardianReason),
    phoneCallTiming: clean(body.phoneCallTiming),
    guardianAgreement: clean(body.guardianAgreement),
    signature: clean(body.signature),
    message: clean(body.message)
  };

  payload.leadSummary = compactLeadSummary(payload);
  payload.message = expandedMessage(payload);

  const validationMessage = validatePayload(payload);
  if (validationMessage) {
    return response.status(400).json({ message: validationMessage });
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
