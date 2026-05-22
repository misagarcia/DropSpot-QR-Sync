# **DropSpot Automation Platform — System Architecture**

The DropSpot Automation Platform is built as a modular, cloud‑native system that automates the creation of DropSpot QR assets, generates print‑ready PDFs, and processes website form submissions. This document provides a detailed breakdown of the architecture, data flow, and interactions between all components.

---

## **🏛 High-Level Architecture**

The platform is composed of four major subsystems:

1. **Google Sheets + Google Apps Script**  
   Primary data source and automation engine for QR generation and PDF creation.

2. **Cloudinary (Media Processing)**  
   Dynamically composes the final branded QR image (QR + border + site ID).

3. **Cloudflare Worker (Form Processing API)**  
   Receives and processes JSON payloads from the Duda website.

4. **Constant Contact Integration**  
   Stores and updates customer contact data.

Each subsystem is independent but connected through well‑defined interfaces.

---

## **🔄 End-to-End Data Flow**

### **1. DropSpot Creation Workflow**

```
Google Sheets → Apps Script → Cloudinary → Apps Script → PDF → Email + Drive
```

**Step-by-step:**

1. A new DropSpot row is added to Google Sheets.  
2. User checks the “Generate” checkbox.  
3. Apps Script:
   - Generates a raw QR code  
   - Uploads QR to Cloudinary  
   - Receives final composite QR  
   - Inserts QR into a PDF template  
   - Emails the PDF to the printing team  
   - Saves the PDF to Google Drive  

This workflow is triggered by an `onEdit` event, ensuring only the modified row is processed.

---

### **2. Website Form Submission Workflow**

```
Duda Website → Cloudflare Worker → Constant Contact → Logging
```

**Step-by-step:**

1. User submits a form on the Duda website.  
2. Duda sends a JSON payload to the Cloudflare Worker endpoint.  
3. Worker:
   - Parses and validates the payload  
   - Extracts contact fields  
   - Sends data to Constant Contact  
   - Logs the request for debugging  

This workflow ensures all form submissions are captured and synced to the marketing system.

---

## **🧩 Component Architecture**

---

### **1. Google Sheets + Apps Script**

Google Sheets acts as the **central database** for DropSpot locations.

Apps Script handles:

- QR code generation  
- Cloudinary upload + transformation  
- PDF creation  
- Email delivery  
- Trigger-based execution  
- Temporary file cleanup  

**Key scripts:**

- `code.gs` — full-sheet automation  
- `QR_OnEdit.gs` — row-level trigger logic  

Apps Script is the “brain” of the DropSpot creation workflow.

---

### **2. Cloudinary (Media Processing)**

Cloudinary is used to dynamically generate the final branded QR image.

It combines:

- Raw QR code  
- Branded border frame  
- Site ID text overlay  

This eliminates the need for manual image editing or storing multiple versions.

Cloudinary returns a **single composite image URL**, which Apps Script inserts into the PDF.

---

### **3. Cloudflare Worker (API Layer)**

The Cloudflare Worker acts as a lightweight backend API.

Responsibilities:

- Receive JSON payloads from Duda  
- Validate and sanitize data  
- Forward contact data to Constant Contact  
- Log all requests  
- Return structured responses  

The Worker is stateless, fast, and globally distributed.

---

### **4. Constant Contact Integration**

The Worker communicates with Constant Contact using:

- Partner API (pending approval)  
- OAuth2 authentication  
- JSON-based contact payloads  

The integration supports:

- Adding new contacts  
- Updating existing contacts  
- Organizing contacts by sub-account  

This ensures all customer data flows into the marketing system.

---

## **📐 Architecture Diagram (Text-Based)**

```
                    ┌──────────────────────────┐
                    │      Duda Website        │
                    │   (Form Submissions)     │
                    └─────────────┬────────────┘
                                  │ JSON Payload
                                  ▼
                     ┌─────────────────────────┐
                     │    Cloudflare Worker    │
                     │  (API + Validation)     │
                     └───────┬────────┬────────┘
                             │        │
                             │        ▼
                             │   Constant Contact
                             │   (Contact Sync)
                             │
                             ▼
                    ┌──────────────────────────┐
                    │      Logging System      │
                    └──────────────────────────┘


Google Sheets → Apps Script → Cloudinary → Apps Script → PDF → Email + Drive
```

---

## **🧱 Design Principles**

### **1. Modularity**
Each subsystem is independent and can be updated without affecting others.

### **2. Cloud-Native**
No servers to maintain — everything runs on managed cloud services.

### **3. Event-Driven**
- `onEdit` triggers in Apps Script  
- Webhook triggers in Cloudflare Worker  

### **4. Stateless Processing**
All workflows operate on the incoming data without storing state.

### **5. Scalability**
The system supports unlimited DropSpot locations and form submissions.

---

## **🛡 Security Considerations**

- Cloudflare Worker validates all incoming payloads  
- Constant Contact API keys are stored securely  
- Apps Script uses Drive permissions for file access  
- No sensitive data is stored in Cloudinary  
- All communication uses HTTPS  

---

## **📚 Related Documentation**

- `overview.md` — high-level summary  
- `cloudinary.md` — QR compositing details  
- `google-sheets-automation.md` — Apps Script logic  
- `duda-integration.md` — Worker + payload structure  
- `constant-contact.md` — API integration details  
- `troubleshooting.md` — common issues and fixes  