const SUPABASE_CONFIG = {
  url: "https://vwzfegupacytdadjoksw.supabase.coL",
  anonKey: "sb_publishable_X3yqYYIpSG6rNwej9OLUrg_pQXfeEY-"
};

const imvictoSupabase = window.supabase.createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);