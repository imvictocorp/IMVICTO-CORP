document.addEventListener("DOMContentLoaded",()=>{

const form = document.querySelector("#loginForm");

if(!form) return;


form.addEventListener("submit",(e)=>{

e.preventDefault();


const correo =
document.querySelector("#correo").value.trim();


const clave =
document.querySelector("#clave").value.trim();



/* ADMIN */

if(
correo === "micaela@imvicto.com" &&
clave === "Chayanne16"
){

localStorage.setItem("usuario","Micaela");
localStorage.setItem("rol","admin");

window.location.href="./admin.html";

return;

}



/* VENDEDORES LOCALES */

const usuarios =
JSON.parse(localStorage.getItem("imvicto_users")) || [

{
id:1,
nombre:"Mathias",
correo:"mathias@imvicto.com",
clave:"123456",
rol:"vendedor",
activo:true
}

];


const vendedor = usuarios.find(usuario=>

usuario.correo===correo &&
usuario.clave===clave &&
usuario.activo!==false

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


localStorage.setItem(
"vendedor_id",
vendedor.id
);


window.location.href="./vendedor.html";


return;

}




const error =
document.querySelector("#loginError");


if(error){

error.textContent =
"Usuario o contraseña incorrectos";

}



});


});