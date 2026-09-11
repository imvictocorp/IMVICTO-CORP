// =====================================
// CUOTAS IMVICTO CORP
// =====================================


document.addEventListener("DOMContentLoaded",()=>{


cargarCuotas();


});




// =====================================
// LISTAR CUOTAS
// =====================================


function cargarCuotas(){


const tabla=
document.getElementById(
"cuotasTabla"
);



if(!tabla)return;



tabla.innerHTML="";



const cuotas=
getCuotas();



cuotas.forEach(q=>{


const cliente=
getClientes()
.find(
c=>c.id===q.clienteId
);



const venta=
getVentas()
.find(
v=>v.id===q.ventaId
);



tabla.innerHTML+=`

<tr>


<td>

${cliente?.nombres || ""}
${cliente?.apellidos || ""}

</td>



<td>

${venta?.producto || "-"}

</td>



<td>

${q.numero}

</td>



<td>

S/ ${Number(q.monto).toFixed(2)}

</td>



<td>

${q.fecha || "-"}

</td>



<td>


<span>

${q.estado}

</span>


</td>



<td>


<button

class="btn-view"

onclick="pagarCuota(${q.id})">


Marcar pagada


</button>


</td>



</tr>


`;

});


}






// =====================================
// PAGAR CUOTA
// =====================================


function pagarCuota(id){


const cuotas=
getCuotas();



const cuota=
cuotas.find(
c=>c.id===id
);



if(!cuota)return;



cuota.estado="PAGADA";


cuota.fechaPago=
new Date()
.toISOString();



saveData(
DB_KEYS.cuotas,
cuotas
);



cargarCuotas();


}






window.pagarCuota=
pagarCuota;