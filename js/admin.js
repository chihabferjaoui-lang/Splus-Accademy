import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const config = window.SPLUS_SUPABASE_CONFIG || {
  url: "https://awhcmgyoldepoghxmtfs.supabase.co",
  publishableKey: "sb_publishable_z0XE84bwp4vKDoZ0jAIuHw_dLhUd6jE"
};

let supabase = null;
try {
  if (config.url && config.publishableKey) {
    supabase = createClient(config.url, config.publishableKey);
  }
} catch (e) {
  console.warn("Supabase init warning:", e);
}

// Default Seed Data
const DEFAULT_WORKSPACE_DATA = {
  active_nav: "overview",
  kronos_week: {
    mon: [
      { id: "sess-1", time: "09:00", student: "Sara B.", program: "Business English", teacher: "Chihab", status: "Confirmed" },
      { id: "sess-2", time: "14:00", student: "Omar K.", program: "Exam Preparation", teacher: "Chihab", status: "Confirmed" }
    ],
    tue: [
      { id: "sess-3", time: "09:00", student: "Sara B.", program: "Business English", teacher: "Chihab", status: "Confirmed" },
      { id: "sess-4", time: "11:30", student: "Exam Prep group", program: "Exam Preparation", teacher: "Chihab", status: "Confirmed" },
      { id: "sess-5", time: "14:00", student: "Omar K.", program: "Private Tutoring", teacher: "Chihab", status: "Pending" },
      { id: "sess-6", time: "17:00", student: "Lina M.", program: "Day-to-Day English", teacher: "Chihab", status: "Confirmed" }
    ],
    wed: [
      { id: "sess-7", time: "09:00", student: "Sara B.", program: "Business English", teacher: "Chihab", status: "Confirmed" },
      { id: "sess-8", time: "15:00", student: "Youssef A.", program: "Private Tutoring", teacher: "Chihab", status: "Confirmed" }
    ],
    thu: [
      { id: "sess-9", time: "11:30", student: "Exam Prep group", program: "Exam Preparation", teacher: "Chihab", status: "Confirmed" },
      { id: "sess-10", time: "17:00", student: "Lina M.", program: "Day-to-Day English", teacher: "Chihab", status: "Confirmed" }
    ],
    fri: [
      { id: "sess-11", time: "10:00", student: "Hana R.", program: "Business English", teacher: "Chihab", status: "Confirmed" },
      { id: "sess-12", time: "16:00", student: "Adam A.", program: "Exam Preparation", teacher: "Chihab", status: "Confirmed" }
    ]
  },
  genius_lessons: [
    { id: "les-1", title: "Writing Business Emails", level: "B1", program: "Business English", duration: "45 min" },
    { id: "les-2", title: "Meeting Vocabulary", level: "B2", program: "Business English", duration: "30 min" },
    { id: "les-3", title: "IELTS Speaking Part 2", level: "B2", program: "Exam Preparation", duration: "60 min" },
    { id: "les-4", title: "Ordering at a Café", level: "A2", program: "Day-to-Day English", duration: "25 min" },
    { id: "les-5", title: "Past Simple Practice", level: "A2", program: "Day-to-Day English", duration: "20 min" }
  ],
  era_invoices: [
    {
      id: "INV-0042",
      custNo: "C-000017",
      name: "Sara B.",
      program: "Business English",
      mad: 800,
      due: "12 Nov",
      status: "Overdue",
      statusClass: "overdue",
      address: "14 Example Street, Casablanca",
      phone: "+212 600 000 000",
      email: "sara@example.com",
      reminders: ["Due-date reminder, sent 9 Nov", "Overdue notice, scheduled 13 Nov"]
    },
    {
      id: "INV-0045",
      custNo: "C-000021",
      name: "Omar K.",
      program: "Exam Preparation",
      mad: 500,
      due: "19 Nov",
      status: "Sent",
      statusClass: "sent",
      address: "28 Bd d'Anfa, Casablanca",
      phone: "+212 611 111 111",
      email: "omar@example.com",
      reminders: ["Due-date reminder scheduled 17 Nov"]
    },
    {
      id: "INV-0047",
      custNo: "C-000024",
      name: "Lina M.",
      program: "Day-to-Day English",
      mad: 600,
      due: "22 Nov",
      status: "Sent",
      statusClass: "sent",
      address: "5 Rue Victor Hugo, Rabat",
      phone: "+212 622 222 222",
      email: "lina@example.com",
      reminders: ["Invoice sent on issue"]
    },
    {
      id: "INV-0044",
      custNo: "C-000019",
      name: "Youssef A.",
      program: "Private Tutoring",
      mad: 350,
      due: "10 Nov",
      status: "Paid",
      statusClass: "paid",
      address: "87 Avenue Hassan II, Casablanca",
      phone: "+212 633 333 333",
      email: "youssef@example.com",
      reminders: ["Paid via Bank Transfer"]
    },
    {
      id: "INV-0043",
      custNo: "C-000018",
      name: "Hana R.",
      program: "Business English",
      mad: 800,
      due: "8 Nov",
      status: "Paid",
      statusClass: "paid",
      address: "12 Rue de Fès, Marrakech",
      phone: "+212 644 444 444",
      email: "hana@example.com",
      reminders: ["Receipt sent 8 Nov"]
    },
    {
      id: "INV-0041",
      custNo: "C-000015",
      name: "Adam A.",
      program: "Exam Preparation",
      mad: 500,
      due: "5 Nov",
      status: "Paid",
      statusClass: "paid",
      address: "3 Rue Zerktouni, Casablanca",
      phone: "+212 655 555 555",
      email: "adam@example.com",
      reminders: ["Paid via Cash receipt"]
    }
  ],
  customers: [
    { custNo: "C-000017", name: "Sara B.", email: "sara@example.com", phone: "+212 600 000 000", city: "Casablanca", status: "Active" },
    { custNo: "C-000021", name: "Omar K.", email: "omar@example.com", phone: "+212 611 111 111", city: "Casablanca", status: "Active" },
    { custNo: "C-000024", name: "Lina M.", email: "lina@example.com", phone: "+212 622 222 222", city: "Rabat", status: "Active" },
    { custNo: "C-000019", name: "Youssef A.", email: "youssef@example.com", phone: "+212 633 333 333", city: "Casablanca", status: "Active" },
    { custNo: "C-000018", name: "Hana R.", email: "hana@example.com", phone: "+212 644 444 444", city: "Marrakech", status: "Active" },
    { custNo: "C-000015", name: "Adam A.", email: "adam@example.com", phone: "+212 655 555 555", city: "Casablanca", status: "Active" }
  ],
  notifications: [
    { target: "Sara B.", channel: "Email", topic: "Invoice INV-0042 Overdue", scheduled: "13 Nov 2026, 09:00", attempts: 1, status: "Sent" },
    { target: "Omar K.", channel: "WhatsApp", topic: "Session Reminder (14:00)", scheduled: "17 Nov 2026, 08:30", attempts: 1, status: "Sent" },
    { target: "Lina M.", channel: "In-app", topic: "New Lesson: Writing Business Emails", scheduled: "17 Nov 2026, 10:00", attempts: 1, status: "Delivered" }
  ],
  student_applications: [
    { id: "stu-sample-1", name: "Fatima E.", email: "fatima@example.com", phone: "+212 670 123 456", program: "Business English", level: "B1", status: "Under Review", submitted: "15 Nov 2026" },
    { id: "stu-sample-2", name: "Karim Z.", email: "karim@example.com", phone: "+212 661 987 654", program: "Exam Preparation", level: "B2", status: "Approved", submitted: "14 Nov 2026" },
    { id: "stu-sample-3", name: "Nour H.", email: "nour@example.com", phone: "+212 652 334 455", program: "Day-to-Day English", level: "A2", status: "Contacted", submitted: "12 Nov 2026" }
  ],
  teacher_applications: [
    { id: "tea-sample-1", name: "David M.", email: "david@example.com", phone: "+44 7700 900077", country: "United Kingdom", spec: "CELTA Certified / IELTS", status: "Interviewed", submitted: "10 Nov 2026" },
    { id: "tea-sample-2", name: "Sophie L.", email: "sophie@example.com", phone: "+33 612 345 678", country: "France", spec: "Business Communication & TOEFL", status: "Under Review", submitted: "13 Nov 2026" }
  ],
  class_slots: [
    { program: "Business English (Evening)", starts: "18:00", ends: "19:30", capacity: "8 / 10", status: "Active" },
    { program: "IELTS Exam Preparation", starts: "11:30", ends: "13:00", capacity: "6 / 6 (Full)", status: "Full" },
    { program: "Day-to-Day English A2", starts: "17:00", ends: "18:30", capacity: "4 / 10", status: "Active" }
  ],
  newsletter_subscribers: [
    { email: "subscriber.one@example.com", date: "16 Nov 2026", status: "Active" },
    { email: "learning.pro@example.com", date: "14 Nov 2026", status: "Active" }
  ]
};

// Sample data helpers. Default rows are tagged so sample data can be removed
// without deleting records that were entered by the admin.
const SAMPLE_TAG = "_sample";
const SAMPLE_COLLECTIONS = [
  "era_invoices",
  "genius_lessons",
  "customers",
  "notifications",
  "student_applications",
  "teacher_applications",
  "class_slots",
  "newsletter_subscribers"
];

function cloneDefaultWorkspaceData() {
  const data = JSON.parse(JSON.stringify(DEFAULT_WORKSPACE_DATA));
  Object.values(data.kronos_week || {}).forEach(list => {
    (list || []).forEach(item => { item[SAMPLE_TAG] = true; });
  });
  SAMPLE_COLLECTIONS.forEach(key => {
    (data[key] || []).forEach(item => { item[SAMPLE_TAG] = true; });
  });
  return data;
}

function sampleIdentity(item, key) {
  if (!item) return "";
  if (key === "customers") return item.custNo || item.email || "";
  if (key === "notifications") return item.topic || "";
  if (key === "class_slots") return item.id || `${item.program || ""}|${item.starts || ""}|${item.ends || ""}`;
  if (key === "newsletter_subscribers") return item.email || "";
  return item.id || item.email || "";
}

function buildSampleIdentities() {
  const defaults = cloneDefaultWorkspaceData();
  const identities = {};
  SAMPLE_COLLECTIONS.forEach(key => {
    identities[key] = new Set((defaults[key] || []).map(item => sampleIdentity(item, key)).filter(Boolean));
  });
  identities.kronos_week = new Set(
    Object.values(defaults.kronos_week || {})
      .flat()
      .map(item => sampleIdentity(item, "kronos_week"))
      .filter(Boolean)
  );
  return identities;
}

const SAMPLE_IDENTITIES = buildSampleIdentities();

function isSampleRecord(item, key) {
  if (!item) return false;
  if (item[SAMPLE_TAG]) return true;
  return SAMPLE_IDENTITIES[key]?.has(sampleIdentity(item, key)) || false;
}

function adoptLegacySampleFlags(state) {
  if (!state || !state.kronos_week) return;
  Object.keys(state.kronos_week).forEach(day => {
    (state.kronos_week[day] || []).forEach(item => {
      if (isSampleRecord(item, "kronos_week")) item[SAMPLE_TAG] = true;
    });
  });
  SAMPLE_COLLECTIONS.forEach(key => {
    (state[key] || []).forEach(item => {
      if (isSampleRecord(item, key)) item[SAMPLE_TAG] = true;
    });
  });
}

function hasSampleData(state = APP_STATE) {
  if (!state || !state.kronos_week) return false;
  const hasTaggedSession = Object.values(state.kronos_week).some(list =>
    (list || []).some(item => isSampleRecord(item, "kronos_week"))
  );
  if (hasTaggedSession) return true;
  return SAMPLE_COLLECTIONS.some(key =>
    (state[key] || []).some(item => isSampleRecord(item, key))
  );
}

