/**
 * QR_OnEdit.gs (Sanitized for GitHub)
 * v1.0.2
 *
 * Sensitive credentials removed:
 * - CLOUD_NAME
 * - UPLOAD_PRESET
 * - API_KEY
 * - API_SECRET
 *
 * Replace placeholders with your actual values in your private environment.
 */

function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;

  // Only run on the "Drop Spots List" sheet
  if (sheet.getName() !== "Drop Spots List") return;

  // Column W = 23
  if (range.getColumn() !== 23) return;

  // Only run when checkbox is checked (TRUE)
  if (range.getValue() !== true) return;

  const row = range.getRow();

  // Skip header row
  if (row === 1) return;

  // Run QR generation for this row only
  generateQRForRow(row);
}

function generateQRForRow(row) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Drop Spots List");

  // QR PNG output folder (safe to publish)
  const folder = DriveApp.getFolderById("125LAEN53Pc4Zv8Fj-2MYxqSH-6-oKe0I");

  // -----------------------------
  // 🔐 Cloudinary Credentials (REMOVED FOR GITHUB)
  // -----------------------------
  const CLOUD_NAME = "YOUR_CLOUD_NAME_HERE";
  const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET_HERE";
  const API_KEY = "YOUR_API_KEY_HERE";
  const API_SECRET = "YOUR_API_SECRET_HERE";

  // Cloudinary signature helper
  function cloudinarySign(params, apiSecret) {
    const sortedKeys = Object.keys(params).sort();
    const toSign = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join("&") + apiSecret;

    const signature = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_1,
      toSign,
      Utilities.Charset.UTF_8
    );

    return signature
      .map(b => (b + 256) % 256)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const binNumber = sheet.getRange(row, 3).getValue();   // Column C
  const qrUrl = sheet.getRange(row, 22).getValue();      // Column V

  if (!qrUrl || !binNumber) return;

  // Fetch QR image from Column V
  const qrBlob = UrlFetchApp.fetch(qrUrl).getBlob();

  // Signed upload
  const timestamp = String(Math.floor(Date.now() / 1000));

  const uploadParams = {
    timestamp: timestamp,
    upload_preset: UPLOAD_PRESET,
    public_id: `qr_${binNumber}_v${timestamp}`
  };

  const signature = cloudinarySign(uploadParams, API_SECRET);

  const payload = {
    file: qrBlob,
    api_key: API_KEY,
    timestamp: timestamp,
    upload_preset: UPLOAD_PRESET,
    public_id: `qr_${binNumber}_v${timestamp}`,
    signature: signature
  };

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const uploadResponse = UrlFetchApp.fetch(uploadUrl, {
    method: "post",
    payload: payload,
    muteHttpExceptions: true
  });

  const uploaded = JSON.parse(uploadResponse.getContentText());
  const publicId = uploaded.public_id;

  if (!publicId) {
    throw new Error("Cloudinary upload failed: " + uploadResponse.getContentText());
  }

  // Desired final size (updated)
  const TARGET_SIZE = 1225;

  // Encode text
  const labelText = `Site ID# ${binNumber}`;
  const encodedText = encodeURIComponent(labelText);

  // Cachebuster
  const cb = Date.now();

  // Cloudinary transformation pipeline
  const finalUrl =
    `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/` +
    `l_${publicId},w_${TARGET_SIZE},h_${TARGET_SIZE},c_fit,fl_no_overflow,g_center/` +
    `l_text:Arial_48:${encodedText},co_rgb:000,g_south_east,x_60,y_20/` +
    `qr-frame-1350_ghoebo.png?cb=${cb}`;

  const finalBlob = UrlFetchApp.fetch(finalUrl).getBlob().setName(binNumber + ".png");

  const pngFile = folder.createFile(finalBlob);
  generateTwoUpQRSheet(pngFile.getId(), binNumber);
}

function generateTwoUpQRSheet(fileId, binNumber) {
  // PDF output folder (safe to publish)
  const pdfFolder = DriveApp.getFolderById("1z8y1Blw2qKFq5vuX88uQf6ZziBlLhl38");

  const qrBlob = DriveApp.getFileById(fileId).getBlob();

  // Create a new Google Doc
  const doc = DocumentApp.create(`QR_${binNumber}_2UP_DOC`);
  const docId = doc.getId();
  const body = doc.getBody();

  // Margins
  body.setMarginTop(36);
  body.setMarginBottom(36);
  body.setMarginLeft(36);
  body.setMarginRight(36);

  // 2-up table
  const table = body.appendTable([[""], [""]]);
  table.setBorderWidth(0);

  const qrSizePoints = 433;

  for (let i = 0; i < 2; i++) {
    const cell = table.getCell(i, 0);
    cell.setPaddingTop(0);
    cell.setPaddingBottom(0);
    cell.setPaddingLeft(0);
    cell.setPaddingRight(0);
    cell.clear();

    const paragraph = cell.appendParagraph("");
    paragraph.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    const img = paragraph.appendInlineImage(qrBlob);
    img.setWidth(qrSizePoints);
    img.setHeight(qrSizePoints);
  }

  doc.saveAndClose();

  const pdfBlob = DriveApp.getFileById(docId)
    .getAs("application/pdf")
    .setName(`QR_${binNumber}_2UP.pdf`);

  pdfFolder.createFile(pdfBlob);

  // 🔍 DYNAMIC EMAIL TARGETER: Pull the active email recipient directly from cell Z3
  const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Drop Spots List");
  const fallbackEmail = "fail-safe@email-example.com"; // Your fail-safe email backup
  
  let dynamicEmail = targetSheet.getRange("Z3").getValue().toString().trim();
  
  // If cell Z3 is empty or accidentally cleared, fall back to your primary email automatically
  if (!dynamicEmail || dynamicEmail.indexOf("@") === -1) {
    dynamicEmail = fallbackEmail;
  }

  // 📩 EMAIL PIPELINE ENABLED (Now fully dynamic)
  MailApp.sendEmail({
    to: dynamicEmail,
    subject: `QR Code PRINT PDF for Bin ${binNumber}`,
    body: `Here is the generated 2-up QR code PDF for bin ${binNumber} at ${safeName}.`,
    attachments: [pdfBlob]
  });

  DriveApp.getFileById(docId).setTrashed(true);

  return pdfBlob;
}
