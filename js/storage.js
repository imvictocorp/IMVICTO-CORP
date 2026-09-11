// ==========================================
// IMVICTO CORP - STORAGE CENTRAL
// ==========================================


const DB_KEY = "IMVICTO_DB";




// Crear base si no existe

function iniciarDB(){


let db =
JSON.parse(
localStorage.getItem(DB_KEY)
);



if(!db){


db={

clientes:[],
ventas:[],
cuotas:[],
usuarios:[]

};



localStorage.setItem(
DB_KEY,
JSON.stringify(db)
);


}


return db;


}





// Obtener base

function getDB(){

return iniciarDB();

}



// Guardar base

function saveDB(db){


localStorage.setItem(
DB_KEY,
JSON.stringify(db)
);


}





// ============================
// CLIENTES
// ============================


function getClientes(){


return getDB().clientes || [];


}



function guardarClientes(lista){


let db=getDB();


db.clientes=lista;


saveDB(db);


}





function crearCliente(data){


let db=getDB();



let cliente={


id:Date.now(),


nombres:data.nombres,


apellidos:data.apellidos,


dni:data.dni,


telefono:data.telefono,


correo:data.correo || "",


direccion:data.direccion || "",


fecha:new Date().toISOString()


};



db.clientes.push(cliente);


saveDB(db);


return cliente;


}



function buscarCliente(id){


return getClientes()
.find(
c=>c.id==id
);


}



function eliminarCliente(id){


let db=getDB();



db.clientes =
db.clientes.filter(
c=>c.id!=id
);



db.ventas =
db.ventas.filter(
v=>v.clienteId!=id
);



db.cuotas =
db.cuotas.filter(
q=>q.clienteId!=id
);



saveDB(db);


}







// ============================
// VENTAS
// ============================



function getVentas(){


return getDB().ventas || [];


}





function crearVenta(data){


let db=getDB();



let venta={


id:Date.now(),


clienteId:data.clienteId,


producto:data.producto,


montoTotal:Number(data.montoTotal),


tipoContrato:data.tipoContrato,


estado:data.estado || "ACTUAL",


orden:data.orden || "",


vendedor:data.vendedor || "",


regalo:data.regalo || "",


observaciones:data.observaciones || "",


fecha:new Date().toISOString()


};



db.ventas.push(venta);


saveDB(db);


return venta;


}





function buscarVenta(id){


return getVentas()
.find(
v=>v.id==id
);


}








// ============================
// CUOTAS
// ============================



function getCuotas(){


return getDB().cuotas || [];


}



function guardarCuotas(lista){


let db=getDB();


db.cuotas=lista;


saveDB(db);


}




function crearCuotas(
venta,
cantidad,
monto
){


let db=getDB();



for(
let i=1;
i<=cantidad;
i++
){


db.cuotas.push({


id:Date.now()+i,


ventaId:venta.id,


clienteId:venta.clienteId,


numero:i,


monto:Number(monto),


estado:"PENDIENTE",


fechaPago:null


});


}



saveDB(db);


}





// inicializar

iniciarDB();


console.log(
"Storage central cargado"
);