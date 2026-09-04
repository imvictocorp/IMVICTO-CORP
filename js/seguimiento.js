(function () {
  const KEYS = {
    demos: "imvicto_demos",
    mantenimientos: "imvicto_mantenimientos"
  };

  const state = {
    demos: [],
    mantenimientos: [],
    calendarDate: startOfMonth(new Date())
  };

  const els = {
    syncFormsBtn: document.getElementById("syncFormsBtn"),
    clearFiltersBtn: document.getElementById("clearFiltersBtn"),
    exportSeguimientoBtn: document.getElementById("exportSeguimientoBtn"),

    filterVendedor: document.getElementById("filterVendedor"),
    filterTipo: document.getElementById("filterTipo"),
    filterDesde: document.getElementById("filterDesde"),
    filterHasta: document.getElementById("filterHasta"),
    filterSearch: document.getElementById("filterSearch"),

    statDemos: document.getElementById("statDemos"),
    statMantenimientos: document.getElementById("statMantenimientos"),
    statHoy: document.getElementById("statHoy"),
    statSemana: document.getElementById("statSemana"),

    calendarPrev: document.getElementById("calendarPrev"),
    calendarNext: document.getElementById("calendarNext"),
    calendarLabel: document.getElementById("calendarLabel"),
    calendarGrid: document.getElementById("calendarGrid"),

    sellerSummary: document.getElementById("sellerSummary"),
    followList: document.getElementById("followList"),

    toast: document.getElementById("toast")
  };

  init();

  function init() {
    loadAll();
    bindEvents();
    renderAll();
  }

  function bindEvents() {
    els.syncFormsBtn?.addEventListener("click", syncFormsAll);
    els.clearFiltersBtn?.addEventListener("click", clearFilters);
    els.exportSeguimientoBtn?.addEventListener("click", exportSeguimiento);

    [
      els.filterVendedor,
      els.filterTipo,
      els.filterDesde,
      els.filterHasta,
      els.filterSearch
    ].forEach((input) => {
      input?.addEventListener("input", renderAll);
      input?.addEventListener("change", renderAll);
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
    state.demos = readArray(KEYS.demos);
    state.mantenimientos = readArray(KEYS.mantenimientos);
  }

  function saveAll() {
    writeArray(KEYS.demos, state.demos);
    writeArray(KEYS.mantenimientos, state.mantenimientos);
  }

  function renderAll() {
    renderVendorFilter();
    renderStats();
    renderSummary();
    renderList();
    renderCalendar();
  }

  function getAllItems() {
    return [
      ...state.demos.map((item) => ({ ...item, tipo: "demo" })),
      ...state.mantenimientos.map((item) => ({ ...item, tipo: "mantenimiento" }))
    ];
  }

  function getFilteredItems() {
    const vendedor = normalizeText(els.filterVendedor?.value || "");
    const tipo = els.filterTipo?.value || "";
    const desde = els.filterDesde?.value || "";
    const hasta = els.filterHasta?.value || "";
    const search = normalizeText(els.filterSearch?.value || "");

    return getAllItems().filter((item) => {
      const itemVendedor = normalizeText(item.vendedor_nombre || item.encargado || "");
      const haystack = normalizeText([
        item.nombre_cliente,
        item.direccion,
        item.perfil,
        item.vendedor_nombre,
        item.notas
      ].join(" "));

      if (vendedor && itemVendedor !== vendedor) return false;
      if (tipo && item.tipo !== tipo) return false;
      if (desde && item.fecha < desde) return false;
      if (hasta && item.fecha > hasta) return false;
      if (search && !haystack.includes(search)) return false;

      return true;
    });
  }

  function renderVendorFilter() {
    const current = els.filterVendedor?.value || "";

    const vendors = [...new Set(getAllItems()
      .map((item) => item.vendedor_nombre || item.encargado || "")
      .filter(Boolean)
      .map(normalizeText)
    )].sort();

    els.filterVendedor.innerHTML = `
      <option value="">Todos</option>
      ${vendors.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("")}
    `;

    els.filterVendedor.value = current;
  }

  function renderStats() {
    const all = getAllItems();
    const today = toISODate(new Date());
    const weekLimit = toISODate(addDays(new Date(), 7));

    els.statDemos.textContent = all.filter((item) => item.tipo === "demo").length;
    els.statMantenimientos.textContent = all.filter((item) => item.tipo === "mantenimiento").length;
    els.statHoy.textContent = all.filter((item) => item.fecha === today).length;
    els.statSemana.textContent = all.filter((item) => item.fecha >= today && item.fecha <= weekLimit).length;
  }

  function renderSummary() {
    const items = getFilteredItems();
    const grouped = {};

    items.forEach((item) => {
      const vendedor = normalizeText(item.vendedor_nombre || item.encargado || "SIN VENDEDOR");

      if (!grouped[vendedor]) {
        grouped[vendedor] = {
          vendedor,
          demos: 0,
          mantenimientos: 0,
          total: 0
        };
      }

      grouped[vendedor].total++;

      if (item.tipo === "demo") {
        grouped[vendedor].demos++;
      } else {
        grouped[vendedor].mantenimientos++;
      }
    });

    els.sellerSummary.innerHTML = Object.values(grouped)
      .sort((a, b) => b.total - a.total)
      .map((item) => {
        return `
          <article class="seller-card">
            <strong>${escapeHtml(item.vendedor)}</strong>
            <div>
              <span>Demos: ${item.demos}</span>
              <span>Mantenimientos: ${item.mantenimientos}</span>
              <span>Total: ${item.total}</span>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderList() {
    const items = sortByDate(getFilteredItems());

    els.followList.innerHTML = items.map(renderItem).join("");
  }

  function renderItem(item) {
    const label = item.tipo === "demo" ? "Demo" : "Mantenimiento";

    return `
      <article class="follow-card ${escapeHtml(item.tipo)}">
        <div class="follow-card-top">
          <div>
            <strong>${escapeHtml(item.nombre_cliente || "")}</strong>

            <div class="follow-meta">
              <span>${formatDate(item.fecha)}</span>
              <span>${escapeHtml(item.hora || "Sin hora")}</span>
              <span>${escapeHtml(item.vendedor_nombre || "Sin vendedor")}</span>
              <span>${escapeHtml(item.perfil || "Sin perfil")}</span>
            </div>

            ${item.direccion ? `<div class="follow-address">${escapeHtml(item.direccion)}</div>` : ""}
            ${item.notas ? `<p class="follow-notes">${escapeHtml(item.notas)}</p>` : ""}
          </div>

          <span class="follow-badge ${escapeHtml(item.tipo)}">${label}</span>
        </div>
      </article>
    `;
  }

  function renderCalendar() {
    const monthStart = startOfMonth(state.calendarDate);
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const todayISO = toISODate(new Date());
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (monthStart.getDay() + 6) % 7;

    els.calendarLabel.textContent = monthStart.toLocaleDateString("es-PE", {
      month: "long",
      year: "numeric"
    });

    const map = new Map();

    getFilteredItems().forEach((item) => {
      if (!item.fecha) return;

      const date = parseDate(item.fecha);

      if (date.getFullYear() !== year || date.getMonth() !== month) return;

      if (!map.has(item.fecha)) map.set(item.fecha, []);
      map.get(item.fecha).push(item);
    });

    const cells = [];

    for (let i = 0; i < offset; i++) {
      cells.push(`<div class="follow-day empty"></div>`);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const iso = toISODate(new Date(year, month, day));
      const dayEvents = map.get(iso) || [];

      const classes = ["follow-day"];
      if (iso === todayISO) classes.push("today");
      if (dayEvents.length) classes.push("has-events");

      const dots = dayEvents
        .slice(0, 6)
        .map((item) => {
          const cls = item.tipo === "demo" ? "demo-dot" : "mantenimiento-dot";
          return `<i class="dot ${cls}"></i>`;
        })
        .join("");

      cells.push(`
        <div class="${classes.join(" ")}" title="${escapeHtml(buildDayTitle(iso, dayEvents))}">
          <span class="follow-day-number">${day}</span>
          <div class="follow-day-dots">${dots}</div>
        </div>
      `);
    }

    els.calendarGrid.innerHTML = cells.join("");
  }

  async function syncFormsAll() {
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
      toast("El link debe ser CSV y contener output=csv.", true);
      return;
    }

    try {
      toast("Sincronizando Google Forms...");

      const response = await fetch(addCacheBust(csvUrl), {
        method: "GET",
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      const csvText = await response.text();

      if (csvText.toLowerCase().includes("<html")) {
        throw new Error("El link devolvió HTML, no CSV.");
      }

      const rows = csvToObjects(csvText);

      const nuevasDemos = [];
      const nuevosMantenimientos = [];

      rows.forEach((row) => {
        const tipoRaw = normalizeText(getColumn(row, [
          "TIPO DE CITA",
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

        const cliente = upper(getColumn(row, [
          "CLIENTE",
          "Cliente",
          "NOMBRE CLIENTE",
          "NOMBRE"
        ]));

        if (!fecha || !cliente) return;

        const encargado = upper(getColumn(row, [
          "ENCARGADO",
          "Encargado"
        ]));

        const vendedores = upper(getColumn(row, [
          "VENDEDORES",
          "VENDEDOR",
          "VENDEDORES (encargado + vendedor)",
          "Vendedores",
          "Vendedor"
        ]));

        const item = {
          id: makeId(),
          tipo,
          cliente_id: null,
          nombre_cliente: cliente,
          telefono: "",
          direccion: upper(getColumn(row, ["DIRECCION", "DIRECCIÓN", "Direccion", "Dirección"])),
          perfil: upper(getColumn(row, ["PERFIL", "Perfil"])),
          fecha,
          hora: normalizeTime(getColumn(row, ["HORA", "Hora"])),
          notas: vendedores,
          vendedor_nombre: encargado || vendedores,
          vendedor_email: "",
          encargado,
          origen: "google_forms",
          updated_from_forms_at: new Date().toISOString()
        };

        if (tipo === "demo") {
          nuevasDemos.push(item);
        } else {
          nuevosMantenimientos.push(item);
        }
      });

      state.demos = state.demos.filter((item) => item.origen !== "google_forms");
      state.mantenimientos = state.mantenimientos.filter((item) => item.origen !== "google_forms");

      state.demos.push(...nuevasDemos);
      state.mantenimientos.push(...nuevosMantenimientos);

      saveAll();
      loadAll();
      renderAll();

      toast(`Forms actualizado. Demos: ${nuevasDemos.length}. Mantenimientos: ${nuevosMantenimientos.length}.`);
    } catch (error) {
      console.error("[SEGUIMIENTO FORMS ERROR]", error);
      toast("Error al sincronizar Forms: " + (error?.message || error), true);
    }
  }

  function clearFilters() {
    els.filterVendedor.value = "";
    els.filterTipo.value = "";
    els.filterDesde.value = "";
    els.filterHasta.value = "";
    els.filterSearch.value = "";
    renderAll();
  }

  function exportSeguimiento() {
    if (typeof XLSX === "undefined") {
      toast("No se cargó XLSX.", true);
      return;
    }

    const items = getFilteredItems();

    const rows = items.map((item) => ({
      Tipo: item.tipo,
      Cliente: item.nombre_cliente,
      Fecha: item.fecha,
      Hora: item.hora,
      Vendedor: item.vendedor_nombre,
      Perfil: item.perfil,
      Direccion: item.direccion,
      Notas: item.notas,
      Origen: item.origen
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Seguimiento");
    XLSX.writeFile(wb, `IMVICTO_SEGUIMIENTO_${toISODate(new Date())}.xlsx`);
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

      const normalized = normalizeText(name);
      if (row[normalized] !== undefined && row[normalized] !== "") return row[normalized];
    }

    return "";
  }

  function normalizeGoogleDate(value) {
    const raw = clean(value);
    if (!raw) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const parts = raw.split(/[\/\-\.]/);

    if (parts.length === 3) {
      let d = parts[0].padStart(2, "0");
      let m = parts[1].padStart(2, "0");
      let y = parts[2];

      if (y.length === 2) y = "20" + y;

      return `${y}-${m}-${d}`;
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

  function buildDayTitle(iso, events) {
    if (!events.length) return formatDate(iso);

    const lines = events.map((item) => {
      const label = item.tipo === "demo" ? "Demo" : "Mantenimiento";
      return `${label}: ${item.nombre_cliente || ""} · ${item.vendedor_nombre || ""} · ${item.hora || ""}`.trim();
    });

    return `${formatDate(iso)}\n${lines.join("\n")}`;
  }

  function sortByDate(items) {
    return items.slice().sort((a, b) => {
      return `${a.fecha || ""} ${a.hora || ""}`.localeCompare(`${b.fecha || ""} ${b.hora || ""}`);
    });
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

  function addCacheBust(url) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}cacheBust=${Date.now()}`;
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

  function makeId() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function parseDate(value) {
    return new Date(value + "T00:00:00");
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