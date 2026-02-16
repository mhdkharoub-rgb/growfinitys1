import { sendJson } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

  // We will replace this endpoint with real Pi Payments logic next.
  // It will create a payment, return payment identifier, and frontend will approve/complete.
  return sendJson(res, 501, {
    error: "Payments not configured yet",
    hint: "Next step: add Pi payment credentials and enable /api/subscribe to create payments for tiers."
  });
}
