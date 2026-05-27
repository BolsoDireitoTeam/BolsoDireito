---
description: Diretriz de padronização estrutural e comportamental para a criação de rastreadores remotos (Issues e Pull Requests) na base arquitetural.
---
# Gestão de Issues e Pull Requests - Github

Para assegurarmos consistência na rastreabilidade das funcionalidades e entregas do BolsoDireito, todo manuseio no ambiente do Github deve acatar os seguintes padrões sem desvios:

## 1. Padrão para Pull Requests (PRs)
O PR é a fronteira final da entrega. Ele deve encantar revisores e possuir um rastro claro da engenharia executada na branch de desenvolvimento visando a `main`.

- **Título do PR:** Precisa ser classificado com emojis semânticos para identificação visual imediata:
    - 🚀 `Release:` para entregas massivas fechando ciclos (ex: `🚀 Release: Componentização do Dashboard`)
    - 🛠️ `Fix:`/`Hotfix:` para pacotes de correção urgentes.
    - ♻️ `Refactor:` para reestruturações internas profundas sem impacto visual.
- **Corpo Oficial do PR:**
    1. **Estado da Arte:** 1 ou 2 parágrafos simples e humanos descrevendo qual era a dor no sistema e o que a ramificação atual traz para resolver essa dor.
    2. **O que está incluso nesta entrega (Bullets):** Listagem em blocos curtos (com bullet points e textos em negrito) dividindo os impactos técnicos da entrega por área (ex: `* **Data Base:** ...` / `* **Core UI:**...`).
    3. **Fechamentos:** Deve finalizar referenciando o ID das issues relacionadas para fechá-las automaticamente. (ex: `Resolução das pendências mapeadas pela #17`).

## 2. Padrão para Criação de Issues
A Issue mapeia a promessa de construção. Issues não são diários de bordo informais e, portanto, demandam uma estrutura madura:

- **Título da Issue:** Assinatura precisa e livre de ambiguidade que defina o Foco e o Verbo de ação (ex: `Refatoração Inicial do Fluxo de Transações para ES Modules`).
- **Corpo Oficial da Issue:**
    1. **Motivação:** Por que esta issue existe? Qual ganho a aplicação terá com ela? 
    2. **Escopo (Critérios de Aceite):** Uma checklist do Github `- [ ]` enumerando quais peças de código ou comportamento devem ser confirmados para que a Issue possa ser considerada 100% pronta.
    3. **Documentação / Contexto Inerente (Opcional):** Anexos de diagramas, citações de `implementation-plans` criados anteriormente ou advertências de segurança que o desenvolvedor precisará consultar.

## 3. Padrão de Ramificação (Git Flow e Issues)
Sempre que uma nova fase de implementação e issue for ativada, a política interna de branches do projeto exigirá um isolamento de contextos estruturado:

1. **Branches de Feature (Issues):** Todo novo código de Escopo deve obrigatoriamente viver dentro de ramificações pontuais nascidas a partir da `develop` e contendo o nome descritivo atrelado à issue (exemplo de sintaxe: `feat/issue25` ou `feat/dashboard-issue8`).
2. **Branches de Correções (Fixes Internos):** Surgiram percalços, bugs ou inconsistências isoladas durante a execução da *Issue* no código local? Não polua o histórico com remendos lineares! Crie derivações do tipo `fix/` a partir da sua feature em andamento (ex: `fix/arruma-query` nascendo de `feat/issue25`). Elas voltarão para sua branch "mãe" via mesclagem assim que curadas.
3. **Resguardo de Produção:**
    - Tudo é implementado inicialmente à margem.
    - Finalizada a issue, as ramificações temporárias efetuam Merge de volta para a homologação em `develop`.
    - Desta forma, a branch `main` atinge a inviolabilidade passiva, servindo meramente como prateleira espelhada para quando as versões estruturais massivas já validadas (`Releases`) subirem da `develop` englobando as conquistas de um ciclo inteiro.
