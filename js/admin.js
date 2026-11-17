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
const sessionStudentForm = document.querySelector("[data-session-student-form]");
const timesheetForm = document.querySelector("[data-timesheet-form]");
const progressForm = document.querySelector("[data-progress-form]");
const teacherLinkForm = document.querySelector("[data-teacher-link-form]");
const teacherAvailabilityForm = document.querySelector("[data-teacher-availability-form]");
const lessonForm = document.querySelector("[data-lesson-form]");
const exerciseForm = document.querySelector("[data-exercise-form]");
const assignmentForm = document.querySelector("[data-assignment-form]");
const studentGroupForm = document.querySelector("[data-student-group-form]");
const groupMemberForm = document.querySelector("[data-group-member-form]");
const adminAccessForm = document.querySelector("[data-admin-access-form]");
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
  const [programResult, slotsResult, teachersResult] = await Promise.all([
    supabase.from("programs").select("id,name,active").order("name"),
    supabase.from("class_slots")
      .select("id,program_id,starts_at,ends_at,capacity,active")
      .order("starts_at", { ascending: false }),
    supabase.from("user_roles")
      .select("user_id, profiles(full_name, email)")
      .eq("role", "teacher")
  ]);
  if (programResult.error) throw programResult.error;
  if (slotsResult.error) throw slotsResult.error;
  if (teachersResult.error) throw teachersResult.error;

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
  const [slotsResult, sessionsResult, teachersResult] = await Promise.all([
    supabase.from("class_slots")
      .select("id,program_id,starts_at,ends_at,active,programs(name)")
      .order("starts_at", { ascending: true })
      .limit(500),
    supabase.from("class_sessions")
      .select("id,class_slot_id,title,description,starts_at,ends_at,meeting_url,status,teacher_id,class_slots(program_id,programs(name)),teacher_profile:teacher_id(full_name,email)")
      .order("starts_at", { ascending: false })
      .limit(500),
    supabase.from("user_roles")
      .select("user_id, profiles(full_name, email)")
      .eq("role", "teacher")
  ]);
  if (slotsResult.error) throw slotsResult.error;
  if (sessionsResult.error) throw sessionsResult.error;
  if (teachersResult.error) throw teachersResult.error;

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
  const sessionsByTeacher = new Map();
  sessionsResult.data.forEach((session) => {
    if (!session.teacher_id) return;
    const list = sessionsByTeacher.get(session.teacher_id) || [];
    list.push(session);
    sessionsByTeacher.set(session.teacher_id, list);
  });

  populateTeacherSelect(sessionForm.elements.teacherId, teachersResult.data);
  populateTeacherSelect(sessionStudentForm.elements.teacherId, teachersResult.data);
  populateTeacherSelect(timesheetForm.elements.teacherId, teachersResult.data);

  const updateSessionSelect = (teacherId, select) => {
    select.replaceChildren();
    select.append(new Option(teacherId ? "Select a session" : "Select a teacher first", ""));
    if (!teacherId) return;
    (sessionsByTeacher.get(teacherId) || []).forEach((session) => {
      select.append(new Option(`${session.title || "Lesson"} · ${formatDate(session.starts_at)}`, session.id));
    });
  };
  sessionStudentForm.elements.teacherId.addEventListener("change", () => {
    updateSessionSelect(sessionStudentForm.elements.teacherId.value, sessionStudentForm.elements.sessionId);
  });
  timesheetForm.elements.teacherId.addEventListener("change", () => {
    updateSessionSelect(timesheetForm.elements.teacherId.value, timesheetForm.elements.sessionId);
  });
  updateSessionSelect(sessionStudentForm.elements.teacherId.value, sessionStudentForm.elements.sessionId);
  updateSessionSelect(timesheetForm.elements.teacherId.value, timesheetForm.elements.sessionId);

  const studentResults = await supabase.from("profiles").select("id,full_name,email").order("full_name", { ascending: true });
  if (studentResults.error) throw studentResults.error;
  const studentSelect = sessionStudentForm.elements.studentId;
  studentSelect.replaceChildren();
  studentSelect.append(new Option("Select a student", ""));
  studentResults.data.forEach((profile) => {
    studentSelect.append(new Option(`${profile.full_name || profile.email} (${profile.email})`, profile.id));
  });

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
        session.teacher_profile?.full_name || session.teacher_profile?.email || session.teacher_id || "Unassigned",
        programName(session),
        `${formatDate(session.starts_at)} – ${formatDate(session.ends_at)}`,
        meetingLink,
        statusSelect(session.id, session.status)
      ];
    }),
    6,
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

