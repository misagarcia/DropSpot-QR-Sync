# **Constant Contact Integration (Current Status + Future Implementation)**

The Constant Contact integration is the final step in the donor‑capture pipeline. It will allow the system to automatically add donors to the company’s email marketing lists, segmented by DropSpot location. This document explains the intended integration, what has already been built, and why the integration is currently on hold.

---

## **📌 Purpose of the Constant Contact Integration**

The goal of this integration is to:

- Automatically add donors to the company’s Constant Contact account  
- Tag each donor with metadata:
  - Bin ID  
  - Plaza name  
  - City & state  
- Organize donors into the correct sub‑accounts or lists  
- Enable the marketing team to send targeted updates and newsletters  

This transforms anonymous clothing donations into ongoing donor relationships.

---

## **📍 Current Status (As of Now)**

The Constant Contact integration is **not yet active** because:

> **We are still waiting for Constant Contact Partner API approval.**

Without this approval:

- We cannot generate OAuth2 credentials  
- We cannot authenticate API requests  
- We cannot create or update contacts  
- We cannot test the full end‑to‑end pipeline  

However, **all other parts of the system are fully prepared** for the integration.

---

## **🧱 What Has Already Been Built**

### **1. Cloudflare Worker is fully prepared**
The Worker already:

- Accepts form submissions  
- Normalizes field names  
- Validates email and required fields  
- Constructs the payload format Constant Contact expects  
- Logs all incoming data  
- Returns structured responses  

The Worker currently **stops before sending data to Constant Contact**, because authentication is not yet available.

---

### **2. Payload structure is complete**
The Worker already builds a JSON object in the correct shape for Constant Contact’s API.

Example (conceptual):

```json
{
  "email_address": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "555-123-4567",
  "custom_fields": {
    "bin_id": "42754",
    "location_name": "Jefferson Valley Mall",
    "city_state": "Yorktown Heights, NY"
  }
}
```

This ensures that once API access is granted, the Worker can immediately begin sending data.

---

### **3. Environment variable structure is ready**
The Worker environment is prepared for:

- `CC_API_KEY`  
- `CC_CLIENT_ID`  
- `CC_CLIENT_SECRET`  
- `CC_REFRESH_TOKEN` (once OAuth is active)  

These values will be added once Constant Contact approves the application.

---

## **🚧 What Is Still Pending**

### **1. Partner API Approval**
Constant Contact must approve the application before:

- OAuth2 credentials can be issued  
- API calls can be authenticated  
- Sub‑account access can be configured  

This is the only blocker.

---

### **2. OAuth2 Token Flow**
Once approved, we will implement:

- Authorization URL  
- Token exchange  
- Refresh token rotation  
- Secure storage of tokens  

The Worker will then attach the token to each API request.

---

### **3. Contact Creation Endpoint**
The Worker will send data to:

```
POST /v3/contacts/sign_up_form
```

Or the appropriate endpoint for Partner accounts.

---

### **4. List / Segment Assignment**
Donors will be added to:

- A master list  
- A segment based on bin ID  
- Optional geographic segments  

This enables targeted marketing.

---

## **🔮 Future Workflow (Once Approved)**

```
Duda Form →
  Cloudflare Worker →
    Normalize + Validate →
      Build Constant Contact Payload →
        Authenticate via OAuth2 →
          Create/Update Contact →
            Add to Lists/Segments →
              Log Success
```

---

## **🧭 Why This Integration Matters**

Once active, the Constant Contact integration will allow the company to:

- Track donor engagement  
- Send newsletters and updates  
- Run prize drawings  
- Understand which DropSpots generate the most engagement  
- Build long‑term donor relationships  

This is the final piece that completes the entire DropSpot Automation Platform.

---

## **📚 Related Documentation**

- `overview.md` — high-level summary  
- `architecture.md` — system architecture  
- `duda-integration.md` — form + webhook pipeline  
- `google-sheets-automation.md` — QR + PDF automation  
- `cloudinary.md` — QR compositing  
- `troubleshooting.md` — common issues  