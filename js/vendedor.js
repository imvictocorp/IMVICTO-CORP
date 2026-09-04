(function () {
  const KEYS = {
    clientes: "imvicto_clientes",
    demos: "imvicto_demos",
    mantenimientos: "imvicto_mantenimientos"
  };

  const state = {
    user: getUser(),
    clientes: [],
    demos: [],
    mantenimientos: [],
    calendarDate: startOfMonth(new Date())
  };

  const els = {
    form: document.getElementById("quickGestionForm"),
    clienteSelect: document.getElementById("quickClienteSelect"),
    syncFormsBtn: document.getElementById("syncFormsBtn"),

    statMisDemos: document.getElementById("statMisDemos"),
    statMisMantenimientos: document.getElementById("statMisMantenimientos"),

    agendaDemos: document.getElementById("agendaDemos"),
    agendaMantenimientos: document.getElementById("agendaMantenimientos"),

    calendarPrev: document.getElementById("calendarPrev"),
    calendarNext: document.getElementById("calendarNext"),
    calendarLabel: document.getElementById("calendarLabel"),
    calendarGrid: document.getElementById("calendarGrid"),

    toast: document.getElementById("toast")
  };

  init();

  function init() {
    loadAll();
    bindEvents();
    setDefaultDate();
    renderAll();

    console.log("[IMVICTO] Usuario activo:", state.user);
    console.log("[IMVICTO] Nombres válidos vendedor:", getSellerNames());
  }

  function bindEvents() {
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
  }

  function loadAll() {
    state.clientes = readArray(KEYS.clientes);
    state.demos = readArray(KEYS.demos);
    state.mantenimientos = readArray(KEYS.mantenimientos);
  }

  function saveAll() {
    writeArray(KEYS.clientes, state.clientes);
    writeArray(KEYS.demos, state.demos);
    writeArray(KEYS.mantenimientos, state.mantenimientos);
  }

  function renderAll() {
    renderClienteSelect();
    renderStats();
    renderAgenda();
    renderCalendar();
  }

  function renderClienteSelect() {
    const options = state.clientes
      .slice()
      .sort((a, b) => fullName(a).localeCompare(fullName(b)))
      .map((cliente) => {
        return `
          <option value="${cliente.id}">
            ${escapeHtml(fullName(cliente))}
          </option>
        `;
      })
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

    if (els.statMisDemos) {
      els.statMisDemos.textContent = demos.length;
    }

    if (els.statMisMantenimientos) {
      els.statMisMantenimientos.textContent = countUpcoming(mantenimientos);
    }
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

            ${
              item.direccion
                ? `<div class="agenda-address">${escapeHtml(item.direccion)}</div>`
                : ""
            }
          </div>

          <span class="agenda-badge ${escapeHtml(item.tipo)}">
            ${tipoLabel}
          </span>
        </div>

        ${item.notas ? `<p class="muted small">${escapeHtml(item.notas)}</p>` : ""}
      </article>
    `;
  }

  async function importarAgendaDesdeForms() {
    if (typeof IMVICTO_FORMS === "undefined") {
      toast("No se cargó IMVICTO_FORMS. Revisa config.js.", true);
      alert("No se cargó IMVICTO_FORMS.\n\nRevisa que vendedor.html tenga:\n<script src=\"../js/config.js\"></script>\nantes de vendedor.js.");
      return;
    }

    const csvUrl = IMVICTO_FORMS.agendaCsvUrl;

    if (!csvUrl || csvUrl.includes("PEGA_AQUI")) {
      toast("Pega el link CSV del Google Sheet en config.js.", true);
      alert("Falta pegar el link CSV en config.js.");
      return;
    }

    if (!csvUrl.includes("output=csv")) {
      toast("El link no parece CSV. Debe incluir output=csv.", true);
      alert(
        "El link no parece CSV.\n\nDebe incluir:\noutput=csv\n\nNo debe ser link del Form ni pubhtml."
      );
      return;
    }

    try {
      toast("Sincronizando Google Forms...");

      const url = addCacheBust(csvUrl);
      console.log("[FORMS] URL CSV:", url);

      const response = await fetch(url, {
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
        throw new Error("El link devolvió HTML, no CSV. Publica como Comma-separated values (.csv).");
      }

      const rows = csvToObjects(csvText);
      console.log("[FORMS] Filas leídas:", rows.length);
      console.table(rows.slice(0, 5));

      const sellerNames = getSellerNames();
      console.log("[FORMS] Buscando encargado/vendedor:", sellerNames);

      let revisadas = 0;
      let coinciden = 0;
      let cargadas = 0;

      const nuevasDemosForms = [];
      const nuevosMantenimientosForms = [];

      rows.forEach((row) => {
        revisadas++;

        const encargado = normalizeText(getColumn(row, [
          "ENCARGADO",
          "Encargado"
        ]));

        const vendedores = normalizeText(getColumn(row, [
          "VENDEDORES",
          "VENDEDOR",
          "VENDEDORES (encargado + vendedor)",
          "Vendedores",
          "Vendedor"
        ]));

        const pertenece = sellerNames.some((name) => {
          return encargado.includes(name) || vendedores.includes(name);
        });

        if (!pertenece) return;

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

        const fecha = normalizeGoogleDate(getColumn(row, [
          "DÍA",
          "DIA",
          "FECHA",
          "Fecha"
        ]));

        const hora = normalizeTime(getColumn(row, [
          "HORA",
          "Hora"
        ]));

        const cliente = upper(getColumn(row, [
          "CLIENTE",
          "Cliente",
          "NOMBRE CLIENTE",
          "NOMBRE"
        ]));

        const direccion = upper(getColumn(row, [
          "DIRECCION",
          "DIRECCIÓN",
          "Direccion",
          "Dirección"
        ]));

        const perfil = upper(getColumn(row, [
          "PERFIL",
          "Perfil"
        ]));

        const notas = upper(getColumn(row, [
          "VENDEDORES",
          "VENDEDOR",
          "VENDEDORES (encargado + vendedor)",
          "Vendedores",
          "Vendedor"
        ]));

        if (!fecha || !cliente) return;

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
          vendedor_nombre: state.user?.nombre || "",
          vendedor_email: state.user?.correo || state.user?.email || "",
          origen: "google_forms",
          updated_from_forms_at: new Date().toISOString()
        };

        if (tipo === "demo") {
          nuevasDemosForms.push(item);
        } else {
          nuevosMantenimientosForms.push(item);
        }

        cargadas++;
      });

      /*
        IMPORTANTE:
        Esto borra SOLO los registros anteriores que vinieron de Google Forms
        y que pertenecen al vendedor actual.
        No borra registros manuales hechos desde la página.
      */
      state.demos = state.demos.filter((item) => {
        if (item.origen !== "google_forms") return true;
        return !belongsToUser(item);
      });

      state.mantenimientos = state.mantenimientos.filter((item) => {
        if (item.origen !== "google_forms") return true;
        return !belongsToUser(item);
      });

      /*
        Vuelve a cargar lo que existe actualmente en Google Sheets.
        Si borraste una fila en Sheets, desaparece de la página.
        Si cambiaste MANT por DEMO, se actualiza.
      */
      state.demos.push(...nuevasDemosForms);
      state.mantenimientos.push(...nuevosMantenimientosForms);

      saveAll();
      loadAll();
      renderAll();

      toast(`Forms actualizado. Revisadas: ${revisadas}. Coinciden: ${coinciden}. Cargadas: ${cargadas}.`);

      console.log("[FORMS] Resultado:", {
        revisadas,
        coinciden,
        cargadas,
        nuevasDemosForms,
        nuevosMantenimientosForms
      });
    } catch (error) {
      console.error("[FORMS ERROR]", error);

      const mensaje = error?.message || String(error);

      toast("Error Forms: " + mensaje, true);

      alert(
        "Error al sincronizar Google Forms:\n\n" +
        mensaje +
        "\n\nRevisa:\n" +
        "1. Que abras la página con Live Server.\n" +
        "2. Que el link tenga output=csv.\n" +
        "3. Que el Google Sheet esté publicado como CSV.\n" +
        "4. Que config.js cargue antes de vendedor.js."
      );
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

      if (!map.has(item.fecha)) {
        map.set(item.fecha, []);
      }

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
        .slice(0, 5)
        .map((item) => {
          const cls = item.tipo === "demo" ? "demo-dot" : "mantenimiento-dot";
          return `<i class="dot ${cls}"></i>`;
        })
        .join("");

      cells.push(`
        <div class="${classes.join(" ")}" title="${escapeHtml(buildDayTitle(iso, dayEvents))}">
          <span class="seller-day-number">${day}</span>
          <div class="seller-day-dots">${dots}</div>
        </div>
      `);
    }

    els.calendarGrid.innerHTML = cells.join("");
  }

  function fillClientFields(clienteId) {
    const cliente = state.clientes.find((item) => item.id === clienteId);
    if (!cliente || !els.form) return;

    setValue("nombre_cliente", fullName(cliente));
    setValue("telefono", cliente.telefono);
    setValue("direccion", cliente.direccion);
  }

  function getSellerNames() {
    const sessionName = normalizeText(state.user?.nombre || "");
    const sessionEmail = normalizeText(state.user?.correo || state.user?.email || "");

    let names = [];

    if (typeof IMVICTO_USERS !== "undefined") {
      const configUser = IMVICTO_USERS.find((user) => {
        return (
          normalizeText(user.correo || "") === sessionEmail ||
          normalizeText(user.nombre || "") === sessionName
        );
      });

      if (configUser) {
        names.push(configUser.nombre);

        if (Array.isArray(configUser.alias)) {
          names.push(...configUser.alias);
        }
      }
    }

    names.push(state.user?.nombre || "");

    return [...new Set(names.map(normalizeText).filter(Boolean))];
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

  function countUpcoming(items) {
    const today = startOfDay(new Date());

    return items.filter((item) => {
      if (!item.fecha) return false;
      return parseDate(item.fecha) >= today;
    }).length;
  }

  function buildDayTitle(iso, events) {
    if (!events.length) return formatDate(iso);

    const lines = events.map((item) => {
      const label = item.tipo === "demo" ? "Demo" : "Mantenimiento";
      return `${label}: ${item.nombre_cliente || ""} ${item.hora || ""}`.trim();
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
      if (row[name] !== undefined && row[name] !== "") {
        return row[name];
      }

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

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw;
    }

    const parts = raw.split(/[\/\-\.]/);

    if (parts.length === 3) {
      let first = parts[0].padStart(2, "0");
      let second = parts[1].padStart(2, "0");
      let year = parts[2];

      if (year.length === 2) {
        year = "20" + year;
      }

      /*
        Google Forms en Perú normalmente exporta DD/MM/YYYY.
        Resultado final: YYYY-MM-DD
      */
      return `${year}-${second}-${first}`;
    }

    const parsed = new Date(raw);

    if (!Number.isNaN(parsed.getTime())) {
      return toISODate(parsed);
    }

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

  function addCacheBust(url) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}cacheBust=${Date.now()}`;
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

  function getUser() {
    try {
      return JSON.parse(sessionStorage.getItem("imvicto_user") || "null") || {};
    } catch {
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