import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(root, "docs", "WEBSITE_QA_AGENT_REPORT.md");
const ecosystemRoot = path.join(root, "..", "red-ranch-ecosystem-architect");

const read = (filePath) => fs.readFileSync(path.join(root, filePath), "utf8");
const readIfExists = (filePath) => {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
};
const readJson = (filePath) => JSON.parse(read(filePath));
const normalizeStatus = (value = "") => String(value).trim().toLowerCase();
const normalizePath = (href = "") => {
  const [pathname] = href.split("#");
  return pathname.replace(/\/+$/, "") || "/";
};
const isPublicRecord = (item = {}) => {
  const visibility = normalizeStatus(item.visibility || "public");
  return visibility !== "hidden" && visibility !== "private";
};
const statusFromDoc = (source = "") => source.match(/(?:Overall status|Status):\s+\*\*(PASS|FAIL)\*\*/)?.[1] || "UNKNOWN";
const tableStatusFromDoc = (source = "", label = "") => {
  const row = source.split(/\r?\n/).find((line) => line.startsWith(`| ${label} |`));
  return row?.match(/\|\s+(PASS|FAIL)(?:\s|\|)/)?.[1] || "UNKNOWN";
};
const boolStatus = (condition) => condition ? "PASS" : "FAIL";

function routeSetFromStaticSources({ app, siteData, puppies, litters, previousLitters, parents }) {
  const routeKeyPattern = /"((?:\/|\/[a-z0-9][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*)*))"\s*:/g;
  const routeFor = (section) => (item) => item.slug && `/${section}/${item.slug}`;
  const previousLitterArchiveRoutes = new Set(
    previousLitters
      .filter(isPublicRecord)
      .map((item) => item.group)
      .filter((group, index, groups) => group && group !== "Poodles" && groups.indexOf(group) === index)
      .map((group) => `/previous-litters-${group.toLowerCase()}`)
  );

  return new Set([
    "/",
    ...[...app.matchAll(routeKeyPattern)].map((match) => normalizePath(match[1])),
    ...[...siteData.matchAll(routeKeyPattern)].map((match) => normalizePath(match[1])),
    ...puppies.filter(isPublicRecord).map(routeFor("puppies")).filter(Boolean),
    ...litters.filter(isPublicRecord).map(routeFor("litters")).filter(Boolean),
    ...previousLitters.filter(isPublicRecord).map((item) => item.href).filter(Boolean),
    ...previousLitterArchiveRoutes,
    ...parents.filter(isPublicRecord).map(routeFor("parents")).filter(Boolean)
  ]);
}

function routeReview({ app, siteData, sitemap, vercel, puppies, litters, previousLitters, parents }) {
  const routeSet = routeSetFromStaticSources({ app, siteData, puppies, litters, previousLitters, parents });
  const sitemapRoutes = [...sitemap.matchAll(/<loc>https:\/\/www\.redranchdogs\.com([^<]*)<\/loc>/g)]
    .map((match) => normalizePath(match[1] || "/"));
  const duplicateRoutes = sitemapRoutes.filter((route, index) => sitemapRoutes.indexOf(route) !== index);
  const redirects = vercel.redirects || [];
  const hostCanonicalRedirects = redirects.filter((redirect) => (redirect.has || []).some((condition) => condition.type === "host"));
  const routeRedirects = redirects.filter((redirect) => !hostCanonicalRedirects.includes(redirect));
  const redirectSources = new Set(routeRedirects.map((redirect) => normalizePath(redirect.source || "")).filter(Boolean));
  const redirectDestinations = new Set(routeRedirects.map((redirect) => normalizePath(redirect.destination || "")).filter(Boolean));
  const hrefs = [
    ...[...`${app}\n${siteData}`.matchAll(/href:\s*"([^"]+)"/g)].map((match) => match[1]),
    ...[...`${app}\n${siteData}`.matchAll(/(?:href|to)=["']([^"']+)["']/g)].map((match) => match[1])
  ]
    .filter((href) => href && !href.startsWith("#") && !/^(https?:|mailto:|sms:|tel:)/.test(href))
    .map(normalizePath);
  const uniqueHrefs = [...new Set(hrefs)].sort();
  const missingSitemapRoutes = sitemapRoutes.filter((route) => !routeSet.has(route));
  const missingInternalLinks = uniqueHrefs.filter((href) => !routeSet.has(href) && !redirectSources.has(href) && !redirectDestinations.has(href));
  const missingRedirectDestinations = [...redirectDestinations].filter((destination) => !routeSet.has(destination));

  return {
    duplicateRoutes: [...new Set(duplicateRoutes)],
    hostCanonicalRedirects: hostCanonicalRedirects.length,
    knownRoutes: routeSet.size,
    missingInternalLinks,
    missingRedirectDestinations,
    missingSitemapRoutes,
    redirects: redirects.length,
    routeRedirects: routeRedirects.length,
    sitemapRoutes: sitemapRoutes.length,
    uniqueInternalLinks: uniqueHrefs.length
  };
}

