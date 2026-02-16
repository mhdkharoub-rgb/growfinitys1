const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const usernameEl = document.getElementById("username");
const tierEl = document.getElementById("tier");
const expiresEl = document.getElementById("expires");
const signalsEl = document.getElementById("signals");

const btnBasic = document.getElementById("buyBasic");
const btnPro = document.getElementById("buyPro");
const btnVip = document.getElementById("buyVip");

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

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "-" : dt.toISOString().slice(0, 10);
}

async function loadMembership() {
  const m = await window.API.membership();
  tierEl.textContent = m.user.active ? m.user.tier.toUpperCase() : "BASIC (expired → basic access)";
  expiresEl.textContent = formatDate(m.user.subscriptionExpires);
}

function renderSignals(items) {
  if (!items?.length) {
    signalsEl.innerHTML = "<div class='muted'>No signals yet.</div>";
    return;
  }

  signalsEl.innerHTML = items.map(s => `
    <div class="signal">
      <div class="row">
        <div class="asset">${s.asset} <span class="badge">${s.market}</span></div>
        <div class="tier">${(s.tier || "basic").toUpperCase()}</div>
      </div>
      <div class="row2">
        <span class="pill">${s.timeframe}</span>
        <span class="pill ${s.side === "buy" ? "buy" : "sell"}">${s.side.toUpperCase()}</span>
      </div>
      <div class="levels">
        <div>Entry: <b>${s.entry ?? "-"}</b></div>
        <div>TP: <b>${s.takeProfit ?? "-"}</b></div>
        <div>SL: <b>${s.stopLoss ?? "-"}</b></div>
      </div>
      ${s.notes ? `<div class="notes">${s.notes}</div>` : ""}
      <div class="muted">${new Date(s.createdAt).toISOString().replace("T"," ").slice(0,16)}Z</div>
    </div>
  `).join("");
}

async function loadSignals() {
  const r = await window.API.signals();
  renderSignals(r.signals);
}

async function checkAuth() {
  try {
    const me = await window.API.me();
    showDashboard(me.user);
    await loadMembership();
    await loadSignals();
  } catch {
    showLogin();
  }
}

async function doSubscribe(tier) {
  try {
    // placeholder until we wire Pi payments
    await window.API.subscribe(tier);
  } catch (e) {
    alert(e.message);
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
    await loadMembership();
    await loadSignals();
  } catch (e) {
    alert("Login failed: " + e.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  await window.API.logout();
  showLogin();
});

btnBasic.addEventListener("click", () => doSubscribe("basic"));
btnPro.addEventListener("click", () => doSubscribe("pro"));
btnVip.addEventListener("click", () => doSubscribe("vip"));

checkAuth();
