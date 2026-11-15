import {
  backendConfigured,
  getSignedInUser,
  getSupabaseClient
} from "./supabase-client.js";

const message = document.querySelector("[data-portal-message]");
const loading = document.querySelector("[data-loading]");
const dashboard = document.querySelector("[data-student-dashboard]");
const profileForm = document.querySelector("[data-profile-form]");

function showMessage(text, kind = "info") {
  message.textContent = text;
  message.dataset.kind = kind;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: value.includes("T") ? "short" : undefined
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

  if (session.meeting_url) {
    const linkUrl = new URL(session.meeting_url);
    if (linkUrl.protocol === "https:") {
      const link = document.createElement("a");
      link.className = "portal-button";
      link.href = linkUrl.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open lesson";
      container.append(link);
    }
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
    const { error } = await getSupabaseClient()
      .from("profiles")
      .update({
        full_name: String(formData.get("fullName")).trim(),
        phone: String(formData.get("phone")).trim() || null,
        updated_at: new Date().toISOString()
      })
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
        .select("title,description,starts_at,ends_at,meeting_url,status,class_slots(program_id,programs(name))")
        .in("class_slot_id", activeSlotIds)
        .eq("status", "scheduled")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(1)
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

  const profile = profileResult.data;
  profileForm.elements.fullName.value = profile?.full_name || "";
  profileForm.elements.email.value = profile?.email || user.email || "";
  profileForm.elements.phone.value = profile?.phone || "";

  showNextLesson(sessionResult.data[0]);
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

  loading.hidden = true;
  dashboard.hidden = false;
}

try {
  await loadStudentAccount();
} catch (error) {
  loading.hidden = true;
  showMessage(`Could not load your account: ${error.message}`, "error");
}
