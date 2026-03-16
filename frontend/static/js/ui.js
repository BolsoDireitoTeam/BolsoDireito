// ============================================================
//  Bolso Direito — ui.js
//  Camada de Renderização — Fase 4
//  Depende de: database.js (BolsoDB) e engine.js (BolsoEngine)
//  ⚠️  Apenas lê dados e escreve no DOM. NUNCA muta o estado.
// ============================================================

'use strict';

// ─────────────────────────────────────────────────────────────
//  FORMATAÇÃO
// ─────────────────────────────────────────────────────────────

/**
 * Formata um número como moeda brasileira: R$ 1.500,00
 * @param {number} v
 * @returns {string}
 */
function _moeda(v) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(v);
}

/**
 * Formata "YYYY-MM-DD" como "DD/MM/YYYY".
 * @param {string} iso
 * @returns {string}
 */
function _dataFormatada(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

/**
 * Converte "YYYY-MM" em nome longo pt-BR: "Abril de 2026"
 * @param {string} mesAno
 * @returns {string}
 */
function _nomeMes(mesAno) {
    const [yyyy, mm] = mesAno.split('-').map(Number);
    const nomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return `${nomes[mm - 1]} de ${yyyy}`;
}

/**
 * Retorna "YYYY-MM" do mês atual.
 * @returns {string}
 */
function _mesAtual() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────
//  ÍCONES SVG INLINE (inline para evitar dependências externas)
// ─────────────────────────────────────────────────────────────

const _ICON_GANHO = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;

const _ICON_GASTO = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/></svg>`;

const _ICON_CREDITO = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`;

const _ICON_ALERT = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

// ─────────────────────────────────────────────────────────────
//  SALDO
// ─────────────────────────────────────────────────────────────

/**
 * Atualiza o elemento #saldoDisplay com o saldo atual do BolsoDB.
 * Aplica classe de cor (positivo/negativo) para feedback visual.
 */
function renderSaldo() {
    const el = document.getElementById('saldoDisplay');
    if (!el) return;

    const saldo = BolsoDB.getSaldo();
    el.textContent = _moeda(saldo);

    // Feedback visual de estado do saldo
    el.classList.remove('saldo-positivo', 'saldo-negativo', 'saldo-zero');
    if (saldo > 0)      el.classList.add('saldo-positivo');
    else if (saldo < 0) el.classList.add('saldo-negativo');
    else                el.classList.add('saldo-zero');
}

// ─────────────────────────────────────────────────────────────
//  EXTRATO
// ─────────────────────────────────────────────────────────────

/**
 * Renderiza os itens do Extrato em #listaExtrato.
 * @param {number} [limite=20] — máximo de itens a exibir na lista
 */
function renderExtrato(limite = 20) {
    const container = document.getElementById('listaExtrato');
    if (!container) return;

    const itens = BolsoDB.getExtrato().slice(0, limite);
    container.innerHTML = '';

    if (itens.length === 0) {
        container.innerHTML = `
            <li class="extrato-vazio">
                <p>Nenhuma movimentação registrada ainda.</p>
                <p>Toque em <strong>+</strong> para adicionar seu primeiro ganho ou gasto.</p>
            </li>`;
        return;
    }

    for (const item of itens) {
        const isGanho   = item.tipo === 'ganho';
        const isCredito = item.tipo === 'gasto' && item.subtipo === 'credito';
        const isFatura  = item.origem === 'fatura';

        const sinal  = isGanho ? '+' : '−';
        const classe = isGanho ? 'ganho' : 'gasto';
        const icon   = isGanho ? _ICON_GANHO : (isCredito || isFatura) ? _ICON_CREDITO : _ICON_GASTO;

        // Legenda extra de parcela/origem
        let meta = '';
        if (item.origem === 'mensal') meta = `<span class="extrato-meta">Recorrente</span>`;
        if (item.origem === 'fatura') meta = `<span class="extrato-meta">Fatura ${item.mesVirada ?? ''}</span>`;
        if (item.subtipo === 'credito' && !isFatura) {
            meta = `<span class="extrato-meta">Crédito ${item.parcelas}x</span>`;
        }
        if (item.categoria) {
            meta += `<span class="extrato-meta categoria-tag">${item.categoria}</span>`;
        }

        const li = document.createElement('li');
        li.className = `extrato-item ${classe}`;
        li.innerHTML = `
            <span class="extrato-icon">${icon}</span>
            <div class="extrato-info">
                <span class="extrato-nome">${item.nome}</span>
                <span class="extrato-data">${_dataFormatada(item.data)}</span>
                ${meta}
            </div>
            <span class="extrato-valor">${sinal} ${_moeda(item.valor)}</span>`;
        container.appendChild(li);
    }

    // Rodapé se há mais itens do que o limite
    const total = BolsoDB.getExtrato().length;
    if (total > limite) {
        const rodape = document.createElement('li');
        rodape.className = 'extrato-rodape';
        rodape.textContent = `+ ${total - limite} movimentações anteriores`;
        container.appendChild(rodape);
    }
}

// ─────────────────────────────────────────────────────────────
//  ALERTAS DE RISCO
// ─────────────────────────────────────────────────────────────

/**
 * Lê os alertas do BolsoEngine e injeta/remove o banner #alertas-container.
 * Mostra apenas o alerta de nível mais grave (risco > atencao > ok).
 */
function renderAlertas() {
    const container = document.getElementById('alertas-container');
    if (!container) return;

    const alertas = BolsoEngine.calcularAlertas();
    // Filtra apenas atencao e risco (não exibe "ok")
    const alertasAtivos = alertas.filter(a => a.nivel !== 'ok');
    container.innerHTML = '';

    if (alertasAtivos.length === 0) return;

    for (const alerta of alertasAtivos) {
        const div = document.createElement('div');
        div.className = `alerta-banner alerta-${alerta.nivel}`;
        div.innerHTML = `
            <span class="alerta-icon">${_ICON_ALERT}</span>
            <div class="alerta-texto">
                <strong>${alerta.nivel === 'risco' ? '⚠️ Limite Excedido' : '🔔 Atenção'}</strong>
                <span>Fatura de <strong>${_nomeMes(alerta.mesAno)}</strong>: 
                    <strong>${_moeda(alerta.totalFatura)}</strong> 
                    (${(alerta.percentual * 100).toFixed(0)}% da sua capacidade de ${_moeda(alerta.capacidade)})
                </span>
            </div>`;
        container.appendChild(div);
    }
}

// ─────────────────────────────────────────────────────────────
//  GRÁFICOS (Chart.js)
// ─────────────────────────────────────────────────────────────

/**
 * Constrói os dados para o gráfico de barras (Despesas por Mês).
 * Agrega os gastos do Extrato por mês (últimos 6 meses).
 * @returns {{ labels: string[], data: number[] }}
 */
function _dadosGraficoBarras() {
    const extrato = BolsoDB.getExtrato();
    const meses   = [];
    const agora   = new Date();

    // Gera os últimos 7 meses (incluindo o atual)
    for (let i = 6; i >= 0; i--) {
        const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
        const key    = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label  = d.toLocaleDateString('pt-BR', { month: 'short' })
                        .replace('.', '').toUpperCase();
        meses.push({ key, label });
    }

    const data = meses.map(({ key }) => {
        const total = extrato
            .filter(e => e.tipo === 'gasto' && e.data && e.data.startsWith(key))
            .reduce((acc, e) => acc + e.valor, 0);
        return Number(total.toFixed(2));
    });

    return { labels: meses.map(m => m.label), data };
}

/**
 * Constrói os dados para o gráfico de pizza (Gastos por Categoria).
 * Filtra gastos do mês atual.
 * @returns {{ labels: string[], data: number[] }}
 */
function _dadosGraficoPizza() {
    const extrato   = BolsoDB.getExtrato();
    const mesAtual  = _mesAtual();
    const gastosMes = extrato.filter(
        e => e.tipo === 'gasto' && e.data && e.data.startsWith(mesAtual) && e.categoria
    );

    const mapa = {};
    for (const g of gastosMes) {
        mapa[g.categoria] = (mapa[g.categoria] ?? 0) + g.valor;
    }

    const labels = Object.keys(mapa);
    const data   = labels.map(l => Number(mapa[l].toFixed(2)));
    return { labels, data };
}

/**
 * Atualiza (ou cria) o gráfico de barras do overview.
 * @param {Chart|null} chartRef — instância Chart.js existente (ou null para criar)
 * @returns {Chart} instância atualizada
 */
function renderGraficoBarras(chartRef) {
    const canvas = document.getElementById('barChart');
    if (!canvas) return null;

    const { labels, data } = _dadosGraficoBarras();

    if (chartRef) {
        chartRef.data.labels       = labels;
        chartRef.data.datasets[0]  = { ...chartRef.data.datasets[0], data };
        chartRef.update();
        return chartRef;
    }

    Chart.defaults.font.family = "'Roboto', sans-serif";
    Chart.defaults.color       = '#7f8c8d';

    return new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Gastos',
                data,
                backgroundColor: '#ACB6E5',
                borderRadius: 6,
                barPercentage: 0.6,
            }],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, display: false },
                x: { grid: { display: false } },
            },
        },
    });
}

