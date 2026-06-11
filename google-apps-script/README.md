# **Google Apps Script — QR & Onboarding Automation System**

This folder contains the Google Apps Script code that powers the **QR generation engine**, the **Cloudinary processing pipeline**, the **PDF creation workflow**, and now the **New Location Onboarding Endpoint** introduced in v1.1.0.  

These scripts run directly inside Google Sheets and are triggered either:

- Automatically (via the onboarding pipeline)  
- By user interaction (checkbox in Column W)  
- Or manually (bulk generation)  

Together, they form the automation backbone of the DropSpot platform.

---

## **📌 Overview**

The Apps Script subsystem now handles two major responsibilities:

### **1. QR Generation & Print Automation**
- Fetch QR URLs from formulas  
- Upload raw QR images to Cloudinary  
- Apply branded frame + Site ID text  
- Save final PNGs to Google Drive  
- Create 2‑up print‑ready PDFs  
- Email PDFs to the printing team  
- Support both **bulk** and **single‑row** processing  

### **2. New Location Onboarding (v1.1.0)**
A new endpoint (`WebFormEndpoint.gs`) receives JSON payloads from the Cloudflare Worker and:

- Creates a new row in the sheet  
- Maps submitted fields into the correct columns  
- Clones metadata from the previous row  
- Injects dynamic formulas (tracking URL + QR generator)  
- Inserts and toggles the checkbox in Column W  
- Automatically triggers the QR generation engine  

This allows staff to add new DropSpot locations **without accessing Google Sheets**.

Full documentation:  
**New Location Onboarding**

---

## **📁 Files in This Folder**

### **WebFormEndpoint.gs**  
**(New in v1.1.0)**  
Receives location‑creation submissions from the Cloudflare Worker.  
Responsible for:

- JSON parsing  
- Row creation  
- Metadata cloning  
- Formula injection  
- Checkbox initialization  
- Triggering the QR generation engine  

This script is the core of the new onboarding pipeline.

---

### **QR_OnEdit.gs**  
Processes **only the row that was edited** or the row created by the onboarding pipeline.  
Triggered when:

- Column W checkbox is set to TRUE  
- `WebFormEndpoint.gs` programmatically toggles the checkbox  

Handles:

- Cloudinary upload  
- Cloudinary transformation  
- PNG saving  
- PDF creation  
- Email delivery  

Now updated with:

- New naming conventions  
- `safeName` sanitization  
- Dynamic email routing via cell Z3  

---

### **code.gs**  
Processes **all rows** in the sheet.  
Used for:

- Day‑One onboarding  
- Regenerating all QR assets  
- Bulk updates  

This script mirrors the naming logic used in `QR_OnEdit.gs`.

---

### **config.example.gs**  
A safe, placeholder‑only configuration file.  
Documents all required config values without exposing secrets.

---

## **🔐 Configuration & Secrets**

All sensitive values live in:

```
google-apps-script/config.gs
```

This file contains:

- Cloudinary credentials  
- Upload preset  
- Google Drive folder IDs  
- Email routing fallback  
- Future Constant Contact credentials  

### **Never commit `config.gs` to GitHub.**

Your `.gitignore` must include:

```
google-apps-script/config.gs
google-apps-script/.clasp.json
```

Scripts reference configuration values through the shared `CONFIG` object:

```js
const CLOUD_NAME = CONFIG.CLOUDINARY_CLOUD_NAME;
```

This keeps the code clean, safe, and maintainable.

---

## **⚙️ How the Automation Works**

### **1. New Location Onboarding (v1.1.0)**  
Triggered when staff submit the “Add New DropSpot” form on the website.

Flow:

1. Cloudflare Worker receives JSON  
2. Worker forwards payload to `WebFormEndpoint.gs`  
3. Apps Script:
   - Creates new row  
   - Maps fields  
   - Clones metadata  
   - Injects formulas  
   - Inserts checkbox  
   - Sets checkbox to TRUE  
4. `QR_OnEdit.gs` runs automatically  
5. QR + PDF generated  
6. PDF emailed to printing team  

This replaces manual spreadsheet editing.

---

### **2. Manual Single‑Row Generation**
When a user checks the “Generate” box in Column W:

- `onEdit()` triggers  
- `generateQRForRow()` runs  
- Cloudinary → PDF → Email workflow executes  

Useful for:

- Reprints  
- Corrections  
- Manual overrides  

---

### **3. Bulk Generation**
Running the batch function in `code.gs`:

- Processes all rows  
- Regenerates all QR assets  
- Useful for Day‑One onboarding or mass updates  

---

## **🧩 Cloudinary Integration**

Both QR scripts:

- Upload the raw QR  
- Apply the branded 1350×1350 frame  
- Add Site ID text  
- Return a final composite PNG  

All credentials come from `CONFIG`.

---

## **📄 PDF Generation**

The system uses `DocumentApp` to:

- Create a temporary Google Doc  
- Insert the QR image twice (2‑up layout)  
- Export as PDF  
- Save to Drive  
- Email to the printing team  
- Delete the temporary Doc  

This ensures consistent print‑ready output.

---

## **📬 Email Delivery**

Email routing is now dynamic:

- Primary recipient is read from **cell Z3**  
- Supports multiple comma‑separated emails  
- Falls back to a safe default if Z3 is empty or invalid  

This allows staff to change recipients without modifying code.

---

## **🧪 Testing & Debugging**

- Use Column W checkbox to test single‑row processing  
- Use Duda’s “Test Webhook” to test onboarding pipeline  
- Check Drive folders for PNG/PDF output  
- Inspect Cloudinary logs for transformation issues  
- Use Apps Script logs (`Logger.log`) for debugging  
- Confirm email delivery  

---

## **📚 Related Documentation**

- **New Location Onboarding**  
- **Architecture Overview**  
- **Cloudinary Integration**  
- **Duda Integration**  
- **Constant Contact Integration**  
- **Troubleshooting**  

---
