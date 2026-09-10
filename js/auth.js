document.addEventListener(
"DOMContentLoaded",
()=>{


const usuario =
localStorage.getItem("usuario");


const pagina =
window.location.pathname;


const esLogin =
pagina.includes("login.html");



if(!usuario && !esLogin){

window.location.href="./login.html";

return;

}



const session =
document.getElementById("sessionLabel");


if(session){

session.textContent =
"Sesión: "+usuario;

}



const logout =
document.getElementById("logoutBtn");


if(logout){

logout.onclick=()=>{


localStorage.removeItem("usuario");
localStorage.removeItem("rol");
localStorage.removeItem("vendedor_id");


window.location.href="./login.html";


};


}



});