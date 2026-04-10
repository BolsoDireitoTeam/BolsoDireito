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
    // 1 - Injeta Layouts Universais (Custom Elements)
    _injectFooter();

    // 2 - Inicializa o banco de dados local (carrega do localStorage)
    BolsoDB.init();

    // 3 - Detecta qual página está ativa
    const page = document.body.dataset.page ?? ''; //estamos tentando acessar o atributo "data-page" do objeto "body" e, caso ele não exista, atribuímos o valor "".

    switch (page) { // String vazia "" é convertida para "false" no contexto de uma estrutura condicional
        // Apenas precisamos nos preocupar caso alguma destas páginas esteja ativa, posto que daí teremos que destacar o ícone presente no rodapé da página.
        case 'overview': initOverview(); break;
        case 'view-mensal': initViewMensal(); break;
        case 'teclado-valores': initTecladoValores(); break;
        case 'escolher-tipo': initEscolherTipo(); break;
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
            const agora = new Date();
            const mesAlvo = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
            const nomeMes = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

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
        'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
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
    const tipo = params.get('tipo'); // 'ganho' | 'gasto'

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
            const inputNome = document.getElementById('inputNomeGanho');
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
    const valor = parseFloat(localStorage.getItem('valorTemporario') ?? '0');
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
    const btnCredito = document.getElementById('btn-credito');
    const btnDebito = document.getElementById('btn-debito');
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
        const inputNome = document.getElementById('inputNomeGasto');
        const inputParcelas = document.getElementById('inputParcelas');
        const tipoSelecionado = btnCredito?.classList.contains('selected') ? 'credito' : 'debito';

        const nome = inputNome?.value.trim() || `${categoria} em ${new Date().toLocaleDateString('pt-BR')}`;
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
//  HELPERS DE UI E COMPONENTIZAÇÃO DE LAYOUT GLOBAL
// ─────────────────────────────────────────────────────────────

/**
 * Injeta o Action Sheet e o Bottom Nav em tags <bd-footer>
 */
function _injectFooter() {
    const bdFooterTag = document.querySelector('bd-footer');
    if (!bdFooterTag) return;

    // Identifica a página atual (overview, transacoes, perfil, configuracao)
    const activePage = bdFooterTag.getAttribute('active-page') || '';

    // Template fixo contendo Overlay + FormSheet + NavGlobal
    const htmlString = `
    <!-- Action Sheet Overlay -->
    <div class="action-sheet-overlay" id="menuOverlay" onclick="typeof toggleMenu === 'function' ? toggleMenu() : _fecharActionSheet()"></div>

    <!-- Action Sheet Form -->
    <div class="action-sheet" id="actionSheet">
        <h3 style="margin-bottom: 24px; text-align: center; color: #333; font-size: 1.1rem;">O que deseja registrar?</h3>
        <div class="action-grid">
            <button class="action-btn" id="btn-novo-ganho" onclick="window.location.href='../transacoes/teclado-valores.html?tipo=ganho'">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Novo Ganho
            </button>
            <button class="action-btn" id="btn-novo-gasto" onclick="window.location.href='../transacoes/teclado-valores.html?tipo=gasto'">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Novo Gasto
            </button>
            <button class="action-btn" id="btn-importar-extrato" onclick="window.location.href='../upload/extrato-upload.html'">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Importar Extrato
            </button>
            <button class="action-btn" id="btn-importar-fatura" onclick="window.location.href='../upload/fatura-upload.html'">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
                Importar Fatura
            </button>
            ${activePage === 'overview' ? `
            <button class="action-btn" id="btn-virar-mes" style="grid-column: 1 / -1;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Virar Mês
            </button>
            ` : ''}
        </div>
    </div>

    <!-- Bottom Nav Engine -->
    <nav class="bottom-nav">
        <button class="nav-btn ${activePage === 'overview' ? 'active' : ''}" id="nav-painel" onclick="window.location.href='../dashboard/overview.html'">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Painel</span>
        </button>

        <button class="nav-btn-add" id="nav-add" onclick="typeof toggleMenu === 'function' ? toggleMenu() : alert('Action Menu requisitado')" aria-label="Adicionar">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        </button>

        <button class="nav-btn ${activePage === 'perfil' ? 'active' : ''}" id="nav-perfil" onclick="window.location.href='../profile/usuario.html'">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Perfil</span>
        </button>
    </nav>`;

    bdFooterTag.innerHTML = htmlString;
}

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
