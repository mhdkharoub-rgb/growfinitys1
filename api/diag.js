import { sendJson } from "./_lib/auth.js";

export default function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });

  return sendJson(res, 200, {
    ok: true,
    has_APP_JWT_SECRET: Boolean(process.env.APP_JWT_SECRET),
    has_MONGODB_URI: Boolean(process.env.MONGODB_URI),
    has_PI_SERVER_API_KEY: Boolean(process.env.PI_SERVER_API_KEY),
    node_env: process.env.NODE_ENV || null
  });
}