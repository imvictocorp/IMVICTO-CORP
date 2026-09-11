// ==========================================
// IMVICTO CORP - CUOTAS
// ==========================================


document.addEventListener(
"DOMContentLoaded",
()=>{


renderCuotas();


});




// ==========================================
// RENDER CUOTAS AGRUPADAS
// ==========================================


function renderCuotas(){


let tabla=
document.getElementById("cuotasBody");


if(!tabla)return;



tabla.innerHTML="";



let cuotas=getCuotas();



let grupos={};



cuotas.forEach(c=>{


if(!grupos[c.ventaId]){

grupos[c.ventaId]=[];

}


grupos[c.ventaId].push(c);


});



Object.keys(grupos)
.forEach(id=>{


let venta=
buscarVenta(id);



let cliente=
venta?
buscarCliente(venta.clienteId):
null;



let lista=grupos[id];



tabla.innerHTML+=`

<tr>


<td colspan="6">


<details class="cuota-card">


<summary>


<div class="cuota-header">


<div>

<strong>
${cliente?
cliente.nombres+" "+cliente.apellidos:
"Cliente"}
</strong>


<br>


<span>
${venta?.producto || ""}
</span>


</div>



<div>

<strong>
S/${Number(venta?.montoTotal||0).toFixed(2)}
</strong>

<br>

<small>
${venta?.tipoContrato || ""}
</small>


</div>


</div>


</summary>




<div class="cuota-list">


${lista.map(q=>`


<div class="cuota-item">


<div>

<strong>
Cuota ${q.numero}
</strong>


<br>

<span>
Monto:
S/${Number(q.monto).toFixed(2)}
</span>


</div>



<div>


<span class="${q.estado==="PAGADA"?"pagada":"pendiente"}">

${q.estado}

</span>



<button

class="btn-small"

onclick="cambiarEstadoCuota(${q.id})">


${q.estado==="PAGADA"
?"Reabrir"
:"Pagar"}

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


let cuotas=getCuotas();



let cuota=
cuotas.find(
q=>q.id==id
);



if(!cuota)return;



cuota.estado=
cuota.estado==="PAGADA"
?
"PENDIENTE"
:
"PAGADA";



if(cuota.estado==="PAGADA"){

cuota.fechaPago=
new Date().toISOString();

}
else{

cuota.fechaPago=null;

}



guardarCuotas(cuotas);



renderCuotas();


renderInicio();


}



window.cambiarEstadoCuota=
cambiarEstadoCuota;