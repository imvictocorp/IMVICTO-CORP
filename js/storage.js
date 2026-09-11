// ==========================================
// IMVICTO CORP - STORAGE ÚNICO
// ==========================================

const DB_KEY = "IMVICTO_DB";


// ===============================
// BASE
// ===============================

function crearBase(){

    const base = {
        clientes: [],
        ventas: [],
        cuotas: [],
        usuarios: []
    };

    localStorage.setItem(
        DB_KEY,
        JSON.stringify(base)
    );

    return base;
}



function getDB(){

    let db = localStorage.getItem(DB_KEY);


    if(!db){

        return crearBase();

    }


    try{

        return JSON.parse(db);

    }catch{

        return crearBase();

    }

}



function saveDB(db){

    localStorage.setItem(
        DB_KEY,
        JSON.stringify(db)
    );

}



// ===============================
// CLIENTES
// ===============================


function getClientes(){

    return getDB().clientes;

}



function crearCliente(data){

    const db=getDB();


    const cliente={

        id: Date.now(),

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



function actualizarCliente(id,data){

    const db=getDB();


    const cliente =
    db.clientes.find(
        c=>c.id==id
    );


    if(!cliente)return;


    Object.assign(
        cliente,
        data
    );


    saveDB(db);


    return cliente;

}




function eliminarCliente(id){

    const db=getDB();


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




// ===============================
// VENTAS
// ===============================


function getVentas(){

    return getDB().ventas;

}



function crearVenta(data){

    const db=getDB();


    const venta={

        id:Date.now(),

        clienteId:data.clienteId,

        producto:data.producto,

        modelo:data.modelo || "",

        montoTotal:Number(data.montoTotal),


        tipoContrato:data.tipoContrato,


        estado:data.estado || "ACTUAL",


        numeroOrden:data.numeroOrden || "",


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





// ===============================
// CUOTAS
// ===============================


function getCuotas(){

    return getDB().cuotas;

}




function crearCuotas(
venta,
cantidad,
monto
){

    const db=getDB();


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




function actualizarCuotas(lista){

    const db=getDB();


    db.cuotas=lista;


    saveDB(db);

}



// ===============================
// LIMPIEZA
// ===============================

console.log(
"IMVICTO STORAGE OK"
);