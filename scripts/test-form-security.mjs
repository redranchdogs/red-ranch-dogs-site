import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { sanitizeSpreadsheetCell } from "../api/forms.js";
import { submitFormPayload } from "../src/formSubmission.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const dangerousCells = [
  "=SUM(1,1)",
  "+cmd",
  "-1+2",
  "@SUM(1,1)",
  " =SUM(1,1)",
  "\t+cmd",
  "\r\n-1+2",
  " \t\r\n@SUM(1,1)"
];

dangerousCells.forEach((value) => {
  const sanitized = sanitizeSpreadsheetCell(value);
  assert(sanitized === `'${value}`, `API Sheet boundary should neutralize ${JSON.stringify(value)}`);
  assert(
    sanitizeSpreadsheetCell(sanitized) === sanitized,
    `API Sheet boundary should be idempotent for ${JSON.stringify(value)}`
  );
});

["Ada", "42", "https://example.com", "'already literal", ""].forEach((value) => {
  assert(sanitizeSpreadsheetCell(value) === value, `Normal Sheet cell should remain unchanged: ${JSON.stringify(value)}`);
});

async function mockSubmissionError(response) {
  try {
    await submitFormPayload({ submissionId: "test-submission-id" }, async () => response);
  } catch (error) {
    return error;
  }
}

const rateLimited = await mockSubmissionError({
  ok: false,
  status: 429,
  json: async () => { throw new SyntaxError("HTML response"); }
});
assert(rateLimited?.message.includes("Too many requests"), "Non-JSON 429 should return a friendly retry message.");

const nonJsonFailure = await mockSubmissionError({
  ok: false,
  status: 502,
  json: async () => { throw new SyntaxError("Plain-text response"); }
});
assert(nonJsonFailure.message === "Submission failed.", "Non-JSON upstream failures should use a stable message.");

let nonJsonSuccessError;
try {
  await submitFormPayload({ submissionId: "test-submission-id" }, async () => ({
    ok: true,
    status: 200,
    json: async () => { throw new SyntaxError("HTML response"); }
  }));
} catch (error) {
  nonJsonSuccessError = error;
}
assert(nonJsonSuccessError, "Non-JSON HTTP 200 should not be treated as an acknowledged submission.");

const jsonFailure = await mockSubmissionError({
  ok: false,
  status: 400,
  json: async () => ({ message: "Controlled validation message." })
});
assert(jsonFailure.message === "Controlled validation message.", "JSON API error messages should remain intact.");

const retainedClientId = globalThis.crypto.randomUUID();
let firstRequestedClientId = "";
const submittedPayload = { submissionId: retainedClientId };
let firstRequestError;
try {
  await submitFormPayload(
    submittedPayload,
    async (_url, options) => {
      firstRequestedClientId = JSON.parse(options.body).submissionId;
      throw new Error("Simulated network failure");
    }
  );
} catch (error) {
  firstRequestError = error;
}
assert(firstRequestError && retainedClientId, "Failed requests should preserve the caller's submission ID.");

let retriedClientId = "";
const submitted = await submitFormPayload(
  submittedPayload,
  async (_url, options) => {
    retriedClientId = JSON.parse(options.body).submissionId;
    return {
      ok: true,
      status: 200,
      json: async () => ({ ok: true })
    };
  }
);
assert(
  retainedClientId === firstRequestedClientId && retriedClientId === retainedClientId && submittedPayload.submissionId === retainedClientId,
  "Retries should reuse the submission ID retained before the failed request."
);
assert(submitted === "", "Submission helper should accept a parsed JSON success response.");

const root = process.cwd();
const appSource = fs.readFileSync(path.join(root, "src", "App.jsx"), "utf8");
const idAssignment = appSource.indexOf("pendingSubmissionId.current ||= crypto.randomUUID()");
const requestDispatch = appSource.indexOf("submitFormPayload(", idAssignment);
assert(
  appSource.includes('pendingSubmissionId.current = ""') &&
    idAssignment !== -1 && requestDispatch > idAssignment,
  "LeadForm should retain retry identity before the request and clear it on reset."
);

