/* eslint-disable no-unused-vars, no-undef */
// Red Ranch Dogs Website Bridge v3.2.
//
// Purpose:
// - Let Codex safely read and update Website Hub sheets through Apps Script.
// - Preserve manual sheet columns by allowing smart merge scripts to read first.
// - Create Drive folders by path for repeatable photo workflows.
// - Delete temporary sheet tabs created during diagnostics or workflow changes.
// - Format the Website Submissions workbook into a simple lead-management tool.
// - Send a notification email when a new raw website lead is appended.
//
// Setup:
// 1. Open the existing Red Ranch Dogs Website Bridge Apps Script project.
// 2. Replace the code with this file.
// 3. Project Settings > Script properties > add BRIDGE_SECRET.
// 4. Optional: add NOTIFY_EMAIL, defaulting to adam@redranchdogs.com.
// 5. Deploy > Manage deployments > Edit > New version > Deploy.

var FALLBACK_SECRET_KEY = "CHANGE_ME";
var DEFAULT_NOTIFY_EMAIL = "adam@redranchdogs.com";

function doGet() {
  return json_({
    ok: true,
    message: "Red Ranch Dogs bridge is working.",
    version: "3.2.0"
  });
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var expectedSecret =
      PropertiesService.getScriptProperties().getProperty("BRIDGE_SECRET") || FALLBACK_SECRET_KEY;

    if (!body.secret || body.secret !== expectedSecret) {
      return json_({ ok: false, error: "Unauthorized" });
    }

    if (body.action === "getSheetValues") {
      return json_(getSheetValues_(body));
    }

    if (body.action === "replaceSheet") {
      return json_(replaceSheet_(body));
    }

    if (body.action === "appendRows") {
      return json_(appendRows_(body));
    }

    if (body.action === "deleteSheet") {
      return json_(deleteSheet_(body));
    }

    if (body.action === "setupWebsiteSubmissionsWorkbook") {
      return json_(setupWebsiteSubmissionsWorkbook_(body));
    }

    if (body.action === "ensureFolder") {
      return json_(ensureFolder_(body));
    }

    if (body.action === "ensurePath") {
      return json_(ensurePath_(body));
    }

    return json_({ ok: false, error: "Unknown action: " + (body.action || "") });
  } catch (error) {
    return json_({
      ok: false,
      error: error && error.message ? error.message : String(error)
    });
  }
}

function getSheetValues_(body) {
  var sheet = getSheet_(body.spreadsheetId, body.sheetName);
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();

  if (!lastRow || !lastColumn) {
    return { ok: true, values: [] };
  }

  return {
    ok: true,
    values: sheet.getRange(1, 1, lastRow, lastColumn).getDisplayValues()
  };
}

function replaceSheet_(body) {
  var sheet = getSheet_(body.spreadsheetId, body.sheetName);
  var values = normalizeValues_(body.values || []);

  sheet.clearContents();

  if (values.length && values[0].length) {
    sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
  }

  return {
    ok: true,
    sheetName: body.sheetName,
    rows: values.length,
    columns: values[0] ? values[0].length : 0
  };
}

function appendRows_(body) {
  var sheet = getSheet_(body.spreadsheetId, body.sheetName);
  var values = normalizeValues_(body.values || []);
  var notificationResult = { sent: 0 };

  if (!values.length || !values[0].length) {
    return { ok: true, sheetName: body.sheetName, rows: 0, columns: 0 };
  }

  sheet
    .getRange(sheet.getLastRow() + 1, 1, values.length, values[0].length)
    .setValues(values);

  if (body.sheetName === "Website Leads" && body.notifyEmail !== false) {
    notificationResult = sendLeadNotifications_(values);
  }

  return {
    ok: true,
    sheetName: body.sheetName,
    rows: values.length,
    columns: values[0].length,
    notifications: notificationResult
  };
}

function sendLeadNotifications_(rows) {
  var notifyEmail =
    PropertiesService.getScriptProperties().getProperty("NOTIFY_EMAIL") || DEFAULT_NOTIFY_EMAIL;
  var result = { sent: 0 };

  if (!notifyEmail) {
    return result;
  }

  rows.forEach(function (row) {
    try {
      MailApp.sendEmail({
        to: notifyEmail,
        subject: buildLeadNotificationSubject_(row),
        body: buildLeadNotificationBody_(row)
      });
      result.sent += 1;
    } catch (error) {
      result.error = error && error.message ? error.message : String(error);
    }
  });

  return result;
}

