const TOKEN_KEY = "gf_app_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

window.API = {
  me: () => apiFetch("/api/me"),
  logout: () => { clearToken(); return Promise.resolve({ ok: true }); },
  authPi: async (accessToken) => {
    const resp = await apiFetch("/api/auth-pi", {
      method: "POST",
      body: JSON.stringify({ accessToken })
    });
    if (resp?.appToken) setToken(resp.appToken);
    return resp;
  }
};