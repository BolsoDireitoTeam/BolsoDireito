// ============================================================
//  Bolso Direito — database.js
//  Camada de Dados Local — Fase 2
//  Motor: Vanilla JS + localStorage
//  ⚠️  SEM integração com DOM nesta fase (nenhum getElementById).
//      Toda a lógica pode ser testada via Console do Navegador.
// ============================================================

'use strict';

// ─────────────────────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────────────────────

/** Chave usada para salvar o estado no localStorage. */
const STORAGE_KEY = 'bolsoDireito_v1';

/**
 * Categorias válidas para um Gasto.
 * Mantidas aqui para facilitar validação e exibição em formulários futuros.
 */
const CATEGORIAS = Object.freeze([
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Lazer',
    'Educação',
    'Vestuário',
    'Assinaturas',
    'Outros',
]);

/**
 * Tipos de pagamento aceitos para um Gasto.
 * - 'debito'  → desconta do Saldo imediatamente.
 * - 'credito' → parcela o valor em meses futuros (Faturas).
 */
const TIPOS_GASTO = Object.freeze(['debito', 'credito']);

// ─────────────────────────────────────────────────────────────
//  ESTADO GLOBAL EM MEMÓRIA (AppState)
// ─────────────────────────────────────────────────────────────

/**
 * Cria e retorna um AppState limpo (sem dados).
 * Usado como valor inicial quando não há nada salvo no localStorage.
 *
 * Estrutura:
 * {
 *   saldo         : number   — saldo disponível atual
 *   transacoes    : Ganho[]|Gasto[]  — histórico de todas as movimentações efetivadas
 *   faturas       : { "YYYY-MM": Gasto[] }  — gastos no crédito, indexados por mês de vencimento
 *   ganhosMensais : Ganho[]  — renda recorrente mensal (salário, freelances fixos, etc.)
 *   gastosMensais : Gasto[]  — despesas recorrentes mensais (aluguel, streaming, etc.)
 * }
 */
function criarAppStateVazio() {
    return {
        saldo: 0,
        transacoes: [],
        faturas: {},
        ganhosMensais: [],
        gastosMensais: [],
    };
}

// Variável singleton que representa o estado em memória durante a sessão.
let _state = criarAppStateVazio();

// ─────────────────────────────────────────────────────────────
//  GERADOR DE ID ÚNICO
// ─────────────────────────────────────────────────────────────

/**
 * Gera um ID único baseado em timestamp + nonce aleatório.
 * Exemplo: "1710567890123-a3f9"
 * @returns {string}
 */
function gerarId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─────────────────────────────────────────────────────────────
//  FACTORIES — Ganho e Gasto
// ─────────────────────────────────────────────────────────────

/**
 * Cria um objeto Ganho.
 *
 * @param {object} params
 * @param {string} params.nome   — descrição do ganho (ex: "Salário", "Freelance")
 * @param {number} params.valor  — valor recebido em R$
 * @param {string} [params.data] — data no formato ISO "YYYY-MM-DD"; padrão: hoje
 * @returns {{ id: string, nome: string, data: string, valor: number, tipo: 'ganho' }}
 */
function criarGanho({ nome, valor, data }) {
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        throw new Error('[Ganho] O campo "nome" é obrigatório.');
    }
    if (typeof valor !== 'number' || valor <= 0) {
        throw new Error('[Ganho] O campo "valor" deve ser um número positivo.');
    }

    return {
        id: gerarId(),
        tipo: 'ganho',                           // identificador de tipo para as Transações
        nome: nome.trim(),
        data: data ?? new Date().toISOString().slice(0, 10), // "YYYY-MM-DD"
        valor: Number(valor.toFixed(2)),
    };
}

