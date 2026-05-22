export default {
  async fetch(request, env, ctx) {
    try {
      // Read raw body
      const raw = await request.text();
      console.log("Incoming Duda payload:", raw);

      // Parse JSON
      const data = JSON.parse(raw);

      // Extract fields from Duda
      const name = data["Name"] || "";
      const email = data["Email"] || "";
      const phone = data["Phone"] || "";
      const message = data["Message"] || "";
      const cityState = data["city_state"] || "";

      // Split name into first/last
      let firstName = "";
      let lastName = "";
      if (name.includes(" ")) {
        const parts = name.split(" ");
        firstName = parts[0];
        lastName = parts.slice(1).join(" ");
      } else {
        firstName = name;
      }

      // Validate email
      if (!email || !email.includes("@")) {
        console.log("Invalid or missing email:", email);
        return new Response("Invalid email", { status: 400 });
      }

      // Constant Contact API endpoint
      const url = "https://api.cc.email/v3/contacts/sign_up_form";

      // Build Constant Contact payload
      const ccPayload = {
        email_address: email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        custom_fields: [
          { custom_field_id: "message", value: message },
          { custom_field_id: "city_state", value: cityState }
        ],
        list_memberships: [
          "YOUR_LIST_ID_HERE"
        ]
      };

      // Send to Constant Contact
      const ccResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.CC_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(ccPayload)
      });

      const ccText = await ccResponse.text();
      console.log("Constant Contact response:", ccText);

      if (!ccResponse.ok) {
        return new Response("Constant Contact error", { status: 500 });
      }

      return new Response("OK", { status: 200 });

    } catch (err) {
      console.log("Worker error:", err);
      return new Response("Server error", { status: 500 });
    }
  }
};
