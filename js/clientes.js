// ==========================================
// IMVICTO CORP - CLIENTES
// ==========================================


let clienteEditando=null;



document.addEventListener(
"DOMContentLoaded",
()=>{


const form=
document.getElementById("clienteForm");


if(form){


form.addEventListener(
"submit",
guardarCliente
);


}



const buscar=
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



const data=
new FormData(e.target);



let nombres=data.get("nombres");

let apellidos=data.get("apellidos");

let dni=data.get("dni");

let telefono=data.get("telefono");

let producto=data.get("mercaderia");

let monto=
Number(data.get("monto_total"));



if(
!nombres ||
!apellidos ||
!dni ||
!telefono ||
!producto ||
!monto
){


alert(
"Completa todos los campos obligatorios"
);


return;

}





let cliente;



if(clienteEditando){



let clientes=getClientes();


cliente=
clientes.find(
c=>c.id==clienteEditando
);



cliente.nombres=nombres;

cliente.apellidos=apellidos;

cliente.dni=dni;

cliente.telefono=telefono;

cliente.correo=data.get("correo");

cliente.direccion=data.get("direccion");



guardarClientes(clientes);



}
else{


cliente=crearCliente({

nombres,

apellidos,

dni,

telefono,

correo:data.get("correo"),

direccion:data.get("direccion")


});


}




let venta=
crearVenta({


clienteId:cliente.id,


producto,


montoTotal:monto,


tipoContrato:
data.get("tipo_contrato"),


estado:
data.get("estado_pedido") || "ACTUAL",


orden:
data.get("numero_orden"),


vendedor:
data.get("vendedor"),


regalo:
data.get("regalo"),


observaciones:
data.get("observaciones")


});





if(
venta.tipoContrato==="FINANCIADO"
){


let cantidad=
Number(data.get("numero_cuotas"));


let cuota=
Number(data.get("monto_cuota"));



if(cantidad>0){


crearCuotas(
venta,
cantidad,
cuota
);


}


}





window.location.href="admin.html#clientes";


clienteEditando=null;



e.target
.querySelector("button")
.textContent=
"Guardar cliente y venta";



renderClientes();


renderInicio();



alert(
"Registro guardado correctamente"
);


}





// ==========================================
// LISTAR CLIENTES
// ==========================================


function renderClientes(){


let tabla=
document.getElementById("clientesBody");



if(!tabla)return;



tabla.innerHTML="";



let texto=
document
.getElementById("clienteSearch")
?.value
.toLowerCase()
||
"";



getClientes()
.filter(c=>{


let datos=`

${c.nombres}

${c.apellidos}

${c.dni}

${c.telefono}

`.toLowerCase();



return datos.includes(texto);


})
.forEach(c=>{


let ventas=
getVentas()
.filter(
v=>v.clienteId==c.id
)
.length;



tabla.innerHTML+=`

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
${ventas}
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


let c=
buscarCliente(id);



if(!c)return;



clienteEditando=id;



let form=
document.getElementById("clienteForm");



form.nombres.value=c.nombres;

form.apellidos.value=c.apellidos;

form.dni.value=c.dni;

form.telefono.value=c.telefono;

form.correo.value=c.correo||"";

form.direccion.value=c.direccion||"";



form.querySelector("button")
.textContent=
"Actualizar cliente";



document
.getElementById("clientes")
.scrollIntoView();


}





// ==========================================
// ELIMINAR
// ==========================================


function eliminarClienteVista(id){


if(
confirm(
"¿Eliminar cliente y toda su información?"
)
){


eliminarCliente(id);


renderClientes();

renderInicio();


}


}



window.editarCliente=editarCliente;

window.eliminarClienteVista=eliminarClienteVista;