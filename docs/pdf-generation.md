# **📄 PDF Generation Workflow**

The PDF generation system is responsible for creating **print‑ready QR signage** for each DropSpot location.  
This document explains how the system works, how the 6‑up layout is produced, and how the Apps Script logic interacts with Cloudinary and Google Drive.

---

# **📌 Overview**

Each DropSpot location requires a branded QR code that can be printed and installed on the donation container.  
The PDF generation workflow:

1. Generates a branded QR image (via Cloudinary)  
2. Inserts the QR into a **6‑up layout** (2 columns × 3 rows)  
3. Produces a single‑page PDF  
4. Emails the PDF to the printing team  
5. Saves the PDF to Google Drive  

This process is fully automated and triggered by a checkbox in Google Sheets.

---

# **⚙️ Triggering the PDF Generation**

The workflow begins when staff check the **“Generate”** box in the Google Sheet.

- The `onEdit(e)` trigger detects the checkbox change  
- It calls `generateQRForRow(row)`  
- That function handles:
  - QR URL retrieval  
  - Cloudinary upload  
  - Final composite QR creation  
  - Passing the image to the PDF generator  

Once the final QR image is ready, the script calls:

```
createSixUpPDF(pngFileId, binNumber)
```

This function handles all PDF layout and export logic.

---

# **🖼 How the 6‑Up Layout Works**

The PDF is built using **Google Docs**, because it provides:

- Reliable PDF export  
- Table‑based layout  
- Consistent rendering  
- Easy margin and spacing control  

The layout uses:

- A **3×2 table**  
- Each cell contains one QR image  
- All borders, padding, and spacing are removed  
- Margins are minimized to maximize printable area  

This ensures:

- Perfect alignment  
- No cropping  
- One‑page output  
- Clean, professional print results  

---

# **📐 Layout Details**

### **Page Size**
- Standard US Letter: **8.5 × 11 inches**

### **Margins**
To maximize space, margins are reduced:

```
Top:    5 pt
Bottom: 5 pt
Left:   50 pt
Right:  50 pt
```

Left/right margins are slightly increased to tighten the spacing between the two columns.

### **Table Structure**
- 3 rows  
- 2 columns  
- No borders  
- No padding  
- No paragraph spacing  

### **QR Image Size**
- Full‑size QR preserved  
- No scaling required  
- Images centered horizontally  

---

# **📤 PDF Export & Delivery**

Once the document is assembled:

1. The Google Doc is saved  
2. Exported as a PDF  
3. Saved to the designated Drive folder  
4. Emailed to the printing team with:
   - Subject: `QR Code PRINT PDF for Bin {binNumber}`  
   - Attachment: the generated PDF  

Finally, the temporary Google Doc is deleted to keep Drive clean.

---

# **🔧 Key Functions**

### **`generateQRForRow(row)`**
Handles:

- Fetching QR URL  
- Uploading QR to Cloudinary  
- Applying branded frame + text  
- Saving final PNG  
- Calling the PDF generator  

### **`createSixUpPDF(pngFileId, binNumber)`**
Responsible for:

- Creating the Google Doc  
- Setting margins  
- Removing header/footer  
- Building the 3×2 table  
- Inserting QR images  
- Exporting PDF  
- Emailing PDF  
- Cleaning up temporary files  

This function contains all layout logic for the 6‑up PDF. 

---

# **✔ Summary**

The PDF generation system is a fully automated, reliable workflow that produces clean, print‑ready QR signage for DropSpot containers.  
The new **6‑up layout (v1.0.1)** dramatically improves printing efficiency and reduces manual work for staff.

This subsystem is a core part of the DropSpot Automation Platform and continues to evolve as new requirements emerge.
