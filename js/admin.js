console.log("Admin funcionando");


document.addEventListener("DOMContentLoaded",()=>{


iniciarAdmin();


});



function iniciarAdmin(){


configurarNav();

cargarDashboard();

document
.getElementById("refreshBtn")
?.addEventListener(
"click",
cargarDashboard
);


}



// ================================
// NAVEGACION
// ================================


function configurarNav(){


document
.querySelectorAll(".nav-btn")
.forEach(btn=>{


btn.addEventListener("click",()=>{


let vista=btn.dataset.view;


mostrarVista(vista);



});


});


}



function mostrarVista(vista){


document
.querySelectorAll(".view")
.forEach(v=>{

v.classList.remove("active");

});



let actual=
document.getElementById(vista);



if(actual)
actual.classList.add("active");



document
.querySelectorAll(".nav-btn")
.forEach(b=>{


b.classList.toggle(
"active",
b.dataset.view===vista
);


});



}



// ================================
// DASHBOARD
// ================================


function cargarDashboard(){


let clientes=
getClientes();



let ventas=
getVentas();



let cuotas=
getCuotas();



document
.getElementById("statClientes")
&&(document.getElementById("statClientes").innerText=
clientes.length);



document
.getElementById("statVentas")
&&(document.getElementById("statVentas").innerText=
ventas.length);



let total=
ventas.reduce(
(a,v)=>a+
Number(
v.montoTotal||
v.monto||
0
),
0
);



document
.getElementById("statVentaTotal")
&&(document.getElementById("statVentaTotal").innerText=
"S/ "+total);



document
.getElementById("statPendiente")
&&(document.getElementById("statPendiente").innerText=
"S/ "+
cuotas
.filter(q=>q.estado!=="PAGADA")
.reduce(
(a,q)=>a+
Number(q.monto||0),
0
));



}