async function loadTeacherLinks() {
  const body = document.querySelector('[data-table-body="teacher_students"]');
  const [teachersResult, studentsResult, linksResult] = await Promise.all([
    supabase.from("user_roles")
      .select("user_id, profiles(full_name, email)")
      .eq("role", "teacher"),
    supabase.from("profiles")
      .select("id, full_name, email")
      .order("full_name", { ascending: true }),
    supabase.from("teacher_students")
      .select("teacher_id, student_id, status, started_at, ended_at, teacher_profile:teacher_id(full_name,email), student_profile:student_id(full_name,email)")
      .order("started_at", { ascending: false })
  ]);
  if (teachersResult.error) throw teachersResult.error;
  if (studentsResult.error) throw studentsResult.error;
  if (linksResult.error) throw linksResult.error;

  const teacherOptions = teachersResult.data;
  const studentOptions = studentsResult.data;
  const teacherSelect = teacherLinkForm.elements.teacherId;
  const studentSelect = teacherLinkForm.elements.studentId;
  teacherSelect.replaceChildren();
  teacherSelect.append(new Option("Select a teacher", ""));
  teacherOptions.forEach((row) => {
    const profile = row.profiles;
    if (!profile) return;
    teacherSelect.append(new Option(`${profile.full_name || profile.email} (${profile.email || "teacher"})`, row.user_id));
  });

  studentSelect.replaceChildren();
  studentSelect.append(new Option("Select a student", ""));
  studentOptions.forEach((profile) => {
    studentSelect.append(new Option(`${profile.full_name || profile.email} (${profile.email})`, profile.id));
  });

  fillTable(body, linksResult.data.map((link) => [
    link.teacher_profile?.full_name || link.teacher_profile?.email || link.teacher_id,
    link.student_profile?.full_name || link.student_profile?.email || link.student_id,
    link.status,
    formatDate(link.started_at),
    link.ended_at ? formatDate(link.ended_at) : "—"
  ]), 5, "No teacher and student links yet.");
}

async function loadTeacherAvailability() {
  const body = document.querySelector('[data-table-body="teacher_availability"]');
  const [teachersResult, availabilityResult] = await Promise.all([
    supabase.from("user_roles")
      .select("user_id, profiles(full_name, email)")
      .eq("role", "teacher"),
    supabase.from("teacher_availability")
      .select("id, teacher_id, weekday, starts_at, ends_at, timezone, effective_from, effective_until, teacher_profile:teacher_id(full_name,email)")
      .order("effective_from", { ascending: false })
      .limit(500)
  ]);
  if (teachersResult.error) throw teachersResult.error;
  if (availabilityResult.error) throw availabilityResult.error;

  const weekdayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const teacherSelect = teacherAvailabilityForm.elements.teacherId;
  teacherSelect.replaceChildren();
  teacherSelect.append(new Option("Select a teacher", ""));
  teachersResult.data.forEach((row) => {
    const profile = row.profiles;
    if (!profile) return;
    teacherSelect.append(new Option(`${profile.full_name || profile.email} (${profile.email || "teacher"})`, row.user_id));
  });

  fillTable(body, availabilityResult.data.map((slot) => [
    slot.teacher_profile?.full_name || slot.teacher_profile?.email || slot.teacher_id,
    weekdayNames[Number(slot.weekday)] || `Day ${slot.weekday}`,
    slot.starts_at,
    slot.ends_at,
    slot.timezone || "Africa/Casablanca",
    `${formatDate(slot.effective_from)}${slot.effective_until ? ` → ${formatDate(slot.effective_until)}` : " onward"}`
  ]), 6, "No teacher availability has been set yet.");
}

