

const SUPABASE_URL = "https://vwzfegupacytdadjoksw.supabase.co";

const SUPABASE_KEY = "sb_publishable_X3yqYYIpSG6rNwej9OLUrg_pQXfeEY-";


window.imvictoSupabase =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


console.log(
    "Supabase conectado",
    window.imvictoSupabase
);