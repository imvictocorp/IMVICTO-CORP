(function () {
  const KEYS = {
    clientes: "imvicto_clientes",
    demos: "imvicto_demos",
    mantenimientos: "imvicto_mantenimientos"
  };

  const ESTADOS = {
    pendiente: "Pendiente",
    venta: "Venta",
    no_venta: "No venta",
    reprogramada: "Reprogramada",
    cancelada: "Cancelada"
  };

  const state = {
    user: getUser(),
    clientes: [],
    demos: [],
    mantenimientos: [],
    calendarDate: startOfMonth(new Date())
  };

  const els = {
    navButtons: document.querySelectorAll(".nav-btn"),
    views: document.querySelectorAll(".view"),
    viewTitle: document.getElementById("viewTitle"),
    viewSubtitle: document.getElementById("viewSubtitle"),

    form: document.getElementById("quickGestionForm"),
    clienteSelect: document.getElementById("quickClienteSelect"),
    syncFormsBtn: document.getElementById("syncFormsBtn"),

    statMisDemos: document.getElementById("statMisDemos"),
    statMisMantenimientos: document.getElementById("statMisMantenimientos"),

    weeklyLeader: document.getElementById("weeklyLeader"),
    weeklyRanking: document.getElementById("weeklyRanking"),

    agendaDemos: document.getElementById("agendaDemos"),
    agendaMantenimientos: document.getElementById("agendaMantenimientos"),

    calendarPrev: document.getElementById("calendarPrev"),
    calendarNext: document.getElementById("calendarNext"),
    calendarLabel: document.getElementById("calendarLabel"),
    calendarGrid: document.getElementById("calendarGrid"),

    kpiWeekDemos: document.getElementById("kpiWeekDemos"),
    kpiWeekMantenimientos: document.getElementById("kpiWeekMantenimientos"),
    kpiWeekVentas: document.getElementById("kpiWeekVentas"),
    kpiWeekNoVentas: document.getElementById("kpiWeekNoVentas"),
    kpiWeekReprogramadas: document.getElementById("kpiWeekReprogramadas"),
    kpiWeekTotal: document.getElementById("kpiWeekTotal"),

    kpiMonthDemos: document.getElementById("kpiMonthDemos"),
    kpiMonthMantenimientos: document.getElementById("kpiMonthMantenimientos"),
    kpiMonthVentas: document.getElementById("kpiMonthVentas"),
    kpiMonthNoVentas: document.getElementById("kpiMonthNoVentas"),
    kpiMonthReprogramadas: document.getElementById("kpiMonthReprogramadas"),
    kpiMonthTotal: document.getElementById("kpiMonthTotal"),

    kpiRecentList: document.getElementById("kpiRecentList"),

    toast: document.getElementById("toast")
  };

  const viewCopy = {
    inicio: ["Inicio", "Registra tu gestión comercial y visualiza tu agenda."],
    bonos: ["Bonos e incentivos", "Consulta la campaña vigente del equipo comercial."],
    kpis: ["KPIs", "Revisa tus indicadores semanales y mensuales."],
    jd: ["Hacia el JD", "Capacitación comercial para aplicar en campo."]
  };

  init();

  function init() {
    loadAll();
    bindEvents();
    setDefaultDate();
    renderAll();

const usuario = getUser();


const sessionLabel =
document.getElementById(
"sessionLabel"
);


if(sessionLabel && usuario){

sessionLabel.textContent =
"Sesión: " + usuario.nombre;

}
  }

  function bindEvents() {
    els.navButtons.forEach((btn) => {
      btn.addEventListener("click", () => switchView(btn.dataset.view));
    });

    els.form?.addEventListener("submit", handleSubmit);
    els.syncFormsBtn?.addEventListener("click", importarAgendaDesdeForms);

    els.clienteSelect?.addEventListener("change", () => {
      fillClientFields(els.clienteSelect.value);
    });

    els.calendarPrev?.addEventListener("click", () => {
      state.calendarDate = addMonths(state.calendarDate, -1);
      renderCalendar();
    });

    els.calendarNext?.addEventListener("click", () => {
      state.calendarDate = addMonths(state.calendarDate, 1);
      renderCalendar();
    });

    document.addEventListener("change", (event) => {
      const target = event.target;

      if (!target.matches("[data-action='change-status']")) return;

      const id = target.dataset.id;
      const tipo = target.dataset.tipo;
      const estado = target.value;

      updateItemStatus(tipo, id, estado);
    });
  }

  function loadAll() {
    state.clientes = normalizeItems(readArray(KEYS.clientes));
    state.demos = normalizeItems(readArray(KEYS.demos));
    state.mantenimientos = normalizeItems(readArray(KEYS.mantenimientos));
  }

  function saveAll() {
    writeArray(KEYS.clientes, state.clientes);
    writeArray(KEYS.demos, state.demos);
    writeArray(KEYS.mantenimientos, state.mantenimientos);
  }

  function normalizeItems(items) {
    return items.map((item) => ({
      ...item,
      estado_gestion: item.estado_gestion || "pendiente"
    }));
  }

  function renderAll() {
    renderClienteSelect();
    renderStats();
    renderWeeklyLeaderboard();
    renderAgenda();
    renderCalendar();
    renderKPIs();
  }

  function switchView(viewName) {
    els.navButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === viewName);
    });

    els.views.forEach((view) => {
      view.classList.toggle("active", view.id === viewName);
    });

    const [title, subtitle] = viewCopy[viewName] || viewCopy.inicio;

    if (els.viewTitle) els.viewTitle.textContent = title;
    if (els.viewSubtitle) els.viewSubtitle.textContent = subtitle;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderClienteSelect() {
    const options = state.clientes
      .slice()
      .sort((a, b) => fullName(a).localeCompare(fullName(b)))
      .map((cliente) => `<option value="${cliente.id}">${escapeHtml(fullName(cliente))}</option>`)
      .join("");

    if (els.clienteSelect) {
      els.clienteSelect.innerHTML = `
        <option value="">Registrar manualmente</option>
        ${options}
      `;
    }
  }

  function renderStats() {
    const demos = state.demos.filter(belongsToUser);
    const mantenimientos = state.mantenimientos.filter(belongsToUser);

    if (els.statMisDemos) els.statMisDemos.textContent = demos.length;
    if (els.statMisMantenimientos) els.statMisMantenimientos.textContent = countUpcoming(mantenimientos);
  }

  function renderWeeklyLeaderboard() {
    if (!els.weeklyLeader || !els.weeklyRanking) return;

    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = addDays(weekStart, 6);

    const allItems = [
      ...state.demos.map((item) => ({ ...item, tipo: "demo" })),
      ...state.mantenimientos.map((item) => ({ ...item, tipo: "mantenimiento" }))
    ].filter((item) => isBetween(item.fecha, weekStart, weekEnd));

    const rankingMap = {};

    allItems.forEach((item) => {
      const vendedor = normalizeSellerName(item.vendedor_nombre || item.encargado || item.notas || "SIN VENDEDOR");

      if (!rankingMap[vendedor]) {
        rankingMap[vendedor] = {
          vendedor,
          demos: 0,
          mantenimientos: 0,
          ventas: 0,
          total: 0
        };
      }

      rankingMap[vendedor].total++;

      if (item.tipo === "demo") rankingMap[vendedor].demos++;
      if (item.tipo === "mantenimiento") rankingMap[vendedor].mantenimientos++;
      if (item.estado_gestion === "venta") rankingMap[vendedor].ventas++;
    });

    const ranking = Object.values(rankingMap).sort((a, b) => {
      if (b.ventas !== a.ventas) return b.ventas - a.ventas;
      return b.total - a.total;
    });

    if (!ranking.length) {
      els.weeklyLeader.innerHTML = "";
      els.weeklyRanking.innerHTML = "";
      return;
    }

    const winner = ranking[0];

    els.weeklyLeader.innerHTML = `
      <span>Liderando esta semana</span>
      <strong>${escapeHtml(winner.vendedor)}</strong>
      <small>${winner.total} gestión(es) · ${winner.ventas} venta(s)</small>
    `;

    els.weeklyRanking.innerHTML = ranking.slice(0, 5).map((item, index) => {
      return `
        <article class="leader-row">
          <div class="leader-position">${index + 1}</div>
          <div class="leader-name">${escapeHtml(item.vendedor)}</div>
          <div class="leader-score">${item.total} gest.</div>
        </article>
      `;
    }).join("");
  }

  function renderAgenda() {
    const demos = sortByDate(state.demos.filter(belongsToUser));
    const mantenimientos = sortByDate(state.mantenimientos.filter(belongsToUser));

    if (els.agendaDemos) {
      els.agendaDemos.innerHTML = demos.map(renderAgendaItem).join("");
    }

    if (els.agendaMantenimientos) {
      els.agendaMantenimientos.innerHTML = mantenimientos.map(renderAgendaItem).join("");
    }
  }

  function renderAgendaItem(item) {
    const tipoLabel = item.tipo === "demo" ? "Demo" : "Mantenimiento";
    const estado = item.estado_gestion || "pendiente";

    return `
      <article class="agenda-card ${escapeHtml(item.tipo)}">
        <div class="agenda-top">
          <div>
            <strong>${escapeHtml(item.nombre_cliente || "")}</strong>

            <div class="agenda-meta">
              <span>${formatDate(item.fecha)}</span>
              <span>${escapeHtml(item.hora || "Sin hora")}</span>
              <span>${escapeHtml(item.telefono || "Sin teléfono")}</span>
              <span>${escapeHtml(item.perfil || "Sin perfil")}</span>
            </div>

            ${item.direccion ? `<div class="agenda-address">${escapeHtml(item.direccion)}</div>` : ""}

            <span class="status-pill status-${escapeHtml(estado)}">
              ${escapeHtml(ESTADOS[estado] || "Pendiente")}
            </span>
          </div>

          <div class="status-box">
            <span class="agenda-badge ${escapeHtml(item.tipo)}">${tipoLabel}</span>

            <label class="status-label">
              Resultado
              <select
                class="status-select"
                data-action="change-status"
                data-id="${escapeHtml(item.id)}"
                data-tipo="${escapeHtml(item.tipo)}"
              >
                ${renderStatusOptions(estado)}
              </select>
            </label>
          </div>
        </div>

        ${item.notas ? `<p class="muted small">${escapeHtml(item.notas)}</p>` : ""}
      </article>
    `;
  }

  function renderStatusOptions(current) {
    return Object.entries(ESTADOS).map(([value, label]) => {
      return `<option value="${value}" ${value === current ? "selected" : ""}>${label}</option>`;
    }).join("");
  }

  function updateItemStatus(tipo, id, estado) {
    const key = tipo === "mantenimiento" ? "mantenimientos" : "demos";

    state[key] = state[key].map((item) => {
      if (item.id !== id) return item;

      return {
        ...item,
        estado_gestion: estado,
        status_updated_at: new Date().toISOString()
      };
    });

    saveAll();
    loadAll();
    renderAll();

    toast("Estado actualizado.");
  }

  function renderKPIs() {
    const demos = state.demos.filter(belongsToUser);
    const mantenimientos = state.mantenimientos.filter(belongsToUser);
    const all = [...demos, ...mantenimientos];

    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = addDays(weekStart, 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const weekItems = all.filter((item) => isBetween(item.fecha, weekStart, weekEnd));
    const monthItems = all.filter((item) => isBetween(item.fecha, monthStart, monthEnd));

    setText(els.kpiWeekDemos, demos.filter((item) => isBetween(item.fecha, weekStart, weekEnd)).length);
    setText(els.kpiWeekMantenimientos, mantenimientos.filter((item) => isBetween(item.fecha, weekStart, weekEnd)).length);
    setText(els.kpiWeekVentas, countByStatus(weekItems, "venta"));
    setText(els.kpiWeekNoVentas, countByStatus(weekItems, "no_venta"));
    setText(els.kpiWeekReprogramadas, countByStatus(weekItems, "reprogramada"));
    setText(els.kpiWeekTotal, weekItems.length);

    setText(els.kpiMonthDemos, demos.filter((item) => isBetween(item.fecha, monthStart, monthEnd)).length);
    setText(els.kpiMonthMantenimientos, mantenimientos.filter((item) => isBetween(item.fecha, monthStart, monthEnd)).length);
    setText(els.kpiMonthVentas, countByStatus(monthItems, "venta"));
    setText(els.kpiMonthNoVentas, countByStatus(monthItems, "no_venta"));
    setText(els.kpiMonthReprogramadas, countByStatus(monthItems, "reprogramada"));
    setText(els.kpiMonthTotal, monthItems.length);

    if (els.kpiRecentList) {
      els.kpiRecentList.innerHTML = sortByDate(all).slice(-8).reverse().map(renderAgendaItem).join("");
    }
  }

  async function importarAgendaDesdeForms() {
    if (typeof IMVICTO_FORMS === "undefined") {
      toast("No se cargó IMVICTO_FORMS. Revisa config.js.", true);
      return;
    }

    const csvUrl = IMVICTO_FORMS.agendaCsvUrl;

    if (!csvUrl || csvUrl.includes("PEGA_AQUI")) {
      toast("Pega el link CSV del Google Sheet en config.js.", true);
      return;
    }

    if (!csvUrl.includes("output=csv")) {
      toast("El link no parece CSV. Debe incluir output=csv.", true);
      return;
    }

    try {
      toast("Sincronizando Google Forms...");

      const response = await fetch(addCacheBust(csvUrl), {
        method: "GET",
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("HTTP " + response.status + " - No se pudo leer el CSV.");
      }

      const csvText = await response.text();

      if (!csvText.trim()) {
        throw new Error("El CSV está vacío.");
      }

      if (csvText.toLowerCase().includes("<html") || csvText.toLowerCase().includes("<!doctype")) {
        throw new Error("El link devolvió HTML, no CSV.");
      }

      const rows = csvToObjects(csvText);
      const sellerNames = getSellerNames();

      let revisadas = 0;
      let coinciden = 0;
      let cargadas = 0;

      const oldStatusMap = buildOldFormsStatusMap();
      const nuevasDemosForms = [];
      const nuevosMantenimientosForms = [];

      rows.forEach((row) => {
        revisadas++;

        const encargado = normalizeText(getColumn(row, ["ENCARGADO", "Encargado"]));
        const vendedores = normalizeText(getColumn(row, [
          "VENDEDORES",
          "VENDEDOR",
          "VENDEDORES (encargado + vendedor)",
          "Vendedores",
          "Vendedor"
        ]));

        const pertenece =
          sellerNames.some(name => {

            return (
              vendedores.includes(name) ||
              encargado.includes(name)
            );

          });

        coinciden++;

        const tipoRaw = normalizeText(getColumn(row, [
          "TIPO DE CITA",
          "Tipo de cita",
          "TIPO",
          "CITA"
        ]));

        const tipo = tipoRaw.includes("MANTENIMIENTO") || tipoRaw.includes("MANT")
          ? "mantenimiento"
          : "demo";

        const fecha = normalizeGoogleDate(getColumn(row, ["DÍA", "DIA", "FECHA", "Fecha"]));
        const hora = normalizeTime(getColumn(row, ["HORA", "Hora"]));

        const cliente = upper(getColumn(row, ["CLIENTE", "Cliente", "NOMBRE CLIENTE", "NOMBRE"]));
        const direccion = upper(getColumn(row, ["DIRECCION", "DIRECCIÓN", "Direccion", "Dirección"]));
        const perfil = upper(getColumn(row, ["PERFIL", "Perfil"]));
        const notas = upper(getColumn(row, [
          "VENDEDORES",
          "VENDEDOR",
          "VENDEDORES (encargado + vendedor)",
          "Vendedores",
          "Vendedor"
        ]));

        if (!fecha || !cliente) return;

        const formsKey = buildFormsKey({
          tipo,
          cliente,
          fecha,
          hora,
          direccion,
          perfil
        });

        const item = {
          id: makeId(),
          tipo,
          cliente_id: null,
          nombre_cliente: cliente,
          telefono: "",
          direccion,
          perfil,
          fecha,
          hora,
          notas,
          vendedor_nombre: state.user?.nombre || encargado || vendedores || "",
          vendedor_email: state.user?.correo || state.user?.email || "",
          origen: "google_forms",
          forms_key: formsKey,
          estado_gestion: oldStatusMap[formsKey] || "pendiente",
          updated_from_forms_at: new Date().toISOString()
        };

        if (tipo === "demo") {
          nuevasDemosForms.push(item);
        } else {
          nuevosMantenimientosForms.push(item);
        }

        cargadas++;
      });

      state.demos = state.demos.filter((item) => {
        if (item.origen !== "google_forms") return true;
        return !belongsToUser(item);
      });

      state.mantenimientos = state.mantenimientos.filter((item) => {
        if (item.origen !== "google_forms") return true;
        return !belongsToUser(item);
      });

      state.demos.push(...nuevasDemosForms);
      state.mantenimientos.push(...nuevosMantenimientosForms);

      saveAll();
      loadAll();
      renderAll();

      toast(`Forms actualizado. Revisadas: ${revisadas}. Coinciden: ${coinciden}. Cargadas: ${cargadas}.`);
    } catch (error) {
      console.error("[FORMS ERROR]", error);
      toast("Error Forms: " + (error?.message || String(error)), true);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const data = new FormData(form);

    const selectedId = clean(data.get("cliente_id"));
    const selectedCliente = state.clientes.find((cliente) => cliente.id === selectedId);

    const item = {
      id: makeId(),
      tipo: data.get("tipo"),
      cliente_id: selectedCliente?.id || null,
      nombre_cliente: selectedCliente ? fullName(selectedCliente) : upper(data.get("nombre_cliente")),
      telefono: selectedCliente?.telefono || clean(data.get("telefono")),
      direccion: selectedCliente?.direccion || upper(data.get("direccion")),
      perfil: upper(data.get("perfil")),
      fecha: clean(data.get("fecha")),
      hora: clean(data.get("hora")),
      estado_gestion: clean(data.get("estado_gestion")) || "pendiente",
      notas: clean(data.get("notas")),
      vendedor_nombre: state.user?.nombre || "",
      vendedor_email: state.user?.correo || state.user?.email || "",
      origen: "manual",
      created_at: new Date().toISOString()
    };

    if (!item.nombre_cliente) {
      toast("Ingresa el nombre del cliente.", true);
      return;
    }

    if (!item.fecha) {
      toast("Selecciona una fecha.", true);
      return;
    }

    if (!item.perfil) {
      toast("Escribe el perfil del cliente.", true);
      return;
    }

    if (item.tipo === "demo") {
      state.demos.push(item);
    } else {
      state.mantenimientos.push(item);
    }

    saveAll();

    form.reset();
    setDefaultDate();
    loadAll();
    renderAll();

    toast(item.tipo === "demo" ? "Demo cargada al calendario." : "Mantenimiento cargado al calendario.");
  }

  function renderCalendar() {
    if (!els.calendarGrid) return;

    const monthStart = startOfMonth(state.calendarDate);
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const todayISO = toISODate(new Date());
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (monthStart.getDay() + 6) % 7;

    if (els.calendarLabel) {
      els.calendarLabel.textContent = monthStart.toLocaleDateString("es-PE", {
        month: "long",
        year: "numeric"
      });
    }

    const events = [
      ...state.demos.filter(belongsToUser),
      ...state.mantenimientos.filter(belongsToUser)
    ];

    const map = new Map();

    events.forEach((item) => {
      if (!item.fecha) return;

      const date = parseDate(item.fecha);

      if (date.getFullYear() !== year || date.getMonth() !== month) return;

      if (!map.has(item.fecha)) map.set(item.fecha, []);
      map.get(item.fecha).push(item);
    });

    const cells = [];

    for (let i = 0; i < offset; i++) {
      cells.push(`<div class="seller-day empty"></div>`);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const iso = toISODate(new Date(year, month, day));
      const dayEvents = map.get(iso) || [];

      const classes = ["seller-day"];

      if (iso === todayISO) classes.push("today");
      if (dayEvents.length) classes.push("has-events");

      const dots = dayEvents
        .slice(0, 8)
        .map((item) => `<i class="dot ${getStatusDotClass(item)}"></i>`)
        .join("");

      const miniEvents = dayEvents
        .slice(0, 3)
        .map((item) => {
          const label = item.tipo === "demo" ? "D" : "M";
          return `<div class="seller-day-event">${label} · ${escapeHtml(item.nombre_cliente || "")}</div>`;
        })
        .join("");

      cells.push(`
        <div class="${classes.join(" ")}" title="${escapeHtml(buildDayTitle(iso, dayEvents))}">
          <span class="seller-day-number">${day}</span>
          <div class="seller-day-dots">${dots}</div>
          <div class="seller-day-mini">${miniEvents}</div>
        </div>
      `);
    }

    els.calendarGrid.innerHTML = cells.join("");
  }

  function getStatusDotClass(item) {
    const status = item.estado_gestion || "pendiente";

    if (status === "venta") return "venta-dot";
    if (status === "no_venta") return "no-venta-dot";
    if (status === "reprogramada") return "repro-dot";
    if (status === "cancelada") return "cancelada-dot";

    return item.tipo === "demo" ? "demo-dot" : "mantenimiento-dot";
  }

  function buildOldFormsStatusMap() {
    const map = {};

    [...state.demos, ...state.mantenimientos].forEach((item) => {
      if (item.origen !== "google_forms") return;

      const key = item.forms_key || buildFormsKey({
        tipo: item.tipo,
        cliente: item.nombre_cliente,
        fecha: item.fecha,
        hora: item.hora,
        direccion: item.direccion,
        perfil: item.perfil
      });

      map[key] = item.estado_gestion || "pendiente";
    });

    return map;
  }

  function buildFormsKey({ tipo, cliente, fecha, hora, direccion, perfil }) {
    return [
      normalizeText(tipo),
      normalizeText(cliente),
      normalizeText(fecha),
      normalizeText(hora),
      normalizeText(direccion),
      normalizeText(perfil)
    ].join("|");
  }

  function fillClientFields(clienteId) {
    const cliente = state.clientes.find((item) => item.id === clienteId);
    if (!cliente || !els.form) return;

    setValue("nombre_cliente", fullName(cliente));
    setValue("telefono", cliente.telefono);
    setValue("direccion", cliente.direccion);
  }

  function getSellerNames() {


    const usuario =
      state.user;



    let nombres = [];



    if (!usuario)
      return nombres;



    nombres.push(
      usuario.nombre || ""
    );



    if (usuario.aliasForms) {

      nombres.push(
        usuario.aliasForms
      );

    }



    if (Array.isArray(usuario.alias)) {

      nombres.push(
        ...usuario.alias
      );

    }



    return [
      ...new Set(
        nombres
          .flat()
          .map(normalizeText)
          .filter(Boolean)
      )
    ];


  }

  function belongsToUser(item) {
    const sellerNames = getSellerNames();
    const itemName = normalizeText(item.vendedor_nombre || "");
    const itemNotes = normalizeText(item.notas || "");
    const itemEmail = normalizeText(item.vendedor_email || "");
    const userEmail = normalizeText(state.user?.correo || state.user?.email || "");

    if (!item.vendedor_email && !item.vendedor_nombre) return true;
    if (userEmail && itemEmail && userEmail === itemEmail) return true;

    return sellerNames.some((name) => {
      return itemName.includes(name) || itemNotes.includes(name);
    });
  }

  function normalizeSellerName(value) {
    const normalized = normalizeText(value);

    if (typeof IMVICTO_USERS !== "undefined") {
      const found = IMVICTO_USERS.find((user) => {
        const names = [user.nombre, ...(Array.isArray(user.alias) ? user.alias : [])].map(normalizeText);
        return names.some((name) => normalized.includes(name));
      });

      if (found) return normalizeText(found.nombre);
    }

    return normalized || "SIN VENDEDOR";
  }

  function countUpcoming(items) {
    const today = startOfDay(new Date());

    return items.filter((item) => {
      if (!item.fecha) return false;
      return parseDate(item.fecha) >= today;
    }).length;
  }

  function countByStatus(items, status) {
    return items.filter((item) => item.estado_gestion === status).length;
  }

  function buildDayTitle(iso, events) {
    if (!events.length) return formatDate(iso);

    const lines = events.map((item) => {
      const label = item.tipo === "demo" ? "Demo" : "Mantenimiento";
      const status = ESTADOS[item.estado_gestion || "pendiente"] || "Pendiente";
      return `${label}: ${item.nombre_cliente || ""} · ${item.hora || ""} · ${status}`.trim();
    });

    return `${formatDate(iso)}\n${lines.join("\n")}`;
  }

  function sortByDate(items) {
    return items.slice().sort((a, b) => {
      return `${a.fecha || ""} ${a.hora || ""}`.localeCompare(`${b.fecha || ""} ${b.hora || ""}`);
    });
  }

  function csvToObjects(csvText) {
    const cleanText = csvText.trim();

    if (!cleanText) return [];

    const lines = cleanText.split(/\r?\n/);
    const headers = parseCsvLine(lines[0]).map((h) => h.trim());

    return lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || "";
        row[normalizeText(header)] = values[index] || "";
      });

      return row;
    });
  }

  function parseCsvLine(line) {
    const result = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"' && insideQuotes && next === '"') {
        current += '"';
        i++;
        continue;
      }

      if (char === '"') {
        insideQuotes = !insideQuotes;
        continue;
      }

      if (char === "," && !insideQuotes) {
        result.push(current);
        current = "";
        continue;
      }

      current += char;
    }

    result.push(current);
    return result;
  }

  function getColumn(row, names) {
    for (const name of names) {
      if (row[name] !== undefined && row[name] !== "") return row[name];

      const normalizedName = normalizeText(name);

      if (row[normalizedName] !== undefined && row[normalizedName] !== "") {
        return row[normalizedName];
      }
    }

    return "";
  }

  function normalizeGoogleDate(value) {
    const raw = clean(value);

    if (!raw) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const parts = raw.split(/[\/\-\.]/);

    if (parts.length === 3) {
      let first = parts[0].padStart(2, "0");
      let second = parts[1].padStart(2, "0");
      let year = parts[2];

      if (year.length === 2) year = "20" + year;

      return `${year}-${second}-${first}`;
    }

    const parsed = new Date(raw);

    if (!Number.isNaN(parsed.getTime())) return toISODate(parsed);

    return "";
  }

  function normalizeTime(value) {
    const raw = clean(value);

    if (!raw) return "";

    const match = raw.match(/(\d{1,2}):(\d{2})/);

    if (!match) return raw;

    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }

  function setDefaultDate() {
    const today = toISODate(new Date());
    const dateInput = els.form?.querySelector('[name="fecha"]');

    if (dateInput && !dateInput.value) {
      dateInput.value = today;
    }
  }

  function isBetween(value, start, end) {
    if (!value) return false;

    const date = parseDate(value);
    return date >= startOfDay(start) && date <= startOfDay(end);
  }

  function getWeekStart(date) {
    const d = startOfDay(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    return addDays(d, diff);
  }

  function addCacheBust(url) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}cacheBust=${Date.now()}`;
  }

  function setText(el, value) {
    if (el) el.textContent = value;
  }

  function readArray(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  }

  function writeArray(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

function getUser(){

    try{

        return JSON.parse(
            localStorage.getItem("usuario")
        ) || {};

    }catch{

        return {};

    }

}

  function setValue(name, value) {
    const input = els.form?.querySelector(`[name="${name}"]`);

    if (input) {
      input.value = value || "";
    }
  }

  function fullName(cliente) {
    return `${cliente?.nombres || ""} ${cliente?.apellidos || ""}`.trim();
  }

  function makeId() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function clean(value) {
    return String(value || "").trim();
  }

  function upper(value) {
    return clean(value).toUpperCase();
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();
  }

  function parseDate(value) {
    return new Date(value + "T00:00:00");
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function addMonths(date, months) {
    return new Date(date.getFullYear(), date.getMonth() + months, 1);
  }

  function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  function toISODate(date) {
    const d = date instanceof Date ? date : new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  }

  function formatDate(value) {
    if (!value) return "";
    return parseDate(value).toLocaleDateString("es-PE");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toast(message, isError = false) {
    if (!els.toast) {
      alert(message);
      return;
    }

    els.toast.textContent = message;
    els.toast.style.background = isError ? "#8f241d" : "#0d2944";
    els.toast.classList.remove("hidden");

    clearTimeout(window.__imvictoToast);
    window.__imvictoToast = setTimeout(() => {
      els.toast.classList.add("hidden");
    }, 4500);
  }
})();