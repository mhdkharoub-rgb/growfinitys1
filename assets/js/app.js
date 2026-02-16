const elStatus = document.getElementById("statusText");
const elBtnLogin = document.getElementById("btnLogin");
const elBtnLogout = document.getElementById("btnLogout");
const elDebug = document.getElementById("debugLog");

function setStatus(t) { if (elStatus) elStatus.textContent = t; }
function dbg(obj) {
    if (!elDebug) return;
      elDebug.style.whiteSpace = "pre-wrap";
        elDebug.textContent = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
}

function appendDbg(obj) {
    if (!elDebug) return;
      const line = typeof obj === "string" ? obj : JSON.stringify(obj);
        elDebug.textContent = (elDebug.textContent || "") + "\n" + line;
}

function isPiBrowser() {
    return /PiBrowser/i.test(navigator.userAgent || "");
}

window.addEventListener("error", (e) => {
    appendDbg({ globalError: String(e.message || e.error || e) });
});

dbg({
    boot: "APP.JS LOADED ✅",
      hasBtnLogin: Boolean(elBtnLogin),
        hasPiSdk: Boolean(window.Pi),
          isPiBrowser: isPiBrowser(),
            ua: navigator.userAgent
});

async function refreshMe() {
    try {
          const me = await window.API.me();
              setStatus(`Signed in ✅ (@${me.user.username})`);
                  elBtnLogin?.classList.add("hidden");
                      elBtnLogout?.classList.remove("hidden");
    } catch {
          setStatus("Not signed in.");
              elBtnLogin?.classList.remove("hidden");
                  elBtnLogout?.classList.add("hidden");
    }
}

elBtnLogin?.addEventListener("click", async () => {
    appendDbg("CLICK btnLogin ✅");

      try {
          if (!window.Pi) {
                appendDbg("Pi SDK MISSING ❌");
                  alert("Pi SDK not loaded. Check pi-sdk.js is included in index.html.");
                        return;
          }

            setStatus("Starting Pi authenticate…");
                appendDbg("Calling Pi.authenticate…");

                    const scopes = ["username", "payments"];
                        const onIncompletePaymentFound = (payment) => appendDbg({ incompletePayment: payment });

                            const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
                                appendDbg({ piAuthOk: true, keys: Object.keys(auth || {}) });

                                    setStatus("Verifying with server…");
                                        const result = await window.API.authPi(auth.accessToken);
                                            appendDbg({ serverAuthOk: true, result });

                                                await refreshMe();
      } catch (e) {
          appendDbg({ loginError: e.message || String(e), data: e.data || null });
            alert(`Login failed: ${e.message || e}`);
      }
});

elBtnLogout?.addEventListener("click", async () => {
    try { await window.API.logout(); } finally { await refreshMe(); }
});

refreshMe();

function setStatus(t) { if (elStatus) elStatus.textContent = t; }
function showDebug(obj) {
      if (!elDebug) return;
        elDebug.classList.remove("hidden");
          elDebug.textContent = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
}

function isPiBrowser() {
      // Pi Browser user agent usually includes "PiBrowser"
        return /PiBrowser/i.test(navigator.userAgent || "");
}

async function refreshMe() {
      try {
            const me = await window.API.me();
                setStatus(`Signed in ✅ (@${me.user.username})`);
                    elBtnLogin?.classList.add("hidden");
                        elBtnLogout?.classList.remove("hidden");
      } catch (e) {
            setStatus("Not signed in.");
                elBtnLogin?.classList.remove("hidden");
                    elBtnLogout?.classList.add("hidden");
      }
}

function bootInfo() {
      showDebug({
            ua: navigator.userAgent,
                isPiBrowser: isPiBrowser(),
                    hasPiSdk: Boolean(window.Pi),
                        origin: window.location.origin
      });
}

elBtnLogin?.addEventListener("click", async () => {
      try {
            showDebug({ step: "login_click", hasPiSdk: Boolean(window.Pi) });

                if (!window.Pi) {
                          alert("Pi SDK not loaded. Make sure pi-sdk.js is included and open in Pi Browser.");
                                return;
                }

                    setStatus("Starting Pi authenticate…");

                        const scopes = ["username", "payments"];
                            const onIncompletePaymentFound = (payment) => showDebug({ step: "incomplete_payment", payment });

                                const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
                                    showDebug({ step: "pi_auth_ok", authKeys: Object.keys(auth || {}) });

                                        setStatus("Verifying with server…");
                                            const result = await window.API.authPi(auth.accessToken);
                                                showDebug({ step: "server_auth_ok", result });

                                                    await refreshMe();
      } catch (e) {
            showDebug({ step: "login_error", message: e.message || String(e), data: e.data || null });
                alert(`Login failed: ${e.message || e}`);
      }
});

elBtnLogout?.addEventListener("click", async () => {
      try {
            await window.API.logout();
      } finally {
            await refreshMe();
      }
});

window.addEventListener("load", () => {
      bootInfo();
        refreshMe();
});