// api/auth-pi.js
const jwt = require("jsonwebtoken");
const { getDb } = require("./_lib/db");
const { cookieBaseOptions, setCookie } = require("./_lib/cookies");

const COOKIE_NAME = "gf_session";
const PI_ME_URL = "https://api.minepi.com/v2/me";

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed", method: req.method });
    }

    const APP_JWT_SECRET = process.env.APP_JWT_SECRET;
    if (!APP_JWT_SECRET) return res.status(500).json({ error: "Missing APP_JWT_SECRET" });

    const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY;
    if (!PI_SERVER_API_KEY) return res.status(500).json({ error: "Missing PI_SERVER_API_KEY" });

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { accessToken } = body;
    if (!accessToken) return res.status(400).json({ error: "Missing accessToken" });

    // ✅ Verify token with Pi /me
    const piRes = await fetch(PI_ME_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Some Pi setups accept X-Pi-Server-API-Key; others accept Pi-Api-Key.
        // We'll send both to be safe.
        "X-Pi-Server-API-Key": PI_SERVER_API_KEY,
        "Pi-Api-Key": PI_SERVER_API_KEY
      }
    });

    const piText = await piRes.text();
    let me = null;
    try { me = JSON.parse(piText); } catch { me = { raw: piText }; }

    if (!piRes.ok) {
      return res.status(401).json({
        error: "Pi verification failed",
        status: piRes.status,
        details: me
      });
    }

    const uid = me?.uid;
    const username = me?.username;

    if (!uid || !username) {
      return res.status(502).json({ error: "Unexpected Pi /me response", details: me });
    }

    // ✅ Store/update user in Mongo
    const db = await getDb();
    const users = db.collection("users");
    const now = new Date();

    await users.updateOne(
      { uid },
      { $set: { uid, username, updatedAt: now }, $setOnInsert: { createdAt: now, tier: "basic", subscriptionExpires: null } },
      { upsert: true }
    );

    // ✅ Create session cookie
    const appToken = jwt.sign({ uid, username }, APP_JWT_SECRET, { expiresIn: "30d" });
    const opts = cookieBaseOptions(req);
    setCookie(res, COOKIE_NAME, appToken, opts);

    return res.status(200).json({ ok: true, user: { uid, username } });
  } catch (e) {
    return res.status(500).json({
      error: "auth-pi crashed",
      message: e?.message || "Internal error"
    });
  }
};
