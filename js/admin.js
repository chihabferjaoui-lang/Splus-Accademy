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
    { name: "Fatima E.", email: "fatima@example.com", phone: "+212 670 123 456", program: "Business English", level: "B1", status: "Under Review", submitted: "15 Nov 2026" },
    { name: "Karim Z.", email: "karim@example.com", phone: "+212 661 987 654", program: "Exam Preparation", level: "B2", status: "Approved", submitted: "14 Nov 2026" },
    { name: "Nour H.", email: "nour@example.com", phone: "+212 652 334 455", program: "Day-to-Day English", level: "A2", status: "Contacted", submitted: "12 Nov 2026" }
  ],
  teacher_applications: [
    { name: "David M.", email: "david@example.com", phone: "+44 7700 900077", country: "United Kingdom", spec: "CELTA Certified / IELTS", status: "Interviewed", submitted: "10 Nov 2026" },
    { name: "Sophie L.", email: "sophie@example.com", phone: "+33 612 345 678", country: "France", spec: "Business Communication & TOEFL", status: "Under Review", submitted: "13 Nov 2026" }
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

// State Store loaded from localStorage
const STORAGE_KEY = "splus_workspace_store_v1";

function loadWorkspaceState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.kronos_week && parsed.era_invoices) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Storage parse error:", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_WORKSPACE_DATA));
}

let APP_STATE = loadWorkspaceState();

function saveWorkspaceState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(APP_STATE));
  } catch (e) {
    console.error("Save state error:", e);
  }
}

// Global Selections
let selectedGeniusLesson = APP_STATE.genius_lessons[0] || null;
let selectedEraInvoice = APP_STATE.era_invoices[0] || null;
let editingSessionContext = null;

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
  const todaySessions = APP_STATE.kronos_week["tue"] || [];
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
    const todaySessions = APP_STATE.kronos_week["tue"] || [];
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
                ${isPending ? `<button type="button" class="btn-xs btn-xs-success" data-action="approve-session" data-id="${s.id}" data-day="tue">Approve</button>` : ''}
                <button type="button" class="btn-xs btn-xs-danger" data-action="delete-session" data-id="${s.id}" data-day="tue">Delete</button>
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

