# **Google Apps Script — QR Automation System**

This folder contains the Google Apps Script code that powers the automated QR generation, Cloudinary processing, PDF creation, and email delivery for the DropSpot Automation Platform. These scripts run directly inside Google Sheets and are triggered either manually or automatically when a user updates the sheet.

---

## **📌 Overview**

The Apps Script subsystem handles:

- Generating QR codes for each DropSpot location  
- Uploading QR images to Cloudinary  
- Applying Cloudinary transformations (border + site ID text)  
- Saving final QR PNGs to Google Drive  
- Creating print‑ready PDFs  
- Emailing PDFs to the printing team  
- Supporting both **full‑sheet processing** and **single‑row processing**  

This automation allows non‑technical staff to generate all required QR assets simply by filling out a row in the Google Sheet and checking a box.

---

## **📁 Files in This Folder**

### **code.gs**
Processes **all rows** in the sheet.  
Used when generating QR codes in bulk (e.g., onboarding many new DropSpots at once).

### **QR_OnEdit.gs**
Processes **only the row that was edited**.  
Triggered when the user checks the “Generate” checkbox in Column W.

### **config.example.gs**
A safe, placeholder‑only configuration file.  
This file **is committed** to GitHub and documents all required config values.



---

## **🔐 Configuration & Secrets**

All sensitive values are stored in:

```
google-apps-script/config.gs
```

This file contains:

- Cloudinary API key  
- Cloudinary API secret  
- Cloudinary cloud name  
- Upload preset  
- Google Drive folder IDs  
- Email recipient  
- Future Constant Contact credentials  

### **Never commit `config.gs` to GitHub.**

Your root `.gitignore` must include:

```
google-apps-script/config.gs
google-apps-script/.clasp.json
```

All scripts reference configuration values through the shared `CONFIG` object:

```js
const CLOUD_NAME = CONFIG.CLOUDINARY_CLOUD_NAME;
```

This keeps the code clean, safe, and maintainable.

---

## **⚙️ How the Automation Works**

### **1. User fills out a row in the Google Sheet**
Required fields:

- Bin ID  
- Plaza name  
- City & state  
- Google Maps pin URL  

The sheet automatically generates:

- A dynamic URL with query parameters  
- A raw QR code (via formula)  

---

### **2. User checks the “Generate” box**
This triggers:

- `onEdit()` → runs `generateQRForRow()`  
- Cloudinary upload  
- Cloudinary transformation  
- PNG saved to Drive  
- PDF created  
- PDF emailed  

---

### **3. Bulk generation**
Running `generateQRWithBinNumber()` in `code.gs` processes **all rows** and regenerates all QR assets.

---

## **🧩 Cloudinary Integration**

The scripts:

- Upload the raw QR  
- Apply a border frame  
- Add the Site ID text  
- Return a final composite PNG  

All Cloudinary credentials come from `CONFIG`.

---

## **📄 PDF Generation**

The script uses `DocumentApp` to:

- Create a temporary Google Doc  
- Insert the QR image  
- Center it on the page  
- Export as PDF  
- Save to Drive  
- Email to the printing team  
- Delete the temporary Doc  

A future enhancement (v1.1) will support **4–6 QR codes per page**.

---

## **📬 Email Delivery**

The final PDF is emailed to:

```
CONFIG.EMAIL_RECIPIENT
```

This is typically the staff member responsible for printing and laminating QR signage.

---

## **🧪 Testing & Debugging**

- Use the checkbox in Column W to test single‑row processing  
- Use Apps Script logs (`Logger.log`) to inspect Cloudinary responses  
- Check Drive folders for PNG and PDF output  
- Confirm email delivery  
- Use Duda’s “Test Webhook” for end‑to‑end flow  

---

## **📚 Related Documentation**

- **overview.md**  
- **architecture.md**  
- **duda-integration.md**  
- **cloudinary.md**  
- **constant-contact.md**  
- **troubleshooting.md**  