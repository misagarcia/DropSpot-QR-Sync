# **DropSpot Automation Platform**

The DropSpot Automation Platform is a complete end‑to‑end system designed to support a national clothing‑donation company that collects donated clothing through hundreds of DropSpot containers placed in shopping centers across the United States.

The goal of this system is simple but powerful:

> **Turn anonymous clothing donations into meaningful donor relationships — automatically, at scale.**

Each DropSpot container displays a unique QR code that donors can scan after dropping off clothing. When scanned, the QR code takes the donor to a form where they can enter their information for a chance to win a prize (e.g., an Apple Watch or iPad). This incentive encourages donors to share their contact information so the company can keep them informed, build community, and grow its marketing list.

Behind the scenes, the platform automates everything — QR generation, PDF creation, form processing, contact syncing, and now **new DropSpot onboarding** — so employees never need technical skills to manage or expand the system.

---

# **🚀 What’s New in v1.1.0 (June 2026)**

Version **1.1.0** introduces the most complete and stable version of the DropSpot Automation Platform to date. This release includes:

### **Major Features**
- **New Location Onboarding Pipeline**  
  (Duda → Cloudflare Worker → Google Apps Script)
- **Constant Contact Donor Intake Integration**  
  (Duda → Cloudflare Worker → Constant Contact)
- **Updated QR generation engine** with new naming conventions
- **Dynamic email routing** via cell `Z3`
- **Improved Cloudinary processing pipeline**
- **Full repository documentation overhaul**

This is a **major feature release**, not a patch.

---

# **📌 Why This System Exists**

The company operates hundreds of donation containers and continues to expand. Until now, they had:

- No way to know who was donating  
- No way to track donation locations  
- No way to build donor relationships  
- No safe way for staff to add new DropSpots  

This system solves all of that by:

- Giving each container a **unique QR code** tied to its location  
- Capturing donor information through a simple form  
- Automatically tagging each donor with:
  - Bin ID  
  - Plaza name  
  - City & state  
- Sending donor data into **Constant Contact**  
- Allowing staff to add new DropSpots **without accessing Google Sheets**  
- Eliminating the need for Google account access  

The result is a fully automated donor‑capture and location‑onboarding platform that requires **zero engineering involvement** once deployed.

---

# **🎯 How Donors Interact With the System**

1. Donor drops clothing into a DropSpot container  
2. Donor sees signage with a QR code  
3. QR code opens a form with hidden fields pre‑filled using query parameters:
   - Bin ID  
   - Plaza name  
   - City & state  
4. Donor enters their name, email, and optional fields  
5. Submission is sent to the Cloudflare Donor Worker  
6. Worker sends the data to Constant Contact  
7. Donor is added to the mailing list and prize drawing  

The donor never sees the technical fields — everything is handled automatically.

---

# **🏗 System Architecture Overview**

The platform now consists of **five major subsystems**:

---

## **1. New Location Onboarding Pipeline (v1.1.0)**  
**Purpose:** Add new DropSpot locations without touching Google Sheets.

Flow:

