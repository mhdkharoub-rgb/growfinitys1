const out = document.getElementById("out");
const btn = document.getElementById("btn");

function setOut(t) { out.textContent = t; }

function isPiBrowser() {
  return typeof window.Pi !== "undefined" && typeof window.Pi.authenticate === "function";
}

function onIncompletePaymentFound(payment) {
  // stub
}

if (!isPiBrowser()) {
  setOut("Please open this app in Pi Browser. Pi login will not work in Chrome.");
  btn.disabled = true;
}

btn.addEventListener("click", async () => {
  setOut("Starting Pi authenticate…");

  try {
    const scopes = ["username"];
    const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);

    const accessToken = authResult?.accessToken;
    if (!accessToken) throw new Error("No accessToken returned by Pi");

    setOut("Calling POST /api/auth-pi …");

    const r = await fetch("/api/auth-pi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken })
    });

    const text = await r.text();
    setOut(`POST /api/auth-pi\nHTTP: ${r.status}\n\n${text}`);
  } catch (e) {
    setOut("Login failed: " + (e?.message || String(e)));
  }
});