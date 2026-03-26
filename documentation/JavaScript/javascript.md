# Fundamentos do JavaScript Moderno (EcmaScript6+)

O JavaScript (JS) é a linguagem de programação da Web. Ele é uma linguagem de tipagem dinâmica, interpretada e multiparadigma (suporta programação orientada a objetos, imperativa e funcional). 

---

## 1. Declaração de Variáveis (Esqueça o `var`)
Hoje em dia, usamos apenas `let` e `const` para declarar variáveis, pois eles respeitam o escopo de bloco (o que evita muitos bugs imprevisíveis).

* **`const`**: Para valores que não serão reatribuídos (são constantes na referência). **Use por padrão.**
* **`let`**: Para valores que vão mudar ao longo do tempo (como contadores ou somadores em loops).

```javascript
const nomeApp = "BolsoDireito"; // Não pode ser reatribuído
let saldo = 452.95;

nomeApp = 2; // Permitido
saldo = "Outro Nome"; // Erro!!!
```

## 2. Estruturas de Dados: Objetos e Arrays
O JS agrupa dados complexos principalmente nestas duas estruturas. 

* **Objetos (`{}`):** Estruturas de chave-valor. Se você está acostumado com Python, pense neles exatamente como os *Dicionários*.
* **Arrays (`[]`):** Listas ordenadas de valores.

```javascript
// Objeto
const gasto00001 = {
    nome: "",
    valor: 120.75,
    categoria: {"Lazer": "Restaurante"},
    avisar: function() {
        console.log("Valor foi cadastrado na Fatura!");
    }
};

// Acessando propriedades
console.log(gasto.valor); // "120.75"
```

## 3. Arrow Functions (`=>`)
Uma forma mais curta e moderna de escrever funções. Elas são muito usadas no React e em callbacks. Além de serem mais enxutas, elas não criam o seu próprio contexto de `this` (o que resolve muita dor de cabeça na orientação a objetos).

```javascript
// Função tradicional
function somar(a, b) {
    return a + b;
}

/ Arrow Function equivalente a:
const somarArrow = (a, b) => {
    return a + b;
};


// Retorno implícito (quando é apenas uma linha)
const multiplicar = (a, b) => a * b;
```

## 4. Métodos de Array (Programação Funcional)
No JS moderno, raramente usamos o clássico `for (let i = 0; i < ...)` para percorrer listas. O padrão da indústria é usar métodos embutidos que recebem uma função como argumento.

* **`.map()`**: Transforma cada item de um array e retorna um **novo array**. (Essencial no React para renderizar listas).
* **`.filter()`**: Retorna um novo array apenas com os itens que passarem em um teste lógico.

```javascript
const inventario = ["Espada", "Poção", "Escudo"];

// Cria um novo array com as strings em maiúsculo
const inventarioMaiusculo = inventario.map(item => item.toUpperCase());

const numeros = [1, 2, 3, 4, 5];
// Filtra apenas os números pares
const pares = numeros.filter(num => num % 2 === 0); // [2, 4]
```

## 5. Desestruturação (Destructuring)
Uma sintaxe que permite extrair dados de Arrays ou Objetos para variáveis distintas de forma muito limpa.

```javascript
const status = { forca: 15, destreza: 18, inteligencia: 10 };

// Extraindo as propriedades diretamente para variáveis
const { forca, destreza } = status;
console.log(forca); // 15
```

## 6. Assincronismo: Promises e `async/await`
Como o JS no navegador roda em uma única thread (só faz uma coisa por vez), tarefas demoradas (como buscar dados de uma API, ler um banco de dados ou carregar assets de um jogo) não podem travar a tela. Usamos o modelo assíncrono para dizer: *"Vá buscar essa informação, enquanto isso eu continuo rodando o resto do código"*.

* **`async/await`** é a forma moderna de lidar com isso, fazendo o código assíncrono parecer síncrono e fácil de ler.

```javascript
// O "async" avisa que esta função lida com processos demorados
async function carregarDadosDoServidor() {
    try {
        // O "await" pausa a execução DESSA função até a resposta chegar
        const resposta = await fetch('[https://api.exemplo.com/dados](https://api.exemplo.com/dados)');
        const dados = await resposta.json();
        console.log(dados);
    } catch (erro) {
        console.error("Falha ao carregar:", erro);
    }
}
```

## 7. Classes (Orientação a Objetos)
Por baixo dos panos, o JS usa algo chamado "Herança por Protótipos", mas a partir do ES6, ganhamos a sintaxe de `class` que é muito familiar para quem estuda Ciência da Computação e vem de linguagens como Java ou Python.

```javascript
class Inimigo {
    // O construtor é chamado ao instanciar a classe
    constructor(nome, dano) {
        this.nome = nome;
        this.dano = dano;
    }

    atacar() {
        console.log(`${this.nome} causou ${this.dano} de dano!`);
    }
}

const goblin = new Inimigo("Goblin Sujo", 5);
goblin.atacar();
```


Esses são os pilares. Compreendendo bem como os Arrays, Objetos e o Assincronismo funcionam, qualquer framework (seja React no front-end ou Node.js/Express no back-end) se torna muito mais intuitivo.

Qual desses tópicos você acha mais diferente da sua experiência atual com programação e gostaria de explorar com exemplos mais práticos?