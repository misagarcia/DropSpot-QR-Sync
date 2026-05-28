/**
 * Code.gs (Sanitized for GitHub)
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

function generateAllQRCodesAndPDFs() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Drop Spots List");

  // Output folders (safe to publish)
  const QR_FOLDER = DriveApp.getFolderById("125LAEN53Pc4Zv8Fj-2MYxqSH-6-oKe0I");
  const PDF_FOLDER = DriveApp.getFolderById("1z8y1Blw2qKFq5vuX88uQf6ZziBlLhl38");

  // -----------------------------
  // 🔐 Cloudinary Credentials (REMOVED FOR GITHUB)
  // -----------------------------
  const CLOUD_NAME = "YOUR_CLOUD_NAME_HERE";
  const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET_HERE";
  const API_KEY = "YOUR_API_KEY_HERE";
  const API_SECRET = "YOUR_API_SECRET_HERE";

  // Helper: Cloudinary signature
  function cloudinarySign(params, apiSecret) {
    const sortedKeys = Object.keys(params).sort();
    const toSign = sortedKeys.map(key => `${key}=${params[key]}`).join("&") + apiSecret;

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

  // Helper: sanitize business name for filenames
  function sanitizeName(name) {
    return name
      .toString()
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")   // replace spaces + illegal chars with hyphens
      .replace(/-+/g, "-")              // collapse multiple hyphens
      .replace(/^-|-$/g, "");           // trim hyphens from ends
  }

  const lastRow = sheet.getLastRow();

  for (let row = 2; row <= lastRow; row++) {
    const binNumber = sheet.getRange(row, 3).getValue();    // Column C
    const businessName = sheet.getRange(row, 4).getValue(); // Column D
    const qrUrl = sheet.getRange(row, 22).getValue();       // Column V

    if (!qrUrl || !binNumber || !businessName) continue;

    const safeName = sanitizeName(businessName);

    // Fetch QR image from Column V
    const qrBlob = UrlFetchApp.fetch(qrUrl).getBlob();

    // Upload QR to Cloudinary
    const timestamp = String(Math.floor(Date.now() / 1000));
    const uploadParams = {
      timestamp: timestamp,
      upload_preset: UPLOAD_PRESET,
      public_id: `qr_${binNumber}`
    };

    const signature = cloudinarySign(uploadParams, API_SECRET);

    const payload = {
      file: qrBlob,
      api_key: API_KEY,
      timestamp: timestamp,
      upload_preset: UPLOAD_PRESET,
      public_id: `qr_${binNumber}`,
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
    if (!publicId) continue;

    // Build high-res Cloudinary composite
    const TARGET_SIZE = 1225;
    const labelText = `Site ID# ${binNumber}`;
    const encodedText = encodeURIComponent(labelText);
    const cb = Date.now();

    const finalUrl =
      `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/` +
      `l_${publicId},w_${TARGET_SIZE},h_${TARGET_SIZE},c_fit,fl_no_overflow,g_center/` +
      `l_text:Arial_48:${encodedText},co_rgb:000,g_south_east,x_60,y_20/` +
      `qr-frame-1350_ghoebo.png?cb=${cb}`;

    const finalBlob = UrlFetchApp.fetch(finalUrl).getBlob()
      .setName(`QR_${binNumber}_${safeName}.png`);

    // Save QR PNG
    const pngFile = QR_FOLDER.createFile(finalBlob);

    // Generate 2-up PDF
    generateTwoUpPDF(pngFile.getId(), binNumber, safeName, PDF_FOLDER);
  }
}


/**
 * ⭐ 2-UP PDF GENERATOR
 * Creates a temporary Google Doc, inserts two QR images,
 * exports as PDF, saves to Drive, and deletes the Doc.
 */
function generateTwoUpPDF(fileId, binNumber, safeName, PDF_FOLDER) {
  const qrBlob = DriveApp.getFileById(fileId).getBlob();

  const doc = DocumentApp.create(`QR_Print_${binNumber}_${safeName}`);
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

  const qrSizePoints = 433; // tuned for 4.5" at 300dpi

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
    .setName(`QR-Print_${binNumber}_${safeName}.pdf`);

  PDF_FOLDER.createFile(pdfBlob);

  // Delete temp Doc
  DriveApp.getFileById(docId).setTrashed(true);
}
