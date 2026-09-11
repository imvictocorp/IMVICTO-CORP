// ==============================
// ADMIN PANEL
// ==============================

let clientes=[];
let ventas=[];
let cuotas=[];

let editandoCliente=null;


// ==============================
// INICIO
// ==============================

document.addEventListener("DOMContentLoaded",()=>{

cargarStorage();

activarMenu();

cargarTodo();

document
.getElementById("refreshBtn")
?.addEventListener("click",cargarTodo);


document
.getElementById("clienteVentaForm")
?.addEventListener("submit",guardarClienteVenta);


document
.getElementById("clienteSearch")
?.addEventListener("input",renderClientes);


document
.getElementById("ventaSearch")
?.addEventListener("input",renderVentas);


document
.getElementById("exportExcelBtn")
?.addEventListener("click",exportarExcel);


});



// ==============================
// STORAGE
// ==============================


function cargarStorage(){

clientes=
JSON.parse(localStorage.getItem("clientes")) || [];

ventas=
JSON.parse(localStorage.getItem("ventas")) || [];

cuotas=
JSON.parse(localStorage.getItem("cuotas")) || [];

}



function guardarStorage(){

localStorage.setItem(
"clientes",
JSON.stringify(clientes)
);


localStorage.setItem(
"ventas",
JSON.stringify(ventas)
);


localStorage.setItem(
"cuotas",
JSON.stringify(cuotas)
);

}




// ==============================
// MENU
// ==============================


function activarMenu(){


document.querySelectorAll(".nav-btn")
.forEach(btn=>{


btn.addEventListener("click",()=>{


document
.querySelectorAll(".nav-btn")
.forEach(x=>x.classList.remove("active"));


btn.classList.add("active");



document
.querySelectorAll(".view")
.forEach(v=>v.classList.remove("active"));



let vista=
document.getElementById(btn.dataset.view);



if(vista)
vista.classList.add("active");



});

});


}



// ==============================
// CARGAR TODO
// ==============================


function cargarTodo(){

cargarStorage();


actualizarDashboard();


renderClientes();


renderVentas();


renderCuotas();


}


// ==============================
// DASHBOARD
// ==============================


function actualizarDashboard(){


let clientesBox=
document.getElementById("statClientes");


let ventasBox=
document.getElementById("statVentas");


let cuotasBox=
document.getElementById("statVencidas");


let pendienteBox=
document.getElementById("statPendiente");



if(clientesBox)
clientesBox.textContent=clientes.length;



if(ventasBox)
ventasBox.textContent=ventas.length;



let vencidas=
cuotas.filter(
c=>c.estado==="VENCIDA"
).length;



if(cuotasBox)
cuotasBox.textContent=vencidas;



let pendiente=
cuotas
.filter(c=>c.estado!=="PAGADA")
.reduce(
(a,b)=>a+Number(b.monto),
0
);



if(pendienteBox)
pendienteBox.textContent=
"S/"+pendiente;


}



// ==============================
// GUARDAR CLIENTE + VENTA
// ==============================


function guardarClienteVenta(e){

e.preventDefault();



let f=
new FormData(e.target);



let cliente={


id:Date.now(),


nombres:f.get("nombres"),

apellidos:f.get("apellidos"),

dni:f.get("dni"),

telefono:f.get("telefono"),

correo:f.get("correo"),

direccion:f.get("direccion")


};



let venta={


id:Date.now()+1,


clienteId:cliente.id,


producto:f.get("mercaderia"),


monto:Number(
f.get("monto_total")
),


contrato:f.get("tipo_contrato"),


estado:f.get("estado_pedido") || "ACTUAL",


orden:f.get("orden"),


regalo:f.get("regalo"),


vendedor:f.get("vendedor"),


fecha:new Date().toLocaleDateString()


};



clientes.push(cliente);


ventas.push(venta);



// CREAR CUOTAS


if(
venta.contrato==="FINANCIADO"
){


let cantidad=
Number(f.get("cantidad_cuotas"));


let monto=
Number(f.get("monto_cuota"));



for(
let i=1;
i<=cantidad;
i++
){


cuotas.push({


id:Date.now()+i,


ventaId:venta.id,


clienteId:cliente.id,


numero:i,


monto:monto,


estado:"PENDIENTE",


fecha:null


});


}


}



guardarStorage();


alert("Cliente y venta guardados");


e.target.reset();


cargarTodo();


}





