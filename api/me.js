// api/me.js
const jwt = require("jsonwebtoken");
const COOKIE_NAME = "gf_session";

function readCookie(req, name) {
  const raw = req.headers.cookie || "";
  const parts = raw.split(";").map(s => s.trim());
  const hit = parts.find(p => p.startsWith(name + "="));
  if (!hit) return null;
  return decodeURIComponent(hit.slice(name.length + 1));
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const secret = process.env.APP_JWT_SECRET;
    if (!secret) return res.status(500).json({ error: "Missing APP_JWT_SECRET" });

    const token = readCookie(req, COOKIE_NAME);
    if (!token) return res.status(401).json({ error: "not authenticated" });

    const payload = jwt.verify(token, secret);

    return res.status(200).json({
      ok: true,
      user: { uid: payload.uid, username: payload.username }
    });
  } catch {
    return res.status(401).json({ error: "not authenticated" });
  }
};