function controlDocReview({ agentRegistry, agents, approvalMatrix, dataMatrix, infrastructure, operatingModel }) {
  const expectedReferences = [
    "RED_RANCH_AGENT_OPERATING_MODEL.md",
    "AGENT_REGISTRY.md",
    "DATA_ACCESS_MATRIX.md",
    "AUTOMATION_APPROVAL_MATRIX.md",
    "WEEKLY_ECOSYSTEM_BRIEF_SPEC.md",
    "INFRASTRUCTURE_AND_OPERATIONS_BASELINE.md",
    "red-ranch-ecosystem/SKILL.md"
  ];

  return {
    agentsDocReferences: expectedReferences.filter((reference) => agents.includes(reference)),
    approvedWebsiteAgent: agentRegistry.includes("Website QA Agent"),
    approvalMatrixCoversPublish: approvalMatrix.includes("Publish website change"),
    dataMatrixWebsiteOwnsPublic: dataMatrix.includes("| Public website content | Own"),
    infrastructureRequiresAuditLogs: infrastructure.includes("Agent Audit Logs"),
    operatingModelRequiresNoSilentWrites: operatingModel.includes("No silent writes")
  };
}

function formReview({ app, forms }) {
  const allowedForms = [...forms.matchAll(/const allowedForms = new Set\(\[([^\]]+)\]\)/g)][0]?.[1]
    ?.match(/"([^"]+)"/g)
    ?.map((value) => value.replace(/"/g, "")) || [];
  const renderedForms = [...app.matchAll(/<LeadForm\s+formType="([^"]+)"/g)].map((match) => match[1]);
  const trackingFields = ["landingPage", "referrer", "utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm", "source"];

  return {
    allowedForms,
    missingRenderedForms: allowedForms.filter((formType) => formType !== "waitlist" && !renderedForms.includes(formType)),
    renderedForms: [...new Set(renderedForms)].sort(),
    trackingFieldsPresent: trackingFields.filter((field) => forms.includes(field) && app.includes(field))
  };
}

function publicDataReview({ litters, parents, previousLitters, puppies, waitlist }) {
  const currentLitters = litters.filter((litter) => normalizeStatus(litter.status).includes("current"));
  const plannedLitters = litters.filter((litter) => normalizeStatus(litter.status).includes("planned"));
  const availablePuppies = puppies.filter((puppy) => normalizeStatus(puppy.status) === "available");
  const reservedPuppies = puppies.filter((puppy) => ["reserved", "matched"].includes(normalizeStatus(puppy.status)));
  const waitlistMatchingPuppies = puppies.filter((puppy) => normalizeStatus(puppy.status) === "waitlist matching");
  const publicWaitlistRows = waitlist.publicRows || [];

  return {
    availablePuppies: availablePuppies.length,
    currentLitters: currentLitters.length,
    parents: parents.filter(isPublicRecord).length,
    plannedLitters: plannedLitters.length,
    previousLitters: previousLitters.filter(isPublicRecord).length,
    publicWaitlistRows: publicWaitlistRows.length,
    reservedPuppies: reservedPuppies.length,
    waitlistMatchingPuppies: waitlistMatchingPuppies.length
  };
}

const app = read("src/App.jsx");
const siteData = read("src/data/siteData.js");
const forms = read("api/forms.js");
const sitemap = read("public/sitemap.xml");
const vercel = readJson("vercel.json");
const puppies = readJson("src/data/puppies.json");
const litters = readJson("src/data/litters.json");
const previousLitters = readJson("src/data/previousLitters.json");
const parents = readJson("src/data/parents.json");
const waitlist = readJson("src/data/waitlist.json");
const packageJson = readJson("package.json");
const agents = readIfExists("AGENTS.md");
const operatingModel = readIfExists(path.join(ecosystemRoot, "RED_RANCH_AGENT_OPERATING_MODEL.md"));
const agentRegistry = readIfExists(path.join(ecosystemRoot, "AGENT_REGISTRY.md"));
const dataMatrix = readIfExists(path.join(ecosystemRoot, "DATA_ACCESS_MATRIX.md"));
const approvalMatrix = readIfExists(path.join(ecosystemRoot, "AUTOMATION_APPROVAL_MATRIX.md"));
const weeklyBriefSpec = readIfExists(path.join(ecosystemRoot, "WEEKLY_ECOSYSTEM_BRIEF_SPEC.md"));
const infrastructure = readIfExists(path.join(ecosystemRoot, "INFRASTRUCTURE_AND_OPERATIONS_BASELINE.md"));
const operationsStatus = readIfExists("docs/OPERATIONS_STATUS.md");
const sheetSyncReview = readIfExists("docs/SHEET_SYNC_REVIEW.md");
const analyticsReview = readIfExists("docs/CONVERSION_ANALYTICS_REVIEW.md");

const routeSummary = routeReview({ app, siteData, sitemap, vercel, puppies, litters, previousLitters, parents });
const controls = controlDocReview({ agentRegistry, agents, approvalMatrix, dataMatrix, infrastructure, operatingModel });
const formSummary = formReview({ app, forms });
const dataSummary = publicDataReview({ litters, parents, previousLitters, puppies, waitlist });
const reviewScripts = [
  "verify:routes",
  "review:seo",
  "review:sheets",
  "review:analytics",
  "review:crm-intake",
  "test:forms",
  "check:buyer-flow",
  "validate:content",
  "ops:status"
];
const missingReviewScripts = reviewScripts.filter((scriptName) => !packageJson.scripts?.[scriptName]);

const blockers = [
  !agents ? "AGENTS.md is missing for this website project." : "",
  controls.agentsDocReferences.length < 7 ? "AGENTS.md does not reference every shared control document." : "",
  !controls.approvedWebsiteAgent ? "Agent Registry does not include Website QA Agent." : "",
  !controls.dataMatrixWebsiteOwnsPublic ? "Data Access Matrix does not identify website public-content ownership." : "",
  routeSummary.duplicateRoutes.length ? `Duplicate sitemap routes: ${routeSummary.duplicateRoutes.join(", ")}` : "",
  routeSummary.missingSitemapRoutes.length ? `Sitemap routes missing from known app/data routes: ${routeSummary.missingSitemapRoutes.join(", ")}` : "",
  routeSummary.missingInternalLinks.length ? `Internal links missing routes or redirects: ${routeSummary.missingInternalLinks.join(", ")}` : "",
  routeSummary.missingRedirectDestinations.length ? `Redirect destinations missing known routes: ${routeSummary.missingRedirectDestinations.join(", ")}` : "",
  formSummary.missingRenderedForms.length ? `Allowed forms not rendered publicly: ${formSummary.missingRenderedForms.join(", ")}` : "",
  missingReviewScripts.length ? `Missing expected review scripts: ${missingReviewScripts.join(", ")}` : ""
].filter(Boolean);

const warnings = [
  !controls.infrastructureRequiresAuditLogs ? "Infrastructure baseline audit-log section was not found." : "",
  !controls.operatingModelRequiresNoSilentWrites ? "Operating model no-silent-writes language was not found." : "",
  !weeklyBriefSpec.includes("Website") ? "Weekly Ecosystem Brief spec may not include the Website section." : "",
  !app.includes("@vercel/analytics") ? "Vercel Analytics import not detected." : "",
  formSummary.trackingFieldsPresent.length < 8 ? "Website form tracking/UTM fields are incomplete." : "",
  statusFromDoc(operationsStatus) !== "PASS" ? "Latest docs/OPERATIONS_STATUS.md is not PASS or is missing." : "",
  statusFromDoc(sheetSyncReview) !== "PASS" ? "Latest docs/SHEET_SYNC_REVIEW.md is not PASS or is missing." : "",
  !analyticsReview.includes("Vercel Analytics") ? "Conversion analytics review does not mention Vercel Analytics." : ""
].filter(Boolean);

const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
const report = [
  "# Website QA Agent Report",
  "",
  `Generated: ${generatedAt} Central`,
  "",
  "Owner app: **Website**",
  "Agent: **Website QA Agent**",
  "Permission level: **read_only**",
  "",
  "This report is a local, read-only Website QA Agent pass. It inspects repository files and the latest generated review docs. It does not write to Google Sheets, Google Drive, Vercel, DNS, env vars, CRM, Breeding Ops, or live website data.",
  "",
  `Status: **${blockers.length ? "FAIL" : "PASS"}**`,
  "",
  "## Guardrail Alignment",
  "",
  "| Check | Status |",
  "| --- | --- |",
  `| AGENTS.md exists | ${boolStatus(Boolean(agents))} |`,
  `| AGENTS.md references shared control docs | ${boolStatus(controls.agentsDocReferences.length === 7)} |`,
  `| Website QA Agent is registered | ${boolStatus(controls.approvedWebsiteAgent)} |`,
  `| Data matrix preserves website ownership boundary | ${boolStatus(controls.dataMatrixWebsiteOwnsPublic)} |`,
  `| Approval matrix covers website publishing | ${boolStatus(controls.approvalMatrixCoversPublish)} |`,
  `| Infrastructure baseline requires agent audit logs | ${boolStatus(controls.infrastructureRequiresAuditLogs)} |`,
  `| Operating model says no silent writes | ${boolStatus(controls.operatingModelRequiresNoSilentWrites)} |`,
  "",
  "## Public Site QA Snapshot",
  "",
  "| Area | Result |",
  "| --- | ---: |",
  `| Sitemap routes | ${routeSummary.sitemapRoutes} |`,
  `| Known static/dynamic routes | ${routeSummary.knownRoutes} |`,
  `| Internal links | ${routeSummary.uniqueInternalLinks} |`,
  `| Redirects | ${routeSummary.redirects} |`,
  `| Host canonical redirects | ${routeSummary.hostCanonicalRedirects} |`,
  `| Missing sitemap routes | ${routeSummary.missingSitemapRoutes.length} |`,
  `| Missing internal links | ${routeSummary.missingInternalLinks.length} |`,
  "",
  "## Public Data Snapshot",
  "",
  "| Public display category | Count |",
  "| --- | ---: |",
  `| Available puppies | ${dataSummary.availablePuppies} |`,
  `| Waitlist matching puppies | ${dataSummary.waitlistMatchingPuppies} |`,
  `| Reserved puppies | ${dataSummary.reservedPuppies} |`,
  `| Current litters | ${dataSummary.currentLitters} |`,
  `| Planned litters | ${dataSummary.plannedLitters} |`,
  `| Previous litter records | ${dataSummary.previousLitters} |`,
  `| Public parent profiles | ${dataSummary.parents} |`,
  `| Public waitlist rows | ${dataSummary.publicWaitlistRows} |`,
  "",
  "## Forms And Attribution",
  "",
  `Allowed form types: ${formSummary.allowedForms.map((formType) => `\`${formType}\``).join(", ")}`,
  "",
  `Rendered public LeadForm types: ${formSummary.renderedForms.map((formType) => `\`${formType}\``).join(", ")}`,
  "",
  `Tracking fields present in frontend and API: ${formSummary.trackingFieldsPresent.map((field) => `\`${field}\``).join(", ")}`,
  "",
  "Important boundary: form submissions and analytics events are website intake/behavior signals. CRM remains the source of truth for lead outcomes, waitlist decisions, deposits, and puppy-family matching.",
  "",
  "## Latest Generated Review Status",
  "",
  "| Review doc | Status |",
  "| --- | --- |",
  `| docs/OPERATIONS_STATUS.md | ${statusFromDoc(operationsStatus)} |`,
  `| docs/SHEET_SYNC_REVIEW.md | ${statusFromDoc(sheetSyncReview)} |`,
  `| Operations bridge section | ${tableStatusFromDoc(operationsStatus, "Lead Queue") === "PASS" ? "PASS" : "SEE OPERATIONS STATUS"} |`,
  "",
  "## Blockers",
  "",
  blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- None flagged.",
  "",
  "## Warnings",
  "",
  warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- None flagged.",
  "",
  "## Recommended Next Moves",
  "",
  "1. Owner: Website",
  "   Action: Run `npm run agent:website-qa` after major public website updates.",
  "   Why: This gives Adam one read-only health report tied to the ecosystem guardrails.",
  "   Approval needed: No, read-only.",
  "",
  "2. Owner: Website + Marketing Engine",
  "   Action: Use this report with Vercel Analytics and Lead Queue summaries for the first Analytics and Attribution Agent readout.",
  "   Why: Website traffic is not lead truth; CRM outcomes need to be compared separately.",
  "   Approval needed: Yes before changing tracking code, ad settings, or CRM fields.",
  "",
  "3. Owner: CRM / Breeding Ops / Website",
  "   Action: Keep cross-system updates as handoffs until stable APIs and audit logs exist.",
  "   Why: The control docs explicitly forbid direct cross-app writes for now.",
  "   Approval needed: Yes for any write across app boundaries.",
  "",
].join("\n");

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${report}\n`);

console.log(`Website QA Agent report written to ${path.relative(root, reportPath)}`);
console.log(`Status: ${blockers.length ? "FAIL" : "PASS"}`);

if (blockers.length) {
  blockers.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}