/**
 * Cria um objeto Gasto.
 *
 * @param {object} params
 * @param {string} params.nome       — descrição do gasto (ex: "Uber", "Supermercado")
 * @param {number} params.valor      — valor total do gasto em R$
 * @param {string} params.categoria  — uma das CATEGORIAS definidas acima
 * @param {string} params.tipo       — 'debito' | 'credito'
 * @param {number} [params.parcelas] — número de parcelas (1–36); obrigatório se tipo='credito'
 * @param {string} [params.data]     — data no formato ISO "YYYY-MM-DD"; padrão: hoje
 * @returns {{
 *   id: string, tipo: 'gasto', subtipo: 'debito'|'credito',
 *   nome: string, data: string, valor: number,
 *   categoria: string, parcelas: number, valorParcela: number
 * }}
 */
function criarGasto({ nome, valor, categoria, tipo, parcelas = 1, data }) {
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        throw new Error('[Gasto] O campo "nome" é obrigatório.');
    }
    if (typeof valor !== 'number' || valor <= 0) {
        throw new Error('[Gasto] O campo "valor" deve ser um número positivo.');
    }
    if (!CATEGORIAS.includes(categoria)) {
        throw new Error(`[Gasto] Categoria inválida: "${categoria}". Use uma de: ${CATEGORIAS.join(', ')}.`);
    }
    if (!TIPOS_GASTO.includes(tipo)) {
        throw new Error(`[Gasto] Tipo inválido: "${tipo}". Use "debito" ou "credito".`);
    }

    const numParcelas = parseInt(parcelas, 10);
    if (isNaN(numParcelas) || numParcelas < 1 || numParcelas > 36) {
        throw new Error('[Gasto] O campo "parcelas" deve ser um número inteiro entre 1 e 36.');
    }
    if (tipo === 'debito' && numParcelas > 1) {
        throw new Error('[Gasto] Gastos no Débito não podem ser parcelados (parcelas deve ser 1).');
    }

    return {
        id: gerarId(),
        tipo: 'gasto',                            // identificador de tipo para as Transações
        subtipo: tipo,                            // 'debito' | 'credito'
        nome: nome.trim(),
        data: data ?? new Date().toISOString().slice(0, 10),
        valor: Number(valor.toFixed(2)),
        categoria,
        parcelas: numParcelas,
        valorParcela: Number((valor / numParcelas).toFixed(2)),
    };
}

// ─────────────────────────────────────────────────────────────
//  PERSISTÊNCIA — localStorage
// ─────────────────────────────────────────────────────────────

/**
 * Serializa o estado atual e o salva no localStorage.
 * Deve ser chamado após qualquer mutação do estado.
 */
function salvarEstado() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    } catch (err) {
        console.error('[DB] Erro ao salvar no localStorage:', err);
    }
}

/**
 * Carrega o estado salvo do localStorage para a memória (_state).
 * Se não houver dados salvos, mantém o AppState vazio.
 * Deve ser chamado UMA VEZ, na inicialização do app.
 * @returns {object} O estado carregado (referência ao _state em memória).
 */
function carregarEstado() {
    try {

        const raw = localStorage.getItem(STORAGE_KEY);
        //console.log(raw); // Por algum motivo, teremos acesso aos dados antigos que utilizamos para preenchimento do app, por que isso acontece?
        // Caso já tenhamos utiizado alguma vez da URL que estamos utilando para subir o servidor para a página, os dados que utilizarmos serão atrelados a esta URL e, portanto, ao acessar a página novamente, teremos acesso aos dados que utilizamos anteriormente.
        // O localStorage é um recurso do navegador que permite armazenar dados localmente no dispositivo do usuário. Ele é específico para cada domínio (URL) e para cada navegador. Ou seja, caso troquemos de navegador mesmo mantendo a URL, nós não teremos acesso aos dados que utilizamos anteriormente.

        if (raw) { //Se salvarEstado() já tiver sido executado, esta chave existirá no localStorage. Caso contrário, "raw" será igua a null.
            const parsed = JSON.parse(raw);
            // Mescla com o estado vazio para garantir que todas as chaves existam
            // (útil em upgrades futuros quando novas chaves forem adicionadas).
            // Ao fazer isso, mesmo que "parsed" já tenha uma variável que foi definida anteriormente, ele irá sobrescrever o valor dela. Portanto, caso o atributo já tenha sido definido e conseguiu ser recuperado pela busca no localStorage, iremos conseguir sobrescrever o valor default com este valor que foi recuperado.
            _state = { ...criarAppStateVazio(), ...parsed };
            console.info('[DB] Estado carregado do localStorage com sucesso.');
        } else {
            _state = criarAppStateVazio();
            console.info('[DB] Nenhum dado salvo encontrado. Iniciando com estado vazio.');
        }
    } catch (err) {
        console.error('[DB] Erro ao carregar localStorage. Resetando estado.', err);
        _state = criarAppStateVazio();
    }
    return _state;
}

