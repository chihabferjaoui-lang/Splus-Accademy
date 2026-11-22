import {
  backendConfigured,
  getSignedInUser,
  getSupabaseClient
} from "./supabase-client.js";

const message = document.querySelector("[data-portal-message]");
const loading = document.querySelector("[data-loading]");
const dashboard = document.querySelector("[data-student-dashboard]");
const profileForm = document.querySelector("[data-profile-form]");
const learningStatus = document.querySelector("[data-learning-status]");
const localeSelect = profileForm.elements.locale;
let currentUser;
let studentModulesAvailable = false;

const LOCAL_NOTIFICATIONS_KEY = "splus_student_notifications_v1";

function readLocalNotifications() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalNotifications(notifications) {
  try {
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 100)));
  } catch (error) {
    console.warn("Could not save local notifications:", error);
  }
}

function localNotificationsForCurrentUser() {
  const email = (currentUser?.email || "").trim().toLowerCase();
  if (!email) return [];
  return readLocalNotifications()
    .filter((notification) => (notification.email || "").trim().toLowerCase() === email)
    .map(({ id, title, body, read_at, created_at }) => ({ id, title, body, read_at, created_at }));
}

function showMessage(text, kind = "info") {
  message.textContent = text;
  message.dataset.kind = kind;
}

