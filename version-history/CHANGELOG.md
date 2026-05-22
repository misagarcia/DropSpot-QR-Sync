# **Changelog**

All notable changes to this project will be documented in this file.  
This project follows **Semantic Versioning** (MAJOR.MINOR.PATCH).

---

## **[Unreleased]**
### **Added**
- Planned enhancement: Support for generating **4–6 QR codes per PDF** instead of a single centered QR  
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