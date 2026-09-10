function obtenerUsuarios(){

return JSON.parse(
localStorage.getItem("imvicto_users")
) || [

{
id:1,
nombre:"Mathias",
correo:"mathias@imvicto.com",
clave:"123456",
rol:"vendedor",
activo:true
}

];

}



function guardarUsuarios(lista){

localStorage.setItem(
"imvicto_users",
JSON.stringify(lista)
);

}



function validarUsuario(correo,clave){


const usuarios =
obtenerUsuarios();


return usuarios.find(usuario=>

usuario.correo===correo &&
usuario.clave===clave &&
usuario.activo!==false

);


}