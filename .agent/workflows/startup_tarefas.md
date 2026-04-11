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
