# Cloudflare Workers — API Layer for the DropSpot Automation Platform

This folder contains the Cloudflare Workers that serve as the serverless API layer for the DropSpot Automation Platform. These Workers sit between the Duda website and backend systems (Google Apps Script + Constant Contact), ensuring reliable, fast, and secure data delivery.

As of **v1.1.0**, the platform uses **two independent Workers**, each dedicated to a different workflow:

1. **Donor Intake Worker** — handles donor submissions  
2. **Location Onboarding Worker** — handles new DropSpot creation  

Both Workers are optimized for Duda’s webhook behavior and built for low‑latency, high‑reliability processing.

---

## ⭐ Why Two Workers?

The platform supports two distinct pipelines, each with different payloads, validation rules, and downstream systems.

### 1. Donor Intake Workflow
- Triggered when a donor scans a QR code  
- Sends donor info to Constant Contact  
- Performs field normalization + validation  
- Uses Partner API JWT authentication  
- Adds donors to a specific Constant Contact list  
- Supports custom field mapping  

### 2. New Location Onboarding Workflow
- Triggered when staff submit the “Add New DropSpot” form  
- Sends location metadata to Google Apps Script  
- Must return 200 OK instantly to prevent Duda retry loops  
- Forwards raw JSON without modification  

Because these workflows have different responsibilities, they are implemented as two separate Workers.

---

# 📁 Files in This Folder

## `donor-worker.js`

Handles donor submissions from the QR‑driven Duda form.

### Responsibilities
- Accept POST requests from Duda  
- Parse normalized JSON payload  
- Validate required fields (email, bin ID, etc.)  
- Map fields to Constant Contact standard + custom fields  
- Add donors to a specific Constant Contact list  
- Store phone numbers under `phone_numbers[]`  
- Manage Partner API JWT token minting + KV caching  
- Log inbound + outbound requests  
- Return structured JSON responses  

### Current Constant Contact Mapping

**Standard fields**

- `first_name`  
- `last_name`  
- `email_address.address`  
- `phone_numbers[].phone_number` (stored as `kind: "mobile"`)

**Custom fields**

| Duda Field     | CC Custom Field ID                   |
|----------------|--------------------------------------|
| Message        | b592d3da-39e1-11f1-bf9e-02420a320002 |
| bin_id         | 3b45f284-459d-11f1-a9c4-02420a320002 |
| location_name  | a2e8aae8-39e1-11f1-8be6-02420a320002 |
| city_state     | f659fab4-4e50-11f1-a91b-02420a320003 |

**List membership**

All donors are added to:

    dfc5bc9c-4e51-11f1-af7d-02420a320003

### SMS Channel Note

Constant Contact’s API currently does **not** allow SMS channel activation via API.  
Attempts to populate `sms_channel` result in validation errors, even when providing all required fields.

For now, phone numbers are stored only under:

    phone_numbers[]

A future update may add SMS opt‑in support once Constant Contact confirms API availability.

---

## `location-worker.js`

Handles new DropSpot onboarding submissions from the staff‑only Duda form.

### Responsibilities
- Accept POST requests from Duda  
- Immediately return 200 OK to prevent Duda retry loops  
- Forward raw JSON to Google Apps Script  
- Log inbound + outbound requests  
- Return structured JSON including Apps Script response  

This Worker powers the location onboarding pipeline.

---

## `README.md`

This documentation file.

---

# 🔄 How the Workers Fit Into the System

## Donor Intake Pipeline

    QR Code →
      Duda Donor Form →
        Donor Worker →
          Normalize + Validate →
            Constant Contact Partner API →
              Logging + Response

## New Location Onboarding Pipeline

    Duda Staff Form →
      Location Worker →
        Instant 200 OK →
          Forward JSON →
            WebFormEndpoint.gs →
              Row Creation + QR Automation →
                Email Delivery

---

# 🧠 What Each Worker Does Today

## Donor Worker

- Receives donor submissions  
- Normalizes + validates fields  
- Maps fields to Constant Contact  
- Adds donors to a CC list  
- Stores phone numbers under `phone_numbers[]`  
- Manages Partner API authentication  
- Logs everything  
- Returns structured JSON  

## Location Worker

- Receives staff submissions  
- Immediately returns 200 OK  
- Forwards payload to Google Apps Script  
- Logs inbound + outbound requests  
- Returns structured JSON  

---

# 🚧 Future Enhancements (Donor Worker)

- SMS opt‑in support (pending Constant Contact confirmation)  
- Additional validation (phone formatting, email verification, etc.)  
- Enhanced logging (structured logs + correlation IDs)  
- Retry logic for transient Constant Contact errors  

---

# 🔐 Environment Variables

Both Workers use Cloudflare environment variables for sensitive values:

- `GOOGLE_SCRIPT_URL`  
- `CC_CLIENT_ID`  
- `CC_CLIENT_SECRET`  
- `CC_BASIC_AUTH`  
- `CC_ACCOUNT_ID`  
- `CC_STORE` (KV namespace)  
- `LOGGING_ENABLED`  

These values are never stored in the repo.

---

# 🧪 Testing the Workers

## Donor Worker

- Use Duda’s “Test Webhook”  
- Use Postman or curl  
- Check Cloudflare logs  
- Validate Constant Contact contact creation  

## Location Worker

- Use Duda’s “Test Webhook”  
- Confirm instant 200 OK  
- Check Google Apps Script logs  
- Verify new row creation  
- Confirm QR + PDF generation  

---

# 🛠 Error Handling

Both Workers return:

- 200 — Success  
- 400 — Missing or invalid fields (donor worker only)  
- 500 — Internal error  

All errors are logged for debugging.

---

# 📚 Related Documentation

- New Location Onboarding  
- Architecture Overview  
- Duda Integration  
- Google Sheets Automation  
- Constant Contact Integration  
- Troubleshooting
