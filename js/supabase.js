// ======================================
// IMVICTO CORP - SUPABASE CONNECTION
// ======================================


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// hacerlo global

window.imvictoSupabase = supabaseClient;


console.log(
    "Supabase conectado",
    window.imvictoSupabase
);