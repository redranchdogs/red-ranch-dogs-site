// Google Apps Script web app for spreadsheet logging.
// 1. Create a Google Sheet.
// 2. Extensions > Apps Script.
// 3. Paste this file.
// 4. Deploy > New deployment > Web app. Allow access to "Anyone".
// 5. Use the web app URL as FORM_WEBHOOK_URL in Vercel.
//
// Optional Script Properties can override the defaults below:
// SHEET_ID, NOTIFY_EMAIL

var DEFAULT_SHEET_ID = "1872yXbOwwtio73bK5wlZJKEaBez4czsGuU0bcYaxriE";
var DEFAULT_NOTIFY_EMAIL = "adam@redranchdogs.com";
var SUBMISSION_HEADERS = [
  "Submitted At",
  "Form Type",
  "Page",
  "Name",
  "Email",
  "Phone",
  "Preferred Breed",
  "Location",
  "Housing",
  "Fenced Yard",
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
  "Signature",
  "Message",
  "Source"
];

function doPost(e) {
  var payload = JSON.parse(e.postData.contents || "{}");
  var sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID") || DEFAULT_SHEET_ID;
  var notifyEmail =
    PropertiesService.getScriptProperties().getProperty("NOTIFY_EMAIL") || DEFAULT_NOTIFY_EMAIL;
  var sheet = SpreadsheetApp.openById(sheetId).getSheetByName("Submissions");

  if (!sheet) {
    sheet = SpreadsheetApp.openById(sheetId).insertSheet("Submissions");
    sheet.appendRow(SUBMISSION_HEADERS);
  } else {
    sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), SUBMISSION_HEADERS.length)).clearContent();
    sheet.getRange(1, 1, 1, SUBMISSION_HEADERS.length).setValues([SUBMISSION_HEADERS]);
  }

  sheet.appendRow([
    payload.submittedAt || new Date().toISOString(),
    payload.formType || "",
    payload.page || "",
    payload.name || "",
    payload.email || "",
    payload.phone || "",
    payload.preferredBreed || "",
    payload.location || "",
    payload.housing || "",
    payload.fencedYard || "",
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
    payload.signature || "",
    payload.message || "",
    payload.source || ""
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
