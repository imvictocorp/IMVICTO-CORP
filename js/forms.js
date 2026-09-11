// ==========================================
// IMVICTO CORP - GOOGLE FORMS
// ==========================================


let datosForms = [];



// ==========================================
// CARGAR FORMS
// ==========================================


async function cargarForms(){


try{


const url =
window.IMVICTO_CONFIG?.FORMS_URL;


if(!url){

throw new Error(
"No existe configuración"
);

}



const respuesta =
await fetch(
fetch(url)
);



const texto =
await respuesta.text();



const filas =
texto
.trim()
.split("\n")
.map(
fila =>
fila.split(",")
);



const encabezados =
filas.shift();



datosForms =
filas.map(fila=>{


let obj={};


encabezados.forEach(
(campo,index)=>{


obj[campo.trim()] =
fila[index]
?.trim()
||"";


});


return obj;


});



console.log(
"FORMS CARGADOS",
datosForms
);



mostrarForms();



}
catch(error){


console.error(
"Error Forms:",
error
);



mostrarToast(
"No se pudo cargar IMVICTO FORMS"
);


}



}



// ==========================================
// MOSTRAR DATOS
// ==========================================


function mostrarForms(){


const select =
document.getElementById(
"clienteExistente"
);



if(!select)return;



select.innerHTML =
`
<option>
Registrar manualmente
</option>
`;



datosForms.forEach(
((f,index)=>{


select.innerHTML +=
`

<option value="${index}">
${f.CLIENTE || "Sin nombre"}
</option>

`;


})
);



}



// ==========================================
// SELECCIONAR CLIENTE
// ==========================================


function cargarClienteForm(index){


const data =
datosForms[index];



if(!data)return;



const mapa={


nombre:
data.CLIENTE,


telefono:
data.TELEFONO,


direccion:
data.DIRECCION,


perfil:
data.PERFIL,


fecha:
data.DÍA,


hora:
data.HORA



};



Object.keys(mapa)
.forEach(
(id)=>{


const campo =
document.getElementById(id);



if(campo){

campo.value =
mapa[id];

}


});


}




// ==========================================
// BOTON SINCRONIZAR
// ==========================================


document.addEventListener(
"DOMContentLoaded",
()=>{


cargarForms();



const boton =
document.getElementById(
"sincronizarForms"
);



if(boton){

boton.onclick =
cargarForms;

}



const select =
document.getElementById(
"clienteExistente"
);



if(select){


select.onchange =
()=>{


cargarClienteForm(
select.value
);


};


}



});



// ==========================================
// TOAST
// ==========================================


function mostrarToast(texto){


const toast =
document.getElementById(
"toast"
);



if(toast){


toast.textContent =
texto;


toast.classList.remove(
"hidden"
);


setTimeout(
()=>toast.classList.add("hidden"),
3000
);


}else{


console.log(texto);


}


}