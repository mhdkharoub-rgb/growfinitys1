import jwt from "jsonwebtoken";

const PI_ME_URL = "https://api.minepi.com/v2/me";

export default async function handler(req, res) {
  // Always JSON
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed", method: req.method });
  }

  try {
    const { accessToken } = req.body || {};
    if (!accessToken) {
      return res.status(400).json({ error: "Missing accessToken" });
    }

    const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY;
    if (!PI_SERVER_API_KEY) {
      return res.status(500).json({ error: "Missing PI_SERVER_API_KEY env var" });
    }

    // Verify token with Pi /me
    const r = await fetch(PI_ME_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Pi-Server-API-Key": PI_SERVER_API_KEY
      }
    });

    const raw = await r.text();
    let me = null;
    try {
      me = JSON.parse(raw);
    } catch {
      return res.status(502).json({
        error: "Pi /me returned non-JSON",
        status: r.status,
        raw: raw.slice(0, 800)
      });
    }

    if (!r.ok) {
      return res.status(502).json({
        error: "Pi /me error",
        status: r.status,
        details: me
      });
    }

    // Create your app session token
    const APP_JWT_SECRET = process.env.APP_JWT_SECRET;
    if (!APP_JWT_SECRET) {
      return res.status(500).json({ error: "Missing APP_JWT_SECRET env var" });
    }

    const token = jwt.sign(
      {
        uid: me.uid,
        username: me.username,
        scopes: me.credentials?.scopes || []
      },
      APP_JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Cookie session
    const isProd = process.env.NODE_ENV === "production";
    res.setHeader(
      "Set-Cookie",
      [
        `app_token=${token}; Path=/; HttpOnly; SameSite=None; Secure`,
      ]
    );

    return res.status(200).json({
      ok: true,
      user: { uid: me.uid, username: me.username }
    });
  } catch (e) {
    // Never let it crash without JSON
    return res.status(500).json({
      error: "auth-pi crashed",
      message: e?.message || String(e),
      // keep stack short to avoid huge payloads
      stack: (e?.stack || "").split("\n").slice(0, 6).join("\n")
    });
  }
}
