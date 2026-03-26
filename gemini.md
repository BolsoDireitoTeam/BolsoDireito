# 📱 BOLSO DIREITO - MASTER BLUEPRINT & ARCHITECTURE GUIDE
**Documento de Orientação Restrita para o Agente de IA (Antigravity)**
a
## 🎯 0. DIRETRIZES GERAIS PARA A IA
Você está assumindo o desenvolvimento do **Bolso Direito**, um Web App *Mobile-First* focado no controle financeiro pessoal simplificado e unificado. 
* **MOBILE-FIRST & TOUCH:** A interface será acessada primariamente via celular. O design deve priorizar alvos de toque (touch), layouts fluidos baseados em porcentagens (flexbox/grid) e componentes adaptativos.
* **LOCAL DATA:** O sistema é *Single-Player* e *Serverless*. Não há banco de dados em nuvem. Todo o armazenamento deve ser feito localmente no dispositivo do usuário utilizando JSON via `localStorage` ou `IndexedDB`.
* **SEPARAÇÃO DE FASES:** O desenvolvimento é estritamente dividido. Você **NÃO DEVE** iniciar a lógica de dados (JS/Back-end local) até que TODAS as telas (Front-end) estejam construídas, padronizadas e aprovadas pelo usuário.

---

## 🎨 1. PADRONIZAÇÃO DE FRONT-END (HTML/CSS)

Os arquivos HTML base já existem, mas possuem CSS embutido. Sua primeira grande missão é refatorar a camada visual:

1. **Extração e Mapeamento:** Leia os arquivos HTML fornecidos, entenda a identidade visual (cores, espaçamentos, tipografia) existente nos estilos *inline/embedded*.
2. **Migração para Bootstrap:** Transfira essa identidade para o framework **Bootstrap** (versão mais recente). Utilize as classes utilitárias do Bootstrap para recriar os layouts com perfeição, reduzindo drasticamente a necessidade de CSS customizado.
3. **CSS Global:** O que não puder ser resolvido com as classes nativas do Bootstrap deve ser consolidado em um (ou muito poucos) arquivos `.css` externos de forma organizada e limpa.
4. **Organização de Telas:** Garanta que a navegação entre as telas estáticas funcione perfeitamente antes de avançar.

---

## 🏗️ 2. MODELAGEM DE DADOS E "BACK-END" LOCAL

A persistência de dados será feita via JavaScript no lado do cliente. A modelagem deve ser simples, sem excesso de normalização.

### 2.1 Entidades Principais
* **`Saldo` (Inteiro/Float):** Representa o "dinheiro no bolso" ou conta principal no momento atual.
* **`Extrato` (Array):** O histórico cronológico das movimentações (Ganhos e Gastos).
* **`Ganho` (Objeto):**
  * Campos: `id`, `nome`, `data`, `valor`.
  * Comportamento: Aumenta o `Saldo`.
* **`Gasto` (Objeto):**
  * Campos: `id`, `nome`, `data`, `valor`, `categoria`, `tipo` (Débito ou Crédito), `parcelas` (1 a 36).
  * Comportamento: Diminui o `Saldo`.

### 2.2 Tipos de Gastos
* **Débito:** Reduz o `Saldo` instantaneamente no momento do registro. Vai direto para o `Extrato`.
* **Crédito:** O valor é parcelado (máximo de 36 vezes, ou seja, 3 anos). As parcelas futuras são acumuladas na **Fatura** do mês correspondente e não afetam o `Saldo` atual imediatamente. 

---

## ⚙️ 3. REGRAS DE NEGÓCIO E MOTOR FINANCEIRO

### 3.1 A Função `virar_mes() : void`
Este é o coração das regras de negócio do aplicativo. É uma função que consolida o fluxo de caixa mensal.
* **Gatilhos:** Pode ser ativada manualmente pelo usuário no dia 1º, ou automaticamente em um dia configurado (ex: dia 15).
* **Ações da Função:**
  1. Adiciona ao `Saldo` os valores definidos em **Ganhos Mensais** (salário, rendas recorrentes).
  2. Subtrai do `Saldo` os valores definidos em **Gastos Mensais** (aluguel, seguros, assinaturas).
  3. Pega todos os gastos acumulados na **Fatura** daquele mês específico (compras no crédito), transforma-os em um único bloco de `Gasto` e desconta do `Saldo`.

### 3.2 Metas, Limites e Alertas
O sistema deve ler proativamente os dados futuros para orientar o usuário:
* **Alerta de Risco:** O sistema deve calcular se a `Fatura` futura de um mês vindouro irá superar a soma do `Saldo Atual + Ganhos Mensais`. Se sim, exibir um aviso vermelho de limite excedido.
* **Alerta de Atenção:** Avisar visualmente quando o valor da fatura futura estiver se aproximando do limite estipulado ou da capacidade de pagamento.

---

## 🚀 4. ROADMAP DE EXECUÇÃO (ORDEM ESTRITA)

Siga este passo a passo cronológico, validando com o usuário ao final de cada fase:

* **Fase 1: Fundação Front-End (Design & UI)**
  * *Objetivo:* Extrair o CSS embutido dos HTMLs fornecidos.
  * *Ação:* Reescrever as telas aplicando o **Bootstrap** para recriar a identidade visual. Organizar as folhas de estilo externas remanescentes.
  * *Teste:* Avaliar a responsividade (*mobile-first*), alvos de toque e navegação fluida entre todas as telas do app.
* **Fase 2: Arquitetura de Dados Local (JavaScript)**
  * *Objetivo:* Estruturar a base do "Back-End" no navegador.
  * *Ação:* Criar os gerenciadores de estado em Vanilla JS (`Ganho`, `Gasto`, `Extrato`) e implementar as rotinas de salvar/carregar dados via `localStorage` ou estrutura JSON.
  * *Teste:* Criar, ler, atualizar e deletar entradas no console e verificar se persistem ao recarregar a página.
* **Fase 3: Motor Financeiro (Regras de Negócio)**
  * *Objetivo:* Dar vida à lógica de consolidação.
  * *Ação:* Desenvolver o particionamento matemático para compras no Crédito (cálculo de parcelas em meses futuros) e construir a função complexa `virar_mes()`.
  * *Teste:* Simular uma virada de mês para verificar se os Ganhos/Gastos Mensais e a Fatura foram aplicados corretamente ao `Saldo` sem duplicidades.
* **Fase 4: Integração, Dashboards e Alertas**
  * *Objetivo:* Acoplar os dados calculados à interface gráfica.
  * *Ação:* Injetar dinamicamente o Saldo e os itens do Extrato no HTML. Implementar as lógicas de verificação de limites para renderizar os *Alertas de Risco/Atenção*.
  * *Teste:* Adicionar uma despesa alta parcelada e verificar se a UI exibe corretamente o aviso de que a fatura futura compromete a renda.