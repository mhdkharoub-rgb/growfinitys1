// api/_lib/cookies.js
const ONE_MONTH = 60 * 60 * 24 * 30;

function cookieBaseOptions(req) {
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "").toString();
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const proto = (req.headers["x-forwarded-proto"] || "").toString();
  const isHttps = proto === "https" || (!isLocal && !!host);

  return {
    httpOnly: true,
    sameSite: "Lax", // important for Pi Browser / redirects
    secure: isHttps, // must be true on Vercel (https)
    path: "/",
    maxAge: ONE_MONTH
  };
}

function setCookie(res, name, value, opts) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  if (opts.path) parts.push(`Path=${opts.path}`);
  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearCookie(res, name) {
  res.setHeader(
    "Set-Cookie",
    `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure`
  );
}

module.exports = { cookieBaseOptions, setCookie, clearCookie, ONE_MONTH };