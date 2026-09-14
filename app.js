// Ruuvi Cloud API token creator.
// Flow (see https://github.com/ruuvi/ruuvi.cloudapi.yaml):
//   1. POST /register with {"email": ...}. Ruuvi Cloud emails a verification code.
//   2. GET /verify?token=CODE. The response contains data.accessToken.
// The page does not store the email, the code or the token.
"use strict";

const API_BASE = "https://network.ruuvi.com";

const $ = (id) => document.getElementById(id);

const els = {
  formRegister: $("form-register"),
  formVerify: $("form-verify"),
  email: $("email"),
  code: $("code"),
  sentTo: $("sent-to"),
  stepVerify: $("step-verify"),
  stepToken: $("step-token"),
  token: $("token"),
  tokenInline: $("token-inline"),
  tokenEmail: $("token-email"),
  copy: $("copy"),
  restart: $("restart"),
  status: $("status"),
};

// Error messages for the error codes in the Ruuvi Cloud API spec.
const ERROR_TEXT = {
  ER_THROTTLED: "Too many requests. Wait some time and try again.",
  ER_INVALID_EMAIL_ADDRESS: "The email address is not valid.",
  ER_TOKEN_EXPIRED: "The code is used or expired. Request a new code.",
};

function setStatus(text, kind = "") {
  els.status.textContent = text;
  els.status.className = kind;
}

function setBusy(form, busy) {
  for (const el of form.elements) el.disabled = busy;
}

// Calls the API and returns the "data" object of a successful response.
// Throws an Error with a readable message on failure.
async function callApi(path, options) {
  let response;
  try {
    response = await fetch(API_BASE + path, {
      ...options,
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
    });
  } catch {
    throw new Error("Network error. Check your connection and try again.");
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // The body is not JSON. The status code is used below.
  }

  if (response.ok && body && body.result === "success") {
    return body.data;
  }

  const code = body && (body.sub_code || body.code);
  const message =
    (code && ERROR_TEXT[code]) ||
    (body && ERROR_TEXT[body.code]) ||
    (body && body.error) ||
    `Request failed (HTTP ${response.status}).`;
  throw new Error(message);
}

els.formRegister.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = els.email.value.trim();
  if (!els.email.checkValidity() || email === "") {
    setStatus("Enter a valid email address.", "error");
    els.email.focus();
    return;
  }

  setBusy(els.formRegister, true);
  setStatus("Sending the request…");
  try {
    await callApi("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    els.sentTo.textContent = email;
    els.stepVerify.hidden = false;
    setStatus("Code sent. Look for the email from Ruuvi.", "ok");
    els.code.focus();
  } catch (err) {
    setStatus(err.message, "error");
  } finally {
    setBusy(els.formRegister, false);
  }
});

els.formVerify.addEventListener("submit", async (event) => {
  event.preventDefault();
  const code = els.code.value.trim();
  if (code === "") {
    setStatus("Enter the verification code from the email.", "error");
    els.code.focus();
    return;
  }

  setBusy(els.formVerify, true);
  setStatus("Verifying the code…");
  try {
    const data = await callApi("/verify?token=" + encodeURIComponent(code), {
      method: "GET",
    });
    if (!data || typeof data.accessToken !== "string") {
      throw new Error("The response did not contain an access token.");
    }
    showToken(data.accessToken, data.email || els.sentTo.textContent);
    setStatus("");
  } catch (err) {
    setStatus(err.message, "error");
  } finally {
    setBusy(els.formVerify, false);
  }
});

function showToken(token, email) {
  els.token.value = token;
  els.tokenInline.textContent = token;
  els.tokenEmail.textContent = email;
  els.code.value = "";
  els.formRegister.closest("section").hidden = true;
  els.stepVerify.hidden = true;
  els.stepToken.hidden = false;
  els.token.focus();
  els.token.select();
}

els.copy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.token.value);
    setStatus("Token copied to the clipboard.", "ok");
  } catch {
    els.token.focus();
    els.token.select();
    setStatus("Copy failed. The token is selected. Copy it manually.", "error");
  }
});

els.restart.addEventListener("click", () => {
  els.stepVerify.hidden = true;
  els.code.value = "";
  setStatus("");
  els.email.focus();
});
