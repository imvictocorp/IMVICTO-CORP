let clienteSeleccionado=null;



document.addEventListener("DOMContentLoaded",()=>{


document
.querySelector("#buscarClienteVenta")
?.addEventListener(
"input",
buscarClientes
);



document
.querySelector("#ventaForm")
?.addEventListener(
"submit",
guardarVenta
);



cargarVentas();


});







function buscarClientes(){


let texto=
document.querySelector("#buscarClienteVenta")
.value;



let clientes=
STORAGE.buscar(
STORAGE.clientes,
texto
);



let box=
document.querySelector("#resultadoClientes");



if(!box)return;



box.innerHTML="";



clientes.forEach(c=>{


box.innerHTML+=`

<div class="cliente-card">


<strong>
${c.nombres} ${c.apellidos}
</strong>


<br>

DNI:
${c.dni}


<button onclick="seleccionarCliente(${c.id})">

Seleccionar

</button>


</div>

`;

});


}








function seleccionarCliente(id){


clienteSeleccionado=
STORAGE.get(
STORAGE.clientes
)
.find(
c=>c.id==id
);



document.querySelector("#cliente_id").value=id;


document.querySelector("#clienteNombre").value=

clienteSeleccionado.nombres+" "+
clienteSeleccionado.apellidos;



document.querySelector("#formVentaBox")
.style.display="block";


}







function guardarVenta(e){


e.preventDefault();



if(!clienteSeleccionado){

alert(
"Selecciona un cliente"
);

return;

}



let venta=
Object.fromEntries(
new FormData(e.target)
);



venta.cliente_id=
clienteSeleccionado.id;



venta.cliente_nombre=
clienteSeleccionado.nombres+" "+
clienteSeleccionado.apellidos;



STORAGE.crear(
STORAGE.ventas,
venta
);



alert(
"Venta registrada"
);



e.target.reset();


cargarVentas();


}








function cargarVentas(){


let tabla=
document.querySelector("#ventasTabla");



if(!tabla)return;



let ventas=
STORAGE.get(
STORAGE.ventas
);



tabla.innerHTML="";



ventas.forEach(v=>{


tabla.innerHTML+=`

<tr>


<td>
${v.cliente_nombre}
</td>


<td>
${v.producto}
</td>


<td>
S/${v.monto_total}
</td>


<td>
${v.tipo_contrato}
</td>


<td>
${new Date(v.fecha_creacion)
.toLocaleDateString()}
</td>


</tr>

`;

});


}




window.seleccionarCliente=
seleccionarCliente;