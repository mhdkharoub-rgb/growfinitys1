import { sendJson, getBearerToken, verifyAppToken } from "../_lib/auth.js";
import { connectDB } from "../_lib/db.js";
import User from "../../models/User.js";

const PI_API_BASE = "https://api.minepi.com/v2";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

    // Require logged-in session (your app JWT)
    const token = getBearerToken(req);
    if (!token) return sendJson(res, 401, { error: "Not authenticated" });

    const session = verifyAppToken(token);

    if (!process.env.PI_SERVER_API_KEY) {
      return sendJson(res, 500, { error: "Missing PI_SERVER_API_KEY" });
    }

    const body = await readBody(req);
    const paymentId = body?.paymentId;
    const txid = body?.txid;

    if (!paymentId || !txid) return sendJson(res, 400, { error: "Missing paymentId or txid" });

    // Complete payment in Pi
    const r = await fetch(`${PI_API_BASE}/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ txid })
    });

    const data = await safeJson(r);

    if (!r.ok) {
      return sendJson(res, 502, { error: "Pi complete failed", details: data || { status: r.status } });
    }

    // OPTIONAL: upgrade membership (manual monthly purchase = 30 days)
    // We’ll read the plan from Pi payment metadata (if present).
    // If not present, default to "basic".
    const plan = data?.metadata?.plan || "basic";
    if (!["basic", "pro", "vip"].includes(plan)) {
      return sendJson(res, 200, { ok: true, result: data, note: "Payment completed but plan invalid; membership not updated." });
    }

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
    return sendJson(res, 500, { error: "Server crash", message: err?.message || String(err) });
  }
}

async function readBody(req) {
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
    });
  });
}

async function safeJson(r) {
  try { return await r.json(); } catch { return null; }
}