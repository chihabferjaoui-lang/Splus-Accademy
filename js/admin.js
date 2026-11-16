import {
  backendConfigured,
  getSignedInUser,
  getSupabaseClient,
  hasAdminRole
} from "./supabase-client.js";

const message = document.querySelector("[data-portal-message]");
const loading = document.querySelector("[data-loading]");
const dashboard = document.querySelector("[data-admin-dashboard]");
const slotForm = document.querySelector("[data-slot-form]");
const sessionForm = document.querySelector("[data-session-form]");
const progressForm = document.querySelector("[data-progress-form]");
const applicationStatuses = ["new", "reviewing", "accepted", "declined"];
let activePanel = "booking_requests";
let supabase;
let progressMemberships = [];
let progressSessions = [];

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

function addCell(row, value) {
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
    values.forEach((value) => addCell(row, value));
    body.append(row);
  });
}

function makeStatusSelect(table, id, status, label) {
  const select = document.createElement("select");
  select.setAttribute("aria-label", `Status for ${label}`);
  select.dataset.statusTable = table;
  select.dataset.recordId = id;
  applicationStatuses.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    option.selected = value === status;
    select.append(option);
  });
  return select;
}

async function loadStats() {
  const { data, error } = await supabase.rpc("admin_activity_summary");
  if (error) throw error;
  const summary = data?.[0];
  if (!summary) throw new Error("The activity summary was not returned.");
  const stats = {
    students: summary.student_accounts,
    bookings: summary.booking_requests,
    memberships: summary.active_enrollments,
    upcoming_lessons: summary.upcoming_lessons,
    student_applications: summary.student_applications,
    teacher_applications: summary.teacher_applications,
    paid_revenue: `${Number(summary.paid_revenue_mad).toLocaleString()} MAD`,
    newsletter_subscribers: summary.active_newsletter_subscribers
  };
  Object.entries(stats).forEach(([name, value]) => {
    document.querySelector(`[data-stat="${name}"]`).textContent = String(value);
  });
}

async function loadStudentApplications() {
  const body = document.querySelector('[data-table-body="student_applications"]');
  const { data, error } = await supabase.from("student_applications")
    .select("id,full_name,email,phone,program_id,current_level,preferred_schedule,learning_goals,status,created_at,programs(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  fillTable(body, data.map((item) => [
    item.full_name,
    item.email,
    item.phone,
    item.programs?.name || item.program_id,
    item.current_level,
    [item.preferred_schedule, item.learning_goals].filter(Boolean).join(" | "),
    makeStatusSelect("student_applications", item.id, item.status, item.full_name),
    formatDate(item.created_at)
  ]), 8, "No student applications yet.");
}

async function loadTeacherApplications() {
  const body = document.querySelector('[data-table-body="teacher_applications"]');
  const { data, error } = await supabase.from("teacher_applications")
    .select("id,full_name,email,phone,country,experience,certification,specialization,availability,why_join,status,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  fillTable(body, data.map((item) => [
    item.full_name,
    item.email,
    item.phone,
    item.country,
    [item.experience, item.certification].filter(Boolean).join(" | "),
    item.specialization,
    [item.availability, item.why_join].filter(Boolean).join(" | "),
    makeStatusSelect("teacher_applications", item.id, item.status, item.full_name),
    formatDate(item.created_at)
  ]), 9, "No teacher applications yet.");
}

async function loadStudents() {
  const body = document.querySelector('[data-table-body="profiles"]');
  const [profilesResult, rolesResult] = await Promise.all([
    supabase.from("profiles")
      .select("id,full_name,email,phone,created_at")
      .order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id")
  ]);
  if (profilesResult.error) throw profilesResult.error;
  if (rolesResult.error) throw rolesResult.error;
  const adminIds = new Set(rolesResult.data.map((role) => role.user_id));
  const students = profilesResult.data.filter((profile) => !adminIds.has(profile.id));
  fillTable(body, students.map((item) => [
    item.full_name,
    item.email,
    item.phone,
    formatDate(item.created_at)
  ]), 4, "No student accounts yet.");
}

