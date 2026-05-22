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

  // -----------------------------
  // 🔐 CONFIG VALUES (SAFE PLACEHOLDERS)
  // -----------------------------
  const folder = DriveApp.getFolderById(CONFIG.QR_OUTPUT_FOLDER_ID);
  const CLOUD_NAME = CONFIG.CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = CONFIG.CLOUDINARY_UPLOAD_PRESET;
  const API_KEY = CONFIG.CLOUDINARY_API_KEY;
  const API_SECRET = CONFIG.CLOUDINARY_API_SECRET;
  // -----------------------------

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

  // Cachebuster to force Cloudinary to regenerate composite
  const cb = Date.now();

  const finalUrl =
    `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/` +
    `l_${publicId},w_300,h_300,c_fit,fl_no_overflow,g_center/` +
    `l_text:Arial_12:${encodedText},co_rgb:000,g_south_east,x_15,y_5/` +
    `qr-frame_sqyibo.png?cb=${cb}`;

  const finalBlob = UrlFetchApp.fetch(finalUrl).getBlob().setName(binNumber + ".png");

  const pngFile = folder.createFile(finalBlob);
  createCenteredPDF(pngFile.getId(), binNumber);
}

function createCenteredPDF(pngFileId, binNumber) {
  // -----------------------------
  // 🔐 CONFIG VALUES (SAFE PLACEHOLDERS)
  // -----------------------------
  const pdfFolder = DriveApp.getFolderById(CONFIG.PDF_OUTPUT_FOLDER_ID);
  const EMAIL_RECIPIENT = CONFIG.EMAIL_RECIPIENT;
  // -----------------------------

  // Create a temporary Google Doc
  const doc = DocumentApp.create(`QR_${binNumber}_PDF`);
  const docId = doc.getId();
  const body = doc.getBody();

  // Set page size to 8.5 x 11 inches
  const pageWidth = 8.5 * 72;  // points
  const pageHeight = 11 * 72;
  body.setPageWidth(pageWidth);
  body.setPageHeight(pageHeight);

  // Insert a 1x1 table
  const table = body.appendTable([[""]]);
  const cell = table.getCell(0, 0);

  // Remove table borders
  table.setBorderWidth(0);

  // Remove padding
  cell.setPaddingTop(0);
  cell.setPaddingBottom(0);
  cell.setPaddingLeft(0);
  cell.setPaddingRight(0);

  // Insert a paragraph for vertical spacing
  const spacer = cell.appendParagraph("");
  spacer.setSpacingBefore(150);  // adjust this number to fine‑tune vertical centering

  // Insert the image
  const pngFile = DriveApp.getFileById(pngFileId);
  const imageBlob = pngFile.getBlob();
  const img = cell.appendImage(imageBlob);

  // Center horizontally using paragraph alignment
  img.getParent().asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  // Save and close
  doc.saveAndClose();

  // Export as PDF
  const pdfBlob = DriveApp.getFileById(docId)
    .getAs("application/pdf")
    .setName(`QR_${binNumber}.pdf`);

  // Save PDF to folder
  pdfFolder.createFile(pdfBlob);

  // Email the PDF
  MailApp.sendEmail({
    to: EMAIL_RECIPIENT,
    subject: `QR Code PRINT PDF for Bin ${binNumber}`,
    body: `Here is the generated QR code PDF for bin ${binNumber}.`,
    attachments: [pdfBlob]
  });

  // Delete temporary Doc
  DriveApp.getFileById(docId).setTrashed(true);
}
