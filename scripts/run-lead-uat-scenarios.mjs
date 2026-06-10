import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import handler from "../api/forms.js";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const reportPath = path.join(root, "docs", "LEAD_UAT_SCENARIOS.md");
const snapshotPath = path.join(root, "outputs", "lead-uat-scenarios.tsv");
const writeMode = process.argv.includes("--write");
const rebuildQueue = process.argv.includes("--rebuild-queue");
const runId = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);

function loadLocalEnv() {
  if (!fs.existsSync(envPath)) return;

  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;

      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index);
      const value = trimmed.slice(index + 1).replace(/^["']|["']$/g, "");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
}

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

function tsvEscape(value) {
  return String(value ?? "").replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function tsv(rows) {
  return rows.map((row) => row.map(tsvEscape).join("\t")).join("\n");
}

function scenarioId(slug) {
  return `uat-${runId}-${slug}`;
}

const shared = {
  currentUrl: "https://red-ranch-dogs-site.vercel.app/uat-lead-flow",
  firstGclid: `uat-first-gclid-${runId}`,
  firstLandingPage: "https://red-ranch-dogs-site.vercel.app/apply?utm_source=google&utm_medium=cpc&utm_campaign=tx_doodle_search&utm_content=uat_search_ad&utm_term=doodle%20puppies%20texas",
  firstReferrer: "https://www.google.com/",
  firstUtmCampaign: "tx_doodle_search",
  firstUtmContent: "uat_search_ad",
  firstUtmMedium: "cpc",
  firstUtmSource: "google",
  firstUtmTerm: "doodle puppies texas",
  gclid: `uat-last-gclid-${runId}`,
  landingPage: "https://red-ranch-dogs-site.vercel.app/?utm_source=uat&utm_medium=lead-flow&utm_campaign=launch-readiness",
  lastGclid: `uat-last-gclid-${runId}`,
  lastLandingPage: "https://red-ranch-dogs-site.vercel.app/uat-lead-flow?utm_source=google&utm_medium=cpc&utm_campaign=tx_doodle_search&utm_content=uat_search_ad_b&utm_term=cavapoo%20puppies%20texas",
  lastReferrer: "https://red-ranch-dogs-site.vercel.app/puppies/current-litters",
  lastUtmCampaign: "tx_doodle_search",
  lastUtmContent: "uat_search_ad_b",
  lastUtmMedium: "cpc",
  lastUtmSource: "google",
  lastUtmTerm: "cavapoo puppies texas",
  page: "/uat-lead-flow",
  referrer: "Codex UAT scenario runner",
  source: "lead-uat-scenarios",
  submittedAt: new Date().toISOString(),
  userAgent: "Codex lead UAT runner"
};

const scenarios = [
  {
    acceptanceCriteria: "Routes as a high-priority puppy application with breed, size, timing, pickup, and agreement details.",
    payload: {
      ...shared,
      email: "uat.goldendoodle.family@example.com",
      formTitle: "Puppy Application",
      formType: "application",
      genderPreference: "No preference",
      hearAbout: "Google search",
      homeDescription: "Family in Central Texas looking for a steady companion puppy.",
      message: "UAT test row. Safe to mark Test/delete after review.",
      name: "UAT Goldendoodle Family",
      phone: "555-0101",
      pickupOrDelivery: "Pickup in Salado",
      preferredBreed: "Goldendoodle",
      processAgreement: "Understands process, pricing, deposit policy, and spay/neuter agreement",
      puppyFitNotes: "Wants a calm family puppy and is open to waitlist timing.",
      signature: "UAT Goldendoodle Family",
      sizePreference: "Mini (15-35 lbs)",
      specificInterest: "Future Goldendoodle litter",
      submissionId: scenarioId("application-goldendoodle"),
      timing: "Flexible"
    },
    title: "Happy path: puppy application"
  },
  {
    acceptanceCriteria: "Routes as waitlist interest and keeps the request simple enough to move into the breed waitlist later.",
    payload: {
      ...shared,
      email: "uat.cavapoo.waitlist@example.com",
      formTitle: "Join the Waitlist",
      formType: "waitlist",
      message: "UAT test row. Family wants to understand Cavapoo waitlist timing.",
      name: "UAT Cavapoo Waitlist",
      phone: "555-0102",
      preferredBreed: "Cavapoo",
      submissionId: scenarioId("waitlist-cavapoo"),
      timing: "Summer or fall"
    },
    title: "Happy path: waitlist interest"
  },
  {
    acceptanceCriteria: "Routes as general contact and captures the question without pretending a puppy is available.",
    payload: {
      ...shared,
      email: "uat.available.question@example.com",
      formTitle: "Contact Red Ranch Dogs",
      formType: "contact",
      inquiryType: "Available puppy question",
      location: "Austin, Texas",
      message: "UAT test row. Asking if any puppies are currently available now that the page says none are open.",
      name: "UAT Available Puppy Question",
      phone: "555-0103",
      preferredBreed: "Goldendoodle",
      submissionId: scenarioId("contact-availability")
    },
    title: "Edge case: available puppy question when none are available"
  },
  {
    acceptanceCriteria: "Routes as a high-priority stud inquiry with female dog and brucellosis fields visible.",
    payload: {
      ...shared,
      brucellosisStatus: "Will complete before service",
      cycleTiming: "Expected heat in two weeks",
      email: "uat.breeder.stud@example.com",
      femaleDogBreed: "Goldendoodle",
      femaleDogName: "Test Willow",
      formTitle: "Stud Inquiry",
      formType: "stud",
      message: "UAT test row. Breeder asking about stud timing and service options.",
      name: "UAT Stud Service Breeder",
      phone: "555-0104",
      preferredStud: "Garth Brooks",
      programName: "UAT Family Doodles",
      serviceType: "Shipped semen or in-person AI",
      studGoals: "Looking for structure, coat quality, and clear temperament.",
      studPolicyAgreement: "Understands negative brucellosis and payment timing requirements",
      submissionId: scenarioId("stud-inquiry")
    },
    title: "Happy path: stud inquiry"
  },
  {
    acceptanceCriteria: "Routes as a guardian candidate and surfaces location, yard, housing, and phone-call fit.",
    payload: {
      ...shared,
      childrenInHome: "Yes",
      dogExperience: "Has raised family dogs before and understands regular communication.",
      email: "uat.guardian.candidate@example.com",
      fencedYard: "Yes",
      formTitle: "Guardian Application",
      formType: "guardian",
      guardianAgreement: "Understands guardian requirements and phone conversation before placement",
      guardianDistance: "Within 30 minutes of Salado",
      guardianReason: "Interested in partnering with Red Ranch Dogs as a guardian family.",
      guardianType: "Female guardian",
      housing: "Own home",
      location: "Belton, Texas",
      message: "UAT test row. Guardian candidate wants a phone call.",
      name: "UAT Guardian Candidate",
      otherPets: "One spayed family dog",
      phone: "555-0105",
      phoneCallTiming: "Weekday evenings",
      preferredBreed: "Goldendoodle",
      submissionId: scenarioId("guardian-candidate")
    },
    title: "Happy path: guardian application"
  },
  {
    acceptanceCriteria: "Routes as a low-priority puppy alert signup with only email required.",
    payload: {
      ...shared,
      email: "uat.puppy.alerts@example.com",
      formTitle: "Puppy Alert Email",
      formType: "newsletter",
      message: "UAT test row. Safe to mark Test/delete after review.",
      submissionId: scenarioId("newsletter-signup")
    },
    title: "Happy path: puppy alert signup"
  }
];

async function submitScenario(scenario) {
  const result = await handler({ method: "POST", body: scenario.payload }, createResponse());

  return {
    ...scenario,
    message: result.body?.message || "",
    ok: result.statusCode >= 200 && result.statusCode < 300,
    statusCode: result.statusCode
  };
}

function buildReport(results) {
  const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  const mode = writeMode ? "LIVE WRITE" : "DRY RUN";

  return [
    "# Lead UAT Scenarios",
    "",
    `Generated: ${generatedAt} Central`,
    "",
    `Mode: **${mode}**`,
    "",
    "UAT means User Acceptance Testing. These are fake-but-realistic client journeys that prove the website lead flow works before launch.",
    "",
    "## Business Lingo",
    "",
    "- **UAT:** fake client scenarios used to prove the system works the way the business actually works.",
    "- **Happy path:** the normal clean version of a workflow.",
    "- **Edge case:** a realistic odd situation that should still behave clearly.",
    "- **Acceptance criteria:** the pass/fail rule for a scenario.",
    "- **Source of truth:** the place we trust as correct. For now, raw website submissions stay in `Website Leads`, and daily work happens in `Lead Queue`.",
    "- **Data contract:** the agreed meaning of the columns so the future CRM can read them later.",
    "- **Lead lifecycle:** the movement from new lead to replied, follow-up, deposit info sent, waitlist, closed, or not a fit.",
    "",
    "## How To Use This",
    "",
    "1. Run `npm run leads:uat` to preview the scenarios without writing rows.",
    "2. Run `npm run leads:uat:write` to push the fake clients through the real form handler into Google Sheets.",
    "3. Open the `Website Submissions` sheet and work from `Lead Queue`.",
    "4. Mark each fake row as `Test/delete` after you have reviewed the routing.",
    "5. Run `npm run leads:rebuild-queue` any time you want the queue rebuilt from raw submissions while preserving manual status notes.",
    "",
    "## Scenarios",
    "",
    "| Scenario | Form | Submission ID | Acceptance Criteria | Result |",
    "| --- | --- | --- | --- | --- |",
    ...results.map((result) =>
      [
        result.title,
        result.payload.formType,
        result.payload.submissionId,
        result.acceptanceCriteria,
        writeMode ? `${result.statusCode} ${result.ok ? "PASS" : "FAIL"} - ${result.message}` : "Not written"
      ]
        .map((value) => String(value).replace(/\|/g, "\\|"))
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    ),
    "",
    "## Before Launch",
    "",
    "- The fake UAT rows should either be marked `Test/delete` or removed from the working queue before launch day.",
    "- Keep the rows long enough to practice the daily process once: assign owner, choose next action, choose status, and add a short note.",
    "- Do not use the fake emails for real follow-up.",
    "",
  ].join("\n");
}

function writeSnapshot(results) {
  const rows = [
    ["scenario", "form_type", "submission_id", "name", "email", "priority_expected", "acceptance_criteria", "result"],
    ...results.map((result) => [
      result.title,
      result.payload.formType,
      result.payload.submissionId,
      result.payload.name || "(email only)",
      result.payload.email,
      ["application", "guardian", "stud", "waitlist"].includes(result.payload.formType) ? "High" : result.payload.formType === "newsletter" ? "Low" : "Normal",
      result.acceptanceCriteria,
      writeMode ? `${result.statusCode} ${result.ok ? "PASS" : "FAIL"}` : "DRY RUN"
    ])
  ];

  fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
  fs.writeFileSync(snapshotPath, `${tsv(rows)}\n`);
}

async function main() {
  loadLocalEnv();

  if (!process.env.RED_RANCH_BRIDGE_URL || !process.env.RED_RANCH_BRIDGE_SECRET) {
    throw new Error("RED_RANCH_BRIDGE_URL and RED_RANCH_BRIDGE_SECRET are required for lead UAT.");
  }

  process.env.VERCEL_ENV = "production";

  delete process.env.FORM_WEBHOOK_URL;
  delete process.env.RESEND_API_KEY;
  delete process.env.FORM_TO_EMAIL;
  delete process.env.FORM_FROM_EMAIL;

  const results = [];

  if (writeMode) {
    for (const scenario of scenarios) {
      results.push(await submitScenario(scenario));
    }
  } else {
    results.push(...scenarios);
  }

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, buildReport(results));
  writeSnapshot(results);

  if (writeMode && results.some((result) => !result.ok)) {
    throw new Error("One or more UAT scenarios failed.");
  }

  if (writeMode && rebuildQueue) {
    const result = spawnSync("npm", ["run", "leads:rebuild-queue"], {
      cwd: root,
      stdio: "inherit"
    });

    if (result.status !== 0) {
      throw new Error("UAT rows were written, but Lead Queue rebuild failed.");
    }
  }

  console.log(`Lead UAT report written to ${path.relative(root, reportPath)}`);
  console.log(`Lead UAT snapshot written to ${path.relative(root, snapshotPath)}`);
  console.log(writeMode ? `Submitted ${results.length} fake UAT leads.` : `Previewed ${results.length} fake UAT leads.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
