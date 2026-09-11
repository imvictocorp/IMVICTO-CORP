let clienteEditando = null;


document.addEventListener("DOMContentLoaded",()=>{

iniciarSesion();

configurarMenu();

configurarEventos();

cargarTodo();

});



// ==========================
// SESION
// ==========================

function iniciarSesion(){

const usuario =
localStorage.getItem("usuario") || "Administrador";


const label =
document.getElementById("sessionLabel");


if(label){
label.textContent="Sesión: "+usuario;
}



document
.getElementById("logoutBtn")
?.addEventListener("click",()=>{


localStorage.removeItem("usuario");

location.href="./login.html";


});


}




// ==========================
// MENU
// ==========================

function configurarMenu(){


document
.querySelectorAll(".nav-btn")
.forEach(btn=>{


btn.onclick=()=>{


document
.querySelectorAll(".nav-btn")
.forEach(b=>b.classList.remove("active"));



btn.classList.add("active");



document
.querySelectorAll(".view")
.forEach(v=>v.classList.remove("active"));



document
.getElementById(btn.dataset.view)
?.classList.add("active");



cambiarTitulo(btn.dataset.view);


};


});


}




function cambiarTitulo(vista){


let datos={

inicio:[
"Inicio",
"Control general del negocio"
],

seguimiento:[
"Seguimiento",
"Resumen comercial de vendedores"
],

clientes:[
"Clientes",
"Clientes y pedidos registrados"
],

ventas:[
"Ventas",
"Registro general de ventas"
],

cuotas:[
"Cuotas",
"Seguimiento de pagos"
],

exportar:[
"Exportar",
"Descargar información"
]


};



let titulo =
document.getElementById("viewTitle");


let subtitulo =
document.getElementById("viewSubtitle");



if(datos[vista]){


titulo.textContent=datos[vista][0];

subtitulo.textContent=datos[vista][1];


}


}





// ==========================
// EVENTOS
// ==========================

function configurarEventos(){


document
.getElementById("refreshBtn")
?.addEventListener(
"click",
cargarTodo
);



document
.getElementById("clienteVentaForm")
?.addEventListener(
"submit",
guardarClienteVenta
);



document
.getElementById("buscarCliente")
?.addEventListener(
"input",
cargarClientes
);



document
.getElementById("buscarVenta")
?.addEventListener(
"input",
cargarVentas
);



document
.getElementById("exportarExcelBtn")
?.addEventListener(
"click",
exportarExcel
);



}






// ==========================
// CARGA GENERAL
// ==========================

function cargarTodo(){


cargarClientes();

cargarVentas();

cargarCuotas();

cargarInicio();

cargarSeguimiento();


}








// ==========================
// CLIENTE + VENTA
// ==========================


function guardarClienteVenta(e){


e.preventDefault();



let datos =
Object.fromEntries(
new FormData(e.target)
);



let cliente={

nombres:datos.nombres,

apellidos:datos.apellidos,

dni:datos.dni,

telefono:datos.telefono,

correo:datos.correo,

direccion:datos.direccion


};



let venta={

mercaderia:datos.mercaderia,

monto_total:Number(datos.monto_total),

tipo_contrato:datos.tipo_contrato,

estado_pedido:datos.estado_pedido,

numero_orden:datos.numero_orden,

regalo:datos.regalo,

vendedor:datos.vendedor


};




// guardar cliente

let nuevoCliente =
STORAGE.crear(
STORAGE.clientes,
cliente
);



// guardar venta ligada

venta.cliente_id=
nuevoCliente.id;


venta.cliente_nombre=
cliente.nombres+" "+cliente.apellidos;



STORAGE.crear(
STORAGE.ventas,
venta
);



e.target.reset();


alert(
"Cliente y venta registrados"
);



cargarTodo();


}









// ==========================
// CLIENTES
// ==========================