function populateTeacherSelect(select, data, label = "teacher") {
  select.replaceChildren();
  select.append(new Option(`Select a ${label}`, ""));
  data.forEach((row) => {
    const profile = row.profiles;
    if (!profile) return;
    select.append(new Option(`${profile.full_name || profile.email} (${profile.email || label})`, row.user_id));
  });
}

function populateSessionSelectForTeacher(select, sessions, teacherId) {
  select.replaceChildren();
  select.append(new Option(teacherId ? "Select a session" : "Select a teacher first", ""));
  sessions.forEach((session) => {
    const label = `${session.title || "Lesson"} · ${formatDate(session.starts_at)}`;
    select.append(new Option(label, session.id));
  });
}

async function loadLessonLibrary() {
  const [programsResult, lessonsResult, exercisesResult, teachersResult] = await Promise.all([
    supabase.from("programs").select("id,name").order("name"),
    supabase.from("lessons")
      .select("id,name,level,program_id,estimated_duration_minutes,status,programs(name),created_by")
      .order("created_at", { ascending: false }),
    supabase.from("exercises")
      .select("id,name,lesson_id,status,created_at,lessons(name)")
      .order("created_at", { ascending: false }),
    supabase.from("user_roles")
      .select("user_id, profiles(full_name, email)")
      .eq("role", "teacher")
  ]);
  if (programsResult.error) throw programsResult.error;
  if (lessonsResult.error) throw lessonsResult.error;
  if (exercisesResult.error) throw exercisesResult.error;
  if (teachersResult.error) throw teachersResult.error;

  const lessonSelect = lessonForm.elements.programId;
  lessonSelect.replaceChildren();
  lessonSelect.append(new Option("Select a program", ""));
  programsResult.data.forEach((program) => {
    const option = document.createElement("option");
    option.value = program.id;
    option.textContent = program.name;
    lessonSelect.append(option);
  });

  const lessonItems = lessonsResult.data;
  const lessonOptions = exerciseForm.elements.lessonId;
  const assignmentItemSelect = assignmentForm.elements.itemId;
  const assignmentTeacherSelect = assignmentForm.elements.teacherId;
  const assignmentStudentSelect = assignmentForm.elements.studentId;
  const assignmentGroupSelect = assignmentForm.elements.groupId;

  lessonOptions.replaceChildren();
  lessonOptions.append(new Option("Select a lesson", ""));
  lessonItems.forEach((lesson) => {
    lessonOptions.append(new Option(`${lesson.name} · ${lesson.level}`, lesson.id));
  });

  populateTeacherSelect(assignmentTeacherSelect, teachersResult.data);
  assignmentTeacherSelect.addEventListener("change", async () => {
    const teacherId = assignmentTeacherSelect.value;
    assignmentStudentSelect.replaceChildren();
    assignmentStudentSelect.append(new Option("Optional: direct student assignment", ""));
    assignmentGroupSelect.replaceChildren();
    assignmentGroupSelect.append(new Option("Optional: assign to a group", ""));
    if (!teacherId) return;

    const [studentsResult, groupsResult] = await Promise.all([
      supabase.from("teacher_students")
        .select("student_id, student_profile:student_id(full_name,email)")
        .eq("teacher_id", teacherId)
        .eq("status", "active"),
      supabase.from("student_groups")
        .select("id, name")
        .eq("teacher_id", teacherId)
        .order("name", { ascending: true })
    ]);
    if (studentsResult.error) throw studentsResult.error;
    if (groupsResult.error) throw groupsResult.error;

    studentsResult.data.forEach((link) => {
      const profile = link.student_profile;
      assignmentStudentSelect.append(new Option(`${profile?.full_name || profile?.email || link.student_id} (${profile?.email || link.student_id})`, link.student_id));
    });
    groupsResult.data.forEach((group) => {
      assignmentGroupSelect.append(new Option(group.name, group.id));
    });
  });

  const allLessons = document.querySelector('[data-table-body="lessons"]');
  fillTable(allLessons, lessonItems.map((lesson) => [
    lesson.name,
    lesson.level,
    lesson.programs?.name || lesson.program_id,
    `${lesson.estimated_duration_minutes} min`,
    lesson.status
  ]), 5, "No lessons have been created yet.");

  const allExercises = document.querySelector('[data-table-body="exercises"]');
  fillTable(allExercises, exercisesResult.data.map((exercise) => [
    exercise.lessons?.name || exercise.lesson_id,
    exercise.name,
    exercise.status,
    formatDate(exercise.created_at)
  ]), 4, "No exercises have been created yet.");

  const assignmentType = assignmentForm.elements.assignmentType.value;
  const assignmentOptions = assignmentType === "exercise"
    ? exercisesResult.data.map((exercise) => ({ id: exercise.id, label: `${exercise.lessons?.name || "Lesson"} · ${exercise.name}` }))
    : lessonItems.map((lesson) => ({ id: lesson.id, label: `${lesson.name} · ${lesson.level}` }));
  assignmentItemSelect.replaceChildren();
  assignmentItemSelect.append(new Option("Select an item", ""));
  assignmentOptions.forEach((option) => assignmentItemSelect.append(new Option(option.label, option.id)));
  assignmentForm.elements.assignmentType.onchange = () => {
    const nextType = assignmentForm.elements.assignmentType.value;
    const items = nextType === "exercise"
      ? exercisesResult.data.map((exercise) => ({ id: exercise.id, label: `${exercise.lessons?.name || "Lesson"} · ${exercise.name}` }))
      : lessonItems.map((lesson) => ({ id: lesson.id, label: `${lesson.name} · ${lesson.level}` }));
    assignmentItemSelect.replaceChildren();
    assignmentItemSelect.append(new Option("Select an item", ""));
    items.forEach((item) => assignmentItemSelect.append(new Option(item.label, item.id)));
  };

  const [lessonAssignmentsResult, exerciseAssignmentsResult] = await Promise.all([
    supabase.from("assigned_lessons")
      .select("teacher_id,student_id,lesson_id,status,due_at,teacher_profile:teacher_id(full_name,email),student_profile:student_id(full_name,email),lessons(name)")
      .order("assigned_at", { ascending: false })
      .limit(200),
    supabase.from("assigned_exercises")
      .select("teacher_id,student_id,exercise_id,status,due_at,teacher_profile:teacher_id(full_name,email),student_profile:student_id(full_name,email),exercises(name)")
      .order("assigned_at", { ascending: false })
      .limit(200)
  ]);
  if (lessonAssignmentsResult.error) throw lessonAssignmentsResult.error;
  if (exerciseAssignmentsResult.error) throw exerciseAssignmentsResult.error;

  const assignmentsBody = document.querySelector('[data-table-body="assignments"]');
  const assignmentRows = [
    ...lessonAssignmentsResult.data.map((assignment) => [
      assignment.teacher_profile?.full_name || assignment.teacher_profile?.email || assignment.teacher_id,
      assignment.student_profile?.full_name || assignment.student_profile?.email || assignment.student_id,
      "Lesson",
      assignment.lessons?.name || assignment.lesson_id,
      assignment.status,
      assignment.due_at ? formatDate(assignment.due_at) : "—"
    ]),
    ...exerciseAssignmentsResult.data.map((assignment) => [
      assignment.teacher_profile?.full_name || assignment.teacher_profile?.email || assignment.teacher_id,
      assignment.student_profile?.full_name || assignment.student_profile?.email || assignment.student_id,
      "Exercise",
      assignment.exercises?.name || assignment.exercise_id,
      assignment.status,
      assignment.due_at ? formatDate(assignment.due_at) : "—"
    ])
  ];
  fillTable(assignmentsBody, assignmentRows, 6, "No assignments have been created yet.");
}