function formatDate(value) {
  if (!value) return "—";
  const includesTime = value.includes("T");
  const date = new Date(includesTime ? value : `${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: includesTime ? "short" : undefined
  }).format(date);
}

function appendCell(row, value) {
  const cell = document.createElement("td");
  if (value instanceof Node) cell.append(value);
  else cell.textContent = value == null || value === "" ? "—" : String(value);
  row.append(cell);
}

function fillTable(body, rows, columnCount, emptyText) {
  body.replaceChildren();
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = columnCount;
    cell.textContent = emptyText;
    row.append(cell);
    body.append(row);
    return;
  }
  rows.forEach((values) => {
    const row = document.createElement("tr");
    values.forEach((value) => appendCell(row, value));
    body.append(row);
  });
}

function emptyPanel(container, text, kind = "empty") {
  container.replaceChildren();
  const paragraph = document.createElement("p");
  paragraph.className = kind === "error" ? "portal-message" : "portal-empty";
  if (kind === "error") paragraph.dataset.kind = "error";
  paragraph.textContent = text;
  container.append(paragraph);
}

function emptyTable(body, columnCount, text) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = columnCount;
  cell.textContent = text;
  row.append(cell);
  body.replaceChildren(row);
}

function safeMeetingUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function meetingLink(value, label = "Join lesson") {
  const safeUrl = safeMeetingUrl(value);
  if (!safeUrl) return "—";
  const link = document.createElement("a");
  link.href = safeUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = label;
  return link;
}

function renderSchedule(sessions) {
  const scheduleBody = document.querySelector("[data-schedule-body]");
  const now = Date.now();
  const upcoming = [...new Map(sessions
    .filter((session) => session.status === "scheduled" && new Date(session.starts_at).getTime() >= now)
    .map((session) => [session.id, session])).values()]
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
    .slice(0, 25);

  showNextLesson(upcoming[0]);
  fillTable(
    scheduleBody,
    upcoming.map((session) => [
      session.title,
      session.class_slots?.programs?.name || "Your course",
      `${formatDate(session.starts_at)} – ${formatDate(session.ends_at)}`,
      meetingLink(session.meeting_url)
    ]),
    4,
    "No upcoming lessons are scheduled."
  );
}

function statusBadge(status) {
  const badge = document.createElement("span");
  badge.className = "portal-status";
  badge.dataset.status = status;
  badge.textContent = status.replaceAll("_", " ");
  return badge;
}

function renderAssignments(container, assignments, kind) {
  container.replaceChildren();
  if (!assignments.length) {
    emptyPanel(container, `No ${kind} have been assigned yet.`);
    return;
  }

  assignments.forEach((assignment) => {
    const content = kind === "lessons" ? assignment.lessons : assignment.exercises;
    const article = document.createElement("article");
    article.className = "portal-work-card";

    const title = document.createElement("h4");
    title.textContent = content?.name || (kind === "lessons" ? "Lesson" : "Exercise");
    const status = statusBadge(assignment.status);
    const description = document.createElement("p");
    description.textContent = content?.description || "";
    article.append(title, status);
    if (description.textContent) article.append(description);

    const details = [];
    if (kind === "lessons" && content?.level) details.push(`Level ${content.level}`);
    if (kind === "lessons" && content?.estimated_duration_minutes) {
      details.push(`${content.estimated_duration_minutes} minutes`);
    }
    if (assignment.due_at) details.push(`Due ${formatDate(assignment.due_at)}`);
    if (details.length) {
      const meta = document.createElement("p");
      meta.className = "portal-note";
      meta.textContent = details.join(" · ");
      article.append(meta);
    }

    if (assignment.teacher_feedback) {
      const feedback = document.createElement("p");
      feedback.className = "portal-note";
      feedback.textContent = `Teacher feedback: ${assignment.teacher_feedback}`;
      article.append(feedback);
    }
    if (assignment.score !== null && assignment.score !== undefined) {
      const score = document.createElement("p");
      score.className = "portal-note";
      score.textContent = `Score: ${assignment.score}%`;
      article.append(score);
    }
    if (assignment.status !== "completed" && assignment.status !== "cancelled") {
      const actions = document.createElement("div");
      actions.className = "portal-actions";
      const completeButton = document.createElement("button");
      completeButton.type = "button";
      completeButton.className = "portal-button-secondary";
      completeButton.textContent = "Mark complete";
      completeButton.addEventListener("click", async () => {
        completeButton.disabled = true;
        try {
          const rpcName = kind === "lessons"
            ? "complete_assigned_lesson"
            : "complete_assigned_exercise";
          const { error } = await getSupabaseClient().rpc(rpcName, {
            _assignment_id: assignment.id
          });
          if (error) throw error;
          await loadAssignments();
        } catch (error) {
          showMessage(`Could not update this assignment: ${error.message}`, "error");
          completeButton.disabled = false;
        }
      });
      actions.append(completeButton);
      article.append(actions);
    }
    container.append(article);
  });
}

async function loadAssignments() {
  const supabase = getSupabaseClient();
  const [lessonResult, exerciseResult] = await Promise.all([
    supabase.from("assigned_lessons")
      .select("id,status,due_at,completed_at,score,teacher_feedback,lessons(name,description,level,estimated_duration_minutes)")
      .eq("student_id", currentUser.id)
      .neq("status", "cancelled")
      .order("due_at", { ascending: true, nullsFirst: false }),
    supabase.from("assigned_exercises")
      .select("id,status,due_at,completed_at,score,teacher_feedback,exercises(name,description)")
      .eq("student_id", currentUser.id)
      .neq("status", "cancelled")
      .order("due_at", { ascending: true, nullsFirst: false })
  ]);
  if (lessonResult.error) throw lessonResult.error;
  if (exerciseResult.error) throw exerciseResult.error;
  renderAssignments(document.querySelector("[data-assigned-lessons]"), lessonResult.data, "lessons");
  renderAssignments(document.querySelector("[data-assigned-exercises]"), exerciseResult.data, "exercises");
}

function renderNotifications(notifications) {
  const container = document.querySelector("[data-notifications]");
  container.replaceChildren();
  const unreadCount = notifications.filter((notification) => !notification.read_at).length;
  const countBadge = document.querySelector("[data-unread-count]");
  countBadge.textContent = String(unreadCount);
  countBadge.hidden = unreadCount === 0;
  if (!notifications.length) {
    emptyPanel(container, "You have no notifications.");
    return;
  }

  notifications.forEach((notification) => {
    const article = document.createElement("article");
    article.className = "portal-notification";
    article.dataset.read = String(Boolean(notification.read_at));
    const content = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = notification.title;
    const body = document.createElement("p");
    body.textContent = notification.body;
    const time = document.createElement("time");
    time.dateTime = notification.created_at;
    time.textContent = formatDate(notification.created_at);
    content.append(title, body, time);
    article.append(content);
    const actions = document.createElement("div");
    actions.className = "portal-notification-actions";
    if (!notification.read_at) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "portal-button-secondary";
      button.textContent = "Mark as read";
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          if (String(notification.id).startsWith("local-")) {
            const all = readLocalNotifications();
            const item = all.find((entry) => entry.id === notification.id);
            if (item) item.read_at = new Date().toISOString();
            writeLocalNotifications(all);
          } else {
            const { error } = await getSupabaseClient()
              .from("notifications")
              .update({ read_at: new Date().toISOString() })
              .eq("id", notification.id)
              .eq("recipient_id", currentUser.id);
            if (error) throw error;
          }
          await loadNotifications();
        } catch (error) {
          showMessage(`Could not update the notification: ${error.message}`, "error");
          button.disabled = false;
        }
      });
      actions.append(button);
    }
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "portal-button-danger";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete notification: ${notification.title}`);
    deleteButton.addEventListener("click", async () => {
      if (!window.confirm("Delete this notification? This action cannot be undone.")) return;
      deleteButton.disabled = true;
      try {
        if (String(notification.id).startsWith("local-")) {
          const remaining = readLocalNotifications().filter((entry) => entry.id !== notification.id);
          writeLocalNotifications(remaining);
        } else {
          const { data, error } = await getSupabaseClient()
            .from("notifications")
            .delete()
            .eq("id", notification.id)
            .eq("recipient_id", currentUser.id)
            .eq("channel", "in_app")
            .select("id");
          if (error) throw error;
          if (!data?.length) throw new Error("The notification could not be found or deleted.");
        }
        await loadNotifications();
      } catch (error) {
        showMessage(`Could not delete the notification: ${error.message}`, "error");
        deleteButton.disabled = false;
      }
    });
    actions.append(deleteButton);
    article.append(actions);
    container.append(article);
  });
}

