import jwt from "jsonwebtoken";

export function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

export async function readJsonBody(req) {
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

function mustSecret() {
  const s = process.env.APP_JWT_SECRET;
  if (!s) throw new Error("Missing APP_JWT_SECRET env var");
  return s;
}

export function signAppToken(payload) {
  return jwt.sign(payload, mustSecret(), { expiresIn: "14d" });
}

export function verifyAppToken(token) {
  return jwt.verify(token, mustSecret());
}

export function getBearerToken(req) {
  const h = req.headers.authorization || req.headers.Authorization;
  if (!h || typeof h !== "string") return null;
  const [type, token] = h.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}