// ============================================================
//  Bolso Direito — app.js
//  Controlador de Páginas — Fase 4
//  Depende de: database.js → engine.js → ui.js (nessa ordem)
//
//  Detecta a página pelo atributo data-page no <body> e executa
//  apenas o código relevante. Wires todos os eventos de UI.
// ============================================================

'use strict';

// ─────────────────────────────────────────────────────────────
//  INICIALIZAÇÃO GLOBAL
//  Executado em TODAS as páginas que carregam este script.
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o banco de dados local (carrega do localStorage)
    BolsoDB.init();

    // Detecta qual página está ativa
    const page = document.body.dataset.page ?? '';

    switch (page) {
        case 'overview':          initOverview();          break;
        case 'view-mensal':       initViewMensal();        break;
        case 'teclado-valores':   initTecladoValores();    break;
        case 'escolher-tipo':     initEscolherTipo();      break;
        default: break;
    }
});

// ─────────────────────────────────────────────────────────────
//  PÁGINA: overview.html
// ─────────────────────────────────────────────────────────────

function initOverview() {
    // Renderização inicial completa
    let charts = UI.renderOverview();

    // ── Botão Virar Mês ──────────────────────────────────
    const btnVirarMes = document.getElementById('btn-virar-mes');
    if (btnVirarMes) {
        btnVirarMes.addEventListener('click', () => {
            const agora    = new Date();
            const mesAlvo  = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
            const nomeMes  = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

            if (!confirm(`Confirmar virada do mês de ${nomeMes}?\n\nEsta ação irá:\n• Creditar seus Ganhos Mensais\n• Debitar seus Gastos Mensais\n• Cobrar a Fatura do mês no seu Saldo`)) {
                return;
            }

            try {
                const resultado = BolsoEngine.virar_mes({ mesAlvo });
                // Fecha o action sheet antes de re-renderizar
                _fecharActionSheet();
                // Re-renderiza tudo com os dados atualizados
                charts = UI.renderOverview(charts);
                _mostrarToast(
                    `Mês virado! Saldo: ${UI.moeda(resultado.saldoDepois)}`,
                    'success'
                );
            } catch (err) {
                console.error('[App] Erro ao virar mês:', err);
                _mostrarToast('Erro ao virar mês. Veja o console.', 'error');
            }
        });
    }

    // ── Re-renderiza ao voltar para a página (navegação SPA-like) ──
    // Garante que se o usuário adicionar um gasto e voltar, o saldo atualiza.
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            BolsoDB.init();
            charts = UI.renderOverview(charts);
        }
    });
}

// ─────────────────────────────────────────────────────────────
//  PÁGINA: view-mensal.html
// ─────────────────────────────────────────────────────────────

function initViewMensal() {
    const hoje = new Date();
    let anoAtual = hoje.getFullYear();
    let mesIndex = hoje.getMonth(); // 0-indexed

    const MESES_LABELS = [
        'JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO',
        'JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'
    ];

    function _mesAnoStr() {
        return `${anoAtual}-${String(mesIndex + 1).padStart(2, '0')}`;
    }

    function _atualizar() {
        const el = document.getElementById('mesAtual');
        if (el) el.textContent = MESES_LABELS[mesIndex];
        UI.renderStatsMensais(_mesAnoStr());
    }

    // Navegação de meses
    const btnPrev = document.getElementById('btn-mes-prev');
    const btnNext = document.getElementById('btn-mes-next');
    if (btnPrev) btnPrev.addEventListener('click', () => {
        mesIndex--;
        if (mesIndex < 0) { mesIndex = 11; anoAtual--; }
        _atualizar();
    });
    if (btnNext) btnNext.addEventListener('click', () => {
        mesIndex++;
        if (mesIndex > 11) { mesIndex = 0; anoAtual++; }
        _atualizar();
    });

    // Renderização inicial
    _atualizar();
}

// ─────────────────────────────────────────────────────────────
//  PÁGINA: teclado-valores.html
// ─────────────────────────────────────────────────────────────

function initTecladoValores() {
    const params = new URLSearchParams(window.location.search);
    const tipo   = params.get('tipo'); // 'ganho' | 'gasto'

    // Título dinâmico
    const titulo = document.getElementById('tituloTeclado');
    if (titulo) {
        titulo.textContent = tipo === 'ganho' ? 'Adicionar Ganho' : 'Adicionar Gasto';
    }

    // Para ganho: mostra campo de nome (escondido para gasto — nome vem na próxima tela)
    const campoNome = document.getElementById('campoNomeGanho');
    if (campoNome) campoNome.style.display = tipo === 'ganho' ? 'block' : 'none';

    // Substitui o confirmarValor() inline do HTML pelo handler real
    const btnConfirmar = document.getElementById('btn-confirmar');
    if (!btnConfirmar) return;

    btnConfirmar.onclick = () => {
        // Lê o valor calculado do visor (usando o valor já avaliado)
        const visorRes = document.getElementById('visorResultado');
        const textoVisor = visorRes ? visorRes.textContent : 'R$ 0,00';

        // Converte "R$ 1.234,56" → 1234.56
        const valorStr = textoVisor.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
        const valor = parseFloat(valorStr);

        if (!valor || valor <= 0) {
            _mostrarToast('O valor deve ser maior que zero!', 'error');
            return;
        }

        if (tipo === 'ganho') {
            // ── GANHO: captura nome e salva direto ──────────
            const inputNome  = document.getElementById('inputNomeGanho');
            const nome = inputNome?.value.trim() || `Ganho em ${new Date().toLocaleDateString('pt-BR')}`;

            try {
                BolsoDB.adicionarGanho({ nome, valor });
                _mostrarToast(`✅ Ganho de ${UI.moeda(valor)} registrado!`, 'success');
                setTimeout(() => window.location.href = '../dashboard/overview.html', 700);
            } catch (err) {
                _mostrarToast(err.message, 'error');
            }

        } else {
            // ── GASTO: salva temp e navega para categoria ──
            localStorage.setItem('valorTemporario', valor);
            window.location.href = 'escolher-categoria.html';
        }
    };
}

