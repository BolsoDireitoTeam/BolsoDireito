---
description: Diretrizes obrigatórias de consulta base para a Inteligência Artificial antes de construir e planejar qualquer código ou nova tarefa.
---
# Fluxo de Pesquisa: Iniciando Tarefas de Implementação

Sempre que o usuário ditar uma nova solicitação exigindo refatorações complexas, construções de tela ou modelagem de lógicas de negócio no projeto BolsoDireito, você (A.I) possui a **obrigação arquitetural** de buscar contexto antes de programar ou redigir o plano oficial de implementação.

## Pastas Base de Pesquisa (Fontes de Verdade)
Você deve utilizar suas ferramentas de terminal ou listagem de arquivos para garimpar as seguintes fontes de documentação que o usuário já populou. Não proponha nada que fira o modelo mental contido ali:

1. `documentation/brain-storming/`
   - Concentra as anotações primárias sobre regras de negócio, modelagem de "bolsos" e regras do domínio contábil da aplicação.
2. `documentation/prototipagem-inicial/`
   - Onde residem as instruções vitais de como o Design deve se comportar (conceitos visuais, hierarquia de páginas e ux).
3. `documentation/diagramas-e-matrizes-do-projeto/`
   - Responsável por definir os Atores do sistema e as Matrizes CRUD (ex: Freemium vs Premium, quais roles acessam o quê).
4. `documentation/implementation-plans/`
   - Contém o histórico e o detalhamento das "Issues" passadas (que pavimentam a estabilidade do sistema atual).

### Ação da Ferramenta
1. Compreenda ativamente o pedido do usuário.
2. Procure o conteúdo relacionado nas diretrizes e pastas acima.
3. Somente após esta checagem de viabilidade cruzada é que a arquitetura deve ser rascunhada (utilizando o *Planning Mode* e os artefatos `implementation_plan.md`) para ser apresentada ao desenvolvedor!

---

## Regras de Arquitetura Frontend (ES Modules)
A fim de manter a base Vanilla pronta para a futura transição para React, siga as seguintes regras arquiteturais imutáveis ao manipular ou criar novos scripts Javascript:
1. **ES Modules**: Todo novo arquivo de lógica (`.js`) DEVE pertencer ao ecossistema de módulos, utilizando diretivas `export` explícitas para a partilha de componentes. O escopo global `window` não deve ser poluído.
2. **Dependências Externas**: Bibliotecas UI (Bootstrap, ChartJS) ainda podem e devem ser populadas nos arquivos HTML via tag padrão de CDN no `<head>`. Os nossos Módulos ES6 serão capazes de ler `window.Chart` normalmente nos bastidores.
3. **Escopo dos HTMLs**: Não inclua pilhas de scripts nos HTMLs. Você deve injetar EXCLUSIVAMENTE o controlador raiz em formato modular (ex: `<script type="module" src="../../static/js/app.js"></script>`). O navegador cuidará das sub-dependências internamente no JS.
4. **Listeners Inline Proibidos**: É terminantemente proibido o uso de listeners inline nas tags (ex: `onclick`, `onchange`, `oninput`). Qualquer ativação e delegação de eventos DEVE ocorrer nativamente dentro dos arquivos `.js` via `document.getElementById('...').addEventListener()`.
5. **Scripts no `<head>`**: Todas as tags `<script>` (tanto módulos próprios quanto CDNs externas) DEVEM ser posicionadas dentro do `<head>` do documento HTML, **nunca** no final do `<body>`. Para scripts com `type="module"`, o comportamento `defer` já é implícito. Para CDNs externas (Bootstrap, ChartJS), utilizar o atributo `defer` explicitamente (ex: `<script defer src="https://cdn.jsdelivr.net/..."></script>`). Isso garante download paralelo durante o parsing do HTML, resultando em melhor performance de carregamento.
