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
const applicationStatuses = ["new", "reviewing", "accepted", "declined"];
let activePanel = "student_applications";
let supabase;

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
  const tables = ["student_applications", "teacher_applications", "profiles", "newsletter_subscribers"];
  const results = await Promise.all(tables.map((table) =>
    supabase.from(table).select("id", { count: "exact", head: true })
  ));
  results.forEach((result) => {
    if (result.error) throw result.error;
  });
  tables.forEach((table, index) => {
    document.querySelector(`[data-stat="${table}"]`).textContent = String(results[index].count ?? 0);
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

async function loadOrders() {
  const body = document.querySelector('[data-table-body="orders"]');
  const [ordersResult, profilesResult, programsResult] = await Promise.all([
    supabase.from("orders")
      .select("student_id,program_id,amount_mad,currency,status,provider,created_at")
      .order("created_at", { ascending: false }),
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
    `${order.amount_mad} ${order.currency}`,
    order.status,
    order.provider,
    formatDate(order.created_at)
  ]), 6, "No order records yet.");
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
    showMessage("Application status updated.", "success");
  } catch (error) {
    showMessage(`Could not update application status: ${error.message}`, "error");
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
