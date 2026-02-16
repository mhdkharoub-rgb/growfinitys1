import { readJsonBody, sendJson, signAppToken } from "./_lib/auth.js";
import { connectDB } from "./_lib/db.js";
import User from "../models/User.js";

const PI_API_BASE = "https://api.minepi.com";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

    const body = await readJsonBody(req);
    const accessToken = body?.accessToken;

    if (!accessToken || typeof accessToken !== "string") {
      return sendJson(res, 400, { error: "Missing accessToken" });
    }

    // Verify Pi token
    const piResp = await fetch(`${PI_API_BASE}/v2/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const me = await piResp.json().catch(() => null);
    if (!piResp.ok) return sendJson(res, 401, { error: "Invalid Pi token", details: me });

    const uid = me?.uid;
    const username = me?.username;
    if (!uid || !username) return sendJson(res, 502, { error: "Unexpected Pi /me response", details: me });

    await connectDB();

    let user = await User.findOne({ uid });
    if (!user) user = await User.create({ uid, username, tier: "basic" });

    // keep username fresh
    if (user.username !== username) {
      user.username = username;
      await user.save();
    }

    const appToken = signAppToken({
      uid,
      username,
      tier: user.tier
    });

    return sendJson(res, 200, {
      ok: true,
      user: {
        uid,
        username,
        tier: user.tier,
        subscriptionExpires: user.subscriptionExpires
      },
      appToken
    });
  } catch (err) {
    return sendJson(res, 500, { error: "Server crash", message: err?.message || String(err) });
  }
}
