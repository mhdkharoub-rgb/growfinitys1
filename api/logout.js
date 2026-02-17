// api/logout.js
const { clearCookie } = require("./_lib/cookies");
const COOKIE_NAME = "gf_session";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed", method: req.method });
  }
  clearCookie(res, COOKIE_NAME);
  return res.status(200).json({ ok: true });
};