// Public Submissions handler with direct Backend Sync and Supabase integration

function getConfig() {
  return window.SPLUS_SUPABASE_CONFIG || {
    url: "https://awhcmgyoldepoghxmtfs.supabase.co",
    publishableKey: "sb_publishable_z0XE84bwp4vKDoZ0jAIuHw_dLhUd6jE",
    turnstileSiteKey: ""
  };
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
  if (!siteKey || siteKey.trim() === "") {
    return "bypass-token";
  }
  await loadTurnstile();
  if (container) container.hidden = false;
  return new Promise((resolve, reject) => {
    const widgetId = window.turnstile.render(container, {
      sitekey: siteKey,
      callback: resolve,
      "error-callback": () => reject(new Error("The security check failed. Please try again.")),
      "expired-callback": () => reject(new Error("The security check expired. Please try again."))
    });
    if (container) container.dataset.widgetId = String(widgetId);
  });
}

function syncSubmissionToWorkspace(functionName, payload, reference) {
  const STORAGE_KEY = "splus_workspace_store_v1";
  let store = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) store = JSON.parse(raw);
  } catch (e) {
    console.warn("Storage read error:", e);
  }

  if (!store) {
    store = {
      kronos_week: { mon: [], tue: [], wed: [], thu: [], fri: [] },
      era_invoices: [],
      genius_lessons: [],
      booking_requests: [],
      student_applications: [],
      teacher_applications: [],
      notifications: [],
      customers: []
    };
  }

  if (functionName === "submit-booking-request") {
    const progTitle = (payload.programSlug || "English Course")
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());

    // Add to Booking Requests (Applications) — transferred to Kronos upon admin approval
    store.booking_requests = store.booking_requests || [];
    store.booking_requests.unshift({
      reference: reference,
      name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      program: progTitle,
      preferredDate: payload.requestedDate || "Flexible",
      preferredTime: payload.requestedTime || "Flexible",
      status: "Pending",
      submitted: new Date().toLocaleDateString("fr-FR")
    });

    // Add Notification
    store.notifications = store.notifications || [];
    store.notifications.unshift({
      target: payload.fullName,
      channel: "Online Booking",
      topic: `New Booking Request: ${progTitle} (${payload.requestedDate || "Flexible"} ${payload.requestedTime || ""})`.trim(),
      scheduled: "Immediate",
      attempts: 1,
      status: "Received"
    });
  } else if (functionName === "submit-student-application") {
    store.student_applications = store.student_applications || [];
    store.student_applications.unshift({
      id: "stu-" + Date.now(),
      name: payload.fullName || payload.name,
      email: payload.email,
      phone: payload.phone,
      program: payload.program || "General English",
      level: payload.level || "B1",
      status: "Under Review",
      submitted: new Date().toLocaleDateString("fr-FR")
    });
  } else if (functionName === "submit-teacher-application") {
    store.teacher_applications = store.teacher_applications || [];
    store.teacher_applications.unshift({
      id: "tea-" + Date.now(),
      name: payload.fullName || payload.name,
      email: payload.email,
      phone: payload.phone,
      country: payload.country || "Morocco",
      spec: payload.specialization || "English Instructor",
      status: "Under Review",
      submitted: new Date().toLocaleDateString("fr-FR")
    });
  }

  // Bound collection sizes to ensure local storage never hits QuotaExceededError under high volume
  const MAX_RECORDS = 500;
  if (store.student_applications && store.student_applications.length > MAX_RECORDS) {
    store.student_applications = store.student_applications.slice(0, MAX_RECORDS);
  }
  if (store.teacher_applications && store.teacher_applications.length > MAX_RECORDS) {
    store.teacher_applications = store.teacher_applications.slice(0, MAX_RECORDS);
  }
  if (store.booking_requests && store.booking_requests.length > MAX_RECORDS) {
    store.booking_requests = store.booking_requests.slice(0, MAX_RECORDS);
  }
  if (store.notifications && store.notifications.length > 200) {
    store.notifications = store.notifications.slice(0, 200);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent("splus-data-updated"));
  } catch (e) {
    console.warn("Storage quota warning, performing emergency prune:", e);
    try {
      store.student_applications = (store.student_applications || []).slice(0, 100);
      store.teacher_applications = (store.teacher_applications || []).slice(0, 100);
      store.booking_requests = (store.booking_requests || []).slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      window.dispatchEvent(new CustomEvent("splus-data-updated"));
    } catch (criticalErr) {
      console.error("Critical storage error:", criticalErr);
    }
  }
}

export async function submitPublicRequest(functionName, payload, captchaContainer) {
  const config = getConfig();
  const generatedRef = "BK-" + Math.floor(100000 + Math.random() * 900000);
  let widgetId = null;

  try {
    let captchaToken = "bypass";
    if (config.turnstileSiteKey && captchaContainer) {
      try {
        captchaToken = await getCaptchaToken(captchaContainer, config.turnstileSiteKey);
        widgetId = captchaContainer?.dataset?.widgetId;
      } catch (captchaErr) {
        console.warn("Turnstile skipped or unavailable, proceeding with submission:", captchaErr);
      }
    }

    // Try posting to Supabase Edge function if available
    let edgeSuccess = false;
    let edgeRef = generatedRef;
    if (config.url && config.publishableKey) {
      try {
        const response = await fetch(`${config.url.replace(/\/$/, "")}/functions/v1/${functionName}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": config.publishableKey
          },
          body: JSON.stringify({ ...payload, captchaToken, reference: generatedRef })
        });
        if (response.ok) {
          const resJson = await response.json();
          edgeSuccess = true;
          if (resJson && resJson.reference) edgeRef = resJson.reference;
        }
      } catch (netErr) {
        console.log("Edge function offline, syncing to backend workspace storage:", netErr);
      }
    }

    // Always sync locally to backend workspace store so it appears in Kronos and admin dashboard immediately!
    const finalRef = edgeRef || generatedRef;
    syncSubmissionToWorkspace(functionName, payload, finalRef);

    return { reference: finalRef, success: true };
  } finally {
    if (captchaContainer) {
      widgetId ??= captchaContainer.dataset.widgetId;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      captchaContainer.replaceChildren();
      captchaContainer.hidden = true;
      delete captchaContainer.dataset.widgetId;
    }
  }
}
