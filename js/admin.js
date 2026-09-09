(function () {
  const TABLES = {
    clientes: "clientes",
    ventas: "ventas",
    cuotas: "cuotas",
    demos: "demos",
    mantenimientos: "mantenimientos"
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
    excel: ["Excel", "Importación y exportación de la base."],
    importar: ["Excel", "Importación y exportación de la base."],
    usuarios: ["Usuarios", "Usuarios configurados para login local."],
    seguimiento: ["Seguimiento", "Demos, mantenimientos y KPIs del equipo."]
  };

  init();

  async function init() {
    bindEvents();
    await loadAll();
    renderAll();
  }

  function bindEvents() {
    els.navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.dataset.view;

        if (view) {
          switchView(view);
        }
      });
    });

    els.refreshBtn?.addEventListener("click", async () => {
      await loadAll();
      renderAll();
      toast("Datos actualizados desde Supabase.");
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

  async function loadAll() {
    try {
      const db = getSupabaseClient();

      const [clientes, ventas, cuotas, demos, mantenimientos] = await Promise.all([
        selectAll(db, TABLES.clientes),
        selectAll(db, TABLES.ventas),
        selectAll(db, TABLES.cuotas),
        selectAll(db, TABLES.demos),
        selectAll(db, TABLES.mantenimientos)
      ]);

      state.clientes = clientes;
      state.ventas = ventas;
      state.cuotas = cuotas;
      state.demos = demos;
      state.mantenimientos = mantenimientos;
    } catch (error) {
      console.error("[LOAD ERROR]", error);
      toast("Error al cargar Supabase: " + error.message, true);
    }
  }

  async function selectAll(db, table) {
    const { data, error } = await db
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
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

    if (els.viewTitle) els.viewTitle.textContent = title;
    if (els.viewSubtitle) els.viewSubtitle.textContent = subtitle;
  }

  function renderStats() {
    const today = startOfDay(new Date());

    const vencidas = state.cuotas.filter((cuota) => {
      return cuota.estado !== "pagado" && parseDate(cuota.fecha_vencimiento) < today;
    });

    const pendiente = state.cuotas
      .filter((cuota) => cuota.estado !== "pagado")
      .reduce((sum, cuota) => sum + toNumber(cuota.monto), 0);

    setText(els.statClientes, state.clientes.length);
    setText(els.statVentas, state.ventas.length);
    setText(els.statVencidas, vencidas.length);
    setText(els.statPendiente, money(pendiente));
    setText(els.statDemos, state.demos.length);
    setText(els.statMantenimientos, state.mantenimientos.length);
  }

  function renderHomeCuotas() {
    if (!els.homeCuotasBody) return;

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
    if (!els.clientesBody) return;

    const q = normalizeText(els.clienteSearch?.value || "");

    const clientes = state.clientes.filter((cliente) => {
      const haystack = normalizeText([
        cliente.nombres,
        cliente.apellidos,
        cliente.dni,
        cliente.telefono,
        cliente.codigo_cliente,
        cliente.numero_cliente
      ].join(" "));

      return haystack.includes(q);
    });

    if (!clientes.length) {
      els.clientesBody.innerHTML = `<tr><td colspan="6" class="empty-row">No hay clientes para mostrar.</td></tr>`;
      return;
    }

    els.clientesBody.innerHTML = clientes.map((cliente) => {
      const ventasCliente = state.ventas.filter((venta) => {
        return venta.cliente_id === cliente.id || venta.dni === cliente.dni;
      }).length;

      return `
        <tr>
          <td>
            <div class="client-name">${escapeHtml(fullName(cliente))}</div>
            <div class="client-sub">${ventasCliente} venta(s)</div>
          </td>
          <td>${escapeHtml(cliente.dni || "")}</td>
          <td>${escapeHtml(cliente.telefono || "")}</td>
          <td>${escapeHtml(cliente.codigo_cliente || cliente.numero_cliente || "")}</td>
          <td>${escapeHtml(cliente.nivel_cliente || "")}</td>
          <td>
            <div class="row-actions">
              <button type="button" class="btn secondary mini" data-action="edit-client" data-id="${cliente.id}">Editar</button>
              <button type="button" class="btn danger mini" data-action="delete-client" data-id="${cliente.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  function renderVentas() {
    if (!els.ventasBody) return;

    const q = normalizeText(els.ventaSearch?.value || "");

    const ventas = state.ventas.filter((venta) => {
      const haystack = normalizeText([
        venta.cliente_nombre,
        venta.vendedor_nombre,
        venta.numero_orden,
        venta.numero_cliente,
        venta.estado_pedido,
        venta.tipo_contrato,
        venta.mercaderia
      ].join(" "));

      return haystack.includes(q);
    });

    if (!ventas.length) {
      els.ventasBody.innerHTML = `<tr><td colspan="8" class="empty-row">No hay ventas registradas.</td></tr>`;
      return;
    }

    els.ventasBody.innerHTML = ventas.map((venta) => {
      return `
        <tr>
          <td>${escapeHtml(venta.cliente_nombre || "")}</td>
          <td>${escapeHtml(venta.numero_orden || "")}</td>
          <td>${escapeHtml(venta.numero_cliente || "")}</td>
          <td>${escapeHtml(venta.estado_pedido || "")}</td>
          <td>${escapeHtml(venta.tipo_contrato || "")}</td>
          <td>${escapeHtml(venta.mercaderia || "")}</td>
          <td>${money(venta.monto_total)}</td>
          <td>
            <button type="button" class="btn secondary mini" data-action="edit-sale" data-id="${venta.id}">Editar</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  function renderCuotas() {
    if (!els.cuotasBody) return;

    const q = normalizeText(els.cuotaSearch?.value || "");
    const filter = els.cuotaFilter?.value || "todas";

    let cuotas = state.cuotas.filter((cuota) => {
      const haystack = normalizeText([
        cuota.cliente_nombre,
        cuota.numero_orden,
        cuota.numero_cliente
      ].join(" "));

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
            <div class="cuota-line">
              Cuota ${escapeHtml(cuota.numero_cuota || "")} ·
              ${money(cuota.monto)} ·
              ${formatDate(cuota.fecha_vencimiento)} ·
              ${cuotaBadge(cuota)}
              <button type="button" class="btn secondary mini" data-action="pay-cuota" data-id="${cuota.id}">Pagado</button>
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
    if (!els.usuariosBody) return;

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

  async function handleClienteSubmit(event) {
    event.preventDefault();

    const db = getSupabaseClient();
    const form = event.target;
    const data = new FormData(form);

    const payload = buildClientePayload(data);

    const validation = validateCliente(payload);

    if (validation) {
      toast(validation, true);
      return;
    }

    try {
      let savedCliente;

      if (state.editingClientId) {
        const { data: updated, error } = await db
          .from(TABLES.clientes)
          .update({
            ...payload,
            updated_at: new Date().toISOString()
          })
          .eq("id", state.editingClientId)
          .select()
          .single();

        if (error) throw error;

        savedCliente = updated;

        await updateOrCreateVentaForCliente(savedCliente, payload);
        toast("Registro actualizado.");
      } else {
        const existing = state.clientes.find((cliente) => {
          return cliente.dni && payload.dni && String(cliente.dni) === String(payload.dni);
        });

        if (existing) {
          const { data: updated, error } = await db
            .from(TABLES.clientes)
            .update({
              ...payload,
              updated_at: new Date().toISOString()
            })
            .eq("id", existing.id)
            .select()
            .single();

          if (error) throw error;

          savedCliente = updated;
        } else {
          const { data: inserted, error } = await db
            .from(TABLES.clientes)
            .insert(payload)
            .select()
            .single();

          if (error) throw error;

          savedCliente = inserted;
        }

        const savedVenta = await createVenta(savedCliente, payload);
        await regenerateCuotas(savedVenta);

        toast("Registro guardado en Supabase.");
      }

      cancelClientEdit();
      await loadAll();
      renderAll();
    } catch (error) {
      console.error("[SAVE ERROR]", error);
      toast("Error al guardar: " + error.message, true);
    }
  }

  function buildClientePayload(data) {
    return {
      nombres: upper(data.get("nombres")),
      apellidos: upper(data.get("apellidos")),

      numero_orden: clean(data.get("numero_orden")),
      numero_cliente: clean(data.get("numero_cliente")) || clean(data.get("codigo_cliente")),
      codigo_cliente: clean(data.get("codigo_cliente")) || clean(data.get("numero_cliente")),

      fecha_orden: dateOrNull(data.get("fecha_orden")),
      estado_pedido: upper(data.get("estado_pedido")),
      correo: clean(data.get("correo")),

      telefono: clean(data.get("telefono")) || clean(data.get("tel_personal")),
      telefono_referencia: clean(data.get("telefono_referencia")),

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

      observaciones: clean(data.get("observaciones"))
    };
  }

  async function createVenta(cliente, source) {
    const db = getSupabaseClient();

    const ventaPayload = {
      cliente_id: cliente.id,
      cliente_nombre: fullName(cliente),

      nombres: source.nombres,
      apellidos: source.apellidos,

      numero_orden: source.numero_orden,
      numero_cliente: source.numero_cliente || source.codigo_cliente,

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
      vendedor_nombre: source.vendedor_nombre || ""
    };

    const { data, error } = await db
      .from(TABLES.ventas)
      .insert(ventaPayload)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async function updateOrCreateVentaForCliente(cliente, source) {
    const db = getSupabaseClient();

    const existingVenta = state.ventas.find((venta) => {
      return venta.cliente_id === cliente.id;
    });

    const ventaPayload = {
      cliente_id: cliente.id,
      cliente_nombre: fullName(cliente),

      nombres: source.nombres,
      apellidos: source.apellidos,

      numero_orden: source.numero_orden,
      numero_cliente: source.numero_cliente || source.codigo_cliente,

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
      fecha_pago: source.fecha_pago
    };

    let savedVenta;

    if (existingVenta) {
      const { data, error } = await db
        .from(TABLES.ventas)
        .update(ventaPayload)
        .eq("id", existingVenta.id)
        .select()
        .single();

      if (error) throw error;

      savedVenta = data;
    } else {
      savedVenta = await createVenta(cliente, source);
    }

    await regenerateCuotas(savedVenta);

    return savedVenta;
  }

  async function regenerateCuotas(venta) {
    const db = getSupabaseClient();

    await db
      .from(TABLES.cuotas)
      .delete()
      .eq("venta_id", venta.id);

    if (normalizeText(venta.estado_pedido) === "CANCELACION TOTAL") {
      return;
    }

    if (!venta.monto_cuota || !venta.cantidad_cuotas || !venta.fecha_pago) {
      return;
    }

    const rows = [];

    for (let i = 1; i <= Number(venta.cantidad_cuotas); i++) {
      rows.push({
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

    if (!rows.length) return;

    const { error } = await db
      .from(TABLES.cuotas)
      .insert(rows);

    if (error) throw error;
  }

  async function handleDocumentClick(event) {
    const editClientBtn = event.target.closest("[data-action='edit-client']");
    const deleteClientBtn = event.target.closest("[data-action='delete-client']");
    const payCuotaBtn = event.target.closest("[data-action='pay-cuota']");
    const editSaleBtn = event.target.closest("[data-action='edit-sale']");

    if (editClientBtn) {
      editClient(editClientBtn.dataset.id);
      return;
    }

    if (deleteClientBtn) {
      await deleteClient(deleteClientBtn.dataset.id);
      return;
    }

    if (payCuotaBtn) {
      await markCuotaPagada(payCuotaBtn.dataset.id);
      return;
    }

    if (editSaleBtn) {
      editSale(editSaleBtn.dataset.id);
    }
  }

  function editClient(id) {
    const cliente = state.clientes.find((item) => item.id === id);

    if (!cliente || !els.clienteForm) {
      toast("No encontré el cliente.", true);
      return;
    }

    const venta = state.ventas.find((item) => item.cliente_id === cliente.id) || {};

    state.editingClientId = id;

    setFormValue("nombres", cliente.nombres);
    setFormValue("apellidos", cliente.apellidos);

    setFormValue("numero_orden", cliente.numero_orden || venta.numero_orden);
    setFormValue("numero_cliente", cliente.numero_cliente || cliente.codigo_cliente || venta.numero_cliente);
    setFormValue("codigo_cliente", cliente.codigo_cliente || cliente.numero_cliente || venta.numero_cliente);

    setFormValue("fecha_orden", cliente.fecha_orden || venta.fecha_orden);
    setFormValue("estado_pedido", cliente.estado_pedido || venta.estado_pedido);

    setFormValue("correo", cliente.correo);
    setFormValue("telefono", cliente.telefono);
    setFormValue("tel_personal", cliente.telefono);
    setFormValue("telefono_referencia", cliente.telefono_referencia);

    setFormValue("dni", cliente.dni);
    setFormValue("direccion", cliente.direccion);

    setFormValue("mercaderia", cliente.mercaderia || venta.mercaderia);
    setFormValue("regalo", cliente.regalo || venta.regalo);

    setFormValue("estado_civil", cliente.estado_civil);
    setFormValue("nivel_cliente", cliente.nivel_cliente);

    setFormValue("tipo_contrato", cliente.tipo_contrato || venta.tipo_contrato);
    setFormValue("monto_total", cliente.monto_total || venta.monto_total);
    setFormValue("monto_cuota", cliente.monto_cuota || venta.monto_cuota);
    setFormValue("cantidad_cuotas", cliente.cantidad_cuotas || venta.cantidad_cuotas);
    setFormValue("fecha_pago", cliente.fecha_pago || venta.fecha_pago);

    setFormValue("observaciones", cliente.observaciones);

    if (els.clienteFormTitle) els.clienteFormTitle.textContent = "Modificar registro";
    if (els.clienteSubmit) els.clienteSubmit.textContent = "Actualizar registro";
    if (els.cancelClienteEdit) els.cancelClienteEdit.classList.remove("hidden");

    switchView("clientes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editSale(id) {
    const venta = state.ventas.find((item) => item.id === id);

    if (!venta) {
      toast("No encontré la venta.", true);
      return;
    }

    const cliente = state.clientes.find((item) => item.id === venta.cliente_id);

    if (cliente) {
      editClient(cliente.id);
      return;
    }

    toast("Esta venta no tiene cliente asociado para editar.", true);
  }

  async function deleteClient(id) {
    const cliente = state.clientes.find((item) => item.id === id);

    if (!cliente) {
      toast("No encontré el cliente.", true);
      return;
    }

    const ok = confirm(`¿Eliminar cliente ${fullName(cliente)} y sus ventas/cuotas asociadas?`);

    if (!ok) return;

    try {
      const db = getSupabaseClient();

      const ventasCliente = state.ventas.filter((venta) => venta.cliente_id === id);

      for (const venta of ventasCliente) {
        await db.from(TABLES.cuotas).delete().eq("venta_id", venta.id);
      }

      await db.from(TABLES.ventas).delete().eq("cliente_id", id);
      await db.from(TABLES.demos).delete().eq("cliente_id", id);
      await db.from(TABLES.mantenimientos).delete().eq("cliente_id", id);
      await db.from(TABLES.clientes).delete().eq("id", id);

      await loadAll();
      renderAll();

      toast("Cliente eliminado.");
    } catch (error) {
      console.error("[DELETE ERROR]", error);
      toast("Error al eliminar: " + error.message, true);
    }
  }

  async function markCuotaPagada(id) {
    try {
      const db = getSupabaseClient();

      const { error } = await db
        .from(TABLES.cuotas)
        .update({ estado: "pagado" })
        .eq("id", id);

      if (error) throw error;

      await loadAll();
      renderAll();

      toast("Cuota marcada como pagada.");
    } catch (error) {
      console.error("[CUOTA ERROR]", error);
      toast("Error al actualizar cuota: " + error.message, true);
    }
  }

  function cancelClientEdit() {
    state.editingClientId = null;

    els.clienteForm?.reset();

    if (els.clienteFormTitle) els.clienteFormTitle.textContent = "Nuevo registro";
    if (els.clienteSubmit) els.clienteSubmit.textContent = "Guardar registro";
    if (els.cancelClienteEdit) els.cancelClienteEdit.classList.add("hidden");
  }

  async function importClientesFromExcel() {
    if (!els.importExcelInput || !els.importExcelInput.files || !els.importExcelInput.files[0]) {
      toast("Selecciona un archivo Excel.", true);
      return;
    }

    if (typeof XLSX === "undefined") {
      toast("No se cargó XLSX. Revisa el script de SheetJS en admin.html.", true);
      return;
    }

    try {
      const file = els.importExcelInput.files[0];
      const rows = await readExcel(file);

      if (!rows.length) {
        toast("El Excel no tiene filas.", true);
        return;
      }

      let clientesCreados = 0;
      let clientesActualizados = 0;
      let ventasCreadas = 0;
      let cuotasCreadas = 0;

      for (const row of rows) {
        const payload = mapExcelRowToCliente(row);

        if (!payload.nombres || !payload.apellidos || !payload.dni || !payload.telefono || !payload.direccion) {
          continue;
        }

        const clienteExistente = state.clientes.find((cliente) => {
          return cliente.dni && String(cliente.dni) === String(payload.dni);
        });

        let savedCliente;

        if (clienteExistente) {
          savedCliente = await updateCliente(clienteExistente.id, payload);
          clientesActualizados++;
        } else {
          savedCliente = await insertCliente(payload);
          clientesCreados++;
        }

        const savedVenta = await createVenta(savedCliente, payload);
        ventasCreadas++;

        const before = await countCuotasByVenta(savedVenta.id);
        await regenerateCuotas(savedVenta);
        const after = await countCuotasByVenta(savedVenta.id);

        cuotasCreadas += Math.max(after - before, 0);
      }

      await loadAll();
      renderAll();

      toast(
        `Importación lista. Nuevos: ${clientesCreados}. Actualizados: ${clientesActualizados}. Ventas: ${ventasCreadas}.`
      );
    } catch (error) {
      console.error("[IMPORT ERROR]", error);
      toast("Error al importar: " + error.message, true);
    }
  }

  async function insertCliente(payload) {
    const db = getSupabaseClient();

    const { data, error } = await db
      .from(TABLES.clientes)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async function updateCliente(id, payload) {
    const db = getSupabaseClient();

    const { data, error } = await db
      .from(TABLES.clientes)
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async function countCuotasByVenta(ventaId) {
    const db = getSupabaseClient();

    const { count, error } = await db
      .from(TABLES.cuotas)
      .select("*", { count: "exact", head: true })
      .eq("venta_id", ventaId);

    if (error) return 0;

    return count || 0;
  }

  function readExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (event) {
        try {
          const data = new Uint8Array(event.target.result);

          const workbook = XLSX.read(data, {
            type: "array"
          });

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
      nombres: upper(pick(row, ["NOMBRES(O)", "NOMBRES", "NOMBRE", "NOMBRES "])),

      apellidos: upper(pick(row, ["APELLIDOS(O)", "APELLIDOS", "APELLIDO"])),

      numero_orden: clean(pick(row, ["Nº ORDEN", "N° ORDEN", "N ORDEN", "ORDEN", "Nº ORDEN(O)"])),

      numero_cliente: clean(pick(row, ["Nº CLIENTE", "N° CLIENTE", "N CLIENTE", "CÓDIGO CLIENTE", "CODIGO CLIENTE"])),

      codigo_cliente: clean(pick(row, ["CÓDIGO CLIENTE", "CODIGO CLIENTE", "Nº CLIENTE", "N° CLIENTE", "N CLIENTE"])),

      fecha_orden: normalizeExcelDate(pick(row, [
        "FECHA DE LA ORDEN",
        "FECHA DE LA ORDEN ",
        "FECHA ORDEN",
        "FECHA"
      ])),

      estado_pedido: upper(pick(row, [
        "ESTADO DEL PEDIDO(O)",
        "ESTADO DEL PEDIDO",
        "ESTADO PEDIDO",
        "ESTADO"
      ])) || "ACTUAL",

      correo: clean(pick(row, ["CORREO", "EMAIL"])),

      telefono: clean(pick(row, [
        "TEL PERSONAL(O)",
        "TEL PERSONAL",
        "TELÉFONO",
        "TELEFONO",
        "TEL"
      ])),

      dni: clean(pick(row, ["DNI(O)", "DNI"])),

      direccion: upper(pick(row, [
        "DIRECCIÓN(O)",
        "DIRECCION(O)",
        "DIRECCIÓN",
        "DIRECCION"
      ])),

      mercaderia: upper(pick(row, [
        "MERCADERIA(O)",
        "MERCADERÍA(O)",
        "MERCADERIA",
        "MERCADERÍA"
      ])),

      regalo: upper(pick(row, ["REGALO"])),

      estado_civil: upper(pick(row, ["ESTADO CIVIL"])),

      nivel_cliente: clean(pick(row, [
        "NIVEL DE CLIENTE",
        "NIVEL CLIENTE",
        "NIVEL"
      ])),

      tipo_contrato: upper(pick(row, [
        "TIPO DE CONTRATO(O)",
        "TIPO DE CONTRATO",
        "TIPO CONTRATO"
      ])),

      monto_total: toNumber(pick(row, [
        "MONTO TOTAL(O)",
        "MONTO TOTAL"
      ])),

      monto_cuota: toNumber(pick(row, [
        "MONTO DE CUOTA",
        "MONTO CUOTA"
      ])),

      cantidad_cuotas: toInt(pick(row, [
        "CANTIDAD DE CUOTAS",
        "TOTAL CUOTAS",
        "CUOTAS"
      ])),

      fecha_pago: normalizeExcelDate(pick(row, [
        "FECHA DE PAGO",
        "FECHA PAGO"
      ])),

      observaciones: clean(pick(row, ["OBSERVACIONES", "OBS"]))
    };
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

  function getSupabaseClient() {
    if (typeof imvictoSupabase !== "undefined") {
      return imvictoSupabase;
    }

    if (window.imvictoSupabase) {
      return window.imvictoSupabase;
    }

    throw new Error("No se cargó imvictoSupabase. Revisa supabase.js y el orden de scripts.");
  }

  function getCuotaEstado(cuota) {
    if (cuota.estado === "pagado") return "pagado";

    const today = startOfDay(new Date());
    const date = parseDate(cuota.fecha_vencimiento);

    if (date < today) return "vencido";

    return "pendiente";
  }

  function cuotaBadge(cuota) {
    const estado = getCuotaEstado(cuota);

    if (estado === "pagado") {
      return `<span class="badge success">Pagado</span>`;
    }

    if (estado === "vencido") {
      return `<span class="badge danger">Vencido</span>`;
    }

    return `<span class="badge warning">Pendiente</span>`;
  }

  function groupBy(items, key) {
    return items.reduce((acc, item) => {
      const groupKey = item[key] || "sin_grupo";

      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);

      return acc;
    }, {});
  }

  function setFormValue(name, value) {
    if (!els.clienteForm) return;

    const input = els.clienteForm.querySelector(`[name="${name}"]`);

    if (input) {
      input.value = value || "";
    }
  }

  function pick(row, names) {
    const normalizedRow = {};

    Object.keys(row).forEach((key) => {
      normalizedRow[normalizeText(key)] = row[key];
    });

    for (const name of names) {
      if (row[name] !== undefined && row[name] !== "") {
        return row[name];
      }

      const normalized = normalizeText(name);

      if (normalizedRow[normalized] !== undefined && normalizedRow[normalized] !== "") {
        return normalizedRow[normalized];
      }
    }

    return "";
  }

  function setText(el, value) {
    if (el) el.textContent = value;
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
    const n = Number(String(value || "0").replace("S/", "").replace(",", ".").trim());
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
    if (!value) return new Date("2999-01-01T00:00:00");
    return new Date(value + "T00:00:00");
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
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

  function formatDate(value) {
    if (!value) return "";
    return parseDate(value).toLocaleDateString("es-PE");
  }

  function money(value) {
    return `S/ ${toNumber(value).toFixed(2)}`;
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