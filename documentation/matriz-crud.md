# Matriz CRUD - BolsoDireito

## Matriz CRUD (versão 1) - Permissoes (Papeis x Entidades)

| Papel de usuario | CarteiraInvestimentos | DadosFinanceiros | MetaFinanceira | Transacao | Banco | PerfilUsuario |
| --- | --- | --- | --- | --- | --- | --- |
| Usuario (plano gratuito) | - | Create, Read, Update, Delete | - | Create, Read, Update, Delete | Read | Create, Read, Update, Delete |
| Usuario (plano pago) | Create, Read, Update, Delete | Create, Read, Update, Delete | Create, Read, Update, Delete | Create, Read, Update, Delete | Read | Create, Read, Update, Delete |
| Administrador do Sistema | Create, Read, Update, Delete | Create, Read, Update, Delete | Create, Read, Update, Delete | Create, Read, Update, Delete | Create, Read, Update, Delete | Create, Read, Update, Delete |

## Representacao em Mermaid - Matriz CRUD (versão 1)

```mermaid
flowchart LR
  %% Papeis
  subgraph PAP["Papeis"]
    UGF["Usuario (plano gratuito)"]
    UPG["Usuario (plano pago)"]
    A["Administrador do Sistema"]
  end

  %% Entidades
  subgraph ENT["Entidades"]
    CI["CarteiraInvestimentos"]
    DF["DadosFinanceiros"]
    MF["MetaFinanceira"]
    TR["Transacao"]
    BC["Banco"]
    PU["PerfilUsuario"]
  end

  %% Permissoes - Usuario (plano gratuito)

  UGF -->|C,R,U,D| DF
  UGF -->|C,R,U,D| TR
  UGF -->|R| BC
  UGF -->|C,R,U,D| PU

  %% Permissoes - Usuario (plano pago)
  UPG -->|C,R,U,D| CI
  UPG -->|C,R,U,D| DF
  UPG -->|C,R,U,D| MF
  UPG -->|C,R,U,D| TR
  UPG -->|R| BC
  UPG -->|C,R,U,D| PU

  %% Permissoes - Administrador do Sistema
  A -->|C,R,U,D| CI
  A -->|C,R,U,D| DF
  A -->|C,R,U,D| MF
  A -->|C,R,U,D| TR
  A -->|C,R,U,D| BC
  A -->|C,R,U,D| PU

  %% Estilo visual
  classDef usuarioGratuito fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#111;
  classDef usuarioPago fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#111;
  classDef admin fill:#fee2e2,stroke:#b91c1c,stroke-width:2px,color:#111;
  classDef entidade fill:#f8fafc,stroke:#475569,stroke-width:1.5px,color:#111;

  class UGF usuarioGratuito;
  class UPG usuarioPago;
  class A admin;
  class CI,DF,MF,TR,BC,PU entidade;

  %% Link colors
  linkStyle 0,1,2,3 stroke:#0284c7,stroke-width:2px;
  linkStyle 4,5,6,7,8,9 stroke:#1d4ed8,stroke-width:2px;
  linkStyle 10,11,12,13,14,15 stroke:#dc2626,stroke-width:3px;
```

## Legenda

- C: Create (Criar)
- R: Read (Ler)
- U: Update (Atualizar)
- D: Delete (Excluir)
- Azul claro: permissoes do Usuario (plano gratuito)
- Azul escuro: permissoes do Usuario (plano pago)
- Vermelho: permissoes do Administrador do Sistema

## Matriz CRUD (versão 2) - Entidades vs Funcionalidades

| Entidades / Funcionalidades | Manter cadastro de Perfil de Usuario | Gerenciar Perfis de Usuario | Registrar gasto | Categorizar gasto | Filtrar gastos | Emitir relatorio de gastos | Manter Carteira de Investimentos | Manter Metas Financeiras | Manter Transacoes | Consultar dados Bancarios | Emitir dashboard de gastos | Gerenciar Carteira de Investimentos dos Usuarios | Gerenciar Dados Financeiros dos Usuarios | Gerenciar Metas Financeiras dos Usuarios | Gerenciar Transacoes dos Usuarios | Manter Bancos |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CarteiraInvestimentos | - | - | - | - | - | - | Create, Read, Update, Delete | - | - | - | - | - | - | - | - | - |
| DadosFinanceiros | - | - | - | - | - | - | - | - | - | - | - | Read, Delete | Read | Read, Delete | Read | - |
| MetaFinanceira | - | - | - | - | - | - | - | Create | - | - | - | Create, Read, Update, Delete | - | - | - | - |
| Transacao | - | Read | Create | Update | Read | Read | - | - | Create, Read, Update, Delete | - | Read, Create | Create, Read, Update, Delete | - | - | Create, Read, Update, Delete | - |
| Banco | - | - | - | - | - | - | - | - | - | Read | - | - | - | - | - | Create, Read, Update, Delete |
| PerfilUsuario | Create, Read, Update, Delete | Read, Delete | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