async function loadNotifications() {
  const { data, error } = await getSupabaseClient()
    .from("notifications")
    .select("id,title,body,read_at,created_at")
    .eq("recipient_id", currentUser.id)
    .eq("channel", "in_app")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  const merged = [...(data || []), ...localNotificationsForCurrentUser()];
  merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  renderNotifications(merged.slice(0, 50));
}

function invoiceItemsDetails(items) {
  const details = document.createElement("details");
  details.className = "portal-invoice-details";
  const summary = document.createElement("summary");
  summary.textContent = `${items.length} line item${items.length === 1 ? "" : "s"}`;
  const list = document.createElement("ul");
  items.forEach((item) => {
    const entry = document.createElement("li");
    entry.textContent = `${item.description} — ${item.quantity} × ${item.unit_price_mad} MAD`;
    list.append(entry);
  });
  details.append(summary, list);
  return details;
}

async function loadInvoices() {
  const { data, error } = await getSupabaseClient()
    .from("invoices")
    .select("id,invoice_number,total_mad,currency,issue_date,due_date,status,invoice_items(description,quantity,unit_price_mad),payments(amount_mad,status)")
    .order("issue_date", { ascending: false });
  if (error) throw error;

  fillTable(
    document.querySelector("[data-invoices-body]"),
    data.map((invoice) => {
      const successfulPayments = (invoice.payments || [])
        .filter((payment) => payment.status === "succeeded");
      const amountPaid = successfulPayments.reduce((total, payment) => total + payment.amount_mad, 0);
      const number = document.createElement("div");
      number.append(document.createTextNode(invoice.invoice_number));
      if (invoice.invoice_items?.length) number.append(invoiceItemsDetails(invoice.invoice_items));
      return [
        number,
        formatDate(invoice.issue_date),
        formatDate(invoice.due_date),
        `${invoice.total_mad} ${invoice.currency}`,
        `${amountPaid} ${invoice.currency}`,
        statusBadge(invoice.status)
      ];
    }),
    6,
    "No invoices are available."
  );
}

async function loadNotificationLocale() {
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .select("preferred_locale")
    .eq("id", currentUser.id)
    .maybeSingle();
  if (error) throw error;
  localeSelect.value = data?.preferred_locale || "en";
  localeSelect.disabled = false;
}

async function loadStudentModules() {
  const supabase = getSupabaseClient();
  const readiness = await supabase.from("assigned_lessons").select("id").limit(0);
  if (readiness.error) {
    if (readiness.error.status === 404 || readiness.error.code === "PGRST205" || readiness.error.code === "42P01") {
      learningStatus.textContent = "Platform update pending";
      const pendingMessage = "These student tools will become available after the academy applies the platform database update.";
      emptyPanel(document.querySelector("[data-assigned-lessons]"), pendingMessage);
      emptyPanel(document.querySelector("[data-assigned-exercises]"), pendingMessage);
      emptyPanel(document.querySelector("[data-notifications]"), pendingMessage);
      emptyTable(document.querySelector("[data-invoices-body]"), 6, pendingMessage);
    } else {
      learningStatus.textContent = "Temporarily unavailable";
      const unavailableMessage = `Student tools could not be checked: ${readiness.error.message}`;
      emptyPanel(document.querySelector("[data-assigned-lessons]"), unavailableMessage, "error");
      emptyPanel(document.querySelector("[data-assigned-exercises]"), unavailableMessage, "error");
      emptyPanel(document.querySelector("[data-notifications]"), unavailableMessage, "error");
      emptyTable(document.querySelector("[data-invoices-body]"), 6, unavailableMessage);
    }
    localeSelect.disabled = true;
    return;
  }

  studentModulesAvailable = true;
  learningStatus.textContent = "";
  const results = await Promise.allSettled([
    loadAssignments(),
    loadNotifications(),
    loadInvoices(),
    loadNotificationLocale()
  ]);
  const loaders = ["learning assignments", "notifications", "invoices", "notification language"];
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      showMessage(`Could not load ${loaders[index]}: ${result.reason.message}`, "error");
      if (index === 0) {
        emptyPanel(document.querySelector("[data-assigned-lessons]"), "Assignments could not be loaded.", "error");
        emptyPanel(document.querySelector("[data-assigned-exercises]"), "Assignments could not be loaded.", "error");
      } else if (index === 1) {
        emptyPanel(document.querySelector("[data-notifications]"), "Notifications could not be loaded.", "error");
      } else if (index === 2) {
        emptyTable(document.querySelector("[data-invoices-body]"), 6, "Invoices could not be loaded.");
        showMessage(`Could not load invoices: ${result.reason.message}`, "error");
      } else {
        localeSelect.disabled = true;
      }
    }
  });
}