/**
 * Atualiza (ou cria) o gráfico de pizza do overview.
 * @param {Chart|null} chartRef
 * @returns {Chart}
 */
function renderGraficoPizza(chartRef) {
    const canvas = document.getElementById('pieChart');
    if (!canvas) return null;

    const { labels, data } = _dadosGraficoPizza();
    const CORES = ['#2c3e50', '#74ebd5', '#ACB6E5', '#f4f7f6', '#e74c3c', '#f39c12', '#27ae60', '#8e44ad', '#3498db'];

    if (chartRef) {
        chartRef.data.labels                 = labels;
        chartRef.data.datasets[0].data       = data;
        chartRef.data.datasets[0].backgroundColor = CORES.slice(0, labels.length);
        chartRef.update();
        return chartRef;
    }

    Chart.defaults.font.family = "'Roboto', sans-serif";
    Chart.defaults.color       = '#7f8c8d';

    return new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: labels.length ? labels : ['Sem dados'],
            datasets: [{
                data: data.length ? data : [1],
                backgroundColor: data.length ? CORES.slice(0, labels.length) : ['#ecf0f1'],
                borderWidth: 0,
                hoverOffset: 4,
            }],
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, padding: 15 } },
            },
        },
    });
}

// ─────────────────────────────────────────────────────────────
//  STATS MENSAIS (view-mensal.html)
// ─────────────────────────────────────────────────────────────

