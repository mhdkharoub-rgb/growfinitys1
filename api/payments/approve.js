import { sendJson, getCookie } from "../_lib/http.js";
import jwt from "jsonwebtoken";

const PI_API_BASE = "https://api.minepi.com/v2";

export default async function handler(req, res) {
      try {
            // Always respond on GET (no crash)
                if (req.method !== "POST") {
                          return sendJson(res, 405, { error: "Method not allowed", method: req.method });
                }

                    // Verify app session via cookie JWT (same idea as /api/me)
                        const token = getCookie(req, "gf_session");
                            if (!token) return sendJson(res, 401, { error: "Not authenticated (missing gf_session cookie)" });

                                if (!process.env.APP_JWT_SECRET) return sendJson(res, 500, { error: "Missing APP_JWT_SECRET" });

                                    let session;
                                        try {
                                                  session = jwt.verify(token, process.env.APP_JWT_SECRET);
                                        } catch (e) {
                                                  return sendJson(res, 401, { error: "Invalid session token", message: e.message });
                                        }

                                            if (!process.env.PI_SERVER_API_KEY) {
                                                      return sendJson(res, 500, { error: "Missing PI_SERVER_API_KEY" });
                                            }

                                                const body = await readBody(req);
                                                    const paymentId = body?.paymentId;
                                                        if (!paymentId) return sendJson(res, 400, { error: "Missing paymentId" });

                                                            const r = await fetch(`${PI_API_BASE}/payments/${paymentId}/approve`, {
                                                                      method: "POST",
                                                                            headers: { Authorization: `Key ${process.env.PI_SERVER_API_KEY}` }
                                                            });

                                                                const data = await safeJson(r);

                                                                    if (!r.ok) {
                                                                              return sendJson(res, 502, { error: "Pi approve failed", details: data || { status: r.status } });
                                                                    }

                                                                        return sendJson(res, 200, { ok: true, session, result: data });
      } catch (err) {
            return sendJson(res, 500, { error: "Server crash", message: err?.message || String(err) });
      }
}

async function readBody(req) {
      if (req.body && typeof req.body === "object") return req.body;
        return await new Promise((resolve, reject) => {
                let data = "";
                    req.on("data", (c) => (data += c));
                        req.on("end", () => {
                                  try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
                        });
        });
}

async function safeJson(r) {
      try { return await r.json(); } catch { return null; }
}