# **Google Sheets Automation (Apps Script)**

The Google Sheets + Apps Script subsystem is the core engine behind DropSpot creation. It handles QR generation, Cloudinary transformation, PDF creation, email delivery, and file management — all triggered by a simple checkbox in the sheet.

This document explains how the automation works, the logic behind each step, and how the scripts interact with other components in the platform.

---

## **📌 Purpose**

The Google Sheets automation exists to:

- Generate QR codes for new DropSpot locations  
- Send QR images to Cloudinary for branding  
- Produce centered, print‑ready PDFs  
- Email PDFs to the printing team  
- Save PDFs to Google Drive  
- Ensure each DropSpot is processed exactly once  

This eliminates all manual work and ensures consistent output.

---

## **📁 Files in This Module**

Located in:

```
google-apps-script/
```

### **`code.gs`**
Full‑sheet automation for batch processing or legacy workflows.

### **`QR_OnEdit.gs`**
Row‑level automation triggered when a user checks the “Generate” checkbox.

### **`assets/`**
Optional folder for diagrams or reference images.

---

## **🧠 How the Automation Works**

The system uses an **onEdit trigger** to detect when a user marks a row as ready for processing.

### **Trigger Condition**
When the user checks the “Generate” checkbox:

- Apps Script identifies the row  
- Validates required fields  
- Begins the QR → Cloudinary → PDF → Email workflow  

This ensures only the modified row is processed — not the entire sheet.

---

## **🔄 Workflow Breakdown**

### **1. Detect Row Edit**
The script listens for edits in the “Generate” column.

If the checkbox is checked:

- The script reads the row  
- Extracts the DropSpot data  
- Validates required fields (site ID, address, etc.)

---

### **2. Generate Raw QR Code**
Apps Script uses the Google Charts API to generate a QR code:

```
https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=<ENCODED_URL>
```

The QR is generated as a PNG blob.

---

### **3. Upload QR to Cloudinary**
The raw QR blob is uploaded to Cloudinary via an HTTP POST request.

Cloudinary returns:

- `public_id`  
- `secure_url`  
- metadata  

This raw QR is not the final branded version — it’s just the base layer.

---

### **4. Cloudinary Transformation (QR + Border + Site ID)**

Cloudinary dynamically composes:

- the raw QR  
- a branded border frame  
- the DropSpot site ID number  

This produces the **final branded QR image** used in the PDF.

The transformation URL is constructed in Apps Script using:

- the QR’s `public_id`  
- the site ID  
- the border frame template  

The result is a single composite PNG.

---

### **5. Create the PDF**

Apps Script generates a print‑ready PDF using **`DocumentApp`**, which is the Apps Script interface for creating and editing Google Docs programmatically.

Because Apps Script cannot create a PDF directly, the workflow is:

1. Create a temporary Google Doc using `DocumentApp`
2. Insert the final Cloudinary‑generated QR image
3. Apply spacing and centering for clean layout
4. Save and close the Doc
5. Convert the Doc to a PDF blob using `getAs("application/pdf")`
6. Delete the temporary Google Doc to keep Drive clean

This method ensures:

- consistent formatting  
- centered QR placement  
- high‑resolution output  
- predictable PDF layout  

---

### **6. Save PDF to Google Drive**
The PDF is saved to a designated folder:

- Folder ID is stored in the script  
- File name includes the site ID  
- Temporary files are cleaned up  

This ensures Drive stays organized.

---

### **7. Email the PDF**
The script emails the PDF to the printing team.

Email includes:

- Subject: “DropSpot PDF – Site ID ####”  
- Body text  
- PDF attachment  

This completes the DropSpot creation workflow.

---

## **📐 Data Flow Diagram (Text-Based)**

```
User checks "Generate" →
  Apps Script reads row →
    Generate raw QR →
      Upload to Cloudinary →
        Cloudinary returns final QR →
          Insert QR into PDF →
            Save PDF to Drive →
              Email PDF to printer
```

---

## **🧩 Key Functions**

### **`onEdit(e)`**
Entry point for row‑level automation.

### **`generateQRCode(data)`**
Creates raw QR using Google Charts.

### **`uploadToCloudinary(blob)`**
Uploads QR and returns metadata.

### **`buildCloudinaryURL(publicId, siteId)`**
Constructs the transformation URL.

### **`createPDF(qrUrl, rowData)`**
Builds and formats the PDF.

### **`emailPDF(pdfBlob, siteId)`**
Sends the PDF to the printing team.

---

## **🛡 Validation Logic**

Before processing, the script checks:

- Site ID is present  
- Address is present  
- QR URL is valid  
- Checkbox is checked  
- Row has not already been processed  

If validation fails, the script:

- Logs the issue  
- Alerts the user  
- Cancels processing  

---

## **🧹 Cleanup Logic**

To prevent Drive clutter:

- Temporary QR files are deleted  
- Temporary Docs are removed  
- Only the final PDF is kept  

This keeps storage clean and predictable.

---

## **⚙️ Configuration Variables**

Stored at the top of the script:

- `FOLDER_ID_PDFS`  
- `CLOUDINARY_UPLOAD_URL`  
- `CLOUDINARY_API_KEY`  
- `CLOUDINARY_CLOUD_NAME`  
- Column index mappings  

These allow easy updates without modifying logic.

---

## **📚 Related Documentation**

- `overview.md` — high-level summary  
- `architecture.md` — system architecture  
- `cloudinary.md` — QR compositing details  
- `duda-integration.md` — Worker + payload structure  
- `constant-contact.md` — API integration details  
- `troubleshooting.md` — common issues and fixes  