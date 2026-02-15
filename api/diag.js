import { sendJson } from "./_lib/auth.js";

export default function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });

  return sendJson(res, 200, {
    ok: true,
    has_APP_JWT_SECRET: Boolean(process.env.APP_JWT_SECRET),
    node_env: process.env.NODE_ENV || null
  });
}