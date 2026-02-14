import { sendJson } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });
  return sendJson(res, 401, { error: "Not authenticated" });
}