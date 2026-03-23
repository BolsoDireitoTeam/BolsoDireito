# Matriz CRUD - BolsoDireito

Abaixo, a matriz CRUD representada em Mermaid no formato de grafo (modulos -> entidades).

```mermaid
---
id: 60946071-05c6-4ff9-acd9-e9b7f3b7696c
---
flowchart LR
  %% Modulos
  subgraph MOD[Modulos]
    M_LOGIN[Login e Cadastro]
    M_PROFILE[Perfil]
    M_TRANS[Transacoes]
    M_UPLOAD[Upload]
    M_DASH[Dashboard]
    M_CONFIG[Configuracoes]
  end

  %% Entidades
  subgraph ENT[Entidades]
    E_USER[Usuario]
    E_CAD[Dados Cadastrais]
    E_FIN[Dados Financeiros]
    E_CAT[Categoria]
    E_TRX[Transacao]
    E_APORTE[Aporte]
    E_EXT[Extrato]
    E_FAT[Fatura]
    E_DASH[Indicadores Dashboard]
  end

  %% Relacoes CRUD
  M_LOGIN -->|C,R| E_USER

  M_PROFILE -->|R,U| E_CAD
  M_PROFILE -->|R,U| E_FIN

  M_TRANS -->|C,R,U,D| E_TRX
  M_TRANS -->|R| E_CAT

  M_UPLOAD -->|C,R| E_EXT
  M_UPLOAD -->|C,R| E_FAT

  M_DASH -->|R| E_TRX
  M_DASH -->|R| E_APORTE
  M_DASH -->|R| E_DASH

  M_CONFIG -->|C,R,U,D| E_CAT
  M_CONFIG -->|C,R,U,D| E_APORTE
```

## Legenda

- C: Create (Criar)
- R: Read (Ler)
- U: Update (Atualizar)
- D: Delete (Excluir)

## Observacao

Se quiser, posso transformar esta versao em uma matriz tabular estrita (linhas x colunas) e separar por contexto, por exemplo:

- Matriz de paginas x entidades
- Matriz de APIs backend x entidades
- Matriz de componentes frontend x entidades
