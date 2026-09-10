console.log("cargando supabase.js");


if (!window.supabase) {
    console.error("La librería Supabase no cargó");
} else {

    window.imvictoSupabase = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_KEY
    );

    console.log(
        "Supabase conectado correctamente",
        window.imvictoSupabase
    );
}