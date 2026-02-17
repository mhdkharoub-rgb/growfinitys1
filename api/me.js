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
    const APP_JWT_SECRET = process.env.APP_JWT_SECRET;
    if (!APP_JWT_SECRET) return res.status(500).json({ error: "Missing APP_JWT_SECRET" });

    const token = readCookie(req, COOKIE_NAME);
    if (!token) return res.status(200).json({ ok: true, me: null });

    const payload = jwt.verify(token, APP_JWT_SECRET);
    return res.status(200).json({
      ok: true,
      me: {
        uid: payload.uid,
        username: payload.username
      }
    });
  } catch (e) {
    // invalid token -> treat as logged out
    return res.status(200).json({ ok: true, me: null });
  }
};
