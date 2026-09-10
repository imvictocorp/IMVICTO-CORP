const USUARIOS = [

    {
        id: 1,
        nombre: "Mathias",
        correo: "mathias@imvicto.com",
        clave: "123456",
        rol: "vendedor",
        activo: true
    }

];


// Obtener lista usuarios
function obtenerUsuarios(){
    return USUARIOS;
}


// Validar login vendedor
function validarUsuario(correo, clave){

    return USUARIOS.find(usuario =>
        usuario.correo === correo &&
        usuario.clave === clave &&
        usuario.activo === true
    );

}