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

// Sample State
let useSampleData = true;
let activeNav = "overview";
let currentAdminUser = null;

// Mock / Sample Data matching the user's screenshots
const SAMPLE_DATA = {
  stats: {
    active_students: 42,
    overdue_invoices: 3,
    sessions_today: 6,
    lessons_week: 28,
    era_outstanding: "1,900",
    era_paid_month: "12,350",
    era_overdue: 1,
    era_reminders: 5
  },
  overview_sessions: [
    { time: "09:00", student: "Sara B.", teacher: "Chihab", status: "Confirmed", statusClass: "confirmed" },
    { time: "11:30", student: "Exam Prep group", teacher: "Chihab", status: "Confirmed", statusClass: "confirmed" },
    { time: "14:00", student: "Omar K.", teacher: "Chihab", status: "Pending", statusClass: "pending" },
    { time: "17:00", student: "Lina M.", teacher: "Chihab", status: "Confirmed", statusClass: "confirmed" }
  ],
  overview_invoices: [
    { id: "INV-0042", customer: "Sara B.", mad: 800, status: "Overdue", statusClass: "overdue" },
    { id: "INV-0045", customer: "Omar K.", mad: 500, status: "Due in 2 days", statusClass: "due" },
    { id: "INV-0047", customer: "Lina M.", mad: 600, status: "Due in 5 days", statusClass: "due" }
  ],
  kronos_week: {
    mon: [
      { time: "09:00", desc: "Sara B. · Business", pending: false },
      { time: "14:00", desc: "Omar K. · Exam prep", pending: false }
    ],
    tue: [
      { time: "09:00", desc: "Sara B. · Business", pending: false },
      { time: "11:30", desc: "Exam Prep group", pending: false },
      { time: "14:00", desc: "Omar K. · Pending", pending: true },
      { time: "17:00", desc: "Lina M. · Day-to-day", pending: false }
    ],
    wed: [
      { time: "09:00", desc: "Sara B. · Business", pending: false },
      { time: "15:00", desc: "Youssef A. · Tutoring", pending: false }
    ],
    thu: [
      { time: "11:30", desc: "Exam Prep group", pending: false },
      { time: "17:00", desc: "Lina M. · Day-to-day", pending: false }
    ],
    fri: [
      { time: "10:00", desc: "Hana R. · Business", pending: false },
      { time: "16:00", desc: "Adam A. · Exam prep", pending: false }
    ]
  },
  genius_lessons: [
    { title: "Writing Business Emails", level: "B1", program: "Business English", duration: "45 min" },
    { title: "Meeting Vocabulary", level: "B2", program: "Business English", duration: "30 min" },
    { title: "IELTS Speaking Part 2", level: "B2", program: "Exam Preparation", duration: "60 min" },
    { title: "Ordering at a Café", level: "A2", program: "Day-to-Day English", duration: "25 min" },
    { title: "Past Simple Practice", level: "A2", program: "Day-to-Day English", duration: "20 min" }
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
    { target: "Lina M.", channel: "In-app", topic: "New Lesson: Writing Business Emails", scheduled: "17 Nov 2026, 10:00", attempts: 1, status: "Delivered" },
    { target: "Exam Prep Group", channel: "WhatsApp", topic: "Mock Exam Schedule update", scheduled: "16 Nov 2026, 18:00", attempts: 1, status: "Sent" }
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
    { email: "learning.pro@example.com", date: "14 Nov 2026", status: "Active" },
    { email: "student.casablanca@example.com", date: "11 Nov 2026", status: "Active" }
  ]
};

// Selected elements in views
let selectedGeniusLesson = SAMPLE_DATA.genius_lessons[0];
let selectedEraInvoice = SAMPLE_DATA.era_invoices[0];

// DOM references
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

// Switch Navigation Views
function switchView(targetView) {
  activeNav = targetView;
  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.navTarget === targetView);
  });
  viewPanels.forEach(panel => {
    panel.hidden = panel.dataset.adminPanel !== targetView;
  });
  renderCurrentView();
}

