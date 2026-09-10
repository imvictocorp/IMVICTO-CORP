// =======================================
// IMVICTO CORP - ADMIN PANEL
// Supabase + Excel + CRUD CLIENTES
// =======================================


let clientes = [];
let ventas = [];
let cuotas = [];

let editandoCliente = null;


// =======================================
// SUPABASE
// =======================================


function getDB(){

    if(window.imvictoSupabase){

        return window.imvictoSupabase;

    }


    throw new Error(
        "Supabase no cargado"
    );

}



// =======================================
// INICIO
// =======================================


document.addEventListener(
"DOMContentLoaded",
()=>{


    iniciarEventos();


    cargarDatos()
    .then(()=>{


        renderTodo();


    })
    .catch(error=>{


        console.error(error);


        mostrarToast(
            error.message,
            true
        );


    });


});




// =======================================
// EVENTOS
// =======================================


function iniciarEventos(){



document
.querySelectorAll(".nav-btn")
.forEach(btn=>{


btn.onclick=()=>{


    cambiarVista(
        btn.dataset.view
    );


};


});





const refresh =
document.getElementById(
"refreshBtn"
);



if(refresh){


refresh.onclick=async()=>{


try{


await cargarDatos();


renderTodo();



mostrarToast(
"Datos actualizados"
);



}
catch(error){


mostrarToast(
error.message,
true
);


}



};



}





const logout =
document.getElementById(
"logoutBtn"
);



if(logout){


logout.onclick=()=>{


localStorage.removeItem(
"usuario"
);



location.href=
"./login.html";


};


}







const form =
document.getElementById(
"clienteForm"
);



if(form){


form.addEventListener(
"submit",
guardarCliente
);


}





const buscar =
document.getElementById(
"clienteSearch"
);



if(buscar){


buscar.addEventListener(
"input",
renderClientes
);


}





const importar =
document.getElementById(
"importClientesBtn"
);



if(importar){


importar.onclick =
importarExcelClientes;


}






const exportar =
document.getElementById(
"exportExcelBtn"
);



if(exportar){


exportar.onclick =
exportarExcel;


}



}






// =======================================
// VISTAS
// =======================================


function cambiarVista(nombre){



document
.querySelectorAll(".view")
.forEach(v=>{


v.classList.remove(
"active"
);


});



const vista =
document.getElementById(
nombre
);



if(vista){


vista.classList.add(
"active"
);


}



document
.querySelectorAll(".nav-btn")
.forEach(btn=>{


btn.classList.toggle(
"active",
btn.dataset.view===nombre
);


});


}






// =======================================
// CARGAR DATOS SUPABASE
// =======================================


async function cargarDatos(){



const db =
getDB();



// CLIENTES

const clientesResp =
await db
.from("clientes")
.select("*")
.order(
"created_at",
{
ascending:false
}
);



if(clientesResp.error)
throw clientesResp.error;



clientes =
clientesResp.data || [];






// VENTAS

const ventasResp =
await db
.from("ventas")
.select("*")
.order(
"created_at",
{
ascending:false
}
);



if(!ventasResp.error){

ventas =
ventasResp.data || [];

}






// CUOTAS

const cuotasResp =
await db
.from("cuotas")
.select("*")
.order(
"fecha_vencimiento"
);



if(!cuotasResp.error){

cuotas =
cuotasResp.data || [];

}



}






// =======================================
// RENDER GENERAL
// =======================================



function renderStats(){


const clientesEl =
document.getElementById(
"statClientes"
);



if(clientesEl){

clientesEl.textContent =
clientes.length;

}





const ventasEl =
document.getElementById(
"statVentas"
);



if(ventasEl){

ventasEl.textContent =
ventas.length;

}





const vencidas =
cuotas.filter(
c=>
c.estado==="VENCIDA"
).length;



const vencidasEl =
document.getElementById(
"statVencidas"
);



if(vencidasEl){

vencidasEl.textContent =
vencidas;

}



const pendiente =
cuotas
.filter(
c=>
c.estado!=="PAGADA"
)
.reduce(
(a,b)=>
a+Number(b.monto||0),
0
);



const pendienteEl =
document.getElementById(
"statPendiente"
);



if(pendienteEl){

pendienteEl.textContent =
"S/ "+
pendiente.toFixed(2);

}


}







// =======================================
// GUARDAR CLIENTE
// =======================================


async function guardarCliente(e){


e.preventDefault();



const form =
e.target;



const datos =
Object.fromEntries(
new FormData(form)
);




const cliente = {


nombres:
datos.nombres
?.toUpperCase(),



apellidos:
datos.apellidos
?.toUpperCase(),



numero_orden:
datos.numero_orden,



numero_cliente:
datos.numero_cliente,



fecha_orden:
datos.fecha_orden || null,



estado_pedido:
datos.estado_pedido,



correo:
datos.correo,



telefono:
datos.telefono,



dni:
datos.dni,



direccion:
datos.direccion
?.toUpperCase(),



mercaderia:
datos.mercaderia
?.toUpperCase(),



regalo:
datos.regalo,



nivel_cliente:
datos.nivel_cliente,



tipo_contrato:
datos.tipo_contrato,



monto_total:
Number(
datos.monto_total || 0
),



monto_cuota:
Number(
datos.monto_cuota || 0
),



cantidad_cuotas:
Number(
datos.cantidad_cuotas || 0
),



fecha_pago:
datos.fecha_pago || null


};





const db =
getDB();




let respuesta;



if(editandoCliente){



respuesta =
await db
.from("clientes")
.update(cliente)
.eq(
"id",
editandoCliente
);



}
else{



respuesta =
await db
.from("clientes")
.insert(cliente);



}





if(respuesta.error)
throw respuesta.error;




mostrarToast(
"Cliente guardado correctamente"
);



form.reset();



editandoCliente=null;



await cargarDatos();


renderTodo();



}








