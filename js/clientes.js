document.addEventListener("DOMContentLoaded",()=>{


const form=document.querySelector("#clienteForm");


if(form){

form.addEventListener(
"submit",
guardarCliente
);

}


const buscar=document.querySelector("#buscarCliente");


if(buscar){

buscar.addEventListener(
"input",
cargarClientes
);

}


cargarClientes();


});





function guardarCliente(e){

e.preventDefault();


let cliente=
Object.fromEntries(
new FormData(e.target)
);



STORAGE.crear(
STORAGE.clientes,
cliente
);



alert("Cliente registrado");


e.target.reset();


cargarClientes();


}






function cargarClientes(){


const tabla=
document.querySelector("#clientesTabla");


if(!tabla)return;



const texto=
document.querySelector("#buscarCliente")?.value || "";



let clientes=
STORAGE.buscar(
STORAGE.clientes,
texto
);



tabla.innerHTML="";



clientes.forEach(cliente=>{


tabla.innerHTML+=`

<tr>

<td>
${cliente.nombres || ""} 
${cliente.apellidos || ""}
</td>


<td>
${cliente.dni || ""}
</td>


<td>
${cliente.telefono || ""}
</td>


<td>


<button class="btn small"
onclick="verCliente(${cliente.id})">

Ver

</button>



<button class="btn small"
onclick="editarCliente(${cliente.id})">

Editar

</button>



<button class="btn danger small"
onclick="eliminarCliente(${cliente.id})">

Eliminar

</button>


</td>


</tr>

`;

});


}







function eliminarCliente(id){


if(!confirm("¿Eliminar cliente?"))
return;


STORAGE.eliminar(
STORAGE.clientes,
id
);


cargarClientes();


}







function editarCliente(id){


let cliente=
STORAGE.get(
STORAGE.clientes
)
.find(
c=>c.id==id
);



let nombre=
prompt(
"Nombres",
cliente.nombres
);



if(nombre){


STORAGE.actualizar(

STORAGE.clientes,

id,

{
nombres:nombre
}

);



cargarClientes();


}


}







function verCliente(id){


localStorage.setItem(
"cliente_actual",
id
);


location.href="./ventas.html";


}




window.eliminarCliente=eliminarCliente;
window.editarCliente=editarCliente;
window.verCliente=verCliente;