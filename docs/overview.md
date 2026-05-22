# **DropSpot Automation Platform — Overview**

The DropSpot Automation Platform is a unified system designed to automate the creation, management, and processing of DropSpot locations. It integrates Google Sheets, Google Apps Script, Cloudinary, Cloudflare Workers, and Constant Contact to create a seamless workflow from data entry to marketing automation.

This document provides a high‑level overview of the platform, its purpose, and how each component interacts within the system.

---

## **🎯 Purpose of the Platform**

The platform was built to solve a specific operational challenge:

> **How do we automatically generate branded QR codes, produce print‑ready PDFs, and process website form submissions — all without manual intervention?**

The system ensures:

- Consistent branding  
- Accurate data handling  
- Automated PDF generation  
- Automated email delivery  
- Automated contact syncing  
- Centralized logging and error handling  

It eliminates repetitive manual tasks and creates a scalable, maintainable workflow.

---

## **🏗 System Architecture (High-Level)**

The platform consists of three major subsystems working together:

### **1. Google Sheets + Apps Script**
- Acts as the primary data source for DropSpot locations  
- Generates QR codes  
- Sends QR images to Cloudinary for branding  
- Produces print‑ready PDFs  
- Emails PDFs to the printing team  
- Uses an `onEdit` trigger to process only newly added rows  

### **2. Cloudinary (Media Processing)**
- Combines the raw QR code with:
  - a branded border frame  
  - the DropSpot site ID number  
- Returns a final composite image used in PDFs and emails  

### **3. Cloudflare Worker (Form Processing)**
- Receives JSON payloads from the Duda website  
- Parses and validates form submissions  
- Forwards contact data to Constant Contact  
- Logs all requests for debugging and auditing  

### **4. Constant Contact Integration**
- Adds or updates contacts in the appropriate sub‑account  
- Uses the Partner API (pending approval)  
- Supports OAuth2 authentication  

---

## **🔄 End-to-End Workflow Summary**

### **DropSpot Creation Workflow**
1. User adds a new row in Google Sheets  
2. User checks the “Generate” checkbox  
3. Apps Script:
   - Generates a raw QR code  
   - Sends QR to Cloudinary for branding  
   - Receives final composite QR  
   - Inserts QR into a PDF template  
   - Emails the PDF to the printing team  
   - Saves the PDF to a designated folder  

### **Website Form Workflow**
1. User submits a form on the Duda website  
2. Duda sends a JSON payload to the Cloudflare Worker  
3. Worker:
   - Parses the payload  
   - Validates fields  
   - Sends contact data to Constant Contact  
   - Logs the request for debugging  

---

## **🧩 Key Components**

### **Google Apps Script**
Handles all automation related to DropSpot creation:

- QR generation  
- Cloudinary transformation  
- PDF creation  
- Email delivery  
- Trigger-based execution  

### **Cloudinary**
Provides dynamic image compositing:

- QR + border + site ID  
- No manual editing  
- No storage bloat  
- Consistent branding  

### **Cloudflare Worker**
Acts as the backend for website form submissions:

- Receives JSON  
- Validates data  
- Sends to Constant Contact  
- Logs all activity  

### **Constant Contact**
Stores and manages customer contact data:

- Adds new contacts  
- Updates existing contacts  
- Organizes contacts by sub‑account  

---

## **📦 Repository Structure (Simplified)**

```
docs/
  overview.md
  architecture.md
  cloudinary.md
  google-sheets-automation.md
  duda-integration.md
  constant-contact.md
  troubleshooting.md

cloudflare-worker/
  worker.js

google-apps-script/
  code.gs
  QR_OnEdit.gs

version-history/
  CHANGELOG.md
```

---

## **🛠 Why This System Works Well**

- **Fully automated** — no manual steps required  
- **Modular** — each component can be updated independently  
- **Scalable** — supports unlimited DropSpot locations  
- **Maintainable** — clear separation of responsibilities  
- **Cloud-native** — no servers to maintain  

---

## **📚 Related Documentation**

- `architecture.md` — deeper technical breakdown  
- `cloudinary.md` — full explanation of QR compositing  
- `google-sheets-automation.md` — Apps Script logic  
- `duda-integration.md` — Worker + payload structure  
- `constant-contact.md` — API integration details  
- `troubleshooting.md` — common issues and fixes  
