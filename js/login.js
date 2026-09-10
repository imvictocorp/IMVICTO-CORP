const USUARIO = "micaela@imvicto.com";
const PASSWORD = "Chayanne16";

const USUARIO_ADMIN = "micaela@imvicto.com";
const PASSWORD_ADMIN = "Chayanne16";


const VENDEDORES = [
    {
        nombre: "Mathias",
        correo: "mathias@imvicto.com",
        password: "123456",
        rol: "vendedor"
    }
];


document.addEventListener("DOMContentLoaded",()=>{


const form = document.querySelector("#loginForm");


if(!form) return;



form.addEventListener("submit",(e)=>{


e.preventDefault();



const correo =
document.querySelector("#correo").value.trim();



const clave =
document.querySelector("#clave").value.trim();



// LOGIN ADMIN

if(
correo===USUARIO_ADMIN &&
clave===PASSWORD_ADMIN
){


localStorage.setItem(
"usuario",
JSON.stringify({
    nombre:"Micaela",
    rol:"admin"
})
);


window.location.href="./admin.html";

return;

}




// LOGIN VENDEDORES

const vendedor = VENDEDORES.find(v =>
    v.correo===correo &&
    v.password===clave
);



if(vendedor){


localStorage.setItem(
"usuario",
JSON.stringify(vendedor)
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

}else{

alert(
"Usuario o contraseña incorrectos"
);

}



});


});

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