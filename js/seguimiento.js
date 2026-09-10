// =======================================
// IMVICTO CORP - SEGUIMIENTO COMERCIAL
// Supabase demos + mantenimientos
// =======================================


const supabaseDB = window.imvictoSupabase;


const state = {

    demos: [],

    mantenimientos: [],

    calendarDate: startOfMonth(new Date())

};



const els = {


    syncFormsBtn:
    document.getElementById("syncFormsBtn"),


    clearFiltersBtn:
    document.getElementById("clearFiltersBtn"),


    exportSeguimientoBtn:
    document.getElementById("exportSeguimientoBtn"),



    filterVendedor:
    document.getElementById("filterVendedor"),


    filterTipo:
    document.getElementById("filterTipo"),


    filterDesde:
    document.getElementById("filterDesde"),


    filterHasta:
    document.getElementById("filterHasta"),


    filterSearch:
    document.getElementById("filterSearch"),



    statDemos:
    document.getElementById("statDemos"),


    statMantenimientos:
    document.getElementById("statMantenimientos"),


    statHoy:
    document.getElementById("statHoy"),


    statSemana:
    document.getElementById("statSemana"),



    calendarPrev:
    document.getElementById("calendarPrev"),


    calendarNext:
    document.getElementById("calendarNext"),


    calendarLabel:
    document.getElementById("calendarLabel"),


    calendarGrid:
    document.getElementById("calendarGrid"),



    sellerSummary:
    document.getElementById("sellerSummary"),


    followList:
    document.getElementById("followList"),


    toast:
    document.getElementById("toast")

};





document.addEventListener(
"DOMContentLoaded",
()=>{


    iniciar();


});






async function iniciar(){


    if(!supabaseDB){

        toast(
        "Supabase no está conectado",
        true
        );

        return;

    }



    bindEvents();


    await cargarSeguimiento();


    renderAll();


}







// =======================================
// EVENTOS
// =======================================


function bindEvents(){



    els.syncFormsBtn?.addEventListener(
        "click",
        sincronizarForms
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


    ].forEach(input=>{


        input?.addEventListener(
            "input",
            renderAll
        );


        input?.addEventListener(
            "change",
            renderAll
        );


    });





    els.calendarPrev?.addEventListener(
        "click",
        ()=>{

            state.calendarDate =
            addMonths(
                state.calendarDate,
                -1
            );


            renderCalendar();

        }
    );





    els.calendarNext?.addEventListener(
        "click",
        ()=>{

            state.calendarDate =
            addMonths(
                state.calendarDate,
                1
            );


            renderCalendar();

        }
    );



}








// =======================================
// CARGAR SUPABASE
// =======================================


async function cargarSeguimiento(){



const demos =
await supabaseDB
.from("demos")
.select("*")
.order(
"created_at",
{
ascending:false
}
);




if(demos.error)
throw demos.error;



state.demos =
demos.data || [];





const mantenimientos =
await supabaseDB
.from("mantenimientos")
.select("*")
.order(
"created_at",
{
ascending:false
}
);




if(mantenimientos.error)
throw mantenimientos.error;



state.mantenimientos =
mantenimientos.data || [];



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







function filtrados(){


const vendedor =
normalizar(
els.filterVendedor?.value || ""
);



const tipo =
els.filterTipo?.value || "";



const desde =
els.filterDesde?.value || "";



const hasta =
els.filterHasta?.value || "";



const buscar =
normalizar(
els.filterSearch?.value || ""
);




return obtenerTodos()
.filter(item=>{


const itemVendedor =
normalizar(
item.vendedor_nombre || ""
);



const texto =
normalizar(

[
item.nombre_cliente,
item.direccion,
item.perfil,
item.vendedor_nombre,
item.notas

].join(" ")

);




if(vendedor &&
itemVendedor!==vendedor)
return false;




if(tipo &&
item.tipo!==tipo)
return false;




if(desde &&
item.fecha < desde)
return false;




if(hasta &&
item.fecha > hasta)
return false;




if(buscar &&
!texto.includes(buscar))
return false;



return true;



});

}

// =======================================
// RENDER GENERAL
// =======================================


function renderAll(){

    renderFiltroVendedores();

    renderStats();

    renderResumen();

    renderLista();

    renderCalendar();

}






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

].sort();



els.filterVendedor.innerHTML = `

<option value="">
Todos
</option>

${
vendedores.map(v=>`

<option value="${escapeHtml(v)}">
${escapeHtml(v)}
</option>

`).join("")
}

`;



els.filterVendedor.value =
actual;



}







