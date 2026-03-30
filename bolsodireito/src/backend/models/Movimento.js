class Movimento{
    constructor(param_externo, categoria = null){
        this.param_externo = param_externo;
        this.param_interno = 0;
        this.categoria = categoria;

        if(this.categoria == null){
            console.log("É um Ganho")
        }
        else{
            console.log("É um Gasto")
        }


    }

    metodo(variavel_param){
        const logica = this.param_interno - variavel_param;
        return logica
    }

    
    cadastrar(variavel_param){
        let logica = this.param_interno - variavel_param;
        return logica
    }
}