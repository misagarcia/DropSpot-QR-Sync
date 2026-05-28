# **DropSpot Automation Platform — Future Roadmap**

This roadmap outlines planned enhancements, architectural improvements, and long‑term upgrades for the DropSpot Automation Platform.  
It focuses on **code‑level improvements**, **workflow optimizations**, and **infrastructure upgrades** that will strengthen reliability, scalability, and maintainability as the system grows.

This document is forward‑looking and will evolve as new requirements emerge.

---

# **📌 High‑Priority Upcoming Enhancements**

These items are already identified, discussed, and planned for future releases.

---

## **1. Multi‑Page PDF Batch Generator (Apps Script Upgrade)**  
**Status:** Planned  
**Target Version:** v1.1.x  

### **Overview**  
The current batch generator (`generateAllQRCodesAndPDFs`) creates **one Google Doc per row**, which can hit Google Apps Script’s daily document‑creation quota during large imports.

### **Planned Upgrade**  
- Reuse **one Google Doc** for the entire batch  
- Insert a **page break** after each 2‑up layout  
- Export a **single multi‑page PDF**  
- Delete the temporary Doc after export  

### **Benefits**  
- Eliminates Google Docs creation quota issues  
- Faster batch processing  
- Cleaner Drive organization  
- More scalable for future large imports  

---

## **2. Constant Contact OAuth2 Integration (Cloudflare Worker)**  
**Status:** Pending Partner API approval  
**Target Version:** v1.2.x  

### **Overview**  
Constant Contact is transitioning to OAuth2‑based authentication.  
Our Worker currently uses a placeholder pipeline until Partner API approval is granted.

### **Planned Upgrade**  
- Implement full OAuth2 token exchange  
- Store tokens securely in Cloudflare environment variables  
- Add automatic token refresh logic  
- Add error handling for expired/invalid tokens  

### **Benefits**  
- Production‑ready Constant Contact integration  
- Secure, standards‑compliant authentication  
- Enables automated donor syncing at scale  

---

## **3. Authenticated Cloudflare Worker API Calls**  
**Status:** In progress  
**Target Version:** v1.2.x  

### **Overview**  
Once OAuth2 is implemented, the Worker will need authenticated calls to Constant Contact’s API.

### **Planned Upgrade**  
- Add authorization headers  
- Add retry logic for rate limits  
- Add structured logging for API failures  
- Add validation for required fields  

### **Benefits**  
- Reliable donor syncing  
- Better observability  
- Reduced risk of silent failures  

---

## **4. Constant Contact Segmentation Enhancements**  
**Status:** Planned  
**Target Version:** v1.3.x  

### **Overview**  
Future marketing campaigns will require more granular segmentation of donors.

### **Planned Upgrade**  
Automatically segment donors by:

- Bin ID  
- Plaza name  
- City  
- State  
- Region (future)  
- DropSpot type (future)  

### **Benefits**  
- More targeted marketing  
- Better reporting  
- Improved donor engagement  

---

# **📅 Medium‑Term Enhancements**

These items are not urgent but will improve maintainability and developer experience.

---

## **5. Developer Setup Guide**
A full onboarding guide for new developers, including:

- How to deploy Apps Script  
- How to update Cloudflare Worker  
- How to manage Cloudinary credentials  
- How to update Duda CSV  

---

## **6. Security & Secrets Management Policy**
Document how to:

- Store Cloudinary secrets  
- Rotate API keys  
- Protect Worker environment variables  
- Avoid committing sensitive data  

---

## **7. Automated Duda CSV Validation**
A script or Worker endpoint to validate:

- Phone number formatting  
- City/state consistency  
- Required fields  
- Duplicate bin IDs  

---

# **🧭 Long‑Term Vision**

These are larger architectural improvements that may be implemented as the platform scales.

---

## **8. Replace Google Docs PDF Generation**
Move PDF generation to:

- Cloudinary  
- Cloudflare Worker  
- A dedicated PDF microservice  

This removes Apps Script quotas entirely.

---

## **9. Real‑Time Dashboard for DropSpot Activity**
A future dashboard could show:

- Daily scans  
- Donor submissions  
- Location performance  
- Regional trends  

---

# **📄 Last Updated**
**May 28, 2026**

