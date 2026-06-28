import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appSource = fs.readFileSync(path.join(root, "src", "App.jsx"), "utf8");
const apiSource = fs.readFileSync(path.join(root, "api", "forms.js"), "utf8");
const handoffPath = path.join(root, "docs", "CRM_HANDOFF_PACKET.md");
const handoffSource = fs.existsSync(handoffPath) ? fs.readFileSync(handoffPath, "utf8") : "";
const reportPath = path.join(root, "docs", "CRM_INTAKE_ALIGNMENT_REVIEW.md");

function unique(values) {
  return [...new Set(values)].sort((first, second) => first.localeCompare(second));
}

function matchAll(source, regex, group = 1) {
  return [...source.matchAll(regex)].map((match) => match[group]).filter(Boolean);
}

function apiAllowedForms() {
  const match = apiSource.match(/allowedForms\s*=\s*new Set\(\[([\s\S]*?)\]\)/);
  if (!match) return [];
  return unique(matchAll(match[1], /"([^"]+)"/g));
}

const allowedForms = apiAllowedForms();
const renderedForms = unique(matchAll(appSource, /<LeadForm[\s\S]*?formType="([^"]+)"/g));
const documentedForms = unique(matchAll(handoffSource, /formType="([^"]+)"/g));
const backendOnlyForms = allowedForms.filter((formType) => !renderedForms.includes(formType));

const contractChecks = [
  {
    label: "API accepts forms",
    ok: allowedForms.length > 0,
    detail: allowedForms.join(", ") || "No allowedForms set found.",
  },
  {
    label: "Public form endpoint documented",
    ok: handoffSource.includes("/api/forms"),
    detail: "/api/forms",
  },
  {
    label: "Website Leads documented",
    ok: handoffSource.includes("Website Leads"),
    detail: "Immutable raw submission archive",
  },
  {
    label: "Lead Queue documented",
    ok: handoffSource.includes("Lead Queue"),
    detail: "Working CRM intake queue",
  },
  {
    label: "Submission ID in raw archive headers",
    ok: apiSource.includes('"Submission ID"'),
    detail: "Stable join key",
  },
  {
    label: "Submission ID in handoff docs",
    ok: handoffSource.includes("Submission ID"),
    detail: "Stable join key documented",
  },
  {
    label: "Preferred contact method stored",
    ok:
      appSource.includes('name="preferredContactMethod"') &&
      apiSource.includes('"preferredContactMethod"') &&
      apiSource.includes('"Preferred Contact Method"') &&
      handoffSource.includes("Preferred Contact Method"),
    detail: "Contact-form reply preference is a first-class Website Leads column",
  },
];

const missingDocs = allowedForms.filter((formType) => !documentedForms.includes(formType));
const missingRenderedRequired = allowedForms
  .filter((formType) => formType !== "waitlist")
  .filter((formType) => !renderedForms.includes(formType));
const blockers = [
  ...contractChecks.filter((check) => !check.ok).map((check) => check.label),
  ...missingDocs.map((formType) => `${formType} missing from CRM handoff docs`),
  ...missingRenderedRequired.map((formType) => `${formType} has no rendered public LeadForm`),
];

const formRows = allowedForms.map((formType) => {
  const publicStatus = renderedForms.includes(formType)
    ? "Rendered"
    : formType === "waitlist"
      ? "Backend-supported; public route currently uses application CTA"
      : "Missing";
  const docsStatus = documentedForms.includes(formType) ? "Documented" : "Missing";
  return `| \`${formType}\` | Yes | ${publicStatus} | ${docsStatus} |`;
});

const checkRows = contractChecks.map((check) => (
  `| ${check.label} | ${check.ok ? "PASS" : "FAIL"} | ${check.detail} |`
));

const report = `# CRM Intake Alignment Review

This review keeps the live website form system aligned with the future CRM without touching live Sheets, CRM data, or Apps Script deployments.

## Summary

- API form types: ${allowedForms.map((formType) => `\`${formType}\``).join(", ")}
- Rendered public LeadForm types: ${renderedForms.map((formType) => `\`${formType}\``).join(", ")}
- Backend-only support: ${backendOnlyForms.length ? backendOnlyForms.map((formType) => `\`${formType}\``).join(", ") : "None"}
- Blockers: ${blockers.length ? blockers.join("; ") : "None"}

## Form Contract

| Form type | Accepted by /api/forms | Public website status | CRM handoff status |
| --- | --- | --- | --- |
${formRows.join("\n")}

## Contract Checks

| Check | Status | Detail |
| --- | --- | --- |
${checkRows.join("\n")}

## CRM Boundary

- Do not treat Vercel Analytics events as lead records.
- Keep \`Website Leads\` as the immutable raw archive.
- Keep \`Lead Queue\` as the working inbox until the CRM owns the form backend.
- Preserve \`Submission ID\` as the stable join key across website submission, email notification, Sheets, and CRM.
- The public waitlist mini form is not the preferred public path right now; application CTAs should continue to route serious families through the full application while backend waitlist support remains available.
`;

fs.writeFileSync(reportPath, report);
console.log(`CRM intake alignment review written to ${path.relative(root, reportPath)}`);

if (blockers.length) {
  console.error(`CRM intake contract blockers: ${blockers.join("; ")}`);
  process.exit(1);
}
