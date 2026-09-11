// ===============================
// STORAGE LOCAL IMVICTO CORP
// ===============================

console.log("Storage local cargado");

const DB_KEYS = {
    clientes:"imvicto_clientes",
    ventas:"imvicto_ventas",
    cuotas:"imvicto_cuotas",
    usuarios:"imvicto_usuarios",
    documentos:"imvicto_documentos"
};


// ===============================
// HELPERS
// ===============================

function getData(key){
    return JSON.parse(localStorage.getItem(key)) || [];
}


function saveData(key,data){
    localStorage.setItem(key,JSON.stringify(data));
}


function generateId(){
    return Date.now()+Math.floor(Math.random()*1000);
}


// ===============================
// CLIENTES
// ===============================

function getClientes(){
    return getData(DB_KEYS.clientes);
}


function saveCliente(cliente){

    let clientes=getClientes();

    cliente.id=generateId();
    cliente.fecha=new Date().toISOString();

    clientes.push(cliente);

    saveData(DB_KEYS.clientes,clientes);

    return cliente;
}


function updateCliente(id,data){

    let clientes=getClientes();

    clientes=clientes.map(c=>{
        if(c.id==id){
            return {
                ...c,
                ...data
            };
        }

        return c;
    });


    saveData(DB_KEYS.clientes,clientes);
}



function deleteCliente(id){

    let clientes=getClientes();

    clientes=clientes.filter(c=>c.id!=id);

    saveData(DB_KEYS.clientes,clientes);


    // borrar ventas relacionadas

    let ventas=getVentas();

    ventas=ventas.filter(v=>v.clienteId!=id);

    saveData(DB_KEYS.ventas,ventas);



    // borrar cuotas

    let cuotas=getCuotas();

    cuotas=cuotas.filter(c=>c.clienteId!=id);

    saveData(DB_KEYS.cuotas,cuotas);

}



// ===============================
// VENTAS
// ===============================

function getVentas(){
    return getData(DB_KEYS.ventas);
}



function saveVenta(venta){

    let ventas=getVentas();


    venta.id=generateId();
    venta.fecha=new Date().toISOString();


    ventas.push(venta);


    saveData(DB_KEYS.ventas,ventas);


    return venta;
}



function updateVenta(id,data){

    let ventas=getVentas();


    ventas=ventas.map(v=>{

        if(v.id==id){

            return {
                ...v,
                ...data
            };

        }


        return v;

    });


    saveData(DB_KEYS.ventas,ventas);

}



function deleteVenta(id){

    let ventas=getVentas();

    ventas=ventas.filter(v=>v.id!=id);


    saveData(DB_KEYS.ventas,ventas);



    let cuotas=getCuotas();

    cuotas=cuotas.filter(c=>c.ventaId!=id);


    saveData(DB_KEYS.cuotas,cuotas);

}




// ===============================
// CUOTAS
// ===============================

function getCuotas(){

    return getData(DB_KEYS.cuotas);

}



function crearCuotasVenta(venta){


    if(
        venta.tipoContrato!=="FINANCIADO"
        ||
        !venta.numeroCuotas
    ){

        return;

    }


    let cuotas=getCuotas();



    let saldo=
        Number(venta.montoTotal)
        -
        Number(venta.inicial || 0);



    let montoCuota=
        Number(venta.montoCuota)
        ||
        (
            saldo /
            Number(venta.numeroCuotas)
        );



    for(
        let i=1;
        i<=Number(venta.numeroCuotas);
        i++
    ){


        cuotas.push({

            id:generateId(),

            clienteId:venta.clienteId,

            ventaId:venta.id,

            numero:i,

            monto:Number(montoCuota.toFixed(2)),

            fecha:null,

            estado:"PENDIENTE"

        });


    }



    saveData(DB_KEYS.cuotas,cuotas);


}




function updateCuota(id,data){

    let cuotas=getCuotas();


    cuotas=cuotas.map(c=>{

        if(c.id==id){

            return {
                ...c,
                ...data
            };

        }

        return c;

    });


    saveData(DB_KEYS.cuotas,cuotas);

}




// ===============================
// DOCUMENTOS
// ===============================

function saveDocumento(doc){

    let docs=getData(DB_KEYS.documentos);


    docs.push(doc);


    saveData(
        DB_KEYS.documentos,
        docs
    );

}



function getDocumentos(){

    return getData(
        DB_KEYS.documentos
    );

}



// ===============================
// EXPORT
// ===============================

function exportDB(){

    return {

        clientes:getClientes(),

        ventas:getVentas(),

        cuotas:getCuotas(),

        documentos:getDocumentos()

    };

}

function migrarVentas(){

let ventas=getVentas();


ventas=ventas.map(v=>{


return {

...v,

montoTotal:
v.montoTotal ??
v.monto ??
0,


tipoContrato:
v.tipoContrato ??
v.contrato ??
"AL CONTADO",


clienteId:
v.clienteId ??
v.cliente ??
null


};


});


saveData(
DB_KEYS.ventas,
ventas
);


console.log("Ventas migradas");

}