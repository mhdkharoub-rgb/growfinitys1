// api/auth-pi.js
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { getDb } = require("./_lib/db");
const { cookieBaseOptions, setCookie } = require("./_lib/cookies");

const COOKIE_NAME = "gf_session";

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const APP_JWT_SECRET = process.env.APP_JWT_SECRET;
    const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY;

    if (!APP_JWT_SECRET) return res.status(500).json({ error: "Missing APP_JWT_SECRET" });
    if (!PI_SERVER_API_KEY) return res.status(500).json({ error: "Missing PI_SERVER_API_KEY" });

    const { accessToken } = req.body || {};
    if (!accessToken) return res.status(400).json({ error: "Missing accessToken" });

    // 🔐 Verify token with Pi
    const piResponse = await axios.get("https://api.minepi.com/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Pi-Server-API-Key": PI_SERVER_API_KEY
      }
    });

    const me = piResponse.data;

    if (!me?.uid || !me?.username) {
      return res.status(401).json({ error: "Invalid Pi response" });
    }

    const db = await getDb();
    const users = db.collection("users");

    const now = new Date();

    await users.updateOne(
      { uid: me.uid },
      {
        $set: {
          uid: me.uid,
          username: me.username,
          updatedAt: now
        },
        $setOnInsert: {
          createdAt: now,
          tier: "basic",
          subscriptionExpires: null
        }
      },
      { upsert: true }
    );

    const appToken = jwt.sign(
      { uid: me.uid, username: me.username },
      APP_JWT_SECRET,
      { expiresIn: "30d" }
    );

    const opts = cookieBaseOptions(req);
    setCookie(res, COOKIE_NAME, appToken, opts);

    return res.status(200).json({
      ok: true,
      user: { uid: me.uid, username: me.username }
    });

  } catch (e) {
    console.error("AUTH-PI ERROR:", e);
    return res.status(500).json({
      error: "auth-pi crashed",
      message: e?.message
    });
  }
};
