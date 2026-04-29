/* eslint-disable no-unused-vars, no-undef */
// Red Ranch Dogs Website Bridge v2.
//
// Purpose:
// - Let Codex safely read and update Website Hub sheets through Apps Script.
// - Preserve manual sheet columns by allowing smart merge scripts to read first.
// - Create Drive folders by path for repeatable photo workflows.
//
// Setup:
// 1. Open the existing Red Ranch Dogs Website Bridge Apps Script project.
// 2. Replace the code with this file.
// 3. Project Settings > Script properties > add BRIDGE_SECRET.
// 4. Deploy > Manage deployments > Edit > New version > Deploy.

var FALLBACK_SECRET_KEY = "CHANGE_ME";

function doGet() {
  return json_({
    ok: true,
    message: "Red Ranch Dogs bridge is working.",
    version: "2.0.0"
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

  if (!values.length || !values[0].length) {
    return { ok: true, sheetName: body.sheetName, rows: 0, columns: 0 };
  }

  sheet
    .getRange(sheet.getLastRow() + 1, 1, values.length, values[0].length)
    .setValues(values);

  return {
    ok: true,
    sheetName: body.sheetName,
    rows: values.length,
    columns: values[0].length
  };
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
