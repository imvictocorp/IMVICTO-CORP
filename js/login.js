const USUARIO = "micaela@imvicto.com";
const PASSWORD = "Chayanne16";


document.addEventListener("DOMContentLoaded",()=>{


const form = document.querySelector("#loginForm");


if(!form) return;



form.addEventListener("submit",(e)=>{


e.preventDefault();



const correo =
document.querySelector("#correo").value.trim();



const clave =
document.querySelector("#clave").value.trim();



if(
correo===USUARIO &&
clave===PASSWORD
){


localStorage.setItem(
"usuario",
"admin"
);



window.location.href="./admin.html";



}else{


const error =
document.querySelector("#loginError");


if(error){

error.textContent =
"Usuario o contraseña incorrectos";

}else{

alert(
"Usuario o contraseña incorrectos"
);

}


}



});



});