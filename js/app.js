// IMVICTO CORP - MODO TEMPORAL LOCAL
// No usa Supabase. Guarda clientes, ventas y cuotas en este navegador.
// Al terminar el día, descarga Excel para no perder la información.

const STORAGE_KEY = "imvicto_local_data_v1";
const SESSION_KEY = "imvicto_local_session";
const FILE_DB_NAME = "imvicto_archivos_local";
const FILE_DB_VERSION = 1;
const FILE_STORE = "files";

const state = {
  user: null,
  clientes: [],
  ventas: [],
  cuotas: [],
  documentos: [],
  expandedClientes: new Set(),
  editingClienteId: null,
  editingVentaId: null,
  currentArchivosVentaId: null,
  pendingConfirm: null,
  calendarCursor: startOfMonth(new Date())
};

const els = {
  loginView: document.getElementById("loginView"),
  appView: document.getElementById("appView"),
  loginForm: document.getElementById("loginForm"),
  loginError: document.getElementById("loginError"),
  logoutBtn: document.getElementById("logoutBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  viewTitle: document.getElementById("viewTitle"),
  viewSubtitle: document.getElementById("viewSubtitle"),
  toast: document.getElementById("toast"),

  clienteForm: document.getElementById("clienteForm"),
  clienteFormTitle: document.getElementById("clienteFormTitle"),
  clienteFormHint: document.getElementById("clienteFormHint"),
  clienteSubmitBtn: document.getElementById("clienteSubmitBtn"),
  clienteCancelEditBtn: document.getElementById("clienteCancelEditBtn"),
  clienteSearch: document.getElementById("clienteSearch"),
  clientesBody: document.getElementById("clientesBody"),

  ventaForm: document.getElementById("ventaForm"),
  ventaFormTitle: document.getElementById("ventaFormTitle"),
  ventaFormHint: document.getElementById("ventaFormHint"),
  ventaSubmitBtn: document.getElementById("ventaSubmitBtn"),
  ventaCancelEditBtn: document.getElementById("ventaCancelEditBtn"),
  ventaClienteSelect: document.getElementById("ventaClienteSelect"),
  editSelectedClienteBtn: document.getElementById("editSelectedClienteBtn"),
  tipoContrato: document.getElementById("tipoContrato"),
  cuotasConfig: document.getElementById("cuotasConfig"),
  ventaSearch: document.getElementById("ventaSearch"),
  ventasBody: document.getElementById("ventasBody"),
  ventaArchivosInput: document.getElementById("ventaArchivosInput"),
  ventaTipoArchivo: document.getElementById("ventaTipoArchivo"),

  cuotaFilter: document.getElementById("cuotaFilter"),
  cuotaSearch: document.getElementById("cuotaSearch"),
  cuotasBody: document.getElementById("cuotasBody"),

  exportExcelBtn: document.getElementById("exportExcelBtn"),
  importExcelBtn: document.getElementById("importExcelBtn"),
  importExcelInput: document.getElementById("importExcelInput"),

  statClientes: document.getElementById("statClientes"),
  statVentas: document.getElementById("statVentas"),
  statVencidas: document.getElementById("statVencidas"),
  statPendiente: document.getElementById("statPendiente"),
  statPorVencer: document.getElementById("statPorVencer"),
  statConAtraso: document.getElementById("statConAtraso"),
  statPagadasMes: document.getElementById("statPagadasMes"),
  proximasCuotasBody: document.getElementById("proximasCuotasBody"),

  calendarMonthLabel: document.getElementById("calendarMonthLabel"),
  calendarGrid: document.getElementById("calendarGrid"),
  calendarPrevBtn: document.getElementById("calendarPrevBtn"),
  calendarNextBtn: document.getElementById("calendarNextBtn"),

  archivosOverlay: document.getElementById("archivosOverlay"),
  archivosCloseBtn: document.getElementById("archivosCloseBtn"),
  archivosModalTitle: document.getElementById("archivosModalTitle"),
  archivosModalSub: document.getElementById("archivosModalSub"),
  archivoTipoSelect: document.getElementById("archivoTipoSelect"),
  archivoUploadInput: document.getElementById("archivoUploadInput"),
  archivoUploadBtn: document.getElementById("archivoUploadBtn"),
  archivosBody: document.getElementById("archivosBody"),

  modalOverlay: document.getElementById("modalOverlay"),
  modalTitle: document.getElementById("modalTitle"),
  modalMessage: document.getElementById("modalMessage"),
  modalCancelBtn: document.getElementById("modalCancelBtn"),
  modalConfirmBtn: document.getElementById("modalConfirmBtn")
};

const viewInfo = {
  dashboard: ["Inicio", "Resumen operativo de clientes, ventas y pagos."],
  clientes: ["Clientes", "Registro, edición y depuración de base de clientes."],
  ventas: ["Nueva venta", "Registra ventas al contado, financiadas o DFP."],
  cuotas: ["Cuotas", "Control de vencimientos, pagos y mensajes."],
  excel: ["Excel", "Importar y exportar la base de datos."]
};

init();

function init() {
  loadLocalData();
  setDefaultDates();
  bindEvents();

  const localSession = localStorage.getItem(SESSION_KEY);
  if (localSession) {
    state.user = { email: localSession };
    showApp();
    renderAll();
  } else {
    showLogin();
  }
}

function bindEvents() {
  els.loginForm.addEventListener("submit", handleLogin);
  els.logoutBtn.addEventListener("click", handleLogout);
  els.refreshBtn.addEventListener("click", () => { loadLocalData(); renderAll(); toast("Datos actualizados desde este navegador."); });

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  els.clienteForm.addEventListener("submit", handleSaveCliente);
  els.clienteForm.addEventListener("reset", () => setTimeout(cancelClienteEdit, 0));
  els.clienteCancelEditBtn.addEventListener("click", cancelClienteEdit);
  els.clienteSearch.addEventListener("input", renderClientes);

  els.ventaForm.addEventListener("submit", handleSaveVenta);
  els.ventaForm.addEventListener("reset", () => setTimeout(cancelVentaEdit, 0));
  els.ventaCancelEditBtn.addEventListener("click", cancelVentaEdit);
  els.ventaClienteSelect.addEventListener("change", handleVentaClienteChange);
  els.editSelectedClienteBtn.addEventListener("click", editClienteFromVentaSelect);
  els.tipoContrato.addEventListener("change", toggleCuotasConfig);
  els.ventaSearch.addEventListener("input", renderVentas);

  els.cuotaFilter.addEventListener("change", renderCuotas);
  els.cuotaSearch.addEventListener("input", renderCuotas);

  els.exportExcelBtn.addEventListener("click", exportExcel);
  els.importExcelBtn.addEventListener("click", importClientesExcel);

  els.calendarPrevBtn.addEventListener("click", () => { state.calendarCursor = addMonths(state.calendarCursor, -1); renderCalendar(); });
  els.calendarNextBtn.addEventListener("click", () => { state.calendarCursor = addMonths(state.calendarCursor, 1); renderCalendar(); });

  els.modalCancelBtn.addEventListener("click", closeConfirmModal);
  els.modalOverlay.addEventListener("click", (event) => { if (event.target === els.modalOverlay) closeConfirmModal(); });
  els.modalConfirmBtn.addEventListener("click", () => {
    const callback = state.pendingConfirm;
    closeConfirmModal();
    if (callback) callback();
  });

  els.archivosCloseBtn?.addEventListener("click", closeArchivosModal);
  els.archivosOverlay?.addEventListener("click", (event) => { if (event.target === els.archivosOverlay) closeArchivosModal(); });
  els.archivoUploadBtn?.addEventListener("click", handleModalFileUpload);
}

function loadLocalData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state.clientes = parsed.clientes || [];
    state.ventas = parsed.ventas || [];
    state.cuotas = parsed.cuotas || [];
    state.documentos = parsed.documentos || [];
  } catch (error) {
    console.error(error);
    toast("No se pudo leer la data local.", true);
  }
}

