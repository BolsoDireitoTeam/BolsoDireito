# Plano de Implementação: Frontend Base (GitHub Flow)

**Data do Plano:** 4 de Abril de 2026
**Objetivo Central:** Construir as interfaces em **HTML puro e CSS Vanilla** exigidas nos "Casos de Uso", segmentadas em pequenos pacotes de entrega (Issues).

> [!IMPORTANT]
> **Diretriz de Design (Mobile-First):** Esta aplicação é **mobile-first**. É estritamente mandatório que todas as entregas foquem no desenvolvimento integrado e responsivo tanto para **Desktop** quanto para **Dispositivos Mobile**. Interfaces que não se adaptarem a telas menores serão consideradas incompletas.

> [!IMPORTANT]
> **Fluxo de Trabalho de Code Review:** Para que você acompanhe exatamente o que está sendo construído e não perca o controle do repositório, **executaremos UMA ISSUE POR VEZ**. Eu escrevo o código de uma Issue e PARO. Aguardarei você revisar o arquivo, entender a lógica, e me dar a permissão expressa ("Tudo certo, vá para a Issue #X") para só então eu codificar a etapa seguinte.

> [!IMPORTANT]
> **Integração Mandatória do Excalidraw:** No início da execução de cada nova Tarefa, o assistente deverá obrigatoriamente fazer a leitura do arquivo `documentation/esboco-telas/BrainstormPrincipal.excalidraw` utilizando de suas ferramentas de extração antes de gerar para mimetizar os elementos visuais desenhados pela equipe nas novas view components.

> [!IMPORTANT]
> **Padrão UX Global: "Footer Action Exclusive"**
> Todas as operações de *Adição* (Novo Gasto, Nova Meta, Novo Investimento) estão estritamente banidas de residirem como botões soltos nos Cabeçalhos ou Corpos das páginas isoladas. 
> **Toda criação originar-se-á exclusivamente do Botão "+" central do Footer (Bottom-Nav Action Sheet)**.  
> As páginas contextuais (como a listagem de Transações, Metas, etc) servirão unicamente para visibilidade analítica e comportarão unicamente as funções granulares do CRUD (como `Editar` e `Deletar` o item específico). Essa regra garantirá consistência arquitetônica para todos os módulos sucessivos.

---

## Issue #1: Refinamento da Navegação Principal (Hub)
**Descrição:** Para não termos páginas "soltas" e difíceis de testar, a primeira criação técnica será plugar os novos links de Navegação.
* **Arquivos Afetados:** `[MODIFY] frontend/pages/profile/usuario.html`
* **Tarefas da Issue:** Inserir 4 botões na interface do usuário (Acesso a Administrador, Extrato, Metas e Investimentos).

---

## Issue #2: Módulo da Entidade "Transação"
**Descrição:** Construção da interface raiz para a entidade de **Transação** registrada na Matriz de Casos de Uso. Esta será a listagem oficial vinculada ao usuário para apresentar sua timeline de rendas e gastos.
* **Arquivos Afetados:** `[NEW] frontend/pages/transacoes/lista-transacoes.html` (antigo extrato).
* **Tarefas da Issue:** Criar HTML da lista de transações baseada num mock visual temporal e incorporar controles de filtragem/gestão da entidade.

---

## Issue #3: Módulo de Metas Financeiras
**Descrição:** Telas para a entidade de Metas, permitindo controle de objetivos.
* **Arquivos Afetados:** 
  * `[NEW] frontend/pages/metas/lista-metas.html`
  * `[NEW] frontend/pages/metas/form-meta.html`
* **Tarefas da Issue:** Criar dashboard com Progress Bars (Barras de progresso financeiro) para acompanhamento de economias e a tela com o formulário de Cadastro da Meta.

---

## Issue #4: Módulo de Carteira de Investimentos
**Descrição:** Telas dedicadas aos portfólios de investimento.
* **Arquivos Afetados:**
  * `[NEW] frontend/pages/investimentos/lista-investimentos.html`
  * `[NEW] frontend/pages/investimentos/form-investimento.html`
