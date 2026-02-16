document.addEventListener("DOMContentLoaded", () => {

      const statusEl = document.getElementById("status");
        const btnLogin = document.getElementById("btnLogin");
          const btnLogout = document.getElementById("btnLogout");

            async function refreshMe() {
                    try {
                              const data = await window.API.me();

                                    if (data && data.ok && data.user) {
                                                statusEl.innerText = `Signed in ✅ (@${data.user.username})`;
                                                        btnLogin.style.display = "none";
                                                                btnLogout.style.display = "inline-block";
                                    } else {
                                                throw new Error("No user");
                                    }

                    } catch (err) {
                              statusEl.innerText = "Not signed in.";
                                    btnLogin.style.display = "inline-block";
                                          btnLogout.style.display = "none";
                    }
            }

              btnLogin.addEventListener("click", async () => {
                    try {
                              if (!window.Pi) {
                                        alert("Pi SDK not loaded");
                                                return;
                              }

                                    await window.Pi.init({ version: "2.0" });

                                          const auth = await window.Pi.authenticate(
                                                    ["username"],
                                                            () => {}
                                          );

                                                await window.API.authPi(auth.accessToken);

                                                      await refreshMe();

                    } catch (err) {
                              alert("Login failed: " + err.message);
                    }
              });

                btnLogout.addEventListener("click", async () => {
                        await window.API.logout();
                            await refreshMe();
                });

                  refreshMe();
});
