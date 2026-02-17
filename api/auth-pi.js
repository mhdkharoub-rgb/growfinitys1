// api/auth-pi.js (CommonJS-safe for Vercel)
const jwt = require("jsonwebtoken");

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return json(res, 405, { error: "Method not allowed", method: req.method });
    }

    // Parse JSON body safely (Vercel sometimes passes string)
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : (req.body || {});

    const { accessToken } = body;
    if (!accessToken) return json(res, 400, { error: "Missing accessToken" });

    const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY;
    if (!PI_SERVER_API_KEY) return json(res, 500, { error: "Missing PI_SERVER_API_KEY" });

    // Call Pi server to verify user
    const r = await fetch("https://api.minepi.com/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Pi-Api-Key": PI_SERVER_API_KEY,
      },
    });

    const text = await r.text();
    let data = null;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!r.ok) {
      return json(res, 401, {
        error: "Pi verification failed",
        status: r.status,
        details: data,
      });
    }

    const APP_JWT_SECRET = process.env.APP_JWT_SECRET;
    if (!APP_JWT_SECRET) return json(res, 500, { error: "Missing APP_JWT_SECRET" });

    // IMPORTANT: keep payload small
    const uid = data?.uid || data?.user?.uid || data?.id;
    const username = data?.username || data?.user?.username;

    if (!uid || !username) {
      return json(res, 500, { error: "Unexpected Pi response shape", details: data });
    }

    const token = jwt.sign({ uid, username, tier: "basic" }, APP_JWT_SECRET, { expiresIn: "30d" });

    // cookie for session
    res.setHeader("Set-Cookie", `app_token=${token}; Path=/; HttpOnly; SameSite=Lax; Secure`);

    return json(res, 200, { ok: true, user: { uid, username, tier: "basic" } });
  } catch (err) {
    // This will show up in Vercel logs and also return JSON instead of crash page
    return json(res, 500, { error: "auth-pi crashed", message: err.message, stack: err.stack });
  }
};
