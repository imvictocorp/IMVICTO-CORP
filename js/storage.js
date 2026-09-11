const STORAGE = {

clientes: "imvicto_clientes",
ventas: "imvicto_ventas",
cuotas: "imvicto_cuotas",

get(clave){
    return JSON.parse(localStorage.getItem(clave) || "[]");
},

set(clave, datos){
    localStorage.setItem(clave, JSON.stringify(datos));
},

crear(clave, dato){

    let lista = this.get(clave);

    dato.id = Date.now();
    dato.fecha_creacion = new Date().toISOString();

    lista.unshift(dato);

    this.set(clave, lista);

    return dato;
},

actualizar(clave,id,cambios){

    let lista = this.get(clave);

    lista = lista.map(item=>{

        if(item.id == id){
            return {
                ...item,
                ...cambios,
                fecha_actualizacion:new Date().toISOString()
            };
        }

        return item;

    });

    this.set(clave,lista);

},


eliminar(clave,id){

    let lista=this.get(clave);

    lista=lista.filter(
        item=>item.id!=id
    );

    this.set(clave,lista);

},


buscar(clave,texto){

    let lista=this.get(clave);

    if(!texto) return lista;


    texto=texto.toLowerCase();


    return lista.filter(item=>

        JSON.stringify(item)
        .toLowerCase()
        .includes(texto)

    );

}


};


window.STORAGE = STORAGE;