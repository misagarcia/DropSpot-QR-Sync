function generateQRWithBinNumber() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Drop Spots List");

  // -----------------------------
  // 🔐 CONFIGURATION (SAFE PLACEHOLDERS)
  // -----------------------------
  const QR_OUTPUT_FOLDER_ID = "<QR_OUTPUT_FOLDER_ID>"; // e.g., Google Drive folder for final QR PNGs
  const CLOUD_NAME = "<CLOUDINARY_CLOUD_NAME>";
  const UPLOAD_PRESET = "<CLOUDINARY_UPLOAD_PRESET>";
  const API_KEY = "<CLOUDINARY_API_KEY>";
  const API_SECRET = "<CLOUDINARY_API_SECRET>";
  // -----------------------------

  const folder = DriveApp.getFolderById(QR_OUTPUT_FOLDER_ID);

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

  const lastRow = sheet.getLastRow();

  for (let row = 2; row <= lastRow; row++) {
    const binNumber = sheet.getRange(row, 3).getValue();   // Column C
    const qrUrl = sheet.getRange(row, 22).getValue();      // Column V

    if (!qrUrl || !binNumber) continue;

    // Fetch QR image from Column V
    const qrBlob = UrlFetchApp.fetch(qrUrl).getBlob();

    // -----------------------------
    // 🔥 SIGNED UPLOAD STARTS HERE
    // -----------------------------
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

    Logger.log(uploadResponse.getContentText());

    const uploaded = JSON.parse(uploadResponse.getContentText());
    const publicId = uploaded.public_id;

    if (!publicId) {
      throw new Error("Cloudinary upload failed: " + uploadResponse.getContentText());
    }
    // -----------------------------
    // 🔥 SIGNED UPLOAD ENDS HERE
    // -----------------------------

    // Add text under QR (unchanged)
    const labelText = `Site ID# ${binNumber}`;
    const encodedText = encodeURIComponent(labelText);

    const finalUrl =
      `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/` +
      `l_${publicId},w_300,h_300,c_fit,fl_no_overflow,g_center/` +  
      `l_text:Arial_12:${encodedText},co_rgb:000,g_south_east,x_15,y_5/` +
      `qr-frame_sqyibo.png`;

    const finalBlob = UrlFetchApp.fetch(finalUrl).getBlob().setName(binNumber + ".png");

    folder.createFile(finalBlob);
  }
}
