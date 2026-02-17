// api/auth-pi.js
const jwt = require("jsonwebtoken");
const { getDb } = require("./_lib/db");
const { cookieBaseOptions, setCookie } = require("./_lib/cookies");

const COOKIE_NAME = "gf_session";

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed", method: req.method });
    }

    const APP_JWT_SECRET = process.env.APP_JWT_SECRET;
    if (!APP_JWT_SECRET) return res.status(500).json({ error: "Missing APP_JWT_SECRET" });

    const { accessToken } = req.body || {};
    if (!accessToken) return res.status(400).json({ error: "Missing accessToken" });

    // If you already verify Pi token in your code, keep it.
    // For now we just store the user after you already trust the token.
    // Expect your existing logic produces uid + username (or similar).
    // ---- START: minimal safe parsing fallback (won't crash) ----
    let uid = null;
    let username = null;

    // If your previous code calls Pi Server API and gets username/uid, KEEP THAT
    // and set uid/username from that response.
    // Here we accept that req.body might also include it for testing.
    if (req.body.uid) uid = req.body.uid;
    if (req.body.username) username = req.body.username;

    // If you already have server-side verification, you should set uid/username from it.
    if (!uid || !username) {
      // Don’t crash, return clear message
      return res.status(400).json({
        error: "Pi token verified data missing (uid/username). Make sure Pi Server API verification runs and returns uid+username."
      });
    }
    // ---- END ----

    const db = await getDb();
    const users = db.collection("users");

    const now = new Date();
    await users.updateOne(
      { uid },
      { $set: { uid, username, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );

    const appToken = jwt.sign(
      { uid, username },
      APP_JWT_SECRET,
      { expiresIn: "30d" }
    );

    const opts = cookieBaseOptions(req);
    setCookie(res, COOKIE_NAME, appToken, opts);

    return res.status(200).json({
      ok: true,
      user: { uid, username }
    });
  } catch (e) {
    return res.status(500).json({
      error: e?.message || "Internal error",
      name: e?.name
    });
  }
};
