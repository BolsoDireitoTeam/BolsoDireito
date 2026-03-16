// ============================================================
//  Bolso Direito — engine.js
//  Motor Financeiro — Fase 3
//  Depende de: database.js (BolsoDB deve estar carregado antes)
//  ⚠️  SEM integração com DOM (nenhum querySelector/getElementById).
//      Toda a lógica pode ser testada via Console do Navegador.
// ============================================================

'use strict';

// ─────────────────────────────────────────────────────────────
//  HELPERS INTERNOS
// ─────────────────────────────────────────────────────────────

/**
 * Retorna "YYYY-MM" de um objeto Date (ou da data atual, se omitido).
 * @param {Date} [data]
 * @returns {string}
 */
function _mesAno(data = new Date()) {
    const yyyy = data.getFullYear();
    const mm   = String(data.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
}

/**
 * Retorna "YYYY-MM-DD" de um objeto Date.
 * @param {Date} [data]
 * @returns {string}
 */
function _dataISO(data = new Date()) {
    return data.toISOString().slice(0, 10);
}

/**
 * Avança um "YYYY-MM" por N meses, retornando o novo "YYYY-MM".
 * @param {string} mesAno
 * @param {number} n
 * @returns {string}
 */
function _avancarMeses(mesAno, n) {
    const [yyyy, mm] = mesAno.split('-').map(Number);
    const d = new Date(yyyy, mm - 1 + n, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Formata um número como moeda brasileira para logs.
 * @param {number} v
 * @returns {string}
 */
function _fmt(v) {
    return `R$ ${Math.abs(v).toFixed(2).replace('.', ',')}`;
}

// ─────────────────────────────────────────────────────────────
//  CONSTANTES DO MOTOR
// ─────────────────────────────────────────────────────────────

/**
 * Percentual do limite mensal (saldo + ganhos mensais) a partir do qual
 * um alerta de ATENÇÃO é emitido para uma fatura futura.
 * Padrão: 70% — "você está gastando muita parte da sua renda no crédito."
 */
const LIMITE_ATENCAO_PCT  = 0.70;

/**
 * Percentual a partir do qual um alerta de RISCO é emitido.
 * Padrão: 100% — a fatura futura supera a capacidade de pagamento.
 */
const LIMITE_RISCO_PCT    = 1.00;

// ─────────────────────────────────────────────────────────────
//  FUNÇÃO PRINCIPAL — virar_mes()
// ─────────────────────────────────────────────────────────────

/**
 * Motor central de consolidação mensal do Bolso Direito.
 *
 * Executa, nesta ordem:
 *  1. Soma os Ganhos Mensais ao Saldo e registra cada um no Extrato.
 *  2. Subtrai os Gastos Mensais do Saldo e registra cada um no Extrato.
 *  3. Consome a Fatura do mês-alvo (totaliza todas as parcelas de crédito
 *     que vencem naquele mês), desconta do Saldo em bloco e registra
 *     um único lançamento consolidado no Extrato.
 *
 * @param {object} [opcoes]
 * @param {string} [opcoes.mesAlvo]  — "YYYY-MM" do mês a virar.
 *                                     Padrão: mês corrente (hoje).
 * @param {Date}   [opcoes.dataRef]  — Data que será carimbada nos lançamentos
 *                                     gerados. Padrão: hoje.
 * @returns {{
 *   mesAlvo       : string,
 *   saldoAntes    : number,
 *   totalGanhos   : number,
 *   totalGastos   : number,
 *   totalFatura   : number,
 *   saldoDepois   : number,
 *   lancamentos   : object[],
 * }}
 */
function virar_mes({ mesAlvo, dataRef } = {}) {
    // ── Validação de pré-condição ──────────────────────────
    if (typeof BolsoDB === 'undefined') {
        throw new Error('[Engine] BolsoDB não encontrado. Carregue database.js antes de engine.js.');
    }

    const hoje       = dataRef ?? new Date();
    const mesVirada  = mesAlvo  ?? _mesAno(hoje);
    const dataStr    = _dataISO(hoje);

    const saldoAntes  = BolsoDB.getSaldo();
    const lancamentos = [];  // lançamentos gerados nesta virada, para o relatório
    let   saldoAtual  = saldoAntes;

    console.group(`\n🔄 ===== virar_mes() — ${mesVirada} =====`);
    console.log(`📌 Saldo de entrada: ${_fmt(saldoAntes)}`);

    // ─────────────────────────────────────────────────────
    //  PASSO 1 — Creditar Ganhos Mensais
    // ─────────────────────────────────────────────────────
    const estado = BolsoDB.getEstado();
    let totalGanhos = 0;

    if (estado.ganhosMensais.length === 0) {
        console.log('💰 Nenhum Ganho Mensal configurado.');
    } else {
        console.group('💰 Passo 1 — Crédito de Ganhos Mensais');
        for (const template of estado.ganhosMensais) {
            const lancamento = {
                id          : _gerarIdEngine(),
                tipo        : 'ganho',
                origem      : 'mensal',          // marcador de origem para o Extrato
                nome        : template.nome,
                data        : dataStr,
                valor       : template.valor,
                mesVirada,
            };
            saldoAtual = Number((saldoAtual + lancamento.valor).toFixed(2));
            totalGanhos = Number((totalGanhos + lancamento.valor).toFixed(2));
            BolsoDB._adicionarAoExtrato(lancamento);
            lancamentos.push(lancamento);
            console.log(`  ✅ +${_fmt(lancamento.valor)} — "${lancamento.nome}"`);
        }
        console.log(`  📊 Total creditado: +${_fmt(totalGanhos)} → Saldo: ${_fmt(saldoAtual)}`);
        console.groupEnd();
    }

    // ─────────────────────────────────────────────────────
    //  PASSO 2 — Debitar Gastos Mensais
    // ─────────────────────────────────────────────────────
    let totalGastos = 0;

    if (estado.gastosMensais.length === 0) {
        console.log('🏠 Nenhum Gasto Mensal configurado.');
    } else {
        console.group('🏠 Passo 2 — Débito de Gastos Mensais');
        for (const template of estado.gastosMensais) {
            const lancamento = {
                id          : _gerarIdEngine(),
                tipo        : 'gasto',
                subtipo     : 'debito',
                origem      : 'mensal',
                nome        : template.nome,
                data        : dataStr,
                valor       : template.valor,
                categoria   : template.categoria,
                mesVirada,
            };
            saldoAtual = Number((saldoAtual - lancamento.valor).toFixed(2));
            totalGastos = Number((totalGastos + lancamento.valor).toFixed(2));
            BolsoDB._adicionarAoExtrato(lancamento);
            lancamentos.push(lancamento);
            console.log(`  ✅ -${_fmt(lancamento.valor)} — "${lancamento.nome}" (${lancamento.categoria})`);
        }
        console.log(`  📊 Total debitado: -${_fmt(totalGastos)} → Saldo: ${_fmt(saldoAtual)}`);
        console.groupEnd();
    }

    // ─────────────────────────────────────────────────────
    //  PASSO 3 — Consolidar Fatura do Mês
    // ─────────────────────────────────────────────────────
    console.group(`💳 Passo 3 — Fatura de ${mesVirada}`);

    const itensFatura = BolsoDB._consumirFatura(mesVirada);
    let totalFatura   = 0;

    if (itensFatura.length === 0) {
        console.log('  ℹ️  Nenhuma parcela de crédito vencendo neste mês.');
    } else {
        // Calcula o total da fatura (pode haver diferenças de centavo por arredondamento;
        // usamos reduce para somar com precisão).
        totalFatura = Number(
            itensFatura.reduce((acc, p) => acc + p.valorParcela, 0).toFixed(2)
        );

        // Gera um ÚNICO lançamento consolidado no Extrato representando toda a fatura.
        const lancamentoFatura = {
            id          : _gerarIdEngine(),
            tipo        : 'gasto',
            subtipo     : 'credito',
            origem      : 'fatura',
            nome        : `Fatura ${_exibirMes(mesVirada)}`,
            data        : dataStr,
            valor       : totalFatura,
            categoria   : 'Outros',              // categoria genérica para o bloco da fatura
            parcelas    : itensFatura,           // detalhe completo das parcelas para drill-down (Fase 4)
            mesVirada,
        };

        saldoAtual = Number((saldoAtual - totalFatura).toFixed(2));
        BolsoDB._adicionarAoExtrato(lancamentoFatura);
        lancamentos.push(lancamentoFatura);

        console.log(`  📋 ${itensFatura.length} parcela(s) consumida(s):`);
        for (const p of itensFatura) {
            console.log(`     • ${_fmt(p.valorParcela)} — "${p.nome}" (${p.parcela}/${p.totalParcelas})`);
        }
        console.log(`  📊 Total da fatura: -${_fmt(totalFatura)} → Saldo após fatura: ${_fmt(saldoAtual)}`);
    }

    console.groupEnd();

    // ─────────────────────────────────────────────────────
    //  COMMIT — Persiste o saldo final calculado
    // ─────────────────────────────────────────────────────
    BolsoDB._setSaldo(saldoAtual);

    // ─────────────────────────────────────────────────────
    //  RELATÓRIO DA VIRADA
    // ─────────────────────────────────────────────────────
    const resultado = {
        mesAlvo     : mesVirada,
        saldoAntes,
        totalGanhos,
        totalGastos,
        totalFatura,
        saldoDepois : saldoAtual,
        lancamentos,
    };

    console.group('📊 Resumo da Virada');
    console.log(`  Mês virado   : ${mesVirada}`);
    console.log(`  Saldo antes  : ${_fmt(saldoAntes)}`);
    console.log(`  + Ganhos     : +${_fmt(totalGanhos)}`);
    console.log(`  - Gastos     : -${_fmt(totalGastos)}`);
    console.log(`  - Fatura     : -${_fmt(totalFatura)}`);
    console.log(`  ─────────────────────────`);
    console.log(`  Saldo final  : ${_fmt(saldoAtual)}${saldoAtual < 0 ? ' ⚠️  SALDO NEGATIVO!' : ''}`);
    console.groupEnd();

    console.groupEnd(); // fecha o grupo principal virar_mes()

    return resultado;
}

// ─────────────────────────────────────────────────────────────
//  SISTEMA DE ALERTAS — Análise Preditiva de Faturas Futuras
// ─────────────────────────────────────────────────────────────

/**
 * Calcula o status de risco financeiro para cada mês futuro com fatura
 * pendente, comparando o total da fatura com a capacidade de pagamento
 * estimada do usuário (Saldo Atual + soma dos Ganhos Mensais).
 *
 * Níveis de alerta:
 *  - 'ok'       → fatura está dentro dos limites seguros
 *  - 'atencao'  → fatura supera LIMITE_ATENCAO_PCT da capacidade (padrão: 70%)
 *  - 'risco'    → fatura supera LIMITE_RISCO_PCT da capacidade (padrão: 100%)
 *
 * @returns {Array<{
 *   mesAno       : string,
 *   totalFatura  : number,
 *   capacidade   : number,
 *   percentual   : number,
 *   nivel        : 'ok' | 'atencao' | 'risco',
 *   mensagem     : string,
 * }>}
 */
function calcularAlertas() {
    const estado = BolsoDB.getEstado();
    const meses  = BolsoDB.getFaturasMeses();

    // Capacidade de pagamento = saldo atual + total de todos os ganhos mensais
    const totalGanhosMensais = estado.ganhosMensais.reduce((acc, g) => acc + g.valor, 0);
    const capacidade         = Number((estado.saldo + totalGanhosMensais).toFixed(2));

    const alertas = [];

    for (const mes of meses) {
        const totalFatura = BolsoDB.getTotalFatura(mes);
        const percentual  = capacidade > 0 ? totalFatura / capacidade : Infinity;

        let nivel, mensagem;

        if (percentual >= LIMITE_RISCO_PCT) {
            nivel    = 'risco';
            mensagem = `🔴 RISCO: A fatura de ${_exibirMes(mes)} (${_fmt(totalFatura)}) `
                     + `supera ${(percentual * 100).toFixed(0)}% da sua capacidade de pagamento (${_fmt(capacidade)}).`;
        } else if (percentual >= LIMITE_ATENCAO_PCT) {
            nivel    = 'atencao';
            mensagem = `🟡 ATENÇÃO: A fatura de ${_exibirMes(mes)} (${_fmt(totalFatura)}) `
                     + `representa ${(percentual * 100).toFixed(0)}% da sua capacidade (${_fmt(capacidade)}).`;
        } else {
            nivel    = 'ok';
            mensagem = `🟢 OK: Fatura de ${_exibirMes(mes)} (${_fmt(totalFatura)}) `
                     + `representa ${(percentual * 100).toFixed(0)}% da sua capacidade.`;
        }

        alertas.push({ mesAno: mes, totalFatura, capacidade, percentual, nivel, mensagem });
    }

    return alertas;
}

/**
 * Imprime os alertas no console de forma legível.
 * Atalho para teste manual.
 */
function exibirAlertas() {
    const alertas = calcularAlertas();
    if (alertas.length === 0) {
        console.log('[Engine] ✅ Nenhuma fatura futura detectada. Você está livre!');
        return;
    }
    console.group('[Engine] 🔔 Alertas de Faturas Futuras');
    for (const a of alertas) {
        console.log(a.mensagem);
    }
    console.groupEnd();
    return alertas;
}

// ─────────────────────────────────────────────────────────────
//  AUXILIARES DE ENGINE (privados)
// ─────────────────────────────────────────────────────────────

/** Gera ID único com prefixo "eng" para lançamentos criados pelo motor. */
function _gerarIdEngine() {
    return `eng-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Converte "YYYY-MM" em nome legível em pt-BR.
 * Exemplo: "2026-04" → "Abril/2026"
 * @param {string} mesAno
 * @returns {string}
 */
function _exibirMes(mesAno) {
    const [yyyy, mm] = mesAno.split('-').map(Number);
    const nomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return `${nomes[mm - 1]}/${yyyy}`;
}

// ─────────────────────────────────────────────────────────────
//  EXPOSIÇÃO — API Pública do Motor
// ─────────────────────────────────────────────────────────────

/**
 * Objeto público BolsoEngine.
 * Contém toda a lógica de negócio financeiro (Fase 3).
 * Requer que BolsoDB (database.js) já tenha sido carregado e iniciado.
 */
const BolsoEngine = {
    virar_mes,
    calcularAlertas,
    exibirAlertas,
};


// ─────────────────────────────────────────────────────────────
//  🧪 SIMULAÇÃO DE TESTE — Fase 3
//
//  Para executar:
//    1. Abra qualquer HTML do projeto no navegador.
//    2. Carregue database.js e engine.js via console (ver instruções Fase 2).
//    3. Chame: BolsoEngine.simularFase3()
// ─────────────────────────────────────────────────────────────

/**
 * Simula o cenário completo da Fase 3:
 *  - Define um saldo inicial
 *  - Cadastra ganho e gasto recorrentes mensais
 *  - Cria um Gasto no Crédito em 2x
 *  - Executa virar_mes() duas vezes seguidas
 *  - Imprime o log de cada estado para validação matemática
 *
 * Chame manualmente: BolsoEngine.simularFase3()
 */
BolsoEngine.simularFase3 = function () {
    console.group('\n🧪 ===== SIMULAÇÃO FASE 3 — Motor Financeiro =====\n');

    // ── 0. Estado limpo ────────────────────────────────
    console.group('📋 0. Preparação do cenário');
    BolsoDB.reset();
    BolsoDB.init();

    // Saldo inicial: simula que o usuário já tem R$ 2.000 na conta
    BolsoDB._setSaldo(2000);
    console.log(`💼 Saldo inicial definido: ${_fmt(BolsoDB.getSaldo())}`);

    // Ganho mensal recorrente: Salário de R$ 3.500
    BolsoDB.adicionarGanhoMensal({ nome: 'Salário', valor: 3500 });

    // Gasto mensal recorrente: Aluguel de R$ 1.200
    BolsoDB.adicionarGastoMensal({ nome: 'Aluguel', valor: 1200, categoria: 'Moradia' });

    console.log('🔁 Recorrentes configurados:');
    console.log('   Ganho Mensal: +R$ 3.500,00 — Salário');
    console.log('   Gasto Mensal: -R$ 1.200,00 — Aluguel');
    console.groupEnd();

    // ── 1. Criar Gasto no Crédito (2x) ────────────────
    console.group('\n📋 1. Gasto no Crédito — TV R$ 2.400,00 em 2x');

    // Usamos data fixa de compra = 2026-03-16 para que as parcelas
    // caiam exatamente em Abril/2026 e Maio/2026.
    const gastoCredito = BolsoDB.adicionarGasto({
        nome      : 'Smart TV 55"',
        valor     : 2400,
        categoria : 'Lazer',
        tipo      : 'credito',
        parcelas  : 2,
        data      : '2026-03-16',
    });

    console.log(`\n  Gasto criado: ${_fmt(gastoCredito.valor)} em 2x de ${_fmt(gastoCredito.valorParcela)}`);
    console.log(`  Fatura Abril/2026: ${_fmt(BolsoDB.getTotalFatura('2026-04'))}`);
    console.log(`  Fatura Maio/2026 : ${_fmt(BolsoDB.getTotalFatura('2026-05'))}`);
    console.log(`  Saldo atual (não alterado): ${_fmt(BolsoDB.getSaldo())}`);
    console.groupEnd();

    // ── 2. Verificar Alertas ANTES da 1ª virada ───────
    console.group('\n📋 2. Alertas ANTES da 1ª virada de mês');
    BolsoEngine.exibirAlertas();
    console.groupEnd();

    // ── 3. Primeira Virada: Abril/2026 ────────────────
    console.group('\n📋 3. Primeira Virada de Mês (Abril/2026)');
    const resultado1 = BolsoEngine.virar_mes({ mesAlvo: '2026-04' });

    // Cálculo esperado:
    //   Saldo antes     : R$ 2.000,00
    //   + Salário       : R$ 3.500,00 → R$ 5.500,00
    //   - Aluguel       : R$ 1.200,00 → R$ 4.300,00
    //   - Fatura Abr    : R$ 1.200,00 → R$ 3.100,00
    console.log('\n  🔢 Conferência matemática esperada:');
    console.log(`     Saldo antes : ${_fmt(resultado1.saldoAntes)}`);
    console.log(`     + Ganhos    : +${_fmt(resultado1.totalGanhos)}  (esperado: R$ 3.500,00)`);
    console.log(`     - Gastos    : -${_fmt(resultado1.totalGastos)}  (esperado: R$ 1.200,00)`);
    console.log(`     - Fatura    : -${_fmt(resultado1.totalFatura)}  (esperado: R$ 1.200,00)`);
    console.log(`     Saldo final : ${_fmt(resultado1.saldoDepois)}  (esperado: R$ 3.100,00)`);

    const saldoEsperado1 = 2000 + 3500 - 1200 - 1200;
    console.assert(resultado1.saldoDepois === saldoEsperado1,
        `❌ Saldo incorreto! Esperado R$ ${saldoEsperado1.toFixed(2)}, obtido R$ ${resultado1.saldoDepois.toFixed(2)}`);
    console.log(`\n  ✅ Extrato após 1ª virada: ${BolsoDB.getExtrato().length} lançamento(s)`);
    console.log(`  ✅ Faturas restantes: ${JSON.stringify(Object.keys(BolsoDB.getEstado().faturas))}`);
    console.groupEnd();

    // ── 4. Alertas ENTRE as viradas ───────────────────
    console.group('\n📋 4. Alertas APÓS 1ª virada (fatura de Maio ainda pendente)');
    BolsoEngine.exibirAlertas();
    console.groupEnd();

    // ── 5. Segunda Virada: Maio/2026 ──────────────────
    console.group('\n📋 5. Segunda Virada de Mês (Maio/2026)');
    const resultado2 = BolsoEngine.virar_mes({ mesAlvo: '2026-05' });

    // Cálculo esperado:
    //   Saldo antes     : R$ 3.100,00
    //   + Salário       : R$ 3.500,00 → R$ 6.600,00
    //   - Aluguel       : R$ 1.200,00 → R$ 5.400,00
    //   - Fatura Mai    : R$ 1.200,00 → R$ 4.200,00
    console.log('\n  🔢 Conferência matemática esperada:');
    console.log(`     Saldo antes : ${_fmt(resultado2.saldoAntes)}`);
    console.log(`     + Ganhos    : +${_fmt(resultado2.totalGanhos)}  (esperado: R$ 3.500,00)`);
    console.log(`     - Gastos    : -${_fmt(resultado2.totalGastos)}  (esperado: R$ 1.200,00)`);
    console.log(`     - Fatura    : -${_fmt(resultado2.totalFatura)}  (esperado: R$ 1.200,00)`);
    console.log(`     Saldo final : ${_fmt(resultado2.saldoDepois)}  (esperado: R$ 4.200,00)`);

    const saldoEsperado2 = saldoEsperado1 + 3500 - 1200 - 1200;
    console.assert(resultado2.saldoDepois === saldoEsperado2,
        `❌ Saldo incorreto! Esperado R$ ${saldoEsperado2.toFixed(2)}, obtido R$ ${resultado2.saldoDepois.toFixed(2)}`);
    console.log(`\n  ✅ Extrato total: ${BolsoDB.getExtrato().length} lançamento(s)`);
    console.log(`  ✅ Faturas pendentes: ${JSON.stringify(Object.keys(BolsoDB.getEstado().faturas))} (esperado: [])`);
    console.groupEnd();

    // ── 6. Extrato Final Completo ──────────────────────
    console.group('\n📋 6. Extrato Final (do mais recente ao mais antigo)');
    const extrato = BolsoDB.getExtrato();
    extrato.forEach((e, i) => {
        const sinal = (e.tipo === 'ganho') ? '+' : '-';
        const origem = e.origem ? ` [${e.origem}]` : '';
        console.log(`  ${i + 1}. ${sinal}${_fmt(e.valor)} — "${e.nome}"${origem} (${e.data})`);
    });
    console.groupEnd();

    // ── 7. Estado Final ───────────────────────────────
    console.group('\n📋 7. Estado Final no localStorage');
    console.log('Saldo final:', _fmt(BolsoDB.getSaldo()));
    console.log('Faturas pendentes:', BolsoDB.getFaturasMeses());
    console.log('Estado completo:', BolsoDB.getEstado());
    console.groupEnd();

    console.log('\n✅ ===== SIMULAÇÃO FASE 3 CONCLUÍDA =====\n');
    console.groupEnd();

    return { resultado1, resultado2 };
};
