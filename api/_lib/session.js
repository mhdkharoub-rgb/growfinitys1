const jwt = require("jsonwebtoken");
const { APP_JWT_SECRET } = require("./env");
const { parseCookies, setCookie } = require("./cookies");

const COOKIE_NAME = "gf_session";

function signSession(payload) {
  return jwt.sign(payload, APP_JWT_SECRET(), { expiresIn: "30d" });
}

function readSession(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, APP_JWT_SECRET());
  } catch {
    return null;
  }
}

function writeSession(res, payload) {
  const token = signSession(payload);
  setCookie(res, COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

function clearSession(res) {
  setCookie(res, COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 0
  });
}

module.exports = { readSession, writeSession, clearSession };