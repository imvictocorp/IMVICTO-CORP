// ==========================================
// IMVICTO CORP - GOOGLE FORMS
// ==========================================


const FORMS_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSPfEHb-4mXxPTOKoxmTDZ7fi1n-WUsGW01oOP1b_8YBov5_d0XVEfgcu4X4iELPCbJfUklxXPZOLzC/pub?gid=1242178679&single=true&output=csv";



let registrosForms=[];



async function cargarForms(){


const respuesta =
await fetch(FORMS_URL);



const csv =
await respuesta.text();



const filas =
csv
.split("\n")
.map(
f=>f.split(",")
);



const columnas =
filas.shift();



registrosForms =
filas.map(f=>{


let registro={};


columnas.forEach(
(col,i)=>{


registro[
col.trim()
]=
f[i]
?.trim()
||
"";


});


return registro;


});


return registrosForms;


}




function obtenerMisForms(){


const usuario =
JSON.parse(
localStorage.getItem("usuario")
);



if(!usuario)
return [];



const alias =
(usuario.aliasForms || [])
.map(a=>a.toLowerCase());



return registrosForms.filter(
(r)=>{


const vendedores =
r[
"VENDEDORES (encargado + vendedor)"
]
?.toLowerCase()
||
"";



return alias.some(
a=>vendedores.includes(a)
);



});


}



window.cargarForms =
cargarForms;


window.obtenerMisForms =
obtenerMisForms;