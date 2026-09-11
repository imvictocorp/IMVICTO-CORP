// ==========================================
// IMVICTO CORP - GOOGLE FORMS
// ==========================================


let IMVICTO_FORMS = [];




// ===============================
// CARGAR FORMS
// ===============================


async function cargarForms(){


try{


const url =
window.IMVICTO_CONFIG.FORMS_URL;


const respuesta =
await fetch(
"https://api.allorigins.win/raw?url=" 
+ encodeURIComponent(url)
);



const texto =
await respuesta.text();



const filas =
texto
.trim()
.split("\n")
.map(linea=>linea.split(","));



const headers =
filas[0]
.map(
h=>h
.replace(/"/g,"")
.trim()
);



IMVICTO_FORMS =
filas
.slice(1)
.map(fila=>{


let obj={};



headers.forEach(
(header,i)=>{


obj[header]=
(fila[i]||"")
.replace(/"/g,"")
.trim();



});


return obj;



});



console.log(
"FORMS CARGADOS",
IMVICTO_FORMS
);



return IMVICTO_FORMS;



}catch(error){


console.error(
"Error Forms:",
error
);


console.error(
"No se pudo cargar IMVICTO FORMS"
);


return [];

}


}





// ===============================
// DATOS DEL VENDEDOR
// ===============================


function obtenerUsuarioActual(){


const usuario =
localStorage.getItem(
"usuario"
);



if(!usuario)
return null;



return JSON.parse(usuario);


}





// ===============================
// FILTRAR POR VENDEDOR
// ===============================


function obtenerMisForms(){



const usuario =
obtenerUsuarioActual();



if(!usuario)
return [];




if(usuario.rol==="admin"){

return IMVICTO_FORMS;

}



const nombre =
usuario.aliasForms
||
usuario.nombre
||
usuario.usuario
||
"";



return IMVICTO_FORMS.filter(
(item)=>{


const vendedores =
(
item["VENDEDORES (encargado + vendedor)"]
||
""
)
.toUpperCase();



return vendedores.includes(
nombre.toUpperCase()
);



}

);



}





// ===============================
// INICIO
// ===============================


document.addEventListener(
"DOMContentLoaded",
()=>{


cargarForms();



});