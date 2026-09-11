// =====================================
// VENTAS IMVICTO CORP
// =====================================


document.addEventListener("DOMContentLoaded",()=>{


document
.getElementById("buscarVenta")
?.addEventListener(
"input",
cargarVentas
);


cargarVentas();


});





// =====================================
// CARGAR VENTAS
// =====================================


function cargarVentas(){


const tabla=
document.getElementById(
"ventasTabla"
);



if(!tabla)return;



const texto=
document
.getElementById("buscarVenta")
?.value
.toLowerCase()
||
"";



const ventas=
getVentas()
.filter(v=>{


const cliente=
getClientes()
.find(
c=>c.id===v.clienteId
);



let datos=
`

${cliente?.nombres || ""}

${cliente?.apellidos || ""}

${cliente?.dni || ""}

${v.producto || ""}

${v.orden || ""}

${v.vendedor || ""}

`

.toLowerCase();



return datos.includes(texto);


});



tabla.innerHTML="";



ventas.forEach(v=>{


const cliente=
getClientes()
.find(
c=>c.id===v.clienteId
);



tabla.innerHTML+=`

<tr>


<td>

${cliente?.nombres || ""}
${cliente?.apellidos || ""}

<br>

<small>
${cliente?.dni || ""}
</small>

</td>



<td>

${v.producto}

</td>



<td>

S/ ${Number(v.montoTotal).toFixed(2)}

</td>



<td>

${v.tipoContrato}

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





// =====================================
// VER DETALLE
// =====================================


function verVenta(id){


const venta=
getVentas()
.find(
v=>v.id===id
);



if(!venta)return;



const cliente=
getClientes()
.find(
c=>c.id===venta.clienteId
);



const cuotas=
getCuotas()
.filter(
q=>q.ventaId===venta.id
);



let detalle=`


CLIENTE

${cliente.nombres}
${cliente.apellidos}


DNI:
${cliente.dni}


TELÉFONO:
${cliente.telefono}



PEDIDO

Producto:
${venta.producto}


Monto:
S/ ${venta.montoTotal}


Contrato:
${venta.tipoContrato}


Estado:
${venta.estado}



`;


if(cuotas.length){


detalle+=`

CUOTAS

Cantidad:
${cuotas.length}


`;



}



alert(detalle);



}





window.verVenta=
verVenta;