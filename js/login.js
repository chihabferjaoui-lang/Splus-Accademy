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
const signupForm = document.querySelector("[data-signup-form]");
const signupDetails = signupForm?.closest("details");
let captchaToken = "";
let captchaWidgetId = null;
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

async function renderSignupCaptcha() {
  if (!signupForm || captchaWidgetId !== null || !turnstileConfigured) return;
  try {
    await ensureTurnstile();
    captchaWidgetId = window.turnstile.render("#signup-captcha", {
      sitekey: window.SPLUS_SUPABASE_CONFIG.turnstileSiteKey,
      callback: (token) => {
        captchaToken = token;
        signupForm.querySelector('button[type="submit"]').disabled = false;
      },
      "expired-callback": () => {
        captchaToken = "";
        signupForm.querySelector('button[type="submit"]').disabled = true;
      },
      "error-callback": () => {
        captchaToken = "";
        showMessage("The security check failed to load. Please refresh the page and try again.", "error");
      }
    });
    signupForm.querySelector('button[type="submit"]').disabled = true;
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function routeSignedInUser(supabase, user) {
  if (!user) return false;
  if (pageRole === "admin") {
    try {
      if (await hasAdminRole(supabase, user.id)) {
        adminRedirect();
        return true;
      }
    } catch (error) {
      await supabase.auth.signOut();
      throw error;
    }
    await supabase.auth.signOut();
    showMessage("This account is not authorized for the administrator workspace.", "error");
    return true;
  }
  studentRedirect();
  return true;
}

if (!backendConfigured) {
  showMessage("Account access is not active yet. The academy must add its Supabase project URL and publishable key before sign-in can work.", "info");
  loginForm.querySelector('button[type="submit"]').disabled = true;
  signupForm?.querySelector('button[type="submit"]').setAttribute("disabled", "");
}

if (signupForm && (!backendConfigured || !turnstileConfigured)) {
  signupForm.querySelector('button[type="submit"]').disabled = true;
  const notice = document.createElement("p");
  notice.className = "portal-note";
  notice.textContent = "Student registration will be available after secure account and anti-bot settings are configured.";
  signupForm.prepend(notice);
}

if (signupDetails && turnstileConfigured && backendConfigured) {
  signupDetails.addEventListener("toggle", () => {
    if (signupDetails.open) renderSignupCaptcha();
  });
}

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

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  setFormBusy(loginForm, true);
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email")).trim(),
      password: String(formData.get("password"))
    });
    if (error) throw error;

    if (pageRole === "admin") {
      let isAdmin;
      try {
        isAdmin = await hasAdminRole(supabase, data.user.id);
      } catch (roleError) {
        await supabase.auth.signOut();
        throw roleError;
      }
      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error("This account is not authorized for the administrator workspace.");
      }
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
  if (!captchaToken) {
    showMessage("Complete the security check before creating an account.", "error");
    return;
  }

  const formData = new FormData(signupForm);
  setFormBusy(signupForm, true);
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: String(formData.get("email")).trim(),
      password: String(formData.get("password")),
      options: {
        captchaToken,
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
    captchaToken = "";
    if (captchaWidgetId !== null) window.turnstile.reset(captchaWidgetId);
  } catch (error) {
    showMessage(error.message, "error");
    captchaToken = "";
    if (captchaWidgetId !== null) window.turnstile.reset(captchaWidgetId);
  } finally {
    setFormBusy(signupForm, false);
    if (captchaWidgetId !== null) signupForm.querySelector('button[type="submit"]').disabled = true;
  }
});
