const supabaseClient =
supabase.createClient(
window.SUPABASE_URL,
window.SUPABASE_KEY
);


window.imvictoSupabase =
supabaseClient;


console.log(
"Supabase conectado"
);