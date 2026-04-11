---
description: Como formatar e executar git commits no projeto BolsoDireito (Conventional Commits + Bullet Points)
---

Neste workflow, estão definidas as regras arquiteturais para registros no repositório. Sempre que for realizar um commit e não houver um formato distinto solicitado pelo usuário, **siga imediatamente** os passos abaixo.

### 1. Padrão da Mensagem de Commit
Todo commit gerado para este projeto deve aderir ao seguinte formato:
- **Título**: Deve seguir o sistema de "Conventional Commits": `tipo(escopo): descrição breve e direta do comando` (ex: `feat(database): adiciona motor gráfico de edição`).
     - *Tipos válidos:* `feat`, `fix`, `chore`, `docs`, `refactor`, `style`.
     - Não usar letra maiúscula no início do descritivo do título.
- **Corpo**: Sempre deve haver um corpo descritivo com o resumo da solução gerada listado **imperativamente** utilizando ponteiros em listas (bullet points) no formato `* texto detalhado`. Evite parágrafos textuais e maçantes longos.
- **Idioma**: Português do Brasil (pt-BR).

**Exemplo da visualização desejada:**
`feat(transacoes): integração do modal HTML e banco de dados`
`* Adicionado botão de edição (lápis svg) dentro da engine de iteração do Javascript.`
`* Estabelecidos alertas visuais e limites para edição de valores provenientes de transações do subtipo Crédito.`
`* Função BolsoDB.editar() instanciada para tratamento e recálculo da diferença baseada no estado anterior.`

### 2. Ação de Registro (Automação Terminal)
Tendo formulado as sentenças do título e do corpo, você procederá com a rotina de terminal, anexando os arquivos via `git add` da forma mais apropriada ao contexto. 

Para estruturar o corpo no Terminal Bash mantendo as quebras de linhas intactas sem gerar bugs literais de aspas no console, você deve arquitetar os comandos repetindo a flag `-m` da seguinte maneira arquitetônica:
`git add ... && git commit -m "tipo(escopo): titulo principal" -m "* passo 1 que foi feito" -m "* passo 2 que foi feito no front"`

### 3. Execução
Siga com a adição das mudanças detectáveis à staging area e execute o registro (commit) utilizando a engine e a formatação aprendida logo acima mediante a solicitação do usuário, acelerando dessa forma o workflow do desenvolvedor quando for de interesse dele a geração dos commits. Caso também haja contexto explícito de fechamento de "issues" pelo Github, anexe o comando `gh issue close X`. Mesmo que não tenha a evidência do fechamento da issue, sempre tente correlacionar o commit que está sendo registrado com a issue que estivermos trabalhando dentro do determinado contexto.