// ==============================
// CLIENTES
// ==============================


function renderClientes(){


let tabla=
document.getElementById("clientesBody");


if(!tabla)return;



let buscar=
document.getElementById("clienteSearch")
?.value
.toLowerCase() || "";



tabla.innerHTML="";



clientes
.filter(c=>

(
c.nombres+
c.apellidos+
c.dni+
c.telefono

)
.toLowerCase()
.includes(buscar)

)
.forEach(c=>{


let compras=
ventas.filter(
v=>v.clienteId===c.id
).length;



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


<button 
class="btn-edit"
onclick="editarCliente(${c.id})">
Editar
</button>


<button
class="btn-delete"
onclick="eliminarCliente(${c.id})">
Eliminar
</button>


</td>


</tr>


`;


});


}




function editarCliente(id){


let c=
clientes.find(x=>x.id===id);


if(!c)return;



let form=
document.getElementById("clienteVentaForm");


for(
let campo in c
){

let input=
form.elements[campo];


if(input)
input.value=c[campo];


}


editandoCliente=id;


}




function eliminarCliente(id){


if(!confirm("Eliminar cliente?"))
return;



clientes=
clientes.filter(
c=>c.id!==id
);


ventas=
ventas.filter(
v=>v.clienteId!==id
);


cuotas=
cuotas.filter(
c=>c.clienteId!==id
);



guardarStorage();

cargarTodo();


}





// ==============================
// VENTAS
// ==============================


function renderVentas(){


let tabla=
document.getElementById("ventasBody");


if(!tabla)return;



tabla.innerHTML="";



ventas.forEach(v=>{


let c=
clientes.find(
x=>x.id===v.clienteId
);



tabla.innerHTML+=`


<tr>


<td>
${c?.nombres || ""}
${c?.apellidos || ""}
</td>


<td>
${v.producto}
</td>


<td>
S/${v.monto}
</td>


<td>
${v.contrato}
</td>


<td>
${v.vendedor || "-"}
</td>


<td>

<button
class="btn-view"
onclick="verVenta(${v.id})">
Ver
</button>

</td>


</tr>


`;


});


}




function verVenta(id){


let v=
ventas.find(
x=>x.id===id
);



let c=
clientes.find(
x=>x.id===v.clienteId
);



alert(`

CLIENTE:

${c.nombres} ${c.apellidos}


PRODUCTO:

${v.producto}


MONTO:

S/${v.monto}


CONTRATO:

${v.contrato}


VENDEDOR:

${v.vendedor || "-"}

`);

}



// ==============================
// CUOTAS
// ==============================


function renderCuotas(){


let tabla=
document.getElementById("cuotasBody");


if(!tabla)return;



tabla.innerHTML="";



cuotas.forEach(q=>{


let c=
clientes.find(
x=>x.id===q.clienteId
);



tabla.innerHTML+=`


<tr>

<td>
${c?.nombres}
${c?.apellidos}
</td>


<td>
Cuota ${q.numero}
</td>


<td>
S/${q.monto}
</td>


<td>
${q.fecha || "-"}
</td>


<td>
${q.estado}
</td>


</tr>


`;



});


}





// ==============================
// EXPORTAR
// ==============================


function exportarExcel(){


let data={

clientes,

ventas,

cuotas

};



let hoja=
XLSX.utils.json_to_sheet(clientes);


let libro=
XLSX.utils.book_new();



XLSX.utils.book_append_sheet(
libro,
hoja,
"Clientes"
);



XLSX.writeFile(
libro,
"IMVICTO_BASE.xlsx"
);



}