// ==========================================
// IMVICTO CORP - CLIENTES
// ==========================================


let clienteEditando = null;



document.addEventListener(
"DOMContentLoaded",
()=>{


const form =
document.getElementById(
"clienteVentaForm"
);



if(form){

form.addEventListener(
"submit",
guardarCliente
);

}



const buscador =
document.getElementById(
"buscarCliente"
);



if(buscador){

buscador.addEventListener(
"input",
renderClientes
);

}



renderClientes();


});




// ==========================================
// GUARDAR CLIENTE + VENTA
// ==========================================


function guardarCliente(e){


e.preventDefault();



const form =
e.target;



const datos =
new FormData(form);



let cliente;



if(clienteEditando){


cliente =
actualizarCliente(
clienteEditando,
{

nombres:datos.get("nombres"),

apellidos:datos.get("apellidos"),

dni:datos.get("dni"),

telefono:datos.get("telefono"),

correo:datos.get("correo"),

direccion:datos.get("direccion")

}

);



}else{


cliente =
crearCliente({

nombres:datos.get("nombres"),

apellidos:datos.get("apellidos"),

dni:datos.get("dni"),

telefono:datos.get("telefono"),

correo:datos.get("correo"),

direccion:datos.get("direccion")

});



}





const venta =
crearVenta({

clienteId:cliente.id,


producto:
datos.get("mercaderia"),


montoTotal:
datos.get("monto_total"),


tipoContrato:
datos.get("tipo_contrato"),


estado:
datos.get("estado_pedido"),


numeroOrden:
datos.get("numero_orden"),


vendedor:
datos.get("vendedor"),


regalo:
datos.get("regalo"),


observaciones:
datos.get("observaciones")

});





if(
venta.tipoContrato !== "AL CONTADO"
){


const cantidad =
Number(
datos.get("cantidad_cuotas")
);



const monto =
Number(
datos.get("monto_cuota")
);



if(
cantidad>0 &&
monto>0
){


crearCuotas(
venta,
cantidad,
monto
);


}


}





form.reset();


clienteEditando=null;



const boton =
form.querySelector(
"button"
);



if(boton){

boton.textContent =
"Guardar cliente y venta";

}



renderClientes();



if(typeof renderVentas==="function")
renderVentas();



if(typeof renderCuotas==="function")
renderCuotas();



if(typeof renderInicio==="function")
renderInicio();



mostrarVista("clientes");



alert(
"Cliente registrado correctamente"
);



}






// ==========================================
// LISTAR CLIENTES
// ==========================================


function renderClientes(){


const tabla =
document.getElementById(
"clientesTabla"
);



if(!tabla)return;



tabla.innerHTML="";



const texto =
document
.getElementById(
"buscarCliente"
)
?.value
.toLowerCase()
||
"";





getClientes()

.filter(c=>{


const ventas =
getVentas()
.filter(
v=>v.clienteId==c.id
);



const ordenes =
ventas
.map(v=>v.numeroOrden)
.join(" ");



const datos = `

${c.nombres}

${c.apellidos}

${c.dni}

${c.telefono}

${ordenes}

`.toLowerCase();



return datos.includes(texto);



})


.forEach(c=>{


const ventasCliente =
getVentas()
.filter(
v=>v.clienteId==c.id
);





tabla.innerHTML += `


<tr>


<td colspan="5">



<details class="cliente-box">


<summary>



<div class="cliente-header">


<div>


<strong>

${c.nombres}
${c.apellidos}

</strong>


<br>


<small>

DNI:
${c.dni}

</small>


<br>


<small>

Tel:
${c.telefono}

</small>



</div>


<div>


${ventasCliente.length}

compras


</div>



</div>



</summary>





<div class="cliente-ordenes">


${ventasCliente.map(v=>`


<div class="orden-card">


<strong>

Orden #${v.numeroOrden || "-"}

</strong>


<br>


Producto:

${v.producto}


<br>


Monto:

S/
${Number(v.montoTotal)
.toFixed(2)}



</div>


`).join("")}



</div>




<div class="cliente-actions">


<button

class="btn-small"

onclick="editarCliente(${c.id})"

>

Editar

</button>



<button

class="btn-small danger"

onclick="eliminarClienteVista(${c.id})"

>

Eliminar

</button>



</div>




</details>



</td>


</tr>


`;



});


}

// ==========================================
// EDITAR CLIENTE
// ==========================================


function editarCliente(id){


const cliente =
buscarCliente(id);



if(!cliente)return;



clienteEditando=id;



const form =
document.getElementById(
"clienteVentaForm"
);



if(!form)return;





form.nombres.value =
cliente.nombres;



form.apellidos.value =
cliente.apellidos;



form.dni.value =
cliente.dni;



form.telefono.value =
cliente.telefono;



form.correo.value =
cliente.correo || "";



form.direccion.value =
cliente.direccion || "";





form.querySelector("button")
.textContent =
"Actualizar cliente";



mostrarVista(
"clientes"
);



}





window.editarCliente =
editarCliente;







// ==========================================
// ELIMINAR CLIENTE
// ==========================================


function eliminarClienteVista(id){


if(
confirm(
"¿Eliminar cliente y todas sus ventas?"
)
){


eliminarCliente(id);



renderClientes();



if(typeof renderVentas==="function")
renderVentas();



if(typeof renderCuotas==="function")
renderCuotas();



if(typeof renderInicio==="function")
renderInicio();



}


}





window.eliminarClienteVista =
eliminarClienteVista;