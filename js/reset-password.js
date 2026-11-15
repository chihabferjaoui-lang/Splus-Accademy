import {
  backendConfigured,
  getSupabaseClient
} from "./supabase-client.js";

const message = document.querySelector("[data-reset-message]");
const form = document.querySelector("[data-new-password-form]");
const loginLink = document.querySelector("[data-login-link]");
const loginRole = new URLSearchParams(window.location.search).get("role") === "admin"
  ? "admin"
  : "student";
loginLink.href = loginRole === "admin" ? "admin-login.html" : "student-login.html";

function showMessage(text, kind = "info") {
  message.textContent = text;
  message.dataset.kind = kind;
}

if (!backendConfigured) {
  showMessage("Password recovery is not available until the academy configures its secure account service.", "error");
  loginLink.hidden = false;
} else {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) {
      showMessage("This password reset link is invalid or expired. Request a new link from the sign-in page.", "error");
      loginLink.hidden = false;
    } else {
      form.hidden = false;
      showMessage("Choose a new password for your account.");
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const password = form.elements.password.value;
      const confirmPassword = form.elements.confirmPassword.value;
      if (password.length < 8) {
        showMessage("Use a password with at least 8 characters.", "error");
        return;
      }
      if (password !== confirmPassword) {
        showMessage("The passwords do not match.", "error");
        form.elements.confirmPassword.focus();
        return;
      }

      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      try {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;

        showMessage("Your password has been updated. Sign in with your new password.", "success");
        form.hidden = true;
        loginLink.hidden = false;
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          showMessage(`Your password was updated, but we could not sign you out: ${signOutError.message}`, "error");
        }
      } catch (updateError) {
        showMessage(`Could not update your password: ${updateError.message}`, "error");
        button.disabled = false;
      }
    });
  } catch (error) {
    showMessage(`Could not verify the password reset link: ${error.message}`, "error");
    loginLink.hidden = false;
  }
}
