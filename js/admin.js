let clienteEditando = null;
let clienteVentaSeleccionado = null;


document.addEventListener("DOMContentLoaded",()=>{

iniciarSesion();
configurarNavegacion();
configurarEventos();

cargarTodo();

});



// =========================
// SESION
// =========================

function iniciarSesion(){

const usuario =
localStorage.getItem("usuario") || "Administrador";


const label =
document.getElementById("sessionLabel");


if(label){
label.textContent="Sesión: "+usuario;
}


const logout =
document.getElementById("logoutBtn");


if(logout){

logout.onclick=()=>{

localStorage.removeItem("usuario");
localStorage.removeItem("rol");

location.href="./login.html";

};

}

}





// =========================
// NAVEGACION
// =========================

function configurarNavegacion(){


document.querySelectorAll("[data-view]")
.forEach(btn=>{


btn.onclick=()=>{


document.querySelectorAll("[data-view]")
.forEach(b=>b.classList.remove("active"));


btn.classList.add("active");



document.querySelectorAll(".view")
.forEach(v=>v.classList.remove("active"));



let vista =
document.getElementById(
btn.dataset.view
);



if(vista){
vista.classList.add("active");
}



cambiarTitulo(
btn.dataset.view
);


};


});


}





function cambiarTitulo(vista){


const datos={

inicio:[
"Inicio",
"Control general del negocio"
],

seguimiento:[
"Seguimiento",
"Gestión de vendedores"
],

clientes:[
"Clientes",
"Registro e historial"
],

ventas:[
"Ventas",
"Pedidos realizados"
],

cuotas:[
"Cuotas",
"Pagos pendientes"
],

excel:[
"Exportar",
"Descargar información"
]

};



let titulo =
document.getElementById("viewTitle");


let subtitulo =
document.getElementById("viewSubtitle");



if(datos[vista]){


titulo.textContent=
datos[vista][0];


subtitulo.textContent=
datos[vista][1];


}


}





// =========================
// EVENTOS
// =========================


function configurarEventos(){


document
.getElementById("refreshBtn")
?.addEventListener(
"click",
cargarTodo
);



document
.getElementById("clienteForm")
?.addEventListener(
"submit",
guardarCliente
);



document
.getElementById("clienteSearch")
?.addEventListener(
"input",
cargarClientes
);



document
.getElementById("ventaForm")
?.addEventListener(
"submit",
guardarVenta
);



document
.getElementById("buscarClienteVenta")
?.addEventListener(
"input",
buscarClienteVenta
);



document
.getElementById("exportExcelBtn")
?.addEventListener(
"click",
exportarExcel
);



}







// =========================
// CARGA GENERAL
// =========================


function cargarTodo(){


cargarClientes();

cargarVentas();

cargarCuotas();

cargarInicio();

cargarSeguimiento();


}








// =========================
// CLIENTES
// =========================


function guardarCliente(e){

e.preventDefault();


let datos =
Object.fromEntries(
new FormData(e.target)
);



if(clienteEditando){


STORAGE.actualizar(
STORAGE.clientes,
clienteEditando,
datos
);


clienteEditando=null;


}
else{


STORAGE.crear(
STORAGE.clientes,
datos
);


}


e.target.reset();


document.getElementById("clienteBtn").textContent=
"Guardar cliente";


cargarClientes();


}



function cargarClientes(){


let tabla =
document.getElementById(
"clientesBody"
);


if(!tabla)return;



let texto =
document.getElementById("clienteSearch")?.value || "";



let clientes =
STORAGE.buscar(
STORAGE.clientes,
texto
);



tabla.innerHTML="";



clientes.forEach(c=>{


tabla.innerHTML+=`

<tr>

<td>
${c.nombres} ${c.apellidos}
</td>


<td>
${c.dni}
</td>


<td>
${c.telefono}
</td>


<td>


<button class="btn small"
onclick="editarCliente(${c.id})">
Editar
</button>


<button class="btn danger small"
onclick="eliminarCliente(${c.id})">
Eliminar
</button>


<button class="btn small"
onclick="verCliente(${c.id})">
Ver
</button>


</td>


</tr>

`;

});


}




function editarCliente(id){


let cliente =
STORAGE.get(
STORAGE.clientes
)
.find(c=>c.id==id);



clienteEditando=id;



let form =
document.getElementById("clienteForm");



Object.keys(cliente)
.forEach(key=>{


if(form[key]){
form[key].value=cliente[key];
}


});



document.getElementById("clienteBtn").textContent=
"Actualizar cliente";


}





