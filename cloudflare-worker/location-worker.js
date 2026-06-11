export default {
  async fetch(request, env, ctx) {
    // 🔗 Master Google Apps Script Web App Deployment Destination URL
    const GOOGLE_SCRIPT_URL = "[Your Google Apps Script Web App URL here]";

    // Rejects invalid GET requests at edge nodes for security
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      // 1. Capture the raw string body from Duda
      const requestBody = await request.text();
      console.log("RAW FORM DATA FROM DUDA:", requestBody);

      // 2. Transmit data to Google Sheets and await a strict network response code
      const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody
      });

      const googleResponseBody = await googleResponse.text();
      console.log("GOOGLE RESPONSE STATUS:", googleResponse.status, "BODY:", googleResponseBody);

      // 3. Handshake Execution: Instantly return an HTTP 200 OK directly back to Duda's engine.
      // This wipes Duda's internal submission cache clean, permanently blocking infinite looping retries.
      return new Response(JSON.stringify({ status: "success", googleReply: googleResponseBody }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      console.error("PROXY ROUTING ERROR:", error.toString());
      return new Response(JSON.stringify({ status: "error", message: error.toString() }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