/**
 * Retorna uma cópia imutável (snapshot) do estado atual.
 * Ideal para leitura sem risco de mutações acidentais.
 * @returns {object}
 */
function getEstado() {
    return JSON.parse(JSON.stringify(_state));
}

/**
 * Apaga TODOS os dados salvos e reinicia o estado para zero.
 * ⚠️  Ação destrutiva — use com confirmação do usuário.
 */
function resetarEstado() {
    _state = criarAppStateVazio();
    localStorage.removeItem(STORAGE_KEY);
    console.warn('[DB] ⚠️  Estado resetado e localStorage limpo.');
}

// ─────────────────────────────────────────────────────────────
//  CRUD — Ganho
// ─────────────────────────────────────────────────────────────

/**
 * Registra um novo Ganho avulso (não recorrente):
 *  - Adiciona às Transações.
 *  - Incrementa o Saldo imediatamente.
 *  - Persiste no localStorage.
 *
 * @param {object} params — mesmos parâmetros de criarGanho()
 * @returns {object} O Ganho criado.
 */
function adicionarGanho(params) {
    const ganho = criarGanho(params);
    _state.transacoes.unshift(ganho);   // insere no início (mais recente primeiro)
    _state.saldo = Number((_state.saldo + ganho.valor).toFixed(2));
    salvarEstado();
    console.log(`[DB] ✅ Ganho adicionado: +R$${ganho.valor} — "${ganho.nome}". Saldo atual: R$${_state.saldo}`);
    return ganho;
}

/**
 * Remove um Ganho avulso das Transações pelo ID e estorna o valor do Saldo.
 * @param {string} id
 * @returns {boolean} true se encontrado e removido, false caso contrário.
 */
function removerGanho(id) {
    const idx = _state.transacoes.findIndex(e => e.id === id && e.tipo === 'ganho');
    if (idx === -1) {
        console.warn(`[DB] Ganho com id "${id}" não encontrado.`);
        return false;
    }
    const [ganho] = _state.transacoes.splice(idx, 1);
    _state.saldo = Number((_state.saldo - ganho.valor).toFixed(2));
    salvarEstado();
    console.log(`[DB] 🗑️  Ganho removido: -R$${ganho.valor} (estorno). Saldo atual: R$${_state.saldo}`);
    return true;
}

/**
 * Adiciona um Gancho ao array de Ganhos Mensais (recorrente).
 * Esses valores são processados pela função virar_mes() (Fase 3).
 * @param {object} params — mesmos parâmetros de criarGanho()
 * @returns {object} O Ganho criado.
 */
function adicionarGanhoMensal(params) {
    const ganho = criarGanho(params);
    _state.ganhosMensais.push(ganho);
    salvarEstado();
    console.log(`[DB] 🔁 Ganho Mensal adicionado: R$${ganho.valor} — "${ganho.nome}"`);
    return ganho;
}

/**
 * Remove um Ganho Mensal pelo ID.
 * @param {string} id
 * @returns {boolean}
 */
function removerGanhoMensal(id) {
    const idx = _state.ganhosMensais.findIndex(g => g.id === id);
    if (idx === -1) {
        console.warn(`[DB] Ganho Mensal com id "${id}" não encontrado.`);
        return false;
    }
    const [ganho] = _state.ganhosMensais.splice(idx, 1);
    salvarEstado();
    console.log(`[DB] 🗑️  Ganho Mensal removido: "${ganho.nome}"`);
    return true;
}

// ─────────────────────────────────────────────────────────────
//  CRUD — Gasto
// ─────────────────────────────────────────────────────────────

