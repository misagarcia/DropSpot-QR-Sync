# **Troubleshooting Guide**

This document provides solutions to common issues across the DropSpot Automation Platform, including Google Sheets automation, Cloudinary transformations, Duda form behavior, Cloudflare Worker processing, and the pending Constant Contact integration.

---

# **🟦 1. Google Sheets + Apps Script Issues**

## **1.1 PDF is blank or missing the QR code**
**Symptoms:**  
- PDF generates but contains no QR  
- PDF shows empty space where QR should be  

**Likely Causes:**  
- Cloudinary transformation URL failed  
- QR blob was not generated  
- Temporary Google Doc failed to insert the image  

**Fix:**  
- Check the Cloudinary URL in the script  
- Confirm the QR column in the sheet is generating a valid URL  
- Add logging inside the Apps Script to verify the blob exists before inserting  

---

## **1.2 QR code is not centered in the PDF**
**Symptoms:**  
- QR appears left‑aligned or off‑center  

**Likely Causes:**  
- Spacing or alignment settings in `DocumentApp` changed  
- Image width too large  

**Fix:**  
- Ensure the PDF creation uses:  
  ```js
  body.appendImage(qrBlob).setWidth(800);
  ```
- Add a spacer paragraph with `setSpacingBefore()`  

---

## **1.3 Script does nothing when checkbox is clicked**
**Symptoms:**  
- Checking the “Generate” box does not trigger automation  

**Likely Causes:**  
- `onEdit` trigger not installed  
- Checkbox column index changed  
- User edited a protected range  

**Fix:**  
- Go to **Extensions → Apps Script → Triggers**  
- Ensure an `onEdit` trigger exists  
- Confirm the checkbox column matches the script’s configuration  

---

## **1.4 Cloudinary upload fails**
**Symptoms:**  
- Script throws an error  
- No QR appears in Drive  
- PDF generation fails  

**Likely Causes:**  
- Cloudinary credentials expired or incorrect  
- Upload URL changed  
- Cloudinary rate limits (rare)  

**Fix:**  
- Verify Cloudinary API key and cloud name  
- Test upload manually using a simple POST request  
- Check Cloudinary dashboard for errors  

---

# **🟦 2. Cloudinary Transformation Issues**

## **2.1 Final QR image shows no border or no site ID**
**Symptoms:**  
- QR appears raw  
- No frame  
- No text overlay  

**Likely Causes:**  
- Transformation URL missing parameters  
- Incorrect `public_id`  
- Text overlay syntax error  

**Fix:**  
- Rebuild the transformation URL  
- Confirm the border template exists in Cloudinary  
- Check for URL‑encoding issues in site ID text  

---

## **2.2 Cloudinary returns a 400 or 401 error**
**Likely Causes:**  
- Invalid API key  
- Incorrect upload preset  
- Missing signature (if using signed uploads)  

**Fix:**  
- Re‑enter Cloudinary credentials  
- Confirm upload preset is set to “unsigned” if using unsigned uploads  

---

# **🟦 3. Duda Form Issues**

## **3.1 Hidden fields are visible to donors**
**Symptoms:**  
- Donor sees `bin_id` or `city_state` fields  

**Likely Causes:**  
- Duda changed placeholder attributes  
- CSS selectors no longer match  
- Duda updated form markup  

**Fix:**  
Update CSS selectors:

```css
.dmforminput:has(input[placeholder="bin_id"]),
.dmforminput:has(input[data-placeholder-original="bin_id"]) {
    display: none !important;
}
```

Repeat for `city_state`.

---

## **3.2 Hidden fields are not auto‑filled**
**Symptoms:**  
- Form submits without bin/location metadata  
- Cloudflare Worker receives empty values  

**Likely Causes:**  
- Query parameters missing from QR URL  
- Script in header not running  
- Duda changed input attributes  

**Fix:**  
- Confirm QR URL looks like:  
  ```
  ?bin_id=42754&location_name=Jefferson+Valley+Mall&city_state=Yorktown+Heights,+NY
  ```
- Ensure the header script is present and unmodified  
- Inspect form fields to confirm placeholders match script selectors  

---

## **3.3 Form does not send data to webhook**
**Symptoms:**  
- Worker receives no requests  
- Duda shows “integration failed”  

**Likely Causes:**  
- Webhook URL incorrect  
- Worker endpoint changed  
- Duda form integration disabled  

**Fix:**  
- Re‑enter webhook URL  
- Test Worker endpoint manually with POST  
- Re‑enable webhook integration in Duda  

---

# **🟦 4. Cloudflare Worker Issues**

## **4.1 Worker returns 500 errors**
**Symptoms:**  
- Duda logs show “500 Internal Error”  
- Worker logs show exceptions  

**Likely Causes:**  
- Invalid JSON from Duda  
- Missing required fields  
- Unexpected field names  

**Fix:**  
- Add defensive parsing around the payload  
- Log the raw payload for debugging  
- Update normalization logic to match Duda’s field names  

---

## **4.2 Worker receives empty or partial data**
**Symptoms:**  
- Missing bin ID  
- Missing city/state  
- Missing donor info  

**Likely Causes:**  
- Duda script not auto‑filling hidden fields  
- Donor submitted before script loaded  
- Query parameters missing  

**Fix:**  
- Ensure script is in the page header  
- Add a small delay before form initialization (if needed)  
- Confirm QR URL includes all parameters  

---

# **🟦 5. Constant Contact Integration Issues**

## **5.1 Integration not working (CURRENT STATUS)**
**Symptoms:**  
- Worker cannot send data to Constant Contact  
- API calls fail immediately  

**Cause:**  
> **Constant Contact Partner API approval is still pending.**  
> No OAuth2 credentials exist yet.

**Fix:**  
- Wait for Constant Contact to approve the application  
- Once approved:
  - Add OAuth credentials to Worker  
  - Implement token refresh logic  
  - Enable contact creation endpoint  

---

## **5.2 Cannot authenticate with Constant Contact (future issue)**
**Likely Causes:**  
- OAuth token expired  
- Refresh token invalid  
- Incorrect scopes  

**Fix (once integration is active):**  
- Re‑authorize the application  
- Update Worker environment variables  
- Re‑generate refresh token  

---

# **🟦 6. QR Code / URL Issues**

## **6.1 QR code scans but form loads without metadata**
**Symptoms:**  
- Form loads normally  
- Hidden fields remain empty  

**Likely Causes:**  
- URL missing query parameters  
- Google Sheets formula broken  
- Spaces not URL‑encoded  

**Fix:**  
- Ensure URL looks like:  
  ```
  ?bin_id=42754&location_name=Jefferson+Valley+Mall&city_state=Yorktown+Heights,+NY
  ```
- Rebuild the formula in Google Sheets  
- Use `ENCODEURL()` for location names  

---

# **🟦 7. PDF Output Issues**

## **7.1 Client requests multiple QR codes per page**
**Status:**  
This is a **planned enhancement** for version 1.1.

**Fix:**  
- Modify PDF generation to insert 4–6 QR images per page  
- Use a table layout or grid inside `DocumentApp`  

---

# **🟦 8. General Debugging Tips**

- Always check Cloudflare Worker logs first  
- Log raw payloads from Duda  
- Log Cloudinary responses  
- Add temporary `Logger.log()` calls in Apps Script  
- Test QR URLs manually in a browser  
- Use Duda’s “Test Webhook” feature  

---

# **📚 Related Documentation**

- `overview.md`  
- `architecture.md`  
- `google-sheets-automation.md`  
- `duda-integration.md`  
- `cloudinary.md`  
- `constant-contact.md`  
