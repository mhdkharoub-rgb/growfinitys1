const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const usernameEl = document.getElementById("username");

function showDashboard(user) {
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  usernameEl.textContent = "@" + user.username;
}

function showLogin() {
  dashboardView.classList.add("hidden");
  loginView.classList.remove("hidden");
}

function onIncompletePaymentFound(payment) {}

async function checkAuth() {
  try {
    const resp = await window.API.me();
    showDashboard(resp.user);
  } catch {
    showLogin();
  }
}

loginBtn.addEventListener("click", async () => {
  try {
    const scopes = ["username"];
    const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
    const accessToken = authResult?.accessToken;
    if (!accessToken) throw new Error("No accessToken");

    const resp = await window.API.authPi(accessToken);
    showDashboard(resp.user);
  } catch (e) {
    alert("Login failed: " + e.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  await window.API.logout();
  showLogin();
});

checkAuth();