import { sendJson } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

  // Clear session by setting an expired cookie
  res.setHeader("Set-Cookie", "gf_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");

  return sendJson(res, 200, { ok: true });
}