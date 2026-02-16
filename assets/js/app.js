const elStatus = document.getElementById("status");
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

                if (data && data.ok && data.user) {
                          const username = data.user.username;

                                document.querySelector("#status").innerText =
                                        `Signed in ✅ (@${username})`;

                                              document.querySelector("#btnLogin").style.display = "none";
                                                    document.querySelector("#btnLogout").style.display = "inline-block";

                } else {
                          throw new Error("No user");
                }

      } catch (err) {
            document.querySelector("#status").innerText = "Not signed in.";

                document.querySelector("#btnLogin").style.display = "inline-block";
                    document.querySelector("#btnLogout").style.display = "none";
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