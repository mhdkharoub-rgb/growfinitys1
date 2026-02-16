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

function parseCookies(cookieHeader = "") {
  const out = {};
  cookieHeader.split(";").forEach((part) => {
    const [k, ...rest] = part.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(rest.join("=") || "");
  });
  return out;
}

function setCookie(res, name, value, opts = {}) {
  const parts = [];
  parts.push(`${name}=${encodeURIComponent(value)}`);

  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.domain) parts.push(`Domain=${opts.domain}`);

  res.setHeader("Set-Cookie", parts.join("; "));
}

export function requireUser(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  const token = cookies["gf_session"];
  if (!token) throw new Error("Not authenticated");
  try {
    return jwt.verify(token, mustSecret());
  } catch {
    throw new Error("Invalid session");
  }
}

export function writeSession(res, payload) {
  const token = signAppToken(payload);
  setCookie(res, "gf_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}