// ==========================================
// LOGIN
// ==========================================


document
.getElementById("loginForm")
.addEventListener(
"submit",
e=>{


e.preventDefault();



const usuario =
document
.getElementById("usuario")
.value
.trim();



const clave =
document
.getElementById("clave")
.value
.trim();




const encontrado =
buscarUsuario(
usuario,
clave
);



const error =
document.getElementById(
"loginError"
);



if(!encontrado){


error.textContent =
"Usuario o contraseña incorrectos";


return;


}




localStorage.setItem(
"usuario",
JSON.stringify(encontrado)
);




if(
encontrado.rol==="ADMIN"
){


location.href=
"admin.html";


}else{


location.href=
"vendedor.html";


}



});