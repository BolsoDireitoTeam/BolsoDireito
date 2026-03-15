# BolsoDireito
Bolso Direito é uma plataforma que visa ajudar as pessoas a controlar os gastos pessoais 

O projeto nasceu da necessidade de ter uma **ferramenta simples e objetiva para controlar os gastos pessoais**

## Excalidraw
https://link.excalidraw.com/l/AaVqH1mqaR6/245qM1E3E5x


```
BolsoDireito/
├── frontend/    (Seu app em React + Bootstrap/Tailwind)
    ├── public/                 # Imagens estáticas, ícones (favicon), index.html base
    ├── src/
    │   ├── static/             # SVGs, imagens, logos do projeto
    │   ├── components/         # Pedaços de UI reutilizáveis
    │   │   ├── common/         # Botões genéricos, inputs, modais
    │   │   └── layout/         # O seu footer.html, navbar, etc.
    │   ├── pages/              # As telas completas do seu diagrama
    │   │   ├── Login/          # Representa o login.html
    │   │   ├── Dashboard/      # Representa view-mensal.html / overview
    │   │   ├── Profile/        # Representa editar-info-pessoal e financeiro
    │   │   └── Expenses/       # Telas de adicionar categorias e gastos
    │   ├── services/           # Funções que fazem o "fetch" (chamadas) para o seu Back-end
    │   │   └── api.js          # Configuração de conexão com o Node.js
    │   ├── styles/             # Seus arquivos CSS globais (se não usar apenas Bootstrap)
    │   ├── utils/              # Funções auxiliares (ex: formatarMoeda, formatarData)
    │   ├── App.jsx             # Componente raiz que gerencia as rotas
    │   └── main.jsx            # Ponto de entrada do React
    ├── package.json            # Dependências do projeto Front-end
    └── vite.config.js          # Configuração do build (recomendo usar Vite para criar o projeto React)
└── backend/     (Sua API em Node.js)
    ├── src/
    │   ├── config/             # Configuração do Banco de Dados (ex: conexão com MongoDB ou PostgreSQL)
    │   ├── controllers/        # A lógica de negócio (ex: o cálculo de GANHO_FINAL_MES)
    │   │   ├── GastoController.js
    │   │   ├── FaturaController.js
    │   │   └── UsuarioController.js
    │   ├── models/             # Representação do seu Diagrama de Classes
    │   │   ├── Gasto.js        # Esquema de dados do Gasto (id, valor, data, categoria)
    │   │   ├── Fatura.js       
    │   │   └── Usuario.js      
    │   ├── routes/             # Endpoints da sua API (ex: POST /gastos, GET /fatura)
    │   │   ├── gastoRoutes.js
    │   │   └── usuarioRoutes.js
    │   └── server.js           # Arquivo principal que sobe o servidor
    ├── .env                    # Variáveis de ambiente secretas (senhas, portas)
    └── package.json            # Dependências do Back-end (Express, Mongoose/Prisma)
```
