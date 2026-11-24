import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appSource = fs.readFileSync(path.join(root, "src", "App.jsx"), "utf8");
const reportPath = path.join(root, "docs", "MOBILE_CTA_REVIEW.md");

const routeGoals = [
  {
    route: "/",
    primary: "See available puppies",
    secondary: "Text Us",
    evidence: ['<StickyMobileCta primaryHref="/puppies/available" primaryLabel="See available puppies"', "Text Us"],
  },
  {
    route: "/puppies/available",
    primary: "Apply for a Puppy",
    secondary: "Browse current and upcoming litters",
    evidence: [
      '<PuppyFinderRouteNav mode="available"',
      'primaryLabel="Apply for a Puppy"',
      'className="available-puppy-path-cta"',
      'className="available-empty-statement">No puppies are listed as available right now.',
      'className="button primary available-empty-path-action">View current litters',
      'className="button primary available-empty-path-action">View upcoming litters',
    ],
  },
  {
    route: "/puppies/current-litters",
    primary: "View litter",
    secondary: "Upcoming Litters",
    evidence: [
      '<LitterBrowser mode="current" />',
      'href={route} className="button primary litter-browser-card-action">',
      '"View litter updates" : "View litter"',
      'label: "Upcoming Litters", href: litterBrowserHref("upcoming", breedSlug)',
    ],
  },
  {
    route: "/apply",
    primary: "Application form",
    secondary: "Application and reservation guidance",
    evidence: [
      '<LeadForm formType="application" title="Application details"',
      'You can apply without choosing a specific litter.',
      'An application does not hold a puppy.',
    ],
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
    secondary: "Guardian family fit",
    evidence: [
      '<LeadForm formType="guardian" title="Guardian Application" guardianFields',
      '<article className="group-panel guardian-before-apply">',
      '<h2>Guardian family fit</h2>',
    ],
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

1. Home offers \`See available puppies\` and \`Text Us\` after the hero.
2. Available Puppies offers an application when puppies are listed and links to current and upcoming litters when the list is empty.
3. Current Litters opens each litter’s details and keeps the selected breed when switching to Upcoming Litters.
4. Form pages should not add distracting CTAs above the form.
5. Contact pages should keep direct text/email options easy to find on mobile.
`;

fs.writeFileSync(reportPath, report);
console.log(`Mobile CTA review written to ${path.relative(root, reportPath)}`);
console.log(`Status: ${blockers.length ? "REVIEW" : "PASS"}`);

if (blockers.length) {
  process.exit(1);
}
