// ==========================================
// IMVICTO CORP - CLIENTES
// ==========================================


let clienteEditando = null;



document.addEventListener(
"DOMContentLoaded",
()=>{


const form =
document.getElementById("clienteForm");



if(form){

form.addEventListener(
"submit",
guardarCliente
);

}



const buscar =
document.getElementById("clienteSearch");



if(buscar){

buscar.addEventListener(
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



const data =
new FormData(e.target);



let cliente;



if(clienteEditando){



cliente =
actualizarCliente(
clienteEditando,
{

nombres:data.get("nombres"),

apellidos:data.get("apellidos"),

dni:data.get("dni"),

telefono:data.get("telefono"),

correo:data.get("correo"),

direccion:data.get("direccion")

}

);



}else{


cliente =
crearCliente({

nombres:data.get("nombres"),

apellidos:data.get("apellidos"),

dni:data.get("dni"),

telefono:data.get("telefono"),

correo:data.get("correo"),

direccion:data.get("direccion")

});


}




let venta =
crearVenta({

clienteId:cliente.id,

producto:data.get("mercaderia"),

montoTotal:data.get("monto_total"),

tipoContrato:data.get("tipo_contrato"),

estado:data.get("estado_pedido"),

orden:data.get("numero_orden"),

vendedor:data.get("vendedor"),

regalo:data.get("regalo")

});






if(
venta.tipoContrato==="FINANCIADO"
){


let cantidad =
Number(
data.get("numero_cuotas")
);



let monto =
Number(
data.get("monto_cuota")
);



if(cantidad>0){

crearCuotas(
venta,
cantidad,
monto
);

}


}




alert(
"Registro guardado correctamente"
);





clienteEditando=null;



e.target.reset();




let boton =
e.target.querySelector("button");



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




// quedarse en clientes

mostrarVista(
"clientes"
);



}







// ==========================================
// LISTADO
// ==========================================


function renderClientes(){



let tabla =
document.getElementById(
"clientesBody"
);



if(!tabla)return;



tabla.innerHTML="";



let texto =
document.getElementById(
"clienteSearch"
)?.value
.toLowerCase()
||
"";




getClientes()

.filter(c=>{


let datos =
`

${c.nombres}

${c.apellidos}

${c.dni}

${c.telefono}

`.toLowerCase();



return datos.includes(texto);



})

.forEach(c=>{


let compras =
getVentas()
.filter(
v=>v.clienteId==c.id
)
.length;



tabla.innerHTML +=
`

<tr>


<td>
${c.nombres}
${c.apellidos}
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
class="btn-small"
onclick="editarCliente(${c.id})">

Editar

</button>



<button
class="btn-small danger"
onclick="eliminarClienteVista(${c.id})">

Eliminar

</button>



</td>


</tr>

`;



});



}








// ==========================================
// EDITAR
// ==========================================


function editarCliente(id){


let c =
buscarCliente(id);



if(!c)return;



clienteEditando=id;



let form =
document.getElementById(
"clienteForm"
);



if(!form)return;



form.nombres.value =
c.nombres;


form.apellidos.value =
c.apellidos;


form.dni.value =
c.dni;


form.telefono.value =
c.telefono;


form.correo.value =
c.correo || "";


form.direccion.value =
c.direccion || "";




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
// ELIMINAR
// ==========================================


function eliminarClienteVista(id){



if(
confirm(
"¿Eliminar cliente y ventas?"
)
){



eliminarCliente(id);



renderClientes();



renderInicio();



renderVentas?.();



renderCuotas?.();



}



}



window.eliminarClienteVista =
eliminarClienteVista;