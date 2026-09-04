function $(selector, root = document) { return root.querySelector(selector); }
function $all(selector, root = document) { return [...root.querySelectorAll(selector)]; }
function uid(prefix = "id") { return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`; }
function todayISO() { return toISODate(new Date()); }
function toISODate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function parseDate(value) { return value ? new Date(`${value}T00:00:00`) : null; }
function formatDate(value) { return value ? parseDate(value).toLocaleDateString("es-PE") : ""; }
function formatMoney(value) { return `S/ ${Number(value || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function addMonths(date, months) { return new Date(date.getFullYear(), date.getMonth() + months, 1); }
function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function normalize(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
function safe(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function upper(value) { return String(value || "").trim().toUpperCase(); }
function trim(value) { return String(value || "").trim(); }
function digits(value) { return String(value || "").replace(/\D/g, ""); }
function toNumber(value) { return Number(value || 0); }
function toInt(value) { return value === "" || value === null || value === undefined ? null : parseInt(value, 10); }
function level(value) {
  const n = toInt(value);
  if (!n || Number.isNaN(n)) return "";
  return Math.min(9, Math.max(1, n));
}
function titleCase(value) {
  return String(value || "").toLowerCase().split(" ").filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}
function toast(message, isError = false) {
  const node = $("#toast");
  if (!node) return alert(message);
  node.textContent = message;
  node.classList.toggle("error", isError);
  node.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => node.classList.add("hidden"), 3300);
}
function confirmModal({ title = "Confirmar", message = "", confirmText = "Confirmar", cancelText = "Cancelar", danger = false }) {
  return new Promise((resolve) => {
    const root = $("#modalRoot");
    if (!root) return resolve(confirm(message));
    root.className = "modal-backdrop";
    root.innerHTML = `
      <div class="modal-card">
        <h3>${safe(title)}</h3>
        <p class="muted">${safe(message)}</p>
        <div class="modal-actions">
          <button id="modalCancel" class="btn ghost" type="button">${safe(cancelText)}</button>
          <button id="modalConfirm" class="btn ${danger ? "danger" : "primary"}" type="button">${safe(confirmText)}</button>
        </div>
      </div>`;
    $("#modalCancel").onclick = () => { root.className = "hidden"; root.innerHTML = ""; resolve(false); };
    $("#modalConfirm").onclick = () => { root.className = "hidden"; root.innerHTML = ""; resolve(true); };
  });
}
function statusBadge(status) { return `<span class="badge ${safe(status)}">${safe(status)}</span>`; }
function contractBadge(status) { return `<span class="badge ${safe(status)}">${safe(status)}</span>`; }
function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item) || "sin_key";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}
function unique(items) { return [...new Set(items.filter(Boolean))]; }
function fullName(cliente) { return `${safe(cliente?.nombres)} ${safe(cliente?.apellidos)}`.trim(); }
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function setView(viewName, viewInfo = {}) {
  $all(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.view === viewName));
  $all(".view").forEach(view => view.classList.toggle("active", view.id === viewName));
  const info = viewInfo[viewName];
  if (info) {
    $("#viewTitle").textContent = info[0];
    $("#viewSubtitle").textContent = info[1];
  }
}
function buildCalendar({ cursor, items, grid, label, eventList }) {
  const monthStart = startOfMonth(cursor);
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = toISODate(new Date());
  label.textContent = monthStart.toLocaleDateString("es-PE", { month: "long", year: "numeric" });

  const byDate = new Map();
  items.forEach(item => {
    if (!item.fecha) return;
    const d = parseDate(item.fecha);
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    if (!byDate.has(item.fecha)) byDate.set(item.fecha, []);
    byDate.get(item.fecha).push(item);
  });

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(`<div class="calendar-day empty"></div>`);
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISODate(new Date(year, month, day));
    const events = byDate.get(iso) || [];
    const classes = ["calendar-day"];
    if (iso === today) classes.push("today");
    if (events.length) classes.push("has-events");
    const dots = unique(events.map(e => e.kind)).slice(0,4).map(kind => `<i class="dot ${kind}"></i>`).join("");
    cells.push(`<div class="${classes.join(" ")}"><span class="calendar-day-number">${day}</span><div class="calendar-dots">${dots}</div></div>`);
  }
  grid.innerHTML = cells.join("");

  if (eventList) {
    const monthEvents = [...byDate.entries()].flatMap(([fecha, rows]) => rows.map(row => ({ ...row, fecha })))
      .sort((a,b) => `${a.fecha} ${a.hora || ""}`.localeCompare(`${b.fecha} ${b.hora || ""}`));
    eventList.innerHTML = monthEvents.length ? monthEvents.map(e => `
      <div class="list-item">
        <strong>${safe(e.titulo)}</strong><br>
        <span class="muted small">${formatDate(e.fecha)} ${safe(e.hora || "")} · ${safe(e.kind)}</span>
      </div>`).join("") : `<p class="muted">No hay eventos este mes.</p>`;
  }
}