/**
 * Preenche os cards de estatísticas na tela view-mensal.
 * @param {string} mesAno — "YYYY-MM"
 */
function renderStatsMensais(mesAno) {
    const extrato = BolsoDB.getExtrato();
    const estado  = BolsoDB.getEstado();

    // Filtra apenas movimentações do mês alvo
    const doMes = extrato.filter(e => e.data && e.data.startsWith(mesAno));

    const totalGanhos = doMes
        .filter(e => e.tipo === 'ganho')
        .reduce((a, e) => a + e.valor, 0);

    const gastosMes = doMes.filter(e => e.tipo === 'gasto');
    const totalGastos = gastosMes.reduce((a, e) => a + e.valor, 0);

    const economizou = totalGanhos - totalGastos;

    // Maior despesa individual
    const maiorGasto = gastosMes.reduce((max, e) => e.valor > (max?.valor ?? 0) ? e : max, null);

    // Balanço percentual
    const balancoPct = totalGanhos > 0 ? ((economizou / totalGanhos) * 100).toFixed(0) : 0;

    // Injeta nos elementos (cria os IDs nos stats-card span.stat-value)
    _setText('stat-economizou',    _moeda(Math.abs(economizou)));
    _setText('stat-gasto-total',   _moeda(totalGastos));
    _setText('stat-maior-despesa', maiorGasto ? _moeda(maiorGasto.valor) : '—');
    _setText('stat-maior-cat',     maiorGasto?.categoria ?? '—');
    _setText('stat-balanco',       economizou >= 0 ? 'Positivo' : 'Negativo');
    _setText('stat-balanco-pct',   `${economizou >= 0 ? '+' : ''}${balancoPct}%`);

    // Cores condicionais
    const elEcon = document.getElementById('stat-economizou');
    if (elEcon) {
        elEcon.classList.toggle('text-bd-success', economizou >= 0);
        elEcon.classList.toggle('text-bd-danger',  economizou < 0);
    }
    const elPct = document.getElementById('stat-balanco-pct');
    if (elPct) {
        elPct.classList.toggle('text-bd-success', economizou >= 0);
        elPct.classList.toggle('text-bd-danger',  economizou < 0);
    }
}

/** Helper: define textContent em um elemento pelo ID.  */
function _setText(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
}

// ─────────────────────────────────────────────────────────────
//  RENDER COMPLETO (overview)
// ─────────────────────────────────────────────────────────────

/**
 * Renderiza todos os componentes do overview em cascata.
 * @param {{ barChart?: Chart, pieChart?: Chart }} charts — instâncias Chart.js
 * @returns {{ barChart: Chart, pieChart: Chart }}
 */
function renderOverview(charts = {}) {
    renderSaldo();
    renderExtrato();
    renderAlertas();
    const barChart  = renderGraficoBarras(charts.barChart  ?? null);
    const pieChart  = renderGraficoPizza(charts.pieChart   ?? null);
    return { barChart, pieChart };
}

// ─────────────────────────────────────────────────────────────
//  EXPOSIÇÃO PÚBLICA
// ─────────────────────────────────────────────────────────────

const UI = {
    renderSaldo,
    renderExtrato,
    renderAlertas,
    renderGraficoBarras,
    renderGraficoPizza,
    renderStatsMensais,
    renderOverview,
    // helpers reutilizáveis pelo app.js
    moeda  : _moeda,
    mesAtual: _mesAtual,
};
