# **Future Upgrades & Platform Limitations**

## **Google Apps Script Limitations: Daily Quotas**

During batch processing of QR codes and 2‑up PDF generation, we encountered a Google Apps Script quota error:

```
Exception: Service invoked too many times for one day: docs create.
```

This occurs because Apps Script enforces **daily limits** on certain operations, including:

- Creating Google Docs  
- Sending emails  
- Writing files to Drive  
- URL fetch calls  
- Script runtime  

In our case, the batch workflow created **one Google Doc per row**, which quickly exceeded the **daily Google Docs creation quota**.

---

## **Why This Matters**

As our QR generation workflow scales, especially when processing dozens or hundreds of rows at once, we can easily hit these quotas. This makes Apps Script less suitable for high‑volume document generation workflows.

---

## **Potential Future Solutions**

### **1. Reuse a Single Google Doc (Recommended)**
Instead of creating one Doc per row, we can:

- Create **one** Google Doc  
- Insert a page break after each 2‑up layout  
- Export a **multi‑page PDF**  
- Delete the Doc afterward  

This reduces document creation from *N Docs → 1 Doc*, avoiding the quota entirely.

---

### **2. Batch Processing Over Multiple Days**
A temporary workaround:

- Process a limited number of rows per day  
- Resume the next day once quotas reset  

Not ideal, but functional for small batches.

---

### **3. Use Google Drive Advanced Service**
Enabling the Drive API provides **higher quotas** for file creation, but requires:

- Enabling Advanced Services  
- Enabling Drive API in Cloud Console  
- OAuth approval  

More setup, but more scalable.

---

### **4. Move PDF Generation Outside Apps Script**
Long‑term, we could migrate PDF creation to:

- Cloudinary (supports PDF generation)  
- A Cloudflare Worker  
- A Node.js microservice  
- A dedicated PDF library (e.g., PDFKit, Puppeteer, wkhtmltopdf)  

This removes Apps Script quotas entirely.

---

## **Summary**

The current limitation is not a bug — it’s a **platform constraint**.  
As our workflow grows, we should plan for a more scalable PDF generation strategy.

This document serves as a reference for future upgrades and architectural decisions.

---

---

## **Additional Note: Day-One Batch Processing vs. Long-Term Usage**

Our current quota limitations (e.g., Google Docs creation limits) surfaced only because we are in **Day One onboarding mode**, generating QR assets for **100+ existing locations** all at once. This is not representative of normal usage.

### **Normal Workflow**
Going forward, new locations will be added:
- Individually  
- Slowly over time (weekly or monthly)  
- Triggered via the `QR_OnEdit.gs` automation  

This means our day‑to‑day usage will remain well within Apps Script quotas.

### **Future Upgrade (Planned)**
For large one‑time batch operations (like Day One onboarding), our `Code.gs` batch generator should be upgraded to:

- **Reuse a single Google Doc**  
- Insert a page break for each 2‑up layout  
- Export **one multi‑page PDF** instead of creating one Doc per row  

This enhancement will eliminate Google Docs creation limits entirely and make the batch workflow scalable for future large imports.
