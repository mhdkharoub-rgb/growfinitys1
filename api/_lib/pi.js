const PI_API_BASE = "https://api.minepi.com/v2";

async function piFetch(path, options = {}) {
  const res = await fetch(`${PI_API_BASE}${path}`, options);
  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    const msg = data?.error || `Pi API failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function getPiMe(accessToken) {
  return piFetch("/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}

async function approvePayment(serverApiKey, paymentId) {
  return piFetch(`/payments/${paymentId}/approve`, {
    method: "POST",
    headers: { Authorization: `Key ${serverApiKey}` }
  });
}

async function completePayment(serverApiKey, paymentId, txid) {
  return piFetch(`/payments/${paymentId}/complete`, {
    method: "POST",
    headers: { Authorization: `Key ${serverApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ txid })
  });
}

async function getPayment(serverApiKey, paymentId) {
  return piFetch(`/payments/${paymentId}`, {
    method: "GET",
    headers: { Authorization: `Key ${serverApiKey}` }
  });
}

module.exports = { getPiMe, approvePayment, completePayment, getPayment };