// Render data for current view
function renderCurrentView() {
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

// Render Overview View
function renderOverview() {
  const sessionsTbody = document.querySelector('[data-tbody="overview_sessions"]');
  if (sessionsTbody) {
    sessionsTbody.innerHTML = SAMPLE_DATA.overview_sessions.map(s => `
      <tr>
        <td style="font-weight: 700;">${s.time}</td>
        <td>${s.student}</td>
        <td style="color: var(--admin-muted);">${s.teacher}</td>
        <td><span class="badge-pill ${s.statusClass}">${s.status}</span></td>
      </tr>
    `).join("");
  }

  const invoicesTbody = document.querySelector('[data-tbody="overview_invoices"]');
  if (invoicesTbody) {
    invoicesTbody.innerHTML = SAMPLE_DATA.overview_invoices.map(inv => `
      <tr>
        <td style="font-weight: 650; color: var(--admin-primary);">${inv.id}</td>
        <td>${inv.customer}</td>
        <td style="font-weight: 600;">${inv.mad}</td>
        <td><span class="badge-pill ${inv.statusClass}">${inv.status}</span></td>
      </tr>
    `).join("");
  }
}

// Render Kronos Schedule View
function renderKronos() {
  const days = ["mon", "tue", "wed", "thu", "fri"];
  days.forEach(day => {
    const container = document.querySelector(`[data-kronos-day="${day}"]`);
    if (!container) return;
    const items = SAMPLE_DATA.kronos_week[day] || [];
    container.innerHTML = items.map(item => `
      <div class="kronos-session-card ${item.pending ? 'is-pending' : ''}">
        <div class="kronos-session-time">${item.time}</div>
        <div class="kronos-session-info">${item.desc}</div>
      </div>
    `).join("");
  });
}

// Render Genius · Lessons View
function renderGenius() {
  const tbody = document.querySelector('[data-tbody="genius_lessons"]');
  if (!tbody) return;

  tbody.innerHTML = SAMPLE_DATA.genius_lessons.map((lesson, idx) => {
    const isSelected = selectedGeniusLesson && selectedGeniusLesson.title === lesson.title;
    return `
      <tr class="clickable ${isSelected ? 'row-selected' : ''}" data-lesson-idx="${idx}">
        <td style="font-weight: 650;">${lesson.title}</td>
        <td><span class="badge-pill sent">${lesson.level}</span></td>
        <td>${lesson.program}</td>
        <td style="color: var(--admin-muted);">${lesson.duration}</td>
      </tr>
    `;
  }).join("");

  // Attach row click listeners
  tbody.querySelectorAll("tr").forEach(tr => {
    tr.addEventListener("click", () => {
      const idx = Number(tr.dataset.lessonIdx);
      selectedGeniusLesson = SAMPLE_DATA.genius_lessons[idx];
      updateGeniusSelection();
      renderGenius();
    });
  });

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
  }
}

