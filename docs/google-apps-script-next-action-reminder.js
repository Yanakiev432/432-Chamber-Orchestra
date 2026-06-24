// @ts-nocheck -- Google Apps Script globals are provided by the Apps Script runtime.
/**
 * Starter only. This is not active production code.
 *
 * Expected sheet: "03 Sponsor Pipeline"
 * Expected columns:
 * Company / Person | Status | Next action | Next action date | Notes
 */

const RECIPIENT = "info@432hz-foundation.com";
const PIPELINE_TAB = "03 Sponsor Pipeline";

function sendDailyNextActionReminder() {
  // да се попълни: Google Sheet ID
  const spreadsheetId = "";

  if (!spreadsheetId) {
    throw new Error("Add the Google Sheet ID before enabling this script.");
  }

  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(PIPELINE_TAB);
  if (!sheet) {
    throw new Error(`Missing sheet tab: ${PIPELINE_TAB}`);
  }

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return;

  const headers = values[0].map(String);
  const column = (name) => {
    const index = headers.indexOf(name);
    if (index === -1) throw new Error(`Missing column: ${name}`);
    return index;
  };

  const companyIndex = column("Company / Person");
  const statusIndex = column("Status");
  const actionIndex = column("Next action");
  const dateIndex = column("Next action date");
  const notesIndex = column("Notes");
  const timezone = Session.getScriptTimeZone();
  const today = Utilities.formatDate(new Date(), timezone, "yyyy-MM-dd");

  const due = values.slice(1).filter((row) => {
    const value = row[dateIndex];
    if (!(value instanceof Date) && !value) return false;
    const date = value instanceof Date ? value : new Date(value);
    return Utilities.formatDate(date, timezone, "yyyy-MM-dd") === today;
  });

  if (!due.length) return;

  const body = due
    .map(
      (row) =>
        [
          `Company / Person: ${row[companyIndex]}`,
          `Status: ${row[statusIndex]}`,
          `Next action: ${row[actionIndex]}`,
          `Notes: ${row[notesIndex] || "-"}`
        ].join("\n")
    )
    .join("\n\n---\n\n");

  MailApp.sendEmail({
    to: RECIPIENT,
    subject: `432 sponsor next actions - ${today}`,
    body
  });
}
