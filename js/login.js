const USUARIO = "micaela@imvicto.com";
const PASSWORD = "chayanne16";

document.addEventListener("DOMContentLoaded",()=>{

const form=document.querySelector("#loginForm");

form.addEventListener("submit",(e)=>{

e.preventDefault();

const correo=document.querySelector("#correo").value;
const clave=document.querySelector("#clave").value;

if(correo===USUARIO && clave===PASSWORD){

localStorage.setItem("usuario","admin");

window.location.href="./admin.html";

}else{

document.querySelector("#loginError").textContent="Usuario o contraseña incorrectos";

}

});

});