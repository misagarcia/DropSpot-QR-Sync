# Changelog

All notable changes to this project will be documented in this file.  
This project follows **Semantic Versioning** (MAJOR.MINOR.PATCH).

---

## **[1.1.1] – 2026‑06‑11**
### **Added**
- Completed the **Constant Contact donor‑intake integration**, enabling full end‑to‑end syncing of donor submissions from Duda → Cloudflare Worker → Constant Contact.
- Added support for **custom field mapping** in the donor pipeline:
  - Message  
  - Bin ID  
  - Plaza / location name  
  - City & state  
- Added support for **phone number storage** under `phone_numbers[]` with `"kind": "mobile"`.
- Added new documentation updates across the repo:
  - Updated root `README.md`  
  - Updated Cloudflare Worker documentation  
  - Updated donor‑worker documentation  
  - Added notes on SMS limitations and future upgrade paths  

### **Changed**
- Finalized and sanitized the **donor-worker.js** for public GitHub publishing:
  - Removed all secrets  
  - Moved all credentials to Cloudflare environment variables  
  - Improved logging and error handling  
  - Improved payload normalization and validation  
- Updated the donor pipeline to use **Constant Contact Partner API JWT authentication** with KV caching.
- Updated repository structure documentation to reflect the completed donor pipeline.

### **Fixed**
- Resolved issues where Constant Contact payloads were rejected due to missing or malformed fields.
- Fixed phone number handling to ensure consistent formatting and safe fallback behavior.
- Fixed Cloudflare Worker serialization issues by ensuring all payloads are safely stringified before sending to Constant Contact.

### **Notes**
- **SMS channel activation is not currently supported** by the Constant Contact API.  
  Attempts to populate `sms_channel` result in validation errors for the `sms_consent_permission` field.  
  Phone numbers are stored, but SMS consent cannot be set via API.
- A future upgrade may add **SMS opt‑in verification** once Constant Contact exposes a supported API path.
- This is a **patch release** focused on completing the donor intake pipeline and preparing the repository for public publishing.

---

## **[1.1.0] – 2026‑06‑05**
### **Added**
- Introduced the **New Location Onboarding Pipeline**, enabling staff to add new DropSpot locations directly from the Duda website without accessing Google Sheets.
- Added a new **Cloudflare Worker middleware** to receive form submissions, normalize payloads, and forward data reliably to Google Apps Script while preventing Duda retry loops.
- Added a new **Google Apps Script endpoint (`WebFormEndpoint.gs`)** to:
  - Parse incoming JSON payloads  
  - Create a new row in the master spreadsheet  
  - Map submitted fields into the correct columns  
  - Clone static metadata from the previous row  
  - Inject dynamic formulas for tracking URLs and QR generation  
  - Initialize and toggle the Column W checkbox  
  - Trigger the QR generation engine automatically  
- Added support for **dynamic email routing** via cell `Z3`, allowing multi‑recipient delivery of print‑ready PDFs without modifying code.
- Added new documentation:  
  - `/docs/new-location-onboarding.md` (full pipeline overview)  
  - Updated architecture references and repo structure notes  

### **Changed**
- Upgraded the system architecture to support **serverless ingestion** using Duda → Cloudflare → Apps Script routing.
- Updated `QR_OnEdit.gs` to align with the new naming conventions and to support automated triggering from the onboarding pipeline.
- Improved spreadsheet safety by eliminating the need for staff to manually edit the Google Sheet when adding new locations.
- Revised versioning to reflect a **major functional expansion** (1.0.x → 1.1.x).

### **Fixed**
- Eliminated risks of accidental spreadsheet edits by removing direct user interaction from the onboarding workflow.
- Resolved issues related to inconsistent metadata entry by cloning stable fields from the previous row.
- Prevented duplicate submissions caused by Duda’s background retry behavior through immediate `200 OK` Worker responses.

### **Notes**
- This is a **major feature release** introducing a new architectural subsystem and a new workflow for staff.
- Existing donor intake pipeline remains unchanged.
- Constant Contact integration remains in progress and is not part of this release.