async function loadClassSlots() {
  const programSelect = slotForm.elements.programId;
  const [programResult, slotsResult] = await Promise.all([
    supabase.from("programs").select("id,name,active").order("name"),
    supabase.from("class_slots")
      .select("id,program_id,starts_at,ends_at,capacity,active")
      .order("starts_at", { ascending: false })
  ]);
  if (programResult.error) throw programResult.error;
  if (slotsResult.error) throw slotsResult.error;

  programSelect.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a program";
  programSelect.append(placeholder);
  programResult.data.forEach((program) => {
    const option = document.createElement("option");
    option.value = program.id;
    option.textContent = `${program.name}${program.active ? "" : " (inactive)"}`;
    option.disabled = !program.active;
    programSelect.append(option);
  });
  slotForm.querySelector('button[type="submit"]').disabled = programResult.data.length === 0;

  const programNames = new Map(programResult.data.map((program) => [program.id, program.name]));
  const rows = slotsResult.data.map((slot) => {
    const activeSelect = document.createElement("select");
    activeSelect.setAttribute("aria-label", `Availability for slot starting ${formatDate(slot.starts_at)}`);
    activeSelect.dataset.slotId = slot.id;
    [["true", "Active"], ["false", "Inactive"]].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      option.selected = String(slot.active) === value;
      activeSelect.append(option);
    });
    return [
      programNames.get(slot.program_id) || slot.program_id,
      formatDate(slot.starts_at),
      formatDate(slot.ends_at),
      slot.capacity,
      activeSelect
    ];
  });
  fillTable(document.querySelector('[data-table-body="class_slots"]'), rows, 5, "No class slots yet.");
}

function statusSelect(id, status) {
  const select = document.createElement("select");
  select.dataset.sessionId = id;
  select.setAttribute("aria-label", "Lesson status");
  ["scheduled", "completed", "cancelled"].forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    option.selected = value === status;
    select.append(option);
  });
  return select;
}

function optionPlaceholder(select, text) {
  select.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = text;
  select.append(placeholder);
}

async function loadLessonSessions() {
  const [slotsResult, sessionsResult] = await Promise.all([
    supabase.from("class_slots")
      .select("id,program_id,starts_at,ends_at,active,programs(name)")
      .order("starts_at", { ascending: true })
      .limit(500),
    supabase.from("class_sessions")
      .select("id,class_slot_id,title,description,starts_at,ends_at,meeting_url,status,class_slots(program_id,programs(name))")
      .order("starts_at", { ascending: false })
      .limit(500)
  ]);
  if (slotsResult.error) throw slotsResult.error;
  if (sessionsResult.error) throw sessionsResult.error;

  const slotSelect = sessionForm.elements.classSlotId;
  optionPlaceholder(slotSelect, slotsResult.data.length ? "Select a class slot" : "Create a class slot first");
  slotsResult.data.forEach((slot) => {
    const option = document.createElement("option");
    option.value = slot.id;
    const programName = slot.programs?.name || "Program";
    option.textContent = `${programName} · ${formatDate(slot.starts_at)}${slot.active ? "" : " · inactive"}`;
    slotSelect.append(option);
  });
  sessionForm.querySelector('button[type="submit"]').disabled = slotsResult.data.length === 0;

  progressSessions = sessionsResult.data;
  const programName = (session) => session.class_slots?.programs?.name || "Program";
  fillTable(
    document.querySelector('[data-table-body="class_sessions"]'),
    sessionsResult.data.map((session) => {
      let meetingLink = "—";
      if (session.meeting_url) {
        const url = new URL(session.meeting_url);
        if (url.protocol === "https:") {
          meetingLink = document.createElement("a");
          meetingLink.href = url.href;
          meetingLink.target = "_blank";
          meetingLink.rel = "noopener noreferrer";
          meetingLink.textContent = "Open link";
        }
      }
      return [
        session.title,
        programName(session),
        `${formatDate(session.starts_at)} – ${formatDate(session.ends_at)}`,
        meetingLink,
        statusSelect(session.id, session.status)
      ];
    }),
    5,
    "No lessons scheduled yet. Add a lesson after creating a class slot."
  );
}

function populateProgressSessionOptions() {
  const sessionSelect = progressForm.elements.sessionId;
  const membershipId = progressForm.elements.membershipId.value;
  const membership = progressMemberships.find((item) => item.id === membershipId);
  const sessions = membership
    ? progressSessions.filter((session) => session.class_slot_id === membership.class_slot_id)
    : [];
  optionPlaceholder(sessionSelect, sessions.length ? "Select a lesson" : "Select a student course first");
  sessions.forEach((session) => {
    const option = document.createElement("option");
    option.value = session.id;
    option.textContent = `${session.title} · ${formatDate(session.starts_at)}`;
    sessionSelect.append(option);
  });
  sessionSelect.disabled = sessions.length === 0;
}

