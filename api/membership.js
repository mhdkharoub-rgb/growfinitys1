import { sendJson, getBearerToken, verifyAppToken } from "./_lib/auth.js";
import { connectDB } from "./_lib/db.js";
import User from "../models/User.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });

  const token = getBearerToken(req);
  if (!token) return sendJson(res, 401, { error: "Not authenticated" });

  let session;
  try {
    session = verifyAppToken(token);
  } catch {
    return sendJson(res, 401, { error: "Not authenticated" });
  }

  await connectDB();
  const user = await User.findOne({ uid: session.uid });
  if (!user) return sendJson(res, 404, { error: "User not found" });

  const active = isActive(user.subscriptionExpires);

  return sendJson(res, 200, {
    ok: true,
    user: {
      uid: user.uid,
      username: user.username,
      tier: user.tier,
      subscriptionExpires: user.subscriptionExpires,
      active
    }
  });
}

function isActive(expires) {
  if (!expires) return false;
  return new Date(expires).getTime() > Date.now();
}