/**
 * Calcula a chave "YYYY-MM" do mês de vencimento de uma parcela.
 * @param {string} dataBase — "YYYY-MM-DD" (data de compra)
 * @param {number} offsetMeses — quantos meses à frente (0 = mês atual da compra)
 * @returns {string} "YYYY-MM"
 */
function _calcularMesFatura(dataBase, offsetMeses) {
    const d = new Date(dataBase + 'T00:00:00'); // garante UTC para evitar offset de timezone
    d.setMonth(d.getMonth() + offsetMeses);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
}

/**
 * Registra um novo Gasto avulso (não recorrente).
 *
 * Comportamentos por subtipo:
 *  — DÉBITO:
 *    → Desconta o valor total do Saldo imediatamente.
 *    → Adiciona às Transações.
 *
 *  — CRÉDITO:
 *    → Cria uma entrada de parcela para cada mês futuro
 *      no objeto `faturas[YYYY-MM]`.
 *    → NÃO afeta o Saldo agora (o desconto ocorre na virar_mes()).
 *
 * @param {object} params — mesmos parâmetros de criarGasto()
 * @returns {object} O Gasto criado.
 */
function adicionarGasto(params) {
    const gasto = criarGasto(params);

    if (gasto.subtipo === 'debito') {

        // ── DÉBITO ───────────────────────────────────────────
        _state.transacoes.unshift(gasto);
        _state.saldo = Number((_state.saldo - gasto.valor).toFixed(2));
        salvarEstado();
        console.log(`[DB] ✅ Gasto (Débito) adicionado: -R$${gasto.valor} — "${gasto.nome}". Saldo atual: R$${_state.saldo}`);

    } else {

        // ── CRÉDITO ──────────────────────────────────────────
        // Cada parcela vai para o mês correspondente em `faturas`.
        // A parcela 1 vai para o próximo mês (offset=1), a parcela 2
        // vai para o mês seguinte (offset=2), e assim por diante.
        // Convenção: a primeira parcela vence no mês seguinte à compra.
        for (let i = 1; i <= gasto.parcelas; i++) {
            const mesFatura = _calcularMesFatura(gasto.data, i);

            if (!_state.faturas[mesFatura]) {
                _state.faturas[mesFatura] = [];
            }

            _state.faturas[mesFatura].push({
                gastoId: gasto.id,          // referência ao gasto original
                nome: gasto.nome,
                categoria: gasto.categoria,
                parcela: i,                 // número da parcela (1, 2, 3 …)
                totalParcelas: gasto.parcelas,
                valorParcela: gasto.valorParcela,
                dataCompra: gasto.data,
                mesFatura,
            });
        }

        salvarEstado();
        console.log(
            `[DB] 💳 Gasto (Crédito) adicionado: R$${gasto.valor} em ${gasto.parcelas}x de R$${gasto.valorParcela}` +
            ` — "${gasto.nome}". Parcelado em ${gasto.parcelas} faturas futuras. Saldo não alterado.`
        );
    }

    return gasto;
}

/**
 * Remove um Gasto de Débito das Transações e estorna o valor do Saldo.
 * Para gastos de Crédito, use removerGastoCredito().
 * @param {string} id
 * @returns {boolean}
 */
function removerGastoDebito(id) {
    const idx = _state.transacoes.findIndex(e => e.id === id && e.tipo === 'gasto' && e.subtipo === 'debito');
    if (idx === -1) {
        console.warn(`[DB] Gasto Débito com id "${id}" não encontrado nas Transações.`);
        return false;
    }
    const [gasto] = _state.transacoes.splice(idx, 1);
    _state.saldo = Number((_state.saldo + gasto.valor).toFixed(2));
    salvarEstado();
    console.log(`[DB] 🗑️  Gasto Débito removido: +R$${gasto.valor} (estorno). Saldo atual: R$${_state.saldo}`);
    return true;
}

/**
 * Remove todas as parcelas de um Gasto de Crédito das Faturas,
 * identificando-o pelo gastoId.
 * @param {string} gastoId
 * @returns {boolean}
 */