async function loadLessonProgress() {
  const [membershipsResult, profilesResult, programsResult, sessionsResult, progressResult] = await Promise.all([
    supabase.from("memberships")
      .select("id,student_id,program_id,class_slot_id,status,ends_at")
      .order("ends_at", { ascending: false })
      .limit(1000),
    supabase.from("profiles").select("id,full_name,email"),
    supabase.from("programs").select("id,name"),
    supabase.from("class_sessions")
      .select("id,class_slot_id,title,starts_at,status")
      .order("starts_at", { ascending: false })
      .limit(1000),
    supabase.from("lesson_progress")
      .select("membership_id,class_session_id,attendance,score,teacher_notes,memberships(student_id,program_id),class_sessions(title,starts_at)")
      .order("updated_at", { ascending: false })
      .limit(1000)
  ]);
  for (const result of [membershipsResult, profilesResult, programsResult, sessionsResult, progressResult]) {
    if (result.error) throw result.error;
  }

  progressMemberships = membershipsResult.data;
  progressSessions = sessionsResult.data;
  const profileMap = new Map(profilesResult.data.map((profile) => [profile.id, profile]));
  const programMap = new Map(programsResult.data.map((program) => [program.id, program.name]));
  const membershipSelect = progressForm.elements.membershipId;
  optionPlaceholder(membershipSelect, progressMemberships.length ? "Select a student course" : "No student enrollments yet");
  progressMemberships.forEach((membership) => {
    const profile = profileMap.get(membership.student_id);
    const option = document.createElement("option");
    option.value = membership.id;
    option.textContent = `${profile?.full_name || profile?.email || "Student"} · ${programMap.get(membership.program_id) || "Course"} · ${membership.status}`;
    membershipSelect.append(option);
  });
  progressForm.querySelector('button[type="submit"]').disabled =
    progressMemberships.length === 0 || progressSessions.length === 0;
  populateProgressSessionOptions();

  fillTable(
    document.querySelector('[data-table-body="lesson_progress"]'),
    progressResult.data.map((record) => {
      const membership = record.memberships;
      const profile = profileMap.get(membership?.student_id);
      return [
        profile?.full_name || profile?.email || "Student",
        programMap.get(membership?.program_id) || "Course",
        `${record.class_sessions?.title || "Lesson"} · ${formatDate(record.class_sessions?.starts_at)}`,
        record.attendance.replaceAll("_", " "),
        record.score == null ? "—" : `${record.score}%`,
        record.teacher_notes
      ];
    }),
    6,
    "No progress has been recorded yet."
  );
}

async function loadOrders() {
  const body = document.querySelector('[data-table-body="orders"]');
  const [ordersResult, profilesResult, programsResult] = await Promise.all([
    supabase.from("orders")
      .select("student_id,program_id,class_slot_id,amount_mad,currency,status,provider,created_at,class_slots(starts_at,ends_at)")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("profiles").select("id,full_name,email"),
    supabase.from("programs").select("id,name")
  ]);
  if (ordersResult.error) throw ordersResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (programsResult.error) throw programsResult.error;

  const profiles = new Map(profilesResult.data.map((profile) => [
    profile.id,
    [profile.full_name, profile.email].filter(Boolean).join(" — ")
  ]));
  const programs = new Map(programsResult.data.map((program) => [program.id, program.name]));
  fillTable(body, ordersResult.data.map((order) => [
    profiles.get(order.student_id) || order.student_id,
    programs.get(order.program_id) || order.program_id,
    order.class_slots
      ? `${formatDate(order.class_slots.starts_at)} – ${formatDate(order.class_slots.ends_at)}`
      : "Slot unavailable",
    `${order.amount_mad} ${order.currency}`,
    order.status,
    formatDate(order.created_at)
  ]), 6, "No order records yet.");
}

