const ADMIN = {
    correo: "micaela@imvicto.com",
    clave: "Chayanne16"
};


document.addEventListener("DOMContentLoaded",()=>{


const form = document.querySelector("#loginForm");


if(!form) return;



form.addEventListener("submit",(e)=>{


e.preventDefault();



const correo =
document.querySelector("#correo").value.trim();



const clave =
document.querySelector("#clave").value.trim();




// ADMIN

if(
correo === ADMIN.correo &&
clave === ADMIN.clave
){

localStorage.setItem(
    "usuario",
    "Micaela"
);

localStorage.setItem(
    "rol",
    "admin"
);


window.location.href="./admin.html";

return;

}



// VENDEDORES

if(
correo===USUARIO_ADMIN &&
clave===PASSWORD_ADMIN
){

localStorage.setItem("usuario","admin");

window.location.href="./admin.html";

return;

}



const vendedor = VENDEDORES.find(v =>
    v.correo===correo &&
    v.password===clave
);


if(vendedor){

localStorage.setItem(
"usuario",
vendedor.nombre
);


localStorage.setItem(
"rol",
"vendedor"
);


window.location.href="./vendedor.html";

return;

}



// ERROR

const error =
document.querySelector("#loginError");


if(error){

error.textContent =
"Usuario o contraseña incorrectos";

}


});


});