function removerGastoCredito(gastoId) {
    let encontrado = false;
    for (const mes of Object.keys(_state.faturas)) {
        const antes = _state.faturas[mes].length;
        _state.faturas[mes] = _state.faturas[mes].filter(p => p.gastoId !== gastoId);
        if (_state.faturas[mes].length < antes) {
            encontrado = true;
            // Remove a chave do mês se a fatura ficou vazia
            if (_state.faturas[mes].length === 0) {
                delete _state.faturas[mes];
            }
        }
    }
    if (!encontrado) {
        console.warn(`[DB] Nenhuma parcela encontrada para gastoId "${gastoId}".`);
        return false;
    }
    salvarEstado();
    console.log(`[DB] 🗑️  Parcelas do Crédito gastoId "${gastoId}" removidas das Faturas.`);
    return true;
}

/**
 * Adiciona um Gasto ao array de Gastos Mensais (recorrente).
 * Processado pela função virar_mes() (Fase 3).
 * @param {object} params — mesmos parâmetros de criarGasto()
 * @returns {object} O Gasto criado.
 */
function adicionarGastoMensal(params) {
    const gasto = criarGasto({ ...params, tipo: 'debito', parcelas: 1 });
    _state.gastosMensais.push(gasto);
    salvarEstado();
    console.log(`[DB] 🔁 Gasto Mensal adicionado: R$${gasto.valor} — "${gasto.nome}"`);
    return gasto;
}

/**
 * Remove um Gasto Mensal pelo ID.
 * @param {string} id
 * @returns {boolean}
 */
function removerGastoMensal(id) {
    const idx = _state.gastosMensais.findIndex(g => g.id === id);
    if (idx === -1) {
        console.warn(`[DB] Gasto Mensal com id "${id}" não encontrado.`);
        return false;
    }
    const [gasto] = _state.gastosMensais.splice(idx, 1);
    salvarEstado();
    console.log(`[DB] 🗑️  Gasto Mensal removido: "${gasto.nome}"`);
    return true;
}

// ─────────────────────────────────────────────────────────────
//  LEITURA — Queries Úteis
// ─────────────────────────────────────────────────────────────

/**
 * Retorna todas as parcelas de crédito de um mês específico.
 * @param {string} mesAno — "YYYY-MM"
 * @returns {Array} parcelas do mês ou array vazio.
 */
function getFatura(mesAno) {
    return [...(_state.faturas[mesAno] ?? [])];
}

/**
 * Retorna o valor total (soma das parcelas) de uma fatura de um mês.
 * @param {string} mesAno — "YYYY-MM"
 * @returns {number}
 */
function getTotalFatura(mesAno) {
    return Number(
        getFatura(mesAno)
            .reduce((acc, p) => acc + p.valorParcela, 0)
            .toFixed(2)
    );
}

/**
 * Retorna todas as chaves de faturas existentes ordenadas cronologicamente.
 * @returns {string[]} ex: ["2026-04", "2026-05"]
 */
function getFaturasMeses() {
    return Object.keys(_state.faturas).sort();
}

// ─────────────────────────────────────────────────────────────
//  BRIDGES INTERNAS — Usadas exclusivamente pelo engine.js
//  Prefixo _ indica que NÃO são para uso direto pelo código de UI.
// ─────────────────────────────────────────────────────────────

/**
 * [Engine Bridge] Define o saldo diretamente.
 * Usado pelo motor financeiro após consolidação da virada de mês.
 * @param {number} novoSaldo
 */
function _setSaldo(novoSaldo) {
    _state.saldo = Number(novoSaldo.toFixed(2));
    salvarEstado();
}

/**
 * [Engine Bridge] Insere um lançamento no início das Transações.
 * @param {object} lancamento — objeto Ganho ou Gasto já construído
 */
function _adicionarATransacao(lancamento) {
    _state.transacoes.unshift(lancamento);
    salvarEstado();
}

/**
 * [Engine Bridge] Remove (consome) a fatura de um mês do objeto faturas,
 * retornando os itens que estavam nela. Após a virada, esses itens
 * já foram contabilizados no Saldo e podem ser descartados do pendente.
 * @param {string} mesAno — "YYYY-MM"
 * @returns {Array} itens que estavam na fatura (ou [] se vazia)
 */