function loadSampleData() {
  const samples = cloneDefaultWorkspaceData();
  APP_STATE.kronos_week = APP_STATE.kronos_week || {};
  Object.keys(samples.kronos_week).forEach(day => {
    const target = APP_STATE.kronos_week[day] || (APP_STATE.kronos_week[day] = []);
    samples.kronos_week[day].forEach(item => {
      if (!target.some(existing => sampleIdentity(existing, "kronos_week") === sampleIdentity(item, "kronos_week"))) {
        target.push(item);
      }
    });
  });
  SAMPLE_COLLECTIONS.forEach(key => {
    const target = Array.isArray(APP_STATE[key]) ? APP_STATE[key] : (APP_STATE[key] = []);
    (samples[key] || []).forEach(item => {
      if (!target.some(existing => sampleIdentity(existing, key) === sampleIdentity(item, key))) {
        target.push(item);
      }
    });
  });
  if (!selectedGeniusLesson) selectedGeniusLesson = APP_STATE.genius_lessons[0] || null;
  if (!selectedEraInvoice) selectedEraInvoice = APP_STATE.era_invoices[0] || null;
}

function clearSampleData() {
  if (!APP_STATE.kronos_week) APP_STATE.kronos_week = {};
  Object.keys(APP_STATE.kronos_week).forEach(day => {
    APP_STATE.kronos_week[day] = (APP_STATE.kronos_week[day] || [])
      .filter(item => !isSampleRecord(item, "kronos_week"));
  });
  SAMPLE_COLLECTIONS.forEach(key => {
    APP_STATE[key] = (APP_STATE[key] || []).filter(item => !isSampleRecord(item, key));
  });
  if (!APP_STATE.genius_lessons.includes(selectedGeniusLesson)) {
    selectedGeniusLesson = APP_STATE.genius_lessons[0] || null;
  }
  if (!APP_STATE.era_invoices.includes(selectedEraInvoice)) {
    selectedEraInvoice = APP_STATE.era_invoices[0] || null;
  }
}

// State Store loaded from localStorage
const STORAGE_KEY = "splus_workspace_store_v1";

function loadWorkspaceState() {
  let state = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.kronos_week && parsed.era_invoices) {
        state = parsed;
      }
    }
  } catch (e) {
    console.warn("Storage parse error:", e);
  }
  if (!state) {
    state = cloneDefaultWorkspaceData();
  }
  const defaults = cloneDefaultWorkspaceData();
  Object.keys(defaults.kronos_week).forEach(day => {
    if (!Array.isArray(state.kronos_week[day])) state.kronos_week[day] = [];
  });
  SAMPLE_COLLECTIONS.forEach(key => {
    if (!Array.isArray(state[key])) state[key] = defaults[key];
  });
  adoptLegacySampleFlags(state);
  // Ensure IDs exist on applications and bookings
  (state.student_applications || []).forEach((app, i) => {
    if (!app.id) app.id = `stu-${i}-${Date.now()}`;
  });
  (state.teacher_applications || []).forEach((app, i) => {
    if (!app.id) app.id = `tea-${i}-${Date.now()}`;
  });
  if (!Array.isArray(state.class_slots)) state.class_slots = [];
  state.class_slots.forEach((slot, i) => {
    if (!slot.id) slot.id = `slot-${i}-${Date.now()}`;
  });
  if (!Array.isArray(state.newsletter_subscribers)) {
    state.newsletter_subscribers = defaults.newsletter_subscribers;
  }
  return state;
}

let APP_STATE = loadWorkspaceState();