// Render Era View
function renderEra() {
  const tbody = document.querySelector('[data-tbody="era_invoices"]');
  if (!tbody) return;

  tbody.innerHTML = SAMPLE_DATA.era_invoices.map((inv, idx) => {
    const isSelected = selectedEraInvoice && selectedEraInvoice.id === inv.id;
    return `
      <tr class="clickable ${isSelected ? 'row-selected' : ''}" data-inv-idx="${idx}">
        <td style="font-weight: 650; color: var(--admin-primary);">${inv.id}</td>
        <td style="color: var(--admin-muted);">${inv.custNo}</td>
        <td style="font-weight: 600;">${inv.name}</td>
        <td>${inv.program}</td>
        <td style="font-weight: 700;">${inv.mad}</td>
        <td style="color: var(--admin-muted);">${inv.due}</td>
        <td><span class="badge-pill ${inv.statusClass}">${inv.status}</span></td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("tr").forEach(tr => {
    tr.addEventListener("click", () => {
      const idx = Number(tr.dataset.invIdx);
      selectedEraInvoice = SAMPLE_DATA.era_invoices[idx];
      updateEraCustomerCard();
      renderEra();
    });
  });

  updateEraCustomerCard();
}

function updateEraCustomerCard() {
  if (!selectedEraInvoice) return;
  const numEl = document.getElementById("eraCustNumber");
  const nameEl = document.getElementById("eraCustName");
  const metaEl = document.getElementById("eraCustMeta");
  const remindersEl = document.getElementById("eraCustReminders");

  if (numEl) numEl.textContent = `Customer ${selectedEraInvoice.custNo}`;
  if (nameEl) nameEl.textContent = selectedEraInvoice.name;
  if (metaEl) {
    metaEl.innerHTML = `
      ${selectedEraInvoice.address}<br>
      ${selectedEraInvoice.phone}<br>
      ${selectedEraInvoice.email}
    `;
  }
  if (remindersEl) {
    remindersEl.innerHTML = (selectedEraInvoice.reminders || []).map(r => `<div>${r}</div>`).join("");
  }
}

// Render Customers View
function renderCustomers() {
  const tbody = document.querySelector('[data-tbody="customers_list"]');
  if (!tbody) return;
  tbody.innerHTML = SAMPLE_DATA.customers.map(c => `
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

// Render Notifications View
function renderNotifications() {
  const tbody = document.querySelector('[data-tbody="notifications_list"]');
  if (!tbody) return;
  tbody.innerHTML = SAMPLE_DATA.notifications.map(n => `
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

// Render Applications View
function renderApplications() {
  const sTbody = document.querySelector('[data-tbody="student_applications"]');
  if (sTbody) {
    sTbody.innerHTML = SAMPLE_DATA.student_applications.map(app => `
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
    tTbody.innerHTML = SAMPLE_DATA.teacher_applications.map(app => `
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

// Render Class Slots View
function renderClassSlots() {
  const tbody = document.querySelector('[data-tbody="class_slots"]');
  if (!tbody) return;
  tbody.innerHTML = SAMPLE_DATA.class_slots.map(slot => `
    <tr>
      <td style="font-weight: 600;">${slot.program}</td>
      <td>${slot.starts}</td>
      <td>${slot.ends}</td>
      <td>${slot.capacity}</td>
      <td><span class="badge-pill ${slot.status === 'Active' ? 'confirmed' : 'overdue'}">${slot.status}</span></td>
    </tr>
  `).join("");
}

// Render Newsletter View
function renderNewsletter() {
  const tbody = document.querySelector('[data-tbody="newsletter_subscribers"]');
  if (!tbody) return;
  tbody.innerHTML = SAMPLE_DATA.newsletter_subscribers.map(sub => `
    <tr>
      <td style="font-weight: 600;">${sub.email}</td>
      <td style="color: var(--admin-muted);">${sub.date}</td>
      <td><span class="badge-pill confirmed">${sub.status}</span></td>
    </tr>
  `).join("");
}

// Setup Event Listeners
function setupEvents() {
  // Navigation button clicks
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      switchView(btn.dataset.navTarget);
    });
  });

  // Sample data toggle button clicks
  sampleToggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      useSampleData = !useSampleData;
      sampleToggles.forEach(t => t.classList.toggle("active", useSampleData));
      showToast(useSampleData ? "Displaying sample demo data." : "Connected to live database mode.");
      if (!useSampleData) {
        tryFetchLiveSupabaseData();
      } else {
        renderCurrentView();
      }
    });
  });

  // Genius due date live input update
  const geniusDueDate = document.getElementById("geniusDueDate");
  if (geniusDueDate) {
    geniusDueDate.addEventListener("input", updateGeniusSelection);
  }

  // Push lesson button action
  const btnPushLesson = document.getElementById("btnPushLesson");
  if (btnPushLesson) {
    btnPushLesson.addEventListener("click", () => {
      const student = document.getElementById("geniusStudentSelect")?.value || "Sara B.";
      const lessonTitle = selectedGeniusLesson?.title || "Lesson";
      showToast(`Lesson "${lessonTitle}" successfully pushed to ${student}!`, "success");
    });
  }

  // Approve timesheet action
  const btnApproveTimesheet = document.getElementById("btnApproveTimesheet");
  if (btnApproveTimesheet) {
    btnApproveTimesheet.addEventListener("click", () => {
      showToast("Timesheet approved for Chihab (14.5 hours confirmed).", "success");
    });
  }

  // Record payment action
  const btnRecordPayment = document.getElementById("btnRecordPayment");
  if (btnRecordPayment) {
    btnRecordPayment.addEventListener("click", () => {
      if (selectedEraInvoice) {
        selectedEraInvoice.status = "Paid";
        selectedEraInvoice.statusClass = "paid";
        selectedEraInvoice.reminders.unshift("Payment recorded manually (MAD " + selectedEraInvoice.mad + ")");
        renderEra();
        renderOverview();
        showToast(`Payment of MAD ${selectedEraInvoice.mad} recorded for ${selectedEraInvoice.id}.`, "success");
      }
    });
  }

  // Send reminder action
  const btnSendReminder = document.getElementById("btnSendReminder");
  if (btnSendReminder) {
    btnSendReminder.addEventListener("click", () => {
      if (selectedEraInvoice) {
        selectedEraInvoice.reminders.unshift(`Reminder sent today to ${selectedEraInvoice.email}`);
        updateEraCustomerCard();
        showToast(`Payment reminder dispatched to ${selectedEraInvoice.name} (${selectedEraInvoice.email}).`, "success");
      }
    });
  }

  // Modal open buttons
  document.querySelectorAll("[data-modal-open]").forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.dataset.modalOpen;
      if (modalId === "book_session") openModal("modalBookSession");
      if (modalId === "new_lesson") openModal("modalNewLesson");
      if (modalId === "new_invoice") openModal("modalNewInvoice");
    });
  });

  // Modal close buttons
  document.querySelectorAll("[data-modal-close]").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".admin-modal-backdrop").hidden = true;
    });
  });

  // Modal backdrop click to close
  document.querySelectorAll(".admin-modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.hidden = true;
    });
  });

  // Book session form submission
  const formBookSession = document.getElementById("formBookSession");
  if (formBookSession) {
    formBookSession.addEventListener("submit", (e) => {
      e.preventDefault();
      const student = document.getElementById("sessionStudentName").value;
      const prog = document.getElementById("sessionProgram").value;
      const day = document.getElementById("sessionDay").value;
      const time = document.getElementById("sessionTime").value;

      SAMPLE_DATA.kronos_week[day] = SAMPLE_DATA.kronos_week[day] || [];
      SAMPLE_DATA.kronos_week[day].push({
        time: time,
        desc: `${student} · ${prog}`,
        pending: false
      });

      renderKronos();
      closeModal("modalBookSession");
      formBookSession.reset();
      showToast(`New session scheduled for ${student} on ${day.toUpperCase()} at ${time}.`, "success");
    });
  }

  // New lesson form submission
  const formNewLesson = document.getElementById("formNewLesson");
  if (formNewLesson) {
    formNewLesson.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("newLessonTitle").value;
      const level = document.getElementById("newLessonLevel").value;
      const prog = document.getElementById("newLessonProgram").value;
      const duration = document.getElementById("newLessonDuration").value;

      const newLesson = { title, level, program: prog, duration };
      SAMPLE_DATA.genius_lessons.unshift(newLesson);
      selectedGeniusLesson = newLesson;
      renderGenius();
      closeModal("modalNewLesson");
      formNewLesson.reset();
      showToast(`Lesson "${title}" added to Genius library.`, "success");
    });
  }

  // New invoice form submission
  const formNewInvoice = document.getElementById("formNewInvoice");
  if (formNewInvoice) {
    formNewInvoice.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("invStudentName").value;
      const program = document.getElementById("invProgram").value;
      const mad = Number(document.getElementById("invAmount").value);
      const due = document.getElementById("invDueDate").value;

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
        reminders: [`Invoice generated and sent`]
      };

      SAMPLE_DATA.era_invoices.unshift(newInv);
      selectedEraInvoice = newInv;
      renderEra();
      closeModal("modalNewInvoice");
      formNewInvoice.reset();
      showToast(`Invoice ${newInvId} created for ${name} (MAD ${mad}).`, "success");
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

// Try connecting to live Supabase backend if user is authenticated
async function checkSupabaseAuth() {
  if (!supabase) return;
  try {
    const { data: userRes, error } = await supabase.auth.getUser();
    if (userRes && userRes.user) {
      currentAdminUser = userRes.user;
      if (userEmailEl) userEmailEl.textContent = currentAdminUser.email;
      // Fetch live data in background
      tryFetchLiveSupabaseData();
    } else {
      if (userEmailEl) userEmailEl.textContent = "admin@splusacademy.com (demo)";
    }
  } catch (err) {
    console.log("Supabase session check:", err);
  }
}

async function tryFetchLiveSupabaseData() {
  if (!supabase || !currentAdminUser) return;
  try {
    // Attempt to load live invoices
    const { data: invoices, error: invErr } = await supabase
      .from("invoices")
      .select("id, invoice_number, total_amount_mad, status, due_date, customer:customers(customer_number, full_name, email)")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!invErr && invoices && invoices.length > 0) {
      SAMPLE_DATA.era_invoices = invoices.map(inv => ({
        id: inv.invoice_number || `INV-${inv.id.slice(0, 4)}`,
        custNo: inv.customer?.customer_number || "C-000001",
        name: inv.customer?.full_name || "Student",
        program: "Academy Program",
        mad: inv.total_amount_mad || 0,
        due: inv.due_date || "Upcoming",
        status: inv.status.charAt(0).toUpperCase() + inv.status.slice(1),
        statusClass: inv.status === 'paid' ? 'paid' : (inv.status === 'overdue' ? 'overdue' : 'sent'),
        address: "Casablanca, Morocco",
        phone: "+212 600 000 000",
        email: inv.customer?.email || "student@example.com",
        reminders: [`Status: ${inv.status}`]
      }));
      selectedEraInvoice = SAMPLE_DATA.era_invoices[0];
      renderEra();
    }

    // Attempt to load live lessons
    const { data: lessons, error: lessErr } = await supabase
      .from("lessons")
      .select("id, title, level, estimated_minutes, program:programs(name)")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!lessErr && lessons && lessons.length > 0) {
      SAMPLE_DATA.genius_lessons = lessons.map(l => ({
        title: l.title,
        level: l.level || "B1",
        program: l.program?.name || "Business English",
        duration: `${l.estimated_minutes || 45} min`
      }));
      selectedGeniusLesson = SAMPLE_DATA.genius_lessons[0];
      renderGenius();
    }
  } catch (err) {
    console.warn("Could not query live Supabase tables, falling back to sample data:", err);
  }
}

// Initial Boot
document.addEventListener("DOMContentLoaded", () => {
  setupEvents();
  renderCurrentView();
  checkSupabaseAuth();
});
