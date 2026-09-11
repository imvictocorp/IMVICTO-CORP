console.log("Admin funcionando");


document.addEventListener("DOMContentLoaded",()=>{


// =========================
// NAVEGACION
// =========================


const botones =
document.querySelectorAll(".nav-btn, .nav-link");


botones.forEach(btn=>{


btn.addEventListener("click",()=>{


const vista =
btn.dataset.view ||
btn.getAttribute("href")?.replace(".html","");



mostrarVista(vista);



});


});



// cargar inicial

mostrarVista("inicio");



// clientes

const form =
document.querySelector("#clienteForm");


if(form){

form.addEventListener(
"submit",
guardarCliente
);

}



// ventas

const ventaForm =
document.querySelector("#ventaForm");


if(ventaForm){

ventaForm.addEventListener(
"submit",
guardarVenta
);

}



cargarTodo();


});





// =========================
// CAMBIO DE VISTA
// =========================


function mostrarVista(nombre){


document.querySelectorAll(".view")
.forEach(v=>v.classList.remove("active"));



const vista =
document.querySelector("#"+nombre);



if(vista)
vista.classList.add("active");



}





// =========================
// CLIENTES
// =========================



function guardarCliente(e){


e.preventDefault();



const cliente =
Object.fromEntries(
new FormData(e.target)
);



STORAGE.agregar(
"imvicto_clientes",
cliente
);



alert(
"Cliente guardado"
);



e.target.reset();



cargarClientes();


}





function cargarClientes(){


const tabla =
document.querySelector("#clientesBody");


if(!tabla)return;



const clientes =
STORAGE.leer(
"imvicto_clientes"
);



tabla.innerHTML="";



clientes.forEach(c=>{


tabla.innerHTML += `

<tr>

<td>${c.nombres || ""} ${c.apellidos || ""}</td>

<td>${c.dni || ""}</td>

<td>${c.telefono || ""}</td>

<td>

<button onclick="verCliente(${c.id})">
Ver
</button>

</td>

</tr>

`;


});


}





// =========================
// VENTAS
// =========================



function guardarVenta(e){


e.preventDefault();



const venta =
Object.fromEntries(
new FormData(e.target)
);



STORAGE.agregar(
"imvicto_ventas",
venta
);



alert(
"Venta registrada"
);



e.target.reset();



cargarVentas();


}







function cargarVentas(){


const tabla =
document.querySelector("#ventasBody");


if(!tabla)return;



const ventas =
STORAGE.leer(
"imvicto_ventas"
);



tabla.innerHTML="";



ventas.forEach(v=>{


tabla.innerHTML+=`

<tr>

<td>${v.cliente}</td>

<td>${v.producto}</td>

<td>S/${v.monto}</td>

<td>${v.estado}</td>

<td>

${v.fecha}

</td>

</tr>

`;


});


}





// =========================
// CUOTAS
// =========================



function cargarCuotas(){


const tabla =
document.querySelector("#cuotasBody");


if(!tabla)return;



const cuotas =
STORAGE.leer(
"imvicto_cuotas"
);



tabla.innerHTML="";



cuotas.forEach(c=>{


tabla.innerHTML+=`

<tr>

<td>${c.cliente}</td>

<td>${c.numero}</td>

<td>S/${c.monto}</td>

<td>${c.estado}</td>

</tr>

`;


});


}





// =========================
// EXPORTAR
// =========================


function exportarExcel(){



const clientes =
STORAGE.leer(
"imvicto_clientes"
);



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
"IMVICTO_CLIENTES.xlsx"
);



}




// =========================


function cargarTodo(){


cargarClientes();

cargarVentas();

cargarCuotas();


actualizarInicio();


}






function actualizarInicio(){


const clientes =
STORAGE.leer(
"imvicto_clientes"
);


const ventas =
STORAGE.leer(
"imvicto_ventas"
);



if(
document.querySelector("#statClientes")
)

document.querySelector("#statClientes")
.textContent=clientes.length;



if(
document.querySelector("#statVentas")
)

document.querySelector("#statVentas")
.textContent=ventas.length;



}





window.exportarExcel =
exportarExcel;

