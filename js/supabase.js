console.log("Cargando supabase.js");


const SUPABASE_URL = "TU_URL_DE_SUPABASE";
const SUPABASE_KEY = "TU_KEY_DE_SUPABASE";


if(!window.supabase){

console.error("La librería Supabase no cargó");

}
else{


const clienteSupabase = supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);



window.DB = {


async getClientes(){


const {data,error}=await clienteSupabase
.from("clientes")
.select("*")
.order("created_at",{ascending:false});



if(error)
throw error;



return data || [];


},




async crearCliente(datos){


const {data,error}=await clienteSupabase
.from("clientes")
.insert(datos)
.select()
.single();



if(error)
throw error;



return data;


},




async getVentas(){


const {data,error}=await clienteSupabase
.from("ventas")
.select("*");



if(error)
throw error;



return data || [];


},





async getCuotas(){


const {data,error}=await clienteSupabase
.from("cuotas")
.select("*");



if(error)
throw error;



return data || [];


}



};



console.log("Supabase conectado");

}