/*
Neste arquivo, tento aprender como funciona a lógica básica do JS

    # Declaração de Variáveis
        let var_name = value;  --> let serve para variáveis dinâmicas
        const invariavel = value;  --> const definem valores imutáveis.
            |__ tentar declarar " invariavel = outrovalue; " vai dar um erro sinistro
    
    # o 'print' do JS
        console.log("");
            dentro do () dá pra brincar legal. ("String", var,"mais String") quase n dá erro nenhum
    
    # 
*/
class Categoria {

}

class Movimento {
    dataformatada = new Date().toLocaleDateString('pt-BR'); // data do dia formatada ex: 13/03/2026
    constructor(data=dataformatada, estabelecimento, valor) {
        this.data = data
        this.estabelecimento = estabelecimento;
        this.valor = valor;
    }

    // 2. Os Métodos (Ações que a classe pode fazer)
    // Nota: Dentro de uma classe, não precisamos usar a palavra 'function'
    editar(quantidade) {
        this.hp = this.hp - quantidade;
        console.log(`[Dano] ${this.nome} perdeu ${quantidade} de HP. HP atual: ${this.hp}`);
        
        if (this.hp <= 0) {
            this.vivo = false;
            console.log(`[Alerta] ${this.nome} caiu em combate!`);
        }
    }
}

// 3. A Instanciação (Criando objetos reais na memória usando 'new')
let movimento1 = new Aventureiro(estabelecimento="", "Fogo");
let heroi2 = new Aventureiro("Elara", "Elfa", "Vento");

console.log(`Criado: ${heroi1.nome}, Mestre do ${heroi1.afinidadeElemental}`);

// 4. Usando os métodos
heroi1.receberDano(40);
heroi1.receberDano(120);



console.log()
console.log("=====================================================")
console.log()

let idadeold = 13;
const idade = 21;

const meuNome = "Pedro";

if (idade >= 18){
console.log("Meu nome é", meuNome, "e eu tenho", idade, "anos");
} else {
    console.log("Você é menor de idade!");
}

console.log("=======================================")
console.log()

let atributos = ["DEX", "INT"]
atributos.push("WIL");
atributos.unshift("STR");
console.log("Tenho", atributos.length, "atributos e eles são:", atributos);

console.log("=======================================")
console.log()

let atr_dict = {
    STR: 3,
    DEX: 2,
    INT: -1,
    WIL: 0
}
for (let chave in atr_dict) {
    //let valor = atr_dict[chave];
    //console.log(chave,":", valor);
    console.log(chave,":", atr_dict[chave]);
}
// Object.entries(atr_dict) prepara os dados para lermos a chave e o valor de uma vez
for (let [chave, valor] of Object.entries(atr_dict)) {
    // Usamos a crase ` e colocamos as variáveis dentro de ${}
    console.log(`${chave}: ${valor}`);
}