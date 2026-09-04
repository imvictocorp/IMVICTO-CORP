const DB = {
  prefix: "imvicto_",
  get(key, fallback = []) {
    try { return JSON.parse(localStorage.getItem(this.prefix + key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(this.prefix + key, JSON.stringify(value)); },
  all() {
    return {
      users: this.get("users"),
      clientes: this.get("clientes"),
      ventas: this.get("ventas"),
      cuotas: this.get("cuotas"),
      citas: this.get("citas"),
      mantenimientos: this.get("mantenimientos"),
      bonos: this.get("bonos")
    };
  },
  insert(key, row) {
    const rows = this.get(key);
    rows.unshift({ ...row, id: row.id || uid(key), created_at: new Date().toISOString() });
    this.set(key, rows);
    return rows[0];
  },
  update(key, id, patch) {
    const rows = this.get(key).map(row => row.id === id ? { ...row, ...patch, updated_at: new Date().toISOString() } : row);
    this.set(key, rows);
  },
  remove(key, id) {
    this.set(key, this.get(key).filter(row => row.id !== id));
  }
};
