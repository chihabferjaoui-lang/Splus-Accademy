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
  cell.textContent = value == null || value === "" ? "—" : String(value);
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
      .select("status,starts_at,ends_at,programs(name)")
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

  const profile = profileResult.data;
  profileForm.elements.fullName.value = profile?.full_name || "";
  profileForm.elements.email.value = profile?.email || user.email || "";
  profileForm.elements.phone.value = profile?.phone || "";

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
