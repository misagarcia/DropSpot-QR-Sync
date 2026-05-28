/**
 * onEdit trigger — runs when the "Generate" checkbox is checked.
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

  generateQRForRow(row);
}

/**
 * Main QR generation workflow for a single row.
 */
function generateQRForRow(row) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Drop Spots List");

  // 🔒 REPLACE WITH YOUR OWN FOLDER ID IN PRIVATE ENVIRONMENT
  const OUTPUT_FOLDER_ID = "YOUR_DRIVE_FOLDER_ID_HERE";
  const folder = DriveApp.getFolderById(OUTPUT_FOLDER_ID);

  // 🔒 CLOUDINARY CONFIG — SAFE PLACEHOLDERS FOR PUBLIC REPO
  const CLOUD_NAME = "YOUR_CLOUD_NAME";
  const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";

  // ❗ DO NOT STORE REAL API KEYS IN PUBLIC CODE
  const API_KEY = "YOUR_API_KEY";
  const API_SECRET = "YOUR_API_SECRET";

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

  // Add text under QR
  const labelText = `Site ID# ${binNumber}`;
  const encodedText = encodeURIComponent(labelText);

  // Cachebuster
  const cb = Date.now();

  // Composite QR with frame + text
  const finalUrl =
    `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/` +
    `l_${publicId},w_300,h_300,c_fit,fl_no_overflow,g_center/` +
    `l_text:Arial_12:${encodedText},co_rgb:000,g_south_east,x_15,y_5/` +
    `qr-frame_sqyibo.png?cb=${cb}`;

  const finalBlob = UrlFetchApp.fetch(finalUrl).getBlob().setName(binNumber + ".png");

  const pngFile = folder.createFile(finalBlob);
  createSixUpPDF(pngFile.getId(), binNumber);
}

/**
 * Creates a 6‑up (2×3) PDF layout for printing.
 */
function createSixUpPDF(pngFileId, binNumber) {

  // 🔒 REPLACE WITH YOUR OWN PDF OUTPUT FOLDER ID IN PRIVATE ENVIRONMENT
  const PDF_FOLDER_ID = "YOUR_PDF_FOLDER_ID_HERE";
  const pdfFolder = DriveApp.getFolderById(PDF_FOLDER_ID);

  const doc = DocumentApp.create(`QR_${binNumber}_PDF`);
  const docId = doc.getId();
  const body = doc.getBody();

  // Margins
  body.setMarginTop(5);
  body.setMarginBottom(5);
  body.setMarginLeft(50);
  body.setMarginRight(50);

  // Clear header/footer if present
  const header = doc.getHeader();
  if (header) header.clear();

  const footer = doc.getFooter();
  if (footer) footer.clear();

  // Create 3×2 table
  const table = body.appendTable([
    ["", ""],
    ["", ""],
    ["", ""]
  ]);

  table.setBorderWidth(0);

  // Remove padding + spacing
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) {
      const cell = table.getCell(r, c);

      cell.setPaddingTop(0);
      cell.setPaddingBottom(0);
      cell.setPaddingLeft(0);
      cell.setPaddingRight(0);

      const p = cell.appendParagraph("");
      p.setSpacingBefore(0);
      p.setSpacingAfter(0);
    }
  }

  // Insert QR images
  const pngFile = DriveApp.getFileById(pngFileId);
  const imageBlob = pngFile.getBlob();

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) {
      const cell = table.getCell(r, c);
      const img = cell.appendImage(imageBlob);

      img.setWidth(280);
      img.setHeight(280);

      img.getParent().asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    }
  }

  doc.saveAndClose();

  const pdfBlob = DriveApp.getFileById(docId)
    .getAs("application/pdf")
    .setName(`QR_${binNumber}.pdf`);

  pdfFolder.createFile(pdfBlob);

  // 🔒 REMOVE PERSONAL EMAIL BEFORE PUBLIC UPLOAD
  MailApp.sendEmail({
    to: "YOUR_EMAIL_HERE",
    subject: `QR Code PRINT PDF for Bin ${binNumber}`,
    body: `Here is the generated 6‑up QR code PDF for bin ${binNumber}.`,
    attachments: [pdfBlob]
  });

  DriveApp.getFileById(docId).setTrashed(true);
}