async function loadStudentGroups() {
  const body = document.querySelector('[data-table-body="student_groups"]');
  const [teachersResult, studentsResult, groupsResult, membersResult] = await Promise.all([
    supabase.from("user_roles")
      .select("user_id, profiles(full_name, email)")
      .eq("role", "teacher"),
    supabase.from("profiles")
      .select("id, full_name, email")
      .order("full_name", { ascending: true }),
    supabase.from("student_groups")
      .select("id, name, teacher_id, created_at, teacher_profile:teacher_id(full_name,email)")
      .order("created_at", { ascending: false }),
    supabase.from("student_group_members")
      .select("group_id, student_id, student_profile:student_id(full_name,email)")
  ]);
  if (teachersResult.error) throw teachersResult.error;
  if (studentsResult.error) throw studentsResult.error;
  if (groupsResult.error) throw groupsResult.error;
  if (membersResult.error) throw membersResult.error;

  const teacherOptions = teachersResult.data;
  const studentOptions = studentsResult.data;
  const groupTeacherMap = new Map();
  teacherOptions.forEach((row) => {
    if (row.profiles) groupTeacherMap.set(row.user_id, row.profiles);
  });

  const groupMemberCounts = new Map();
  membersResult.data.forEach((member) => {
    groupMemberCounts.set(member.group_id, (groupMemberCounts.get(member.group_id) ?? 0) + 1);
  });

  const teacherSelects = [studentGroupForm.elements.teacherId, groupMemberForm.elements.teacherId];
  teacherSelects.forEach((select) => {
    select.replaceChildren();
    select.append(new Option("Select a teacher", ""));
    teacherOptions.forEach((row) => {
      const profile = row.profiles;
      if (!profile) return;
      select.append(new Option(`${profile.full_name || profile.email} (${profile.email || "teacher"})`, row.user_id));
    });
  });

  const studentSelect = groupMemberForm.elements.studentId;
  studentSelect.replaceChildren();
  studentSelect.append(new Option("Select a student", ""));
  studentOptions.forEach((profile) => {
    studentSelect.append(new Option(`${profile.full_name || profile.email} (${profile.email})`, profile.id));
  });

  const groupSelect = groupMemberForm.elements.groupId;
  groupSelect.replaceChildren();
  groupSelect.append(new Option("Select a group", ""));
  groupsResult.data.forEach((group) => {
    const label = `${group.name} — ${group.teacher_profile?.full_name || group.teacher_profile?.email || group.teacher_id}`;
    groupSelect.append(new Option(label, group.id));
  });

  fillTable(body, groupsResult.data.map((group) => [
    group.name,
    group.teacher_profile?.full_name || group.teacher_profile?.email || group.teacher_id,
    `${groupMemberCounts.get(group.id) ?? 0}`,
    formatDate(group.created_at)
  ]), 4, "No student groups yet.");
}

