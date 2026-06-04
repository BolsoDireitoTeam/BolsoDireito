# Componentização Avançada do Footer via HTTP Fetch (Issue #20)

Esta issue tem como objetivo separar o layout HTML do rodapé (atualmente embutido como string no arquivo `app.js`) para um arquivo físico independente (`frontend/components/footer.html`). O JavaScript será atualizado para buscar esse arquivo dinamicamente via `fetch` de forma assíncrona, processá-lo com `DOMParser` para adicionar as classes de estado e então injetar o resultado final no DOM. Adicionalmente, toda a manipulação DOM será comentada adequadamente para facilitar a manutenção futura.

## Observações Arquiteturais

> [!NOTE]
> **Automação da Virada de Mês (Issue #21)**: Como previsto pela issue #21, o gatilho de Virar Mês passará a ser uma rotina automática. Dessa forma, nós **ignoraremos** a injeção do botão manual de "Virar Mês" que antes existia na grid do Action Sheet da página Overview. Todo o desenvolvimento envolvendo a virada do mês ficará restrito à Issue #21.
>
> **Lógica Assíncrona (Async)**: O carregamento de páginas passará a ter seu callback transformado em `async` devido à dependência do `fetch` do arquivo em disco (ou rede). O DOM principal aguardará esse parse e montagem do footer de forma nativa e limpa.
> 
> **Caminhos Relativos (Fetch)**: A requisição HTTP (`fetch`) será feita para a rota `../components/footer.html`. Isso assume que todas as páginas estão a um nível de profundidade da pasta `frontend`.
> 
> **Servidor Local**: Como estamos introduzindo `fetch` para arquivos locais, será **obrigatório** utilizar um servidor web local para evitar erros de CORS.

## Proposed Changes

### Componente de Layout

#### [MODIFY] [footer.html](file:///home/matheus-ku/Repositories/BolsoDireito/frontend/components/footer.html)
- **Sobrescrever** o conteúdo com a versão HTML exata e atualizada da variável `htmlString` (atualmente presente no final de `app.js`).
- Remover qualquer interpolação JavaScript (como `${activePage === 'overview' ? ...}`).
- Omitir o bloco HTML referente ao botão "Virar Mês", garantindo um menu mais limpo e já preparado para a transição para a Issue #21.

---

### Lógica Principal

#### [MODIFY] [app.js](file:///home/matheus-ku/Repositories/BolsoDireito/frontend/static/js/app.js)
- Adicionar comentários descritivos em toda a função para ajudar em futuras manutenções.
- Transformar o listener raiz `document.addEventListener('DOMContentLoaded', ...)` em uma função `async`.
- **Refatorar `_injectFooter()`**:
  - Modificar a assinatura da função para ser `async`.
  - Disparar o fetch do layout base: `const response = await fetch('../components/footer.html');` e converter via `.text()`.
  - Utilizar a API nativa `DOMParser` para simular uma árvore DOM no background antes da injeção: `const doc = new DOMParser().parseFromString(htmlStr, 'text/html');`
  - Ler o atributo `active-page` de dentro da tag local `<bd-footer>`.
  - Adicionar a classe `.active` no Node Botão exato (ex: `#nav-painel`, `#nav-perfil`) baseado no `active-page` que foi resgatado da tela.
  - Converter a árvore virtual de volta para HTML puro e atribuir definitivamente no DOM real (`bdFooterTag.innerHTML`).
  - Ligar novamente todos os `eventListeners` atuais que a interface exige, omitindo logicamente o evento de "Virar Mês".

## Verification Plan

### Manual Verification
1. Iniciar um servidor web (Live Server) na raiz.
2. Acessar a página `dashboard/overview.html`.
3. Validar se o rodapé apareceu corretamente, e se o botão "Painel" na navegação inferior está com a cor destacada (ativo).
4. Abrir o Action Sheet central e verificar se a lista de itens aparece normalmente **sem** o botão antigo "Virar Mês".
5. Navegar para a página de Perfil e observar se a transição ocorre mantendo o botão "Perfil" corretamente ativo.
