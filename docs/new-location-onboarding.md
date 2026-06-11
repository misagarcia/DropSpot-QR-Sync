# **New Location Onboarding Pipeline (v1.1.0)**

This document describes the complete serverless onboarding pipeline that allows staff to add new DropSpot locations **without accessing Google Sheets**.  
The system uses a Duda-hosted form, a Cloudflare Worker middleware layer, and a Google Apps Script endpoint to automatically:

- Create a new row in the master spreadsheet  
- Map submitted fields into the correct columns  
- Clone static metadata from the previous row  
- Inject dynamic formulas (tracking URL + QR generator)  
- Initialize the checkbox trigger  
- Invoke the QR generation + PDF creation engine  
- Email the print-ready PDF to the designated recipient  

This subsystem replaces the previous manual spreadsheet workflow and enables Microsoft‑based teams to interact with the system without Google accounts.


---

## 🛠️ Multi-Layer System Overview

To circumvent browser redirects, platform timeout limitations, and asynchronous data drops, the pipeline splits data collection, network handshakes, and database entry across three distinct environments:

[ Duda Form Widget ]⬇️ (JSON POST with trailing colons)[ Cloudflare Worker Proxy ]  ⬅️ (Instantly replies "200 OK" to Duda / avoids loops)⬇️ (Asynchronous background fetch pass-through)[ Google Workspace Engine ] ⬅️ (Processes WebFormEndpoint.gs doPost)

1. **Duda (Data Capture Layer):** Houses the user-facing location signup input widgets.
2. **Cloudflare Workers (Edge Routing Layer):** Intercepts payloads, absorbs Duda's background retry cache by delivering immediate `200 OK` handshakes in under 20ms, and forwards requests smoothly to Google.
3. **Google Apps Script (Database & Execution Layer):** Decodes variables, handles metadata row replication, writes dynamic links, and invokes print asset compilers.

---

## 💾 Component Implementations

### A. The Cloudflare Edge Proxy (`cloudflare-worker/worker.js`)
* **File Location:** `/cloudflare-worker/worker.js`
* **Network Role:** Synchronously processes raw incoming text streams from Duda via an incoming `POST` request block. It isolates network communication, avoiding Google Web App `302 Moved Temporarily` redirect protocols which historically caused recursive loop duplicates inside Duda's submission queues.

### B. The Spreadsheet Endpoint Engine (`google-apps-script/WebFormEndpoint.gs`)
* **File Location:** `/google-apps-script/WebFormEndpoint.gs`
* **Execution Block:** Triggered natively via an exposed `/exec` Google Web App API mapping using standard `doPost(e)` handlers.
* **Core Logic Operations:**
  * **Punctuation Matching Strategy:** Safely parses Duda's default key signatures containing literal tail formatting colons (e.g., `"Bin ID:"`, `"Shopping Center Name:"`).
  * **Forced Text Casting:** Prepends an explicit string single-quote (`"'"`) directly to the numerical `binId` stream. This prevents the spreadsheet calculation layers from stripping necessary leading zeroes (e.g., maintaining location ID `0456` intact).
  * **Matrix Up-Scan Loop:** Scans vertically upward from the current trailing entry row backwards using **Column C (Bin ID)** as a tracking anchor. It isolates the last functional record row index while jumping over empty formatting cell space or unexpected workspace artifacts.
  * **Historical Range Duplication:** Isolates and extracts static operational blocks from the discovered source row (`Column F` for general text properties, and the horizontal segment across `Columns K through O` for raw HTML description paragraph wrappers, contact fields, and system assets), stamping them identically into the newly established row array coordinates.
  * **Formula Generation Blocks:** Programmatically writes clean reference formulas for Column U (Destination tracking URLs) and Column V (Remote QR Code API vectors) utilizing the newly assigned index position.
  * **Native UI Injection:** Automates an explicit `.insertCheckboxes()` cell transformation routine across `Column W` (Column 23), instantly switching its active property state to `TRUE` to provide clear tracking visualization.

### C. Asset & Mail Routing Updates (`google-apps-script/QR_OnEdit.gs`)
* **File Location:** `/google-apps-script/QR_OnEdit.gs`
* **Dynamic Target Parsing:** Queries cell **Z3** inside the master spreadsheet workbook globally at runtime to resolve active email delivery loops.
* **Variable Configurations:** Supports single target inputs as well as comma-separated multi-recipient text chains (e.g., `manager@company.com,tester@company.com`), sending automated, high-resolution print PDF templates to all targets concurrently. Includes a default hardcoded fallback check to protect system routing if cell Z3 is accidentally cleared or malformed.
* **Legacy Trigger Integration:** Keeps the document's manual structural `onEdit(e)` interface handler completely live on Column W. Users retain full administrative clearance to toggle checkboxes off and on manually to force an immediate reprint cycle.

---

## 📋 Workspace Operational Settings

To modify delivery parameters or shift production environments, adhere to these maintenance routines:

### 1. Swapping Target Recipients (No-Code Modification)
* Open the **Drop Spots List** tab inside the Google Sheets file directory.
* Locate cell **Z3**.
* Enter your new email string. For multi-inbox distributions, isolate each destination with a standard comma, maintaining **no whitespace gaps**: `user1@email.com,user2@email.com`.

### 2. Upgrading Sheet Endpoint Configurations
Whenever structural modifications or string parameter alterations are written to `WebFormEndpoint.gs`, you must forcefully override Google's internal web execution cache:
1. Navigate to **Deploy > Manage deployments** at the top menu bar.
2. Select the **Pencil Icon (Edit)** on the active operational deployment map.
3. Switch the Version selector drop menu layout to **New version**.
4. Confirm by clicking **Deploy** (This updates your core logic safely while leaving the root `/exec` URL identifier immutable—meaning no adjustments are required inside Duda or Cloudflare Workers).