// RENDER: KRONOS SCHEDULE
function renderKronos() {
  const days = ["mon", "tue", "wed", "thu", "fri"];
  let pendingCount = 0;
  let totalHours = 0;

  days.forEach(day => {
    const container = document.querySelector(`[data-kronos-day="${day}"]`);
    if (!container) return;
    const items = APP_STATE.kronos_week[day] || [];

    if (items.length === 0) {
      container.innerHTML = `<div style="font-size: 11.5px; color: #94a3b8; text-align: center; padding: 24px 0;">No sessions</div>`;
    } else {
      container.innerHTML = items.map(item => {
        const isPending = (item.status || "").toLowerCase() === "pending";
        if (isPending) pendingCount++;
        totalHours += 1;
        return `
          <div class="kronos-session-card ${isPending ? 'is-pending' : ''}" data-session-click="${item.id}" data-day="${day}">
            <div class="kronos-card-header">
              <span class="kronos-session-time">${item.time}</span>
              <span class="badge-pill ${isPending ? 'pending' : 'confirmed'}" style="font-size: 10px; padding: 2px 7px;">${item.status}</span>
            </div>
            <div class="kronos-session-info">${item.student} · ${item.program}</div>
            <div class="kronos-card-actions">
              ${isPending ? `<button type="button" class="btn-xs btn-xs-success" data-action="approve-session" data-id="${item.id}" data-day="${day}">Approve</button>` : ''}
              <button type="button" class="btn-xs btn-xs-danger" data-action="delete-session" data-id="${item.id}" data-day="${day}">Delete</button>
            </div>
          </div>
        `;
      }).join("");
    }
  });

  // Update teacher hours & pending approval indicators
  const hoursEl = document.querySelector("#btnApproveTimesheet")?.previousElementSibling?.previousElementSibling?.previousElementSibling?.previousElementSibling;
  const pendingTextEl = document.querySelector("#btnApproveTimesheet")?.previousElementSibling?.previousElementSibling?.previousElementSibling;
  if (hoursEl) hoursEl.textContent = `Chihab · ${(totalHours * 1.5).toFixed(1)} h this week`;
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

  if (APP_STATE.era_invoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--admin-muted); padding: 24px;">No invoices found. Click "New invoice" to create one.</td></tr>`;
    selectedEraInvoice = null;
    updateEraCustomerCard();
    return;
  }

  tbody.innerHTML = APP_STATE.era_invoices.map((inv) => {
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
  tbody.innerHTML = APP_STATE.customers.map(c => `
    <tr>
      <td style="font-weight: 650; color: var(--admin-primary);">${c.custNo}</td>
      <td style="font-weight: 600;">${c.name}</td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td>${c.city}</td>
      <td><span class="badge-pill confirmed">${c.status}</span></td>
    </tr>
  `).join("");
}

// RENDER: NOTIFICATIONS
function renderNotifications() {
  const tbody = document.querySelector('[data-tbody="notifications_list"]');
  if (!tbody) return;
  tbody.innerHTML = APP_STATE.notifications.map(n => `
    <tr>
      <td style="font-weight: 600;">${n.target}</td>
      <td><span class="badge-pill sent">${n.channel}</span></td>
      <td>${n.topic}</td>
      <td style="color: var(--admin-muted);">${n.scheduled}</td>
      <td>${n.attempts}</td>
      <td><span class="badge-pill confirmed">${n.status}</span></td>
    </tr>
  `).join("");
}

// RENDER: APPLICATIONS
function renderApplications() {
  const bTbody = document.querySelector('[data-tbody="booking_requests"]');
  if (bTbody) {
    const list = APP_STATE.booking_requests || [];
    if (list.length === 0) {
      bTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--admin-muted); padding: 18px;">No online booking requests yet. Submissions from booking.html will appear here automatically.</td></tr>`;
    } else {
      bTbody.innerHTML = list.map(req => {
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
    sTbody.innerHTML = APP_STATE.student_applications.map(app => `
      <tr>
        <td style="font-weight: 600;">${app.name}</td>
        <td>${app.email}</td>
        <td>${app.phone}</td>
        <td>${app.program}</td>
        <td><span class="badge-pill sent">${app.level}</span></td>
        <td><span class="badge-pill ${app.status === 'Approved' ? 'confirmed' : 'pending'}">${app.status}</span></td>
        <td style="color: var(--admin-muted);">${app.submitted}</td>
      </tr>
    `).join("");
  }

  const tTbody = document.querySelector('[data-tbody="teacher_applications"]');
  if (tTbody) {
    tTbody.innerHTML = APP_STATE.teacher_applications.map(app => `
      <tr>
        <td style="font-weight: 600;">${app.name}</td>
        <td>${app.email}</td>
        <td>${app.phone}</td>
        <td>${app.country}</td>
        <td>${app.spec}</td>
        <td><span class="badge-pill ${app.status === 'Approved' ? 'confirmed' : 'pending'}">${app.status}</span></td>
        <td style="color: var(--admin-muted);">${app.submitted}</td>
      </tr>
    `).join("");
  }
}

// RENDER: CLASS SLOTS
function renderClassSlots() {
  const tbody = document.querySelector('[data-tbody="class_slots"]');
  if (!tbody) return;
  tbody.innerHTML = APP_STATE.class_slots.map(slot => `
    <tr>
      <td style="font-weight: 600;">${slot.program}</td>
      <td>${slot.starts}</td>
      <td>${slot.ends}</td>
      <td>${slot.capacity}</td>
      <td><span class="badge-pill ${slot.status === 'Active' ? 'confirmed' : 'overdue'}">${slot.status}</span></td>
    </tr>
  `).join("");
}

// RENDER: NEWSLETTER
function renderNewsletter() {
  const tbody = document.querySelector('[data-tbody="newsletter_subscribers"]');
  if (!tbody) return;
  tbody.innerHTML = APP_STATE.newsletter_subscribers.map(sub => `
    <tr>
      <td style="font-weight: 600;">${sub.email}</td>
      <td style="color: var(--admin-muted);">${sub.date}</td>
      <td><span class="badge-pill confirmed">${sub.status}</span></td>
    </tr>
  `).join("");
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

  // Sample data toggle / Clear data toggle
  sampleToggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const confirmClear = confirm("Do you want to clear fictitious demo data and start with an empty real workspace? (Cancel will reset back to sample demonstration data)");
      if (confirmClear) {
        APP_STATE.kronos_week = { mon: [], tue: [], wed: [], thu: [], fri: [] };
        APP_STATE.era_invoices = [];
        APP_STATE.genius_lessons = [];
        selectedGeniusLesson = null;
        selectedEraInvoice = null;
        saveWorkspaceState();
        renderCurrentView();
        showToast("Cleared fictitious data! You now have an empty, real workspace ready for your entries.", "success");
      } else {
        APP_STATE = JSON.parse(JSON.stringify(DEFAULT_WORKSPACE_DATA));
        selectedGeniusLesson = APP_STATE.genius_lessons[0];
        selectedEraInvoice = APP_STATE.era_invoices[0];
        saveWorkspaceState();
        renderCurrentView();
        showToast("Reset to sample demonstration data.", "success");
      }
    });
  });

  // Global Delegated Click Handler for all dynamic Action Buttons
  document.addEventListener("click", (e) => {
    // 1. Delete Session
    const btnDelSession = e.target.closest('[data-action="delete-session"]');
    if (btnDelSession) {
      e.stopPropagation();
      const id = btnDelSession.dataset.id;
      const day = btnDelSession.dataset.day;
      if (APP_STATE.kronos_week[day]) {
        const idx = APP_STATE.kronos_week[day].findIndex(s => s.id === id);
        if (idx !== -1) {
          const removed = APP_STATE.kronos_week[day].splice(idx, 1)[0];
          saveWorkspaceState();
          renderCurrentView();
          showToast(`Session for ${removed.student} (${removed.time}) deleted successfully!`, "success");
        }
      }
      return;
    }

    // 2. Approve Session
    const btnApproveSession = e.target.closest('[data-action="approve-session"]');
    if (btnApproveSession) {
      e.stopPropagation();
      const id = btnApproveSession.dataset.id;
      const day = btnApproveSession.dataset.day;
      if (APP_STATE.kronos_week[day]) {
        const session = APP_STATE.kronos_week[day].find(s => s.id === id);
        if (session) {
          session.status = "Confirmed";
          saveWorkspaceState();
          renderCurrentView();
          showToast(`Session for ${session.student} on ${day.toUpperCase()} is now Confirmed!`, "success");
        }
      }
      return;
    }

    // 3. Click Session Card to Edit
    const sessionCard = e.target.closest('[data-session-click]');
    if (sessionCard && !e.target.closest('.kronos-card-actions')) {
      const id = sessionCard.dataset.sessionClick;
      const day = sessionCard.dataset.day;
      const session = APP_STATE.kronos_week[day]?.find(s => s.id === id);
      if (session) {
        editingSessionContext = { id, day };
        document.getElementById("editSessionId").value = session.id;
        document.getElementById("editSessionDay").value = day;
        document.getElementById("editSessionStudent").value = session.student;
        document.getElementById("editSessionProgram").value = session.program;
        document.getElementById("editSessionDaySelect").value = day;
        document.getElementById("editSessionTime").value = session.time;
        document.getElementById("editSessionStatus").value = session.status;
        openModal("modalEditSession");
      }
      return;
    }

    // 4. Quick Add Session to specific day
    const btnAddDay = e.target.closest('[data-add-to-day]');
    if (btnAddDay) {
      const day = btnAddDay.dataset.addToDay;
      document.getElementById("sessionDay").value = day;
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

    // 13. Click backdrop to close
    if (e.target.classList.contains('admin-modal-backdrop')) {
      e.target.hidden = true;
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

  // Submit Book Session
  const formBookSession = document.getElementById("formBookSession");
  if (formBookSession) {
    formBookSession.addEventListener("submit", (e) => {
      e.preventDefault();
      const student = document.getElementById("sessionStudentName").value.trim();
      const prog = document.getElementById("sessionProgram").value.trim();
      const day = document.getElementById("sessionDay").value;
      const time = document.getElementById("sessionTime").value.trim();
      const teacher = document.getElementById("sessionTeacher").value.trim() || "Chihab";

      const newSession = {
        id: `sess-${Date.now()}`,
        time: time,
        student: student,
        program: prog,
        teacher: teacher,
        status: "Confirmed"
      };

      APP_STATE.kronos_week[day] = APP_STATE.kronos_week[day] || [];
      APP_STATE.kronos_week[day].push(newSession);
      saveWorkspaceState();
      renderCurrentView();
      closeModal("modalBookSession");
      formBookSession.reset();
      showToast(`Session booked for ${student} on ${day.toUpperCase()} at ${time}.`, "success");
    });
  }

  // Submit Edit Session
  const formEditSession = document.getElementById("formEditSession");
  if (formEditSession) {
    formEditSession.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!editingSessionContext) return;
      const { id, day: origDay } = editingSessionContext;
      const newDay = document.getElementById("editSessionDaySelect").value;
      const newStudent = document.getElementById("editSessionStudent").value.trim();
      const newProg = document.getElementById("editSessionProgram").value.trim();
      const newTime = document.getElementById("editSessionTime").value.trim();
      const newStatus = document.getElementById("editSessionStatus").value;

      // Remove from origDay
      const idx = APP_STATE.kronos_week[origDay]?.findIndex(s => s.id === id);
      if (idx !== -1) {
        const [session] = APP_STATE.kronos_week[origDay].splice(idx, 1);
        session.student = newStudent;
        session.program = newProg;
        session.time = newTime;
        session.status = newStatus;

        // Add to newDay
        APP_STATE.kronos_week[newDay] = APP_STATE.kronos_week[newDay] || [];
        APP_STATE.kronos_week[newDay].push(session);

        saveWorkspaceState();
        renderCurrentView();
        closeModal("modalEditSession");
        showToast(`Session updated successfully!`, "success");
      }
    });
  }

  // Modal Delete Session from Edit Dialog
  const btnModalDeleteSession = document.getElementById("btnModalDeleteSession");
  if (btnModalDeleteSession) {
    btnModalDeleteSession.addEventListener("click", () => {
      if (!editingSessionContext) return;
      const { id, day } = editingSessionContext;
      const idx = APP_STATE.kronos_week[day]?.findIndex(s => s.id === id);
      if (idx !== -1) {
        APP_STATE.kronos_week[day].splice(idx, 1);
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
  renderCurrentView();
  checkSupabaseAuth();
});
