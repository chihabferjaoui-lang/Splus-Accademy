import { submitPublicRequest } from "./public-submissions.js?v=newsletter-fallback-1";

const form = document.querySelector("[data-newsletter-form]");
const message = document.querySelector("[data-newsletter-message]");
const captcha = document.querySelector("[data-newsletter-captcha]");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  message.textContent = "Complete the security check to subscribe.";
  try {
    const formData = new FormData(form);
    await submitPublicRequest("subscribe-newsletter", {
      email: String(formData.get("email")).trim(),
      consent: formData.get("consent") === "on"
    }, captcha);
    form.reset();
    message.textContent = "You are subscribed to the S+ Academy newsletter.";
  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
