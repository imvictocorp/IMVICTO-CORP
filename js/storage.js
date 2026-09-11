// ==========================================
// IMVICTO CORP - STORAGE CENTRAL
// ==========================================

console.log("Storage local cargado");

const DB_KEY="IMVICTO_DB";

function obtenerDB(){

let db=JSON.parse(localStorage.getItem(DB_KEY));

if(!db){

db={
clientes:[],
ventas:[],
cuotas:[],
usuarios:[]
};

localStorage.setItem(DB_KEY,JSON.stringify(db));

}

return db;

}


function guardarDB(db){

localStorage.setItem(
DB_KEY,
JSON.stringify(db)
);

}


// ==============================
// CLIENTES
// ==============================

function getClientes(){

return obtenerDB().clientes || [];

}


function guardarClientes(data){

let db=obtenerDB();

db.clientes=data;

guardarDB(db);

}



// ==============================
// VENTAS
// ==============================

function getVentas(){

return obtenerDB().ventas || [];

}


function guardarVentas(data){

let db=obtenerDB();

db.ventas=data;

guardarDB(db);

}



// ==============================
// CUOTAS
// ==============================

function getCuotas(){

return obtenerDB().cuotas || [];

}


function guardarCuotas(data){

let db=obtenerDB();

db.cuotas=data;

guardarDB(db);

}



// ==============================
// USUARIOS
// ==============================

function getUsuarios(){

return obtenerDB().usuarios || [];

}


function guardarUsuarios(data){

let db=obtenerDB();

db.usuarios=data;

guardarDB(db);

}



// ==============================
// GENERADOR ID
// ==============================

function nuevoID(){

return Date.now()+Math.floor(Math.random()*999);

}



// ==============================
// CREAR CLIENTE
// ==============================

function crearCliente(data){

let clientes=getClientes();

let cliente={

id:nuevoID(),

nombres:data.nombres,

apellidos:data.apellidos,

dni:data.dni,

telefono:data.telefono,

correo:data.correo || "",

direccion:data.direccion || "",

fecha:new Date().toISOString()

};


clientes.push(cliente);

guardarClientes(clientes);


return cliente;

}



// ==============================
// CREAR VENTA
// ==============================

function crearVenta(data){

let ventas=getVentas();


let venta={

id:nuevoID(),

clienteId:data.clienteId,

producto:data.producto,

montoTotal:Number(data.montoTotal)||0,

tipoContrato:data.tipoContrato,

estado:data.estado || "ACTIVA",

orden:data.orden || "",

vendedor:data.vendedor || "",

regalo:data.regalo || "",

documentos:data.documentos || [],

observaciones:data.observaciones || "",

fecha:new Date().toISOString()

};


ventas.push(venta);

guardarVentas(ventas);


return venta;

}



// ==============================
// CREAR CUOTAS
// ==============================

function crearCuotas(venta,numero,monto){


let cuotas=getCuotas();


for(let i=1;i<=numero;i++){


cuotas.push({

id:nuevoID(),

ventaId:venta.id,

clienteId:venta.clienteId,

numero:i,

monto:Number(monto),

fecha:null,

estado:"PENDIENTE"

});


}


guardarCuotas(cuotas);


}



// ==============================
// ELIMINAR CLIENTE
// ==============================

function eliminarCliente(id){


let clientes=getClientes()
.filter(c=>c.id!=id);


guardarClientes(clientes);



let ventas=getVentas()
.filter(v=>v.clienteId!=id);


guardarVentas(ventas);



let cuotas=getCuotas()
.filter(c=>c.clienteId!=id);


guardarCuotas(cuotas);


}



// ==============================
// BUSCAR CLIENTE
// ==============================

function buscarCliente(id){

return getClientes()
.find(c=>c.id==id);

}



// ==============================
// BUSCAR VENTA
// ==============================

function buscarVenta(id){

return getVentas()
.find(v=>v.id==id);

}