const elStatus = document.getElementById("statusText");
const elBtnLogin = document.getElementById("btnLogin");
const elBtnLogout = document.getElementById("btnLogout");
const elDebug = document.getElementById("debugLog");

function setStatus(t) {
      if (elStatus) elStatus.textContent = t;
}

function dbg(obj) {
      if (!elDebug) return;
        elDebug.textContent =
            typeof obj === "string"
                  ? obj
                        : JSON.stringify(obj, null, 2);
}

async function initPi() {
      if (!window.Pi) {
            dbg("❌ Pi SDK not loaded");
                return false;
      }

        try {
                window.Pi.init({
                          version: "2.0",
                                sandbox: false
                });

                    dbg("✅ Pi SDK initialized");
                        return true;
        } catch (err) {
                dbg({ initError: err.message });
                    return false;
        }
}

async function refreshMe() {
      try {
            const data = await window.API.me();

                if (data && data.user) {
                          setStatus(`Signed in ✅ (@${data.user.username})`);
                                elBtnLogin?.classList.add("hidden");
                                      elBtnLogout?.classList.remove("hidden");
                } else {
                          throw new Error("No user");
                }
      } catch {
            setStatus("Not signed in.");
                elBtnLogin?.classList.remove("hidden");
                    elBtnLogout?.classList.add("hidden");
      }
}

elBtnLogin?.addEventListener("click", async () => {
      try {
            const ready = await initPi();
                if (!ready) return;

                    setStatus("Authenticating with Pi...");

                        const scopes = ["username", "payments"];
                            const onIncompletePaymentFound = (payment) =>
                                  console.log("Incomplete payment:", payment);

                                      const auth = await window.Pi.authenticate(
                                              scopes,
                                                    onIncompletePaymentFound
                                      );

                                          dbg({ authSuccess: true });

                                              const result = await window.API.authPi(auth.accessToken);

                                                  dbg(result);

                                                      await refreshMe();
      } catch (err) {
            alert("Login failed: " + err.message);
                dbg({ loginError: err.message });
      }
});

elBtnLogout?.addEventListener("click", async () => {
      await window.API.logout();
        await refreshMe();
});

refreshMe();