function renderStats(){


const datos =
obtenerTodos();



const hoy =
toISODate(
new Date()
);



const semana =
toISODate(
addDays(
new Date(),
7
)
);




if(els.statDemos)
els.statDemos.textContent =
datos.filter(
x=>x.tipo==="demo"
).length;



if(els.statMantenimientos)
els.statMantenimientos.textContent =
datos.filter(
x=>x.tipo==="mantenimiento"
).length;



if(els.statHoy)
els.statHoy.textContent =
datos.filter(
x=>x.fecha===hoy
).length;



if(els.statSemana)
els.statSemana.textContent =
datos.filter(
x=>
x.fecha>=hoy &&
x.fecha<=semana
).length;


}







function renderResumen(){


if(!els.sellerSummary)
return;



const grupos={};



filtrados()
.forEach(item=>{


const vendedor =
item.vendedor_nombre ||
"SIN VENDEDOR";



if(!grupos[vendedor]){


grupos[vendedor]={

nombre:vendedor,

demos:0,

mantenimientos:0,

total:0

};


}



grupos[vendedor].total++;



if(item.tipo==="demo"){

grupos[vendedor].demos++;

}else{

grupos[vendedor].mantenimientos++;

}



});




els.sellerSummary.innerHTML =

Object.values(grupos)

.sort(
(a,b)=>b.total-a.total
)

.map(x=>`

<article class="seller-card">

<strong>
${escapeHtml(x.nombre)}
</strong>

<div>

<span>
Demos: ${x.demos}
</span>

<span>
Mant: ${x.mantenimientos}
</span>

<span>
Total: ${x.total}
</span>

</div>

</article>

`).join("");



}








function renderLista(){



if(!els.followList)
return;



const datos =
filtrados();



if(!datos.length){


els.followList.innerHTML=

`
<p>
No existen gestiones registradas.
</p>
`;

return;


}



els.followList.innerHTML =

datos.map(item=>`

<article class="follow-card ${item.tipo}">


<div class="follow-card-top">


<div>

<strong>
${escapeHtml(item.nombre_cliente || "")}
</strong>


<div class="follow-meta">

<span>
${formatDate(item.fecha)}
</span>

<span>
${escapeHtml(item.hora || "")}
</span>

<span>
${escapeHtml(item.vendedor_nombre || "")}
</span>


</div>


<div>
${escapeHtml(item.direccion || "")}
</div>


</div>



<span class="follow-badge ${item.tipo}">
${item.tipo==="demo" ? "Demo":"Mantenimiento"}
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



const inicio =
startOfMonth(
state.calendarDate
);



const year =
inicio.getFullYear();



const month =
inicio.getMonth();



const dias =
new Date(
year,
month+1,
0
).getDate();



const offset =
(inicio.getDay()+6)%7;



els.calendarLabel.textContent =
inicio.toLocaleDateString(
"es-PE",
{
month:"long",
year:"numeric"
}
);



const eventos={};



filtrados()
.forEach(item=>{


if(!eventos[item.fecha])
eventos[item.fecha]=[];


eventos[item.fecha].push(item);


});



let html="";



for(let i=0;i<offset;i++){

html+=`
<div class="follow-day empty"></div>
`;

}



for(
let d=1;
d<=dias;
d++
){


const fecha =
toISODate(
new Date(
year,
month,
d
)
);



const items =
eventos[fecha] || [];



html+=`

<div class="follow-day">

<span>
${d}
</span>


<div>

${
items.map(i=>`

<i class="dot ${
i.tipo==="demo"
?"demo-dot"
:"mantenimiento-dot"
}"></i>

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
// SINCRONIZACIÓN FORMS
// (por ahora manual)
// =======================================


async function sincronizarForms(){


toast(
"Sincronización Forms pendiente"
);


}



// =======================================
// EXPORTAR
// =======================================


function exportarSeguimiento(){


if(typeof XLSX==="undefined"){

toast(
"No está cargado XLSX",
true
);

return;

}



const datos =
obtenerTodos();



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
"IMVICTO_SEGUIMIENTO.xlsx"
);


}







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


renderAll();

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

.replaceAll("&","&amp;")

.replaceAll("<","&lt;")

.replaceAll(">","&gt;")

.replaceAll('"',"&quot;")

.replaceAll("'","&#039;");

}



function toast(msg,error=false){


if(!els.toast){

alert(msg);

return;

}



els.toast.textContent=msg;


els.toast.style.background =
error
?
"#991b1b"
:
"#0b2744";


els.toast.classList.remove(
"hidden"
);


setTimeout(()=>{


els.toast.classList.add(
"hidden"
);


},3000);


}




function toISODate(date){


return date.toISOString()
.slice(0,10);


}



function formatDate(fecha){


if(!fecha)
return "";


return new Date(
fecha+"T00:00:00"
)
.toLocaleDateString(
"es-PE"
);


}



function startOfMonth(date){


return new Date(
date.getFullYear(),
date.getMonth(),
1
);


}



function addMonths(date,n){


return new Date(
date.getFullYear(),
date.getMonth()+n,
1
);


}



function addDays(date,n){


const d=new Date(date);

d.setDate(
d.getDate()+n
);

return d;


}