async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
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
  logout: () => apiFetch("/api/logout", { method: "POST" }),

  // Pi payment server callbacks
  payApprove: (paymentId) =>
    apiFetch("/api/payments/approve", {
      method: "POST",
      body: JSON.stringify({ paymentId })
    }),

  payComplete: (paymentId, txid) =>
    apiFetch("/api/payments/complete", {
      method: "POST",
      body: JSON.stringify({ paymentId, txid })
    })
};
