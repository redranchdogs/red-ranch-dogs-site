// Retired legacy Google Apps Script web app for spreadsheet logging.
// Do not deploy this as a public form endpoint or configure FORM_WEBHOOK_URL in Vercel.
// The formula-safe writer remains for controlled teardown/forensic checks only.
//
// Optional Script Properties can override the defaults below:
// SHEET_ID, SHEET_NAME, NOTIFY_EMAIL

var DEFAULT_SHEET_ID = "1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE";
var DEFAULT_SHEET_NAME = "Website Leads";
var DEFAULT_NOTIFY_EMAIL = "adam@redranchdogs.com";
var LEGACY_WEBHOOK_RETIRED = true;
var SUBMISSION_HEADERS = [
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
  "Preferred Contact Method",
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
  "User Agent",
  "Google Click ID",
  "GBRAID",
  "WBRAID",
  "First Landing Page",
  "First Referrer",
  "First UTM Source",
  "First UTM Medium",
  "First UTM Campaign",
  "First UTM Content",
  "First UTM Term",
  "First Google Click ID",
  "First GBRAID",
  "First WBRAID",
  "Last Landing Page",
  "Last Referrer",
  "Last UTM Source",
  "Last UTM Medium",
  "Last UTM Campaign",
  "Last UTM Content",
  "Last UTM Term",
  "Last Google Click ID",
  "Last GBRAID",
  "Last WBRAID"
];
var LEAD_QUEUE_HEADERS = [
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

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, service: "red-ranch-dogs-forms", version: "forms-v2" })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var payload = JSON.parse(e.postData.contents || "{}");

  if (payload.companyWebsite) {
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
      ContentService.MimeType.JSON
    );
  }

  if (LEGACY_WEBHOOK_RETIRED) {
    return jsonResponse_({
      ok: false,
      code: "LEGACY_WEBHOOK_RETIRED",
      error: "This legacy form webhook is retired."
    });
  }

  if (!payload.submissionId) {
    return jsonResponse_({
      ok: false,
      code: "MISSING_SUBMISSION_ID",
      error: "submissionId is required."
    });
  }

  var sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID") || DEFAULT_SHEET_ID;
  var sheetName =
    PropertiesService.getScriptProperties().getProperty("SHEET_NAME") || DEFAULT_SHEET_NAME;
  var notifyEmail =
    PropertiesService.getScriptProperties().getProperty("NOTIFY_EMAIL") || DEFAULT_NOTIFY_EMAIL;
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var spreadsheet = SpreadsheetApp.openById(sheetId);
    var sheet = spreadsheet.getSheetByName(sheetName);
    var queueSheet = spreadsheet.getSheetByName("Lead Queue");

    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }
    if (!queueSheet) {
      queueSheet = spreadsheet.insertSheet("Lead Queue");
    }

    ensureHeaders_(sheet, SUBMISSION_HEADERS, sheetName);
    ensureHeaders_(queueSheet, LEAD_QUEUE_HEADERS, "Lead Queue");

    var submissionRow = [
    payload.submittedAt || new Date().toISOString(),
    payload.submissionId || "",
    payload.formType || "",
    payload.formTitle || "",
    payload.leadType || "",
    payload.leadLabel || "",
    payload.routingBucket || "",
    payload.replyPriority || "",
    payload.recommendedNextStep || "",
    payload.leadSummary || "",
    payload.page || "",
    payload.currentUrl || "",
    payload.landingPage || "",
    payload.referrer || "",
    payload.utmSource || "",
    payload.utmMedium || "",
    payload.utmCampaign || "",
    payload.utmContent || "",
    payload.utmTerm || "",
    payload.name || "",
    payload.email || "",
    payload.phone || "",
    payload.preferredContactMethod || "",
    payload.inquiryType || "",
    payload.preferredBreed || "",
    payload.programName || "",
    payload.preferredStud || "",
    payload.serviceType || "",
    payload.cycleTiming || "",
    payload.femaleDogName || "",
    payload.femaleDogBreed || "",
    payload.brucellosisStatus || "",
    payload.studGoals || "",
    payload.studPolicyAgreement || "",
    payload.guardianType || "",
    payload.guardianDistance || "",
    payload.location || "",
    payload.housing || "",
    payload.fencedYard || "",
    payload.childrenInHome || "",
    payload.otherPets || "",
    payload.dogExperience || "",
    payload.genderPreference || "",
    payload.sizePreference || "",
    payload.timing || "",
    payload.specificInterest || "",
    payload.homeDescription || "",
    payload.puppyFitNotes || "",
    payload.pickupOrDelivery || "",
    payload.processAgreement || "",
    payload.hearAbout || "",
    payload.guardianReason || "",
    payload.phoneCallTiming || "",
    payload.guardianAgreement || "",
    payload.signature || "",
    payload.message || "",
    payload.source || "",
    payload.userAgent || "",
    payload.gclid || "",
    payload.gbraid || "",
    payload.wbraid || "",
    payload.firstLandingPage || "",
    payload.firstReferrer || "",
    payload.firstUtmSource || "",
    payload.firstUtmMedium || "",
    payload.firstUtmCampaign || "",
    payload.firstUtmContent || "",
    payload.firstUtmTerm || "",
    payload.firstGclid || "",
    payload.firstGbraid || "",
    payload.firstWbraid || "",
    payload.lastLandingPage || "",
    payload.lastReferrer || "",
    payload.lastUtmSource || "",
    payload.lastUtmMedium || "",
    payload.lastUtmCampaign || "",
    payload.lastUtmContent || "",
    payload.lastUtmTerm || "",
    payload.lastGclid || "",
    payload.lastGbraid || "",
    payload.lastWbraid || ""
    ].map(sanitizeSheetCell_);
    var queueRow = legacyLeadQueueRow_(payload).map(sanitizeSheetCell_);

    var submissionId = comparableSheetCell_(submissionRow[1]);
    var existingRows = findSubmissionRows_(sheet, submissionId, 1, SUBMISSION_HEADERS.length);
    var existingQueueRows = findSubmissionRows_(
      queueSheet,
      submissionId,
      16,
      LEAD_QUEUE_HEADERS.length
    );
    var conflict = existingRows.some(function (existingRow) {
      return !submissionRowsMatch_(existingRow, submissionRow);
    });
    var queueConflict = existingQueueRows.some(function (existingRow) {
      return !queueRowsMatch_(existingRow, queueRow);
    });

    if (conflict || queueConflict) {
      return jsonResponse_({
        ok: false,
        code: "SUBMISSION_ID_CONFLICT",
        error: "Submission ID already exists with materially different data."
      });
    }

    var rawAlreadyExists = existingRows.length > 0;
    var queueAlreadyExists = existingQueueRows.length > 0;

    if (!rawAlreadyExists) {
      sheet.appendRow(submissionRow);
    }

    if (!queueAlreadyExists) {
      queueSheet.appendRow(queueRow);
    }

    if (!rawAlreadyExists && notifyEmail) {
      MailApp.sendEmail({
        to: notifyEmail,
        subject: "Red Ranch Dogs " + (payload.formType || "form") + " submission",
        body: Object.keys(payload)
          .map(function (key) {
            return key + ": " + payload[key];
          })
          .join("\n")
      });
    }

    return jsonResponse_({
      ok: true,
      duplicate: rawAlreadyExists || queueAlreadyExists,
      repaired: rawAlreadyExists !== queueAlreadyExists
    });
  } finally {
    lock.releaseLock();
  }
}

