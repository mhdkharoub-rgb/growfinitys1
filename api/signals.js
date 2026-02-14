import { sendJson, getBearerToken, verifyAppToken } from "./_lib/auth.js";
import { connectDB } from "./_lib/db.js";
import User from "../../models/User.js";
import Signal from "../../models/Signal.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });

  const token = getBearerToken(req);
  if (!token) return sendJson(res, 401, { error: "Not authenticated" });

  let session;
  try {
    session = verifyAppToken(token);
  } catch {
    return sendJson(res, 401, { error: "Invalid token" });
  }

  await connectDB();
  const user = await User.findOne({ uid: session.uid });

  const signals = await Signal.find({ tier: { $in: allowedTiers(user.tier) } })
    .sort({ createdAt: -1 })
    .limit(20);

  return sendJson(res, 200, { ok: true, signals });
}

function allowedTiers(tier) {
  if (tier === "vip") return ["basic", "pro", "vip"];
  if (tier === "pro") return ["basic", "pro"];
  return ["basic"];
}