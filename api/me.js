import { sendJson, getBearerToken, verifyAppToken } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });

  const token = getBearerToken(req);
  if (!token) return sendJson(res, 401, { error: "Not authenticated" });

  try {
    const s = verifyAppToken(token);
    return sendJson(res, 200, { ok: true, user: { uid: s.uid, username: s.username } });
  } catch {
    return sendJson(res, 401, { error: "Not authenticated" });
  }
}