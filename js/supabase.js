
const SUPABASE_URL = "https://vwzfegupacytdadjoksw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_X3yqYYIpSG6rNwej9OLUrg_pQXfeEY-E";


window.db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log("Supabase conectado");