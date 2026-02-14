import { readJsonBody, sendJson, signAppToken } from "./_lib/auth.js";

const PI_API_BASE = "https://api.minepi.com";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON" });
  }

  const accessToken = body?.accessToken;
  if (!accessToken || typeof accessToken !== "string") {
    return sendJson(res, 400, { error: "accessToken required" });
  }

  let meResp;
  try {
    meResp = await fetch(`${PI_API_BASE}/v2/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  } catch {
    return sendJson(res, 502, { error: "Pi API unreachable" });
  }

  const me = await meResp.json().catch(() => null);

  if (meResp.status === 401) return sendJson(res, 401, { error: "Invalid Pi access token", me });
  if (!meResp.ok) return sendJson(res, 502, { error: `Pi API error (${meResp.status})`, me });

  const uid = me?.uid;
  const username = me?.username;

  if (!uid || !username) return sendJson(res, 502, { error: "Unexpected Pi /me response", me });

  const appToken = signAppToken({ uid, username });

  return sendJson(res, 200, {
    ok: true,
    user: { uid, username },
    appToken
  });
}