function loadAppsScript(fileName, globals = {}) {
  const context = vm.createContext({ console, ...globals });
  const source = fs.readFileSync(path.join(root, "scripts", fileName), "utf8");
  vm.runInContext(source, context, { filename: fileName });
  return context;
}

const bridgeHelpers = loadAppsScript("website-bridge-apps-script.js");
dangerousCells.forEach((value) => {
  const sanitized = bridgeHelpers.sanitizeSheetCell_(value);
  assert(sanitized === `'${value}`, `Bridge Sheet boundary should neutralize ${JSON.stringify(value)}`);
  assert(bridgeHelpers.sanitizeSheetCell_(sanitized) === sanitized, "Bridge Sheet encoding should be idempotent.");
});
assert(
  bridgeHelpers.sanitizeValuesForSheet_("Lead Dashboard", [["=SUM(1,1)"]])[0][0] === "=SUM(1,1)",
  "Bridge should preserve trusted dashboard formulas."
);
assert(
  bridgeHelpers.sanitizeValuesForSheet_("Website Leads", [["=SUM(1,1)"]])[0][0] === "'=SUM(1,1)",
  "Bridge should defensively neutralize Website Leads writes."
);

const legacyHelpers = loadAppsScript("google-apps-script.js");
dangerousCells.forEach((value) => {
  const sanitized = legacyHelpers.sanitizeSheetCell_(value);
  assert(sanitized === `'${value}`, `Legacy webhook Sheet boundary should neutralize ${JSON.stringify(value)}`);
  assert(legacyHelpers.sanitizeSheetCell_(sanitized) === sanitized, "Legacy Sheet encoding should be idempotent.");
});

class MockRange {
  constructor(sheet, row, column, rowCount, columnCount) {
    this.sheet = sheet;
    this.row = row;
    this.column = column;
    this.rowCount = rowCount;
    this.columnCount = columnCount;
  }

  getDisplayValues() {
    return Array.from({ length: this.rowCount }, (_, rowOffset) =>
      Array.from({ length: this.columnCount }, (_, columnOffset) =>
        this.sheet.rows[this.row - 1 + rowOffset]?.[this.column - 1 + columnOffset] ?? ""
      )
    );
  }

  setValues(values) {
    values.forEach((row, rowOffset) => {
      const targetRow = this.row - 1 + rowOffset;
      if (!this.sheet.rows[targetRow]) this.sheet.rows[targetRow] = [];
      row.forEach((value, columnOffset) => {
        this.sheet.rows[targetRow][this.column - 1 + columnOffset] = value;
      });
    });
    return this;
  }
}

class MockSheet {
  constructor(name) {
    this.name = name;
    this.rows = [];
  }

  getLastRow() {
    return this.rows.length;
  }

  getLastColumn() {
    return this.rows.reduce((maximum, row) => Math.max(maximum, row.length), 0);
  }

  getRange(row, column, rowCount = 1, columnCount = 1) {
    return new MockRange(this, row, column, rowCount, columnCount);
  }

  appendRow(row) {
    this.rows.push([...row]);
  }
}

class MockSpreadsheet {
  constructor() {
    this.sheets = new Map();
  }

  getSheetByName(name) {
    return this.sheets.get(name) || null;
  }

  insertSheet(name) {
    const sheet = new MockSheet(name);
    this.sheets.set(name, sheet);
    return sheet;
  }
}

const spreadsheet = new MockSpreadsheet();
const lockState = { acquired: 0, released: 0 };
const notifications = [];
const bridge = loadAppsScript("website-bridge-apps-script.js", {
  LockService: {
    getScriptLock() {
      return {
        waitLock() {
          lockState.acquired += 1;
        },
        releaseLock() {
          lockState.released += 1;
        }
      };
    }
  },
  MailApp: {
    sendEmail(message) {
      notifications.push(message);
    }
  },
  PropertiesService: {
    getScriptProperties() {
      return { getProperty: () => "forms@example.test" };
    }
  },
  SpreadsheetApp: {
    openById() {
      return spreadsheet;
    }
  }
});

