import {
  backendConfigured,
  getSignedInUser,
  getSupabaseClient,
  hasAdminRole,
  turnstileConfigured
} from "./supabase-client.js";

const pageRole = document.body.dataset.loginRole;
const message = document.querySelector("[data-auth-message]");
const loginForm = document.querySelector("[data-login-form]");
const resetForm = document.querySelector("[data-reset-form]");
const signupForm = document.querySelector("[data-signup-form]");
let resetCaptchaToken = "";
let resetCaptchaWidgetId = null;
let captchaScriptPromise;

function showMessage(text, kind = "info") {
  message.textContent = text;
  message.dataset.kind = kind;
}

function setFormBusy(form, busy) {
  form.querySelectorAll("button, input").forEach((control) => {
    control.disabled = busy;
  });
}

function studentRedirect() {
  window.location.replace(new URL("student.html", window.location.href).href);
}

function adminRedirect() {
  window.location.replace(new URL("admin.html", window.location.href).href);
}

async function ensureTurnstile() {
  if (window.turnstile) return;
  if (!captchaScriptPromise) {
    captchaScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("The security check could not be loaded. Please try again later."));
      document.head.append(script);
    });
  }
  await captchaScriptPromise;
}

async function renderResetCaptcha() {
  if (!resetForm || resetCaptchaWidgetId !== null || !turnstileConfigured) return;
  try {
    await ensureTurnstile();
    resetCaptchaWidgetId = window.turnstile.render(resetForm.querySelector("[data-reset-captcha]"), {
      sitekey: window.SPLUS_SUPABASE_CONFIG.turnstileSiteKey,
      callback: (token) => {
        resetCaptchaToken = token;
        resetForm.querySelector('button[type="submit"]').disabled = false;
      },
      "expired-callback": () => {
        resetCaptchaToken = "";
        resetForm.querySelector('button[type="submit"]').disabled = true;
      },
      "error-callback": () => {
        resetCaptchaToken = "";
        showMessage("The security check failed to load. Please try again later.", "error");
      }
    });
    resetForm.querySelector('button[type="submit"]').disabled = true;
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function routeSignedInUser(supabase, user) {
  if (!user) return false;
  let isAdmin;
  try {
    isAdmin = await hasAdminRole(supabase, user.id);
  } catch (error) {
    await supabase.auth.signOut();
    throw error;
  }

  if (isAdmin) {
    adminRedirect();
    return true;
  }

  if (pageRole === "admin") {
    await supabase.auth.signOut();
    showMessage("This account is not authorized for the administrator workspace.", "error");
    return true;
  }

  studentRedirect();
  return true;
}

if (!backendConfigured) {
  showMessage("Sign-in is temporarily unavailable while the academy configures its secure account service.", "info");
  loginForm.querySelector('button[type="submit"]').disabled = true;
  if (resetForm) resetForm.querySelector('button[type="submit"]').disabled = true;
}

if (resetForm && backendConfigured) {
  resetForm.querySelector('button[type="submit"]').disabled = turnstileConfigured;
}

document.querySelector("[data-show-reset]")?.addEventListener("click", async () => {
  resetForm.elements.email.value = loginForm.elements.email.value.trim();
  loginForm.hidden = true;
  resetForm.hidden = false;
  showMessage(backendConfigured
    ? ""
    : "Password recovery is unavailable until the academy configures its secure account service.");
  if (backendConfigured && turnstileConfigured) await renderResetCaptcha();
});

document.querySelector("[data-cancel-reset]")?.addEventListener("click", () => {
  resetForm.reset();
  resetForm.hidden = true;
  loginForm.hidden = false;
  resetCaptchaToken = "";
  if (resetCaptchaWidgetId !== null) window.turnstile.reset(resetCaptchaWidgetId);
  resetForm.querySelector('button[type="submit"]').disabled = !backendConfigured || turnstileConfigured;
  showMessage("");
});

if (backendConfigured) {
  loginForm.querySelector('button[type="submit"]').disabled = false;
  showMessage("");
  try {
    const supabase = getSupabaseClient();
    const user = await getSignedInUser(supabase);
    await routeSignedInUser(supabase, user);
  } catch (error) {
    showMessage(`Could not check your account: ${error.message}`, "error");
  }
}

resetForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (turnstileConfigured && !resetCaptchaToken) {
    showMessage("Complete the security check before requesting a password reset.", "error");
    return;
  }

  const formData = new FormData(resetForm);
  setFormBusy(resetForm, true);
  try {
    const supabase = getSupabaseClient();
    const redirectUrl = new URL("reset-password.html", window.location.href);
    redirectUrl.searchParams.set("role", pageRole);
    const options = { redirectTo: redirectUrl.href };
    if (resetCaptchaToken) options.captchaToken = resetCaptchaToken;
    const { error } = await supabase.auth.resetPasswordForEmail(
      String(formData.get("email")).trim(),
      options
    );
    if (error) throw error;

    showMessage("If an account exists for that email, a secure password reset link will be sent there.", "success");
    resetForm.elements.email.value = String(formData.get("email")).trim();
  } catch (error) {
    showMessage(`Could not send a password reset email: ${error.message}`, "error");
  } finally {
    resetCaptchaToken = "";
    if (resetCaptchaWidgetId !== null) window.turnstile.reset(resetCaptchaWidgetId);
    setFormBusy(resetForm, false);
    resetForm.querySelector('button[type="submit"]').disabled = turnstileConfigured;
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  setFormBusy(loginForm, true);
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.get("email"),
      password: formData.get("password")
    });
    if (error) throw error;

    let isAdmin;
    try {
      isAdmin = await hasAdminRole(supabase, data.user.id);
    } catch (roleError) {
      await supabase.auth.signOut();
      throw roleError;
    }

    if (pageRole === "admin" && !isAdmin) {
      await supabase.auth.signOut();
      throw new Error("This account is not authorized for the administrator workspace.");
    }

    if (isAdmin) {
      adminRedirect();
      return;
    }

    studentRedirect();
  } catch (error) {
    showMessage(error.message, "error");
    setFormBusy(loginForm, false);
  }
});

signupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(signupForm);
  setFormBusy(signupForm, true);
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: String(formData.get("email")).trim(),
      password: String(formData.get("password")),
      options: {
        data: { full_name: String(formData.get("fullName")).trim() },
        emailRedirectTo: new URL("student.html", window.location.href).href
      }
    });
    if (error) throw error;

    if (data.session) {
      studentRedirect();
      return;
    }
    showMessage("Your account was created. Check your email to verify it, then sign in.", "success");
    signupForm.reset();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    setFormBusy(signupForm, false);
  }
});
