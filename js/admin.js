let clientes=[];
let ventas=[];
let cuotas=[];



document.addEventListener(
"DOMContentLoaded",
()=>{


iniciar();


});



async function iniciar(){


navegacion();


const form=document.getElementById("clienteForm");


if(form){

form.addEventListener(
"submit",
guardarCliente
);

}



await cargarDatos();


}





async function cargarDatos(){


try{


clientes=await DB.getClientes();

ventas=await DB.getVentas();

cuotas=await DB.getCuotas();


mostrarClientes();

mostrarVentas();

mostrarCuotas();

estadisticas();


}
catch(e){

console.error(e);

toast("Error cargando datos");

}



}





async function guardarCliente(e){


e.preventDefault();



const datos=
Object.fromEntries(
new FormData(e.target)
);



try{


await DB.crearCliente(datos);



toast(
"Cliente guardado"
);



e.target.reset();


await cargarDatos();


}
catch(error){


console.error(error);

toast(
"No se pudo guardar cliente"
);


}



}







function mostrarClientes(){


const tabla=
document.getElementById(
"clientesBody"
);



if(!tabla)return;



tabla.innerHTML="";



clientes.forEach(c=>{


tabla.innerHTML+=`

<tr>

<td>
${c.nombres || ""} ${c.apellidos || ""}
</td>

<td>
${c.dni || ""}
</td>

<td>
${c.telefono || ""}
</td>

<td>
-
</td>

</tr>

`;


});


}





function mostrarVentas(){


const tabla=
document.getElementById(
"ventasBody"
);


if(!tabla)return;


tabla.innerHTML="";


ventas.forEach(v=>{


tabla.innerHTML+=`

<tr>

<td>${v.cliente || ""}</td>

<td>${v.monto || ""}</td>

<td>${v.tipo_contrato || ""}</td>


</tr>

`;

});


}






function mostrarCuotas(){


const tabla=
document.getElementById(
"cuotasBody"
);


if(!tabla)return;



tabla.innerHTML="";



cuotas.forEach(c=>{


tabla.innerHTML+=`

<tr>

<td>${c.cliente || ""}</td>

<td>${c.monto || ""}</td>

<td>${c.fecha || ""}</td>

<td>${c.estado || ""}</td>

</tr>


`;

});


}





function estadisticas(){


document.getElementById("statClientes").textContent=
clientes.length;


document.getElementById("statVentas").textContent=
ventas.length;



}





function navegacion(){


document
.querySelectorAll(".nav-btn")
.forEach(btn=>{


btn.onclick=()=>{


document
.querySelectorAll(".view")
.forEach(v=>v.classList.remove("active"));



document
.getElementById(btn.dataset.view)
.classList.add("active");



};


});


}






function toast(texto){


const t=document.getElementById("toast");


if(t){

t.textContent=texto;

t.classList.remove("hidden");


setTimeout(()=>{

t.classList.add("hidden");

},3000);


}else{

alert(texto);

}


}