function buildLeadNotificationSubject_(row) {
  return [
    "Red Ranch Dogs",
    cell_(row, 4) || cell_(row, 2) || "Website form",
    cell_(row, 23) || cell_(row, 22) || cell_(row, 25)
  ]
    .filter(Boolean)
    .join(" - ");
}

function buildLeadNotificationBody_(row) {
  return [
    "A new Red Ranch Dogs website form submission came in.",
    "",
    "Submitted: " + cell_(row, 0),
    "Form: " + (cell_(row, 3) || cell_(row, 2)),
    "Lead type: " + (cell_(row, 4) || cell_(row, 5)),
    "Priority: " + cell_(row, 7),
    "Next step: " + cell_(row, 8),
    "",
    "Name: " + cell_(row, 19),
    "Email: " + cell_(row, 20),
    "Phone: " + cell_(row, 21),
    "Breed / interest: " + (cell_(row, 23) || cell_(row, 24) || cell_(row, 25) || cell_(row, 22)),
    "Timing: " + (cell_(row, 43) || cell_(row, 27) || cell_(row, 51)),
    "Location: " + cell_(row, 35),
    "",
    "Summary:",
    cell_(row, 9),
    "",
    "Message:",
    cell_(row, 54),
    "",
    "Submission ID: " + cell_(row, 1),
    "Source page: " + (cell_(row, 11) || cell_(row, 10))
  ].join("\n");
}

function cell_(row, index) {
  return row[index] || "";
}

function deleteSheet_(body) {
  if (!body.spreadsheetId) {
    throw new Error("spreadsheetId is required.");
  }

  if (!body.sheetName) {
    throw new Error("sheetName is required.");
  }

  var spreadsheet = SpreadsheetApp.openById(body.spreadsheetId);
  var sheet = spreadsheet.getSheetByName(body.sheetName);

  if (!sheet) {
    return {
      ok: true,
      deleted: false,
      sheetName: body.sheetName,
      message: "Sheet did not exist."
    };
  }

  if (spreadsheet.getSheets().length <= 1) {
    throw new Error("Cannot delete the only sheet in a spreadsheet.");
  }

  spreadsheet.deleteSheet(sheet);

  return {
    ok: true,
    deleted: true,
    sheetName: body.sheetName
  };
}

function setupWebsiteSubmissionsWorkbook_(body) {
  if (!body.spreadsheetId) {
    throw new Error("spreadsheetId is required.");
  }

  var spreadsheet = SpreadsheetApp.openById(body.spreadsheetId);
  var dashboard = getOrCreateSheet_(spreadsheet, "Lead Dashboard");
  var queue = getOrCreateSheet_(spreadsheet, "Lead Queue");
  var templates = getOrCreateSheet_(spreadsheet, "Reply Templates");
  var notes = getOrCreateSheet_(spreadsheet, "Workflow Notes");
  var closed = getOrCreateSheet_(spreadsheet, "Closed Leads");
  var raw = getOrCreateSheet_(spreadsheet, "Website Leads");

  applyTabOrder_(spreadsheet, [
    "Lead Dashboard",
    "Lead Queue",
    "Reply Templates",
    "Workflow Notes",
    "Closed Leads",
    "Website Leads"
  ]);

  hideSheetIfPresent_(spreadsheet, "Sheet1");
  hideSheetIfPresent_(spreadsheet, "Submissions");

  writeDashboardContent_(dashboard);
  formatDashboard_(dashboard);
  formatLeadQueue_(queue);
  formatSimpleTable_(templates, "#A31B16");
  formatSimpleTable_(notes, "#4E463B");
  formatSimpleTable_(closed, "#7F1D1D");
  formatWebsiteLeads_(raw);

  return {
    ok: true,
    action: "setupWebsiteSubmissionsWorkbook",
    spreadsheetId: body.spreadsheetId,
    formattedTabs: [
      "Lead Dashboard",
      "Lead Queue",
      "Reply Templates",
      "Workflow Notes",
      "Closed Leads",
      "Website Leads"
    ]
  };
}

