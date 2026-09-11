// ==========================================
// IMVICTO CORP - CUOTAS
// ==========================================


document.addEventListener(
"DOMContentLoaded",
()=>{


renderCuotas();


});




// ==========================================
// LISTAR CUOTAS
// ==========================================


function renderCuotas(){


const tabla =
document.getElementById(
"cuotasTabla"
);



if(!tabla)return;



tabla.innerHTML="";



const cuotas =
getCuotas();



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
venta
?
buscarCliente(
venta.clienteId
)
:
null;





tabla.innerHTML += `

<tr>


<td colspan="5">


<details class="cuota-box">


<summary>


<strong>

${cliente
?
cliente.nombres+" "+cliente.apellidos
:
"Sin cliente"}

</strong>


<br>


<span>

${venta?.producto || "-"}

-

S/${Number(
venta?.montoTotal || 0
).toFixed(2)}

</span>


</summary>





<div class="cuotas-list">


${lista.map(c=>`


<div class="cuota-item">


<div>


<strong>
Cuota ${c.numero}
</strong>


<br>


<span>
S/${Number(c.monto).toFixed(2)}
</span>


</div>




<div>


<span class="
${c.estado==="PAGADA"
?
"estado-pagada"
:
"estado-pendiente"}
">


${c.estado}


</span>




<button

class="btn-small"

onclick="
cambiarEstadoCuota(${c.id})
">

${c.estado==="PAGADA"
?
"Reabrir"
:
"Pagar"}

</button>


</div>


</div>



`).join("")}


</div>



</details>


</td>


</tr>

`;



});



}







// ==========================================
// CAMBIAR ESTADO
// ==========================================


function cambiarEstadoCuota(id){


const cuotas =
getCuotas();



const cuota =
cuotas.find(
c=>c.id==id
);



if(!cuota)return;



if(
cuota.estado==="PAGADA"
){


cuota.estado="PENDIENTE";

cuota.fechaPago=null;



}else{


cuota.estado="PAGADA";

cuota.fechaPago=
new Date()
.toISOString();



}



actualizarCuotas(
cuotas
);



renderCuotas();



if(typeof renderInicio==="function"){

renderInicio();

}



}



window.cambiarEstadoCuota =
cambiarEstadoCuota;