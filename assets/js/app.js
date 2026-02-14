const out = document.getElementById("out");
const btn = document.getElementById("btn");

function setOut(t) { out.textContent = t; }

function onIncompletePaymentFound(payment) {}

async function refreshMe() {
  try {
    const me = await window.API.me();
    setOut(`Signed in ✅\n\n${JSON.stringify(me, null, 2)}`);
  } catch {
    setOut("Not signed in.");
  }
}

btn.addEventListener("click", async () => {
  setOut("Starting Pi authenticate…");

  try {
    const scopes = ["username"];
    const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
    const accessToken = authResult?.accessToken;
    if (!accessToken) throw new Error("No accessToken returned by Pi");

    setOut("Verifying with server…");
    const resp = await window.API.authPi(accessToken);

    setOut(`Login OK ✅\n\n${JSON.stringify(resp.user, null, 2)}\n\nNow checking /api/me…`);
    await refreshMe();
  } catch (e) {
    setOut("Login failed: " + (e?.message || String(e)));
  }
});

refreshMe();