\`\`\`
[Duda Staff Form]
        ↓
[Cloudflare Location Worker]
        ↓
[WebFormEndpoint.gs]
        ↓
[Spreadsheet Row Creation]
        ↓
[QR Generation Engine]
        ↓
[Email Delivery]
\`\`\`

Key features:

- Creates new rows automatically  
- Clones metadata from previous row  
- Injects dynamic formulas  
- Initializes checkbox trigger  
- Generates QR + PDF  
- Emails print‑ready assets  

Full documentation:  
**docs/new-location-onboarding.md**

---

## **2. Donor Intake Pipeline (v1.1.0)**  
**Purpose:** Capture donor information and sync to Constant Contact.

Flow:

\`\`\`
[QR Code]
        ↓
[Duda Donor Form]
        ↓
[Cloudflare Donor Worker]
        ↓
[Constant Contact API]
        ↓
[Contact Created + Added to List]
\`\`\`

Key features:

- Normalizes donor data  
- Validates required fields  
- Adds donors to a Constant Contact list  
- Stores phone numbers under `phone_numbers[]`  
- Populates custom fields (bin ID, plaza, city/state, message)  
- Uses Partner API JWT authentication with KV caching  

**SMS Note:**  
Constant Contact’s API currently **does not allow SMS channel activation**.  
Phone numbers are stored, but SMS consent cannot be set via API.

---

## **3. Google Sheets + Google Apps Script**

Acts as the backend database and automation engine.

Apps Script handles:

- QR generation  
- Cloudinary transformation  
- PDF creation  
- Email delivery  
- Drive storage  
- Triggering workflows from the onboarding pipeline  

Docs:  
**docs/google-sheets-automation.md**

---

## **4. Cloudinary (Media Processing)**

Used to generate branded, high‑resolution QR codes:

- 1350×1350 frame  
- 1225px QR upscale  
- Site ID text overlay  
- Final PNG output  

Docs:  
**docs/cloudinary.md**

---

## **5. Cloudflare Workers (API Layer)**

Two Workers now exist:

- **donor-worker.js** → Sends donor data to Constant Contact  
- **location-worker.js** → Sends new location data to Apps Script  

Both normalize payloads, prevent retry loops, and ensure reliable delivery.

Docs:  
**docs/cloudflare-worker-integration.md**

---

# **🔄 End-to-End Workflows**

## **New Location Workflow (v1.1.0)**  
1. Staff fills out the “Add New DropSpot” form  
2. Cloudflare Worker receives and forwards the payload  
3. Apps Script:
   - Creates new row  
   - Maps fields  
   - Clones metadata  
   - Injects formulas  
   - Inserts and toggles checkbox  
4. QR_OnEdit script:
   - Generates QR  
   - Sends to Cloudinary  
   - Creates 2‑up PDF  
   - Emails PDF  
5. Assets saved to Drive  

---

## **Donor Submission Workflow**
1. Donor scans QR  
2. Form loads with hidden fields  
3. Donor submits  
4. Cloudflare Worker:
   - Parses payload  
   - Validates fields  
   - Sends to Constant Contact  
5. Donor added to mailing list  

---

# **📁 Repository Structure (Updated for v1.1.0)**

\`\`\`
docs/
  overview.md
  architecture.md
  new-location-onboarding.md
  cloudinary.md
  google-sheets-automation.md
  duda-integration.md
  constant-contact.md
  troubleshooting.md
  future-upgrades.md

cloudflare-worker/
  donor-worker.js
  location-worker.js

google-apps-script/
  WebFormEndpoint.gs
  QR_OnEdit.gs
  code.gs

version-history/
  CHANGELOG.md
\`\`\`

---

# **🧭 Who Uses This System**

### **Internal Staff**
- Add new DropSpot locations  
- Print QR signage  
- Install signage on containers  

### **Donors**
- Scan QR  
- Submit info  
- Join mailing list  
- Enter prize drawings  

### **Marketing Team**
- Uses Constant Contact to send updates  
- Tracks donor engagement  
- Builds community around the mission  

---

# **🚧 Future Enhancements (Optional)**

These are not required for v1.1.0 but may be added later:

### **1. SMS Opt‑In + Verification**
If Constant Contact enables SMS channel creation via API, we may add:

- SMS consent capture  
- SMS verification workflow  
- SMS channel provisioning  

### **2. Phone Number Normalization**
- Auto‑format to E.164  
- Validate number type (mobile vs landline)

### **3. Enhanced Logging**
- Structured logs  
- Correlation IDs  
- Error categorization  

### **4. Retry Logic**
- Automatic retry for transient CC API failures  

### **5. Additional Custom Fields**
- Donor metadata  
- Marketing segmentation fields  

---

# **📄 License**
Internal project — not licensed for public distribution.

---

# **👥 Contributors**
- Misa — Lead Developer  
- Raul — Project Oversight  
- Additional contributors as the team grows  
