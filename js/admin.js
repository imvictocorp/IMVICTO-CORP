console.log("Admin iniciado");



document.addEventListener(
"DOMContentLoaded",
()=>{


cargarClientes();




const formulario =
document.querySelector("#clienteForm");



if(formulario){


formulario.addEventListener(
"submit",
guardarCliente
);


}




const buscar =
document.querySelector("#clienteSearch");


if(buscar){

buscar.addEventListener(
"input",
cargarClientes
);

}



const exportar =
document.querySelector("#exportExcelBtn");


if(exportar){

exportar.onclick =
exportarExcel;

}



}
);




// ========================
// CLIENTES
// ========================



function guardarCliente(e){


e.preventDefault();



const datos =
Object.fromEntries(
new FormData(e.target)
);



STORAGE.agregar(
"imvicto_clientes",
datos
);



mostrarToast(
"Cliente guardado correctamente"
);



e.target.reset();



cargarClientes();


}




function cargarClientes(){


const tabla =
document.querySelector("#clientesBody");


if(!tabla)return;



let clientes =
STORAGE.leer(
"imvicto_clientes"
);



const busqueda =
document.querySelector("#clienteSearch")?.value
.toLowerCase() || "";




clientes =
clientes.filter(c=>

JSON.stringify(c)
.toLowerCase()
.includes(busqueda)

);




tabla.innerHTML="";



clientes.forEach(c=>{


tabla.innerHTML += `

<tr>

<td>
${c.nombres || ""}
${c.apellidos || ""}
</td>


<td>
${c.dni || ""}
</td>


<td>
${c.telefono || ""}
</td>



<td>

<button onclick="eliminarCliente(${c.id})">

Eliminar

</button>


</td>


</tr>

`;


});



actualizarContadores();


}




function eliminarCliente(id){



let clientes =
STORAGE.leer(
"imvicto_clientes"
);



clientes =
clientes.filter(
c=>c.id!==id
);



STORAGE.guardar(
"imvicto_clientes",
clientes
);



cargarClientes();



}






// ========================
// INICIO
// ========================


function actualizarContadores(){


const clientes =
STORAGE.leer(
"imvicto_clientes"
);



const ventas =
STORAGE.leer(
"imvicto_ventas"
);



let c =
document.querySelector("#statClientes");


let v =
document.querySelector("#statVentas");



if(c)
c.textContent=clientes.length;



if(v)
v.textContent=ventas.length;



}





// ========================
// EXPORTAR EXCEL
// ========================



function exportarExcel(){



const clientes =
STORAGE.leer(
"imvicto_clientes"
);



if(!clientes.length){

alert(
"No hay clientes para exportar"
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
"clientes_imvicto.xlsx"
);



}





function mostrarToast(texto){


const toast =
document.querySelector("#toast");


if(!toast){

alert(texto);
return;

}



toast.textContent=texto;


toast.classList.remove(
"hidden"
);



setTimeout(
()=>toast.classList.add("hidden"),
2500
);



}