async function loadBookingRequests() {
  const body = document.querySelector('[data-table-body="booking_requests"]');
  const { data, error } = await supabase.from("booking_requests")
    .select("id,reference,full_name,email,phone,requested_date,requested_time,requested_timezone,status,created_at,programs(name)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;

  fillTable(body, data.map((request) => [
    request.reference,
    request.full_name,
    request.email,
    request.phone,
    request.programs?.name || "Program unavailable",
    `${request.requested_date} · ${request.requested_time} (${request.requested_timezone})`,
    makeStatusSelect("booking_requests", request.id, request.status, request.full_name),
    formatDate(request.created_at)
  ]), 8, "No booking requests yet.");
}

async function loadNewsletterSubscribers() {
  const body = document.querySelector('[data-table-body="newsletter_subscribers"]');
  const { data, error } = await supabase.from("newsletter_subscribers")
    .select("email,consented_at,unsubscribed_at")
    .order("consented_at", { ascending: false });
  if (error) throw error;
  fillTable(body, data.map((item) => [
    item.email,
    formatDate(item.consented_at),
    item.unsubscribed_at ? formatDate(item.unsubscribed_at) : "Subscribed"
  ]), 3, "No newsletter subscribers yet.");
}

const panelLoaders = {
  student_applications: loadStudentApplications,
  teacher_applications: loadTeacherApplications,
  profiles: loadStudents,
  class_slots: loadClassSlots,
  orders: loadOrders,
  booking_requests: loadBookingRequests,
  class_sessions: loadLessonSessions,
  lesson_progress: loadLessonProgress,
  newsletter_subscribers: loadNewsletterSubscribers
};

async function showPanel(panelName) {
  activePanel = panelName;
  document.querySelectorAll("[data-admin-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.adminPanel !== panelName;
  });
  document.querySelectorAll("[data-admin-tab]").forEach((tab) => {
    tab.setAttribute("aria-selected", String(tab.dataset.adminTab === panelName));
  });
  showMessage("");
  try {
    await panelLoaders[panelName]();
  } catch (error) {
    showMessage(`Could not load ${panelName.replaceAll("_", " ")}: ${error.message}`, "error");
  }
}

document.querySelector(".portal-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-admin-tab]");
  if (tab) showPanel(tab.dataset.adminTab);
});

document.querySelector(".portal-tabs").addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  const tabs = [...document.querySelectorAll("[data-admin-tab]")];
  const currentIndex = tabs.indexOf(document.activeElement);
  if (currentIndex < 0) return;
  event.preventDefault();
  const offset = event.key === "ArrowRight" ? 1 : -1;
  const next = tabs[(currentIndex + offset + tabs.length) % tabs.length];
  next.focus();
  next.click();
});

dashboard.addEventListener("change", async (event) => {
  const select = event.target.closest("[data-status-table]");
  if (!select) return;
  select.disabled = true;
  try {
    const { error } = await supabase.from(select.dataset.statusTable)
      .update({ status: select.value, updated_at: new Date().toISOString() })
      .eq("id", select.dataset.recordId);
    if (error) throw error;
    showMessage("Record status updated.", "success");
  } catch (error) {
    showMessage(`Could not update record status: ${error.message}`, "error");
    await showPanel(activePanel);
  } finally {
    select.disabled = false;
  }
});

document.querySelector('[data-admin-panel="class_slots"]').addEventListener("change", async (event) => {
  const select = event.target.closest("[data-slot-id]");
  if (!select) return;
  select.disabled = true;
  try {
    const { error } = await supabase.from("class_slots")
      .update({ active: select.value === "true", updated_at: new Date().toISOString() })
      .eq("id", select.dataset.slotId);
    if (error) throw error;
    showMessage("Class slot availability updated.", "success");
  } catch (error) {
    showMessage(`Could not update class slot: ${error.message}`, "error");
    await showPanel("class_slots");
  } finally {
    select.disabled = false;
  }
});

progressForm.elements.membershipId.addEventListener("change", populateProgressSessionOptions);

document.querySelector('[data-admin-panel="class_sessions"]').addEventListener("change", async (event) => {
  const select = event.target.closest("[data-session-id]");
  if (!select) return;
  select.disabled = true;
  try {
    const { error } = await supabase.from("class_sessions")
      .update({ status: select.value, updated_at: new Date().toISOString() })
      .eq("id", select.dataset.sessionId);
    if (error) throw error;
    showMessage("Lesson status updated.", "success");
    await loadStats();
  } catch (error) {
    showMessage(`Could not update lesson status: ${error.message}`, "error");
    await showPanel("class_sessions");
  } finally {
    select.disabled = false;
  }
});

slotForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = slotForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const startsAt = new Date(slotForm.elements.startsAt.value);
    const endsAt = new Date(slotForm.elements.endsAt.value);
    const capacity = Number(slotForm.elements.capacity.value);
    if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()) || endsAt <= startsAt) {
      throw new Error("Choose a valid end time after the start time.");
    }
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 200) {
      throw new Error("Capacity must be between 1 and 200.");
    }

    const { error } = await supabase.from("class_slots").insert({
      program_id: slotForm.elements.programId.value,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      capacity,
      active: true
    });
    if (error) throw error;
    slotForm.reset();
    slotForm.elements.capacity.value = "10";
    showMessage("Class slot created.", "success");
    await loadClassSlots();
  } catch (error) {
    showMessage(`Could not create class slot: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

sessionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = sessionForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const startsAt = new Date(sessionForm.elements.startsAt.value);
    const endsAt = new Date(sessionForm.elements.endsAt.value);
    const meetingUrl = sessionForm.elements.meetingUrl.value.trim();
    if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()) || endsAt <= startsAt) {
      throw new Error("Choose a valid end time after the start time.");
    }
    if (meetingUrl && new URL(meetingUrl).protocol !== "https:") {
      throw new Error("The lesson meeting link must use HTTPS.");
    }

    const { error } = await supabase.from("class_sessions").insert({
      class_slot_id: sessionForm.elements.classSlotId.value,
      title: sessionForm.elements.title.value.trim(),
      description: sessionForm.elements.description.value.trim(),
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      meeting_url: meetingUrl || null,
      status: "scheduled"
    });
    if (error) throw error;
    sessionForm.reset();
    showMessage("Lesson scheduled.", "success");
    await loadLessonSessions();
    await loadStats();
  } catch (error) {
    showMessage(`Could not schedule lesson: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

progressForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = progressForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const scoreValue = progressForm.elements.score.value;
    const score = scoreValue === "" ? null : Number(scoreValue);
    if (score !== null && (!Number.isInteger(score) || score < 0 || score > 100)) {
      throw new Error("The score must be a whole number between 0 and 100.");
    }
    const { error } = await supabase.from("lesson_progress").upsert({
      membership_id: progressForm.elements.membershipId.value,
      class_session_id: progressForm.elements.sessionId.value,
      attendance: progressForm.elements.attendance.value,
      score,
      teacher_notes: progressForm.elements.teacherNotes.value.trim(),
      updated_at: new Date().toISOString()
    }, { onConflict: "membership_id,class_session_id" });
    if (error) throw error;
    progressForm.elements.attendance.value = "not_marked";
    progressForm.elements.score.value = "";
    progressForm.elements.teacherNotes.value = "";
    showMessage("Student progress saved.", "success");
    await loadLessonProgress();
  } catch (error) {
    showMessage(`Could not save student progress: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

document.querySelector("[data-sign-out]").addEventListener("click", async (event) => {
  event.currentTarget.disabled = true;
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.replace(new URL("admin-login.html", window.location.href).href);
  } catch (error) {
    showMessage(`Could not sign out: ${error.message}`, "error");
    event.currentTarget.disabled = false;
  }
});

async function startAdminWorkspace() {
  if (!backendConfigured) {
    loading.hidden = true;
    showMessage("The backend is not configured. Add the Supabase project URL and publishable key before using the admin workspace.", "error");
    return;
  }
  supabase = getSupabaseClient();
  const user = await getSignedInUser(supabase);
  if (!user) {
    window.location.replace(new URL("admin-login.html", window.location.href).href);
    return;
  }
  if (!(await hasAdminRole(supabase, user.id))) {
    await supabase.auth.signOut();
    window.location.replace(new URL("admin-login.html", window.location.href).href);
    return;
  }

  document.querySelector("[data-user-email]").textContent = user.email || "";
  loading.hidden = true;
  dashboard.hidden = false;
  const statsResult = await loadStats();
  await showPanel(activePanel);
  return statsResult;
}

try {
  await startAdminWorkspace();
} catch (error) {
  loading.hidden = true;
  showMessage(`Could not open the admin workspace: ${error.message}`, "error");
}