function writeDashboardContent_(sheet) {
  sheet.getRange("A1:D18").setValues([
    ["Website Submissions Dashboard", "", "", ""],
    ["Use this as the quick daily view. The Lead Queue is the only tab you need to work from most days.", "", "", ""],
    ["Metric", "Formula / Value", "What it means", "Action"],
    ["Total raw submissions", "=MAX(COUNTA('Website Leads'!A2:A),0)", "Everything that has come through the website.", "No action needed."],
    [
      "Unworked / blank status",
      '=COUNTIFS(\'Lead Queue\'!F2:F,"<>",\'Lead Queue\'!A2:A,"")',
      "Rows without a status chosen yet.",
      "Start here each day."
    ],
    [
      "Needs reply",
      '=COUNTIFS(\'Lead Queue\'!F2:F,"<>",\'Lead Queue\'!A2:A,"Needs reply")',
      "People who still need a response.",
      "Reply or text."
    ],
    [
      "Follow up",
      '=COUNTIFS(\'Lead Queue\'!F2:F,"<>",\'Lead Queue\'!A2:A,"Follow up")',
      "People waiting on a later follow-up.",
      "Check Follow Up Date."
    ],
    [
      "Waiting on family",
      '=COUNTIFS(\'Lead Queue\'!F2:F,"<>",\'Lead Queue\'!A2:A,"Waiting on family")',
      "You have replied and they owe you an answer.",
      "No action unless date is due."
    ],
    [
      "On waitlist",
      '=COUNTIFS(\'Lead Queue\'!F2:F,"<>",\'Lead Queue\'!A2:A,"On waitlist")',
      "Families who have moved into waitlist tracking.",
      "Confirm they are also on the public/internal waitlist if needed."
    ],
    ["", "", "", ""],
    ["Quick status guide", "", "", ""],
    ["New", "", "Fresh lead that has not been worked yet.", "Choose a next action."],
    ["Needs reply", "", "Needs Adam/Callie/Nicole to reply.", "Reply today if possible."],
    ["Replied", "", "You responded and no follow-up is needed yet.", "Add follow-up date only if needed."],
    ["Follow up", "", "You need to check back later.", "Set Follow Up Date."],
    ["Deposit info sent", "", "Deposit/payment instructions were sent.", "Watch for payment and update outcome."],
    ["Waiting on family", "", "They owe you an answer.", "Leave alone unless due."],
    ["On waitlist", "", "They joined a breed waitlist.", "Make sure waitlist sheet is updated."]
  ]);
}

function ensureFolder_(body) {
  if (!body.parentFolderId) {
    throw new Error("parentFolderId is required.");
  }

  if (!body.name) {
    throw new Error("name is required.");
  }

  var parent = DriveApp.getFolderById(body.parentFolderId);
  var folder = findOrCreateFolder_(parent, body.name);

  return {
    ok: true,
    id: folder.getId(),
    name: folder.getName(),
    url: folder.getUrl()
  };
}

function ensurePath_(body) {
  if (!body.parentFolderId) {
    throw new Error("parentFolderId is required.");
  }

  if (!Array.isArray(body.pathParts) || !body.pathParts.length) {
    throw new Error("pathParts must be a non-empty array.");
  }

  var folder = DriveApp.getFolderById(body.parentFolderId);

  body.pathParts.forEach(function (part) {
    folder = findOrCreateFolder_(folder, part);
  });

  return {
    ok: true,
    id: folder.getId(),
    name: folder.getName(),
    url: folder.getUrl()
  };
}

function getSheet_(spreadsheetId, sheetName) {
  if (!spreadsheetId) {
    throw new Error("spreadsheetId is required.");
  }

  if (!sheetName) {
    throw new Error("sheetName is required.");
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  return sheet;
}

function getOrCreateSheet_(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  return sheet;
}

function applyTabOrder_(spreadsheet, tabNames) {
  tabNames.forEach(function (tabName, index) {
    var sheet = spreadsheet.getSheetByName(tabName);

    if (sheet) {
      spreadsheet.setActiveSheet(sheet);
      spreadsheet.moveActiveSheet(index + 1);
      sheet.showSheet();
    }
  });
}

function hideSheetIfPresent_(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet || spreadsheet.getSheets().length <= 1) {
    return;
  }

  sheet.hideSheet();
}

