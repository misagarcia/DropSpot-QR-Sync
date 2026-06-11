let memoryToken = null;

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      // 1. EXTRACT DATA
      const formData = await request.json();
      console.log("PARSED FORM DATA:", JSON.stringify(formData));

      const first_name    = (formData["First Name:"] || "").trim();
      const last_name     = (formData["Last Name:"] || "").trim();
      const email         = (formData["Email"] || "").trim().toLowerCase();
      const phone         = (formData["Phone"] || "").trim();
      const message       = (formData["Message"] || "").trim();
      const bin_id        = (formData["bin_id"] || "").trim();
      const location_name = (formData["location_name"] || "").trim();
      const city_state    = (formData["city_state"] || "").trim();

      if (!email) {
        throw new Error("Missing 'Email' property from incoming payload.");
      }

      // 2. TOKEN CACHE LAYERS
      let token = memoryToken;

      if (!env.CC_STORE) {
        throw new Error("Cloudflare KV Namespace binding 'CC_STORE' is missing.");
      }

      if (!token) {
        token = await env.CC_STORE.get("partner_jwt");
      }

      // 3. MINT NEW TOKEN IF EXPIRED
      if (!token) {
        if (!env.CC_CLIENT_ID || !env.CC_CLIENT_SECRET || !env.CC_BASIC_AUTH) {
          throw new Error("Missing Constant Contact API credentials.");
        }

        const tokenResponse = await fetch(
          "https://authz.constantcontact.com/partners/oauth2/default/v1/token",
          {
            method: "POST",
            headers: {
              "Authorization": `Basic ${env.CC_BASIC_AUTH}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
          }
        );

        if (!tokenResponse.ok) {
          const errText = await tokenResponse.text();
          throw new Error(`Token Generation Failed: ${tokenResponse.status} - ${errText}`);
        }

        const tokenData = await tokenResponse.json();
        token = tokenData.access_token;
        memoryToken = token;

        const ttl = tokenData.expires_in ? tokenData.expires_in - 60 : 3300;
        await env.CC_STORE.put("partner_jwt", token, { expirationTtl: ttl });
      }

      // 4. BUILD CONTACT PAYLOAD
      const inner = {
        email_address: { address: email },
        first_name: first_name,
        last_name: last_name,

        phone_numbers: phone
          ? [
              {
                phone_number: phone,
                kind: "mobile"
              }
            ]
          : [],

        list_memberships: ["dfc5bc9c-4e51-11f1-af7d-02420a320003"],

        custom_fields: [
          {
            custom_field_id: "b592d3da-39e1-11f1-bf9e-02420a320002",
            value: message
          },
          {
            custom_field_id: "3b45f284-459d-11f1-a9c4-02420a320002",
            value: bin_id
          },
          {
            custom_field_id: "a2e8aae8-39e1-11f1-8be6-02420a320002",
            value: location_name
          },
          {
            custom_field_id: "f659fab4-4e50-11f1-a91b-02420a320003",
            value: city_state
          }
        ],

        create_source: "Account"
      };

      const finalPostmanPayload = JSON.stringify({
        account_operation_method: "POST",
        account_operation_url: "/contacts",
        account_operation_payload: JSON.stringify(inner)
      });

      console.log("FINAL PAYLOAD:", finalPostmanPayload);

      // 5. SEND TO CONSTANT CONTACT
      if (!env.CC_ACCOUNT_ID) {
        throw new Error("Missing CC_ACCOUNT_ID.");
      }

      const targetUrl = `https://api.cc.email/v3/partner/accounts/${env.CC_ACCOUNT_ID}/account_operations/sync`;

      const ccResponse = await fetch(targetUrl, {
        method: "POST",
        redirect: "follow",
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-api-key": env.CC_CLIENT_ID,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: finalPostmanPayload,
      });

      const ccResultText = await ccResponse.text();
      console.log("CC RESPONSE RAW:", ccResultText);

      let ccResultData;
      try {
        ccResultData = JSON.parse(ccResultText);
      } catch {
        ccResultData = { rawResponse: ccResultText };
      }

      if (!ccResponse.ok) {
        throw new Error(`Constant Contact Error [${ccResponse.status}]: ${JSON.stringify(ccResultData)}`);
      }

      return new Response(JSON.stringify({ success: true, data: ccResultData }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
        },
      });

    } catch (error) {
      console.error("WORKER EXECUTION CRASHED:", error.message);

      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
        },
      });
    }
  },
};
