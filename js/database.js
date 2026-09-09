const DB = {
  async getAll(table) {
    const { data, error } = await imvictoSupabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async insert(table, payload) {
    const { data, error } = await imvictoSupabase
      .from(table)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async insertMany(table, rows) {
    if (!rows || !rows.length) return [];

    const { data, error } = await imvictoSupabase
      .from(table)
      .insert(rows)
      .select();

    if (error) throw error;
    return data || [];
  },

  async update(table, id, payload) {
    const { data, error } = await imvictoSupabase
      .from(table)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async remove(table, id) {
    const { error } = await imvictoSupabase
      .from(table)
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },

  async deleteWhere(table, column, value) {
    const { error } = await imvictoSupabase
      .from(table)
      .delete()
      .eq(column, value);

    if (error) throw error;
    return true;
  }
};