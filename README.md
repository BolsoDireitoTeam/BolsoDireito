# BolsoDireito
Bolso Direito é uma plataforma que visa ajudar as pessoas a controlar os gastos pessoais 

O projeto nasceu da necessidade de ter uma **ferramenta simples e objetiva para controlar os gastos pessoais**

## Excalidraw
https://link.excalidraw.com/l/AaVqH1mqaR6/245qM1E3E5x

```
BolsoDireito/
├── frontend/
    ├── static/             
    │   ├── common/         # Imagens, logos do projeto    
    │   └── styles/         # Seus arquivos CSS globais (se não usar apenas Bootstrap)
    │       └── style.css
    ├── components/         # Pedaços de UI reutilizáveis, footer.html, navbar, botões genéricos, inputs
    │   ├── footer.html    
    │   └── teclado_numerico.html
    ├── pages/              # As telas completas
    │   ├── login/          # login, criar-conta html's
    │   │   ├── criar-conta.html
    │   │   └── login.html
    │   ├── dashboard/      # view-mensal, overview html's
    │   │   ├── view-anual.html
    │   │   ├── view-mensal.html
    │   │   └── overview.html
    │   ├── transacoes/      
    │   │   ├── escolher-categoria.html
    │   │   ├── escolher-tipo-gasto.html
    │   │   └── teclado-valores.html
    │   ├── profile/        # profile-config e aporte html's
    │   │   ├── profile-config.html
    │   │   └── aporte-config.html
    │   └── upload/         # categoria, gasto e csv's html's
    │       ├── extrato-upload.html
    │       ├── fatura-upload.html
    │       ├── gasto-upload.html
    │       └── categoria-upload.html          
    ├── services/           
    │   └── api.js          # Funções que dão "fetch" pro Back-end
    ├── utils/              # Funções auxiliares (ex:formatarMoeda)
    ├── App.jsx             # Componente raiz que gerencia as rotas
    ├── main.jsx            # Ponto de entrada do React
    └── package.json        # Dependências do projeto Front-end

└── backend/     # Node.js
    ├── src/
    │   ├── config/             # Configuração do Banco de Dados (ex: conexão com PostgreSQL ou usar JSON)
    │   ├── controllers/        # A lógica de negócio (ex: o cálculo de GANHO_FINAL_MES)
    │   │   ├── GastoController.js
    │   │   ├── FaturaController.js
    │   │   └── UsuarioController.js
    │   ├── models/             # Representação do seu Diagrama de Classes
    │   │   ├── Movimento.js    # id, valor, data, categoria, estabelecimento
    │   │   ├── Fatura.js       
    │   │   ├── Extrato.js       
    │   │   └── Usuario.js      # movimento mensal
    │   ├── routes/             # Endpoints da sua API (ex: POST /gastos, GET /fatura)
    │   │   ├── gastoRoutes.js
    │   │   └── usuarioRoutes.js
    │   └── server.js           # Arquivo principal que sobe o servidor
    ├── .env                    # Variáveis de ambiente secretas (senhas, portas)
    └── package.json            # Dependências do Back-end (Express, Mongoose/Prisma)
```
