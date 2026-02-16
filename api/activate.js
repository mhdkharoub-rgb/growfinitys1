import { sendJson } from "./_lib/auth.js";
import { connectDB } from "./_lib/db.js";
import User from "../models/User.js";

// TEMP ADMIN ENDPOINT FOR TESTING ONLY
// Requires header: x-admin-key: <ADMIN_KEY>
export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

  const adminKey = req.headers["x-admin-key"];
  if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
    return sendJson(res, 403, { error: "Forbidden" });
  }

  const { uid, tier, days } = await readBody(req).catch(() => ({}));
  if (!uid || !tier) return sendJson(res, 400, { error: "uid and tier required" });
  if (!["basic", "pro", "vip"].includes(tier)) return sendJson(res, 400, { error: "invalid tier" });

  await connectDB();
  const user = await User.findOne({ uid });
  if (!user) return sendJson(res, 404, { error: "User not found" });

  const durationDays = Number(days || 30);
  const expires = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  user.tier = tier;
  user.subscriptionExpires = expires;
  await user.save();

  return sendJson(res, 200, { ok: true, uid, tier, subscriptionExpires: expires });
}

async function readBody(req) {
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
    });
  });
}
