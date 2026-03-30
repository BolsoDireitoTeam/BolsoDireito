/******************************************************************************
O certo é usar uma classe, mas para exemplificar, vou usar um 
objeto literal para representar uma suposta instância de usuário e seus dados.
******************************************************************************/
import { prynt } from "./utils.js";

let User = {
    nome: "João",
    idade: 30,
    email: "joaoanonimo@example.com",
    senha: "senha123",
    
    // os campos abaixo são relacionados a movimentações financeiras
    saldo: 1000,
    categorias: ["Outros", "Lazer", "Alimentação", "Transporte", "Saúde", "Gasolina"]
}

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
        logica = this.param_interno - variavel_param;
        return logica
    }

    
    cadastrar(variavel_param){
        logica = this.param_interno - variavel_param;
        return logica
    }
}

function cadastrarMovimento(param_externo, categoria = null){

}

prynt("Hello World");