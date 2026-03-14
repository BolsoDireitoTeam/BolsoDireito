

let idade = 13;
idade = 21;

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