---

## **[1.0.2] – 2026‑05‑28**
### **Added**
- New **2‑up print layout** to replace the previous 6‑up format, aligning with client design specifications.
- High‑resolution **Cloudinary composite pipeline** using the new 1350×1350 frame asset.
- Sanitized filename generation for both PNG and PDF outputs:
  - `QR_{binNumber}_{businessName}.png`
  - `QR-Print_{binNumber}_{businessName}.pdf`
- Batch processing script (`generateAllQRCodesAndPDFs`) for Day‑One onboarding of 100+ locations.

### **Changed**
- Updated QR transformation workflow to use **1225px upscale target** for improved print clarity.
- Adjusted text overlay placement (`x_60, y_20`) for precise alignment within the new frame.
- Replaced all sensitive Cloudinary credentials in Apps Script with environment‑safe placeholders for GitHub publishing.
- Improved naming conventions and sanitization logic for consistent, safe file output.

### **Fixed**
- Resolved layout distortion caused by mixing 300px and 1350px assets by adopting a unified high‑resolution frame.
- Eliminated text stretching and misalignment issues by recalibrating overlay scaling and anchor points.

### **Notes**
- This update affects only the **Google Apps Script** components (QR generation + PDF creation).
- Cloudflare Worker and Duda integration remain unchanged.
- This is a minor feature enhancement; version bump:
  - **v1.0.1 → v1.0.2**

---

## **[1.0.1] – 2026‑05‑27**
### **Added**
- Implemented **6‑up QR code layout** in the PDF generation workflow (2×3 grid).
- Added support for tighter margin control to maximize printable area.

### **Changed**
- Updated Google Apps Script PDF generation logic to:
  - Render six identical QR codes on a single page.
  - Reduce page margins for improved layout density.
  - Adjust horizontal spacing between columns for a cleaner print layout.
  - Ensure the entire 6‑up grid fits on a single page without cropping.
- Improved table structure and spacing removal to eliminate unwanted padding.

### **Fixed**
- Resolved issue where the PDF occasionally generated as two pages.
- Eliminated cropping caused by Google Docs’ default margins and spacing.
- Removed header/footer artifacts that consumed vertical space.

### **Notes**
- No changes required to Cloudflare Worker or Duda integration.
- No new environment variables or secrets added.
- This is a minor feature enhancement and does not introduce breaking changes.

---

## **[Unreleased]**
### **Added**
- Planned Constant Contact integration (pending Partner API approval)  
- Planned OAuth2 token handling for Constant Contact  
- Planned segmentation of donors by bin ID, plaza name, and city/state  

### **In Progress**
- Awaiting Constant Contact Partner API approval  
- Preparing Cloudflare Worker for authenticated API calls  
- Preparing environment variable structure for OAuth2 credentials  

---

## **[1.0.0] – Initial Release**
### **Added**
- Full Google Sheets automation system:
  - Dynamic QR URL generation with query parameters  
  - Raw QR generation using Google Charts API  
  - Cloudinary upload + transformation (QR + border + site ID)  
  - PDF generation using `DocumentApp`  
  - Email delivery of print‑ready PDFs  
  - Google Drive storage for QR images and PDFs  

- Duda website integration:
  - Custom JavaScript for auto‑filling hidden fields  
  - Custom CSS to hide internal metadata fields  
  - Webhook configuration to send form submissions to Cloudflare Worker  

- Cloudflare Worker backend:
  - JSON parsing and normalization  
  - Field validation  
  - Payload construction for Constant Contact  
  - Logging for debugging and auditing  

### **Notes**
- Constant Contact integration is **not yet active**  
- Worker currently logs data but does not send it to Constant Contact  
- System is fully functional for QR generation, PDF creation, and form submission handling  

---

## **[0.1.0] – Pre‑Release Development**
### **Added**
- Initial project scaffolding  
- Early Apps Script prototypes  
- Early Cloudflare Worker prototypes  
- Early QR generation tests  
- Early Cloudinary transformation tests  