function _consumirFatura(mesAno) {
    const itens = _state.faturas[mesAno] ?? [];
    delete _state.faturas[mesAno];
    salvarEstado();
    return itens;
}

/**
 * Retorna as Transações completas (cópia).
 * @returns {Array}
 */
function getTransacoes() {
    return [..._state.transacoes];
}

/**
 * Retorna o saldo atual.
 * @returns {number}
 */
function getSaldo() {
    return _state.saldo;
}

// ─────────────────────────────────────────────────────────────
//  INICIALIZAÇÃO
// ─────────────────────────────────────────────────────────────

/**
 * Ponto de entrada do módulo.
 * Carrega o estado salvo do localStorage para a memória.
 * Deve ser chamado no script principal da página (Fase 4).
 */
function initDB() {
    carregarEstado();
    console.info(`[DB] 🚀 Bolso Direito DB iniciado. Saldo atual: R$${_state.saldo}`);
}

// ─────────────────────────────────────────────────────────────
//  EXPOSIÇÃO — API Pública do Módulo
// ─────────────────────────────────────────────────────────────

/**
 * Objeto público BolsoDB.
 * Todas as funções que o restante do app (e os testes no console) devem usar
 * estão expostas aqui. Variáveis internas (_state, etc.) ficam encapsuladas.
 */
const BolsoDB = { //Este objeto está sendo declarado dentro de um contexto local, por conta da declaração com "const", logo, ele não será atributo do objeto global "window".
    // ── Setup ──────────────────────────────────────────
    init: initDB,
    reset: resetarEstado,
    getEstado,

    // ── Ganhos avulsos ─────────────────────────────────
    adicionarGanho,
    removerGanho,

    // ── Gastos avulsos ─────────────────────────────────
    adicionarGasto,
    removerGastoDebito,
    removerGastoCredito,

    // ── Recorrentes Mensais ────────────────────────────
    adicionarGanhoMensal,
    removerGanhoMensal,
    adicionarGastoMensal,
    removerGastoMensal,

    // ── Leituras ───────────────────────────────────────
    getSaldo,
    getTransacoes,
    getFatura,
    getTotalFatura,
    getFaturasMeses,

    // ── Constantes Úteis ───────────────────────────────
    CATEGORIAS,
    TIPOS_GASTO,

    // ── Engine Bridges (uso exclusivo do engine.js) ────
    _setSaldo,
    _adicionarATransacao,
    _consumirFatura,
    _calcularMesFatura,  // re-exposta para engine.js usar no cálculo de alertas
};

// ─────────────────────────────────────────────────────────────
//  🧪 EXEMPLOS DE TESTE (Console)
//
//  Para executar:
//    1. Abra qualquer página HTML do projeto no navegador.
//    2. Abra o DevTools (F12) → Aba "Console".
//    3. Adicione uma tag <script src="../static/js/database.js"></script>
//       temporariamente em qualquer HTML, ou carregue via:
//          const s = document.createElement('script');
//          s.src = '../static/js/database.js'; document.head.appendChild(s);
//    4. Depois execute no console: BolsoDB.init(); e rode os blocos abaixo.
// ─────────────────────────────────────────────────────────────

/**
 * Executa uma bateria de testes no console para validar toda a Fase 2.
 * Chame manualmente: BolsoDB.executarTestes()
 */
