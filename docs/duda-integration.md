# **Duda Integration (Website Form + QR Parameter Handling)**

The Duda integration is the front‑end entry point of the DropSpot Automation Platform. It handles how donors interact with the system when they scan a QR code on a DropSpot container. This document explains how the Duda form is structured, how hidden fields are auto‑filled using QR query parameters, and how the form sends data to the Cloudflare Worker for processing.

---

## **📌 Purpose of the Duda Integration**

The Duda website hosts the donor sign‑up form that donors see after scanning a QR code on a DropSpot container. The form must:

- Be simple and fast for donors  
- Auto‑fill internal metadata (bin ID, location name, city/state)  
- Hide internal fields from donors  
- Pass all data to the Cloudflare Worker webhook  

This ensures donors only see the fields *they* need to fill out, while the system captures the metadata needed for analytics and marketing segmentation.

---

## **🔗 How the QR Code Passes Metadata to the Form**

Each QR code contains a URL with **query parameters** that identify the DropSpot container:

Example:

```
https://www.clothingdropspot.com/qr-signups?bin_id=42754&location_name=Jefferson+Valley+Mall&city_state=Yorktown+Heights,+NY
```

### **Parameters included:**

- `bin_id` — the unique 5‑digit container ID  
- `location_name` — the plaza or shopping center name  
- `city_state` — city and state for sorting and analytics  

These parameters are generated automatically in Google Sheets and embedded into the QR code.

---

## **🧠 Auto‑Filling Hidden Fields (Front-End Script)**

When the donor loads the form, a custom script in the page header reads the query parameters and auto‑fills the hidden fields.

### **Header HTML Script**

```html
<script>
document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);

    // List of fields to auto-fill
    const fields = ["bin_id", "city_state"];

    fields.forEach(fieldName => {
        const value = params.get(fieldName);
        if (!value) return;

        // Find input by placeholder
        const input = document.querySelector(`input[placeholder="${fieldName}"], input[data-placeholder-original="${fieldName}"]`);
        if (input) {
            input.value = value;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    });
});
</script>
```

### **What this script does**

- Reads the URL parameters  
- Finds the matching hidden form fields  
- Auto‑fills them with the correct values  
- Triggers Duda’s internal input event so the form recognizes the values  

This ensures the donor never has to manually enter bin/location information.

---

## **🎨 Hiding Internal Fields (Custom CSS)**

The donor should *not* see the internal metadata fields.  
Custom CSS hides them completely:

```css
/* Hide city_state field */
.dmforminput:has(input[placeholder="city_state"]),
.dmforminput:has(input[data-placeholder-original="city_state"]) {
    display: none !important;
}

/* Hide bin_id field */
.dmforminput:has(input[placeholder="bin_id"]),
.dmforminput:has(input[data-placeholder-original="bin_id"]) {
    display: none !important;
}
```

### **Why hide these fields?**

- Donors don’t need to see or edit them  
- Prevents confusion  
- Ensures clean, consistent metadata  
- Keeps the form simple and fast  

---

## **📤 Sending Form Data to the Cloudflare Worker**

Once the donor submits the form:

1. Duda packages all fields (including hidden ones)  
2. Sends them to the Cloudflare Worker via webhook  
3. Worker normalizes and validates the data  
4. Worker forwards the contact to Constant Contact  

### **Webhook Configuration**

Inside Duda:

**Dashboard → Forms → Form Settings → Integrations → Webhooks**

Set the webhook URL to:

```
https://your-worker-domain.com/drop
```

Duda sends the form as an array of `{ field, value }` objects.

Example:

```json
[
  { "field": "First Name", "value": "John" },
  { "field": "Email", "value": "john@example.com" },
  { "field": "bin_id", "value": "42754" },
  { "field": "city_state", "value": "Yorktown Heights, NY" }
]
```

---

## **🧩 How the Worker Uses These Fields**

The Worker:

- Normalizes field names  
- Validates email  
- Ensures required fields exist  
- Packages metadata for Constant Contact  
- Logs the request  

This allows the marketing team to segment donors by:

- Container  
- Plaza  
- City/state  
- Region  

---

## **📐 Full Data Flow (Front-End → Back-End)**

```
QR Code →
  URL with parameters →
    Duda form loads →
      Script auto-fills hidden fields →
        CSS hides internal fields →
          Donor submits →
            Duda sends webhook →
              Cloudflare Worker →
                Constant Contact
```

---

## **📚 Related Documentation**

- `overview.md` — high-level summary  
- `architecture.md` — system architecture  
- `google-sheets-automation.md` — QR + PDF automation  
- `cloudinary.md` — QR compositing  
- `constant-contact.md` — API integration  
- `troubleshooting.md` — common issues  
