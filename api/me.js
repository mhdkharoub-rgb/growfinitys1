import jwt from "jsonwebtoken";

function readCookie(req, name) {
  const cookie = req.headers.cookie || "";
  const parts = cookie.split(";").map(s => s.trim());
  const found = parts.find(p => p.startsWith(name + "="));
  return found ? decodeURIComponent(found.split("=").slice(1).join("=")) : null;
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed", method: req.method });
  }

  try {
    const token = readCookie(req, "app_token");
    if (!token) return res.status(401).json({ error: "not authenticated" });

    const secret = process.env.APP_JWT_SECRET;
    const payload = jwt.verify(token, secret);

    return res.status(200).json({
      ok: true,
      user: {
        uid: payload.uid,
        username: payload.username,
        tier: payload.tier || "basic",
        subscriptionExpires: payload.subscriptionExpires || null
      }
    });
  } catch (e) {
    return res.status(401).json({ error: "invalid session" });
  }
}
