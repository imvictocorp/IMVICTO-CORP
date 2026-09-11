// ==========================================
// IMVICTO CORP - USUARIOS
// ==========================================


function getUsuarios(){


let data =
localStorage.getItem("usuarios");



if(!data){


const usuarios=[

{
id:1,
nombre:"Administrador",
usuario:"admin",
clave:"1234",
rol:"ADMIN",
aliasForms:[]
},


{
 id:2,
 nombre:"Miguel",
 usuario:"miguel",
 clave:"1234",
 rol:"VENDEDOR",
 aliasForms:"MIGUEL"
},


{
id:3,
nombre:"Miguel",
usuario:"miguel",
clave:"1234",
rol:"VENDEDOR",
aliasForms:[
"MIGUEL"
]
}


];



localStorage.setItem(
"usuarios",
JSON.stringify(usuarios)
);



return usuarios;


}



return JSON.parse(data);


}




function buscarUsuario(usuario,clave){


return getUsuarios()
.find(
u =>
u.usuario===usuario &&
u.clave===clave
);


}




function guardarUsuarios(data){

localStorage.setItem(
"usuarios",
JSON.stringify(data)
);

}



window.getUsuarios=getUsuarios;

window.buscarUsuario=buscarUsuario;

window.guardarUsuarios=guardarUsuarios;