// =======================================
// IMVICTO CORP - ADMIN PANEL
// Supabase + Excel + CRUD clientes
// =======================================


// ------------------------------
// VARIABLES
// ------------------------------

let clientes = [];
let ventas = [];
let cuotas = [];

let editandoCliente = null;



// ------------------------------
// CONEXIÓN SUPABASE
// ------------------------------

function getDB(){

    if(window.imvictoSupabase){
        return window.imvictoSupabase;
    }


    if(window.db){
        return window.db;
    }


    throw new Error(
        "Supabase no cargado"
    );

}



// ------------------------------
// INICIO
// ------------------------------

document.addEventListener(
"DOMContentLoaded",
async()=>{


    try{

        await cargarDatos();


        iniciarEventos();


        renderTodo();


    }catch(error){

        console.error(error);


        mostrarToast(
            "Error cargando Supabase: " + error.message,
            true
        );

    }



});




// ------------------------------
// EVENTOS
// ------------------------------

function iniciarEventos(){


    // navegación

    document
    .querySelectorAll(".nav-btn")
    .forEach(btn=>{


        btn.addEventListener(
        "click",
        ()=>{


            const vista =
            btn.dataset.view;


            cambiarVista(vista);


        });


    });



    // refrescar

    const refresh =
    document.getElementById(
        "refreshBtn"
    );


    if(refresh){

        refresh.onclick =
        cargarDatos;

    }




    // cliente


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




    // excel


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




    // logout

    const logout =
    document.getElementById(
        "logoutBtn"
    );


    if(logout){

        logout.onclick =
        ()=>{

            localStorage.clear();

            location.href =
            "./login.html";

        };

    }


}







// ------------------------------
// CAMBIO DE VISTA
// ------------------------------

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





// ------------------------------
// CARGAR DATOS
// ------------------------------

async function cargarDatos(){


const supabase =
getDB();



// CLIENTES

const clientesResp =
await supabase
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
await supabase
.from("ventas")
.select("*")
.order(
"created_at",
{
ascending:false
}
);



if(ventasResp.error)
throw ventasResp.error;



ventas =
ventasResp.data || [];






// CUOTAS


const cuotasResp =
await supabase
.from("cuotas")
.select("*")
.order(
"fecha_vencimiento"
);



if(cuotasResp.error)
throw cuotasResp.error;



cuotas =
cuotasResp.data || [];





console.log(
"Clientes:",
clientes.length
);


console.log(
"Ventas:",
ventas.length
);


console.log(
"Cuotas:",
cuotas.length
);



}





// ------------------------------
// RENDER GENERAL
// ------------------------------

function renderTodo(){


renderStats();


renderClientes();


renderVentas();


renderCuotas();


}





function renderStats(){


const clientesEl =
document.getElementById(
"statClientes"
);


if(clientesEl)
clientesEl.textContent =
clientes.length;



const ventasEl =
document.getElementById(
"statVentas"
);


if(ventasEl)
ventasEl.textContent =
ventas.length;



const vencidas =
cuotas.filter(c=>{


return c.estado ===
"vencido";


}).length;



const vencidasEl =
document.getElementById(
"statVencidas"
);



if(vencidasEl)
vencidasEl.textContent =
vencidas;



const pendiente =
cuotas
.filter(c=>c.estado!=="pagado")
.reduce(
(a,b)=>
a+Number(
b.monto||0
),
0
);



const pendienteEl =
document.getElementById(
"statPendiente"
);



if(pendienteEl)
pendienteEl.textContent =
"S/ "+
pendiente.toFixed(2);



}


// =======================================
// GUARDAR CLIENTE
// =======================================


async function guardarCliente(event){

event.preventDefault();


const form =
event.target;


const datos =
new FormData(form);



const cliente = {


nombres:
String(datos.get("nombres")||"")
.toUpperCase()
.trim(),


apellidos:
String(datos.get("apellidos")||"")
.toUpperCase()
.trim(),


numero_orden:
datos.get("numero_orden"),


numero_cliente:
datos.get("numero_cliente"),


fecha_orden:
datos.get("fecha_orden"),


estado_pedido:
datos.get("estado_pedido"),


correo:
datos.get("correo"),


telefono:
datos.get("telefono"),


dni:
datos.get("dni"),


direccion:
String(datos.get("direccion")||"")
.toUpperCase(),


mercaderia:
String(datos.get("mercaderia")||"")
.toUpperCase(),


regalo:
datos.get("regalo"),


estado_civil:
datos.get("estado_civil"),


nivel_cliente:
datos.get("nivel_cliente"),


tipo_contrato:
datos.get("tipo_contrato"),


monto_total:
Number(datos.get("monto_total")||0),


monto_cuota:
Number(datos.get("monto_cuota")||0),


cantidad_cuotas:
Number(datos.get("cantidad_cuotas")||0),


fecha_pago:
datos.get("fecha_pago")


};





const error =
validarCliente(cliente);



if(error){

mostrarToast(
error,
true
);

return;

}





const supabase =
getDB();



try{


// EDITAR

if(editandoCliente){


const respuesta =
await supabase
.from("clientes")
.update(cliente)
.eq(
"id",
editandoCliente
)
.select()
.single();



if(respuesta.error)
throw respuesta.error;



mostrarToast(
"Cliente actualizado"
);



}

else{


// NUEVO

const respuesta =
await supabase
.from("clientes")
.insert(cliente)
.select()
.single();



if(respuesta.error)
throw respuesta.error;



mostrarToast(
"Cliente guardado"
);



}



editandoCliente=null;



form.reset();



await cargarDatos();


renderTodo();



}

catch(error){


console.error(error);


mostrarToast(
error.message,
true
);


}



}








