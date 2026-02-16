import { sendJson, getBearerToken, verifyAppToken } from "../_lib/auth.js";

const PI_API_BASE = "https://api.minepi.com/v2";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

    // Require logged-in session (your app JWT)
    const token = getBearerToken(req);
    if (!token) return sendJson(res, 401, { error: "Not authenticated" });
    verifyAppToken(token);

    if (!process.env.PI_SERVER_API_KEY) {
      return sendJson(res, 500, { error: "Missing PI_SERVER_API_KEY" });
    }

    const body = await readBody(req);
    const paymentId = body?.paymentId;
    if (!paymentId) return sendJson(res, 400, { error: "Missing paymentId" });

    const r = await fetch(`${PI_API_BASE}/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { Authorization: `Key ${process.env.PI_SERVER_API_KEY}` }
    });

    const data = await safeJson(r);

    if (!r.ok) {
      return sendJson(res, 502, { error: "Pi approve failed", details: data || { status: r.status } });
    }

    return sendJson(res, 200, { ok: true, result: data });
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