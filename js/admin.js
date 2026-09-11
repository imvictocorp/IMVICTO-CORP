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





const ahora =
new Date();



const inicioSemana =
new Date();


inicioSemana.setDate(
ahora.getDate() -
ahora.getDay()
);

inicioSemana.setHours(
0,0,0,0
);



const inicioMes =
new Date(
ahora.getFullYear(),
ahora.getMonth(),
1
);





const clientesSemana =
clientes.filter(c=>{


const fecha =
new Date(c.fecha);


return fecha >= inicioSemana;


}).length;




const clientesMes =
clientes.filter(c=>{


const fecha =
new Date(c.fecha);


return fecha >= inicioMes;


}).length;





const ventasSemana =
ventas.filter(v=>{


const fecha =
new Date(v.fecha);


return fecha >= inicioSemana;


})
.reduce(
(total,v)=>
total+
Number(v.montoTotal||0),
0
);





const ventasMes =
ventas.filter(v=>{


const fecha =
new Date(v.fecha);


return fecha >= inicioMes;


})
.reduce(
(total,v)=>
total+
Number(v.montoTotal||0),
0
);







const statClientes =
document.getElementById(
"statClientes"
);


const statVentas =
document.getElementById(
"statVentas"
);


const statVentasSemana =
document.getElementById(
"statVentasSemana"
);


const statMonto =
document.getElementById(
"statMonto"
);




if(statClientes)
statClientes.textContent =
clientesSemana;




if(statVentas)
statVentas.textContent =
clientesMes;




if(statVentasSemana)
statVentasSemana.textContent =
"S/"+ventasSemana.toFixed(2);




if(statMonto)
statMonto.textContent =
"S/"+ventasMes.toFixed(2);





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
.forEach(btn=>{


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
"Resumen comercial"
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
titulo.textContent =
data[0];



if(subtitulo)
subtitulo.textContent =
data[1];



}







// ===============================
// ACTUALIZAR TODO
// ===============================


function renderTodo(){



renderInicio();



if(typeof renderClientes==="function")
renderClientes();



if(typeof renderVentas==="function")
renderVentas();



if(typeof renderCuotas==="function")
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



window.location.href =
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
.forEach(btn=>{


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