// =======================================
// VALIDACIONES
// =======================================


function validarCliente(c){


if(!c.nombres)
return "Nombres obligatorio";


if(!c.apellidos)
return "Apellidos obligatorio";


if(!c.estado_pedido)
return "Estado pedido obligatorio";


if(!c.telefono)
return "Teléfono obligatorio";


if(!c.dni)
return "DNI obligatorio";


if(!c.direccion)
return "Dirección obligatoria";


if(!c.mercaderia)
return "Mercadería obligatoria";


if(!c.tipo_contrato)
return "Tipo contrato obligatorio";


if(!c.monto_total)
return "Monto total obligatorio";



return null;


}








// =======================================
// EDITAR CLIENTE
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
.forEach(campo=>{


const input =
form.querySelector(
`[name="${campo}"]`
);



if(input){

input.value =
cliente[campo] || "";

}



});



document
.getElementById(
"clienteFormTitle"
)
.textContent =
"Modificar cliente";



document
.getElementById(
"clienteSubmit"
)
.textContent =
"Actualizar";



mostrarToast(
"Modo edición activado"
);



};








// =======================================
// ELIMINAR CLIENTE
// =======================================


window.eliminarCliente =
async function(id){


const confirmar =
confirm(
"¿Eliminar este cliente?"
);



if(!confirmar)
return;



const supabase =
getDB();



try{


await supabase
.from("clientes")
.delete()
.eq(
"id",
id
);



mostrarToast(
"Cliente eliminado"
);



await cargarDatos();


renderTodo();



}

catch(error){


mostrarToast(
error.message,
true
);


}



};









// =======================================
// IMPORTAR EXCEL A SUPABASE
// =======================================


async function importarExcelClientes(){


const archivo =
document
.getElementById(
"importExcelInput"
)
.files[0];



if(!archivo){

mostrarToast(
"Selecciona un Excel",
true
);

return;

}




const buffer =
await archivo.arrayBuffer();



const workbook =
XLSX.read(
buffer,
{
type:"array"
}
);



const hoja =
workbook.Sheets[
workbook.SheetNames[0]
];



const filas =
XLSX.utils.sheet_to_json(
hoja,
{
defval:""
}
);



const supabase =
getDB();



let contador=0;



for(const fila of filas){



const cliente={


nombres:
(fila["NOMBRES"]||"")
.toUpperCase(),


apellidos:
(fila["APELLIDOS"]||"")
.toUpperCase(),


dni:
String(
fila["DNI"]||""
),


telefono:
String(
fila["TEL PERSONAL"]||""
),


correo:
fila["CORREO"]||"",


direccion:
(fila["DIRECCIÓN"]||"")
.toUpperCase(),


mercaderia:
(fila["MERCADERIA"]||"")
.toUpperCase(),


nivel_cliente:
fila["NIVEL DE CLIENTE"]||"",


estado_civil:
fila["ESTADO CIVIL"]||"",


tipo_contrato:
fila["TIPO DE CONTRATO"]||"",


monto_total:
Number(
fila["MONTO TOTAL"]||0
),


monto_cuota:
Number(
fila["MONTO DE CUOTA"]||0
),


cantidad_cuotas:
Number(
fila["CANTIDAD DE CUOTAS"]||0
),


estado_pedido:
fila["ESTADO DEL PEDIDO"] || "ACTUAL"

};





if(!cliente.dni)
continue;




const existe =
clientes.find(
c=>c.dni===cliente.dni
);




if(existe){



await supabase
.from("clientes")
.update(cliente)
.eq(
"id",
existe.id
);



}

else{


await supabase
.from("clientes")
.insert(cliente);



}



contador++;


}





mostrarToast(
`Importados ${contador} clientes`
);



await cargarDatos();


renderTodo();



}








// =======================================
// EXPORTAR EXCEL
// =======================================


function exportarExcel(){


const libro =
XLSX.utils.book_new();



XLSX.utils.book_append_sheet(
libro,
XLSX.utils.json_to_sheet(clientes),
"Clientes"
);



XLSX.utils.book_append_sheet(
libro,
XLSX.utils.json_to_sheet(ventas),
"Ventas"
);



XLSX.utils.book_append_sheet(
libro,
XLSX.utils.json_to_sheet(cuotas),
"Cuotas"
);



XLSX.writeFile(
libro,
"IMVICTO_BASE.xlsx"
);



mostrarToast(
"Excel exportado"
);

}


