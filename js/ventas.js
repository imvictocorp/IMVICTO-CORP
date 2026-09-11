// ==========================================
// IMVICTO CORP - VENTAS
// ==========================================


document.addEventListener(
"DOMContentLoaded",
()=>{


const buscador =
document.getElementById("buscarVenta");



if(buscador){

buscador.addEventListener(
"input",
renderVentas
);

}



renderVentas();


});




// ==========================================
// LISTAR VENTAS
// ==========================================


function renderVentas(){


const tabla =
document.getElementById(
"ventasTabla"
);



if(!tabla)return;



tabla.innerHTML="";



const texto =
document
.getElementById("buscarVenta")
?.value
.toLowerCase()
||
"";



getVentas()

.filter(v=>{


const cliente =
buscarCliente(
v.clienteId
);



const datos =
`

${cliente?.nombres || ""}

${cliente?.apellidos || ""}

${cliente?.dni || ""}

${v.numeroOrden || ""}

${v.producto || ""}

${v.vendedor || ""}

`.toLowerCase();



return datos.includes(texto);


})

.forEach(v=>{


const cliente =
buscarCliente(
v.clienteId
);



tabla.innerHTML += `

<tr>


<td>

<strong>
${cliente ?
cliente.nombres+" "+cliente.apellidos :
"Sin cliente"}

</strong>

<br>

<small>
DNI:
${cliente?.dni || "-"}
</small>

</td>



<td>

${v.producto || "-"}

</td>



<td>

S/
${Number(v.montoTotal || 0)
.toFixed(2)}

</td>



<td>

${v.tipoContrato || "-"}

</td>



<td>

${v.vendedor || "-"}

</td>



<td>


<button
class="btn-small"
onclick="verVenta(${v.id})">

Ver

</button>


</td>


</tr>

`;



});


}






// ==========================================
// DETALLE DE VENTA
// ==========================================


function verVenta(id){


const venta =
buscarVenta(id);



if(!venta){

alert(
"No existe la venta"
);

return;

}



const cliente =
buscarCliente(
venta.clienteId
);



const cuotas =
getCuotas()
.filter(
q=>q.ventaId==venta.id
);



let detalle = `

CLIENTE:

${cliente?.nombres || ""}
${cliente?.apellidos || ""}


DNI:

${cliente?.dni || "-"}


TELÉFONO:

${cliente?.telefono || "-"}


PRODUCTO:

${venta.producto}


MONTO:

S/${venta.montoTotal}


CONTRATO:

${venta.tipoContrato}


VENDEDOR:

${venta.vendedor || "-"}


`;



if(cuotas.length){


detalle += `

CUOTAS:

${cuotas.length}

`;



}



alert(detalle);



}



window.verVenta =
verVenta;