// =======================================
// EDITAR
// =======================================


window.editarCliente =
function(id){



const cliente =
clientes.find(
c=>c.id===id
);



if(!cliente)
return;



editandoCliente=id;



const form =
document.getElementById(
"clienteForm"
);



Object.keys(cliente)
.forEach(key=>{


const input =
form.querySelector(
`[name="${key}"]`
);



if(input){

input.value =
cliente[key] || "";

}



});



};








// =======================================
// ELIMINAR
// =======================================


window.eliminarCliente =
async function(id){



if(!confirm(
"¿Eliminar cliente?"
))
return;




const db =
getDB();



const respuesta =
await db
.from("clientes")
.delete()
.eq(
"id",
id
);




if(respuesta.error)
throw respuesta.error;



mostrarToast(
"Cliente eliminado"
);



await cargarDatos();


renderTodo();



};







// =======================================
// IMPORTAR EXCEL
// =======================================


async function importarExcelClientes(){



const input =
document.getElementById(
"importExcelInput"
);



const archivo =
input?.files[0];



if(!archivo){

mostrarToast(
"Selecciona un Excel",
true
);

return;

}



if(typeof XLSX==="undefined"){


mostrarToast(
"Falta cargar XLSX",
true
);


return;


}




const buffer =
await archivo.arrayBuffer();



const workbook =
XLSX.read(
buffer
);



const hoja =
workbook.Sheets[
workbook.SheetNames[0]
];



const filas =
XLSX.utils.sheet_to_json(
hoja
);



const db =
getDB();



let creados=0;



for(const fila of filas){



const cliente={



nombres:
fila.NOMBRES || "",



apellidos:
fila.APELLIDOS || "",



numero_orden:
fila["Nº ORDEN"] || "",



numero_cliente:
fila["Nº CLIENTE"] || "",



fecha_orden:
fila["FECHA DE LA ORDEN"] || null,



estado_pedido:
fila["ESTADO DEL PEDIDO"] || "ACTUAL",



correo:
fila.CORREO || "",



telefono:
fila["TEL PERSONAL"] || "",



dni:
fila.DNI || "",



direccion:
fila.DIRECCIÓN || "",



mercaderia:
fila.MERCADERIA || "",



regalo:
fila.REGALO || "",



nivel_cliente:
fila["NIVEL DE CLIENTE"] || "",



tipo_contrato:
fila["TIPO DE CONTRATO"] || "",



monto_total:
Number(
fila["MONTO TOTAL"] || 0
),



monto_cuota:
Number(
fila["MONTO DE CUOTA"] || 0
),



cantidad_cuotas:
Number(
fila["CANTIDAD DE CUOTAS"] || 0
),



fecha_pago:
fila["FECHA DE PAGO"] || null


};




const existe =
clientes.find(
c=>
c.dni &&
c.dni===cliente.dni
);



if(existe){


await db
.from("clientes")
.update(cliente)
.eq(
"id",
existe.id
);



}else{


await db
.from("clientes")
.insert(cliente);



}



creados++;


}




mostrarToast(
`${creados} clientes importados`
);



await cargarDatos();


renderTodo();



}






// =======================================
// EXPORTAR EXCEL
// =======================================


function exportarExcel(){


if(typeof XLSX==="undefined"){

mostrarToast(
"Falta cargar XLSX",
true
);

return;

}



const hoja =
XLSX.utils.json_to_sheet(
clientes
);



const libro =
XLSX.utils.book_new();



XLSX.utils.book_append_sheet(
libro,
hoja,
"Clientes"
);



XLSX.writeFile(
libro,
"Clientes_IMVICTO.xlsx"
);



}





// =======================================
// RENDER TODO
// =======================================

function renderTodo(){

    renderStats();
    renderUltimasCuotas();

}



// =======================================
// ULTIMAS CUOTAS
// =======================================

function renderUltimasCuotas(){

    const tabla =
    document.getElementById("ultimasCuotas");

    if(!tabla) return;


    tabla.innerHTML = "";


    cuotas
    .slice(0,5)
    .forEach(c=>{


        tabla.innerHTML += `

        <tr>

            <td>${c.cliente || ""}</td>

            <td>${c.cuota || ""}</td>

            <td>S/ ${Number(c.monto || 0).toFixed(2)}</td>

            <td>${c.fecha || ""}</td>

            <td>${c.estado || ""}</td>

        </tr>

        `;


    });


}


// =======================================
// TOAST
// =======================================


function mostrarToast(
mensaje,
error=false
){



const toast =
document.getElementById(
"toast"
);



if(!toast){

alert(mensaje);

return;

}



toast.textContent =
mensaje;



toast.classList.remove(
"hidden"
);



setTimeout(()=>{


toast.classList.add(
"hidden"
);


},3000);


}