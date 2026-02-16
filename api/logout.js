

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed", method: req.method });
  }

  res.setHeader(
    "Set-Cookie",
    "app_token=; Path=/; HttpOnly; Max-Age=0; SameSite=None; Secure"
  );

  return res.status(200).json({ ok: true });
}