* **Tarefas da Issue:** Construir lista global do patrimônio de Renda Fixa/Variável e tela do formulário do Ativo.

---

## Issue #5: Módulo do Administrador do Sistema
**Descrição:** Módulo oculto e seguro de "God Mode" (Dark Mode) exclusivo do sistema admin.
* **Arquivos Afetados:**
  * `[NEW] frontend/pages/admin/dashboard-admin.html`
  * `[NEW] frontend/pages/admin/gerenciar-usuarios.html`
* **Tarefas da Issue:** Criar o painel analítico total da base de clientes e a listagem geral para permissões e bloqueios.

---

## Issue #6: Documentação das Classes CSS
**Descrição:** Mapeamento em comentários das abreviações de nome das classes CSS para que os desenvolvedores recém ingressantes possuam clareza e previsibilidade sobre o design system do BolsoDireito.
* **Arquivos Afetados:** `[MODIFY] frontend/static/styles/style.css` (e relativos).
* **Tarefas da Issue:** Vasculhar a folha de CSS inserindo ou criando markdown com os metadados descritivos sobre o padrão dos utilitários.

---

## Issue #7: Refatoração do Overview como Dashboard Analítico Global
**Descrição:** Adequar a tela de `overview.html` para cumprir seu papel puramente analítico, servindo como um resumo de métricas principais do perfil. Ela reunirá widgets sintéticos de Metas Principais, Transações Recentes e Visão de Investimentos, perdendo qualquer estado que permita aos usuários "alterar dados diretamente através da aba". O papel de modificação ficará a cargo exclusivo do rodapé e das abas contextualizadas (ex: lista-transacoes.html, lista-metas.html, etc). 
* **Arquivos Afetados:** `[MODIFY] frontend/pages/dashboard/overview.html` e script associado.
* **Tarefas da Issue:** 
  - Limpar formulários ou links mutadores diretos na view de Overview;
  - Consolidar leitura do ecossistema DB (`BolsoDB`) focando especificamente em dados estritamente em **Read-Only** integrando múltiplas entidades (Transações Top 5, 2 Metas ativas, Resumo de Investimentos).

---

## Issue #8: Migração Arquitetural para Módulos ECMAScript (ES Modules)
**Descrição:** Substituição sumária do padrão defasado de cascata global no HTML. Migraremos a base de inteligência do BolsoDireito Vanilla para o suporte moderno e nativo de Sandboxing e Exportações pontuais (ES Modules). O objetivo é prever colisões futuras no ecossistema através de arquitetura fechada e encapsulamento em importações exclusivas sob um nó pai de execução.
* **Arquivos Afetados:** Todo a pasta de Javascript local: `[MODIFY] frontend/static/js/*.js` e documentos Raízes HTML.
* **Tarefas da Issue:** 
  - Implementar o paradigma `export const` / `function` delimitando quem pode possuir acesso ao ecossistema do `BolsoDB` e aos Helpers de renderização;
  - Adaptar Scripts folha do modelo atual para buscarem suas dependências com a keyword `import { } from [...]`;
  - Limpar severamente a pilha de `<script>` engalfinhadas nos documentos HTMLs (`overview.html`, `lista-transacoes.html`, etc), limitando sua chamada nativa à estrutura de Root Module isolada `<script type="module" src="...">`.

---

