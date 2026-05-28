# **Content Updates & Data Integrity Log**

This document tracks **non‑code operational updates**, **data corrections**, and **content‑related adjustments** made across the DropSpot Automation Platform.  
Unlike the main `CHANGELOG.md`, which tracks versioned software changes, this file documents updates to:

- Google Sheets content  
- Duda CMS data  
- CSV uploads  
- Manual corrections  
- Data integrity fixes  
- Operational adjustments  
- Content‑driven workflow changes  

These updates ensure the platform remains accurate, consistent, and aligned with real‑world usage.

---

# **📌 Purpose of This Document**

As the DropSpot system grows, certain updates occur **outside the codebase** — especially within:

- Google Sheets (location data, phone numbers, plaza names)  
- Duda website CSV uploads  
- Marketing content  
- Operational workflows  

These changes are important for long‑term clarity and should be documented, even though they do not trigger a version bump in the software.

This file serves as the historical record for those updates.

---

# **📅 Logged Content Updates**

---

## **Phone Number Consistency Fix (May 28, 2026)**

Raul identified an issue where the phone number assigned to each DropSpot location was unintentionally incrementing by one digit across rows. This occurred because Google Sheets auto‑filled the phone number as a **sequential numeric series** when rows were expanded.

### **What Was Fixed**
- Updated the Google Sheet so **all locations now use the correct, identical phone number**.
- Manually corrected the **Duda CSV file** to ensure the updated phone number is reflected on the live website.
- Republished the CSV to Duda to push the corrected data into production.

### **Why This Matters**
Consistent contact information is essential for:
- Donor support  
- Brand trust  
- Compliance  
- Avoiding confusion caused by incorrect or shifting phone numbers  

### **Future Prevention**
- Format the phone number column as **Plain Text** in Google Sheets.  
- Avoid dragging the fill handle on numeric fields.  
- Consider locking the phone number column if it will always remain constant.

---

## **Day-One Batch Processing Note (May 28, 2026)**

During initial onboarding, we generated QR codes and PDFs for **100+ existing DropSpot locations**. This triggered Google Apps Script quotas (specifically, Google Docs creation limits).

### **Why This Happened**
- The batch script (`generateAllQRCodesAndPDFs`) creates **one Google Doc per row**.
- Apps Script enforces a daily limit on document creation.
- This limit was only reached due to the unusually large Day-One batch.

### **Normal Workflow**
Going forward, new DropSpots will be added:
- One at a time  
- Weekly or monthly  
- Triggered via the `QR_OnEdit.gs` automation  

This workflow stays well within Apps Script quotas.

### **Future Upgrade (Planned)**
Enhance the batch script to:
- Reuse a **single Google Doc**  
- Insert a page break for each 2‑up layout  
- Export **one multi‑page PDF**  
- Delete the temporary Doc  

This will eliminate quota issues entirely for future large imports.

---

# **🧭 How to Use This Document**

Use this file to record any update that affects:

- Live website content  
- Google Sheets data  
- CSV uploads  
- Donor‑facing information  
- Operational workflows  
- Manual corrections  
- Data cleanup  
- Content‑driven adjustments  

If the change **does not modify code**, it belongs here.

If the change **modifies code**, it belongs in `CHANGELOG.md`.

---

# **📌 Future Sections (as system grows)**

This document may expand to include:

- Location renaming history  
- Plaza name corrections  
- City/state standardization  
- QR signage content updates  
- Marketing copy changes  
- Duda CMS schema adjustments  
- Data migration notes  
- Bulk import logs  

---

# **📄 Last Updated**
**May 28, 2026**