async function loadAdminAccounts() {
  const body = document.querySelector('[data-table-body="admin_accounts"]');
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id, role, profiles(full_name, email)")
    .eq("role", "admin")
    .order("user_id", { ascending: true });
  if (error) throw error;

  fillTable(body, data.map((item) => [
    item.profiles?.full_name || "Administrator",
    item.profiles?.email || item.user_id,
    item.role
  ]), 3, "No administrator accounts yet.");

  const select = adminAccessForm.elements.userId;
  if (data.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Select a current admin for email updates";
    select.replaceChildren(option);
    data.forEach((item) => {
      const optionNode = document.createElement("option");
      optionNode.value = item.user_id;
      optionNode.textContent = item.profiles?.email || item.user_id;
      select.append(optionNode);
    });
  } else {
    select.replaceChildren();
  }
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
  newsletter_subscribers: loadNewsletterSubscribers,
  teacher_students: loadTeacherLinks,
  teacher_availability: loadTeacherAvailability,
  lesson_library: loadLessonLibrary,
  assignments: async () => loadLessonLibrary(),
  student_groups: loadStudentGroups,
  admin_access: loadAdminAccounts
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
      teacher_id: sessionForm.elements.teacherId.value,
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

teacherLinkForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = teacherLinkForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const teacherId = teacherLinkForm.elements.teacherId.value;
    const studentId = teacherLinkForm.elements.studentId.value;
    const status = teacherLinkForm.elements.status.value;
    const endedAtRaw = teacherLinkForm.elements.endedAt.value;
    const endedAt = status === "ended" && endedAtRaw ? new Date(`${endedAtRaw}T12:00:00Z`).toISOString() : null;

    if (!teacherId || !studentId) throw new Error("Choose both a teacher and a student.");

    const { error } = await supabase.from("teacher_students").upsert({
      teacher_id: teacherId,
      student_id: studentId,
      status,
      ended_at: endedAt,
      started_at: new Date().toISOString()
    }, { onConflict: "teacher_id,student_id" });

    if (error) throw error;
    teacherLinkForm.reset();
    teacherLinkForm.elements.status.value = "active";
    showMessage("Teacher link saved.", "success");
    await loadTeacherLinks();
  } catch (error) {
    showMessage(`Could not save the teacher link: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

teacherAvailabilityForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = teacherAvailabilityForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const teacherId = teacherAvailabilityForm.elements.teacherId.value;
    const weekday = Number(teacherAvailabilityForm.elements.weekday.value);
    const startsAt = teacherAvailabilityForm.elements.startsAt.value;
    const endsAt = teacherAvailabilityForm.elements.endsAt.value;
    const timezone = teacherAvailabilityForm.elements.timezone.value.trim();
    const effectiveFrom = teacherAvailabilityForm.elements.effectiveFrom.value;
    const effectiveUntil = teacherAvailabilityForm.elements.effectiveUntil.value || null;

    if (!teacherId) throw new Error("Choose a teacher.");
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) throw new Error("Choose a valid weekday.");
    if (!startsAt || !endsAt) throw new Error("Choose both start and end times.");
    if (startsAt >= endsAt) throw new Error("The availability end time must be later than the start time.");
    if (!effectiveFrom) throw new Error("Choose an effective start date.");
    if (!timezone) throw new Error("Enter a timezone for this availability window.");

    const { error } = await supabase.from("teacher_availability").insert({
      teacher_id: teacherId,
      weekday,
      starts_at: startsAt,
      ends_at: endsAt,
      timezone,
      effective_from: effectiveFrom,
      effective_until: effectiveUntil
    });

    if (error) throw error;
    teacherAvailabilityForm.reset();
    teacherAvailabilityForm.elements.timezone.value = "Africa/Casablanca";
    showMessage("Teacher availability saved.", "success");
    await loadTeacherAvailability();
  } catch (error) {
    showMessage(`Could not save teacher availability: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

sessionStudentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = sessionStudentForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const teacherId = sessionStudentForm.elements.teacherId.value;
    const sessionId = sessionStudentForm.elements.sessionId.value;
    const studentId = sessionStudentForm.elements.studentId.value;
    if (!teacherId || !sessionId || !studentId) throw new Error("Choose a teacher, a session, and a student.");

    const { error } = await supabase.from("class_session_students").upsert({
      class_session_id: sessionId,
      student_id: studentId
    }, { onConflict: "class_session_id,student_id" });
    if (error) throw error;

    sessionStudentForm.reset();
    showMessage("Session participant saved.", "success");
    await loadLessonSessions();
  } catch (error) {
    showMessage(`Could not save session participant: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

timesheetForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = timesheetForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const teacherId = timesheetForm.elements.teacherId.value;
    const sessionId = timesheetForm.elements.sessionId.value;
    const hoursWorked = Number(timesheetForm.elements.hoursWorked.value);
    const notes = timesheetForm.elements.notes.value.trim();

    if (!teacherId || !sessionId) throw new Error("Choose a teacher and a session.");
    if (!Number.isFinite(hoursWorked) || hoursWorked <= 0 || hoursWorked > 24) {
      throw new Error("Hours worked must be between 0.25 and 24.");
    }

    const { error } = await supabase.from("teacher_timesheets").insert({
      teacher_id: teacherId,
      class_session_id: sessionId,
      hours_worked: hoursWorked,
      notes
    });
    if (error) throw error;

    timesheetForm.reset();
    timesheetForm.elements.hoursWorked.value = "1";
    showMessage("Teacher timesheet saved.", "success");
  } catch (error) {
    showMessage(`Could not save teacher timesheet: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

lessonForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = lessonForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const name = lessonForm.elements.name.value.trim();
    const level = lessonForm.elements.level.value.trim();
    const programId = lessonForm.elements.programId.value;
    const description = lessonForm.elements.description.value.trim();
    const duration = Number(lessonForm.elements.duration.value);
    if (!name || !level || !programId) throw new Error("Choose a program and fill out the lesson details.");
    if (!Number.isInteger(duration) || duration < 1 || duration > 1440) {
      throw new Error("Duration must be between 1 and 1440 minutes.");
    }

    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("You must be signed in to create lessons.");
    const { error } = await supabase.from("lessons").insert({
      name,
      level,
      description,
      program_id: programId,
      estimated_duration_minutes: duration,
      status: "draft",
      created_by: user.data.user.id
    });
    if (error) throw error;
    lessonForm.reset();
    lessonForm.elements.duration.value = "45";
    showMessage("Lesson created.", "success");
    await loadLessonLibrary();
  } catch (error) {
    showMessage(`Could not create the lesson: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

exerciseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = exerciseForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const lessonId = exerciseForm.elements.lessonId.value;
    const name = exerciseForm.elements.name.value.trim();
    const description = exerciseForm.elements.description.value.trim();
    const contentText = exerciseForm.elements.content.value.trim();
    if (!lessonId || !name || !contentText) {
      throw new Error("Choose a lesson, name the exercise, and provide JSON content.");
    }

    let content;
    try {
      content = JSON.parse(contentText);
    } catch {
      throw new Error("Exercise content must be valid JSON.");
    }

    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("You must be signed in to create exercises.");
    const { error } = await supabase.from("exercises").insert({
      lesson_id: lessonId,
      name,
      description,
      content,
      status: "draft",
      created_by: user.data.user.id
    });
    if (error) throw error;
    exerciseForm.reset();
    showMessage("Exercise created.", "success");
    await loadLessonLibrary();
  } catch (error) {
    showMessage(`Could not create the exercise: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

assignmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = assignmentForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const teacherId = assignmentForm.elements.teacherId.value;
    const assignmentType = assignmentForm.elements.assignmentType.value;
    const itemId = assignmentForm.elements.itemId.value;
    const studentId = assignmentForm.elements.studentId.value || null;
    const groupId = assignmentForm.elements.groupId.value || null;
    const dueAtRaw = assignmentForm.elements.dueAt.value;
    const dueAt = dueAtRaw ? new Date(`${dueAtRaw}T12:00:00Z`).toISOString() : null;

    if (!teacherId || !itemId) throw new Error("Choose a teacher and an item to assign.");
    if (!studentId && !groupId) throw new Error("Choose either a student or a group for this assignment.");
    if (studentId && groupId) throw new Error("Choose either a student or a group, not both.");

    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("You must be signed in to assign work.");

    if (groupId) {
      const rpcName = assignmentType === "exercise" ? "assign_exercise_to_group" : "assign_lesson_to_group";
      const rpcPayload = assignmentType === "exercise"
        ? { _exercise_id: itemId, _group_id: groupId, _due_at: dueAt }
        : { _lesson_id: itemId, _group_id: groupId, _due_at: dueAt };
      const { data, error } = await supabase.rpc(rpcName, rpcPayload);
      if (error) throw error;
      assignmentForm.reset();
      showMessage(`${assignmentType === "exercise" ? "Exercise" : "Lesson"} assigned to group (${data ?? 0} students).`, "success");
    } else {
      const payload = assignmentType === "exercise"
        ? {
            exercise_id: itemId,
            teacher_id: teacherId,
            student_id: studentId,
            assigned_by: user.data.user.id,
            due_at: dueAt,
            status: "assigned"
          }
        : {
            lesson_id: itemId,
            teacher_id: teacherId,
            student_id: studentId,
            assigned_by: user.data.user.id,
            due_at: dueAt,
            status: "assigned"
          };
      const { error } = await supabase.from(assignmentType === "exercise" ? "assigned_exercises" : "assigned_lessons").insert(payload);
      if (error) throw error;
      assignmentForm.reset();
      showMessage(`${assignmentType === "exercise" ? "Exercise" : "Lesson"} assigned to student.`, "success");
    }

    await loadLessonLibrary();
  } catch (error) {
    showMessage(`Could not assign the item: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

studentGroupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = studentGroupForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const teacherId = studentGroupForm.elements.teacherId.value;
    const groupName = studentGroupForm.elements.groupName.value.trim();
    if (!teacherId || !groupName) throw new Error("Choose a teacher and enter a group name.");

    const { error } = await supabase.from("student_groups").insert({
      teacher_id: teacherId,
      name: groupName
    });
    if (error) throw error;

    studentGroupForm.reset();
    showMessage("Student group created.", "success");
    await loadStudentGroups();
  } catch (error) {
    showMessage(`Could not create the student group: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

groupMemberForm.elements.teacherId.addEventListener("change", async () => {
  const teacherId = groupMemberForm.elements.teacherId.value;
  const groupSelect = groupMemberForm.elements.groupId;
  groupSelect.replaceChildren();
  groupSelect.append(new Option("Select a group", ""));
  if (!teacherId) return;

  const { data, error } = await supabase
    .from("student_groups")
    .select("id, name")
    .eq("teacher_id", teacherId)
    .order("name", { ascending: true });

  if (error) {
    showMessage(`Could not load student groups: ${error.message}`, "error");
    return;
  }

  data.forEach((group) => groupSelect.append(new Option(group.name, group.id)));
});

groupMemberForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = groupMemberForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const teacherId = groupMemberForm.elements.teacherId.value;
    const groupId = groupMemberForm.elements.groupId.value;
    const studentId = groupMemberForm.elements.studentId.value;
    if (!teacherId || !groupId || !studentId) throw new Error("Choose a teacher, group, and student.");

    const { error } = await supabase.from("student_group_members").upsert({
      group_id: groupId,
      teacher_id: teacherId,
      student_id: studentId
    }, { onConflict: "group_id,student_id" });

    if (error) throw error;
    groupMemberForm.reset();
    showMessage("Student added to the group.", "success");
    await loadStudentGroups();
  } catch (error) {
    showMessage(`Could not add the student to the group: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

adminAccessForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = adminAccessForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const action = adminAccessForm.elements.action.value;
    const payload = {
      action,
      email: adminAccessForm.elements.email.value.trim(),
      userId: adminAccessForm.elements.userId.value.trim(),
      password: adminAccessForm.elements.password.value.trim(),
      fullName: adminAccessForm.elements.fullName.value.trim()
    };

    if (!payload.email) throw new Error("Enter an email address.");
    if (action === "create-user") {
      if (payload.password.length < 8) throw new Error("Create a password with at least 8 characters.");
    } else {
      if (!payload.userId) throw new Error("Select or enter an admin user ID before updating the email.");
      delete payload.password;
    }

    const { data, error } = await supabase.functions.invoke("admin-users", { body: payload });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    adminAccessForm.reset();
    showMessage(`Admin account update succeeded for ${data?.user?.email || payload.email}.`, "success");
    await loadAdminAccounts();
  } catch (error) {
    showMessage(`Could not update admin access: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

adminAccessForm.elements.action.addEventListener("change", () => {
  const action = adminAccessForm.elements.action.value;
  const passwordField = adminAccessForm.elements.password;
  const userIdField = adminAccessForm.elements.userId;
  const isCreate = action === "create-user";
  passwordField.required = isCreate;
  passwordField.hidden = !isCreate;
  passwordField.closest("label").hidden = !isCreate;
  userIdField.required = !isCreate;
  userIdField.hidden = isCreate;
  userIdField.closest("label").hidden = isCreate;
  if (isCreate) {
    userIdField.value = "";
  }
});

adminAccessForm.elements.action.dispatchEvent(new Event("change"));

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
