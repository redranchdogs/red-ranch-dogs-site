import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appSource = fs.readFileSync(path.join(root, "src", "App.jsx"), "utf8");
const reportPath = path.join(root, "docs", "MOBILE_CTA_REVIEW.md");

const routeGoals = [
  {
    route: "/",
    primary: "Join Waitlist / Apply",
    secondary: "Text Us",
    evidence: ["Join Waitlist", "Text Us", "StickyMobileCta"],
  },
  {
    route: "/puppies/available",
    primary: "Apply for a Puppy",
    secondary: "View Current Litters",
    evidence: ["No public puppies open right now", "View Current Litters"],
  },
  {
    route: "/puppies/current-litters",
    primary: "Apply for a Puppy",
    secondary: "View Upcoming Litters",
    evidence: ["Want help choosing a path?", "View Upcoming Litters"],
  },
  {
    route: "/apply",
    primary: "Application form",
    secondary: "Process context",
    evidence: ["Application details", "Use the application for any starting point"],
  },
  {
    route: "/contact",
    primary: "Send a Message",
    secondary: "Text Us",
    evidence: ["Send a Message", "Text Us"],
  },
  {
    route: "/guardian-program/application",
    primary: "Guardian Application",
    secondary: "Guardian FAQ context",
    evidence: ["Guardian Application", "Guardian Fit", "Family Fit"],
  },
];

const rows = routeGoals.map((goal) => {
  const missing = goal.evidence.filter((text) => !appSource.includes(text));
  return {
    ...goal,
    status: missing.length ? "REVIEW" : "PASS",
    missing,
  };
});

const blockers = rows.filter((row) => row.status !== "PASS");
const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
const report = `# Mobile CTA Review

Generated: ${generatedAt} Central

Status: **${blockers.length ? "REVIEW" : "PASS"}**

This review keeps the mobile buyer path focused. It does not add more buttons by default; it checks that the most important mobile pages have a clear next action.

| Route | Primary mobile action | Secondary action | Status |
| --- | --- | --- | --- |
${rows.map((row) => `| ${row.route} | ${row.primary} | ${row.secondary} | ${row.status}${row.missing.length ? ` - missing ${row.missing.join(", ")}` : ""} |`).join("\n")}

## CTA Rules

1. Home can carry the persistent mobile \`Join Waitlist\` and \`Text Us\` actions after the hero.
2. Available Puppies should keep the buyer pointed to Apply or Current Litters when no public puppies are open.
3. Current Litters should explain waitlist-first matching and keep Apply as the primary next step.
4. Form pages should not add distracting CTAs above the form.
5. Contact pages should keep direct text/email options easy to find on mobile.
`;

fs.writeFileSync(reportPath, report);
console.log(`Mobile CTA review written to ${path.relative(root, reportPath)}`);
console.log(`Status: ${blockers.length ? "REVIEW" : "PASS"}`);

if (blockers.length) {
  process.exit(1);
}