function saveLocalData() {
  const data = {
    clientes: state.clientes,
    ventas: state.ventas,
    cuotas: state.cuotas,
    documentos: state.documentos,
    saved_at: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  if (!email || !password) {
    els.loginError.textContent = "Ingresa correo y contraseña para abrir el modo local.";
    return;
  }
  localStorage.setItem(SESSION_KEY, email);
  state.user = { email };
  showApp();
  renderAll();
  toast("Modo temporal local activo.");
}

function handleLogout() {
  localStorage.removeItem(SESSION_KEY);
  state.user = null;
  showLogin();
}

function showLogin() {
  els.loginView.classList.remove("hidden");
  els.appView.classList.add("hidden");
}

function showApp() {
  els.loginView.classList.add("hidden");
  els.appView.classList.remove("hidden");
}

function switchView(viewName) {
  document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.view === viewName));
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active-view", view.id === viewName));
  const [title, subtitle] = viewInfo[viewName] || viewInfo.dashboard;
  els.viewTitle.textContent = title;
  els.viewSubtitle.textContent = subtitle;
}

function renderAll() {
  renderDashboard();
  renderClientes();
  renderClienteSelect();
  renderVentas();
  renderCuotas();
}

function renderDashboard() {
  const vencidas = state.cuotas.filter((c) => getEstado(c) === "vencido");
  const pendientes = state.cuotas.filter((c) => ["pendiente", "vencido"].includes(getEstado(c)));
  const pagadas = state.cuotas.filter((c) => getEstado(c) === "pagado");
  const pendienteMonto = pendientes.reduce((sum, c) => sum + Number(c.monto || 0), 0);

  els.statClientes.textContent = state.clientes.length;
  els.statVentas.textContent = state.ventas.length;
  els.statVencidas.textContent = vencidas.length;
  els.statPendiente.textContent = formatMoney(pendienteMonto);

  const today = startOfDay(new Date());
  const limit = addDays(today, 14);
  const proximas = state.cuotas
    .filter((c) => ["pendiente", "vencido"].includes(getEstado(c)))
    .filter((c) => parseDate(c.fecha_vencimiento) <= limit)
    .sort((a, b) => parseDate(a.fecha_vencimiento) - parseDate(b.fecha_vencimiento))
    .slice(0, 12);

  els.statPorVencer.textContent = state.cuotas.filter((c) => {
    const estado = getEstado(c);
    if (estado !== "pendiente") return false;
    const due = parseDate(c.fecha_vencimiento);
    return due >= today && due <= limit;
  }).length;
  els.statConAtraso.textContent = vencidas.length;
  els.statPagadasMes.textContent = pagadas.filter((c) => {
    if (!c.fecha_pago) return false;
    const fp = parseDate(c.fecha_pago);
    return fp.getMonth() === today.getMonth() && fp.getFullYear() === today.getFullYear();
  }).length;

  els.proximasCuotasBody.innerHTML = proximas.length
    ? proximas.map((c) => `
      <tr>
        <td>${fullName(c)}</td>
        <td>${safe(c.telefono)}</td>
        <td>${c.numero_cuota}</td>
        <td>${formatMoney(c.monto)}</td>
        <td>${formatDate(c.fecha_vencimiento)}</td>
        <td>${statusBadge(getEstado(c))}</td>
      </tr>`).join("")
    : `<tr><td colspan="6" class="muted">No hay cuotas próximas dentro de las próximas 2 semanas.</td></tr>`;

  renderCalendar();
}

