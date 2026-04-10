# Lista de Tarefas: Operação Editar Transação

Progresso da implementação da Issue #17. A execução será fracionada passo a passo conforme alinhado.

- `[x]` Passo 1: **Lógica de Dados (`database.js`)**
    - Criar a função core `editarTransacao(id, { nome, valor, categoria })`.
    - Garantir o ajuste por *delta* sem afetar o timestamp original.
    - Exportar a função no Objeto Global da API.
- `[x]` Passo 2: **Estrutura de UI (`lista-transacoes.html`)**
    - Adicionar o Container do `<div class="modal fade" id="modalEditar">`.
    - Montar os campos (Input para Nome, Input para Valor, Select para Categoria).
- `[ ]` Passo 3: **Injeção de Gatilho (`transacoes.js`)**
    - Adicionar o respectivo Botão de Editar (ícone de lápis) lado a lado ao Botão de Excluir dinamicamente.
- `[ ]` Passo 4: **Lógica de Interface (`transacoes.js`)**
    - Criar `window.abrirModalEdicao(id)` (puxando a transação da DB e setando o estado local).
    - Criar `window.salvarEdicao()` (disparando a alteração delta e forçando Re-Render).
