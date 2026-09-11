// =====================================
// CLIENTES IMVICTO CORP
// =====================================


document.addEventListener("DOMContentLoaded",()=>{


const form=
document.getElementById("clienteVentaForm");


if(form){

form.addEventListener(
"submit",
registrarCliente
);

}



document
.getElementById("buscarCliente")
?.addEventListener(
"input",
cargarClientes
);



cargarClientes();


});





// =====================================
// REGISTRAR CLIENTE + VENTA
// =====================================


function registrarCliente(e){


e.preventDefault();



const f=
new FormData(e.target);



const cliente={


nombres:
f.get("nombres"),


apellidos:
f.get("apellidos"),


dni:
f.get("dni"),


telefono:
f.get("telefono"),


correo:
f.get("correo"),


direccion:
f.get("direccion")



};



const nuevoCliente=
saveCliente(cliente);





const venta={


clienteId:
nuevoCliente.id,


producto:
f.get("mercaderia"),


montoTotal:
Number(
f.get("monto_total")
),


tipoContrato:
f.get("tipo_contrato"),


estado:
f.get("estado_pedido"),


orden:
f.get("numero_orden"),


regalo:
f.get("regalo"),


vendedor:
f.get("vendedor"),



inicial:
Number(
f.get("inicial") || 0
),



numeroCuotas:
Number(
f.get("cantidad_cuotas") || 0
),



montoCuota:
Number(
f.get("monto_cuota") || 0
),



observaciones:
f.get("observaciones")



};





const nuevaVenta=
saveVenta(venta);



crearCuotasVenta({

...venta,

id:nuevaVenta.id

});





guardarArchivos(
nuevoCliente.id
);



alert(
"Cliente y venta registrados"
);



e.target.reset();



cargarClientes();



}





// =====================================
// LISTAR CLIENTES
// =====================================


function cargarClientes(){

const tabla=
document.getElementById("clientesBody");

if(!tabla)return;


const texto=
document
.getElementById("clienteSearch")
?.value
.toLowerCase()
||"";


const clientes=
getClientes()
.filter(c=>{

let buscar=`

${c.nombres}
${c.apellidos}
${c.dni}
${c.telefono}

`.toLowerCase();


return buscar.includes(texto);

});



tabla.innerHTML="";



clientes.forEach(c=>{


const compras=
getVentas()
.filter(v=>
v.clienteId===c.id
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
${compras}
</td>


<td>

<button
class="btn-view"
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






// =====================================
// EDITAR
// =====================================


function editarCliente(id){


const cliente=
getClientes()
.find(
c=>c.id===id
);



if(!cliente)return;



const form=
document.getElementById(
"clienteVentaForm"
);



form.nombres.value=
cliente.nombres;


form.apellidos.value=
cliente.apellidos;


form.dni.value=
cliente.dni;


form.telefono.value=
cliente.telefono;


form.correo.value=
cliente.correo;


form.direccion.value=
cliente.direccion;



window.scrollTo({
top:0,
behavior:"smooth"
});


}





// =====================================
// ELIMINAR
// =====================================


function eliminarCliente(id){


if(
!confirm(
"¿Eliminar cliente y ventas?"
)

)return;



deleteCliente(id);


cargarClientes();


}





// =====================================
// ARCHIVOS
// =====================================


function guardarArchivos(clienteId){


const input=
document.querySelector(
'input[name="archivos"]'
);



if(
!input ||
!input.files.length
)return;



Array.from(input.files)
.forEach(file=>{


saveDocumento({

clienteId,

nombre:file.name,

tipo:file.type,

fecha:new Date().toISOString()


});


});


}





window.editarCliente=
editarCliente;


window.eliminarCliente=
eliminarCliente;