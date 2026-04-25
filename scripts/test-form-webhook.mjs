import fs from "node:fs";

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

const submittedAt = new Date().toISOString();
const payload = {
  submittedAt,
  formType: "contact",
  page: "Codex form smoke test",
  source: "npm run test:forms",
  name: "Codex Form Smoke Test",
  email: "test@example.com",
  phone: "555-0103",
  preferredBreed: "Test only",
  location: "Test City",
  housing: "Test only",
  fencedYard: "Test only",
  otherPets: "Test only",
  dogExperience: "Test only",
  message: `This is a fake test submission from npm run test:forms at ${submittedAt}.`
};

const response = await fetch(readWebhookUrl(), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});

const body = await response.text();

if (!response.ok) {
  throw new Error(`Form webhook failed with ${response.status}: ${body}`);
}

console.log(`Form webhook accepted test submission at ${submittedAt}.`);
console.log(body);
