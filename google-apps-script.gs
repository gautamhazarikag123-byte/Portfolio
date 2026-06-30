const SHEET_NAME = "Leads";
const SHEET_ID_PROPERTY = "PORTFOLIO_SHEET_ID";

const HEADERS = [
  "Submitted At",
  "Submission ID",
  "Name",
  "Email",
  "Phone",
  "Service",
  "Timeline",
  "Project Details",
  "Source Page",
  "User Agent"
];

// Run this function once from Apps Script before deploying the web app.
function setup() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error(
      "Open the target Google Sheet and use Extensions > Apps Script."
    );
  }

  PropertiesService
    .getScriptProperties()
    .setProperty(SHEET_ID_PROPERTY, spreadsheet.getId());

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  prepareSheet_(sheet);
  SpreadsheetApp.flush();

  return "Connected to: " + spreadsheet.getName();
}

function doPost(e) {
  let lock;

  try {
    if (!e || !e.parameter) {
      return jsonResponse_({
        status: "info",
        message: "doPost is called by the website. Run setup() or testSubmission() manually."
      });
    }

    const data = e && e.parameter ? e.parameter : {};

    if (cleanText_(data.website, 200)) {
      return jsonResponse_({ status: "success" });
    }

    const name = safeCell_(data.name, 150);
    const email = safeCell_(data.email, 200);
    const phone = safeCell_(data.phone, 50);
    const service = safeCell_(data.service, 150);
    const timeline = safeCell_(data.timeline, 150);
    const message = safeCell_(data.message, 5000);
    const source = safeCell_(data.source, 1000);
    const userAgent = safeCell_(data.userAgent, 1000);

    if (
      !name ||
      !email ||
      !phone ||
      !service ||
      !timeline ||
      !message
    ) {
      throw new Error("Required form fields are missing.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("The email address is invalid.");
    }

    if (!/^[0-9+() \-]{7,20}$/.test(phone)) {
      throw new Error("The phone number is invalid.");
    }

    lock = LockService.getScriptLock();
    lock.waitLock(10000);

    const spreadsheet = getSpreadsheet_();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    prepareSheet_(sheet);

    const submissionId = Utilities.getUuid();
    const rowNumber = sheet.getLastRow() + 1;

    sheet
      .getRange(rowNumber, 1, 1, HEADERS.length)
      .setValues([[
        new Date(),
        submissionId,
        name,
        email,
        phone,
        service,
        timeline,
        message,
        source,
        userAgent
      ]]);

    sheet
      .getRange(rowNumber, 1)
      .setNumberFormat("yyyy-mm-dd hh:mm:ss");

    sheet
      .getRange(rowNumber, 1, 1, HEADERS.length)
      .setVerticalAlignment("top");

    sheet.getRange(rowNumber, 8).setWrap(true);
    SpreadsheetApp.flush();

    return jsonResponse_({
      status: "success",
      submissionId: submissionId
    });
  } catch (error) {
    console.error(error);

    return jsonResponse_({
      status: "error",
      message: String(error && error.message ? error.message : error)
    });
  } finally {
    if (lock && lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

// Run this after setup() to verify that a row can be written.
function testSubmission() {
  const testEvent = {
    parameter: {
      name: "Test Client",
      email: "test@example.com",
      phone: "+91 98765 43210",
      service: "Website connection test",
      timeline: "Test submission",
      message: "Apps Script connection test. This row can be deleted.",
      website: "",
      source: "Apps Script testSubmission()",
      userAgent: "Google Apps Script"
    }
  };

  const response = doPost(testEvent);
  console.log(response.getContent());
  return response;
}

function doGet() {
  try {
    const spreadsheet = getSpreadsheet_();

    return jsonResponse_({
      status: "success",
      message: "Connected to " + spreadsheet.getName()
    });
  } catch (error) {
    return jsonResponse_({
      status: "error",
      message: String(error && error.message ? error.message : error)
    });
  }
}

function getSpreadsheet_() {
  const spreadsheetId = PropertiesService
    .getScriptProperties()
    .getProperty(SHEET_ID_PROPERTY);

  if (!spreadsheetId) {
    throw new Error("Run the setup() function once before deployment.");
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

function prepareSheet_(sheet) {
  if (sheet.getLastRow() !== 0) {
    return;
  }

  sheet
    .getRange(1, 1, 1, HEADERS.length)
    .setValues([HEADERS])
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#0b6861")
    .setVerticalAlignment("middle");

  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 38);
  sheet.setColumnWidth(1, 165);
  sheet.setColumnWidth(2, 250);
  sheet.setColumnWidth(3, 180);
  sheet.setColumnWidth(4, 230);
  sheet.setColumnWidth(5, 170);
  sheet.setColumnWidth(6, 190);
  sheet.setColumnWidth(7, 190);
  sheet.setColumnWidth(8, 420);
  sheet.setColumnWidth(9, 300);
  sheet.setColumnWidth(10, 350);
}

function cleanText_(value, maximumLength) {
  return String(value || "")
    .trim()
    .slice(0, maximumLength);
}

function safeCell_(value, maximumLength) {
  const text = cleanText_(value, maximumLength);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