function showNextLesson(session) {
  const container = document.querySelector("[data-next-lesson]");
  container.replaceChildren();
  if (!session) {
    const note = document.createElement("p");
    note.className = "portal-note";
    note.textContent = "No lesson is scheduled yet. Contact the academy for help with your class schedule.";
    container.append(note);
    return;
  }

  const title = document.createElement("h3");
  title.textContent = session.title;
  const program = document.createElement("p");
  program.className = "portal-note";
  program.textContent = session.class_slots?.programs?.name || "Your course";
  const time = document.createElement("p");
  time.textContent = `${formatDate(session.starts_at)} – ${formatDate(session.ends_at)}`;
  container.append(title, program, time);

  const link = meetingLink(session.meeting_url, "Open lesson");
  if (link instanceof HTMLAnchorElement) {
    link.className = "portal-button";
    container.append(link);
  }
}

document.querySelector("[data-sign-out]").addEventListener("click", async (event) => {
  event.currentTarget.disabled = true;
  try {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;
    window.location.replace(new URL("student-login.html", window.location.href).href);
  } catch (error) {
    showMessage(`Could not sign out: ${error.message}`, "error");
    event.currentTarget.disabled = false;
  }
});

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = profileForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const formData = new FormData(profileForm);
    const profileUpdates = {
      full_name: String(formData.get("fullName")).trim(),
      phone: String(formData.get("phone")).trim() || null,
      updated_at: new Date().toISOString()
    };
    if (studentModulesAvailable && !localeSelect.disabled) {
      profileUpdates.preferred_locale = String(formData.get("locale"));
    }
    const { error } = await getSupabaseClient()
      .from("profiles")
      .update(profileUpdates)
      .eq("id", profileForm.dataset.userId);
    if (error) throw error;
    showMessage("Your profile was saved.", "success");
  } catch (error) {
    showMessage(`Could not save your profile: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

async function loadStudentAccount() {
  if (!backendConfigured) {
    loading.hidden = true;
    showMessage("Student accounts are not configured yet. Please contact S+ Academy.", "error");
    return;
  }

  const supabase = getSupabaseClient();
  const user = await getSignedInUser(supabase);
  if (!user) {
    window.location.replace(new URL("student-login.html", window.location.href).href);
    return;
  }

  currentUser = user;
  document.querySelector("[data-user-email]").textContent = user.email || "";
  profileForm.dataset.userId = user.id;

  const [profileResult, membershipResult, orderResult] = await Promise.all([
    supabase.from("profiles").select("full_name,email,phone").eq("id", user.id).maybeSingle(),
    supabase.from("memberships")
      .select("id,program_id,class_slot_id,status,starts_at,ends_at,programs(name)")
      .eq("student_id", user.id)
      .order("starts_at", { ascending: false }),
    supabase.from("orders")
      .select("amount_mad,currency,status,created_at,paid_at,programs(name)")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
  ]);
  if (profileResult.error) throw profileResult.error;
  if (membershipResult.error) throw membershipResult.error;
  if (orderResult.error) throw orderResult.error;

  const membershipIds = membershipResult.data.map((item) => item.id);
  const activeMemberships = membershipResult.data.filter((item) =>
    item.status === "active" && new Date(item.ends_at).getTime() > Date.now()
  );
  const activeSlotIds = [...new Set(activeMemberships.map((item) => item.class_slot_id))];
  const [sessionResult, progressResult] = await Promise.all([
    activeSlotIds.length
      ? supabase.from("class_sessions")
        .select("id,title,description,starts_at,ends_at,meeting_url,status,class_slots(program_id,programs(name))")
        .in("class_slot_id", activeSlotIds)
        .eq("status", "scheduled")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(25)
      : Promise.resolve({ data: [], error: null }),
    membershipIds.length
      ? supabase.from("lesson_progress")
        .select("attendance,score,teacher_notes,created_at,class_sessions(title,starts_at)")
        .in("membership_id", membershipIds)
        .order("created_at", { ascending: false })
        .limit(200)
      : Promise.resolve({ data: [], error: null })
  ]);
  if (sessionResult.error) throw sessionResult.error;
  if (progressResult.error) throw progressResult.error;

  await loadStudentModules();
  let sessions = sessionResult.data;
  if (studentModulesAvailable) {
    try {
      const participantResult = await supabase.from("class_session_students")
        .select("class_session_id")
        .eq("student_id", user.id);
      if (participantResult.error) throw participantResult.error;
      const participantSessionIds = participantResult.data.map((item) => item.class_session_id);
      if (participantSessionIds.length) {
        const scheduledResult = await supabase.from("class_sessions")
          .select("id,title,starts_at,ends_at,meeting_url,status,class_slots(program_id,programs(name))")
          .in("id", participantSessionIds)
          .eq("status", "scheduled")
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
          .limit(25);
        if (scheduledResult.error) throw scheduledResult.error;
        sessions = [...sessions, ...scheduledResult.data];
      }
    } catch (error) {
      showMessage(`Could not load your scheduled lessons: ${error.message}`, "error");
    }
  }

  const profile = profileResult.data;
  profileForm.elements.fullName.value = profile?.full_name || "";
  profileForm.elements.email.value = profile?.email || user.email || "";
  profileForm.elements.phone.value = profile?.phone || "";

  renderSchedule(sessions);
  const markedProgress = progressResult.data.filter((item) => item.attendance !== "not_marked");
  const attendedCount = markedProgress.filter((item) => item.attendance === "attended").length;
  const scoredLessons = progressResult.data.filter((item) => Number.isFinite(item.score));
  const scoreAverage = scoredLessons.length
    ? Math.round(scoredLessons.reduce((total, item) => total + item.score, 0) / scoredLessons.length)
    : null;
  document.querySelector('[data-progress-stat="attended"]').textContent = String(attendedCount);
  document.querySelector('[data-progress-stat="marked"]').textContent = String(markedProgress.length);
  document.querySelector('[data-progress-stat="average"]').textContent = scoreAverage === null ? "—" : `${scoreAverage}%`;
  fillTable(
    document.querySelector("[data-progress-body]"),
    progressResult.data.map((item) => [
      item.class_sessions?.title || "Lesson",
      formatDate(item.class_sessions?.starts_at),
      item.attendance.replaceAll("_", " "),
      item.score == null ? "—" : `${item.score}%`,
      item.teacher_notes
    ]),
    5,
    "Your teacher’s attendance, scores, and feedback will appear here."
  );

  const contactText = activeMemberships[0]?.programs?.name || "my S+ Academy course";
  document.querySelector("[data-teacher-contact]").href =
    `https://wa.me/212718613036?text=${encodeURIComponent(`Hello, I am a student in ${contactText} and would like to contact my teacher.`)}`;

  fillTable(
    document.querySelector("[data-memberships-body]"),
    membershipResult.data.map((item) => [
      item.programs?.name || "Course",
      item.status,
      `${formatDate(item.starts_at)} – ${formatDate(item.ends_at)}`
    ]),
    3,
    "No course access has been recorded yet."
  );
  fillTable(
    document.querySelector("[data-orders-body]"),
    orderResult.data.map((item) => [
      item.programs?.name || "Course",
      `${item.amount_mad} ${item.currency}`,
      item.status,
      formatDate(item.paid_at || item.created_at)
    ]),
    4,
    "No enrollment or payment records are available."
  );

  document.querySelector("[data-refresh-notifications]").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await loadNotifications();
    } catch (error) {
      showMessage(`Could not refresh notifications: ${error.message}`, "error");
    } finally {
      button.disabled = false;
    }
  });

  loading.hidden = true;
  dashboard.hidden = false;
}

try {
  await loadStudentAccount();
} catch (error) {
  loading.hidden = true;
  showMessage(`Could not load your account: ${error.message}`, "error");
}
