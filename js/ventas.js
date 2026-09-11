// ==========================================
// IMVICTO CORP - VENTAS
// ==========================================


document.addEventListener(
"DOMContentLoaded",
()=>{


const buscar =
document.getElementById(
"buscarVenta"
);



if(buscar){

buscar.addEventListener(
"input",
renderVentas
);

}



renderVentas();



});





// ==========================================
// TABLA VENTAS
// ==========================================


function renderVentas(){



const tabla =
document.getElementById(
"ventasBody"
);



if(!tabla)return;



tabla.innerHTML="";



let texto =
document
.getElementById("buscarVenta")
?.value
.toLowerCase()
||
"";



getVentas()

.filter(v=>{


let cliente =
buscarCliente(
v.clienteId
);



let datos =
`

${cliente?.nombres || ""}

${cliente?.apellidos || ""}

${cliente?.dni || ""}

${v.producto || ""}

${v.orden || ""}

${v.vendedor || ""}

`.toLowerCase();



return datos.includes(texto);



})


.forEach(v=>{


let cliente =
buscarCliente(
v.clienteId
);



tabla.innerHTML +=
`

<tr>


<td>

<strong>
${cliente
?
cliente.nombres+" "+cliente.apellidos
:
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
// DETALLE
// ==========================================


function verVenta(id){


let venta =
buscarVenta(id);



if(!venta){

alert(
"Venta no encontrada"
);

return;

}



let cliente =
buscarCliente(
venta.clienteId
);



let cuotas =
getCuotas()
.filter(
q=>q.ventaId==venta.id
);




let detalle = `

DETALLE DE VENTA


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