function renderClientes() {
  const q = normalize(els.clienteSearch.value);
  const clientes = state.clientes.filter((c) => normalize(`${c.nombres} ${c.apellidos} ${c.dni || ""} ${c.telefono || ""} ${c.codigo_cliente || ""}`).includes(q));

  els.clientesBody.innerHTML = clientes.length
    ? clientes.map((c) => {
      const totalVentas = state.ventas.filter((v) => v.cliente_id === c.id).length;
      return `
        <tr>
          <td><strong>${safe(c.nombres)} ${safe(c.apellidos)}</strong><br><span class="muted">${totalVentas} venta(s)</span></td>
          <td>${safe(c.dni)}</td>
          <td>${safe(c.telefono)}</td>
          <td>${safe(c.codigo_cliente)}</td>
          <td>${safe(c.nivel_cliente)}</td>
          <td>
            <div class="action-row">
              <button class="btn mini secondary" onclick="editarCliente('${c.id}')">Editar</button>
              <button class="btn mini ghost" onclick="eliminarCliente('${c.id}')">Eliminar</button>
            </div>
          </td>
        </tr>`;
    }).join("")
    : `<tr><td colspan="6" class="muted">No hay clientes para mostrar.</td></tr>`;
}

function renderClienteSelect() {
  const current = els.ventaClienteSelect.value;
  const options = state.clientes
    .slice()
    .sort((a, b) => `${a.apellidos} ${a.nombres}`.localeCompare(`${b.apellidos} ${b.nombres}`))
    .map((c) => `<option value="${c.id}">${safe(c.apellidos)}, ${safe(c.nombres)}${c.dni ? " - DNI " + safe(c.dni) : ""}</option>`)
    .join("");
  els.ventaClienteSelect.innerHTML = options ? `<option value="">Selecciona un cliente</option>${options}` : `<option value="">Primero registra un cliente</option>`;
  if (current && state.clientes.some((c) => c.id === current)) els.ventaClienteSelect.value = current;
  handleVentaClienteChange(false);
}

function renderVentas() {
  const q = normalize(els.ventaSearch.value);
  const ventas = state.ventas.filter((v) => {
    const c = findCliente(v.cliente_id) || {};
    return normalize(`${c.nombres || ""} ${c.apellidos || ""} ${c.dni || ""} ${c.telefono || ""} ${v.numero_orden || ""} ${v.numero_cliente || ""} ${v.mercaderia || ""} ${v.tipo_contrato || ""}`).includes(q);
  });

  els.ventasBody.innerHTML = ventas.length
    ? ventas.map((v) => {
      const c = findCliente(v.cliente_id) || {};
      const docs = state.documentos.filter((d) => d.venta_id === v.id).length;
      return `
        <tr>
          <td><strong>${safe(c.nombres)} ${safe(c.apellidos)}</strong><br><span class="muted">${safe(c.dni)}</span></td>
          <td>${safe(v.numero_orden)}</td>
          <td>${safe(v.numero_cliente)}</td>
          <td>${formatDate(v.fecha_orden)}</td>
          <td>${safe(v.tipo_contrato).toUpperCase()}</td>
          <td>${formatMoney(v.monto_total)}</td>
          <td><button class="btn mini ghost" onclick="abrirArchivos('${v.id}')">Archivos (${docs})</button></td>
          <td>
            <div class="action-row">
              <button class="btn mini secondary" onclick="editarVenta('${v.id}')">Editar</button>
              <button class="btn mini ghost" onclick="verCuotasDeCliente('${v.cliente_id}')">Ver cuotas</button>
            </div>
          </td>
        </tr>`;
    }).join("")
    : `<tr><td colspan="8" class="muted">No hay ventas para mostrar.</td></tr>`;
}

function renderCuotas() {
  const filter = els.cuotaFilter.value;
  const q = normalize(els.cuotaSearch.value);
  const cuotas = state.cuotas.filter((c) => {
    const estado = getEstado(c);
    const matchEstado = filter === "todas" || estado === filter;
    return matchEstado && normalize(`${c.nombres} ${c.apellidos} ${c.dni || ""} ${c.telefono || ""} ${c.numero_cliente || ""} ${c.codigo_cliente || ""}`).includes(q);
  });

  const groups = groupBy(cuotas, (c) => c.cliente_id);
  const rows = Array.from(groups.entries()).map(([clienteId, items]) => renderCuotaGroup(clienteId, items));
  els.cuotasBody.innerHTML = rows.length ? rows.join("") : `<tr><td colspan="8" class="muted">No hay cuotas para mostrar.</td></tr>`;
}

function renderCuotaGroup(clienteId, items) {
  const first = items[0];
  const expanded = state.expandedClientes.has(clienteId);
  const pendientes = items.filter((c) => getEstado(c) === "pendiente");
  const vencidas = items.filter((c) => getEstado(c) === "vencido");
  const pendientesTotal = items.filter((c) => ["pendiente", "vencido"].includes(getEstado(c))).reduce((sum, c) => sum + Number(c.monto || 0), 0);
  const contratos = unique(items.map((c) => safe(c.tipo_contrato).toUpperCase())).join(" / ");
  const estadoGeneral = vencidas.length ? "vencido" : pendientes.length ? "pendiente" : "pagado";

  const header = `
    <tr class="group-row" onclick="toggleClienteCuotas('${clienteId}')">
      <td><strong>${fullName(first)}</strong><br><span class="muted">DNI: ${safe(first.dni)} · Código: ${safe(first.codigo_cliente)}</span></td>
      <td>${safe(first.telefono)}</td>
      <td>${contratos}</td>
      <td>${pendientes.length}</td>
      <td>${vencidas.length}</td>
      <td>${formatMoney(pendientesTotal)}</td>
      <td>${statusBadge(estadoGeneral)}</td>
      <td><button class="btn mini secondary" onclick="event.stopPropagation(); toggleClienteCuotas('${clienteId}')">${expanded ? "Cerrar" : "Abrir"}</button></td>
    </tr>`;
  if (!expanded) return header;

  const detailRows = items.map((c) => `
    <tr>
      <td>${safe(c.numero_orden)}</td>
      <td>${safe(c.tipo_contrato).toUpperCase()}</td>
      <td>${c.numero_cuota}</td>
      <td>${formatMoney(c.monto)}</td>
      <td>${formatDate(c.fecha_vencimiento)}</td>
      <td>${statusBadge(getEstado(c))}</td>
      <td>
        <div class="action-row">
          ${getEstado(c) !== "pagado" ? `<button class="btn mini secondary" onclick="marcarPagado('${c.id}', ${Number(c.monto || 0)})">Pagado</button>` : ""}
          <button class="btn mini ghost" onclick="abrirWhatsApp('${c.id}')">WhatsApp</button>
          <button class="btn mini ghost" onclick="editarVenta('${c.venta_id}')">Editar financiamiento</button>
        </div>
      </td>
    </tr>`).join("");

  return header + `
    <tr class="detail-row"><td colspan="8"><div class="quota-detail">
      <div class="detail-title">Cuotas de ${fullName(first)} <span class="muted">(${items.length} visibles según filtro)</span></div>
      <table class="inner-table"><thead><tr><th>N° orden</th><th>Contrato</th><th>Cuota</th><th>Monto</th><th>Vence</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${detailRows}</tbody></table>
    </div></td></tr>`;
}

