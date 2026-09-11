// ==========================================
// IMVICTO CORP - CUOTAS
// ==========================================


let cuotaSeleccionada = null;



document.addEventListener(
"DOMContentLoaded",
()=>{

renderCuotas();


}
);





// ==========================================
// RENDER CUOTAS
// ==========================================


function renderCuotas(){


const contenedor =
document.getElementById(
"cuotasTabla"
);



if(!contenedor)return;



contenedor.innerHTML="";



const cuotas =
getCuotas();



if(!cuotas.length){

contenedor.innerHTML = `

<div class="empty-row">

No existen cuotas registradas

</div>

`;

return;

}




const grupos={};



cuotas.forEach(c=>{


if(!grupos[c.ventaId]){

grupos[c.ventaId]=[];

}


grupos[c.ventaId].push(c);


});





Object.keys(grupos)
.forEach(id=>{



const lista =
grupos[id];



const venta =
buscarVenta(id);



const cliente =
buscarCliente(
venta?.clienteId
);



if(!venta)return;




contenedor.innerHTML += `


<div class="cuota-venta">



<details>


<summary>


<div class="cuota-header">


<div>


<strong>

${cliente?.nombres || ""}
${cliente?.apellidos || ""}

</strong>


<p>

Orden:
${venta.numeroOrden || "-"}

</p>


<p>

${venta.producto || "-"}

-
S/${Number(
venta.montoTotal||0
).toFixed(2)}

</p>


</div>



<div class="cuota-resumen">


<span>

${lista.filter(
q=>q.estado==="PAGADA"
).length}

/${lista.length}

pagadas

</span>


</div>


</div>


</summary>





<div class="cuotas-list">


${
lista.map(c=>{


return `


<div class="cuota-item">



<div>


<strong>

Cuota ${c.numero}

</strong>



<p>

S/${Number(c.monto)
.toFixed(2)}

</p>



<p>

Vence:

${formatearFecha(
c.fechaVencimiento
)}

</p>



${
c.fechaPago

?

`<p class="fecha-pago">
Pagado:
${formatearFecha(c.fechaPago)}
</p>`

:

""

}


</div>





<div>


<span class="badge ${
c.estado==="PAGADA"
?"pagado"
:"pendiente"
}">

${c.estado}

</span>



<button

class="btn-cuota"

onclick="
abrirPago(${c.id})
">

${
c.estado==="PAGADA"
?"Editar"
:"Pagar"
}


</button>


</div>



</div>


`


}).join("")

}



</div>


</details>


</div>


`;




});



}




// ==========================================
// FECHAS
// ==========================================


function formatearFecha(fecha){


if(!fecha)return "-";


const d =
new Date(fecha);



return d.toLocaleDateString(
"es-PE"
);


}





// ==========================================
// MODAL PAGO
// ==========================================


function abrirPago(id){


cuotaSeleccionada=id;



const modal =
document.getElementById(
"modalPago"
);



if(!modal)return;



modal.classList.remove(
"hidden"
);



}



function cerrarPago(){


const modal =
document.getElementById(
"modalPago"
);



if(modal){

modal.classList.add(
"hidden"
);

}


cuotaSeleccionada=null;


}




function guardarPago(){


if(!cuotaSeleccionada)return;



const fecha =
document.getElementById(
"fechaPago"
).value;



if(!fecha){

alert(
"Seleccione fecha de pago"
);

return;

}



const cuotas =
getCuotas();



const cuota =
cuotas.find(
q=>q.id==cuotaSeleccionada
);



if(!cuota)return;



cuota.estado="PAGADA";

cuota.fechaPago =
fecha;



actualizarCuotas(
cuotas
);



cerrarPago();


renderCuotas();



if(typeof renderInicio==="function"){

renderInicio();

}



}





// ==========================================
// GLOBAL
// ==========================================


window.abrirPago =
abrirPago;


window.cerrarPago =
cerrarPago;


window.guardarPago =
guardarPago;