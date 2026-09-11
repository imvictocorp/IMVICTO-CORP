// =====================================
// ADMIN IMVICTO CORP
// =====================================


document.addEventListener("DOMContentLoaded",()=>{


iniciarAdmin();


});



function iniciarAdmin(){


const botones=document.querySelectorAll(".nav-btn");


botones.forEach(btn=>{


btn.addEventListener("click",()=>{


botones.forEach(b=>b.classList.remove("active"));

btn.classList.add("active");


mostrarVista(btn.dataset.view);


});


});



document
.getElementById("refreshBtn")
?.addEventListener("click",actualizarTodo);



document
.getElementById("logoutBtn")
?.addEventListener("click",()=>{


localStorage.removeItem("usuario");

location.href="login.html";


});



document
.getElementById("clienteForm")
?.addEventListener("submit",guardarClienteVenta);



renderTodo();


}




// =====================================
// CAMBIO DE VISTA
// =====================================


function mostrarVista(id){


document
.querySelectorAll(".view")
.forEach(v=>v.classList.remove("active"));



const vista=document.getElementById(id);


if(vista)
vista.classList.add("active");



const titulos={

inicio:["Inicio","Control general del negocio"],

clientes:["Clientes","Clientes y pedidos registrados"],

ventas:["Ventas","Registro general de ventas"],

cuotas:["Cuotas","Seguimiento de pagos"],

excel:["Exportar","Base de datos"]

};



if(titulos[id]){


document.getElementById("viewTitle").textContent=titulos[id][0];

document.getElementById("viewSubtitle").textContent=titulos[id][1];


}



renderTodo();


}




// =====================================
// GUARDAR CLIENTE + VENTA
// =====================================


function guardarClienteVenta(e){


e.preventDefault();



const f=new FormData(e.target);



const cliente={


id:nuevoID(),

nombres:f.get("nombres"),

apellidos:f.get("apellidos"),

dni:f.get("dni"),

telefono:f.get("telefono"),

correo:f.get("correo"),

direccion:f.get("direccion"),


fecha:new Date().toISOString()


};



const venta={


id:nuevoID(),

clienteID:cliente.id,

cliente:
cliente.nombres+" "+cliente.apellidos,


dni:cliente.dni,


producto:f.get("producto"),

monto:Number(f.get("monto_total")),


contrato:f.get("tipo_contrato"),


estado:f.get("estado_pedido") || "ACTUAL",


orden:f.get("orden"),


vendedor:f.get("vendedor"),


regalo:f.get("regalo"),


notas:f.get("observaciones"),


fecha:new Date().toISOString()


};



DB.clientes.push(cliente);


DB.ventas.push(venta);




// CREAR CUOTAS

if(venta.contrato==="FINANCIADO"){


let cantidad=
Number(f.get("numero_cuotas")) || 12;


let monto=
Number(f.get("monto_cuota")) || 
(
venta.monto / cantidad
);



for(let i=1;i<=cantidad;i++){


DB.cuotas.push({

id:nuevoID(),

ventaID:venta.id,

cliente:venta.cliente,

numero:i,

monto:monto,

fecha:new Date().toISOString(),

estado:"PENDIENTE"


});


}


}



guardarDB();


e.target.reset();


alert("Cliente y venta registrados");


renderTodo();


}





// =====================================
// CLIENTES
// =====================================


function renderClientes(){


const tabla=document.getElementById("clientesBody");


if(!tabla)return;


tabla.innerHTML="";



DB.clientes.forEach(c=>{


let compras=
DB.ventas.filter(v=>v.clienteID===c.id).length;



tabla.innerHTML+=`

<tr>

<td>${c.nombres} ${c.apellidos}</td>

<td>${c.dni}</td>

<td>${c.telefono}</td>

<td>${compras}</td>

<td>

<button onclick="editarCliente(${c.id})">
Editar
</button>


<button onclick="eliminarCliente(${c.id})">
Eliminar
</button>


</td>

</tr>


`;


});


}





function editarCliente(id){


const c=DB.clientes.find(x=>x.id===id);


if(!c)return;



let form=document.getElementById("clienteForm");


form.nombres.value=c.nombres;

form.apellidos.value=c.apellidos;

form.dni.value=c.dni;

form.telefono.value=c.telefono;

form.correo.value=c.correo;

form.direccion.value=c.direccion;



alert("Edita los datos y vuelve a guardar");


}





function eliminarCliente(id){


if(!confirm("Eliminar cliente y ventas?"))
return;



DB.clientes=
DB.clientes.filter(c=>c.id!==id);



DB.ventas=
DB.ventas.filter(v=>v.clienteID!==id);



DB.cuotas=
DB.cuotas.filter(q=>{

return DB.ventas.some(v=>v.id===q.ventaID)

});



guardarDB();


renderTodo();


}





// =====================================
// VENTAS
// =====================================


function renderVentas(){


const tabla=document.getElementById("ventasBody");


if(!tabla)return;


tabla.innerHTML="";



DB.ventas.forEach(v=>{


tabla.innerHTML+=`

<tr>


<td>${v.cliente}</td>

<td>${v.producto}</td>

<td>S/${v.monto}</td>

<td>${v.contrato}</td>

<td>${v.vendedor||"-"}</td>


<td>

<button onclick="verVenta(${v.id})">
Ver
</button>


</td>


</tr>


`;


});


}





function verVenta(id){


const v=DB.ventas.find(x=>x.id===id);


alert(JSON.stringify(v,null,2));


}




// =====================================
// CUOTAS
// =====================================


function renderCuotas(){


const tabla=document.getElementById("cuotasBody");


if(!tabla)return;


tabla.innerHTML="";


DB.cuotas.forEach(q=>{


tabla.innerHTML+=`

<tr>

<td>${q.cliente}</td>

<td>${q.numero}</td>

<td>S/${q.monto}</td>

<td>${q.fecha.slice(0,10)}</td>

<td>${q.estado}</td>


</tr>


`;


});


}





// =====================================
// DASHBOARD
// =====================================


function renderInicio(){


let clientes=
document.getElementById("statClientes");


let ventas=
document.getElementById("statVentas");


let total=
document.getElementById("statPendiente");


if(clientes)
clientes.textContent=DB.clientes.length;


if(ventas)
ventas.textContent=DB.ventas.length;



let suma=
DB.ventas.reduce((a,b)=>a+b.monto,0);



if(total)
total.textContent="S/"+suma;



}




// =====================================
// TODO
// =====================================


function renderTodo(){


renderInicio();

renderClientes();

renderVentas();

renderCuotas();


}




function actualizarTodo(){

cargarDB();

renderTodo();

alert("Actualizado");


}