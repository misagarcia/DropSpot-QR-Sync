# Changelog

All notable changes to this project will be documented in this file.  
This project follows **Semantic Versioning** (MAJOR.MINOR.PATCH).


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