function cargarClientes(){


let tabla=
document.getElementById(
"clientesTabla"
);



if(!tabla)return;



let texto=
document.getElementById(
"buscarCliente"
)?.value || "";



let clientes=
STORAGE.buscar(
STORAGE.clientes,
texto
);



tabla.innerHTML="";



clientes.forEach(c=>{


let ventas =
STORAGE.get(
STORAGE.ventas
)
.filter(
v=>v.cliente_id==c.id
);



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
${ventas.length}
</td>


<td>


<button 
class="btn small"
onclick="editarCliente(${c.id})">

Editar

</button>



<button 
class="btn danger small"
onclick="eliminarCliente(${c.id})">

Eliminar

</button>



</td>


</tr>

`;

});


}








function editarCliente(id){


let cliente =
STORAGE.get(STORAGE.clientes)
.find(
c=>c.id==id
);



if(!cliente)return;



let nombres =
prompt(
"Nombres",
cliente.nombres
);



if(nombres){


STORAGE.actualizar(
STORAGE.clientes,
id,
{
nombres:nombres
}
);



cargarClientes();


}


}







function eliminarCliente(id){


if(!confirm("Eliminar cliente y sus ventas?"))
return;



STORAGE.eliminar(
STORAGE.clientes,
id
);



let ventas =
STORAGE.get(
STORAGE.ventas
)
.filter(
v=>v.cliente_id!=id
);



STORAGE.set(
STORAGE.ventas,
ventas
);



cargarTodo();


}









// ==========================
// VENTAS
// ==========================


function cargarVentas(){


let tabla=
document.getElementById(
"ventasTabla"
);



if(!tabla)return;



let texto =
document.getElementById(
"buscarVenta"
)?.value || "";



let ventas =
STORAGE.buscar(
STORAGE.ventas,
texto
);



tabla.innerHTML="";



ventas.forEach(v=>{


tabla.innerHTML+=`

<tr>


<td>
${v.cliente_nombre}
</td>


<td>
${v.mercaderia}
</td>


<td>
S/${v.monto_total}
</td>


<td>
${v.tipo_contrato}
</td>


<td>
${v.vendedor || ""}
</td>


<td>

<button class="btn small">
Ver
</button>

</td>


</tr>

`;

});


}









// ==========================
// CUOTAS
// ==========================


function cargarCuotas(){


let tabla=
document.getElementById(
"cuotasTabla"
);



if(!tabla)return;



tabla.innerHTML="";



STORAGE.get(
STORAGE.cuotas
)
.forEach(c=>{


tabla.innerHTML+=`

<tr>

<td>
${c.cliente_nombre}
</td>

<td>
${c.venta || ""}
</td>

<td>
S/${c.monto}
</td>

<td>
${c.fecha}
</td>

<td>
${c.estado}
</td>

</tr>


`;

});


}









// ==========================
// DASHBOARD
// ==========================


function cargarInicio(){


let clientes =
STORAGE.get(
STORAGE.clientes
);



let ventas =
STORAGE.get(
STORAGE.ventas
);



let cuotas =
STORAGE.get(
STORAGE.cuotas
);



document.getElementById("statClientes").textContent=
clientes.length;


document.getElementById("statVentas").textContent=
ventas.length;


document.getElementById("statCuotas").textContent=
cuotas.length;



let total =
ventas.reduce(
(a,b)=>a+Number(b.monto_total||0),
0
);



document.getElementById("statMonto").textContent=
"S/"+total;


}






// ==========================
// SEGUIMIENTO
// ==========================


function cargarSeguimiento(){


let tabla=
document.getElementById(
"seguimientoTabla"
);



if(!tabla)return;



tabla.innerHTML="";



let vendedores={};



STORAGE.get(
STORAGE.ventas
)
.forEach(v=>{


let nombre=
v.vendedor || "Sin asignar";


if(!vendedores[nombre]){

vendedores[nombre]=0;

}


vendedores[nombre]++;


});



Object.keys(vendedores)
.forEach(nombre=>{


tabla.innerHTML+=`

<tr>

<td>${nombre}</td>

<td>${vendedores[nombre]}</td>

<td>-</td>

<td>-</td>

<td>-</td>

</tr>

`;


});


}








// ==========================
// EXPORTAR
// ==========================


function exportarExcel(){


let libro =
XLSX.utils.book_new();



[
["Clientes",STORAGE.clientes],
["Ventas",STORAGE.ventas],
["Cuotas",STORAGE.cuotas]

]
.forEach(x=>{


let hoja =
XLSX.utils.json_to_sheet(
STORAGE.get(x[1])
);



XLSX.utils.book_append_sheet(
libro,
hoja,
x[0]
);


});



XLSX.writeFile(
libro,
"IMVICTO_CORP.xlsx"
);


}