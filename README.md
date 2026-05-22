# **DropSpot Automation Platform**

The DropSpot Automation Platform is a complete end‑to‑end system designed to support a national clothing‑donation company that collects donated clothing through hundreds of DropSpot containers placed in shopping centers across the United States.  

The goal of this system is simple but powerful:

> **Turn anonymous clothing donations into meaningful donor relationships — automatically, at scale.**

Each DropSpot container displays a unique QR code that donors can scan after dropping off clothing. When scanned, the QR code takes the donor to a form where they can enter their information for a chance to win a prize (e.g., an Apple Watch or iPad). This incentive encourages donors to share their contact information so the company can keep them informed, build community, and grow its marketing list.

To make this possible, the platform automates everything behind the scenes — QR generation, PDF creation, form processing, and contact syncing — so employees never need technical skills to manage new DropSpot locations.

---

## **📌 Why This System Exists**

The company operates hundreds of donation containers and continues to expand. Until now, they had **no way to know who was donating**, where donations were coming from, or how to build an ongoing relationship with donors.

This system solves that by:

- Giving each container a **unique QR code** tied to its location  
- Capturing donor information through a simple form  
- Automatically tagging each donor with the **bin ID**, **plaza name**, **city**, and **state**  
- Sending donor data into **Constant Contact** for marketing  
- Making it easy for non‑technical staff to add new DropSpots  

The result is a fully automated donor‑capture pipeline that requires **zero engineering involvement** once deployed.

---

## **🎯 How Donors Interact With the System**

1. Donor drops clothing into a DropSpot container  
2. Donor sees signage with a QR code  
3. QR code opens a form with hidden fields pre‑filled using query parameters:
   - Bin ID  
   - Plaza name  
   - City & state  
4. Donor enters only their name, email, and optional fields  
5. Submission is sent to the Cloudflare Worker  
6. Worker forwards the data to Constant Contact  
7. Donor is entered into the prize drawing and added to the mailing list  

The donor never sees the technical fields — everything is handled automatically.

---

## **🏗 System Architecture Overview**

The platform is composed of four major subsystems:

### **1. Google Sheets + Google Apps Script**
- Acts as the control center for all DropSpot locations  
- Staff enter:
  - Bin ID  
  - Shopping Plaza name  
  - City & state  
  - Google Maps pin URL  
- Apps Script:
  - Generates QR codes with embedded parameters  
  - Sends QR to Cloudinary for branding  
  - Creates print‑ready PDFs  
  - Emails PDFs to the printing team  
  - Saves assets to Google Drive  

### **2. Cloudinary (Media Processing)**
- Combines:
  - Raw QR code  
  - Branded border frame  
  - Site ID text  
- Returns a final composite QR image used in PDFs and signage  

### **3. Cloudflare Worker (Form Processing API)**
- Receives JSON payloads from the Duda website  
- Normalizes and validates fields  
- Sends contact data to Constant Contact  
- Logs all activity  

### **4. Constant Contact Integration**
- Stores donor contact information  
- Organizes contacts by sub‑account  
- Enables marketing outreach  

---

## **🔄 End-to-End Workflow**

### **DropSpot Creation Workflow**
1. Staff enters new DropSpot info into Google Sheets  
2. Staff checks the “Generate” box  
3. Apps Script:
   - Generates QR  
   - Sends to Cloudinary  
   - Receives final branded QR  
   - Creates PDF (soon: 4–6 per page)  
   - Emails PDF to printing team  
   - Saves assets to Drive  

### **Donor Submission Workflow**
1. Donor scans QR  
2. Form loads with hidden fields auto‑filled  
3. Donor submits  
4. Cloudflare Worker:
   - Parses payload  
   - Validates fields  
   - Sends to Constant Contact  
   - Logs request  

---

## **📁 Repository Structure**

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

## **🧭 Who Uses This System**

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

## **📄 License**
Internal project — not licensed for public distribution.

---

## **👥 Contributors**
- Misa — Lead Developer  
- Raul — Project Oversight  
- Additional contributors as the team grows  

## **📚 Documentation**