window.DB = {

    async getClientes(){

        const {data,error}= await db
            .from("clientes")
            .select("*")
            .order("created_at",{ascending:false});


        if(error){
            console.error(error);
            throw error;
        }


        return data || [];
    },


    async crearCliente(cliente){

        const {data,error}= await db
            .from("clientes")
            .insert(cliente)
            .select()
            .single();


        if(error) throw error;


        return data;
    },


    async actualizarCliente(id,datos){

        const {data,error}= await db
            .from("clientes")
            .update(datos)
            .eq("id",id)
            .select()
            .single();


        if(error) throw error;


        return data;
    },


    async eliminarCliente(id){

        const {error}= await db
            .from("clientes")
            .delete()
            .eq("id",id);


        if(error) throw error;
    },


    async getVentas(){

        const {data,error}= await db
            .from("ventas")
            .select("*");


        if(error) throw error;

        return data || [];
    },


    async getCuotas(){

        const {data,error}= await db
            .from("cuotas")
            .select("*");


        if(error) throw error;

        return data || [];
    }

};