(function () {
  const state = {
    clientes: [],
    ventas: [],
    cuotas: [],
    editingClientId: null
  };

  const els = {
    clienteForm: document.getElementById("clienteForm"),
    clienteFormTitle: document.getElementById("clienteFormTitle"),
    clienteSubmit: document.getElementById("clienteSubmit"),
    cancelClienteEdit: document.getElementById("cancelClienteEdit"),

    clientesBody:
      document.getElementById("clientesBody") ||
      document.getElementById("clientesTableBody") ||
      document.querySelector("[data-clientes-body]"),

    clienteSearch:
      document.getElementById("clienteSearch") ||
      document.querySelector("[data-cliente-search]"),

    excelInput:
      document.getElementById("excelInput") ||
      document.getElementById("importExcelInput") ||
      document.querySelector('input[type="file"]'),

    importBtn:
      document.getElementById("importBtn") ||
      document.getElementById("importClientesBtn") ||
      document.querySelector("[data-import-clientes]"),

    toast: document.getElementById("toast")
  };

  init();

  async function init() {
    bindEvents();
    await loadFromSupabase();
    renderAll();
  }

  function bindEvents() {
    if (els.clienteForm) {
      els.clienteForm.addEventListener("submit", handleClienteSubmit);
    }

    if (els.cancelClienteEdit) {
      els.cancelClienteEdit.addEventListener("click", cancelClientEdit);
    }

    if (els.clienteSearch) {
      els.clienteSearch.addEventListener("input", renderClientes);
    }

    if (els.importBtn) {
      els.importBtn.addEventListener("click", handleExcelImport);
    }

    document.addEventListener("click", async function (event) {
      const editBtn = event.target.closest("[data-action='edit-cliente']");
      const deleteBtn = event.target.closest("[data-action='delete-cliente']");

      if (editBtn) {
        const id = editBtn.dataset.id;
        editClient(id);
      }

      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        await deleteClient(id);
      }
    });
  }

  async function loadFromSupabase() {
    try {
      ensureSupabaseReady();

      const [clientes, ventas, cuotas] = await Promise.all([
        DB.getAll("clientes"),
        DB.getAll("ventas"),
        DB.getAll("cuotas")
      ]);

      state.clientes = clientes;
      state.ventas = ventas;
      state.cuotas = cuotas;

      toast("Datos cargados desde Supabase.");
    } catch (error) {
      console.error("[SUPABASE LOAD ERROR]", error);
      toast("Error cargando Supabase: " + error.message, true);
    }
  }

  function renderAll() {
    renderClientes();
  }

  function renderClientes() {
    if (!els.clientesBody) {
      console.warn("No encontré el contenedor de clientes. Falta id='clientesBody'.");
      return;
    }

    const search = normalizeText(els.clienteSearch?.value || "");

    const clientes = state.clientes.filter((cliente) => {
      const text = normalizeText([
        cliente.nombres,
        cliente.apellidos,
        cliente.dni,
        cliente.telefono,
        cliente.numero_cliente,
        cliente.codigo_cliente
      ].join(" "));

      return !search || text.includes(search);
    });

    if (!clientes.length) {
      els.clientesBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-cell">No hay clientes registrados.</td>
        </tr>
      `;
      return;
    }

    els.clientesBody.innerHTML = clientes.map((cliente) => {
      const ventasCliente = state.ventas.filter((venta) => {
        return venta.cliente_id === cliente.id || venta.dni === cliente.dni;
      }).length;

      return `
        <tr>
          <td>
            <strong>${escapeHtml(fullName(cliente))}</strong>
            <small>${ventasCliente} venta(s)</small>
          </td>
          <td>${escapeHtml(cliente.dni || "")}</td>
          <td>${escapeHtml(cliente.telefono || "")}</td>
          <td>${escapeHtml(cliente.numero_cliente || cliente.codigo_cliente || "")}</td>
          <td>${escapeHtml(cliente.nivel_cliente || "")}</td>
          <td>
            <button type="button" class="btn mini secondary" data-action="edit-cliente" data-id="${cliente.id}">
              Editar
            </button>
            <button type="button" class="btn mini danger" data-action="delete-cliente" data-id="${cliente.id}">
              Eliminar
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  async function handleClienteSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const data = new FormData(form);

    const clientePayload = {
      nombres: upper(data.get("nombres")),
      apellidos: upper(data.get("apellidos")),
      numero_orden: clean(data.get("numero_orden")),
      numero_cliente: clean(data.get("numero_cliente")),
      fecha_orden: dateOrNull(data.get("fecha_orden")),
      estado_pedido: upper(data.get("estado_pedido")),
      correo: clean(data.get("correo")),
      telefono: clean(data.get("telefono")),
      dni: clean(data.get("dni")),
      direccion: upper(data.get("direccion")),
      mercaderia: upper(data.get("mercaderia")),
      regalo: upper(data.get("regalo")),
      estado_civil: upper(data.get("estado_civil")),
      nivel_cliente: clean(data.get("nivel_cliente")),
      tipo_contrato: upper(data.get("tipo_contrato")),
      monto_total: toNumber(data.get("monto_total")),
      monto_cuota: toNumber(data.get("monto_cuota")),
      cantidad_cuotas: toInt(data.get("cantidad_cuotas")),
      fecha_pago: dateOrNull(data.get("fecha_pago")),
      observaciones: clean(data.get("observaciones")),
      updated_at: new Date().toISOString()
    };

    const validation = validateCliente(clientePayload);
    if (validation) {
      toast(validation, true);
      return;
    }

    try {
      ensureSupabaseReady();

      let savedCliente;

      if (state.editingClientId) {
        savedCliente = await DB.update("clientes", state.editingClientId, clientePayload);
        await syncVentasCliente(savedCliente);
        toast("Cliente actualizado.");
      } else {
        const existing = state.clientes.find((item) => {
          return item.dni && clientePayload.dni && item.dni === clientePayload.dni;
        });

        if (existing) {
          savedCliente = await DB.update("clientes", existing.id, clientePayload);
        } else {
          savedCliente = await DB.insert("clientes", clientePayload);
        }

        const ventaPayload = buildVentaPayload(savedCliente, clientePayload);
        const savedVenta = await DB.insert("ventas", ventaPayload);

        await generarCuotasDesdeVenta(savedVenta);

        toast("Registro guardado en Supabase.");
      }

      cancelClientEdit();
      await loadFromSupabase();
      renderAll();
    } catch (error) {
      console.error("[SAVE ERROR]", error);
      toast("Error al guardar: " + error.message, true);
    }
  }

  function buildVentaPayload(cliente, source) {
    return {
      cliente_id: cliente.id,
      cliente_nombre: fullName(cliente),
      nombres: source.nombres,
      apellidos: source.apellidos,
      numero_orden: source.numero_orden,
      numero_cliente: source.numero_cliente,
      fecha_orden: source.fecha_orden,
      estado_pedido: source.estado_pedido,
      correo: source.correo,
      telefono: source.telefono,
      dni: source.dni,
      direccion: source.direccion,
      mercaderia: source.mercaderia,
      regalo: source.regalo,
      estado_civil: source.estado_civil,
      nivel_cliente: source.nivel_cliente,
      tipo_contrato: source.tipo_contrato,
      monto_total: source.monto_total,
      monto_cuota: source.monto_cuota,
      cantidad_cuotas: source.cantidad_cuotas,
      fecha_pago: source.fecha_pago,
      vendedor_nombre: ""
    };
  }

  async function generarCuotasDesdeVenta(venta) {
    await DB.deleteWhere("cuotas", "venta_id", venta.id);

    if (normalizeText(venta.estado_pedido) === "CANCELACION TOTAL") {
      return;
    }

    if (!venta.monto_cuota || !venta.cantidad_cuotas || !venta.fecha_pago) {
      return;
    }

    const cuotas = [];

    for (let i = 1; i <= Number(venta.cantidad_cuotas); i++) {
      cuotas.push({
        venta_id: venta.id,
        cliente_id: venta.cliente_id,
        cliente_nombre: venta.cliente_nombre,
        numero_orden: venta.numero_orden,
        numero_cliente: venta.numero_cliente,
        numero_cuota: i,
        monto: Number(venta.monto_cuota),
        fecha_vencimiento: addMonthsToDate(venta.fecha_pago, i - 1),
        estado: "pendiente",
        estado_pedido: venta.estado_pedido,
        tipo_contrato: venta.tipo_contrato
      });
    }

    await DB.insertMany("cuotas", cuotas);
  }

  async function syncVentasCliente(cliente) {
    const ventasCliente = state.ventas.filter((venta) => {
      return venta.cliente_id === cliente.id || venta.dni === cliente.dni;
    });

    for (const venta of ventasCliente) {
      await DB.update("ventas", venta.id, {
        cliente_nombre: fullName(cliente),
        nombres: cliente.nombres,
        apellidos: cliente.apellidos,
        correo: cliente.correo,
        telefono: cliente.telefono,
        dni: cliente.dni,
        direccion: cliente.direccion,
        estado_civil: cliente.estado_civil,
        nivel_cliente: cliente.nivel_cliente
      });
    }
  }

  function editClient(id) {
    const cliente = state.clientes.find((item) => item.id === id);

    if (!cliente) {
      toast("No encontré el cliente para editar.", true);
      return;
    }

    state.editingClientId = id;

    setValue("nombres", cliente.nombres);
    setValue("apellidos", cliente.apellidos);
    setValue("numero_orden", cliente.numero_orden);
    setValue("numero_cliente", cliente.numero_cliente || cliente.codigo_cliente);
    setValue("fecha_orden", cliente.fecha_orden);
    setValue("estado_pedido", cliente.estado_pedido);
    setValue("correo", cliente.correo);
    setValue("telefono", cliente.telefono);
    setValue("dni", cliente.dni);
    setValue("direccion", cliente.direccion);
    setValue("mercaderia", cliente.mercaderia);
    setValue("regalo", cliente.regalo);
    setValue("estado_civil", cliente.estado_civil);
    setValue("nivel_cliente", cliente.nivel_cliente);
    setValue("tipo_contrato", cliente.tipo_contrato);
    setValue("monto_total", cliente.monto_total);
    setValue("monto_cuota", cliente.monto_cuota);
    setValue("cantidad_cuotas", cliente.cantidad_cuotas);
    setValue("fecha_pago", cliente.fecha_pago);
    setValue("observaciones", cliente.observaciones);

    if (els.clienteFormTitle) els.clienteFormTitle.textContent = "Modificar cliente";
    if (els.clienteSubmit) els.clienteSubmit.textContent = "Actualizar cliente";
    if (els.cancelClienteEdit) els.cancelClienteEdit.classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteClient(id) {
    const cliente = state.clientes.find((item) => item.id === id);

    if (!cliente) {
      toast("No encontré el cliente.", true);
      return;
    }

    const ok = confirm(`¿Eliminar cliente ${fullName(cliente)}?`);

    if (!ok) return;

    try {
      ensureSupabaseReady();

      await DB.remove("clientes", id);

      await loadFromSupabase();
      renderAll();

      toast("Cliente eliminado.");
    } catch (error) {
      console.error("[DELETE ERROR]", error);
      toast("Error al eliminar: " + error.message, true);
    }
  }

  function cancelClientEdit() {
    state.editingClientId = null;

    if (els.clienteForm) els.clienteForm.reset();
    if (els.clienteFormTitle) els.clienteFormTitle.textContent = "Nuevo registro";
    if (els.clienteSubmit) els.clienteSubmit.textContent = "Guardar registro";
    if (els.cancelClienteEdit) els.cancelClienteEdit.classList.add("hidden");
  }

  async function handleExcelImport() {
    if (!els.excelInput || !els.excelInput.files || !els.excelInput.files[0]) {
      toast("Selecciona un archivo Excel.", true);
      return;
    }

    if (typeof XLSX === "undefined") {
      toast("No se cargó la librería XLSX. Revisa el script de SheetJS.", true);
      return;
    }

    const file = els.excelInput.files[0];

    try {
      ensureSupabaseReady();

      const rows = await readExcel(file);

      if (!rows.length) {
        toast("El Excel no tiene filas para importar.", true);
        return;
      }

      let importedClientes = 0;
      let importedVentas = 0;
      let importedCuotas = 0;

      for (const row of rows) {
        const clientePayload = mapExcelRowToCliente(row);

        if (!clientePayload.nombres || !clientePayload.apellidos || !clientePayload.dni || !clientePayload.telefono) {
          continue;
        }

        let savedCliente;

        const existing = state.clientes.find((item) => {
          return item.dni && clientePayload.dni && item.dni === clientePayload.dni;
        });

        if (existing) {
          savedCliente = await DB.update("clientes", existing.id, clientePayload);
        } else {
          savedCliente = await DB.insert("clientes", clientePayload);
          importedClientes++;
        }

        const ventaPayload = buildVentaPayload(savedCliente, clientePayload);
        const savedVenta = await DB.insert("ventas", ventaPayload);
        importedVentas++;

        const beforeCount = importedCuotas;
        const cuotas = buildCuotasFromVenta(savedVenta);

        if (cuotas.length) {
          await DB.insertMany("cuotas", cuotas);
          importedCuotas += cuotas.length;
        }

        console.log("Cuotas generadas:", importedCuotas - beforeCount);
      }

      await loadFromSupabase();
      renderAll();

      toast(`Importación lista. Clientes nuevos: ${importedClientes}. Ventas: ${importedVentas}. Cuotas: ${importedCuotas}.`);
    } catch (error) {
      console.error("[IMPORT ERROR]", error);
      toast("Error al importar: " + error.message, true);
    }
  }

  function buildCuotasFromVenta(venta) {
    if (normalizeText(venta.estado_pedido) === "CANCELACION TOTAL") {
      return [];
    }

    if (!venta.monto_cuota || !venta.cantidad_cuotas || !venta.fecha_pago) {
      return [];
    }

    const cuotas = [];

    for (let i = 1; i <= Number(venta.cantidad_cuotas); i++) {
      cuotas.push({
        venta_id: venta.id,
        cliente_id: venta.cliente_id,
        cliente_nombre: venta.cliente_nombre,
        numero_orden: venta.numero_orden,
        numero_cliente: venta.numero_cliente,
        numero_cuota: i,
        monto: Number(venta.monto_cuota),
        fecha_vencimiento: addMonthsToDate(venta.fecha_pago, i - 1),
        estado: "pendiente",
        estado_pedido: venta.estado_pedido,
        tipo_contrato: venta.tipo_contrato
      });
    }

    return cuotas;
  }

  function readExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (event) {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          const rows = XLSX.utils.sheet_to_json(sheet, {
            defval: "",
            raw: false
          });

          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  function mapExcelRowToCliente(row) {
    return {
      nombres: upper(pick(row, ["NOMBRES", "NOMBRES(O)", "Nombre", "Nombres"])),
      apellidos: upper(pick(row, ["APELLIDOS", "APELLIDOS(O)", "Apellido", "Apellidos"])),
      numero_orden: clean(pick(row, ["Nº ORDEN", "N° ORDEN", "N ORDEN", "ORDEN"])),
      numero_cliente: clean(pick(row, ["Nº CLIENTE", "N° CLIENTE", "N CLIENTE", "CODIGO CLIENTE", "CÓDIGO CLIENTE"])),
      fecha_orden: normalizeExcelDate(pick(row, ["FECHA DE LA ORDEN", "FECHA ORDEN", "FECHA"])),
      estado_pedido: upper(pick(row, ["ESTADO DEL PEDIDO", "ESTADO PEDIDO", "ESTADO"])) || "ACTUAL",
      correo: clean(pick(row, ["CORREO", "EMAIL"])),
      telefono: clean(pick(row, ["TEL PERSONAL", "TEL PERSONAL(O)", "TELEFONO", "TELÉFONO"])),
      dni: clean(pick(row, ["DNI", "DNI(O)"])),
      direccion: upper(pick(row, ["DIRECCIÓN", "DIRECCION", "DIRECCIÓN(O)", "DIRECCION(O)"])),
      mercaderia: upper(pick(row, ["MERCADERIA", "MERCADERÍA", "MERCADERIA(O)", "MERCADERÍA(O)"])),
      regalo: upper(pick(row, ["REGALO"])),
      estado_civil: upper(pick(row, ["ESTADO CIVIL"])),
      nivel_cliente: clean(pick(row, ["NIVEL DE CLIENTE", "NIVEL CLIENTE", "NIVEL"])),
      tipo_contrato: upper(pick(row, ["TIPO DE CONTRATO", "TIPO CONTRATO", "TIPO DE CONTRATO(O)"])),
      monto_total: toNumber(pick(row, ["MONTO TOTAL", "MONTO TOTAL(O)"])),
      monto_cuota: toNumber(pick(row, ["MONTO DE CUOTA", "MONTO CUOTA"])),
      cantidad_cuotas: toInt(pick(row, ["CANTIDAD DE CUOTAS", "TOTAL CUOTAS", "CUOTAS"])),
      fecha_pago: normalizeExcelDate(pick(row, ["FECHA DE PAGO", "FECHA PAGO"])),
      observaciones: clean(pick(row, ["OBSERVACIONES", "OBS"]))
    };
  }

  function pick(row, names) {
    const normalizedRow = {};

    Object.keys(row).forEach((key) => {
      normalizedRow[normalizeText(key)] = row[key];
    });

    for (const name of names) {
      const direct = row[name];

      if (direct !== undefined && direct !== "") return direct;

      const normalized = normalizedRow[normalizeText(name)];

      if (normalized !== undefined && normalized !== "") return normalized;
    }

    return "";
  }

  function validateCliente(cliente) {
    if (!cliente.nombres) return "Nombres es obligatorio.";
    if (!cliente.apellidos) return "Apellidos es obligatorio.";
    if (!cliente.telefono) return "Tel. personal es obligatorio.";
    if (!cliente.dni) return "DNI es obligatorio.";
    if (!cliente.direccion) return "Dirección es obligatoria.";
    if (!cliente.estado_pedido) return "Estado del pedido es obligatorio.";
    if (!cliente.tipo_contrato) return "Tipo de contrato es obligatorio.";
    if (!cliente.mercaderia) return "Mercadería es obligatoria.";
    if (!cliente.monto_total) return "Monto total es obligatorio.";

    return "";
  }

  function ensureSupabaseReady() {
    if (typeof imvictoSupabase === "undefined") {
      throw new Error("No se cargó imvictoSupabase. Revisa supabase.js y el orden de scripts.");
    }

    if (typeof DB === "undefined") {
      throw new Error("No se cargó DB. Revisa database.js y el orden de scripts.");
    }
  }

  function setValue(name, value) {
    if (!els.clienteForm) return;

    const input = els.clienteForm.querySelector(`[name="${name}"]`);

    if (input) {
      input.value = value || "";
    }
  }

  function fullName(cliente) {
    return `${cliente?.nombres || ""} ${cliente?.apellidos || ""}`.trim();
  }

  function clean(value) {
    return String(value || "").trim();
  }

  function upper(value) {
    return clean(value).toUpperCase();
  }

  function toNumber(value) {
    const n = Number(String(value || "0").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }

  function toInt(value) {
    const n = parseInt(String(value || "0"), 10);
    return Number.isFinite(n) ? n : 0;
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();
  }

  function dateOrNull(value) {
    const cleanValue = clean(value);
    return cleanValue || null;
  }

  function normalizeExcelDate(value) {
    const raw = clean(value);

    if (!raw) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const parts = raw.split(/[\/\-\.]/);

    if (parts.length === 3) {
      let day = parts[0].padStart(2, "0");
      let month = parts[1].padStart(2, "0");
      let year = parts[2];

      if (year.length === 2) year = "20" + year;

      return `${year}-${month}-${day}`;
    }

    const parsed = new Date(raw);

    if (!Number.isNaN(parsed.getTime())) {
      return toISODate(parsed);
    }

    return null;
  }

  function parseDate(value) {
    return new Date(value + "T00:00:00");
  }

  function addMonthsToDate(dateValue, months) {
    const date = parseDate(dateValue);

    const result = new Date(
      date.getFullYear(),
      date.getMonth() + months,
      date.getDate()
    );

    return toISODate(result);
  }

  function toISODate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
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
      console.log(message);
      if (isError) alert(message);
      return;
    }

    els.toast.textContent = message;
    els.toast.style.background = isError ? "#8f241d" : "#0d2944";
    els.toast.classList.remove("hidden");

    clearTimeout(window.__imvictoAdminToast);
    window.__imvictoAdminToast = setTimeout(() => {
      els.toast.classList.add("hidden");
    }, 4500);
  }
})();