## Issue #9: Componentização Avançada via HTTP Fetch (External HTML)
**Descrição:** Atualização da atual tática de componentização. Para fins de garantir que a estilização e tags HTML não poluam os documentos Javascript puros, os templates injetados de Header/Footer em `app.js` que se encontram em _string literals_ serão extraídos de volta para o arquivo físico base de `frontend/components/footer.html`. O sistema utilizará `fetch` nativamente para processar a requisição e parsear o HTML injetável, tratando dinamicamente suas classes "active" dos modais durante a manipulação da resposta.
* **Atenção Técnica:** Como essa leitura de disco em navegador disparará bloqueios automáticos de política **CORS**, seu desenvolvimento exigirá rodar o projeto num Web Server local padrão (ex: Extensão Live Server, `python -m http.server`, Express etc) e não mais nos dois cliques do arquivo "file:///".
* **Arquivos Afetados:** `[MODIFY] frontend/static/js/app.js` (Bloco do Layout Engine) e `[MODIFY] frontend/components/footer.html`.
* **Tarefas da Issue:** 
  - Retornar o layout central para o `footer.html`.
  - Transcrever a injeção via Strings para a chamada async paralelisadora (ex: `await fetch('components/footer.html')`).
  - **Dinamização do Acoplamento de Estados HTML (Highlight Tracking):** Como a string de Template Literal do Javascript `${}` será perdida ao realizar a leitura literal do arquivo disco por requisição, o HTML chegará inerentemente morto (estático). O executor responsável pelo Inject Element (`<bd-footer>`) deve gerar uma árvore virtual (como `parser.parseFromString`), escutar seu respectivo atributo de Aba Ativada e instanciar programaticamente a injeção de estilo classe `.active` no Node Botão referente ao contexto ANTES de renderizar brutalmente a string manipulada no DOM.

---

## Issue #10: Automatização da Virada de Mês e Consumo de Faturas de Crédito
**Descrição:** Substituir o gatilho manual da rotina `virar_mes()` por um motor automatizado assíncrono que valide a data de vencimento da fatura do cartão registrada no banco de dados, protegendo o sistema com lacres contra repetições mensais da cobrança (idempotência). Essa inovação fará com que o aplicativo consiga interagir autonomamente abatendo e consolidando as pendências de crédito no prazo correto.
* **Arquivos Afetados:** `[MODIFY] frontend/static/js/engine.js`, `[MODIFY] frontend/static/js/database.js` e interface de Configurações.
* **Tarefas da Issue:** 
  - Estruturar a nova lógica de `diaVencimentoCartao` global no `_state`.
  - Criar check de data automatizado durante os instantes de entrada do App.
  - Eliminar ou blindar o acionamento de repetições destrutivas manuais.

---

## Issue #11: Agendamento de Despesas/Receitas com Datas Customizadas (Sub-Issue #10)
**Descrição:** Em ramificação com a autonomia principal, prover arquitetura para que cada Gasto (ex: Aluguel) ou Ganho (ex: Salário) recorrente do usuário possua seu próprio "Dia" configurado, executando autonomamente em momentos separados do cartão.
* **Arquivos Afetados:** `[MODIFY] frontend/static/js/engine.js` e `[MODIFY] frontend/static/js/database.js`.
* **Tarefas da Issue:** 
  - Expandir objetos de Entidade base no DB para o campo de Date.
  - Configurar loop de verificação mestre que monitore todas as datas isoladas no lugar de rodá-las simultaneamente numa tacada só.

---

## Issue #12: Implementação do Modelo Freemium e Módulo de Assinaturas
**Descrição:** Estruturação visual e lógica que separa o acesso de usuários Gratuitos e Pagos. Sabendo que toda a base do sistema será construída paralelamente, nesta Issue implementaremos efetivamente as travas (paywalls) e identificadores visuais do plano escolhido sobrepondo as funcionalidades Premium (Metas, Carteira de Investimentos e Dashboards Avançados). Podemos, inclusive, pensar em formas de anúncio para o plano gratuito, os quais poderão ser exibidos durante a sua navegação no sistema.
* **Arquivos Afetados:** Componentes globais de inibição (Modais) e módulo de Configurações da Conta (`usuario.html`).
* **Tarefas da Issue:** 
  - Desenvolver elementos visuais de Upgrade e indicação do "Plano Atual" ativo na tela de Perfil;
  - Bloquear / exibir _overlays_ nas páginas exclusivas caso a sessão ativa detecte uma permissão gratuita.

---

## Verification Plan
1. O assistente reportará a "Conclusão da Issue #N".
2. O usuário abrirá o arquivo alterado gerado pelo fluxo em seu editor / Local Server.
3. Se houver falhas no padrão CSS ou na usabilidade, o usuário reportará nesta issue. Se estiver bom, aprovará o envio para a próxima Issue sequencial.

