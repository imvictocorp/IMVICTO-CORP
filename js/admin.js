(function () {
  const KEYS = {
    clientes: "imvicto_clientes",
    ventas: "imvicto_ventas",
    cuotas: "imvicto_cuotas",
    demos: "imvicto_demos",
    mantenimientos: "imvicto_mantenimientos"
  };

  const state = {
    clientes: [],
    ventas: [],
    cuotas: [],
    demos: [],
    mantenimientos: [],
    editingClientId: null
  };

  const els = {
    navButtons: document.querySelectorAll(".nav-btn"),
    views: document.querySelectorAll(".view"),
    viewTitle: document.getElementById("viewTitle"),
    viewSubtitle: document.getElementById("viewSubtitle"),
    refreshBtn: document.getElementById("refreshBtn"),

    statClientes: document.getElementById("statClientes"),
    statVentas: document.getElementById("statVentas"),
    statVencidas: document.getElementById("statVencidas"),
    statPendiente: document.getElementById("statPendiente"),
    statDemos: document.getElementById("statDemos"),
    statMantenimientos: document.getElementById("statMantenimientos"),

    homeCuotasBody: document.getElementById("homeCuotasBody"),

    clienteForm: document.getElementById("clienteForm"),
    clienteFormTitle: document.getElementById("clienteFormTitle"),
    clienteSubmit: document.getElementById("clienteSubmit"),
    cancelClienteEdit: document.getElementById("cancelClienteEdit"),
    clienteSearch: document.getElementById("clienteSearch"),
    clientesBody: document.getElementById("clientesBody"),

    ventaSearch: document.getElementById("ventaSearch"),
    ventasBody: document.getElementById("ventasBody"),

    cuotaFilter: document.getElementById("cuotaFilter"),
    cuotaSearch: document.getElementById("cuotaSearch"),
    cuotasBody: document.getElementById("cuotasBody"),

    exportExcelBtn: document.getElementById("exportExcelBtn"),
    importExcelInput: document.getElementById("importExcelInput"),
    importClientesBtn: document.getElementById("importClientesBtn"),

    usuariosBody: document.getElementById("usuariosBody"),

    toast: document.getElementById("toast"),
    modalRoot: document.getElementById("modalRoot")
  };

  const viewCopy = {
    inicio: ["Inicio", "Control general de clientes, ventas, cuotas y reportes."],
    clientes: ["Clientes", "Registro, edición y depuración de base de clientes."],
    ventas: ["Ventas", "Ventas registradas por el equipo comercial."],
    cuotas: ["Cuotas", "Control administrativo de vencimientos y pagos."],
    excel: ["Excel", "Importación y exportación de la base local."],
    usuarios: ["Usuarios", "Usuarios configurados para login local."]
  };

  init();

  function init() {
    loadAll();
    bindEvents();
    renderAll();
  }

  function bindEvents() {
    els.navButtons.forEach((btn) => {
      btn.addEventListener("click", () => switchView(btn.dataset.view));
    });

    els.refreshBtn?.addEventListener("click", () => {
      loadAll();
      renderAll();
      toast("Datos actualizados.");
    });

    els.clienteForm?.addEventListener("submit", handleClienteSubmit);
    els.cancelClienteEdit?.addEventListener("click", cancelClientEdit);
    els.clienteSearch?.addEventListener("input", renderClientes);

    els.ventaSearch?.addEventListener("input", renderVentas);

    els.cuotaFilter?.addEventListener("change", renderCuotas);
    els.cuotaSearch?.addEventListener("input", renderCuotas);

    els.exportExcelBtn?.addEventListener("click", exportExcel);
    els.importClientesBtn?.addEventListener("click", importClientesFromExcel);

    document.addEventListener("click", handleDocumentClick);
  }

  function loadAll() {
    state.clientes = readArray(KEYS.clientes);
    state.ventas = readArray(KEYS.ventas);
    state.cuotas = readArray(KEYS.cuotas);
    state.demos = readArray(KEYS.demos);
    state.mantenimientos = readArray(KEYS.mantenimientos);
  }

  function saveAll() {
    writeArray(KEYS.clientes, state.clientes);
    writeArray(KEYS.ventas, state.ventas);
    writeArray(KEYS.cuotas, state.cuotas);
    writeArray(KEYS.demos, state.demos);
    writeArray(KEYS.mantenimientos, state.mantenimientos);
  }

  function renderAll() {
    renderStats();
    renderHomeCuotas();
    renderClientes();
    renderVentas();
    renderCuotas();
    renderUsuarios();
  }

  function switchView(viewName) {
    els.navButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === viewName);
    });

    els.views.forEach((view) => {
      view.classList.toggle("active", view.id === viewName);
    });

    const [title, subtitle] = viewCopy[viewName] || viewCopy.inicio;
    els.viewTitle.textContent = title;
    els.viewSubtitle.textContent = subtitle;
  }

  function renderStats() {
    const today = startOfDay(new Date());

    const vencidas = state.cuotas.filter((cuota) => {
      return cuota.estado !== "pagado" && parseDate(cuota.fecha_vencimiento) < today;
    });

    const pendiente = state.cuotas
      .filter((cuota) => cuota.estado !== "pagado")
      .reduce((sum, cuota) => sum + toNumber(cuota.monto), 0);

    els.statClientes.textContent = state.clientes.length;
    els.statVentas.textContent = state.ventas.length;
    els.statVencidas.textContent = vencidas.length;
    els.statPendiente.textContent = money(pendiente);
    els.statDemos.textContent = state.demos.length;
    els.statMantenimientos.textContent = state.mantenimientos.length;
  }

  function renderHomeCuotas() {
    const today = startOfDay(new Date());
    const limit = addDays(today, 14);

    const cuotas = state.cuotas
      .filter((cuota) => cuota.estado !== "pagado")
      .filter((cuota) => {
        const date = parseDate(cuota.fecha_vencimiento);
        return date >= today && date <= limit;
      })
      .sort((a, b) => String(a.fecha_vencimiento).localeCompare(String(b.fecha_vencimiento)));

    if (!cuotas.length) {
      els.homeCuotasBody.innerHTML = `<tr><td colspan="5" class="empty-row">No hay cuotas próximas.</td></tr>`;
      return;
    }

    els.homeCuotasBody.innerHTML = cuotas.map((cuota) => {
      return `
        <tr>
          <td>${escapeHtml(cuota.cliente_nombre || "")}</td>
          <td>${escapeHtml(cuota.numero_cuota || "")}</td>
          <td>${money(cuota.monto)}</td>
          <td>${formatDate(cuota.fecha_vencimiento)}</td>
          <td>${cuotaBadge(cuota)}</td>
        </tr>
      `;
    }).join("");
  }

  function renderClientes() {
    const q = normalizeText(els.clienteSearch?.value || "");

    const clientes = state.clientes.filter((cliente) => {
      const haystack = normalizeText([
        cliente.nombres,
        cliente.apellidos,
        cliente.dni,
        cliente.telefono,
        cliente.codigo_cliente
      ].join(" "));

      return haystack.includes(q);
    });

    if (!clientes.length) {
      els.clientesBody.innerHTML = `<tr><td colspan="6" class="empty-row">No hay clientes para mostrar.</td></tr>`;
      return;
    }

    els.clientesBody.innerHTML = clientes.map((cliente) => {
      const ventasCliente = state.ventas.filter((venta) => venta.cliente_id === cliente.id).length;

      return `
        <tr>
          <td>
            <div class="client-name">${escapeHtml(fullName(cliente))}</div>
            <div class="client-sub">${ventasCliente} venta(s)</div>
          </td>
          <td>${escapeHtml(cliente.dni || "")}</td>
          <td>${escapeHtml(cliente.telefono || "")}</td>
          <td>${escapeHtml(cliente.codigo_cliente || "")}</td>
          <td>${escapeHtml(cliente.nivel_cliente || "")}</td>
          <td>
            <div class="row-actions">
              <button class="btn secondary mini" data-action="edit-client" data-id="${cliente.id}">Editar</button>
              <button class="btn danger mini" data-action="delete-client" data-id="${cliente.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  function renderVentas() {
    const q = normalizeText(els.ventaSearch?.value || "");

    const ventas = state.ventas.filter((venta) => {
      const haystack = normalizeText([
        venta.cliente_nombre,
        venta.vendedor_nombre,
        venta.numero_orden,
        venta.tipo_contrato,
        venta.mercaderia
      ].join(" "));

      return haystack.includes(q);
    });

    if (!ventas.length) {
      els.ventasBody.innerHTML = `<tr><td colspan="7" class="empty-row">No hay ventas registradas.</td></tr>`;
      return;
    }

    els.ventasBody.innerHTML = ventas.map((venta) => {
      const docs = Array.isArray(venta.documentos) ? venta.documentos.length : 0;

      return `
        <tr>
          <td>${escapeHtml(venta.cliente_nombre || "")}</td>
          <td>${escapeHtml(venta.vendedor_nombre || "")}</td>
          <td>${escapeHtml(venta.numero_orden || "")}</td>
          <td>${escapeHtml(venta.tipo_contrato || "")}</td>
          <td>${escapeHtml(venta.mercaderia || "")}</td>
          <td>${money(venta.monto_total)}</td>
          <td>${docs} archivo(s)</td>
        </tr>
      `;
    }).join("");
  }

  function renderCuotas() {
    const q = normalizeText(els.cuotaSearch?.value || "");
    const filter = els.cuotaFilter?.value || "todas";

    let cuotas = state.cuotas.filter((cuota) => {
      const haystack = normalizeText(cuota.cliente_nombre || "");
      return haystack.includes(q);
    });

    if (filter !== "todas") {
      cuotas = cuotas.filter((cuota) => getCuotaEstado(cuota) === filter);
    }

    const groups = groupBy(cuotas, "cliente_id");

    const rows = Object.values(groups).map((items) => {
      const first = items[0];
      const pendientes = items.filter((cuota) => cuota.estado !== "pagado");
      const vencidas = items.filter((cuota) => getCuotaEstado(cuota) === "vencido");
      const totalPendiente = pendientes.reduce((sum, cuota) => sum + toNumber(cuota.monto), 0);

      const detail = items
        .sort((a, b) => toNumber(a.numero_cuota) - toNumber(b.numero_cuota))
        .map((cuota) => {
          return `
            <div>
              Cuota ${escapeHtml(cuota.numero_cuota || "")} ·
              ${money(cuota.monto)} ·
              ${formatDate(cuota.fecha_vencimiento)} ·
              ${cuotaBadge(cuota)}
            </div>
          `;
        })
        .join("");

      return `
        <tr>
          <td>${escapeHtml(first.cliente_nombre || "")}</td>
          <td>${items.length}</td>
          <td>${pendientes.length}</td>
          <td>${vencidas.length}</td>
          <td>${money(totalPendiente)}</td>
          <td><div class="detail-box">${detail}</div></td>
        </tr>
      `;
    });

    if (!rows.length) {
      els.cuotasBody.innerHTML = `<tr><td colspan="6" class="empty-row">No hay cuotas para mostrar.</td></tr>`;
      return;
    }

    els.cuotasBody.innerHTML = rows.join("");
  }

  function renderUsuarios() {
    if (typeof IMVICTO_USERS === "undefined") {
      els.usuariosBody.innerHTML = `<tr><td colspan="4" class="empty-row">No se cargó config.js.</td></tr>`;
      return;
    }

    els.usuariosBody.innerHTML = IMVICTO_USERS.map((user) => {
      return `
        <tr>
          <td>${escapeHtml(user.nombre || "")}</td>
          <td>${escapeHtml(user.correo || "")}</td>
          <td>${escapeHtml(user.rol || "")}</td>
          <td>${escapeHtml(Array.isArray(user.alias) ? user.alias.join(", ") : "")}</td>
        </tr>
      `;
    }).join("");
  }

  function handleClienteSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const data = new FormData(form);

    const cliente = {
      id: state.editingClientId || makeId(),
      anio: toInt(data.get("anio")),
      nombres: upper(data.get("nombres")),
      apellidos: upper(data.get("apellidos")),
      dni: clean(data.get("dni")),
      telefono: clean(data.get("telefono")),
      telefono_referencia: clean(data.get("telefono_referencia")),
      correo: clean(data.get("correo")),
      codigo_cliente: clean(data.get("codigo_cliente")),
      estado_civil: clean(data.get("estado_civil")),
      nivel_cliente: clean(data.get("nivel_cliente")),
      direccion: upper(data.get("direccion")),
      observaciones: clean(data.get("observaciones")),
      updated_at: new Date().toISOString()
    };

    if (state.editingClientId) {
      state.clientes = state.clientes.map((item) => {
        return item.id === state.editingClientId ? { ...item, ...cliente } : item;
      });

      syncClientName(cliente);
      toast("Cliente actualizado.");
    } else {
      cliente.created_at = new Date().toISOString();
      state.clientes.push(cliente);
      toast("Cliente guardado.");
    }

    saveAll();
    cancelClientEdit();
    loadAll();
    renderAll();
  }

  function editClient(id) {
    const cliente = state.clientes.find((item) => item.id === id);
    if (!cliente || !els.clienteForm) return;

    state.editingClientId = id;

    setFormValue("anio", cliente.anio);
    setFormValue("nombres", cliente.nombres);
    setFormValue("apellidos", cliente.apellidos);
    setFormValue("dni", cliente.dni);
    setFormValue("telefono", cliente.telefono);
    setFormValue("telefono_referencia", cliente.telefono_referencia);
    setFormValue("correo", cliente.correo);
    setFormValue("codigo_cliente", cliente.codigo_cliente);
    setFormValue("estado_civil", cliente.estado_civil);
    setFormValue("nivel_cliente", cliente.nivel_cliente);
    setFormValue("direccion", cliente.direccion);
    setFormValue("observaciones", cliente.observaciones);

    els.clienteFormTitle.textContent = "Modificar cliente";
    els.clienteSubmit.textContent = "Actualizar cliente";
    els.cancelClienteEdit.classList.remove("hidden");

    switchView("clientes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteClient(id) {
    const cliente = state.clientes.find((item) => item.id === id);
    if (!cliente) return;

    showConfirm({
      title: "Eliminar cliente",
      message: `¿Seguro que deseas eliminar a ${fullName(cliente)}? Sus ventas/cuotas no se eliminan automáticamente.`,
      confirmText: "Eliminar",
      onConfirm: () => {
        state.clientes = state.clientes.filter((item) => item.id !== id);
        saveAll();
        loadAll();
        renderAll();
        toast("Cliente eliminado.");
      }
    });
  }

  function cancelClientEdit() {
    state.editingClientId = null;
    els.clienteForm?.reset();
    els.clienteFormTitle.textContent = "Nuevo cliente";
    els.clienteSubmit.textContent = "Guardar cliente";
    els.cancelClienteEdit.classList.add("hidden");
  }

  function syncClientName(cliente) {
    const name = fullName(cliente);

    state.ventas = state.ventas.map((venta) => {
      return venta.cliente_id === cliente.id ? { ...venta, cliente_nombre: name } : venta;
    });

    state.cuotas = state.cuotas.map((cuota) => {
      return cuota.cliente_id === cliente.id ? { ...cuota, cliente_nombre: name } : cuota;
    });

    state.demos = state.demos.map((demo) => {
      return demo.cliente_id === cliente.id ? { ...demo, nombre_cliente: name } : demo;
    });

    state.mantenimientos = state.mantenimientos.map((item) => {
      return item.cliente_id === cliente.id ? { ...item, nombre_cliente: name } : item;
    });
  }

  function exportExcel() {
    if (typeof XLSX === "undefined") {
      toast("No se cargó la librería XLSX.", true);
      return;
    }

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(state.clientes), "Clientes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(state.ventas), "Ventas");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(state.cuotas), "Cuotas");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(state.demos), "Demos");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(state.mantenimientos), "Mantenimientos");

    XLSX.writeFile(wb, `IMVICTO_BASE_${toISODate(new Date())}.xlsx`);
  }

  async function importClientesFromExcel() {
    const file = els.importExcelInput?.files?.[0];

    if (!file) {
      toast("Selecciona un archivo Excel.", true);
      return;
    }

    if (typeof XLSX === "undefined") {
      toast("No se cargó la librería XLSX.", true);
      return;
    }

    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let imported = 0;

    rows.forEach((row) => {
      const cliente = {
        id: makeId(),
        anio: toInt(getColumn(row, ["AÑO", "ANIO", "Año"])),
        nombres: upper(getColumn(row, ["NOMBRES", "Nombres", "Nombre"])),
        apellidos: upper(getColumn(row, ["APELLIDOS", "Apellidos"])),
        dni: clean(getColumn(row, ["DNI", "Dni"])),
        telefono: clean(getColumn(row, ["TEL PERSONAL", "TELÉFONO", "TELEFONO", "Teléfono"])),
        telefono_referencia: clean(getColumn(row, ["TEL DE REFERENCIA", "TEL REFERENCIA"])),
        correo: clean(getColumn(row, ["CORREO", "Correo"])),
        codigo_cliente: clean(getColumn(row, ["N° CLIENTE", "CODIGO CLIENTE", "CÓDIGO CLIENTE"])),
        estado_civil: upper(getColumn(row, ["ESTADO CIVIL", "Estado civil"])),
        nivel_cliente: clean(getColumn(row, ["NIVEL DE CLIENTE", "NIVEL CLIENTE", "Nivel"])),
        direccion: upper(getColumn(row, ["DIRECCIÓN", "DIRECCION", "Dirección"])),
        observaciones: "",
        created_at: new Date().toISOString()
      };

      if (!cliente.nombres || !cliente.apellidos) return;

      const existingIndex = state.clientes.findIndex((item) => {
        return cliente.dni && item.dni === cliente.dni;
      });

      if (existingIndex >= 0) {
        state.clientes[existingIndex] = {
          ...state.clientes[existingIndex],
          ...cliente,
          id: state.clientes[existingIndex].id
        };
      } else {
        state.clientes.push(cliente);
      }

      imported++;
    });

    saveAll();
    loadAll();
    renderAll();

    toast(`Clientes importados/actualizados: ${imported}.`);
  }

  function handleDocumentClick(event) {
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;

    if (!action || !id) return;

    if (action === "edit-client") editClient(id);
    if (action === "delete-client") deleteClient(id);
  }

  function showConfirm({ title, message, confirmText, onConfirm }) {
    els.modalRoot.classList.remove("hidden");

    els.modalRoot.innerHTML = `
      <div class="modal-card">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(message)}</p>
        <div class="modal-actions">
          <button class="btn ghost" id="modalCancel">Cancelar</button>
          <button class="btn danger" id="modalConfirm">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    document.getElementById("modalCancel").onclick = closeModal;
    document.getElementById("modalConfirm").onclick = () => {
      closeModal();
      onConfirm();
    };
  }

  function closeModal() {
    els.modalRoot.classList.add("hidden");
    els.modalRoot.innerHTML = "";
  }

  function cuotaBadge(cuota) {
    const estado = getCuotaEstado(cuota);
    return `<span class="badge ${estado}">${estado}</span>`;
  }

  function getCuotaEstado(cuota) {
    if (cuota.estado === "pagado") return "pagado";

    const today = startOfDay(new Date());
    const vence = parseDate(cuota.fecha_vencimiento);

    if (vence < today) return "vencido";
    return "pendiente";
  }

  function groupBy(items, key) {
    return items.reduce((acc, item) => {
      const value = item[key] || "sin_id";
      if (!acc[value]) acc[value] = [];
      acc[value].push(item);
      return acc;
    }, {});
  }

  function getColumn(row, names) {
    for (const name of names) {
      if (row[name] !== undefined && row[name] !== "") return row[name];
    }

    return "";
  }

  function setFormValue(name, value) {
    const input = els.clienteForm.querySelector(`[name="${name}"]`);
    if (input) input.value = value || "";
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

  function toNumber(value) {
    return Number(value || 0);
  }

  function toInt(value) {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? "" : parsed;
  }

  function money(value) {
    return `S/ ${toNumber(value).toFixed(2)}`;
  }

  function makeId() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function fullName(cliente) {
    return `${cliente?.nombres || ""} ${cliente?.apellidos || ""}`.trim();
  }

  function parseDate(value) {
    return new Date(value + "T00:00:00");
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
    }, 3500);
  }
})();