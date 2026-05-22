# **Cloudflare Worker — Form Processing API**

The Cloudflare Worker acts as the backend API for the DropSpot Automation Platform. It receives form submissions from the Duda website, validates and normalizes the data, logs the request, and prepares the payload for Constant Contact. Once Constant Contact Partner API approval is granted, the Worker will also handle authenticated contact creation.

This folder contains the Worker code and related documentation.

---

## **📌 Purpose of the Worker**

The Worker serves as the central processing layer between:

- **Duda (front‑end form)**  
- **Constant Contact (email marketing)**  
- **Internal logging and debugging**  

Its responsibilities include:

- Accepting POST requests from Duda  
- Parsing the form submission payload  
- Normalizing field names  
- Validating required fields  
- Preparing the Constant Contact payload  
- Logging all activity  
- Returning structured JSON responses  

The Worker ensures that every donor submission is handled consistently and safely.

---

## **📁 Files in This Folder**

### **`worker.js`**
The main Cloudflare Worker script.  
Handles:

- POST request routing  
- JSON parsing  
- Field normalization  
- Validation  
- Logging  
- Constant Contact payload construction  
- (Future) OAuth2 authentication  
- (Future) Contact creation API calls  

### **`README.md`**
This documentation file.

---

## **🔄 How the Worker Fits Into the System**

```
QR Code →
  URL with parameters →
    Duda Form →
      Webhook POST →
        Cloudflare Worker →
          Normalize + Validate →
            (Future) Constant Contact API →
              Logging + Response
```

The Worker is the glue between the donor-facing form and the marketing system.

---

## **🧠 What the Worker Does Today (Current State)**

### ✔ Receives Duda form submissions  
Duda sends form data as an array of `{ field, value }` objects.

### ✔ Normalizes the data  
The Worker converts Duda’s structure into a clean JSON object:

```json
{
  "firstName": "John",
  "email": "john@example.com",
  "bin_id": "42754",
  "city_state": "Yorktown Heights, NY"
}
```

### ✔ Validates required fields  
Ensures:

- Email exists  
- Email is valid  
- Bin ID exists  
- City/state exists  

### ✔ Prepares Constant Contact payload  
The Worker builds the correct JSON structure for Constant Contact, but **does not send it yet**.

### ✔ Logs everything  
For debugging and auditing.

### ✔ Returns a structured JSON response  
Duda receives a clean success or error message.

---

## **🚧 What the Worker Will Do Once Constant Contact Approves API Access**

### 🔜 OAuth2 Authentication  
The Worker will:

- Store OAuth credentials in environment variables  
- Refresh tokens automatically  
- Attach tokens to API requests  

### 🔜 Create or update contacts  
Using:

```
POST /v3/contacts/sign_up_form
```

### 🔜 Add metadata fields  
Including:

- Bin ID  
- Plaza name  
- City/state  

### 🔜 Add donors to lists or segments  
For targeted marketing.

---

## **🔐 Environment Variables**

The Worker uses Cloudflare environment variables for all sensitive values:

- `CC_API_KEY`  
- `CC_CLIENT_ID`  
- `CC_CLIENT_SECRET`  
- `CC_REFRESH_TOKEN`  
- `LOGGING_ENABLED` (optional)  

These values are **not** stored in the repo.

---

## **🧪 Testing the Worker**

You can test the Worker using:

- Duda’s “Test Webhook” feature  
- `curl` or Postman  
- Cloudflare dashboard “Test” tab  

Example test payload:

```json
[
  { "field": "First Name", "value": "John" },
  { "field": "Email", "value": "john@example.com" },
  { "field": "bin_id", "value": "42754" },
  { "field": "city_state", "value": "Yorktown Heights, NY" }
]
```

---

## **🛠 Error Handling**

The Worker returns:

- `200` — Success  
- `400` — Missing or invalid fields  
- `500` — Internal error  

All errors are logged for debugging.

---

## **📚 Related Documentation**

- **overview.md**  
- **architecture.md**  
- **duda-integration.md**  
- **google-sheets-automation.md**  
- **constant-contact.md**  
- **troubleshooting.md**  