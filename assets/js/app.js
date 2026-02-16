const statusText = document.getElementById("statusText");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const debugLog = document.getElementById("debugLog");

function log(obj) {
  if (!debugLog) return;
  debugLog.classList.remove("hidden");
  debugLog.textContent = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
}

function setLoggedOutUI() {
  if (statusText) statusText.textContent = "Not signed in.";
  if (btnLogin) btnLogin.classList.remove("hidden");
  if (btnLogout) btnLogout.classList.add("hidden");
}

function setAuthedUI(user) {
  if (statusText) statusText.textContent = `Signed in ✅ (${user.username})`;
  if (btnLogin) btnLogin.classList.add("hidden");
  if (btnLogout) btnLogout.classList.remove("hidden");
}

async function refreshMe() {
  try {
    const data = await window.API.me();
    setAuthedUI(data.user);
  } catch {
    setLoggedOutUI();
  }
}

btnLogin?.addEventListener("click", async () => {
  try {
    if (statusText) statusText.textContent = "Starting Pi authenticate…";

    const scopes = ["username", "payments"];
    const onIncompletePaymentFound = (payment) => console.log("incomplete payment", payment);

    const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

    if (statusText) statusText.textContent = "Verifying with server…";
    const result = await window.API.authPi(auth.accessToken);
    log(result);

    await refreshMe();
  } catch (e) {
    log({ error: e.message || String(e), details: e.data || null });
    alert(`Login failed: ${e.message || e}`);
  }
});

btnLogout?.addEventListener("click", async () => {
  try { await window.API.logout(); } finally { setLoggedOutUI(); }
});

// BUY buttons
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-plan][data-amount]");
  if (!btn) return;

  const plan = btn.getAttribute("data-plan");
  const amount = Number(btn.getAttribute("data-amount"));

  try {
    if (!window.Pi?.createPayment) {
      alert("Pi payments not available. Open inside Pi Browser.");
      return;
    }

    // OPTIONAL: make sure user is logged in (session cookie exists)
    await window.API.me();

    const paymentData = {
      amount,
      memo: `Growfinitys ${plan.toUpperCase()} membership (monthly)`,
      metadata: { plan, period: "monthly", ts: Date.now() }
    };

    const paymentCallbacks = {
      onReadyForServerApproval: async (paymentId) => {
        log({ step: "onReadyForServerApproval", paymentId });
        await window.API.payApprove(paymentId);
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        log({ step: "onReadyForServerCompletion", paymentId, txid });
        await window.API.payComplete(paymentId, txid);
        await refreshMe();
      },
      onCancel: (paymentId) => log({ step: "onCancel", paymentId }),
      onError: (error, payment) => log({ step: "onError", error: String(error), payment })
    };

    await window.Pi.createPayment(paymentData, paymentCallbacks);
  } catch (err) {
    log({ purchaseError: err.message || String(err), details: err.data || null });
    alert(`Payment failed: ${err.message || err}`);
  }
});

refreshMe();
