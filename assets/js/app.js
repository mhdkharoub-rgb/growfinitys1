// public/assets/js/app.js

const statusText = document.getElementById("statusText");
const loggedOutBlock = document.getElementById("loggedOutBlock");
const loggedInBlock = document.getElementById("loggedInBlock");
const debugLog = document.getElementById("debugLog");

function showLoggedOut(msg = "Not signed in.") {
  statusText.textContent = msg;
  loggedOutBlock.classList.remove("hidden");
  loggedInBlock.classList.add("hidden");
  debugLog.classList.add("hidden");
}

function showLoggedIn(username, payload) {
  statusText.textContent = `Signed in ✅ (@${username})`;
  loggedOutBlock.classList.add("hidden");
  loggedInBlock.classList.remove("hidden");
  if (payload) {
    debugLog.textContent = JSON.stringify(payload, null, 2);
    debugLog.classList.remove("hidden");
  }
}

// On home page: if already signed in, go straight to dashboard
async function checkSession() {
  try {
    const me = await window.API.me();
    // if session exists, redirect to dashboard
    location.href = "/dashboard";
    return;
  } catch (e) {
    showLoggedOut("Not signed in.");
  }
}

async function doPiLogin() {
  try {
    // If Pi SDK isn't present, user isn't in Pi Browser
    if (!window.Pi) {
      alert("Please open this app in Pi Browser.");
      return;
    }

    // Ensure Pi SDK is initialized (you already do Pi.init in index.html)
    const scopes = ["username", "payments"];

    const authResult = await Pi.authenticate(scopes, (payment) => {
      // not used here yet
      console.log("Incomplete payment:", payment);
    });

    const accessToken = authResult?.accessToken;
    if (!accessToken) throw new Error("No accessToken from Pi.authenticate");

    const res = await window.API.authPi(accessToken);

    // redirect to real dashboard
    location.href = "/dashboard";
  } catch (e) {
    alert(`Login failed: ${e.message || e}`);
  }
}

async function doLogout() {
  try {
    await window.API.logout();
  } catch {}
  showLoggedOut("Not signed in.");
}

// Wire buttons
document.getElementById("btnPiLogin").addEventListener("click", doPiLogin);
document.getElementById("btnLogout").addEventListener("click", doLogout);

// Start
checkSession();