function ensureHeaders_(sheet, headers, sheetName) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }

  var existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getDisplayValues()[0];
  var matches =
    existing.length === headers.length &&
    headers.every(function (header, index) {
      return existing[index] === header;
    });

  if (!matches) {
    throw new Error("Sheet header mismatch for " + sheetName + ". Existing rows were preserved.");
  }
}

function findSubmissionRows_(sheet, submissionId, idIndex, columnCount) {
  if (!submissionId || sheet.getLastRow() <= 1) {
    return [];
  }

  return sheet
    .getRange(2, 1, sheet.getLastRow() - 1, columnCount)
    .getDisplayValues()
    .filter(function (row) {
      return comparableSheetCell_(row[idIndex]) === submissionId;
    });
}

function queueRowsMatch_(existingRow, candidateRow) {
  return candidateRow.every(function (cell, index) {
    return (
      index <= 5 ||
      index === 17 ||
      comparableSheetCell_(existingRow[index]) === comparableSheetCell_(cell)
    );
  });
}

function legacyLeadQueueRow_(payload) {
  return [
    "",
    "",
    "",
    "",
    "",
    payload.submittedAt || new Date().toISOString(),
    payload.name || "",
    payload.email || "",
    payload.phone || "",
    payload.leadType || payload.formType || "",
    payload.replyPriority || "",
    payload.preferredBreed ||
      payload.programName ||
      payload.preferredStud ||
      payload.specificInterest ||
      payload.inquiryType ||
      "",
    payload.timing || payload.cycleTiming || payload.phoneCallTiming || "",
    payload.location || "",
    payload.recommendedNextStep || "",
    payload.leadSummary || "",
    payload.submissionId || "",
    ""
  ];
}

function submissionRowsMatch_(existingRow, candidateRow) {
  return candidateRow.every(function (cell, index) {
    return index === 0 || comparableSheetCell_(existingRow[index]) === comparableSheetCell_(cell);
  });
}

function comparableSheetCell_(value) {
  return String(value === null || value === undefined ? "" : value).replace(
    /^'(?=[\t\r\n ]*[=+\-@])/,
    ""
  );
}

function sanitizeSheetCell_(value) {
  var cell = value === null || value === undefined ? "" : String(value);

  if (/^[\t\r\n ]*[=+\-@]/.test(cell)) {
    return "'" + cell;
  }

  return cell;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