function ensureSheetSize_(sheet, minRows, minColumns) {
  if (sheet.getMaxRows() < minRows) {
    sheet.insertRowsAfter(sheet.getMaxRows(), minRows - sheet.getMaxRows());
  }

  if (sheet.getMaxColumns() < minColumns) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), minColumns - sheet.getMaxColumns());
  }
}

function formatDashboard_(sheet) {
  ensureSheetSize_(sheet, 25, 4);
  sheet.setTabColor("#A31B16");
  sheet.setFrozenRows(1);
  sheet.getDataRange().setWrap(true).setVerticalAlignment("middle");

  sheet
    .getRange("A1:D1")
    .setBackground("#A31B16")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(12)
    .setHorizontalAlignment("center");

  sheet.getRange("A2:D18").setBackground("#FFF8EC");
  sheet.getRange("A2:A18").setFontWeight("bold").setFontColor("#2B2720");
  sheet.getRange("B2:B8").setFontWeight("bold").setFontColor("#A31B16").setHorizontalAlignment("center");
  sheet.getRange("A10:D10").setBackground("#EFE0CD").setFontWeight("bold");
  sheet.getRange("A11:A18").setHorizontalAlignment("center").setFontWeight("bold").setFontColor("#A31B16");

  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(3, 230);
  sheet.setColumnWidth(4, 430);
  sheet.setRowHeights(1, 18, 38);
}

function formatLeadQueue_(sheet) {
  ensureSheetSize_(sheet, 1000, 18);
  sheet.setTabColor("#A31B16");
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(5);
  sheet.getDataRange().setWrap(false).setVerticalAlignment("middle");

  sheet
    .getRange("A1:R1")
    .setBackground("#A31B16")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  sheet.getRange("A2:E1000").setBackground("#FFF3EA");
  sheet.getRange("F2:R1000").setBackground("#FFFBF3");
  sheet.getRange("B2:B1000").setNumberFormat("m/d/yyyy");
  sheet.getRange("P2:P1000").setWrap(true).setVerticalAlignment("top");
  sheet.getRange("R2:R1000").setBackground("#FFF8EC");
  sheet.getRange("R2:R1000").setWrap(true).setVerticalAlignment("top");
  applyCompactRows_(sheet, 1000, 30);
  sheet.setRowHeight(1, 38);

  setDropdown_(sheet.getRange("A2:A1000"), [
    "New",
    "Needs reply",
    "Replied",
    "Follow up",
    "Deposit info sent",
    "Waiting on family",
    "On waitlist",
    "Not a fit",
    "Closed",
    "Test/delete"
  ]);
  setDropdown_(sheet.getRange("C2:C1000"), ["Adam", "Callie", "Nicole", "Unassigned"]);
  setDropdown_(sheet.getRange("D2:D1000"), [
    "Reply today",
    "Text family",
    "Send deposit info",
    "Ask one question",
    "Schedule call",
    "Add to waitlist",
    "Check payment",
    "Archive/ignore",
    "No action"
  ]);
  setDropdown_(sheet.getRange("E2:E1000"), [
    "Approved to waitlist",
    "Ask about available puppy",
    "Sent deposit info",
    "Joined waitlist",
    "Needs more info",
    "Not ready",
    "Not a fit",
    "Closed",
    "Test/delete"
  ]);

  applyLeadQueueConditionalFormatting_(sheet);
  recreateFilter_(sheet, "A1:R1000");

  setColumnWidths_(sheet, [
    125,
    115,
    105,
    155,
    165,
    145,
    170,
    230,
    130,
    145,
    115,
    170,
    155,
    165,
    230,
    420,
    170,
    320
  ]);
}

function formatSimpleTable_(sheet, color) {
  ensureSheetSize_(sheet, 50, Math.max(sheet.getMaxColumns(), 6));
  sheet.setTabColor(color);
  sheet.setFrozenRows(1);
  sheet.getDataRange().setWrap(false).setVerticalAlignment("middle");

  var lastColumn = Math.max(sheet.getLastColumn(), 1);
  sheet
    .getRange(1, 1, 1, lastColumn)
    .setBackground(color)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, lastColumn).setBackground("#FFFBF3");
  }

  applyCompactRows_(sheet, Math.max(sheet.getLastRow(), 50), 28);
  sheet.autoResizeColumns(1, lastColumn);
  recreateFilterIfData_(sheet);
}

