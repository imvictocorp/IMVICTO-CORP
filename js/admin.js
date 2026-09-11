// ==========================================
// IMVICTO CORP - ADMIN
// ==========================================

console.log("Admin funcionando");



// ===============================
// INICIO
// ===============================

function renderInicio(){


let clientes = getClientes();

let ventas = getVentas();

let cuotas = getCuotas();



document.getElementById("statClientes").textContent =
clientes.length;



document.getElementById("statVentas").textContent =
ventas.length;



let total =
ventas.reduce(
(a,v)=>
a+Number(
v.montoTotal ||
v.monto ||
0
),
0
);



document.getElementById("statPendiente").textContent =
"S/"+total.toFixed(2);



let pendientes =
cuotas.filter(
q=>q.estado!=="PAGADA"
).length;



document.getElementById("statVencidas").textContent =
pendientes;



}


// ===============================
// CLIENTES
// ===============================

function renderClientes(){


let tabla=document.getElementById("clientesBody");

if(!tabla)return;


tabla.innerHTML="";


let clientes=getClientes();


clientes.forEach(c=>{


let compras=getVentas()
.filter(v=>v.clienteId==c.id)
.length;


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
${compras}
</td>

<td>

<button class="btn-small"
onclick="editarCliente(${c.id})">
Editar
</button>


<button class="btn-small danger"
onclick="eliminarClienteVista(${c.id})">
Eliminar
</button>


</td>


</tr>

`;


});


}



function eliminarClienteVista(id){

if(confirm("¿Eliminar cliente?")){

eliminarCliente(id);

renderClientes();
renderInicio();

}

}




function editarCliente(id){


let cliente=buscarCliente(id);


if(!cliente)return;


let form=document.getElementById("clienteForm");


if(!form)return;


form.nombres.value=cliente.nombres;
form.apellidos.value=cliente.apellidos;
form.dni.value=cliente.dni;
form.telefono.value=cliente.telefono;
form.correo.value=cliente.correo;
form.direccion.value=cliente.direccion;



}



// ===============================
// VENTAS
// ===============================

function renderVentas(){


let tabla=document.getElementById("ventasBody");


if(!tabla)return;


tabla.innerHTML="";


getVentas()
.forEach(v=>{


let cliente=buscarCliente(v.clienteId);


tabla.innerHTML+=`

<tr>

<td>

${cliente?
cliente.nombres+" "+cliente.apellidos:
"-"}

</td>


<td>
${v.producto||"-"}
</td>


<td>
S/${Number(v.montoTotal||0).toFixed(2)}
</td>


<td>
${v.tipoContrato||"-"}
</td>


<td>
${v.vendedor||"-"}
</td>


<td>

<button
onclick="verVenta(${v.id})">
Ver
</button>

</td>


</tr>

`;



});



}



// ===============================
// CUOTAS
// ===============================


function renderCuotas(){


let tabla=document.getElementById("cuotasBody");


if(!tabla)return;


tabla.innerHTML="";


let grupos={};



getCuotas()
.forEach(c=>{


if(!grupos[c.ventaId])
grupos[c.ventaId]=[];


grupos[c.ventaId].push(c);


});



Object.keys(grupos)
.forEach(id=>{


let cuotas=grupos[id];


let venta=buscarVenta(id);


let cliente=venta?
buscarCliente(venta.clienteId):
null;



tabla.innerHTML+=`

<tr>

<td colspan="5">


<details>


<summary>

${cliente?
cliente.nombres+" "+cliente.apellidos:
"-"}

-
${venta?.producto||""}

</summary>



<table class="subtable">

${cuotas.map(c=>`

<tr>

<td>
Cuota ${c.numero}
</td>


<td>
S/${c.monto}
</td>


<td>
${c.estado}
</td>


<td>

<button onclick="pagarCuota(${c.id})">
Marcar pagada
</button>

</td>


</tr>

`).join("")}


</table>



</details>


</td>


</tr>


`;



});



}



function pagarCuota(id){


let cuotas=getCuotas();


let c=cuotas.find(x=>x.id==id);


if(c){

c.estado="PAGADA";

guardarCuotas(cuotas);

renderCuotas();

renderInicio();

}


}



// ===============================
// NAVEGACION
// ===============================


function mostrarVista(id){


document.querySelectorAll(".view")
.forEach(v=>v.classList.remove("active"));


let vista=document.getElementById(id);


if(vista)
vista.classList.add("active");



document.querySelectorAll(".nav-btn")
.forEach(b=>{

b.classList.remove("active");


if(b.dataset.view==id)
b.classList.add("active");


});



renderTodo();



}



function renderTodo(){

renderInicio();
renderClientes();
renderVentas();
renderCuotas();

}



// ===============================
// LOGOUT
// ===============================

function cerrarSesion(){


localStorage.removeItem("usuarioActivo");

sessionStorage.clear();


window.location.href="login.html";


}



// ===============================
// INICIO APP
// ===============================


document.addEventListener(
"DOMContentLoaded",
()=>{


document.querySelectorAll(".nav-btn")
.forEach(btn=>{


btn.onclick=()=>{

mostrarVista(btn.dataset.view);

};


});



let logout=document.getElementById("logoutBtn");


if(logout)
logout.onclick=cerrarSesion;



let refresh=document.getElementById("refreshBtn");


if(refresh)
refresh.onclick=renderTodo;



renderTodo();



}
);