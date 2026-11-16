function getConfig() {
  const config = window.SPLUS_SUPABASE_CONFIG || {};
  if (!config.url || !config.publishableKey) {
    throw new Error("Online submissions are not configured yet. Please contact S+ Academy.");
  }
  if (!config.turnstileSiteKey) {
    throw new Error("The security check is not configured yet. Please contact S+ Academy.");
  }
  return config;
}

async function loadTurnstile() {
  if (window.turnstile) return;
  if (!loadTurnstile.promise) {
    loadTurnstile.promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("The security check could not be loaded. Please try again."));
      document.head.append(script);
    });
  }
  await loadTurnstile.promise;
}

async function getCaptchaToken(container, siteKey) {
  await loadTurnstile();
  container.hidden = false;
  return new Promise((resolve, reject) => {
    const widgetId = window.turnstile.render(container, {
      sitekey: siteKey,
      callback: resolve,
      "error-callback": () => reject(new Error("The security check failed. Please try again.")),
      "expired-callback": () => reject(new Error("The security check expired. Please try again."))
    });
    container.dataset.widgetId = String(widgetId);
  });
}

export async function submitPublicRequest(functionName, payload, captchaContainer) {
  const config = getConfig();
  let widgetId;
  try {
    const captchaToken = await getCaptchaToken(captchaContainer, config.turnstileSiteKey);
    widgetId = captchaContainer.dataset.widgetId;
    const response = await fetch(`${config.url.replace(/\/$/, "")}/functions/v1/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": config.publishableKey
      },
      body: JSON.stringify({ ...payload, captchaToken })
    });
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error("The submission service returned an invalid response.");
    }
    if (!response.ok) {
      throw new Error(typeof result.error === "string" ? result.error : "Unable to submit right now.");
    }
    return result;
  } finally {
    widgetId ??= captchaContainer.dataset.widgetId;
    if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    captchaContainer.replaceChildren();
    captchaContainer.hidden = true;
    delete captchaContainer.dataset.widgetId;
  }
}