function formatWebsiteLeads_(sheet) {
  ensureSheetSize_(sheet, 1000, Math.max(sheet.getMaxColumns(), 58));
  sheet.setTabColor("#2F3A45");
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(9);
  sheet.getDataRange().setWrap(false).setVerticalAlignment("middle");

  var lastColumn = Math.max(sheet.getLastColumn(), 1);
  var lastRow = Math.max(sheet.getLastRow(), 1);

  sheet
    .getRange(1, 1, 1, lastColumn)
    .setBackground("#2F3A45")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastColumn).setBackground("#FFFBF3");
  }

  applyCompactRows_(sheet, 1000, 26);
  sheet.setRowHeight(1, 38);
  sheet.setColumnWidths(1, Math.min(lastColumn, 58), 120);

  setSafeColumnWidth_(sheet, 1, 145);
  setSafeColumnWidth_(sheet, 2, 175);
  setSafeColumnWidth_(sheet, 3, 140);
  setSafeColumnWidth_(sheet, 5, 155);
  setSafeColumnWidth_(sheet, 8, 110);
  setSafeColumnWidth_(sheet, 9, 230);
  setSafeColumnWidth_(sheet, 10, 360);
  setSafeColumnWidth_(sheet, 20, 165);
  setSafeColumnWidth_(sheet, 21, 230);
  setSafeColumnWidth_(sheet, 22, 140);
  setSafeColumnWidth_(sheet, 36, 170);

  recreateFilterIfData_(sheet);
}

function applyCompactRows_(sheet, rowCount, height) {
  var rows = Math.min(sheet.getMaxRows(), rowCount);

  if (rows > 1) {
    sheet.setRowHeights(2, rows - 1, height);
  }
}

function setSafeColumnWidth_(sheet, column, width) {
  if (sheet.getMaxColumns() >= column) {
    sheet.setColumnWidth(column, width);
  }
}

function recreateFilterIfData_(sheet) {
  if (sheet.getLastRow() < 1 || sheet.getLastColumn() < 1) {
    return;
  }

  recreateFilter_(sheet, sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), Math.max(sheet.getLastColumn(), 1)).getA1Notation());
}

function setDropdown_(range, options) {
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(options, true)
    .setAllowInvalid(false)
    .build();

  range.setDataValidation(rule);
}

function setColumnWidths_(sheet, widths) {
  widths.forEach(function (width, index) {
    sheet.setColumnWidth(index + 1, width);
  });
}

function recreateFilter_(sheet, rangeA1) {
  var filter = sheet.getFilter();

  if (filter) {
    filter.remove();
  }

  sheet.getRange(rangeA1).createFilter();
}

function applyLeadQueueConditionalFormatting_(sheet) {
  var statusRange = sheet.getRange("A2:A1000");
  var dateRange = sheet.getRange("B2:B1000");
  var rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Needs reply")
      .setBackground("#FEE2E2")
      .setFontColor("#7F1D1D")
      .setRanges([statusRange])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Follow up")
      .setBackground("#FEF3C7")
      .setFontColor("#78350F")
      .setRanges([statusRange])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Deposit info sent")
      .setBackground("#DBEAFE")
      .setFontColor("#1E3A8A")
      .setRanges([statusRange])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("On waitlist")
      .setBackground("#DCFCE7")
      .setFontColor("#14532D")
      .setRanges([statusRange])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenDateBefore(SpreadsheetApp.RelativeDate.TODAY)
      .setBackground("#FEE2E2")
      .setRanges([dateRange])
      .build()
  ];

  sheet.setConditionalFormatRules(rules);
}

function findOrCreateFolder_(parent, name) {
  var folders = parent.getFoldersByName(name);

  if (folders.hasNext()) {
    return folders.next();
  }

  return parent.createFolder(name);
}

function normalizeValues_(values) {
  if (!Array.isArray(values)) {
    throw new Error("values must be an array of rows.");
  }

  var maxColumns = 0;

  values.forEach(function (row) {
    if (!Array.isArray(row)) {
      throw new Error("Each value row must be an array.");
    }

    maxColumns = Math.max(maxColumns, row.length);
  });

  return values.map(function (row) {
    var normalized = row.map(function (cell) {
      return cell === null || cell === undefined ? "" : String(cell);
    });

    while (normalized.length < maxColumns) {
      normalized.push("");
    }

    return normalized;
  });
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
