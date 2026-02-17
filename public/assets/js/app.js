const statusText = document.getElementById("statusText");
const loggedOutBlock = document.getElementById("loggedOutBlock");
const loggedInBlock = document.getElementById("loggedInBlock");

function setStatus(t) { statusText.textContent = t; }

async function checkSession() {
  try {
    const me = await window.API.me(); // if 200 -> authenticated
    setStatus(`Signed in ✅ (@${me.user.username})`);
    // redirect once
    location.replace("/dashboard");
  } catch {
    setStatus("Not signed in.");
    loggedOutBlock.classList.remove("hidden");
    loggedInBlock.classList.add("hidden");
  }
}

document.getElementById("btnPiLogin").addEventListener("click", async () => {
  try {
    const scopes = ["username", "payments"];
    const authResult = await Pi.authenticate(scopes, () => {});
    await window.API.authPi(authResult.accessToken);

    // go dashboard
    location.replace("/dashboard");
  } catch (e) {
    alert(`Login failed: ${e.message || e}`);
  }
});

document.getElementById("btnLogout").addEventListener("click", async () => {
  try { await window.API.logout(); } catch {}
  location.replace("/");
});

checkSession();
