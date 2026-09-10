// =======================================
// IMVICTO CORP
// SEGUIMIENTO VENDEDORES
// LOCAL STORAGE
// =======================================


const STORAGE_DEMOS = "imvicto_demos";
const STORAGE_MANT = "imvicto_mantenimientos";


const state = {

    demos: [],

    mantenimientos: [],

    calendarDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    )

};



const els = {};





document.addEventListener(
"DOMContentLoaded",
()=>{


    cargarElementos();


    cargarDatos();


    iniciarEventos();


    renderTodo();


});






function cargarElementos(){


els.syncFormsBtn =
document.getElementById(
"syncFormsBtn"
);



els.clearFiltersBtn =
document.getElementById(
"clearFiltersBtn"
);



els.exportSeguimientoBtn =
document.getElementById(
"exportSeguimientoBtn"
);



els.filterVendedor =
document.getElementById(
"filterVendedor"
);



els.filterTipo =
document.getElementById(
"filterTipo"
);



els.filterDesde =
document.getElementById(
"filterDesde"
);



els.filterHasta =
document.getElementById(
"filterHasta"
);



els.filterSearch =
document.getElementById(
"filterSearch"
);



els.statDemos =
document.getElementById(
"statDemos"
);



els.statMantenimientos =
document.getElementById(
"statMantenimientos"
);



els.statHoy =
document.getElementById(
"statHoy"
);



els.statSemana =
document.getElementById(
"statSemana"
);



els.calendarPrev =
document.getElementById(
"calendarPrev"
);



els.calendarNext =
document.getElementById(
"calendarNext"
);



els.calendarLabel =
document.getElementById(
"calendarLabel"
);



els.calendarGrid =
document.getElementById(
"calendarGrid"
);



els.sellerSummary =
document.getElementById(
"sellerSummary"
);



els.followList =
document.getElementById(
"followList"
);



els.toast =
document.getElementById(
"toast"
);



}








// =======================================
// CARGAR LOCAL
// =======================================


function cargarDatos(){



state.demos =
JSON.parse(
localStorage.getItem(
STORAGE_DEMOS
)
|| "[]"
);



state.mantenimientos =
JSON.parse(
localStorage.getItem(
STORAGE_MANT
)
|| "[]"
);



}







function guardarDatos(){



localStorage.setItem(
STORAGE_DEMOS,
JSON.stringify(
state.demos
)
);



localStorage.setItem(
STORAGE_MANT,
JSON.stringify(
state.mantenimientos
)
);



}







// =======================================
// EVENTOS
// =======================================


function iniciarEventos(){



els.syncFormsBtn?.addEventListener(
"click",
()=>{


mostrarToast(
"Pendiente conectar Google Forms"
);


}
);





els.clearFiltersBtn?.addEventListener(
"click",
limpiarFiltros
);





els.exportSeguimientoBtn?.addEventListener(
"click",
exportarSeguimiento
);





[
els.filterVendedor,
els.filterTipo,
els.filterDesde,
els.filterHasta,
els.filterSearch

]
.forEach(elemento=>{


elemento?.addEventListener(
"change",
renderTodo
);


elemento?.addEventListener(
"input",
renderTodo
);


});





els.calendarPrev?.addEventListener(
"click",
()=>{


state.calendarDate.setMonth(
state.calendarDate.getMonth()-1
);


renderCalendar();


}
);





els.calendarNext?.addEventListener(
"click",
()=>{


state.calendarDate.setMonth(
state.calendarDate.getMonth()+1
);


renderCalendar();


}
);





const logout =
document.getElementById(
"logoutBtn"
);



logout?.addEventListener(
"click",
()=>{


localStorage.removeItem(
"usuario"
);


window.location.href =
"login.html";


}
);



}







// =======================================
// DATOS UNIFICADOS
// =======================================


function obtenerTodos(){


return [

...state.demos.map(
(item)=>({

...item,

tipo:"demo"

})
),



...state.mantenimientos.map(
(item)=>({

...item,

tipo:"mantenimiento"

})
)

];


}