BolsoDB.executarTestes = function () {
    console.group('🧪 ===== TESTES FASE 2 — Bolso Direito =====');

    // ── 0. Limpar estado para teste limpo ──────────────
    console.group('📋 0. Reset para estado limpo');
    BolsoDB.reset();
    BolsoDB.init();
    console.assert(BolsoDB.getSaldo() === 0, 'Saldo inicial deve ser 0');
    console.groupEnd();

    // ── 1. Adicionar Ganho Avulso ─────────────────────
    console.group('📋 1. Adicionar Ganho Avulso');
    const ganho1 = BolsoDB.adicionarGanho({ nome: 'Salário Março', valor: 3500 });
    console.assert(BolsoDB.getSaldo() === 3500, 'Saldo deve ser 3500 após ganho');
    console.assert(BolsoDB.getTransacoes().length === 1, 'Transações devem ter 1 item');
    console.log('Ganho criado:', ganho1);
    console.groupEnd();

    // ── 2. Adicionar Gasto Débito ─────────────────────
    console.group('📋 2. Adicionar Gasto Débito');
    const gasto1 = BolsoDB.adicionarGasto({ nome: 'Supermercado', valor: 250, categoria: 'Alimentação', tipo: 'debito' });
    console.assert(BolsoDB.getSaldo() === 3250, 'Saldo deve ser 3250 após débito');
    console.assert(BolsoDB.getTransacoes().length === 2, 'Transações devem ter 2 itens');
    console.log('Gasto Débito criado:', gasto1);
    console.groupEnd();

    // ── 3. Adicionar Gasto Crédito Parcelado ──────────
    console.group('📋 3. Adicionar Gasto Crédito (3x)');
    const gasto2 = BolsoDB.adicionarGasto({ nome: 'Notebook', valor: 3000, categoria: 'Educação', tipo: 'credito', parcelas: 3, data: '2026-03-16' });
    console.assert(BolsoDB.getSaldo() === 3250, 'Saldo NÃO deve mudar após crédito');
    console.assert(Object.keys(BolsoDB.getEstado().faturas).length === 3, 'Deve haver 3 faturas futuras');
    console.log('Gasto Crédito criado:', gasto2);
    console.log('Fatura 2026-04:', BolsoDB.getFatura('2026-04'));
    console.log('Fatura 2026-05:', BolsoDB.getFatura('2026-05'));
    console.log('Fatura 2026-06:', BolsoDB.getFatura('2026-06'));
    console.log('Total Fatura 2026-04: R$', BolsoDB.getTotalFatura('2026-04'));
    console.groupEnd();

    // ── 4. Adicionar Ganho Mensal (recorrente) ────────
    console.group('📋 4. Ganhos e Gastos Mensais (Recorrentes)');
    BolsoDB.adicionarGanhoMensal({ nome: 'Salário Fixo', valor: 3500 });
    BolsoDB.adicionarGastoMensal({ nome: 'Aluguel', valor: 1200, categoria: 'Moradia' });
    const estado = BolsoDB.getEstado();
    console.assert(estado.ganhosMensais.length === 1, 'Deve haver 1 ganho mensal');
    console.assert(estado.gastosMensais.length === 1, 'Deve haver 1 gasto mensal');
    console.log('Ganhos Mensais:', estado.ganhosMensais);
    console.log('Gastos Mensais:', estado.gastosMensais);
    console.groupEnd();

    // ── 5. Persistência — recarregar do localStorage ──
    console.group('📋 5. Persistência no localStorage');
    const saldoAntes = BolsoDB.getSaldo();
    BolsoDB.init(); // simula reload da página
    console.assert(BolsoDB.getSaldo() === saldoAntes, 'Saldo deve persistir após reload');
    console.log(`✅ Saldo persistido corretamente: R$${BolsoDB.getSaldo()}`);
    console.groupEnd();

    // ── 6. Remoção ────────────────────────────────────
    console.group('📋 6. Remoções');
    BolsoDB.removerGanho(ganho1.id);
    console.assert(BolsoDB.getSaldo() === saldoAntes - 3500, 'Saldo deve diminuir após estorno de ganho');
    BolsoDB.removerGastoCredito(gasto2.id);
    console.assert(Object.keys(BolsoDB.getEstado().faturas).length === 0, 'Faturas devem estar vazias após remoção');
    console.log('✅ Remoções concluídas. Saldo final: R$', BolsoDB.getSaldo());
    console.groupEnd();

    // ── 7. Estado Final ───────────────────────────────
    console.group('📋 7. Estado Final Completo');
    console.log(BolsoDB.getEstado());
    console.groupEnd();

    console.log('\n✅ ===== TODOS OS TESTES CONCLUÍDOS =====');
    console.groupEnd();
};
