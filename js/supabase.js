const SUPABASE_URL = "https://vwzfegupacytdadjoksw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_X3yqYYIpSG6rNwej9OLUrg_pQXfeEY-";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