function renderCalendar() {
  const monthStart = startOfMonth(state.calendarCursor);
  const today = startOfDay(new Date());
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const eventMap = buildCalendarEventMap(year, month);
  els.calendarMonthLabel.textContent = monthStart.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(`<div class="calendar-day empty"></div>`);
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISODate(new Date(year, month, day));
    const events = eventMap.get(iso) || [];
    const classes = ["calendar-day"];
    if (iso === toISODate(today)) classes.push("today");
    if (events.length) classes.push("has-events");
    const dots = unique(events).slice(0, 3).map((status) => `<i class="dot ${status}"></i>`).join("");
    cells.push(`<div class="${classes.join(" ")}" title="${buildCalendarTitle(iso)}"><span class="calendar-day-number">${day}</span><div class="calendar-dots">${dots}</div></div>`);
  }
  els.calendarGrid.innerHTML = cells.join("");
}

function buildCalendarEventMap(year, month) {
  const map = new Map();
  state.cuotas.forEach((c) => {
    const due = parseDate(c.fecha_vencimiento);
    if (due.getFullYear() !== year || due.getMonth() !== month) return;
    const iso = toISODate(due);
    const status = getEstado(c) === "vencido" ? "vencido" : getEstado(c) === "pagado" ? "pagado" : "pending";
    if (!map.has(iso)) map.set(iso, []);
    map.get(iso).push(status === "pending" ? "pending" : status);
  });
  return map;
}

function buildCalendarTitle(isoDate) {
  const items = state.cuotas.filter((c) => c.fecha_vencimiento === isoDate);
  if (!items.length) return formatDate(isoDate);
  return `${formatDate(isoDate)}\n` + items.map((c) => `${fullName(c)} · Cuota ${c.numero_cuota} · ${formatMoney(c.monto)} · ${getEstado(c)}`).join("\n");
}

function handleSaveCliente(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const payload = cleanObject({
    anio: toInt(form.get("anio")),
    nombres: upper(form.get("nombres")),
    apellidos: upper(form.get("apellidos")),
    dni: trim(form.get("dni")),
    telefono: digits(form.get("telefono")),
    telefono_referencia: digits(form.get("telefono_referencia")),
    correo: lower(form.get("correo")),
    direccion: upper(form.get("direccion")),
    estado_civil: trim(form.get("estado_civil")),
    codigo_cliente: trim(form.get("codigo_cliente")),
    nivel_cliente: normalizeNivel(form.get("nivel_cliente")),
    observaciones: trim(form.get("observaciones"))
  });

  if (state.editingClienteId) {
    const index = state.clientes.findIndex((c) => c.id === state.editingClienteId);
    if (index >= 0) state.clientes[index] = { ...state.clientes[index], ...payload, updated_at: nowISO() };
    syncClienteIntoCuotas(state.editingClienteId);
  } else {
    state.clientes.unshift({ id: uuid(), ...payload, created_at: nowISO(), updated_at: nowISO() });
  }
  saveLocalData();
  cancelClienteEdit();
  renderAll();
  toast(state.editingClienteId ? "Cliente actualizado." : "Cliente guardado.");
}

async function handleSaveVenta(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const tipo = form.get("tipo_contrato");
  const payload = cleanObject({
    cliente_id: form.get("cliente_id"),
    numero_orden: trim(form.get("numero_orden")),
    numero_cliente: trim(form.get("numero_cliente")),
    fecha_orden: form.get("fecha_orden"),
    estado: form.get("estado"),
    tipo_contrato: tipo,
    codigo_vendedor: upper(form.get("codigo_vendedor")),
    codigo_acompanante: upper(form.get("codigo_acompanante")),
    mercaderia: upper(form.get("mercaderia")),
    regalo_premium: upper(form.get("regalo_premium")),
    regalo_miscelaneos: upper(form.get("regalo_miscelaneos")),
    monto_total: toNumber(form.get("monto_total")),
    monto_abonado: toNumber(form.get("monto_abonado")),
    monto_inicial: toNumber(form.get("monto_inicial")),
    comisiones: toNumber(form.get("comisiones")),
    beneficio: trim(form.get("beneficio")),
    monto_cuota: toNumberOrNull(form.get("monto_cuota")),
    total_cuotas: toInt(form.get("total_cuotas")),
    dia_pago: toInt(form.get("dia_pago")),
    fecha_primer_pago: form.get("fecha_primer_pago") || null,
    observaciones: trim(form.get("observaciones"))
  });

  if (!payload.cliente_id) {
    toast("Selecciona un cliente.", true);
    return;
  }
  if (tipo !== "contado" && (!payload.monto_cuota || !payload.total_cuotas || !payload.fecha_primer_pago)) {
    toast("Para financiado o DFP debes ingresar monto mensual, total de cuotas y primera fecha de pago.", true);
    return;
  }

  let ventaId = state.editingVentaId;
  if (ventaId) {
    const index = state.ventas.findIndex((v) => v.id === ventaId);
    if (index >= 0) state.ventas[index] = { ...state.ventas[index], ...payload, updated_at: nowISO() };
    if (tipo === "contado") {
      state.cuotas = state.cuotas.filter((c) => !(c.venta_id === ventaId && c.estado !== "pagado"));
    } else {
      sincronizarCuotasLocal(ventaId, payload);
    }
  } else {
    ventaId = uuid();
    state.ventas.unshift({ id: ventaId, ...payload, created_at: nowISO(), updated_at: nowISO() });
    if (tipo !== "contado") state.cuotas.push(...generarCuotas(ventaId, payload));
  }

  await saveFilesForVenta(ventaId, els.ventaArchivosInput?.files || [], els.ventaTipoArchivo?.value || "OTRO");
  saveLocalData();
  cancelVentaEdit();
  renderAll();
  toast("Venta guardada en modo local.");
}

