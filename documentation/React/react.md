
# TO AJEITANDO AINDA!!

# Guia Rápido: Fundamentos do React

O React é uma biblioteca JavaScript baseada em **componentes**. Você descreve como a interface deve se parecer para um determinado estado, e o React cuida de atualizar o DOM de forma eficiente.

---

## 1. JSX (JavaScript XML) 
XML é por que ele transporta dados através das tags <tag><tag/>
JSX é uma extensão de sintaxe que permite escrever código semelhante a HTML diretamente dentro do JavaScript. 
* **Regra de ouro:** Você só pode retornar um único elemento raiz por componente (geralmente agrupado em uma `<div>` ou num Fragmento `<> </>`).
* **Expressões:** Qualquer código JavaScript válido pode ser inserido no JSX usando chaves `{}`.

```jsx
const nome = "Pedro";
const saudacao = <h1>Olá, {nome}!</h1>;
```

## 2. Componentes (Components)
São os blocos de construção da sua interface. Em vez de construir uma página inteira, você constrói peças reutilizáveis (como Botões, Cabeçalhos, Formulários) e as junta. Hoje, o padrão é usar Componentes Funcionais.

```JavaScript
function Botao() {
  return <button>Clique Aqui</button>;
}
```
## 3. Props (Propriedades)
É a forma como os componentes se comunicam, passando dados de cima para baixo (do componente "Pai" para o componente "Filho").

- Imutabilidade: Um componente nunca deve modificar suas próprias props. Elas são apenas para leitura.

```JavaScript
// Componente Filho
function Saudacao(props) {
  return <h1>Olá, {props.nome}!</h1>;
}

// Componente Pai
function App() {
  return <Saudacao nome="Bia" />; 
}
```
## 4. State (Estado) e o Hook useState
Enquanto as props vêm de fora, o state é a memória interna do componente. Quando o estado muda, o React re-renderiza o componente automaticamente para refletir essa mudança na tela.

```JavaScript
import { useState } from 'react';

function Contador() {
  // valorAtual, funcaoParaAtualizar = useState(valorInicial)
  const [contador, setContador] = useState(0);

  return (
    <div>
      <p>Você clicou {contador} vezes</p>
      <button onClick={() => setContador(contador + 1)}>
        Adicionar
      </button>
    </div>
  );
}
```
## 5. Efeitos Colaterais e o Hook useEffect
Usado para sincronizar seu componente com sistemas externos, como buscar dados de uma API, configurar assinaturas ou alterar o DOM manualmente.

- Array de Dependências: O segundo argumento do useEffect diz ao React quando rodar o efeito novamente. Se estiver vazio [], roda apenas na montagem (primeira renderização).

``` JavaScript
import { useState, useEffect } from 'react';

function Relogio() {
  useEffect(() => {
    // Código que roda ao montar o componente
    const timer = setInterval(() => console.log('Tic Tac'), 1000);
    
    // Função de limpeza (roda ao desmontar o componente)
    return () => clearInterval(timer);
  }, []); // Array vazio = roda só uma vez
}
```
## 6. Renderização Condicional e Listas
Como o React usa JavaScript puro, as lógicas de interface são feitas com operadores JS padrão.

- Condicional: Usamos o operador ternário ? : ou o operador lógico &&.

- Listas: Usamos a função .map() do JavaScript para transformar arrays de dados em arrays de elementos JSX. Toda lista precisa de uma prop key única.

```JavaScript
function ListaTarefas({ tarefas, carregando }) {
  if (carregando) return <p>Carregando...</p>;

  return (
   <ul>
      {tarefas.map(tarefa => (
        <li key={tarefa.id}>{tarefa.texto}</li>
      ))}
    </ul>
  );
}
```
## 7. Context API (Estado Global)
Quando você precisa passar dados para componentes muito profundos na árvore (evitando o "Prop Drilling", que é passar props de pai pra filho infinitamente), o React oferece o Context para compartilhar estado globalmente na aplicação.