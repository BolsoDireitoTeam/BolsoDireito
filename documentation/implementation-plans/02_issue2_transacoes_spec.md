# Especificação da Issue #2: Módulo "Entidade Transação"

**Motivação:** Como combinado, desviaremos a visão única de "Extrato" de um mero histórico em linha do tempo para o núcleo de navegação oficial da **Entidade: Transação**.

## Escopo a ser Construído (Mobile-First)

Criaremos o arquivo principal `frontend/pages/transacoes/lista-transacoes.html` contendo os seguintes requisitos funcionais e estruturais:

### 1. Cabeçalho e Totalizadores (Header)
- Uma barra superior padrão do BolsoDireito (título "Minhas Transações").
- Um Cartão Principal em destaque consolidando a visão temporal e exibindo:
   - **Balanço Mensal** (Receitas vs Despesas do período filtrado).
   - Um botão de filtro visual para alternar os temporizadores (Ex: "Abril 2026").

### 2. Corpo Central (Listagem da Entidade CRUD)
> [!IMPORTANT]
> **Padrão UX Global: "Footer Action Exclusive"**
> Todas as operações de *Adição* (Novo Gasto, Nova Meta, Novo Investimento) estão estritamente banidas de residirem como botões soltos nos Cabeçalhos ou Corpos das páginas isoladas. 
> **Toda criação originar-se-á exclusivamente do Botão "+" central do Footer (Bottom-Nav Action Sheet)**.  
> As páginas contextuais (como a listagem de Transações, Metas, etc) servirão unicamente para visibilidade analítica e comportarão unicamente as funções granulares do CRUD (como `Editar`, `Consultar` e `Deletar` o item específico). Essa regra garantirá consistência arquitetônica para todos os módulos sucessivos.

> [!TIP]
> **Processo Adicional: Injeção de Componentes (DRY Architecture)**
> Para garantir a manutenibilidade do supracitado *Footer Action Exclusive*, todo o código raw de `<nav class="bottom-nav">` e `<div class="action-sheet">` não deverá ser iterado e copiado (`Ctrl+C / Ctrl+V`) fisicamente ao final de cada novo arquivo HTML.
> **Diretriz de Componentização:** O projeto centralizará o layout mestre no repositório `frontend/components/footer.html` (e suas evoluções). Um script utilitário em Javascript (ex: `layout.js` local ou embutido nativamente no `app.js`) será responsável exclusivo por fazer o *fetch* (ou injeção DOM via strings temporárias para evitar CORS localsearch) deste arquivo de layout genérico, injetando todo o Bottom Nav de maneira flutuante e independente, bastando apenas declarar sua tag importadora na página que deseja utilizar do respectivo componente.

- **Cards de Transações Individuais e Ações da Entidade:** O design garantirá flexibilidade para os requisitos do CRUD. Ao clicar/tocar num item, ele exibirá um menu limpo contendo opções mínimas de ação (como Ver Detalhes, Editar ou Excluir a transação).

### 3. Integração Base (App-Shell)
- O menu de navegação inferior global do aplicativo (`<nav class="bottom-nav">`) deverá se manter acessível no rodapé, permitindo roteamento entre as view engines preexistentes.

---

> [!NOTE]
> **Aproximação com o Mockup Central (Excalidraw Workflow):**
> Os dados a serem listados mimetizarão os grupos visuais estabelecidos anteriormente pela equipe (como `data : String` e totalizadores `total : Number` listados como arrays do tipo debito/credito identificados no brainstorming).

---

## Revisão Histórica Pós-MVP: Integração e Reatividade (Fase Dinâmica)
Após a versão estática inicial, definiram-se os seguintes complementos essenciais de arquitetura:
1. **Diferenciação Funcional.** A tela de \`overview\` terá papel resumido. Operações de CRUD só existem de fato em \`lista-transacoes.html\`.
2. **Reatividade Core:** O código Javascript englobado em \`database.js\` e \`ui.js\` deve controlar o \`lista-transacoes.html\`, substituindo mocks fixos por dados iterados via DB.
3. **Fluidez de Casos de Uso:** Funcionalidades vitais do fluxo (\`Registrar Gasto\`, \`Excluir Gasto\` e \`Filtragem Temporal\`) deverão refletir reações de estado instantâneas na própria árvore de interface.
4. **Acoplamento Multi-Viewer:** O saldo renderizado pela classe de \`profile.js\` precisará ser modificado para referenciar nativamente o real total unificado exposto pela aplicação de transações.