function eliminarCliente(id){


if(confirm("¿Eliminar cliente?")){


STORAGE.eliminar(
STORAGE.clientes,
id
);


cargarClientes();


}


}





function verCliente(id){


let cliente =
STORAGE.get(STORAGE.clientes)
.find(c=>c.id==id);



let ventas =
STORAGE.get(STORAGE.ventas)
.filter(v=>v.cliente_id==id);



alert(
`
${cliente.nombres} ${cliente.apellidos}

Ventas:
${ventas.length}
`
);


}





// =========================
// VENTAS
// =========================


function buscarClienteVenta(){


let texto =
document.getElementById(
"buscarClienteVenta"
).value;



let clientes =
STORAGE.buscar(
STORAGE.clientes,
texto
);



let box =
document.getElementById(
"resultadoClientes"
);



box.innerHTML="";



clientes.forEach(c=>{


box.innerHTML+=`

<div>

${c.nombres} ${c.apellidos}

<button onclick="seleccionarClienteVenta(${c.id})">
Elegir
</button>

</div>

`;

});


}




function seleccionarClienteVenta(id){


clienteVentaSeleccionado=id;



let cliente =
STORAGE.get(
STORAGE.clientes
)
.find(c=>c.id==id);



document.getElementById(
"ventaClienteId"
).value=id;



document.getElementById(
"ventaClienteNombre"
).value=
cliente.nombres+" "+cliente.apellidos;



}




function guardarVenta(e){


e.preventDefault();



if(!clienteVentaSeleccionado){

alert(
"Seleccione cliente"
);

return;

}



let venta =
Object.fromEntries(
new FormData(e.target)
);



venta.cliente_id=
clienteVentaSeleccionado;



let cliente =
STORAGE.get(
STORAGE.clientes
)
.find(c=>c.id==clienteVentaSeleccionado);



venta.cliente_nombre=
cliente.nombres+" "+cliente.apellidos;



STORAGE.crear(
STORAGE.ventas,
venta
);



e.target.reset();


cargarVentas();


}






function cargarVentas(){


let tabla =
document.getElementById(
"ventasBody"
);



if(!tabla)return;



tabla.innerHTML="";



STORAGE.get(STORAGE.ventas)
.forEach(v=>{


tabla.innerHTML+=`

<tr>

<td>${v.cliente_nombre}</td>

<td>${v.producto}</td>

<td>S/${v.monto_total}</td>

<td>${v.tipo_contrato}</td>

<td>
<button class="btn small">
Ver
</button>
</td>

</tr>

`;

});


}





// =========================
// CUOTAS
// =========================


function cargarCuotas(){


let tabla =
document.getElementById(
"cuotasBody"
);



if(!tabla)return;



tabla.innerHTML="";



STORAGE.get(STORAGE.cuotas)
.forEach(c=>{


tabla.innerHTML+=`

<tr>

<td>${c.cliente_nombre}</td>

<td>${c.venta}</td>

<td>S/${c.monto}</td>

<td>${c.estado}</td>

<td>${c.fecha}</td>

</tr>

`;

});


}





// =========================
// INICIO
// =========================


function cargarInicio(){


let clientes =
STORAGE.get(STORAGE.clientes);


let ventas =
STORAGE.get(STORAGE.ventas);


let cuotas =
STORAGE.get(STORAGE.cuotas);



document.getElementById("statClientes").textContent=
clientes.length;


document.getElementById("statVentas").textContent=
ventas.length;


document.getElementById("statCuotas").textContent=
cuotas.length;



let total=ventas.reduce(
(a,b)=>a+Number(b.monto_total||0),
0
);


document.getElementById("statMonto").textContent=
"S/"+total;


}





function cargarSeguimiento(){

let tabla =
document.getElementById(
"seguimientoBody"
);


if(!tabla)return;


tabla.innerHTML="";

}





// =========================
// EXPORTAR
// =========================


function exportarExcel(){


let libro =
XLSX.utils.book_new();



[
["Clientes",STORAGE.clientes],
["Ventas",STORAGE.ventas],
["Cuotas",STORAGE.cuotas]

]
.forEach(item=>{


let hoja =
XLSX.utils.json_to_sheet(
STORAGE.get(item[1])
);



XLSX.utils.book_append_sheet(
libro,
hoja,
item[0]
);


});



XLSX.writeFile(
libro,
"IMVICTO_BASE.xlsx"
);



}





window.editarCliente=editarCliente;
window.eliminarCliente=eliminarCliente;
window.verCliente=verCliente;
window.seleccionarClienteVenta=seleccionarClienteVenta;