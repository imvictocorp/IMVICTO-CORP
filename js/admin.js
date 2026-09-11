// ==========================================
// IMVICTO CORP - ADMIN
// ==========================================


console.log(
"Admin cargado"
);




// ===============================
// DASHBOARD
// ===============================


function renderInicio(){


const clientes =
getClientes();


const ventas =
getVentas();


const cuotas =
getCuotas();



const total =
ventas.reduce(
(total,v)=>
total+
Number(v.montoTotal||0),
0
);



const pendientes =
cuotas.filter(
q=>q.estado==="PENDIENTE"
).length;



const statClientes =
document.getElementById(
"statClientes"
);


const statVentas =
document.getElementById(
"statVentas"
);


const statCuotas =
document.getElementById(
"statCuotas"
);


const statMonto =
document.getElementById(
"statMonto"
);



if(statClientes)
statClientes.textContent =
clientes.length;



if(statVentas)
statVentas.textContent =
ventas.length;



if(statCuotas)
statCuotas.textContent =
pendientes;



if(statMonto)
statMonto.textContent =
"S/"+total.toFixed(2);




renderInicioTabla();



}



// ===============================
// TABLA INICIO
// ===============================


function renderInicioTabla(){


const tabla =
document.getElementById(
"inicioTabla"
);



if(!tabla)return;



tabla.innerHTML="";



getVentas()
.slice()
.reverse()
.slice(0,5)
.forEach(v=>{


const cliente =
buscarCliente(
v.clienteId
);



tabla.innerHTML += `

<tr>

<td>

${cliente?
cliente.nombres+" "+cliente.apellidos:
"-"}

</td>


<td>

${v.producto||"-"}

</td>


<td>

S/${Number(v.montoTotal||0)
.toFixed(2)}

</td>


<td>

${v.estado||"-"}

</td>


</tr>

`;



});



}







// ===============================
// SEGUIMIENTO
// ===============================


function renderSeguimiento(){


const tabla =
document.getElementById(
"seguimientoTabla"
);



if(!tabla)return;



tabla.innerHTML="";



const vendedores={};



getVentas()
.forEach(v=>{


let nombre =
v.vendedor || "Sin vendedor";



if(!vendedores[nombre]){

vendedores[nombre]=0;

}


vendedores[nombre]++;



});



Object.keys(vendedores)
.forEach(nombre=>{


tabla.innerHTML += `

<tr>

<td>
${nombre}
</td>


<td>
${vendedores[nombre]}
</td>


<td>
-
</td>


<td>
-
</td>


<td>
-
</td>


</tr>

`;



});



}







// ===============================
// NAVEGACIÓN
// ===============================


function mostrarVista(id){



document
.querySelectorAll(".view")
.forEach(
(v)=>
v.classList.remove("active")
);



const vista =
document.getElementById(id);



if(vista){

vista.classList.add(
"active"
);

}



document
.querySelectorAll(".nav-btn")
.forEach(
(btn)=>{


btn.classList.remove(
"active"
);



if(btn.dataset.view===id){

btn.classList.add(
"active"
);

}



});



actualizarTitulo(id);



renderTodo();



}






function actualizarTitulo(id){



const titulos={


inicio:[
"Inicio",
"Control general del negocio"
],


seguimiento:[
"Seguimiento",
"Rendimiento de vendedores"
],


clientes:[
"Clientes",
"Registro e historial"
],


ventas:[
"Ventas",
"Registro general"
],


cuotas:[
"Cuotas",
"Control de pagos"
],


exportar:[
"Exportar",
"Descarga información"
]


};



const data =
titulos[id];



if(!data)return;



const titulo =
document.getElementById(
"viewTitle"
);



const subtitulo =
document.getElementById(
"viewSubtitle"
);



if(titulo)
titulo.textContent=data[0];



if(subtitulo)
subtitulo.textContent=data[1];



}






// ===============================
// ACTUALIZAR TODO
// ===============================


function renderTodo(){


renderInicio();


renderClientes();


renderVentas();


renderCuotas();


renderSeguimiento();



}







// ===============================
// SESIÓN
// ===============================


function cerrarSesion(){



localStorage.removeItem(
"usuario"
);


localStorage.removeItem(
"rol"
);


localStorage.removeItem(
"vendedor_id"
);



window.location.href=
"./login.html";



}






// ===============================
// INICIO
// ===============================


document.addEventListener(
"DOMContentLoaded",
()=>{


document
.querySelectorAll(".nav-btn")
.forEach(
(btn)=>{


btn.addEventListener(
"click",
()=>{


mostrarVista(
btn.dataset.view
);



});


});



const logout =
document.getElementById(
"logoutBtn"
);



if(logout){

logout.onclick =
cerrarSesion;

}



const refresh =
document.getElementById(
"refreshBtn"
);



if(refresh){

refresh.onclick =
renderTodo;

}



renderTodo();



}
);