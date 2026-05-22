flowchart TD

    %% QR + Duda
    A[User Scans QR Code] --> B[Duda Form Page]
    B --> C[Duda Form Submission]

    %% Cloudflare Worker
    C --> D[Cloudflare Worker<br/>• Normalizes fields<br/>• Validates email<br/>• Logs payload<br/>• Builds CC payload<br/>• (Future) Sends to Constant Contact]

    %% Google Sheets
    D --> E[Google Sheet: Drop Spots List]

    %% Apps Script Automation
    E --> F[Apps Script Automation<br/>• QR_OnEdit.gs<br/>• code.gs]

    %% Cloudinary
    F --> G[Cloudinary<br/>• Upload QR<br/>• Apply frame<br/>• Add text<br/>• Generate final PNG]

    %% Drive
    G --> H[Google Drive<br/>• Save PNG<br/>• Create PDF]

    %% Email
    H --> I[Email Notification<br/>• Send PDF to print team]

    %% Future Constant Contact
    D --> J[(Future)<br/>Constant Contact API<br/>• OAuth2<br/>• Contact creation<br/>• List membership]

    %% Styling
    classDef cloud fill:#e3f2fd,stroke:#2196f3,stroke-width:1px;
    classDef duda fill:#fff3e0,stroke:#fb8c00,stroke-width:1px;
    classDef worker fill:#e8f5e9,stroke:#43a047,stroke-width:1px;
    classDef sheets fill:#f1f8e9,stroke:#7cb342,stroke-width:1px;
    classDef apps fill:#ede7f6,stroke:#673ab7,stroke-width:1px;
    classDef drive fill:#e0f7fa,stroke:#0097a7,stroke-width:1px;
    classDef email fill:#fce4ec,stroke:#d81b60,stroke-width:1px;
    classDef cc fill:#f3e5f5,stroke:#8e24aa,stroke-width:1px;

    B,C:::duda
    D:::worker
    E:::sheets
    F:::apps
    G:::cloud
    H:::drive
    I:::email
    J:::cc
