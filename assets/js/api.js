async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  // Try JSON, fallback to TEXT (this is the important fix)
  let data = null;
  let text = null;

  try {
    data = await res.json();
  } catch {
    try {
      text = await res.text();
    } catch {}
  }

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      (text && text.slice(0, 500)) ||
      `Request failed (${res.status})`;

    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    err.text = text;
    throw err;
  }

  return data;
}

window.API = {
  me: () => apiFetch("/api/me"),
  authPi: (accessToken) =>
    apiFetch("/api/auth-pi", {
      method: "POST",
      body: JSON.stringify({ accessToken })
    }),
  logout: () => apiFetch("/api/logout", { method: "POST" })
};