function saveWorkspaceState() {
  try {
    // Bound collections to prevent QuotaExceededError under extreme volume
    const MAX_ITEMS = 500;
    ['student_applications', 'teacher_applications', 'booking_requests', 'era_invoices', 'notifications', 'newsletter_subscribers'].forEach(key => {
      if (Array.isArray(APP_STATE[key]) && APP_STATE[key].length > MAX_ITEMS) {
        APP_STATE[key] = APP_STATE[key].slice(0, MAX_ITEMS);
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(APP_STATE));
  } catch (e) {
    console.error("Save state error, attempting aggressive pruning:", e);
    try {
      ['student_applications', 'teacher_applications', 'booking_requests', 'era_invoices', 'notifications', 'newsletter_subscribers'].forEach(key => {
        if (Array.isArray(APP_STATE[key])) {
          APP_STATE[key] = APP_STATE[key].slice(0, 100);
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(APP_STATE));
    } catch (err2) {
      console.error("Critical storage error:", err2);
    }
  }
}

// Global Selections
let selectedGeniusLesson = APP_STATE.genius_lessons[0] || null;
let selectedEraInvoice = APP_STATE.era_invoices[0] || null;
let editingSessionContext = null;

// Kronos Calendar State & Multi-Date Scroll Engine
let kronosAnchorDate = new Date();
function getTodayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
const TODAY_ISO = getTodayISO();

const LEGACY_DAY_MAP = {
  "2026-11-16": "mon",
  "2026-11-17": "tue",
  "2026-11-18": "wed",
  "2026-11-19": "thu",
  "2026-11-20": "fri",
  "2026-11-21": "sat",
  "2026-11-22": "sun"
};

function getSessionsForDate(dateISO) {
  let list = APP_STATE.kronos_week[dateISO];
  if (Array.isArray(list) && list.length > 0) return list;
  const legacyKey = LEGACY_DAY_MAP[dateISO];
  if (legacyKey && Array.isArray(APP_STATE.kronos_week[legacyKey])) {
    return APP_STATE.kronos_week[legacyKey];
  }
  return list || [];
}

function findSessionAndBucket(id) {
  for (const key of Object.keys(APP_STATE.kronos_week)) {
    const list = APP_STATE.kronos_week[key];
    if (Array.isArray(list)) {
      const idx = list.findIndex(s => s.id === id);
      if (idx !== -1) {
        return { bucket: key, index: idx, session: list[idx] };
      }
    }
  }
  return null;
}

function scrollKronosToToday() {
  const container = document.getElementById("kronosScrollContainer");
  const todayCol = document.querySelector(".kronos-day-col.col-today");
  if (container && todayCol) {
    const containerWidth = container.clientWidth;
    container.scrollTo({
      left: todayCol.offsetLeft - (containerWidth / 2) + (todayCol.offsetWidth / 2),
      behavior: "smooth"
    });
  }
}

// DOM References
const toastEl = document.querySelector("[data-portal-message]");
const navButtons = document.querySelectorAll("[data-nav-target]");
const viewPanels = document.querySelectorAll("[data-admin-panel]");
const sampleToggles = document.querySelectorAll("[data-toggle-sample]");
const userEmailEl = document.querySelector("[data-user-email]");
const signOutBtn = document.querySelector("[data-sign-out]");

function showToast(message, type = "success") {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.className = `admin-toast-message ${type}`;
  toastEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  setTimeout(() => {
    toastEl.className = "admin-toast-message";
  }, 4000);
}

function syncSampleToggleButtons() {
  const enabled = hasSampleData();
  sampleToggles.forEach(button => {
    button.classList.toggle("active", enabled);
    button.setAttribute("aria-pressed", String(enabled));
    button.title = enabled ? "Remove sample data and keep your own entries" : "Load sample data";
    button.setAttribute("aria-label", enabled ? "Remove sample data" : "Load sample data");
  });
}

// Pagination & Search Filter State for High Volume Scaling
const PAGINATION = {
  booking_requests: { page: 1, pageSize: 8, search: "" },
  student_applications: { page: 1, pageSize: 8, search: "" },
  teacher_applications: { page: 1, pageSize: 8, search: "" },
  era_invoices: { page: 1, pageSize: 8, search: "" },
  customers: { page: 1, pageSize: 8, search: "" },
  newsletter_subscribers: { page: 1, pageSize: 8, search: "" }
};

function renderPaginationBar(tableKey, totalItems) {
  const container = document.querySelector(`[data-pagination="${tableKey}"]`);
  if (!container) return;
  const config = PAGINATION[tableKey];
  const totalPages = Math.max(1, Math.ceil(totalItems / config.pageSize));
  if (config.page > totalPages) config.page = totalPages;

  const startItem = totalItems === 0 ? 0 : (config.page - 1) * config.pageSize + 1;
  const endItem = Math.min(totalItems, config.page * config.pageSize);

  container.innerHTML = `
    <div>Showing <strong>${startItem}–${endItem}</strong> of <strong>${totalItems}</strong> entries</div>
    <div class="table-pagination-controls">
      <button type="button" class="table-pagination-btn" data-page-action="prev" data-table="${tableKey}" ${config.page <= 1 ? "disabled" : ""}>Previous</button>
      <span style="font-weight: 600; padding: 0 4px;">Page ${config.page} / ${totalPages}</span>
      <button type="button" class="table-pagination-btn" data-page-action="next" data-table="${tableKey}" ${config.page >= totalPages ? "disabled" : ""}>Next</button>
    </div>
  `;
}

// View Switching
function switchView(targetView) {
  APP_STATE.active_nav = targetView;
  saveWorkspaceState();
  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.navTarget === targetView);
  });
  viewPanels.forEach(panel => {
    panel.hidden = panel.dataset.adminPanel !== targetView;
  });
  renderCurrentView();
  if (targetView === "kronos") {
    setTimeout(scrollKronosToToday, 60);
  }
}

function renderCurrentView() {
  calculateStats();
  renderOverview();
  renderKronos();
  renderGenius();
  renderEra();
  renderCustomers();
  renderNotifications();
  renderApplications();
  renderClassSlots();
  renderNewsletter();
}

// Calculate dynamic stats
function calculateStats() {
  const allSessions = Object.values(APP_STATE.kronos_week).flat();
  const todaySessions = getSessionsForDate(TODAY_ISO);
  const overdueInvoices = APP_STATE.era_invoices.filter(i => (i.status || "").toLowerCase() === "overdue");
  const uniqueStudents = new Set([
    ...allSessions.map(s => s.student),
    ...APP_STATE.era_invoices.map(i => i.name)
  ]).size;

  const outstandingMAD = APP_STATE.era_invoices
    .filter(i => (i.status || "").toLowerCase() !== "paid")
    .reduce((sum, i) => sum + (Number(i.mad) || 0), 0);

  const paidThisMonthMAD = APP_STATE.era_invoices
    .filter(i => (i.status || "").toLowerCase() === "paid")
    .reduce((sum, i) => sum + (Number(i.mad) || 0), 0);

  // Update Overview stats
  const statStudents = document.querySelector('[data-stat="active_students"]');
  const statOverdue = document.querySelector('[data-stat="overdue_invoices"]');
  const statToday = document.querySelector('[data-stat="sessions_today"]');
  const statLessons = document.querySelector('[data-stat="lessons_week"]');

  if (statStudents) statStudents.textContent = uniqueStudents;
  if (statOverdue) statOverdue.textContent = overdueInvoices.length;
  if (statToday) statToday.textContent = todaySessions.length;
  if (statLessons) statLessons.textContent = APP_STATE.genius_lessons.length;

  // Update Era stats
  const eraOut = document.querySelector('[data-stat="era_outstanding"]');
  const eraPaid = document.querySelector('[data-stat="era_paid_month"]');
  const eraOver = document.querySelector('[data-stat="era_overdue"]');
  const eraRem = document.querySelector('[data-stat="era_reminders"]');

  if (eraOut) eraOut.textContent = outstandingMAD.toLocaleString();
  if (eraPaid) eraPaid.textContent = paidThisMonthMAD.toLocaleString();
  if (eraOver) eraOver.textContent = overdueInvoices.length;
  if (eraRem) eraRem.textContent = APP_STATE.era_invoices.reduce((acc, i) => acc + (i.reminders ? i.reminders.length : 0), 0);
}

// RENDER: OVERVIEW
function renderOverview() {
  const sessionsTbody = document.querySelector('[data-tbody="overview_sessions"]');
  if (sessionsTbody) {
    const todaySessions = getSessionsForDate(TODAY_ISO);
    if (todaySessions.length === 0) {
      sessionsTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-muted); padding: 18px;">No sessions scheduled for today.</td></tr>`;
    } else {
      sessionsTbody.innerHTML = todaySessions.map(s => {
        const isPending = (s.status || "").toLowerCase() === "pending";
        return `
          <tr>
            <td style="font-weight: 700;">${s.time}</td>
            <td>${s.student}</td>
            <td style="color: var(--admin-muted);">${s.teacher || "Chihab"}</td>
            <td><span class="badge-pill ${isPending ? 'pending' : 'confirmed'}">${s.status}</span></td>
            <td>
              <div class="table-actions-cell">
                ${isPending ? `<button type="button" class="btn-xs btn-xs-success" data-action="approve-session" data-id="${s.id}">Approve</button>` : ''}
                <button type="button" class="btn-xs btn-xs-danger" data-action="delete-session" data-id="${s.id}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  const invoicesTbody = document.querySelector('[data-tbody="overview_invoices"]');
  if (invoicesTbody) {
    const attentionInvoices = APP_STATE.era_invoices.filter(i => (i.status || "").toLowerCase() !== "paid");
    if (attentionInvoices.length === 0) {
      invoicesTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-muted); padding: 18px;">All invoices are settled!</td></tr>`;
    } else {
      invoicesTbody.innerHTML = attentionInvoices.map(inv => {
        const isOverdue = (inv.status || "").toLowerCase() === "overdue";
        return `
          <tr>
            <td style="font-weight: 650; color: var(--admin-primary);">${inv.id}</td>
            <td>${inv.name}</td>
            <td style="font-weight: 650;">${inv.mad}</td>
            <td><span class="badge-pill ${isOverdue ? 'overdue' : 'due'}">${inv.status}</span></td>
            <td>
              <div class="table-actions-cell">
                <button type="button" class="btn-xs btn-xs-success" data-action="pay-invoice" data-id="${inv.id}">Pay</button>
                <button type="button" class="btn-xs btn-xs-danger" data-action="delete-invoice" data-id="${inv.id}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }
  }
}

// RENDER: KRONOS SCHEDULE (Multi-Date Scrollable Extended Engine)
function renderKronos() {
  const grid = document.getElementById("kronosWeekGrid");
  if (!grid) return;

  const todayStr = TODAY_ISO;
  let pendingCount = 0;
  let totalHours = 0;

  // Generate 28 scrollable days around kronosAnchorDate (-7 days past to +20 days future)
  const daysToShow = [];
  const base = new Date(kronosAnchorDate);
  base.setHours(0, 0, 0, 0);

  for (let offset = -7; offset <= 20; offset++) {
    const d = new Date(base);
    d.setDate(base.getDate() + offset);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const iso = `${yyyy}-${mm}-${dd}`;
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    daysToShow.push({
      dateObj: d,
      iso: iso,
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      monthName: monthNames[d.getMonth()],
      isToday: iso === todayStr,
      isPast: iso < todayStr
    });
  }

  // Update subtitle
  const subTitle = document.getElementById("kronosWeekSubtitle");
  if (subTitle && daysToShow.length) {
    const startD = daysToShow[0];
    const endD = daysToShow[daysToShow.length - 1];
    subTitle.textContent = `Schedule from ${startD.dayNum} ${startD.monthName} to ${endD.dayNum} ${endD.monthName} ${endD.dateObj.getFullYear()}. Browse past & upcoming dates. Past dates are view-only.`;
  }

  grid.innerHTML = daysToShow.map(dayInfo => {
    const items = getSessionsForDate(dayInfo.iso);
    const colClass = dayInfo.isToday ? "col-today" : (dayInfo.isPast ? "col-past" : "col-future");

    const sessionsHtml = items.length === 0
      ? `<div style="font-size: 11.5px; color: #94a3b8; text-align: center; padding: 24px 0;">No sessions</div>`
      : items.map(item => {
          const isPending = (item.status || "").toLowerCase() === "pending";
          if (isPending) pendingCount++;
          totalHours += 1;
          return `
            <div class="kronos-session-card ${isPending ? 'is-pending' : ''}" data-session-click="${item.id}" data-date="${dayInfo.iso}">
              <div class="kronos-card-header">
                <span class="kronos-session-time">${item.time}</span>
                <span class="badge-pill ${isPending ? 'pending' : 'confirmed'}" style="font-size: 10px; padding: 2px 7px;">${item.status}</span>
              </div>
              <div class="kronos-session-info">${item.student} · ${item.program}</div>
              <div class="kronos-card-actions">
                ${isPending ? `<button type="button" class="btn-xs btn-xs-success" data-action="approve-session" data-id="${item.id}">Approve</button>` : ''}
                <button type="button" class="btn-xs btn-xs-danger" data-action="delete-session" data-id="${item.id}">Delete</button>
              </div>
            </div>
          `;
        }).join("");

    return `
      <div class="kronos-day-col ${colClass}" data-kronos-col="${dayInfo.iso}">
        <div class="kronos-day-header">
          <span>${dayInfo.dayName} ${dayInfo.dayNum} ${dayInfo.monthName}</span>
          ${dayInfo.isToday ? `<span class="today-badge">(Today)</span>` : (dayInfo.isPast ? `<span class="badge-pill overdue" style="font-size: 10px; padding: 1px 6px;">Past</span>` : '')}
        </div>
        <div class="kronos-day-sessions" data-kronos-date="${dayInfo.iso}">
          ${sessionsHtml}
        </div>
        ${dayInfo.isPast ? `
          <button type="button" class="btn-add-session-day btn-disabled-past" disabled title="Past date — booking disabled">Booking closed</button>
        ` : `
          <button type="button" class="btn-add-session-day" data-add-to-date="${dayInfo.iso}">+ Add Session</button>
        `}
      </div>
    `;
  }).join("");

  // Update teacher hours & stats
  const hoursEl = document.querySelector("#btnApproveTimesheet")?.previousElementSibling?.previousElementSibling?.previousElementSibling?.previousElementSibling;
  const pendingTextEl = document.querySelector("#btnApproveTimesheet")?.previousElementSibling?.previousElementSibling?.previousElementSibling;
  if (hoursEl) hoursEl.textContent = `Chihab · ${(totalHours * 1.5).toFixed(1)} h scheduled`;
  if (pendingTextEl) pendingTextEl.textContent = `${pendingCount} sessions waiting for approval`;
}

// RENDER: GENIUS LESSONS
function renderGenius() {
  const tbody = document.querySelector('[data-tbody="genius_lessons"]');
  if (!tbody) return;

  if (APP_STATE.genius_lessons.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--admin-muted); padding: 20px;">No lessons created yet. Click "New lesson" to add one.</td></tr>`;
    selectedGeniusLesson = null;
    updateGeniusSelection();
    return;
  }

  tbody.innerHTML = APP_STATE.genius_lessons.map((lesson) => {
    const isSelected = selectedGeniusLesson && selectedGeniusLesson.id === lesson.id;
    return `
      <tr class="clickable ${isSelected ? 'row-selected' : ''}" data-lesson-id="${lesson.id}">
        <td style="font-weight: 650;">${lesson.title}</td>
        <td><span class="badge-pill sent">${lesson.level}</span></td>
        <td>${lesson.program}</td>
        <td style="color: var(--admin-muted);">${lesson.duration}</td>
        <td>
          <div class="table-actions-cell">
            <button type="button" class="btn-xs btn-xs-primary" data-action="select-lesson" data-id="${lesson.id}">Select</button>
            <button type="button" class="btn-xs btn-xs-danger" data-action="delete-lesson" data-id="${lesson.id}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  updateGeniusSelection();
}

function updateGeniusSelection() {
  const titleEl = document.getElementById("geniusSelectedLessonTitle");
  const previewTitle = document.getElementById("geniusPreviewTitle");
  const previewMeta = document.getElementById("geniusPreviewMeta");
  const dueDateInput = document.getElementById("geniusDueDate");

  if (selectedGeniusLesson) {
    if (titleEl) titleEl.textContent = `Selected: ${selectedGeniusLesson.title}`;
    if (previewTitle) previewTitle.textContent = `New lesson: ${selectedGeniusLesson.title}`;
    const dueVal = dueDateInput ? dueDateInput.value : "Fri 20 Nov";
    if (previewMeta) previewMeta.textContent = `About ${selectedGeniusLesson.duration} · due ${dueVal}`;
  } else {
    if (titleEl) titleEl.textContent = `No lesson selected`;
    if (previewTitle) previewTitle.textContent = `No lesson`;
    if (previewMeta) previewMeta.textContent = ``;
  }
}

// RENDER: ERA INVOICES
function renderEra() {
  const tbody = document.querySelector('[data-tbody="era_invoices"]');
  if (!tbody) return;

  const cfg = PAGINATION.era_invoices;
  let list = APP_STATE.era_invoices || [];

  if (cfg.search) {
    const s = cfg.search.toLowerCase();
    list = list.filter(inv =>
      (inv.id && inv.id.toLowerCase().includes(s)) ||
      (inv.name && inv.name.toLowerCase().includes(s)) ||
      (inv.custNo && inv.custNo.toLowerCase().includes(s)) ||
      (inv.program && inv.program.toLowerCase().includes(s)) ||
      (inv.status && inv.status.toLowerCase().includes(s))
    );
  }

  const total = list.length;
  renderPaginationBar("era_invoices", total);

  const start = (cfg.page - 1) * cfg.pageSize;
  const paginated = list.slice(start, start + cfg.pageSize);

  if (paginated.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--admin-muted); padding: 24px;">${cfg.search ? 'No matching invoices found.' : 'No invoices found. Click "New invoice" to create one.'}</td></tr>`;
    if (!list.length) {
      selectedEraInvoice = null;
      updateEraCustomerCard();
    }
    return;
  }

  tbody.innerHTML = paginated.map((inv) => {
    const isSelected = selectedEraInvoice && selectedEraInvoice.id === inv.id;
    return `
      <tr class="clickable ${isSelected ? 'row-selected' : ''}" data-invoice-id="${inv.id}">
        <td style="font-weight: 650; color: var(--admin-primary);">${inv.id}</td>
        <td style="color: var(--admin-muted);">${inv.custNo}</td>
        <td style="font-weight: 600;">${inv.name}</td>
        <td>${inv.program}</td>
        <td style="font-weight: 700;">${inv.mad}</td>
        <td style="color: var(--admin-muted);">${inv.due}</td>
        <td><span class="badge-pill ${inv.statusClass || (inv.status === 'Paid' ? 'paid' : (inv.status === 'Overdue' ? 'overdue' : 'sent'))}">${inv.status}</span></td>
        <td>
          <div class="table-actions-cell">
            <button type="button" class="btn-xs btn-xs-primary" data-action="view-arabic-invoice" data-id="${inv.id}">فاتورة</button>
            <button type="button" class="btn-xs btn-xs-danger" data-action="delete-invoice" data-id="${inv.id}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  updateEraCustomerCard();
}

function updateEraCustomerCard() {
  const numEl = document.getElementById("eraCustNumber");
  const nameEl = document.getElementById("eraCustName");
  const metaEl = document.getElementById("eraCustMeta");
  const remindersEl = document.getElementById("eraCustReminders");

  if (!selectedEraInvoice) {
    if (numEl) numEl.textContent = "No invoice selected";
    if (nameEl) nameEl.textContent = "—";
    if (metaEl) metaEl.textContent = "Select an invoice to view customer details.";
    if (remindersEl) remindersEl.innerHTML = "";
    return;
  }

  if (numEl) numEl.textContent = `Customer ${selectedEraInvoice.custNo}`;
  if (nameEl) nameEl.textContent = selectedEraInvoice.name;
  if (metaEl) {
    metaEl.innerHTML = `
      ${selectedEraInvoice.address || "Casablanca, Morocco"}<br>
      ${selectedEraInvoice.phone || "+212 600 000 000"}<br>
      ${selectedEraInvoice.email || "student@example.com"}
    `;
  }
  if (remindersEl) {
    remindersEl.innerHTML = (selectedEraInvoice.reminders || []).map(r => `<div>${r}</div>`).join("");
  }
}

// RENDER: CUSTOMERS
function renderCustomers() {
  const tbody = document.querySelector('[data-tbody="customers_list"]');
  if (!tbody) return;

  const cfg = PAGINATION.customers;
  let list = APP_STATE.customers || [];

  if (cfg.search) {
    const s = cfg.search.toLowerCase();
    list = list.filter(c =>
      (c.name && c.name.toLowerCase().includes(s)) ||
      (c.email && c.email.toLowerCase().includes(s)) ||
      (c.custNo && c.custNo.toLowerCase().includes(s)) ||
      (c.city && c.city.toLowerCase().includes(s)) ||
      (c.phone && c.phone.toLowerCase().includes(s)) ||
      (c.status && c.status.toLowerCase().includes(s))
    );
  }

  const total = list.length;
  // Render pagination into dedicated container
  const paginationEl = document.getElementById("paginationCustomers");
  if (paginationEl) {
    const totalPages = Math.max(1, Math.ceil(total / cfg.pageSize));
    if (cfg.page > totalPages) cfg.page = totalPages;
    const start = (cfg.page - 1) * cfg.pageSize + 1;
    const end = Math.min(cfg.page * cfg.pageSize, total);
    let html = `<span style="font-size:12px;color:var(--admin-muted);margin-right:8px;">${total === 0 ? "0" : start}–${end} of ${total}</span>`;
    for (let p = 1; p <= totalPages; p++) {
      html += `<button type="button" class="page-btn${p === cfg.page ? " active" : ""}" data-page-customers="${p}">${p}</button>`;
    }
    paginationEl.innerHTML = html;
  }

  const start = (cfg.page - 1) * cfg.pageSize;
  const paginated = list.slice(start, start + cfg.pageSize);

  if (paginated.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--admin-muted);padding:24px;">${cfg.search ? "No matching customers found." : "No customers yet. Approved applications auto-create customer profiles, or add one manually."}</td></tr>`;
    return;
  }

  tbody.innerHTML = paginated.map(c => `
    <tr>
      <td style="font-weight:650;color:var(--admin-primary);">${c.custNo}</td>
      <td style="font-weight:600;">${c.name}</td>
      <td>${c.email}</td>
      <td>${c.phone || "—"}</td>
      <td>${c.city || "—"}</td>
      <td><span class="badge-pill ${(c.status||"").toLowerCase() === "active" ? "confirmed" : "overdue"}">${c.status || "Active"}</span></td>
      <td>
        <div class="table-actions-cell">
          <button type="button" class="btn-xs btn-xs-primary" data-action="edit-customer" data-custno="${c.custNo}">Edit</button>
          <button type="button" class="btn-xs btn-xs-danger" data-action="delete-customer" data-custno="${c.custNo}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

// RENDER: NOTIFICATIONS
function renderNotifications() {
  const tbody = document.querySelector('[data-tbody="notifications_list"]');
  if (!tbody) return;
  if (!Array.isArray(APP_STATE.notifications) || APP_STATE.notifications.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--admin-muted); padding: 18px;">No notifications yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = APP_STATE.notifications.map((n, index) => `
    <tr>
      <td style="font-weight: 600;">${n.target}</td>
      <td><span class="badge-pill sent">${n.channel}</span></td>
      <td>${n.topic}</td>
      <td style="color: var(--admin-muted);">${n.scheduled}</td>
      <td>${n.attempts}</td>
      <td><span class="badge-pill confirmed">${n.status}</span></td>
      <td>
        <div class="table-actions-cell">
          <button type="button" class="btn-xs btn-xs-danger" data-action="delete-notification" data-index="${index}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

// RENDER: APPLICATIONS
function renderApplications() {
  const bTbody = document.querySelector('[data-tbody="booking_requests"]');
  if (bTbody) {
    const cfg = PAGINATION.booking_requests;
    let list = APP_STATE.booking_requests || [];
    if (cfg.search) {
      const s = cfg.search.toLowerCase();
      list = list.filter(r =>
        (r.name && r.name.toLowerCase().includes(s)) ||
        (r.reference && r.reference.toLowerCase().includes(s)) ||
        (r.email && r.email.toLowerCase().includes(s)) ||
        (r.phone && r.phone.toLowerCase().includes(s)) ||
        (r.program && r.program.toLowerCase().includes(s))
      );
    }
    const total = list.length;
    renderPaginationBar("booking_requests", total);

    const start = (cfg.page - 1) * cfg.pageSize;
    const paginated = list.slice(start, start + cfg.pageSize);

    if (paginated.length === 0) {
      bTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--admin-muted); padding: 18px;">${cfg.search ? 'No matching bookings found.' : 'No online booking requests yet. Submissions from booking.html will appear here automatically.'}</td></tr>`;
    } else {
      bTbody.innerHTML = paginated.map(req => {
        const isPending = (req.status || "").toLowerCase() === "pending";
        return `
          <tr>
            <td style="font-weight: 700; color: var(--admin-primary);">${req.reference}</td>
            <td style="font-weight: 600;">${req.name}</td>
            <td>${req.email || "—"}</td>
            <td>${req.phone || "—"}</td>
            <td>${req.program || "English Course"}</td>
            <td>${req.preferredDate || ""} ${req.preferredTime || ""}</td>
            <td><span class="badge-pill ${isPending ? 'pending' : 'confirmed'}">${req.status}</span></td>
            <td>
              <div class="table-actions-cell">
                ${isPending ? `<button type="button" class="btn-xs btn-xs-success" data-action="approve-booking" data-ref="${req.reference}">Approve to Kronos</button>` : ''}
                <button type="button" class="btn-xs btn-xs-danger" data-action="delete-booking" data-ref="${req.reference}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  const sTbody = document.querySelector('[data-tbody="student_applications"]');
  if (sTbody) {
    const cfg = PAGINATION.student_applications;
    let list = APP_STATE.student_applications || [];
    if (cfg.search) {
      const s = cfg.search.toLowerCase();
      list = list.filter(app =>
        (app.name && app.name.toLowerCase().includes(s)) ||
        (app.email && app.email.toLowerCase().includes(s)) ||
        (app.phone && app.phone.toLowerCase().includes(s)) ||
        (app.program && app.program.toLowerCase().includes(s)) ||
        (app.level && app.level.toLowerCase().includes(s)) ||
        (app.status && app.status.toLowerCase().includes(s))
      );
    }
    const total = list.length;
    renderPaginationBar("student_applications", total);

    const start = (cfg.page - 1) * cfg.pageSize;
    const paginated = list.slice(start, start + cfg.pageSize);

    if (paginated.length === 0) {
      sTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--admin-muted); padding: 18px;">${cfg.search ? 'No matching applications found.' : 'No student applications received yet. Submissions from apply.html will appear here.'}</td></tr>`;
    } else {
      sTbody.innerHTML = paginated.map(app => {
        const isApproved = (app.status || "").toLowerCase() === "approved";
        const isDenied = (app.status || "").toLowerCase() === "denied" || (app.status || "").toLowerCase() === "rejected";
        return `
          <tr>
            <td style="font-weight: 600;">${app.name}</td>
            <td>${app.email || "—"}</td>
            <td>${app.phone || "—"}</td>
            <td>${app.program}</td>
            <td><span class="badge-pill sent">${app.level}</span></td>
            <td><span class="badge-pill ${isApproved ? 'confirmed' : (isDenied ? 'overdue' : 'pending')}">${app.status}</span></td>
            <td style="color: var(--admin-muted);">${app.submitted}</td>
            <td>
              <div class="table-actions-cell">
                ${!isApproved ? `<button type="button" class="btn-xs btn-xs-success" data-action="approve-student-app" data-id="${app.id}">Approve & Transfer to Kronos</button>` : `<span class="badge-pill confirmed" style="font-size: 11px;">In Kronos</span>`}
                ${!isDenied ? `<button type="button" class="btn-xs btn-xs-danger" data-action="deny-student-app" data-id="${app.id}">Deny</button>` : ''}
                <button type="button" class="btn-xs btn-xs-danger" data-action="delete-student-app" data-id="${app.id}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  const tTbody = document.querySelector('[data-tbody="teacher_applications"]');
  if (tTbody) {
    const cfg = PAGINATION.teacher_applications;
    let list = APP_STATE.teacher_applications || [];
    if (cfg.search) {
      const s = cfg.search.toLowerCase();
      list = list.filter(app =>
        (app.name && app.name.toLowerCase().includes(s)) ||
        (app.email && app.email.toLowerCase().includes(s)) ||
        (app.phone && app.phone.toLowerCase().includes(s)) ||
        (app.country && app.country.toLowerCase().includes(s)) ||
        (app.spec && app.spec.toLowerCase().includes(s)) ||
        (app.status && app.status.toLowerCase().includes(s))
      );
    }
    const total = list.length;
    renderPaginationBar("teacher_applications", total);

    const start = (cfg.page - 1) * cfg.pageSize;
    const paginated = list.slice(start, start + cfg.pageSize);

    if (paginated.length === 0) {
      tTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--admin-muted); padding: 18px;">${cfg.search ? 'No matching teachers found.' : 'No teacher applications received yet. Submissions from teacher-apply.html will appear here.'}</td></tr>`;
    } else {
      tTbody.innerHTML = paginated.map(app => {
        const isApproved = (app.status || "").toLowerCase() === "approved";
        const isDenied = (app.status || "").toLowerCase() === "denied" || (app.status || "").toLowerCase() === "rejected";
        return `
          <tr>
            <td style="font-weight: 600;">${app.name}</td>
            <td>${app.email || "—"}</td>
            <td>${app.phone || "—"}</td>
            <td>${app.country || "—"}</td>
            <td>${app.spec}</td>
            <td><span class="badge-pill ${isApproved ? 'confirmed' : (isDenied ? 'overdue' : 'pending')}">${app.status}</span></td>
            <td style="color: var(--admin-muted);">${app.submitted}</td>
            <td>
              <div class="table-actions-cell">
                ${!isApproved ? `<button type="button" class="btn-xs btn-xs-success" data-action="approve-teacher-app" data-id="${app.id}">Approve</button>` : ''}
                ${!isDenied ? `<button type="button" class="btn-xs btn-xs-danger" data-action="deny-teacher-app" data-id="${app.id}">Deny</button>` : ''}
                <button type="button" class="btn-xs btn-xs-danger" data-action="delete-teacher-app" data-id="${app.id}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }
  }
}

// RENDER: CLASS SLOTS
function renderClassSlots() {
  const tbody = document.querySelector('[data-tbody="class_slots"]');
  if (!tbody) return;
  if (!Array.isArray(APP_STATE.class_slots) || APP_STATE.class_slots.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--admin-muted); padding: 18px;">No class slots configured yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = APP_STATE.class_slots.map(slot => `
    <tr>
      <td style="font-weight: 600;">${slot.program}</td>
      <td>${slot.starts}</td>
      <td>${slot.ends}</td>
      <td>${slot.capacity}</td>
      <td><span class="badge-pill ${slot.status === 'Active' ? 'confirmed' : 'overdue'}">${slot.status}</span></td>
      <td>
        <div class="table-actions-cell">
          <button type="button" class="btn-xs btn-xs-primary" data-action="edit-class-slot" data-id="${slot.id}">Edit</button>
          <button type="button" class="btn-xs btn-xs-danger" data-action="delete-class-slot" data-id="${slot.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function deleteClassSlot(id) {
  const idx = APP_STATE.class_slots.findIndex(s => s.id === id);
  if (idx === -1) return;
  const removed = APP_STATE.class_slots.splice(idx, 1)[0];
  saveWorkspaceState();
  renderClassSlots();
  showToast(`Class slot ${removed.program} (${removed.starts}) deleted.`, "success");
}

// RENDER: NEWSLETTER
function formatNewsletterDate(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("fr-FR");
}

function renderNewsletter() {
  const tbody = document.querySelector('[data-tbody="newsletter_subscribers"]');
  if (!tbody) return;
  const cfg = PAGINATION.newsletter_subscribers;
  let list = Array.isArray(APP_STATE.newsletter_subscribers) ? APP_STATE.newsletter_subscribers : [];
  if (cfg.search) {
    const s = cfg.search.toLowerCase();
    list = list.filter(sub => (sub.email || "").toLowerCase().includes(s) || (sub.status || "").toLowerCase().includes(s));
  }
  renderPaginationBar("newsletter_subscribers", list.length);
  const start = (cfg.page - 1) * cfg.pageSize;
  const page = list.slice(start, start + cfg.pageSize);
  if (page.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--admin-muted); padding: 18px;">${cfg.search ? "No matching subscribers found." : "No newsletter subscribers yet."}</td></tr>`;
    return;
  }
  tbody.innerHTML = page.map(sub => {
    const isActive = (sub.status || "").toLowerCase() === "active";
    return `
    <tr>
      <td style="font-weight: 600;">${sub.email}</td>
      <td style="color: var(--admin-muted);">${formatNewsletterDate(sub.date)}</td>
      <td><span class="badge-pill ${isActive ? "confirmed" : "overdue"}">${sub.status || "Active"}</span></td>
      <td>
        <div class="table-actions-cell">
          <button type="button" class="btn-xs btn-xs-danger" data-action="delete-newsletter-subscriber" data-email="${sub.email}">Delete</button>
        </div>
      </td>
    </tr>`;
  }).join("");
}

function deleteNewsletterSubscriber(email) {
  const idx = (APP_STATE.newsletter_subscribers || []).findIndex(s => s.email === email);
  if (idx === -1) return;
  APP_STATE.newsletter_subscribers.splice(idx, 1);
  saveWorkspaceState();
  renderNewsletter();
  showToast(`Subscriber ${email} deleted.`, "success");
  if (supabase) {
    supabase.from("newsletter_subscribers").delete().eq("email", email)
      .then(({ error }) => { if (error) console.warn("Could not delete subscriber in Supabase:", error); });
  }
}

async function loadNewsletterFromSupabase() {
  if (!supabase) return;
  try {
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes?.user) return;
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("email,consented_at,unsubscribed_at")
      .order("consented_at", { ascending: false });
    if (error) throw error;
    const remote = (data || []).map(row => ({
      email: row.email,
      date: row.consented_at,
      status: row.unsubscribed_at ? "Unsubscribed" : "Active"
    }));
    const local = Array.isArray(APP_STATE.newsletter_subscribers) ? APP_STATE.newsletter_subscribers : [];
    const byEmail = new Map(local.map(sub => [sub.email, sub]));
    remote.forEach(sub => byEmail.set(sub.email, sub));
    APP_STATE.newsletter_subscribers = [...byEmail.values()];
    saveWorkspaceState();
    renderNewsletter();
  } catch (error) {
    console.log("Newsletter Supabase sync skipped:", error);
  }
}

async function loadSupabaseNotifications() {
  if (!supabase) return;
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id;
    if (!userId) return;
    const { data, error } = await supabase
      .from("notifications")
      .select("id,title,body,channel,delivery_status,sent_at,created_at,read_at")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    if (!data || !data.length) return;

    const existing = Array.isArray(APP_STATE.notifications) ? APP_STATE.notifications : [];
    const knownIds = new Set(existing.map(n => n.id).filter(Boolean));
    const emailFromBody = (body) => {
      const match = String(body || "").match(/^([^\s]+)\s/);
      return match ? match[1] : "Admin";
    };
    const remote = data
      .filter(row => !knownIds.has(row.id))
      .map(row => ({
        id: row.id,
        target: row.title === "New newsletter subscriber" ? emailFromBody(row.body) : "Supabase",
        channel: row.channel === "in_app" ? "In-app" : row.channel,
        topic: `${row.title}${row.body ? ` — ${row.body}` : ""}`,
        scheduled: formatNewsletterDate(row.sent_at || row.created_at),
        attempts: row.delivery_status === "sent" ? 1 : 0,
        status: row.read_at ? "Read" : "Unread"
      }));

    if (!remote.length) return;
    APP_STATE.notifications = [...remote, ...existing].slice(0, 200);
    saveWorkspaceState();
    renderNotifications();
  } catch (error) {
    console.log("Supabase notification sync skipped:", error);
  }
}

function exportNewsletterCsv() {
  const list = Array.isArray(APP_STATE.newsletter_subscribers) ? APP_STATE.newsletter_subscribers : [];
  if (!list.length) {
    showToast("No subscribers to export.", "error");
    return;
  }
  const escapeCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = [
    ["Email", "Consent Recorded", "Status"],
    ...list.map(sub => [sub.email, formatNewsletterDate(sub.date), sub.status || "Active"])
  ];
  const csv = "\uFEFF" + rows.map(row => row.map(escapeCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Subscriber list exported as CSV.", "success");
}

// Populate Arabic Invoice Modal
function populateArabicInvoiceModal(inv) {
  const modalId = document.getElementById("invModalId");
  const modalDate = document.getElementById("invModalDate");
  const modalDueDate = document.getElementById("invModalDueDate");
  const modalBalance = document.getElementById("invModalBalance");
  const modalAmountDue = document.getElementById("invModalAmountDue");
  const modalStudent = document.getElementById("invModalStudent");
  const modalProgName = document.getElementById("invModalProgName");
  const itemQty = document.getElementById("invItemQty");
  const itemRate = document.getElementById("invItemRate");
  const itemTotal = document.getElementById("invItemTotal");
  const summarySubtotal = document.getElementById("invSummarySubtotal");
  const summaryPaid = document.getElementById("invSummaryPaid");

  const todayStr = new Date().toLocaleDateString('fr-FR');
  if (modalId) modalId.textContent = inv.id;
  if (modalDate) modalDate.textContent = todayStr;
  if (modalDueDate) modalDueDate.textContent = inv.due || "25/11/2026";
  if (modalBalance) modalBalance.textContent = (inv.status === 'Paid') ? "0,00 MAD" : `${inv.mad},00 MAD`;
  if (modalAmountDue) modalAmountDue.textContent = `${inv.mad},00`;
  if (modalStudent) modalStudent.textContent = inv.name;
  if (modalProgName) modalProgName.textContent = `دورة اللغة الإنجليزية (${inv.program})`;

  const sessions = 8;
  const rate = (inv.mad / sessions).toFixed(2).replace(/\./g, ",");
  if (itemQty) itemQty.textContent = sessions;
  if (itemRate) itemRate.textContent = rate;
  if (itemTotal) itemTotal.textContent = `${inv.mad},00`;
  if (summarySubtotal) summarySubtotal.textContent = `${inv.mad},00`;
  if (summaryPaid) summaryPaid.textContent = (inv.status === 'Paid') ? `${inv.mad},00` : `0,00`;
}

// SETUP ALL EVENT LISTENERS
function setupEvents() {
  // Navigation Tabs
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      switchView(btn.dataset.navTarget);
    });
  });

  // Real-time table search inputs
  document.querySelectorAll("[data-search-table]").forEach(input => {
    input.addEventListener("input", (e) => {
      const tableKey = e.target.dataset.searchTable;
      if (PAGINATION[tableKey]) {
        PAGINATION[tableKey].search = e.target.value.trim();
        PAGINATION[tableKey].page = 1;
        if (tableKey === "era_invoices") renderEra();
        else if (tableKey === "newsletter_subscribers") renderNewsletter();
        else renderApplications();
      }
    });
  });

  // Sample data toggle: load on first click, remove only sample rows on second click.
  sampleToggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      if (hasSampleData()) {
        const removeSamples = confirm("Remove sample data and keep your own entries?");
        if (!removeSamples) return;
        clearSampleData();
        saveWorkspaceState();
        syncSampleToggleButtons();
        renderCurrentView();
        showToast("Sample data removed. Your own entries were kept.", "success");
        return;
      }

      loadSampleData();
      saveWorkspaceState();
      syncSampleToggleButtons();
      renderCurrentView();
      showToast("Sample data loaded across the workspace.", "success");
    });
  });

  // Global Delegated Click Handler for all dynamic Action Buttons
  document.addEventListener("click", (e) => {
    // 1. Delete Session
    const btnDelSession = e.target.closest('[data-action="delete-session"]');
    if (btnDelSession) {
      e.stopPropagation();
      const id = btnDelSession.dataset.id;
      const found = findSessionAndBucket(id);
      if (found) {
        const removed = APP_STATE.kronos_week[found.bucket].splice(found.index, 1)[0];
        saveWorkspaceState();
        renderCurrentView();
        showToast(`Session for ${removed.student} (${removed.time}) deleted successfully!`, "success");
      }
      return;
    }

    // 2. Approve Session
    const btnApproveSession = e.target.closest('[data-action="approve-session"]');
    if (btnApproveSession) {
      e.stopPropagation();
      const id = btnApproveSession.dataset.id;
      const found = findSessionAndBucket(id);
      if (found) {
        found.session.status = "Confirmed";
        saveWorkspaceState();
        renderCurrentView();
        showToast(`Session for ${found.session.student} is now Confirmed!`, "success");
      }
      return;
    }

    // 3. Click Session Card to Edit
    const sessionCard = e.target.closest('[data-session-click]');
    if (sessionCard && !e.target.closest('.kronos-card-actions')) {
      const id = sessionCard.dataset.sessionClick;
      const found = findSessionAndBucket(id);
      if (found) {
        const { bucket, session } = found;
        editingSessionContext = { id, bucket };
        document.getElementById("editSessionId").value = session.id;
        document.getElementById("editSessionDay").value = bucket;
        document.getElementById("editSessionStudent").value = session.student;
        document.getElementById("editSessionProgram").value = session.program;

        const legacyReverseMap = {
          "mon": "2026-11-16",
          "tue": "2026-11-17",
          "wed": "2026-11-18",
          "thu": "2026-11-19",
          "fri": "2026-11-20",
          "sat": "2026-11-21",
          "sun": "2026-11-22"
        };
        const editDateInput = document.getElementById("editSessionDate");
        if (editDateInput) {
          editDateInput.value = session.date || legacyReverseMap[bucket] || bucket;
        }

        document.getElementById("editSessionTime").value = session.time;
        document.getElementById("editSessionStatus").value = session.status;
        openModal("modalEditSession");
      }
      return;
    }

    // 4. Quick Add Session to specific date
    const btnAddDate = e.target.closest('[data-add-to-date]');
    if (btnAddDate) {
      const dateVal = btnAddDate.dataset.addToDate;
      if (dateVal < TODAY_ISO) {
        showToast("Cannot book sessions on past dates. Booking is disabled.", "error");
        return;
      }
      const sessionDateInput = document.getElementById("sessionDate");
      if (sessionDateInput) {
        sessionDateInput.value = dateVal;
        sessionDateInput.min = TODAY_ISO;
      }
      openModal("modalBookSession");
      return;
    }

    // 5. Delete Invoice
    const btnDelInvoice = e.target.closest('[data-action="delete-invoice"]');
    if (btnDelInvoice) {
      e.stopPropagation();
      const id = btnDelInvoice.dataset.id;
      const idx = APP_STATE.era_invoices.findIndex(i => i.id === id);
      if (idx !== -1) {
        APP_STATE.era_invoices.splice(idx, 1);
        if (selectedEraInvoice && selectedEraInvoice.id === id) {
          selectedEraInvoice = APP_STATE.era_invoices[0] || null;
        }
        saveWorkspaceState();
        renderCurrentView();
        showToast(`Invoice ${id} has been deleted.`, "success");
      }
      return;
    }

    // 6. Pay Invoice
    const btnPayInvoice = e.target.closest('[data-action="pay-invoice"]');
    if (btnPayInvoice) {
      e.stopPropagation();
      const id = btnPayInvoice.dataset.id;
      const inv = APP_STATE.era_invoices.find(i => i.id === id);
      if (inv) {
        inv.status = "Paid";
        inv.statusClass = "paid";
        inv.reminders = inv.reminders || [];
        inv.reminders.unshift(`Payment of MAD ${inv.mad} received on ${new Date().toLocaleDateString('fr-FR')}`);
        saveWorkspaceState();
        renderCurrentView();
        showToast(`Invoice ${id} marked as Paid!`, "success");
      }
      return;
    }

    // 7. Select Invoice Row
    const invoiceRow = e.target.closest('[data-invoice-id]');
    if (invoiceRow && !e.target.closest('.table-actions-cell')) {
      const id = invoiceRow.dataset.invoiceId;
      selectedEraInvoice = APP_STATE.era_invoices.find(i => i.id === id) || null;
      renderEra();
      return;
    }

    // 8. View / Edit Arabic Invoice
    const btnViewAr = e.target.closest('[data-action="view-arabic-invoice"]');
    if (btnViewAr) {
      e.stopPropagation();
      const id = btnViewAr.dataset.id;
      const inv = APP_STATE.era_invoices.find(i => i.id === id);
      if (inv) {
        selectedEraInvoice = inv;
        populateArabicInvoiceModal(inv);
        openModal("modalArabicInvoice");
      }
      return;
    }

    // 9. Select Lesson Row
    const lessonRow = e.target.closest('[data-lesson-id]');
    if (lessonRow && !e.target.closest('.table-actions-cell')) {
      const id = lessonRow.dataset.lessonId;
      selectedGeniusLesson = APP_STATE.genius_lessons.find(l => l.id === id) || null;
      renderGenius();
      return;
    }

    // 10. Delete Lesson
    const btnDelLesson = e.target.closest('[data-action="delete-lesson"]');
    if (btnDelLesson) {
      e.stopPropagation();
      const id = btnDelLesson.dataset.id;
      const idx = APP_STATE.genius_lessons.findIndex(l => l.id === id);
      if (idx !== -1) {
        const removed = APP_STATE.genius_lessons.splice(idx, 1)[0];
        if (selectedGeniusLesson && selectedGeniusLesson.id === id) {
          selectedGeniusLesson = APP_STATE.genius_lessons[0] || null;
        }
        saveWorkspaceState();
        renderCurrentView();
        showToast(`Lesson "${removed.title}" deleted.`, "success");
      }
      return;
    }

    // 11. Modal open buttons (data-modal-open)
    const btnModalOpen = e.target.closest('[data-modal-open]');
    if (btnModalOpen) {
      const modalTarget = btnModalOpen.dataset.modalOpen;
      if (modalTarget === "book_session") openModal("modalBookSession");
      if (modalTarget === "new_lesson") openModal("modalNewLesson");
      if (modalTarget === "new_invoice") openModal("modalNewInvoice");
      if (modalTarget === "new_customer") {
        document.getElementById("modalCustomerTitle").textContent = "Add Customer";
        document.getElementById("editCustomerCustNo").value = "";
        document.getElementById("formCustomer").reset();
        document.getElementById("custStatus").value = "Active";
        const delBtn = document.getElementById("btnDeleteCustomerModal");
        if (delBtn) delBtn.style.display = "none";
        openModal("modalCustomer");
      }
      if (modalTarget === "new_class_slot") {
        document.getElementById("modalClassSlotTitle").textContent = "Add Class Slot";
        document.getElementById("editClassSlotId").value = "";
        document.getElementById("formClassSlot").reset();
        document.getElementById("classSlotStatus").value = "Active";
        document.getElementById("btnClassSlotSubmit").textContent = "Add Slot";
        document.getElementById("btnDeleteClassSlotModal").style.display = "none";
        openModal("modalClassSlot");
      }
      if (modalTarget === "new_newsletter_subscriber") {
        document.getElementById("modalNewsletterSubscriberTitle").textContent = "Add Subscriber";
        document.getElementById("formNewsletterSubscriber").reset();
        openModal("modalNewsletterSubscriber");
      }
      return;
    }

    // 12. Modal close buttons
    const btnModalClose = e.target.closest('[data-modal-close]');
    if (btnModalClose) {
      btnModalClose.closest('.admin-modal-backdrop').hidden = true;
      return;
    }

    // 14. Approve Booking Request
    const btnApproveBooking = e.target.closest('[data-action="approve-booking"]');
    if (btnApproveBooking) {
      e.stopPropagation();
      const ref = btnApproveBooking.dataset.ref;
      const req = (APP_STATE.booking_requests || []).find(r => r.reference === ref);
      if (req) {
        req.status = "Confirmed";
        Object.keys(APP_STATE.kronos_week).forEach(day => {
          (APP_STATE.kronos_week[day] || []).forEach(sess => {
            if (sess.reference === ref) sess.status = "Confirmed";
          });
        });

        // Admin-side notice for the approval.
        APP_STATE.notifications = APP_STATE.notifications || [];
        APP_STATE.notifications.unshift({
          target: req.name,
          channel: "Booking Approved",
          topic: `Booking Confirmed: ${req.program || "Program"} (${ref})`,
          scheduled: "Immediate",
          attempts: 1,
          status: "Sent"
        });

        // Update the queued student notice so it reads as approved on their dashboard.
        try {
          const studentKey = "splus_student_notifications_v1";
          const studentNotifications = JSON.parse(localStorage.getItem(studentKey) || "[]");
          if (Array.isArray(studentNotifications)) {
            const email = (req.email || "").trim().toLowerCase();
            studentNotifications.forEach(item => {
              if (item.reference === ref || (email && (item.email || "").trim().toLowerCase() === email)) {
                item.title = "Booking confirmed";
                item.body = `Your ${req.program || "program"} booking has been confirmed. Reference: ${ref}.`;
                item.status = "approved";
                item.read_at = null;
              }
            });
            localStorage.setItem(studentKey, JSON.stringify(studentNotifications.slice(0, 100)));
          }
        } catch (e) {
          console.warn("Could not update local student notification:", e);
        }

        // Best-effort Supabase sync: mark request accepted and notify the student in-app.
        if (supabase) {
          supabase.from("booking_requests").update({ status: "accepted" }).eq("reference", ref)
            .then(({ error }) => { if (error) console.warn("Could not sync booking approval:", error); });
          const email = (req.email || "").trim().toLowerCase();
          if (email) {
            supabase.from("profiles").select("id,preferred_locale").eq("email", email).maybeSingle()
              .then(({ data: student }) => {
                if (!student) return;
                return supabase.from("notifications").insert({
                  recipient_id: student.id,
                  channel: "in_app",
                  delivery_status: "sent",
                  locale: student.preferred_locale || "en",
                  title: "Booking confirmed",
                  body: `Your ${req.program || "program"} booking has been confirmed. Reference: ${ref}.`,
                  sent_at: new Date().toISOString()
                }).then(({ error }) => { if (error) console.warn("Could not create approval notification:", error); });
              })
              .catch(err => console.warn("Could not look up student for approval notice:", err));
          }
        }

        saveWorkspaceState();
        renderCurrentView();
        showToast(`Booking ${ref} for ${req.name} approved & confirmed in Kronos!`, "success");
      }
      return;
    }

    // 15. Delete Booking Request
    const btnDeleteBooking = e.target.closest('[data-action="delete-booking"]');
    if (btnDeleteBooking) {
      e.stopPropagation();
      const ref = btnDeleteBooking.dataset.ref;
      if (APP_STATE.booking_requests) {
        const idx = APP_STATE.booking_requests.findIndex(r => r.reference === ref);
        if (idx !== -1) {
          APP_STATE.booking_requests.splice(idx, 1);
          Object.keys(APP_STATE.kronos_week).forEach(day => {
            APP_STATE.kronos_week[day] = (APP_STATE.kronos_week[day] || []).filter(s => s.reference !== ref);
          });
          saveWorkspaceState();
          renderCurrentView();
          showToast(`Booking request ${ref} removed.`, "success");
        }
      }
      return;
    }

    // Pagination Next / Prev controls
    const btnPage = e.target.closest('[data-page-action]');
    if (btnPage) {
      e.stopPropagation();
      const action = btnPage.dataset.pageAction;
      const table = btnPage.dataset.table;
      if (PAGINATION[table]) {
        if (action === "prev" && PAGINATION[table].page > 1) {
          PAGINATION[table].page--;
        } else if (action === "next") {
          PAGINATION[table].page++;
        }
        if (table === "era_invoices") renderEra();
        else renderApplications();
      }
      return;
    }

    // 16. Approve Student Application -> Automatically transfer to Kronos & Customers
    const btnApproveApp = e.target.closest('[data-action="approve-student-app"]');
    if (btnApproveApp) {
      e.stopPropagation();
      const id = btnApproveApp.dataset.id;
      const app = (APP_STATE.student_applications || []).find(a => a.id === id);
      if (app) {
        app.status = "Approved";

        // Determine schedule day from preferredSchedule
        let targetDay = "tue";
        const schedLower = (app.schedule || "").toLowerCase();
        if (schedLower.includes("mon")) targetDay = "mon";
        else if (schedLower.includes("wed")) targetDay = "wed";
        else if (schedLower.includes("thu")) targetDay = "thu";
        else if (schedLower.includes("fri")) targetDay = "fri";

        // Create confirmed session in Kronos
        const newSession = {
          id: `sess-app-${Date.now()}`,
          time: "14:00",
          student: app.name,
          program: app.program || "English Program",
          teacher: "Chihab",
          status: "Confirmed",
          reference: `APP-${Date.now().toString().slice(-4)}`,
          phone: app.phone || "",
          email: app.email || ""
        };

        APP_STATE.kronos_week[targetDay] = APP_STATE.kronos_week[targetDay] || [];
        APP_STATE.kronos_week[targetDay].push(newSession);

        // Add to Customers list
        const custNo = `C-0000${Math.floor(30 + Math.random() * 50)}`;
        APP_STATE.customers.unshift({
          custNo: custNo,
          name: app.name,
          email: app.email,
          phone: app.phone,
          city: "Casablanca",
          status: "Active"
        });

        // Add to Era Invoices
        const newInvId = `INV-00${Math.floor(50 + Math.random() * 50)}`;
        APP_STATE.era_invoices.unshift({
          id: newInvId,
          custNo: custNo,
          name: app.name,
          program: app.program || "English Program",
          mad: 800,
          due: "25 Nov",
          status: "Sent",
          statusClass: "sent",
          address: "Casablanca, Morocco",
          phone: app.phone || "+212 600 000 000",
          email: app.email || "student@example.com",
          reminders: ["Enrollment invoice generated upon approval"]
        });

        saveWorkspaceState();
        renderCurrentView();
        showToast(`Application for ${app.name} approved! Transferred to Kronos schedule and Customers.`, "success");
      }
      return;
    }

    // 17. Deny Student Application
    const btnDenyApp = e.target.closest('[data-action="deny-student-app"]');
    if (btnDenyApp) {
      e.stopPropagation();
      const id = btnDenyApp.dataset.id;
      const app = (APP_STATE.student_applications || []).find(a => a.id === id);
      if (app) {
        app.status = "Denied";
        saveWorkspaceState();
        renderCurrentView();
        showToast(`Application for ${app.name} marked as Denied.`, "success");
      }
      return;
    }

    // 18. Delete Student Application
    const btnDeleteApp = e.target.closest('[data-action="delete-student-app"]');
    if (btnDeleteApp) {
      e.stopPropagation();
      const id = btnDeleteApp.dataset.id;
      if (APP_STATE.student_applications) {
        const idx = APP_STATE.student_applications.findIndex(a => a.id === id);
        if (idx !== -1) {
          const removed = APP_STATE.student_applications.splice(idx, 1)[0];
          saveWorkspaceState();
          renderCurrentView();
          showToast(`Application for ${removed.name} removed.`, "success");
        }
      }
      return;
    }

    // 19. Teacher Application Actions (Approve / Deny / Delete)
    const btnApproveTeach = e.target.closest('[data-action="approve-teacher-app"]');
    if (btnApproveTeach) {
      e.stopPropagation();
      const id = btnApproveTeach.dataset.id;
      const app = (APP_STATE.teacher_applications || []).find(a => a.id === id);
      if (app) {
        app.status = "Approved";
        saveWorkspaceState();
        renderCurrentView();
        showToast(`Teacher application for ${app.name} approved!`, "success");
      }
      return;
    }

    const btnDenyTeach = e.target.closest('[data-action="deny-teacher-app"]');
    if (btnDenyTeach) {
      e.stopPropagation();
      const id = btnDenyTeach.dataset.id;
      const app = (APP_STATE.teacher_applications || []).find(a => a.id === id);
      if (app) {
        app.status = "Denied";
        saveWorkspaceState();
        renderCurrentView();
        showToast(`Teacher application for ${app.name} marked as Denied.`, "success");
      }
      return;
    }

    const btnDeleteTeach = e.target.closest('[data-action="delete-teacher-app"]');
    if (btnDeleteTeach) {
      e.stopPropagation();
      const id = btnDeleteTeach.dataset.id;
      if (APP_STATE.teacher_applications) {
        const idx = APP_STATE.teacher_applications.findIndex(a => a.id === id);
        if (idx !== -1) {
          const removed = APP_STATE.teacher_applications.splice(idx, 1)[0];
          saveWorkspaceState();
          renderCurrentView();
          showToast(`Teacher application for ${removed.name} deleted.`, "success");
        }
      }
      return;
    }

    // 13. Click backdrop to close
    if (e.target.classList.contains('admin-modal-backdrop')) {
      e.target.hidden = true;
    }

    // 20. Customer pagination
    const pageCustomerBtn = e.target.closest('[data-page-customers]');
    if (pageCustomerBtn) {
      PAGINATION.customers.page = parseInt(pageCustomerBtn.dataset.pageCustomers, 10);
      renderCustomers();
      return;
    }

    // 21. Edit Customer
    const btnEditCustomer = e.target.closest('[data-action="edit-customer"]');
    if (btnEditCustomer) {
      e.stopPropagation();
      const custNo = btnEditCustomer.dataset.custno;
      const c = (APP_STATE.customers || []).find(x => x.custNo === custNo);
      if (c) {
        document.getElementById("modalCustomerTitle").textContent = "Edit Customer";
        document.getElementById("editCustomerCustNo").value = custNo;
        document.getElementById("custName").value = c.name || "";
        document.getElementById("custEmail").value = c.email || "";
        document.getElementById("custPhone").value = c.phone || "";
        document.getElementById("custCity").value = c.city || "";
        document.getElementById("custStatus").value = c.status || "Active";
        const delBtn = document.getElementById("btnDeleteCustomerModal");
        if (delBtn) delBtn.style.display = "";
        openModal("modalCustomer");
      }
      return;
    }

    // 22. Delete Customer (table button)
    const btnDeleteCustomer = e.target.closest('[data-action="delete-customer"]');
    if (btnDeleteCustomer) {
      e.stopPropagation();
      const custNo = btnDeleteCustomer.dataset.custno;
      const idx = (APP_STATE.customers || []).findIndex(x => x.custNo === custNo);
      if (idx !== -1) {
        const removed = APP_STATE.customers.splice(idx, 1)[0];
        saveWorkspaceState();
        renderCustomers();
        showToast(`Customer ${removed.name} (${removed.custNo}) deleted.`, "success");
      }
      return;
    }

    // 23. Edit Class Slot
    const btnEditClassSlot = e.target.closest('[data-action="edit-class-slot"]');
    if (btnEditClassSlot) {
      e.stopPropagation();
      const slot = APP_STATE.class_slots.find(s => s.id === btnEditClassSlot.dataset.id);
      if (slot) {
        document.getElementById("modalClassSlotTitle").textContent = "Edit Class Slot";
        document.getElementById("editClassSlotId").value = slot.id;
        document.getElementById("classSlotProgram").value = slot.program || "";
        document.getElementById("classSlotStarts").value = slot.starts || "";
        document.getElementById("classSlotEnds").value = slot.ends || "";
        document.getElementById("classSlotCapacity").value = slot.capacity || "";
        document.getElementById("classSlotStatus").value = slot.status === "Full" ? "Full" : "Active";
        document.getElementById("btnClassSlotSubmit").textContent = "Save Changes";
        document.getElementById("btnDeleteClassSlotModal").style.display = "";
        openModal("modalClassSlot");
      }
      return;
    }

    // 24. Delete Class Slot (table button)
    const btnDeleteClassSlot = e.target.closest('[data-action="delete-class-slot"]');
    if (btnDeleteClassSlot) {
      e.stopPropagation();
      const slot = APP_STATE.class_slots.find(s => s.id === btnDeleteClassSlot.dataset.id);
      if (slot && confirm(`Delete class slot "${slot.program}" at ${slot.starts}?`)) {
        deleteClassSlot(slot.id);
      }
      return;
    }

    // 25. Delete Notification
    const btnDeleteNotification = e.target.closest('[data-action="delete-notification"]');
    if (btnDeleteNotification) {
      e.stopPropagation();
      const index = Number(btnDeleteNotification.dataset.index);
      const notification = (APP_STATE.notifications || [])[index];
      if (notification && confirm(`Delete notification: ${notification.topic}?`)) {
        APP_STATE.notifications.splice(index, 1);
        saveWorkspaceState();
        renderNotifications();
        showToast("Notification deleted.", "success");
        if (notification.id && supabase) {
          supabase.from("notifications").delete().eq("id", notification.id)
            .then(({ error }) => { if (error) console.warn("Could not delete notification in Supabase:", error); });
        }
      }
      return;
    }

    // 26. Export newsletter subscribers as CSV
    const btnExportNewsletter = e.target.closest('[data-action="export-newsletter-csv"]');
    if (btnExportNewsletter) {
      e.stopPropagation();
      exportNewsletterCsv();
      return;
    }

    // 27. Delete newsletter subscriber
    const btnDeleteNewsletter = e.target.closest('[data-action="delete-newsletter-subscriber"]');
    if (btnDeleteNewsletter) {
      e.stopPropagation();
      const email = btnDeleteNewsletter.dataset.email;
      if (email && confirm(`Delete newsletter subscriber ${email}?`)) deleteNewsletterSubscriber(email);
      return;
    }
  });

  // Cross-tab real-time sync for online bookings and applications
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      APP_STATE = loadWorkspaceState();
      renderCurrentView();
    }
  });
  window.addEventListener("splus-data-updated", () => {
    APP_STATE = loadWorkspaceState();
    renderCurrentView();
  });

  // Customer Card Actions in Era
  const btnDeleteInvoiceCard = document.getElementById("btnDeleteInvoice");
  if (btnDeleteInvoiceCard) {
    btnDeleteInvoiceCard.addEventListener("click", () => {
      if (!selectedEraInvoice) return;
      const id = selectedEraInvoice.id;
      const idx = APP_STATE.era_invoices.findIndex(i => i.id === id);
      if (idx !== -1) {
        APP_STATE.era_invoices.splice(idx, 1);
        selectedEraInvoice = APP_STATE.era_invoices[0] || null;
        saveWorkspaceState();
        renderCurrentView();
        showToast(`Invoice ${id} has been deleted.`, "success");
      }
    });
  }

  const btnRecordPaymentCard = document.getElementById("btnRecordPayment");
  if (btnRecordPaymentCard) {
    btnRecordPaymentCard.addEventListener("click", () => {
      if (!selectedEraInvoice) return;
      selectedEraInvoice.status = "Paid";
      selectedEraInvoice.statusClass = "paid";
      selectedEraInvoice.reminders = selectedEraInvoice.reminders || [];
      selectedEraInvoice.reminders.unshift(`Payment of MAD ${selectedEraInvoice.mad} recorded on ${new Date().toLocaleDateString('fr-FR')}`);
      saveWorkspaceState();
      renderCurrentView();
      showToast(`Payment recorded for invoice ${selectedEraInvoice.id}.`, "success");
    });
  }

  const btnSendReminderCard = document.getElementById("btnSendReminder");
  if (btnSendReminderCard) {
    btnSendReminderCard.addEventListener("click", () => {
      if (!selectedEraInvoice) return;
      selectedEraInvoice.reminders = selectedEraInvoice.reminders || [];
      selectedEraInvoice.reminders.unshift(`Reminder sent today to ${selectedEraInvoice.email}`);
      updateEraCustomerCard();
      saveWorkspaceState();
      showToast(`Reminder dispatched to ${selectedEraInvoice.name} (${selectedEraInvoice.email}).`, "success");
    });
  }

  const btnViewArabicInvoiceCard = document.getElementById("btnViewArabicInvoice");
  if (btnViewArabicInvoiceCard) {
    btnViewArabicInvoiceCard.addEventListener("click", () => {
      if (!selectedEraInvoice) return;
      populateArabicInvoiceModal(selectedEraInvoice);
      openModal("modalArabicInvoice");
    });
  }

  // Save Edits from Arabic Invoice back to Era State
  const btnSaveArabicInvoice = document.getElementById("btnSaveArabicInvoice");
  if (btnSaveArabicInvoice) {
    btnSaveArabicInvoice.addEventListener("click", () => {
      if (!selectedEraInvoice) return;
      const newStudent = document.getElementById("invModalStudent")?.textContent.trim();
      const newAmountRaw = document.getElementById("invItemTotal")?.textContent.replace(/[^0-9]/g, '');
      const newDue = document.getElementById("invModalDueDate")?.textContent.trim();

      if (newStudent) selectedEraInvoice.name = newStudent;
      if (newAmountRaw) selectedEraInvoice.mad = Number(newAmountRaw) || selectedEraInvoice.mad;
      if (newDue) selectedEraInvoice.due = newDue;

      saveWorkspaceState();
      renderCurrentView();
      closeModal("modalArabicInvoice");
      showToast(`Changes saved directly to invoice ${selectedEraInvoice.id}!`, "success");
    });
  }

  // Recalculate Arabic Invoice fields live on edit
  const itemQty = document.getElementById("invItemQty");
  const itemRate = document.getElementById("invItemRate");
  const itemTotal = document.getElementById("invItemTotal");
  const amountDue = document.getElementById("invModalAmountDue");
  const summarySubtotal = document.getElementById("invSummarySubtotal");

  function recalcInvoice() {
    if (!itemQty || !itemRate || !itemTotal) return;
    const q = parseFloat(itemQty.textContent.replace(/,/g, ".")) || 0;
    const r = parseFloat(itemRate.textContent.replace(/,/g, ".")) || 0;
    const tot = (q * r).toFixed(2).replace(/\./g, ",");
    itemTotal.textContent = tot;
    if (amountDue) amountDue.textContent = tot;
    if (summarySubtotal) summarySubtotal.textContent = tot;
  }

  if (itemQty) itemQty.addEventListener("input", recalcInvoice);
  if (itemRate) itemRate.addEventListener("input", recalcInvoice);

  // ── CUSTOMER MODULE: Add / Edit / Delete / Search / Pagination ──

  // Search input
  const searchCustomersInput = document.getElementById("searchCustomers");
  if (searchCustomersInput) {
    searchCustomersInput.addEventListener("input", (e) => {
      PAGINATION.customers.search = e.target.value.trim();
      PAGINATION.customers.page = 1;
      renderCustomers();
    });
  }

  // Form submit (Add or Edit)
  const formCustomer = document.getElementById("formCustomer");
  if (formCustomer) {
    formCustomer.addEventListener("submit", (e) => {
      e.preventDefault();
      const editingCustNo = document.getElementById("editCustomerCustNo").value.trim();
      const name  = document.getElementById("custName").value.trim();
      const email = document.getElementById("custEmail").value.trim();
      const phone = document.getElementById("custPhone").value.trim() || "—";
      const city  = document.getElementById("custCity").value.trim() || "—";
      const status = document.getElementById("custStatus").value;

      if (editingCustNo) {
        // Edit existing
        const c = (APP_STATE.customers || []).find(x => x.custNo === editingCustNo);
        if (c) {
          c.name = name; c.email = email; c.phone = phone; c.city = city; c.status = status;
          saveWorkspaceState();
          renderCustomers();
          closeModal("modalCustomer");
          showToast(`Customer ${name} updated successfully.`, "success");
        }
      } else {
        // Add new
        const newNo = `C-${String(Date.now()).slice(-6)}`;
        APP_STATE.customers = APP_STATE.customers || [];
        APP_STATE.customers.unshift({ custNo: newNo, name, email, phone, city, status });
        saveWorkspaceState();
        renderCustomers();
        closeModal("modalCustomer");
        showToast(`Customer ${name} added (${newNo}).`, "success");
      }
    });
  }

  // Delete from modal
  const btnDeleteCustomerModal = document.getElementById("btnDeleteCustomerModal");
  if (btnDeleteCustomerModal) {
    btnDeleteCustomerModal.addEventListener("click", () => {
      const custNo = document.getElementById("editCustomerCustNo").value.trim();
      if (!custNo) return;
      const idx = (APP_STATE.customers || []).findIndex(x => x.custNo === custNo);
      if (idx !== -1) {
        const removed = APP_STATE.customers.splice(idx, 1)[0];
        saveWorkspaceState();
        renderCustomers();
        closeModal("modalCustomer");
        showToast(`Customer ${removed.name} deleted.`, "success");
      }
    });
  }

  // ── CLASS SLOTS: Edit / Delete ──
  const formClassSlot = document.getElementById("formClassSlot");
  if (formClassSlot) {
    formClassSlot.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("editClassSlotId").value;
      const program = document.getElementById("classSlotProgram").value.trim();
      const starts = document.getElementById("classSlotStarts").value;
      const ends = document.getElementById("classSlotEnds").value;
      const capacity = document.getElementById("classSlotCapacity").value.trim();
      const status = document.getElementById("classSlotStatus").value;
      const slot = id ? APP_STATE.class_slots.find(s => s.id === id) : null;

      if (slot) {
        slot.program = program;
        slot.starts = starts;
        slot.ends = ends;
        slot.capacity = capacity;
        slot.status = status;
      } else {
        APP_STATE.class_slots.unshift({
          id: `slot-${Date.now()}`,
          program,
          starts,
          ends,
          capacity,
          status
        });
      }
      saveWorkspaceState();
      renderClassSlots();
      closeModal("modalClassSlot");
      showToast(slot
        ? `Class slot ${slot.program} updated successfully.`
        : `Class slot ${program} added successfully.`, "success");
    });
  }

  const btnDeleteClassSlotModal = document.getElementById("btnDeleteClassSlotModal");
  if (btnDeleteClassSlotModal) {
    btnDeleteClassSlotModal.addEventListener("click", () => {
      const id = document.getElementById("editClassSlotId").value;
      const slot = APP_STATE.class_slots.find(s => s.id === id);
      if (!slot) return;
      if (!confirm(`Delete class slot "${slot.program}" at ${slot.starts}?`)) return;
      closeModal("modalClassSlot");
      deleteClassSlot(id);
    });
  }

  // Newsletter subscriber add form
  const formNewsletterSubscriber = document.getElementById("formNewsletterSubscriber");
  if (formNewsletterSubscriber) {
    formNewsletterSubscriber.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("newsletterSubscriberEmail").value.trim().toLowerCase();
      if (!email) return;
      APP_STATE.newsletter_subscribers = Array.isArray(APP_STATE.newsletter_subscribers) ? APP_STATE.newsletter_subscribers : [];
      const existing = APP_STATE.newsletter_subscribers.find(s => s.email === email);
      if (existing) {
        existing.date = new Date().toISOString();
        existing.status = "Active";
      } else {
        APP_STATE.newsletter_subscribers.unshift({
          email,
          date: new Date().toISOString(),
          status: "Active"
        });
      }
      saveWorkspaceState();
      renderNewsletter();
      closeModal("modalNewsletterSubscriber");
      formNewsletterSubscriber.reset();
      showToast(`Subscriber ${email} added.`, "success");

      if (supabase) {
        supabase.from("newsletter_subscribers").upsert({
          email,
          consented_at: new Date().toISOString(),
          unsubscribed_at: null
        }, { onConflict: "email" })
          .then(({ error }) => { if (error) console.warn("Could not save subscriber in Supabase:", error); });
      }
    });
  }

  // Lesson actions
  const btnPushLesson = document.getElementById("btnPushLesson");
  if (btnPushLesson) {
    btnPushLesson.addEventListener("click", () => {
      if (!selectedGeniusLesson) return;
      const student = document.getElementById("geniusStudentSelect")?.value || "Sara B.";
      showToast(`Lesson "${selectedGeniusLesson.title}" pushed to ${student}!`, "success");
    });
  }

  const btnDeleteLessonCard = document.getElementById("btnDeleteLesson");
  if (btnDeleteLessonCard) {
    btnDeleteLessonCard.addEventListener("click", () => {
      if (!selectedGeniusLesson) return;
      const id = selectedGeniusLesson.id;
      const idx = APP_STATE.genius_lessons.findIndex(l => l.id === id);
      if (idx !== -1) {
        const removed = APP_STATE.genius_lessons.splice(idx, 1)[0];
        selectedGeniusLesson = APP_STATE.genius_lessons[0] || null;
        saveWorkspaceState();
        renderCurrentView();
        showToast(`Lesson "${removed.title}" deleted.`, "success");
      }
    });
  }

  // Approve All Timesheets
  const btnApproveTimesheet = document.getElementById("btnApproveTimesheet");
  if (btnApproveTimesheet) {
    btnApproveTimesheet.addEventListener("click", () => {
      let approvedCount = 0;
      Object.keys(APP_STATE.kronos_week).forEach(day => {
        APP_STATE.kronos_week[day].forEach(s => {
          if (s.status === "Pending") {
            s.status = "Confirmed";
            approvedCount++;
          }
        });
      });
      saveWorkspaceState();
      renderCurrentView();
      showToast(`Approved ${approvedCount} pending session(s). Timesheet is fully confirmed!`, "success");
    });
  }

  // Kronos Scroll & Date Navigation Buttons
  const btnScrollLeft = document.getElementById("kronosScrollLeft");
  if (btnScrollLeft) {
    btnScrollLeft.addEventListener("click", () => {
      const container = document.getElementById("kronosScrollContainer");
      if (container) container.scrollBy({ left: -420, behavior: "smooth" });
    });
  }

  const btnScrollRight = document.getElementById("kronosScrollRight");
  if (btnScrollRight) {
    btnScrollRight.addEventListener("click", () => {
      const container = document.getElementById("kronosScrollContainer");
      if (container) container.scrollBy({ left: 420, behavior: "smooth" });
    });
  }

  const btnToday = document.getElementById("kronosTodayBtn");
  if (btnToday) {
    btnToday.addEventListener("click", () => {
      kronosAnchorDate = new Date();
      renderKronos();
      setTimeout(scrollKronosToToday, 60);
    });
  }

  const jumpInput = document.getElementById("kronosJumpDate");
  if (jumpInput) {
    jumpInput.addEventListener("change", (e) => {
      const targetDate = e.target.value;
      if (!targetDate) return;
      kronosAnchorDate = new Date(targetDate + "T12:00:00");
      renderKronos();
      setTimeout(() => {
        const col = document.querySelector(`[data-kronos-col="${targetDate}"]`);
        const container = document.getElementById("kronosScrollContainer");
        if (col && container) {
          container.scrollTo({
            left: col.offsetLeft - (container.clientWidth / 2) + (col.offsetWidth / 2),
            behavior: "smooth"
          });
          col.style.boxShadow = "0 0 0 3px var(--admin-primary)";
          setTimeout(() => { col.style.boxShadow = ""; }, 1500);
        }
      }, 80);
    });
  }

  // Submit Book Session
  const formBookSession = document.getElementById("formBookSession");
  if (formBookSession) {
    formBookSession.addEventListener("submit", (e) => {
      e.preventDefault();
      const student = document.getElementById("sessionStudentName").value.trim();
      const prog = document.getElementById("sessionProgram").value.trim();
      const dateVal = document.getElementById("sessionDate").value;
      const time = document.getElementById("sessionTime").value.trim();
      const teacher = document.getElementById("sessionTeacher").value.trim() || "Chihab";

      if (dateVal < TODAY_ISO) {
        showToast("Cannot book sessions on past dates. Booking is disabled for past dates.", "error");
        return;
      }

      const newSession = {
        id: `sess-${Date.now()}`,
        time: time,
        student: student,
        program: prog,
        teacher: teacher,
        status: "Confirmed",
        date: dateVal
      };

      APP_STATE.kronos_week[dateVal] = APP_STATE.kronos_week[dateVal] || [];
      APP_STATE.kronos_week[dateVal].push(newSession);
      saveWorkspaceState();
      renderCurrentView();
      closeModal("modalBookSession");
      formBookSession.reset();
      showToast(`Session booked for ${student} on ${dateVal} at ${time}.`, "success");
    });
  }

  // Submit Edit Session
  const formEditSession = document.getElementById("formEditSession");
  if (formEditSession) {
    formEditSession.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!editingSessionContext) return;
      const { id } = editingSessionContext;
      const newDate = document.getElementById("editSessionDate").value;
      const newStudent = document.getElementById("editSessionStudent").value.trim();
      const newProg = document.getElementById("editSessionProgram").value.trim();
      const newTime = document.getElementById("editSessionTime").value.trim();
      const newStatus = document.getElementById("editSessionStatus").value;

      const found = findSessionAndBucket(id);
      if (found) {
        APP_STATE.kronos_week[found.bucket].splice(found.index, 1);
        const session = found.session;
        session.student = newStudent;
        session.program = newProg;
        session.time = newTime;
        session.status = newStatus;
        session.date = newDate;

        APP_STATE.kronos_week[newDate] = APP_STATE.kronos_week[newDate] || [];
        APP_STATE.kronos_week[newDate].push(session);

        saveWorkspaceState();
        renderCurrentView();
        closeModal("modalEditSession");
        showToast("Session updated successfully!", "success");
      }
    });
  }

  // Modal Delete Session from Edit Dialog
  const btnModalDeleteSession = document.getElementById("btnModalDeleteSession");
  if (btnModalDeleteSession) {
    btnModalDeleteSession.addEventListener("click", () => {
      if (!editingSessionContext) return;
      const { id } = editingSessionContext;
      const found = findSessionAndBucket(id);
      if (found) {
        APP_STATE.kronos_week[found.bucket].splice(found.index, 1);
        saveWorkspaceState();
        renderCurrentView();
        closeModal("modalEditSession");
        showToast("Session deleted from schedule.", "success");
      }
    });
  }

  // Submit New Lesson
  const formNewLesson = document.getElementById("formNewLesson");
  if (formNewLesson) {
    formNewLesson.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("newLessonTitle").value.trim();
      const level = document.getElementById("newLessonLevel").value;
      const prog = document.getElementById("newLessonProgram").value.trim();
      const duration = document.getElementById("newLessonDuration").value.trim();

      const newLesson = {
        id: `les-${Date.now()}`,
        title,
        level,
        program: prog,
        duration
      };

      APP_STATE.genius_lessons.unshift(newLesson);
      selectedGeniusLesson = newLesson;
      saveWorkspaceState();
      renderCurrentView();
      closeModal("modalNewLesson");
      formNewLesson.reset();
      showToast(`Lesson "${title}" added to library.`, "success");
    });
  }

  // Submit New Invoice
  const formNewInvoice = document.getElementById("formNewInvoice");
  if (formNewInvoice) {
    formNewInvoice.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("invStudentName").value.trim();
      const program = document.getElementById("invProgram").value.trim();
      const mad = Number(document.getElementById("invAmount").value) || 500;
      const due = document.getElementById("invDueDate").value.trim();

      const newInvId = `INV-00${Math.floor(48 + Math.random() * 50)}`;
      const newCustNo = `C-0000${Math.floor(25 + Math.random() * 30)}`;

      const newInv = {
        id: newInvId,
        custNo: newCustNo,
        name: name,
        program: program,
        mad: mad,
        due: due,
        status: "Sent",
        statusClass: "sent",
        address: "Casablanca, Morocco",
        phone: "+212 600 000 000",
        email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        reminders: [`Invoice generated on ${new Date().toLocaleDateString('fr-FR')}`]
      };

      APP_STATE.era_invoices.unshift(newInv);
      selectedEraInvoice = newInv;
      saveWorkspaceState();
      renderCurrentView();
      closeModal("modalNewInvoice");
      formNewInvoice.reset();
      showToast(`Invoice ${newInvId} generated for ${name} (MAD ${mad})!`, "success");
    });
  }

  // Sign out button
  if (signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
      if (supabase) {
        await supabase.auth.signOut();
      }
      window.location.href = "admin-login.html";
    });
  }
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = false;
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

// Check Supabase Auth
async function checkSupabaseAuth() {
  if (!supabase) return;
  try {
    const { data: userRes } = await supabase.auth.getUser();
    if (userRes && userRes.user) {
      if (userEmailEl) userEmailEl.textContent = userRes.user.email;
    } else {
      if (userEmailEl) userEmailEl.textContent = "admin@splusacademy.com";
    }
  } catch (err) {
    console.log("Supabase session check:", err);
  }
}

// Initial Boot
document.addEventListener("DOMContentLoaded", () => {
  setupEvents();
  syncSampleToggleButtons();
  renderCurrentView();
  checkSupabaseAuth();
  loadNewsletterFromSupabase();
  loadSupabaseNotifications();
  setTimeout(scrollKronosToToday, 100);
});
