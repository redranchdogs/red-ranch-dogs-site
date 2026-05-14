import fs from "node:fs";

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

function readWebhookUrl() {
  if (!fs.existsSync(".env.local")) {
    throw new Error("Missing .env.local. Add FORM_WEBHOOK_URL before testing forms.");
  }

  const match = fs.readFileSync(".env.local", "utf8").match(/^FORM_WEBHOOK_URL=(.+)$/m);
  if (!match?.[1]) {
    throw new Error("Missing FORM_WEBHOOK_URL in .env.local.");
  }

  return match[1].trim();
}

function compactLeadSummary(payload) {
  return [
    payload.name,
    payload.email,
    payload.phone,
    payload.preferredBreed,
    payload.location,
    payload.message
  ]
    .filter(Boolean)
    .join(" | ");
}

function withRouting(payload) {
  const routing = leadRoutingByForm[payload.formType] || leadRoutingByForm.contact;

  return {
    ...payload,
    leadType: routing.leadType,
    leadLabel: routing.leadLabel,
    routingBucket: routing.routingBucket,
    replyPriority: routing.replyPriority,
    recommendedNextStep: routing.nextStep,
    leadSummary: compactLeadSummary(payload)
  };
}

const submittedAt = new Date().toISOString();
const shared = {
  submittedAt,
  submissionId: `codex-smoke-${Date.now()}`,
  page: "Codex form smoke test",
  currentUrl: "https://red-ranch-dogs-site.vercel.app/codex-form-smoke-test",
  landingPage: "https://red-ranch-dogs-site.vercel.app/?utm_source=codex&utm_medium=smoke&utm_campaign=forms",
  referrer: "Codex local smoke test",
  utmSource: "codex",
  utmMedium: "smoke",
  utmCampaign: "forms",
  source: "npm run test:forms",
  name: "Codex Form Smoke Test",
  email: "test@example.com",
  phone: "555-0103",
  message: `This is a fake test submission from npm run test:forms at ${submittedAt}.`
};

const payloads = [
  withRouting({
    ...shared,
    formType: "contact",
    formTitle: "Send a Message",
    inquiryType: "General question",
    preferredBreed: "Test only",
    location: "Test City"
  })
];

if (process.argv.includes("--all")) {
  payloads.push(
    withRouting({
      ...shared,
      formType: "application",
      formTitle: "Application details",
      preferredBreed: "Goldendoodle",
      genderPreference: "No preference",
      sizePreference: "Mini (15-35 lbs)",
      timing: "Flexible",
      processAgreement: "Understands process, pricing, deposit policy, and spay/neuter agreement",
      signature: "Codex Form Smoke Test"
    }),
    withRouting({
      ...shared,
      formType: "stud",
      formTitle: "Stud Inquiry",
      programName: "Codex Test Kennel",
      preferredStud: "Test stud",
      serviceType: "Shipped semen",
      cycleTiming: "Planning ahead",
      femaleDogName: "Test Dam",
      femaleDogBreed: "Test Breed",
      brucellosisStatus: "Will complete before service",
      studGoals: "Test only",
      studPolicyAgreement: "Understands negative brucellosis and payment timing requirements"
    }),
    withRouting({
      ...shared,
      formType: "guardian",
      formTitle: "Guardian Application",
      guardianType: "Female guardian",
      guardianDistance: "Within 30 minutes",
      housing: "Own home",
      fencedYard: "Yes",
      childrenInHome: "No",
      otherPets: "No other pets",
      dogExperience: "Test only",
      guardianReason: "Test only",
      phoneCallTiming: "Flexible",
      guardianAgreement: "Understands guardian requirements and phone conversation before placement"
    }),
    withRouting({
      submittedAt,
      submissionId: `codex-newsletter-${Date.now()}`,
      formType: "newsletter",
      formTitle: "Puppy Alert Email",
      page: "Codex form smoke test",
      currentUrl: "https://red-ranch-dogs-site.vercel.app/codex-form-smoke-test",
      landingPage: "https://red-ranch-dogs-site.vercel.app/?utm_source=codex&utm_medium=smoke&utm_campaign=forms",
      utmSource: "codex",
      utmMedium: "smoke",
      utmCampaign: "forms",
      source: "npm run test:forms --all",
      email: "test@example.com"
    })
  );
}

const webhookUrl = readWebhookUrl();

for (const payload of payloads) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Form webhook failed with ${response.status}: ${body}`);
  }

  console.log(`Form webhook accepted ${payload.formType} test submission at ${submittedAt}.`);
  console.log(body);
}
