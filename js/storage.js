console.log("Storage local cargado");


const STORAGE = {


clientes:"imvicto_clientes",
ventas:"imvicto_ventas",
cuotas:"imvicto_cuotas",



guardar(clave,datos){

localStorage.setItem(
clave,
JSON.stringify(datos)
);

},



leer(clave){

return JSON.parse(
localStorage.getItem(clave) || "[]"
);

},



agregar(clave,dato){


let lista=this.leer(clave);


dato.id =
Date.now();


dato.fecha =
new Date().toISOString();



lista.unshift(dato);


this.guardar(
clave,
lista
);


return dato;


}



};





window.STORAGE = STORAGE;