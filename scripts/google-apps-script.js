// Google Apps Script web app for spreadsheet logging.
// 1. Create a Google Sheet.
// 2. Extensions > Apps Script.
// 3. Paste this file.
// 4. Deploy > New deployment > Web app. Allow access to "Anyone".
// 5. Use the web app URL as FORM_WEBHOOK_URL in Vercel.
//
// Optional Script Properties can override the defaults below:
// SHEET_ID, SHEET_NAME, NOTIFY_EMAIL

var DEFAULT_SHEET_ID = "1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE";
var DEFAULT_SHEET_NAME = "Website Leads";
var DEFAULT_NOTIFY_EMAIL = "adam@redranchdogs.com";
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

  var sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID") || DEFAULT_SHEET_ID;
  var sheetName =
    PropertiesService.getScriptProperties().getProperty("SHEET_NAME") || DEFAULT_SHEET_NAME;
  var notifyEmail =
    PropertiesService.getScriptProperties().getProperty("NOTIFY_EMAIL") || DEFAULT_NOTIFY_EMAIL;
  var spreadsheet = SpreadsheetApp.openById(sheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(SUBMISSION_HEADERS);
  } else if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, SUBMISSION_HEADERS.length).setValues([SUBMISSION_HEADERS]);
  }

  sheet.appendRow([
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
  ]);

  if (notifyEmail) {
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

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON
  );
}