// =======================================
// RENDER VENTAS
// =======================================


function renderVentas(){


const tbody =
document.getElementById(
"ventasBody"
);



if(!tbody)
return;



if(!ventas.length){

tbody.innerHTML=
`
<tr>
<td colspan="6">
No hay ventas registradas
</td>
</tr>
`;

return;

}



tbody.innerHTML =
ventas.map(venta=>{


return `

<tr>

<td>
${venta.cliente_nombre || ""}
</td>


<td>
${venta.numero_orden || ""}
</td>


<td>
${venta.tipo_contrato || ""}
</td>


<td>
S/ ${Number(
venta.monto_total || 0
).toFixed(2)}
</td>


<td>
${venta.estado_pedido || ""}
</td>


<td>

<button
class="btn mini secondary"
onclick="editarVenta('${venta.id}')">

Editar

</button>


</td>


</tr>

`;


}).join("");



}








// =======================================
// EDITAR VENTA
// =======================================


window.editarVenta =
function(id){


const venta =
ventas.find(
v=>v.id===id
);



if(!venta)
return;



const cliente =
clientes.find(
c=>c.id===venta.cliente_id
);



if(cliente){

editarCliente(
cliente.id
);

}



mostrarToast(
"Editando venta asociada"
);



};










// =======================================
// RENDER CUOTAS
// =======================================


function renderCuotas(){


const tbody =
document.getElementById(
"cuotasBody"
);



if(!tbody)
return;



if(!cuotas.length){


tbody.innerHTML=
`
<tr>
<td colspan="5">
No existen cuotas
</td>
</tr>
`;

return;

}




tbody.innerHTML =
cuotas.map(cuota=>{


return `

<tr>

<td>
${cuota.cliente_nombre || ""}
</td>


<td>
Cuota ${cuota.numero_cuota}
</td>


<td>
S/ ${Number(
cuota.monto || 0
).toFixed(2)}
</td>


<td>
${cuota.fecha_vencimiento || ""}
</td>


<td>

<span class="badge">

${cuota.estado || "PENDIENTE"}

</span>

</td>


</tr>

`;


}).join("");



}









// =======================================
// CREAR / ACTUALIZAR CUOTAS
// =======================================


async function actualizarCuotasVenta(
venta
){


const supabase =
getDB();



// primero borrar cuotas antiguas

await supabase
.from("cuotas")
.delete()
.eq(
"venta_id",
venta.id
);





// SI ES CANCELACIÓN TOTAL
// NO CREA CUOTAS


if(
normalizar(
venta.estado_pedido
)
==="CANCELACION TOTAL"
){


return;


}





// AL CONTADO NO TIENE CUOTAS


if(
normalizar(
venta.tipo_contrato
)
==="AL CONTADO"
){


return;


}





// contratos financiados


if(
!venta.cantidad_cuotas ||
!venta.monto_cuota ||
!venta.fecha_pago
){

return;

}





const nuevasCuotas=[];



for(
let i=1;
i<=venta.cantidad_cuotas;
i++
){


nuevasCuotas.push({

venta_id:
venta.id,


cliente_id:
venta.cliente_id,


cliente_nombre:
venta.cliente_nombre,


numero_cuota:
i,


monto:
venta.monto_cuota,


fecha_vencimiento:
sumarMeses(
venta.fecha_pago,
i-1
),


estado:
"PENDIENTE"



});


}





const respuesta =
await supabase
.from("cuotas")
.insert(
nuevasCuotas
);



if(respuesta.error){

throw respuesta.error;

}



}










// =======================================
// ACTUALIZAR ESTADO CUOTA
// =======================================


window.marcarPagada =
async function(id){


const supabase =
getDB();



await supabase
.from("cuotas")
.update({

estado:
"PAGADA",

fecha_pago:
new Date()
.toISOString()
.slice(0,10)

})
.eq(
"id",
id
);



await cargarDatos();

renderTodo();


};









// =======================================
// UTILIDADES FINALES
// =======================================


function normalizar(texto){

return String(
texto || ""
)
.normalize("NFD")
.replace(
/[\u0300-\u036f]/g,
""
)
.toUpperCase()
.trim();

}




function sumarMeses(
fecha,
meses
){


const fechaBase =
new Date(
fecha + "T00:00:00"
);



fechaBase.setMonth(
fechaBase.getMonth()+meses
);



return fechaBase
.toISOString()
.slice(0,10);


}





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



toast.innerText =
mensaje;



toast.style.background =
error
?
"#991b1b"
:
"#0b2744";



toast.classList.remove(
"hidden"
);



setTimeout(()=>{

toast.classList.add(
"hidden"
);

},3000);


}