// ─────────────────────────────────────────────────────────────
//  PÁGINA: escolher-tipo-gasto.html
// ─────────────────────────────────────────────────────────────

function initEscolherTipo() {
    const valor    = parseFloat(localStorage.getItem('valorTemporario') ?? '0');
    const categoria = localStorage.getItem('categoriaTemporaria') ?? '';

    if (!valor || !categoria) {
        history.back();
        return;
    }

    // Exibe categoria no título
    const tituloEl = document.getElementById('categoriaDisplay');
    if (tituloEl) tituloEl.textContent = categoria;

    // Exibe valor resumido
    const valorEl = document.getElementById('valorDisplay');
    if (valorEl) valorEl.textContent = UI.moeda(valor);

    // Controla visibilidade do campo de parcelas
    const btnCredito  = document.getElementById('btn-credito');
    const btnDebito   = document.getElementById('btn-debito');
    const campoParcelas = document.getElementById('campoParcelas');

    if (btnCredito && campoParcelas) {
        btnCredito.addEventListener('click', () => {
            campoParcelas.style.display = 'block';
            // Remove estado ativo do débito
            btnDebito?.classList.remove('selected');
            btnCredito.classList.add('selected');
        });
    }
    if (btnDebito && campoParcelas) {
        btnDebito.addEventListener('click', () => {
            campoParcelas.style.display = 'none';
            btnCredito?.classList.remove('selected');
            btnDebito.classList.add('selected');
        });
    }

    // ── Botão Salvar (confirmar gasto) ───────────────────
    const btnSalvar = document.getElementById('btn-salvar-gasto');
    if (!btnSalvar) return;

    btnSalvar.addEventListener('click', () => {
        const inputNome     = document.getElementById('inputNomeGasto');
        const inputParcelas = document.getElementById('inputParcelas');
        const tipoSelecionado = btnCredito?.classList.contains('selected') ? 'credito' : 'debito';

        const nome     = inputNome?.value.trim() || `${categoria} em ${new Date().toLocaleDateString('pt-BR')}`;
        const parcelas = tipoSelecionado === 'credito' ? parseInt(inputParcelas?.value ?? '1', 10) : 1;

        if (tipoSelecionado === 'credito' && (isNaN(parcelas) || parcelas < 1 || parcelas > 36)) {
            _mostrarToast('Número de parcelas inválido (1-36).', 'error');
            return;
        }

        try {
            BolsoDB.adicionarGasto({ nome, valor, categoria, tipo: tipoSelecionado, parcelas });

            // Limpa temporários
            localStorage.removeItem('valorTemporario');
            localStorage.removeItem('categoriaTemporaria');

            const msg = tipoSelecionado === 'debito'
                ? `✅ Gasto de ${UI.moeda(valor)} registrado!`
                : `💳 Gasto de ${UI.moeda(valor)} em ${parcelas}x de ${UI.moeda(valor / parcelas)} registrado na fatura!`;

            _mostrarToast(msg, 'success');
            setTimeout(() => window.location.href = '../dashboard/overview.html', 800);

        } catch (err) {
            _mostrarToast(err.message, 'error');
        }
    });
}

// ─────────────────────────────────────────────────────────────
//  HELPERS DE UI GLOBAL
// ─────────────────────────────────────────────────────────────

/**
 * Fecha o action sheet e seu overlay.
 */
function _fecharActionSheet() {
    document.getElementById('actionSheet')?.classList.remove('active');
    document.getElementById('menuOverlay')?.classList.remove('active');
}

/**
 * Exibe um toast de feedback não-bloqueante.
 * Cria o elemento dinamicamente se #toast-container não existir.
 * @param {string} mensagem
 * @param {'success'|'error'|'info'} tipo
 * @param {number} [duracao=2500] ms antes de sumir
 */
function _mostrarToast(mensagem, tipo = 'info', duracao = 2500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `bd-toast bd-toast-${tipo}`;
    toast.textContent = mensagem;
    container.appendChild(toast);

    // Anima entrada
    requestAnimationFrame(() => toast.classList.add('visible'));

    // Remove após duração
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
    }, duracao);
}