function generarCuotas(ventaId, venta) {
  const cliente = findCliente(venta.cliente_id) || {};
  const start = parseDate(venta.fecha_primer_pago);
  const targetDay = venta.dia_pago || start.getDate();
  const cuotas = [];
  for (let i = 0; i < venta.total_cuotas; i++) {
    const due = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const lastDay = new Date(due.getFullYear(), due.getMonth() + 1, 0).getDate();
    due.setDate(Math.min(targetDay, lastDay));
    cuotas.push(enrichCuota({
      id: uuid(),
      venta_id: ventaId,
      numero_cuota: i + 1,
      monto: Number(venta.monto_cuota),
      fecha_vencimiento: toISODate(due),
      fecha_pago: null,
      estado: "pendiente",
      created_at: nowISO(),
      updated_at: nowISO()
    }, venta, cliente));
  }
  return cuotas;
}

function sincronizarCuotasLocal(ventaId, venta) {
  const existing = state.cuotas.filter((c) => c.venta_id === ventaId);
  const generated = generarCuotas(ventaId, venta);
  generated.forEach((newCuota) => {
    const old = existing.find((c) => c.numero_cuota === newCuota.numero_cuota);
    if (old) {
      Object.assign(old, newCuota, { id: old.id, estado: old.estado, fecha_pago: old.fecha_pago, updated_at: nowISO() });
    } else {
      state.cuotas.push(newCuota);
    }
  });
  state.cuotas = state.cuotas.filter((c) => c.venta_id !== ventaId || c.numero_cuota <= venta.total_cuotas || c.estado === "pagado");
}

function enrichCuota(cuota, venta, cliente) {
  return {
    ...cuota,
    tipo_contrato: venta.tipo_contrato,
    numero_orden: venta.numero_orden,
    numero_cliente: venta.numero_cliente,
    mercaderia: venta.mercaderia,
    cliente_id: cliente.id,
    nombres: cliente.nombres,
    apellidos: cliente.apellidos,
    dni: cliente.dni,
    telefono: cliente.telefono,
    correo: cliente.correo,
    direccion: cliente.direccion,
    codigo_cliente: cliente.codigo_cliente
  };
}

function syncClienteIntoCuotas(clienteId) {
  const cliente = findCliente(clienteId);
  if (!cliente) return;
  state.cuotas.forEach((c) => {
    if (c.cliente_id !== clienteId) return;
    Object.assign(c, {
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      dni: cliente.dni,
      telefono: cliente.telefono,
      correo: cliente.correo,
      direccion: cliente.direccion,
      codigo_cliente: cliente.codigo_cliente
    });
  });
}

window.marcarPagado = function marcarPagado(cuotaId, monto) {
  openConfirmModal({
    title: "Marcar cuota pagada",
    message: "¿Confirmas que esta cuota ya fue pagada?",
    confirmText: "Marcar pagada",
    danger: false,
    onConfirm: () => {
      const cuota = state.cuotas.find((c) => c.id === cuotaId);
      if (!cuota) return;
      cuota.estado = "pagado";
      cuota.fecha_pago = toISODate(new Date());
      cuota.updated_at = nowISO();
      saveLocalData();
      renderAll();
      toast("Cuota marcada como pagada.");
    }
  });
};