const rawHeaders = ["Submitted At", "Submission ID", "Name", "Lead Summary"];
const queueHeaders = [
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
const submissionId = "security-test-id";
const bridgeBody = {
  spreadsheetId: "test-sheet",
  sheetName: "Website Leads",
  submissionHeaders: rawHeaders,
  submissionRow: ["2026-08-25T00:00:00.000Z", submissionId, "=Danger", "=Danger | Email: test@example.com"],
  notificationRow: ["2026-08-25T00:00:00.000Z", submissionId, "=Danger", "=Danger | Email: test@example.com"],
  leadQueueSheetName: "Lead Queue",
  leadQueueHeaders: queueHeaders,
  leadQueueRow: [
    "",
    "",
    "",
    "",
    "",
    "2026-08-25T00:00:00.000Z",
    "=Danger",
    "test@example.com",
    "",
    "Website Contact",
    "Normal",
    "General question",
    "",
    "",
    "Reply",
    "=Danger | Email: test@example.com",
    submissionId,
    ""
  ]
};

const firstAppend = bridge.appendWebsiteSubmission_(bridgeBody);
assert(!firstAppend.duplicate && !firstAppend.repaired, "First logical submission should append both rows.");
assert(firstAppend.notifications.sent === 1 && notifications.length === 1, "First submission should notify once.");
assert(
  spreadsheet.getSheetByName("Website Leads").rows[1][2] === "'=Danger" &&
    spreadsheet.getSheetByName("Website Leads").rows[1][3] === "'=Danger | Email: test@example.com",
  "Bridge should protect both direct and derived Website Leads cells."
);
assert(
  spreadsheet.getSheetByName("Lead Queue").rows[1][6] === "'=Danger" &&
    spreadsheet.getSheetByName("Lead Queue").rows[1][15] === "'=Danger | Email: test@example.com",
  "Bridge should protect both direct and derived Lead Queue cells."
);

const exactRetry = bridge.appendWebsiteSubmission_({
  ...bridgeBody,
  submissionRow: ["2026-08-25T00:01:00.000Z", ...bridgeBody.submissionRow.slice(1)],
  leadQueueRow: [
    ...bridgeBody.leadQueueRow.slice(0, 5),
    "2026-08-25T00:01:00.000Z",
    ...bridgeBody.leadQueueRow.slice(6)
  ]
});
assert(exactRetry.duplicate && !exactRetry.repaired, "Exact retry should return duplicate true.");
assert(notifications.length === 1, "Exact retry should not send a second notification.");
assert(spreadsheet.getSheetByName("Website Leads").rows.length === 2, "Exact retry should not duplicate Website Leads.");
assert(spreadsheet.getSheetByName("Lead Queue").rows.length === 2, "Exact retry should not duplicate Lead Queue.");

spreadsheet.getSheetByName("Lead Queue").rows.splice(1, 1);
const repairedRetry = bridge.appendWebsiteSubmission_(bridgeBody);
assert(repairedRetry.duplicate && repairedRetry.repaired, "Raw-only state should repair Lead Queue as a duplicate.");
assert(spreadsheet.getSheetByName("Lead Queue").rows.length === 2, "Repair should restore the missing queue row.");
assert(notifications.length === 1, "Repair should not duplicate the raw-lead notification.");

let conflictError;
try {
  bridge.appendWebsiteSubmission_({
    ...bridgeBody,
    submissionRow: [...bridgeBody.submissionRow.slice(0, 2), "Different family", "Different family summary"],
    leadQueueRow: [
      ...bridgeBody.leadQueueRow.slice(0, 6),
      "Different family",
      ...bridgeBody.leadQueueRow.slice(7, 15),
      "Different family summary",
      ...bridgeBody.leadQueueRow.slice(16)
    ]
  });
} catch (error) {
  conflictError = error;
}
assert(conflictError?.code === "SUBMISSION_ID_CONFLICT", "Same ID with different data should be rejected.");
assert(lockState.acquired === lockState.released, "Bridge lock should always be released.");

const legacySpreadsheet = new MockSpreadsheet();
const legacyNotifications = [];
const legacyLockState = { acquired: 0, released: 0 };
const legacy = loadAppsScript("google-apps-script.js", {
  ContentService: {
    MimeType: { JSON: "application/json" },
    createTextOutput(value) {
      return {
        text: value,
        setMimeType() {
          return this;
        }
      };
    }
  },
  LockService: {
    getScriptLock() {
      return {
        waitLock() {
          legacyLockState.acquired += 1;
        },
        releaseLock() {
          legacyLockState.released += 1;
        }
      };
    }
  },
  MailApp: {
    sendEmail(message) {
      legacyNotifications.push(message);
    }
  },
  PropertiesService: {
    getScriptProperties() {
      return {
        getProperty(name) {
          if (name === "SHEET_ID") return "legacy-test-sheet";
          if (name === "SHEET_NAME") return "Website Leads";
          if (name === "NOTIFY_EMAIL") return "forms@example.test";
          return "";
        }
      };
    }
  },
  SpreadsheetApp: {
    openById() {
      return legacySpreadsheet;
    }
  }
});

const retiredLegacy = JSON.parse(
  legacy.doPost({
    postData: { contents: JSON.stringify({ submissionId: "retired-check", formType: "contact" }) }
  }).text
);
assert(retiredLegacy.code === "LEGACY_WEBHOOK_RETIRED", "Legacy public webhook should fail closed by default.");
legacy.LEGACY_WEBHOOK_RETIRED = false;

const missingLegacyId = JSON.parse(
  legacy.doPost({ postData: { contents: JSON.stringify({ formType: "contact" }) } }).text
);
assert(
  missingLegacyId.code === "MISSING_SUBMISSION_ID",
  "Direct legacy webhook submissions without a stable ID should be rejected."
);

const legacyPayload = {
  submittedAt: "2026-08-25T00:00:00.000Z",
  submissionId: "legacy-security-test-id",
  formType: "contact",
  leadType: "Website Contact",
  replyPriority: "Normal",
  name: "=Legacy Danger",
  email: "test@example.com",
  inquiryType: "General question",
  recommendedNextStep: "Reply",
  leadSummary: "=Legacy Danger | Email: test@example.com",
  message: "+cmd"
};
const firstLegacy = JSON.parse(
  legacy.doPost({ postData: { contents: JSON.stringify(legacyPayload) } }).text
);
assert(!firstLegacy.duplicate, "First legacy submission should append as new.");
assert(legacySpreadsheet.getSheetByName("Website Leads").rows.length === 2, "Legacy route should append Website Leads.");
assert(legacySpreadsheet.getSheetByName("Lead Queue").rows.length === 2, "Legacy route should append Lead Queue.");
assert(
  legacySpreadsheet.getSheetByName("Website Leads").rows[1][19] === "'=Legacy Danger" &&
    legacySpreadsheet.getSheetByName("Lead Queue").rows[1][6] === "'=Legacy Danger",
  "Legacy route should neutralize direct values in both Sheet representations."
);
assert(legacyNotifications.length === 1, "First legacy submission should send one notification.");

const duplicateLegacy = JSON.parse(
  legacy.doPost({ postData: { contents: JSON.stringify(legacyPayload) } }).text
);
assert(duplicateLegacy.duplicate, "Exact legacy retry should report duplicate true.");
assert(legacySpreadsheet.getSheetByName("Website Leads").rows.length === 2, "Legacy retry should not duplicate raw rows.");
assert(legacySpreadsheet.getSheetByName("Lead Queue").rows.length === 2, "Legacy retry should not duplicate queue rows.");
assert(legacyNotifications.length === 1, "Legacy retry should not duplicate notification email.");
assert(
  legacyLockState.acquired === legacyLockState.released,
  "Legacy webhook lock should always be released."
);

console.log("Focused form security regression tests passed without sending external emails or sheet rows.");
