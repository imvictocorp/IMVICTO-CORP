// ==========================================
// IMVICTO CORP - VENTAS
// ==========================================


document.addEventListener(
"DOMContentLoaded",
()=>{


const buscador =
document.getElementById(
"buscarVenta"
);



if(buscador){

buscador.addEventListener(
"input",
renderVentas
);

}



renderVentas();


});





// ==========================================
// RESALTAR BUSQUEDA
// ==========================================


function resaltar(
texto,
busqueda
){


if(!busqueda)
return texto;



const regex =
new RegExp(
`(${busqueda})`,
"gi"
);



return String(texto)
.replace(
regex,
"<mark>$1</mark>"
);


}






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
.getElementById(
"buscarVenta"
)
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



const datos = `

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

${resaltar(

(cliente?
cliente.nombres+" "+cliente.apellidos
:
"Sin cliente"),

texto

)}

</strong>


<br>


<small>

DNI:
${resaltar(
cliente?.dni || "-",
texto
)}

</small>



</td>





<td>


${resaltar(
v.producto || "-",
texto
)}


</td>





<td>


S/
${Number(
v.montoTotal || 0
)
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

onclick="
verVenta(${v.id})
"

>

Ver

</button>


</td>



</tr>


`;



});



}









// ==========================================
// DETALLE VENTA
// ==========================================


function verVenta(id){



const venta =
buscarVenta(id);



if(!venta)
return;



const cliente =
buscarCliente(
venta.clienteId
);



const cuotas =
getCuotas()
.filter(
q=>q.ventaId==venta.id
);



const compras =
getVentas()
.filter(
v=>v.clienteId==venta.clienteId
);





const html = `


<div 
id="modalVenta"
class="modal-overlay">


<div class="modal-card venta-modal">



<h2>
Detalle de venta
</h2>




<div class="venta-section">


<h4>
Cliente
</h4>



<strong>

${cliente?.nombres || ""}
${cliente?.apellidos || ""}

</strong>


<p>

DNI:
${cliente?.dni || "-"}

</p>


<p>

Teléfono:
${cliente?.telefono || "-"}

</p>


</div>






<div class="venta-section">


<h4>
Compra actual
</h4>



<p>

Orden:

<strong>
#${venta.numeroOrden || "-"}
</strong>


</p>



<p>

Producto:

${venta.producto}

</p>



<p>

Monto:

S/
${Number(
venta.montoTotal
)
.toFixed(2)}

</p>



<p>

Contrato:

${venta.tipoContrato}

</p>


</div>







<div class="venta-section">


<h4>
Cuotas
</h4>


<p>

${cuotas.length}
cuotas generadas

</p>



</div>








<div class="venta-section">


<h4>
Historial del cliente
</h4>



${
compras.map(v=>`


<div class="venta-mini">


<strong>

Orden #${v.numeroOrden}

</strong>


<br>


${v.producto}


<br>


S/
${Number(
v.montoTotal
)
.toFixed(2)}


</div>



`).join("")
}



</div>






<button

class="btn primary"

onclick="cerrarVenta()"

>

Cerrar

</button>




</div>

</div>



`;




document.body.insertAdjacentHTML(
"beforeend",
html
);



}




function cerrarVenta(){



const modal =
document.getElementById(
"modalVenta"
);



if(modal){

modal.remove();

}



}




window.verVenta =
verVenta;


window.cerrarVenta =
cerrarVenta;