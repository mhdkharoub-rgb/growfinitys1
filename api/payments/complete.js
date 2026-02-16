import { sendJson, requireUser } from "../_lib/auth.js";
import { connectDB } from "../_lib/db.js";
import User from "../../models/User.js";

const PI_API_BASE = "https://api.minepi.com/v2";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

    const session = requireUser(req);

    if (!process.env.PI_SERVER_API_KEY) {
      return sendJson(res, 500, { error: "Missing PI_SERVER_API_KEY" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { paymentId, txid } = body;
    if (!paymentId || !txid) return sendJson(res, 400, { error: "Missing paymentId or txid" });

    const r = await fetch(`${PI_API_BASE}/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ txid })
    });

    const data = await safeJson(r);
    if (!r.ok) return sendJson(res, 502, { error: "Pi complete failed", details: data || { status: r.status } });

    // Upgrade membership for 30 days (manual monthly purchase)
    const plan = data?.metadata?.plan || "basic";

    await connectDB();
    const user = await User.findOne({ uid: session.uid });
    if (!user) return sendJson(res, 404, { error: "User not found" });

    user.tier = plan;
    user.subscriptionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    return sendJson(res, 200, {
      ok: true,
      result: data,
      membership: { tier: user.tier, subscriptionExpires: user.subscriptionExpires }
    });
  } catch (err) {
    return sendJson(res, 500, { error: err?.message || "Server error" });
  }
}

async function safeJson(r) {
  try { return await r.json(); } catch { return null; }
}