function obtenerFiltrados(){


let datos =
obtenerTodos();



const vendedor =
normalizar(
els.filterVendedor?.value
);



const tipo =
els.filterTipo?.value;



const desde =
els.filterDesde?.value;



const hasta =
els.filterHasta?.value;



const buscar =
normalizar(
els.filterSearch?.value
);




return datos.filter(item=>{


if(
vendedor &&
normalizar(item.vendedor_nombre)
!== vendedor
)

return false;




if(
tipo &&
item.tipo!==tipo
)

return false;




if(
desde &&
item.fecha < desde
)

return false;




if(
hasta &&
item.fecha > hasta
)

return false;




if(
buscar
){


const texto =
normalizar(
[
item.nombre_cliente,
item.direccion,
item.perfil,
item.vendedor_nombre
]
.join(" ")
);



if(
!texto.includes(buscar)
)

return false;


}



return true;


});



}

// =======================================
// RENDER GENERAL
// =======================================


function renderTodo(){


    renderFiltroVendedores();


    renderStats();


    renderResumen();


    renderLista();


    renderCalendar();


}








// =======================================
// FILTRO VENDEDORES
// =======================================


function renderFiltroVendedores(){


if(!els.filterVendedor)
return;



const actual =
els.filterVendedor.value;



const vendedores =
[
...new Set(

obtenerTodos()

.map(
x=>x.vendedor_nombre
)

.filter(Boolean)

)

];



els.filterVendedor.innerHTML = `

<option value="">
Todos
</option>

${
vendedores.map(v=>`

<option value="${v}">
${v}
</option>

`).join("")
}

`;



els.filterVendedor.value =
actual;



}








// =======================================
// ESTADISTICAS
// =======================================


function renderStats(){



const datos =
obtenerTodos();



const hoy =
fechaISO(
new Date()
);



const semana =
fechaISO(
sumarDias(
new Date(),
7
)
);




els.statDemos.textContent =

datos.filter(
x=>x.tipo==="demo"
).length;




els.statMantenimientos.textContent =

datos.filter(
x=>x.tipo==="mantenimiento"
).length;




els.statHoy.textContent =

datos.filter(
x=>x.fecha===hoy
).length;




els.statSemana.textContent =

datos.filter(
x=>
x.fecha>=hoy &&
x.fecha<=semana
).length;



}








// =======================================
// RESUMEN VENDEDORES
// =======================================


function renderResumen(){



if(!els.sellerSummary)
return;



const resumen={};



obtenerFiltrados()
.forEach(item=>{


const vendedor =
item.vendedor_nombre ||
"Sin vendedor";



if(!resumen[vendedor]){


resumen[vendedor]={

nombre:vendedor,

demos:0,

mantenimientos:0,

total:0

};


}



resumen[vendedor].total++;



if(item.tipo==="demo"){

resumen[vendedor].demos++;

}
else{

resumen[vendedor].mantenimientos++;

}



});






els.sellerSummary.innerHTML =

Object.values(resumen)

.sort(
(a,b)=>
b.total-a.total
)

.map(
(v,index)=>`

<article class="seller-card ${index===0 ? "leader":""}">

<strong>
${index===0 ? "🥇 ":""}
${escapeHtml(v.nombre)}
</strong>


<div>

<span>
Demos: ${v.demos}
</span>


<span>
Mantenimientos: ${v.mantenimientos}
</span>


<span>
Total: ${v.total}
</span>


</div>


</article>

`

).join("");



}








// =======================================
// LISTA GESTIONES
// =======================================


function renderLista(){



if(!els.followList)
return;



const datos =
obtenerFiltrados();



if(!datos.length){


els.followList.innerHTML =
`

<p>
No hay gestiones registradas.
</p>

`;

return;

}




els.followList.innerHTML =

datos.map(item=>`

<article class="follow-card">


<div class="follow-card-top">


<div>


<strong>

${escapeHtml(
item.nombre_cliente || ""
)}

</strong>



<div class="follow-meta">

<span>
${formatearFecha(item.fecha)}
</span>


<span>
${escapeHtml(
item.hora || ""
)}
</span>


<span>
${escapeHtml(
item.vendedor_nombre || ""
)}
</span>


</div>



<div>

${escapeHtml(
item.direccion || ""
)}

</div>



</div>



<span class="follow-badge ${item.tipo}">

${
item.tipo==="demo"
?
"Demo"
:
"Mantenimiento"
}

</span>



</div>


</article>

`).join("");



}








