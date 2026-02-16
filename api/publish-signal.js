import { sendJson } from "./_lib/auth.js";
import { connectDB } from "./_lib/db.js";
import Signal from "../models/Signal.js";

// ADMIN ONLY: header x-admin-key must match ADMIN_KEY
export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

  const adminKey = req.headers["x-admin-key"];
  if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
    return sendJson(res, 403, { error: "Forbidden" });
  }

  const body = await readBody(req).catch(() => null);
  if (!body) return sendJson(res, 400, { error: "Invalid JSON" });

  const {
    asset, market, timeframe, side,
    entry, takeProfit, stopLoss, notes,
    tier
  } = body;

  if (!asset || !market || !timeframe || !side) return sendJson(res, 400, { error: "Missing fields" });
  if (!["crypto","forex","tokens"].includes(market)) return sendJson(res, 400, { error: "Invalid market" });
  if (!["daily","weekly","monthly"].includes(timeframe)) return sendJson(res, 400, { error: "Invalid timeframe" });
  if (!["buy","sell"].includes(side)) return sendJson(res, 400, { error: "Invalid side" });
  if (!["basic","pro","vip"].includes(tier || "basic")) return sendJson(res, 400, { error: "Invalid tier" });

  await connectDB();
  const s = await Signal.create({
    asset,
    market,
    timeframe,
    side,
    entry: entry ?? null,
    takeProfit: takeProfit ?? null,
    stopLoss: stopLoss ?? null,
    notes: notes ?? "",
    tier: tier || "basic"
  });

  return sendJson(res, 200, { ok: true, signal: s });
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
