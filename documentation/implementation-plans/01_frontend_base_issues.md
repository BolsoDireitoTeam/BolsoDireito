# Plano de Implementação: Frontend Base (GitHub Flow)

**Data do Plano:** 4 de Abril de 2026
**Objetivo Central:** Construir as interfaces em **HTML puro e CSS Vanilla** exigidas nos "Casos de Uso", segmentadas em pequenos pacotes de entrega (Issues).

> [!IMPORTANT]
> **Diretriz de Design (Mobile-First):** Esta aplicação é **mobile-first**. É estritamente mandatório que todas as entregas foquem no desenvolvimento integrado e responsivo tanto para **Desktop** quanto para **Dispositivos Mobile**. Interfaces que não se adaptarem a telas menores serão consideradas incompletas.

> [!IMPORTANT]
> **Fluxo de Trabalho de Code Review:** Para que você acompanhe exatamente o que está sendo construído e não perca o controle do repositório, **executaremos UMA ISSUE POR VEZ**. Eu escrevo o código de uma Issue e PARO. Aguardarei você revisar o arquivo, entender a lógica, e me dar a permissão expressa ("Tudo certo, vá para a Issue #X") para só então eu codificar a etapa seguinte.

> [!IMPORTANT]
> **Integração Mandatória do Excalidraw:** No início da execução de cada nova Tarefa, o assistente deverá obrigatoriamente fazer a leitura do arquivo `documentation/esboco-telas/BrainstormPrincipal.excalidraw` utilizando de suas ferramentas de extração antes de gerar para mimetizar os elementos visuais desenhados pela equipe nas novas view components.

---

## Issue #1: Refinamento da Navegação Principal (Hub)
**Descrição:** Para não termos páginas "soltas" e difíceis de testar, a primeira criação técnica será plugar os novos links de Navegação.
* **Arquivos Afetados:** `[MODIFY] frontend/pages/profile/usuario.html`
* **Tarefas da Issue:** Inserir 4 botões na interface do usuário (Acesso a Administrador, Extrato, Metas e Investimentos).

---

## Issue #2: Módulo Complementar - Extrato Completo
**Descrição:** O usuário precisa visualizar uma Timeline do seu dinheiro, portanto faremos a tela principal do Extrato.
* **Arquivos Afetados:** `[NEW] frontend/pages/transacoes/extrato.html`
* **Tarefas da Issue:** Criar HTML da lista de movimentações (Renda/Gasto) baseada num mock visual e Chips de filtragem temporal simulados.

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

## Verification Plan
1. O assistente reportará a "Conclusão da Issue #N".
2. O usuário abrirá o arquivo alterado gerado pelo fluxo em seu editor / Local Server.
3. Se houver falhas no padrão CSS ou na usabilidade, o usuário reportará nesta issue. Se estiver bom, aprovará o envio para a próxima Issue sequencial.