window.abrirWhatsApp = function abrirWhatsApp(cuotaId) {
  const cuota = state.cuotas.find((c) => c.id === cuotaId);
  if (!cuota) return;
  const telefono = digits(cuota.telefono || "");
  if (!telefono) return toast("Este cliente no tiene teléfono registrado.", true);
  const dia = new Date(cuota.fecha_vencimiento + "T00:00:00").getDate();
  const cuenta = cuota.numero_cliente || cuota.codigo_cliente || "[CUENTA]";
  const monto = Number(cuota.monto || 0).toFixed(2);
  const mensaje = `Hola, Srta. ${titleCase(cuota.nombres)},\n\nTe saluda el equipo de Royal Prestige para recordarte que tus fechas de pago son los ${dia} de cada mes.\n\nMonto mensual: S/. ${monto}\n\nEvita más intereses y visitas de cobranza pagando puntual. 🚨\n\nPaga desde tu celular: BCP, BBVA o INTERBANK\nIr a pago de servicios\nEmpresa: Hy Cite Peru S. R. L\nTu cuenta es ${cuenta}\nMonto: S/. ${monto}\n\nSALUDOS.`;
  const phone = telefono.startsWith("51") ? telefono : `51${telefono}`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`, "_blank");
};

window.toggleClienteCuotas = function toggleClienteCuotas(clienteId) {
  state.expandedClientes.has(clienteId) ? state.expandedClientes.delete(clienteId) : state.expandedClientes.add(clienteId);
  renderCuotas();
};

window.verCuotasDeCliente = function verCuotasDeCliente(clienteId) {
  state.expandedClientes.add(clienteId);
  switchView("cuotas");
  renderCuotas();
};

window.editarCliente = function editarCliente(clienteId) {
  const cliente = state.clientes.find((c) => c.id === clienteId);
  if (!cliente) return;
  state.editingClienteId = clienteId;
  setFormValue(els.clienteForm, "anio", cliente.anio);
  setFormValue(els.clienteForm, "nombres", cliente.nombres);
  setFormValue(els.clienteForm, "apellidos", cliente.apellidos);
  setFormValue(els.clienteForm, "dni", cliente.dni);
  setFormValue(els.clienteForm, "telefono", cliente.telefono);
  setFormValue(els.clienteForm, "telefono_referencia", cliente.telefono_referencia);
  setFormValue(els.clienteForm, "correo", cliente.correo);
  setFormValue(els.clienteForm, "codigo_cliente", cliente.codigo_cliente);
  setFormValue(els.clienteForm, "estado_civil", cliente.estado_civil);
  setFormValue(els.clienteForm, "nivel_cliente", cliente.nivel_cliente);
  setFormValue(els.clienteForm, "direccion", cliente.direccion);
  setFormValue(els.clienteForm, "observaciones", cliente.observaciones);
  els.clienteFormTitle.textContent = "Modificar cliente";
  els.clienteFormHint.textContent = "Estás editando un cliente existente. Sus ventas anteriores se conservan.";
  els.clienteSubmitBtn.textContent = "Actualizar cliente";
  els.clienteCancelEditBtn.classList.remove("hidden");
  switchView("clientes");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.eliminarCliente = function eliminarCliente(clienteId) {
  const cliente = state.clientes.find((c) => c.id === clienteId);
  if (!cliente) return;
  const ventasAsociadas = state.ventas.filter((v) => v.cliente_id === clienteId);
  const message = ventasAsociadas.length
    ? `También se eliminarán ${ventasAsociadas.length} venta(s), sus cuotas y documentos registrados en esta copia local.`
    : "Se eliminará este cliente de esta copia local.";
  openConfirmModal({
    title: `Eliminar ${fullName(cliente)}`,
    message,
    confirmText: "Eliminar",
    danger: true,
    onConfirm: async () => {
      const ventaIds = ventasAsociadas.map((v) => v.id);
      state.clientes = state.clientes.filter((c) => c.id !== clienteId);
      state.ventas = state.ventas.filter((v) => v.cliente_id !== clienteId);
      state.cuotas = state.cuotas.filter((c) => c.cliente_id !== clienteId);
      const docs = state.documentos.filter((d) => ventaIds.includes(d.venta_id));
      for (const doc of docs) await idbDelete(doc.blob_key);
      state.documentos = state.documentos.filter((d) => !ventaIds.includes(d.venta_id));
      saveLocalData();
      if (state.editingClienteId === clienteId) cancelClienteEdit();
      renderAll();
      toast("Cliente eliminado.");
    }
  });
};

window.editarVenta = function editarVenta(ventaId) {
  const venta = state.ventas.find((v) => v.id === ventaId);
  if (!venta) return;
  state.editingVentaId = ventaId;
  Object.keys(venta).forEach((key) => setFormValue(els.ventaForm, key, venta[key]));
  els.ventaFormTitle.textContent = "Modificar venta / financiamiento";
  els.ventaFormHint.textContent = "Al actualizar una venta financiada o DFP se recalculan fechas y montos de cuotas. Las cuotas pagadas conservan su estado de pago.";
  els.ventaSubmitBtn.textContent = "Actualizar venta";
  els.ventaCancelEditBtn.classList.remove("hidden");
  toggleCuotasConfig();
  handleVentaClienteChange(false);
  switchView("ventas");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.abrirArchivos = function abrirArchivos(ventaId) {
  state.currentArchivosVentaId = ventaId;
  const venta = state.ventas.find((v) => v.id === ventaId);
  const cliente = venta ? findCliente(venta.cliente_id) : null;
  els.archivosModalTitle.textContent = "Archivos de venta";
  els.archivosModalSub.textContent = venta && cliente ? `${fullName(cliente)} · Orden ${venta.numero_orden || "sin número"}` : "Documentos adjuntos";
  els.archivoUploadInput.value = "";
  renderArchivosModal();
  els.archivosOverlay.classList.remove("hidden");
};

function closeArchivosModal() {
  state.currentArchivosVentaId = null;
  els.archivosOverlay.classList.add("hidden");
}

function renderArchivosModal() {
  const docs = state.documentos.filter((d) => d.venta_id === state.currentArchivosVentaId);
  els.archivosBody.innerHTML = docs.length
    ? docs.map((d) => `
      <tr>
        <td><strong>${safe(d.nombre_archivo)}</strong><br><span class="muted">${safe(d.mime_type || "")}</span></td>
        <td>${safe(d.tipo_documento)}</td>
        <td>${formatDateTime(d.created_at)}</td>
        <td><div class="action-row"><button class="btn mini secondary" onclick="abrirArchivoLocal('${d.id}')">Abrir</button><button class="btn mini ghost" onclick="eliminarArchivoLocal('${d.id}')">Eliminar</button></div></td>
      </tr>`).join("")
    : `<tr><td colspan="4" class="muted">No hay archivos adjuntos para esta venta.</td></tr>`;
}

async function handleModalFileUpload() {
  if (!state.currentArchivosVentaId) return;
  const files = els.archivoUploadInput.files || [];
  if (!files.length) return toast("Selecciona uno o más archivos.", true);
  await saveFilesForVenta(state.currentArchivosVentaId, files, els.archivoTipoSelect.value || "OTRO");
  saveLocalData();
  renderArchivosModal();
  renderVentas();
  toast("Archivo(s) guardado(s) en este navegador.");
}

async function saveFilesForVenta(ventaId, files, tipoDocumento) {
  for (const file of files) {
    const docId = uuid();
    const blobKey = `file_${docId}`;
    try {
      await idbSet(blobKey, file);
      state.documentos.push({
        id: docId,
        venta_id: ventaId,
        tipo_documento: tipoDocumento,
        nombre_archivo: file.name,
        mime_type: file.type,
        size: file.size,
        blob_key: blobKey,
        created_at: nowISO()
      });
    } catch (error) {
      console.error(error);
      toast(`No se pudo guardar ${file.name}. Usa archivos más pequeños o exporta y limpia espacio.`, true);
    }
  }
}

window.abrirArchivoLocal = async function abrirArchivoLocal(docId) {
  const doc = state.documentos.find((d) => d.id === docId);
  if (!doc) return;
  const blob = await idbGet(doc.blob_key);
  if (!blob) return toast("No se encontró el archivo en este navegador.", true);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

window.eliminarArchivoLocal = function eliminarArchivoLocal(docId) {
  const doc = state.documentos.find((d) => d.id === docId);
  if (!doc) return;
  openConfirmModal({
    title: "Eliminar archivo",
    message: `Se eliminará ${doc.nombre_archivo} de esta copia local.`,
    confirmText: "Eliminar",
    danger: true,
    onConfirm: async () => {
      await idbDelete(doc.blob_key);
      state.documentos = state.documentos.filter((d) => d.id !== docId);
      saveLocalData();
      renderArchivosModal();
      renderVentas();
      toast("Archivo eliminado.");
    }
  });
};

function cancelClienteEdit() {
  state.editingClienteId = null;
  els.clienteForm.reset();
  els.clienteFormTitle.textContent = "Nuevo cliente";
  els.clienteFormHint.textContent = "Campos obligatorios: año, nombres, apellidos, DNI, teléfono, código, nivel y dirección.";
  els.clienteSubmitBtn.textContent = "Guardar cliente";
  els.clienteCancelEditBtn.classList.add("hidden");
}

function cancelVentaEdit() { state.editingVentaId = null; resetVentaForm(); }

function resetVentaForm() {
  els.ventaForm.reset();
  els.ventaFormTitle.textContent = "Registrar venta";
  els.ventaFormHint.textContent = "Un cliente puede tener varias compras. Cada venta queda registrada por separado.";
  els.ventaSubmitBtn.textContent = "Guardar venta";
  els.ventaCancelEditBtn.classList.add("hidden");
  setDefaultDates();
  toggleCuotasConfig();
  handleVentaClienteChange(false);
}

function handleVentaClienteChange(fillNumero = true) {
  const cliente = findCliente(els.ventaClienteSelect.value);
  els.editSelectedClienteBtn.disabled = !cliente;
  if (!cliente || state.editingVentaId || fillNumero === false) return;
  const numeroClienteInput = els.ventaForm.querySelector("[name='numero_cliente']");
  if (numeroClienteInput) numeroClienteInput.value = cliente.codigo_cliente || "";
}

function editClienteFromVentaSelect() {
  const clienteId = els.ventaClienteSelect.value;
  if (!clienteId) return toast("Selecciona un cliente para modificarlo.", true);
  window.editarCliente(clienteId);
}

function toggleCuotasConfig() {
  els.cuotasConfig.classList.toggle("hidden", els.tipoContrato.value === "contado");
}

function exportExcel() {
  const resumen = [{
    fecha_exportacion: new Date().toLocaleString("es-PE"),
    modo: "temporal_local",
    total_clientes: state.clientes.length,
    total_ventas: state.ventas.length,
    total_cuotas: state.cuotas.length,
    total_documentos: state.documentos.length,
    cuotas_pendientes: state.cuotas.filter((c) => ["pendiente", "vencido"].includes(getEstado(c))).length,
    monto_pendiente: state.cuotas.filter((c) => ["pendiente", "vencido"].includes(getEstado(c))).reduce((sum, c) => sum + Number(c.monto || 0), 0)
  }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen), "Resumen");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(state.clientes), "Clientes");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(state.ventas), "Ventas");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(state.cuotas), "Cuotas");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(state.documentos.map(({ blob_key, ...d }) => d)), "Documentos");
  XLSX.writeFile(wb, `IMVICTO_TRABAJO_LOCAL_${toISODate(new Date())}.xlsx`);
  toast("Excel descargado. Este es tu respaldo principal de hoy.");
}

async function importClientesExcel() {
  const file = els.importExcelInput.files?.[0];
  if (!file) return toast("Selecciona un archivo Excel.", true);
  const rows = await readExcelRows(file);
  if (!rows.length) return toast("El Excel no tiene filas para importar.", true);
  const clientes = rows.map(mapClienteFromExcel).filter((c) => c.nombres && c.apellidos);
  if (!clientes.length) return toast("No se encontraron clientes válidos. Revisa nombres y apellidos.", true);

  let inserted = 0;
  let updated = 0;
  for (const cliente of clientes) {
    const existing = cliente.dni ? state.clientes.find((c) => c.dni === cliente.dni) : null;
    if (existing) {
      Object.assign(existing, cliente, { updated_at: nowISO() });
      syncClienteIntoCuotas(existing.id);
      updated++;
    } else {
      state.clientes.push({ id: uuid(), ...cliente, created_at: nowISO(), updated_at: nowISO() });
      inserted++;
    }
  }
  saveLocalData();
  renderAll();
  toast(`Importación local terminada. Nuevos: ${inserted}. Actualizados: ${updated}.`);
}

function readExcelRows(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(firstSheet, { defval: "" }));
      } catch (error) { reject(error); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function mapClienteFromExcel(row) {
  const get = (...names) => names.find((name) => row[name] !== undefined && row[name] !== "") ? row[names.find((name) => row[name] !== undefined && row[name] !== "")] : "";
  return cleanObject({
    anio: toInt(get("AÑO", "ANIO", "anio", "año")),
    nombres: upper(get("NOMBRES", "nombres", "Nombre", "NOMBRE")),
    apellidos: upper(get("APELLIDOS", "apellidos", "Apellido", "APELLIDO")),
    dni: trim(get("DNI", "dni")),
    telefono: digits(get("TEL PERSONAL", "TELÉFONO", "TELEFONO", "telefono", "Teléfono")),
    telefono_referencia: digits(get("TEL DE REFERENCIA", "TELEFONO REFERENCIA", "telefono_referencia")),
    correo: lower(get("CORREO", "correo", "Email", "EMAIL")),
    direccion: upper(get("DIRECCIÓN", "DIRECCION", "direccion", "Dirección")),
    fecha_nacimiento: parseExcelDate(get("FECHA NACIMIENTO", "fecha_nacimiento")),
    estado_civil: trim(get("ESTADO CIVIL", "estado_civil")),
    codigo_cliente: trim(get("N° CLIENTE", "N CLIENTE", "CODIGO CLIENTE", "codigo_cliente")),
    nivel_cliente: normalizeNivel(get("NIVEL DE CLIENTE", "nivel_cliente")),
    observaciones: trim(get("OBSERVACIONES", "observaciones"))
  });
}

function openConfirmModal({ title, message, confirmText = "Confirmar", danger = false, onConfirm }) {
  state.pendingConfirm = onConfirm;
  els.modalTitle.textContent = title;
  els.modalMessage.textContent = message;
  els.modalConfirmBtn.textContent = confirmText;
  els.modalConfirmBtn.classList.toggle("danger-solid", Boolean(danger));
  els.modalOverlay.classList.remove("hidden");
}

function closeConfirmModal() {
  state.pendingConfirm = null;
  els.modalOverlay.classList.add("hidden");
  els.modalConfirmBtn.classList.remove("danger-solid");
}

function openFileDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(FILE_DB_NAME, FILE_DB_VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(FILE_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function idbSet(key, value) {
  const db = await openFileDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readwrite");
    tx.objectStore(FILE_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function idbGet(key) {
  const db = await openFileDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readonly");
    const req = tx.objectStore(FILE_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbDelete(key) {
  const db = await openFileDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readwrite");
    tx.objectStore(FILE_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function setDefaultDates() {
  const today = toISODate(new Date());
  const fechaOrden = els.ventaForm?.querySelector("input[name='fecha_orden']");
  if (fechaOrden && !fechaOrden.value) fechaOrden.value = today;
}
function getEstado(cuota) {
  if (cuota.estado === "pendiente" && cuota.fecha_vencimiento && parseDate(cuota.fecha_vencimiento) < startOfDay(new Date())) return "vencido";
  return cuota.estado || "pendiente";
}
function statusBadge(status) { const value = safe(status || "pendiente"); return `<span class="badge ${value}">${value.toUpperCase()}</span>`; }
function fullName(c) { return `${safe(c.nombres)} ${safe(c.apellidos)}`.trim(); }
function formatMoney(value) { return `S/ ${Number(value || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function formatDate(value) { if (!value) return ""; return new Date(value + "T00:00:00").toLocaleDateString("es-PE"); }
function formatDateTime(value) { if (!value) return ""; return new Date(value).toLocaleString("es-PE"); }
function parseDate(value) { if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate()); return new Date(value + "T00:00:00"); }
function toISODate(date) { const d = date instanceof Date ? date : new Date(date); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function nowISO() { return new Date().toISOString(); }
function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function addMonths(date, months) { return new Date(date.getFullYear(), date.getMonth() + months, 1); }
function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function parseExcelDate(value) {
  if (!value) return null;
  if (value instanceof Date) return toISODate(value);
  if (typeof value === "number") { const parsed = XLSX.SSF.parse_date_code(value); return parsed ? `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}` : null; }
  const str = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parts = str.split(/[\/.-]/);
  if (parts.length === 3) { const [d, m, y] = parts; if (y.length === 4) return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`; }
  return null;
}
function normalize(value) { return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); }
function safe(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function trim(value) { return String(value || "").trim() || null; }
function upper(value) { return String(value || "").trim().toUpperCase() || null; }
function lower(value) { return String(value || "").trim().toLowerCase() || null; }
function digits(value) { return String(value || "").replace(/\D/g, "") || null; }
function toNumber(value) { return Number(value || 0); }
function toNumberOrNull(value) { return value === "" || value === null ? null : Number(value); }
function toInt(value) { return value === "" || value === null ? null : parseInt(value, 10); }
function normalizeNivel(value) { const level = toInt(value); if (!level || Number.isNaN(level)) return null; return Math.min(9, Math.max(1, level)); }
function cleanObject(obj) { return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== null && value !== undefined && value !== "" && !Number.isNaN(value))); }
function titleCase(value) { return String(value || "").toLowerCase().split(" ").filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" "); }
function findCliente(clienteId) { return state.clientes.find((c) => c.id === clienteId); }
function setFormValue(form, name, value) { const field = form.querySelector(`[name='${name}']`); if (field) field.value = value ?? ""; }
function groupBy(items, getKey) { const map = new Map(); for (const item of items) { const key = getKey(item) || "sin_cliente"; if (!map.has(key)) map.set(key, []); map.get(key).push(item); } return map; }
function unique(items) { return [...new Set(items.filter(Boolean))]; }
function uuid() { return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`; }
function toast(message, isError = false) {
  els.toast.textContent = message;
  els.toast.style.background = isError ? "#8f241d" : "#102844";
  els.toast.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => els.toast.classList.add("hidden"), 3600);
}
