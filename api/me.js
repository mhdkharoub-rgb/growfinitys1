import { sendJson, requireUser } from "./_lib/auth.js";
import { connectDB } from "./_lib/db.js";
import User from "../models/User.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });

  try {
    const session = requireUser(req);
    await connectDB();
    const user = await User.findOne({ uid: session.uid });
    return sendJson(res, 200, { ok: true, user: { uid: session.uid, username: session.username, tier: session.tier, subscriptionExpires: user?.subscriptionExpires } });
  } catch (err) {
    return sendJson(res, 401, { error: err.message });
  }
}