// =======================================
// CALENDARIO
// =======================================


function renderCalendar(){



if(!els.calendarGrid)
return;



const fecha =
state.calendarDate;



els.calendarLabel.textContent =

fecha.toLocaleDateString(
"es-PE",
{
month:"long",
year:"numeric"
}
);




const primerDia =
new Date(
fecha.getFullYear(),
fecha.getMonth(),
1
);



const ultimoDia =
new Date(
fecha.getFullYear(),
fecha.getMonth()+1,
0
);



const espacios =
(primerDia.getDay()+6)%7;



let html="";



for(
let i=0;
i<espacios;
i++
){

html+=`

<div class="follow-day empty"></div>

`;

}



const eventos={};



obtenerFiltrados()
.forEach(item=>{


if(!eventos[item.fecha])
eventos[item.fecha]=[];


eventos[item.fecha].push(item);


});





for(
let dia=1;
dia<=ultimoDia.getDate();
dia++
){


const fechaDia =
fechaISO(
new Date(
fecha.getFullYear(),
fecha.getMonth(),
dia
)
);



const items =
eventos[fechaDia] || [];



html+=`

<div class="follow-day">

<span>
${dia}
</span>



<div>

${
items.map(i=>`

<i class="dot ${
i.tipo==="demo"
?
"demo-dot"
:
"mantenimiento-dot"
}">
</i>

`).join("")
}

</div>



</div>

`;



}



els.calendarGrid.innerHTML =
html;



}

// =======================================
// EXPORTAR EXCEL
// =======================================


function exportarSeguimiento(){


if(typeof XLSX==="undefined"){


mostrarToast(
"No está cargado Excel",
true
);


return;


}



const datos =
obtenerFiltrados();



const hoja =
XLSX.utils.json_to_sheet(
datos
);



const libro =
XLSX.utils.book_new();



XLSX.utils.book_append_sheet(
libro,
hoja,
"Seguimiento"
);



XLSX.writeFile(
libro,
"Seguimiento_IMVICTO.xlsx"
);



}






// =======================================
// LIMPIAR FILTROS
// =======================================


function limpiarFiltros(){



if(els.filterVendedor)
els.filterVendedor.value="";



if(els.filterTipo)
els.filterTipo.value="";



if(els.filterDesde)
els.filterDesde.value="";



if(els.filterHasta)
els.filterHasta.value="";



if(els.filterSearch)
els.filterSearch.value="";



renderTodo();



}






// =======================================
// AGREGAR DATOS (PARA FUTURO FORM)
// =======================================


function agregarDemo(demo){



state.demos.push({

...demo,

tipo:"demo"

});



guardarDatos();


renderTodo();



}




function agregarMantenimiento(item){



state.mantenimientos.push({

...item,

tipo:"mantenimiento"

});



guardarDatos();


renderTodo();



}






// =======================================
// UTILIDADES
// =======================================


function normalizar(texto){


return String(texto || "")

.normalize("NFD")

.replace(
/[\u0300-\u036f]/g,
""
)

.toUpperCase()

.trim();


}





function escapeHtml(texto){


return String(texto || "")

.replaceAll(
"&",
"&amp;"
)

.replaceAll(
"<",
"&lt;"
)

.replaceAll(
">",
"&gt;"
)

.replaceAll(
'"',
"&quot;"
)

.replaceAll(
"'",
"&#039;"
);


}






function fechaISO(fecha){


return fecha.toISOString()
.substring(
0,
10
);


}





function sumarDias(fecha,dias){


const nueva =
new Date(fecha);


nueva.setDate(
nueva.getDate()+dias
);



return nueva;


}





function formatearFecha(fecha){


if(!fecha)
return "";



return new Date(
fecha+"T00:00:00"
)

.toLocaleDateString(
"es-PE"
);


}






function mostrarToast(
mensaje,
error=false
){



if(!els.toast){

alert(mensaje);

return;

}



els.toast.textContent =
mensaje;



els.toast.classList.remove(
"hidden"
);



setTimeout(
()=>{


els.toast.classList.add(
"hidden"
);


},
2500
);



}