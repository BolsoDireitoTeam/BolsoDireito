// ============================================================
//  Bolso Direito — app.js
//  Controlador de Páginas — Fase 4
//  Depende de: database.js → engine.js → ui.js (nessa ordem)
//
//  Detecta a página pelo atributo data-page no <body> e executa
//  apenas o código relevante. Wires todos os eventos de UI.
// ============================================================

'use strict';

import { BolsoDB } from './database.js';
import { BolsoEngine } from './engine.js';
import { UI } from './ui.js';
import { toggleMenu } from '../../utils.js';

// ─────────────────────────────────────────────────────────────
//  INICIALIZAÇÃO GLOBAL STRINGS e EVENT DELEGATION
//  Executado em TODAS as páginas que carregam este script.
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    // Escuta global para navegação em arquivos limpos
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, .upload-area, .action-sheet-overlay');
        if (!btn) return;

        if (btn.dataset.href) {
            window.location.href = btn.dataset.href;
            return;
        }

        const action = btn.dataset.action;
        if (action === 'back') history.back();
        if (action === 'toggle-menu') toggleMenu();
        if (action === 'toggle-views') toggleViews();
    });
    // 1 - Injeta Layouts Universais (Custom Elements) assincronamente
    await _injectFooter();

    // 2 - Inicializa o banco de dados local (carrega do localStorage)
    BolsoDB.init();

    // 3 - Detecta qual página está ativa
    const page = document.body.dataset.page ?? ''; //estamos tentando acessar o atributo "data-page" do objeto "body" e, caso ele não exista, atribuímos o valor "".

    switch (page) { // String vazia "" é convertida para "false" no contexto de uma estrutura condicional
        // Apenas precisamos nos preocupar caso alguma destas páginas esteja ativa, posto que daí teremos que destacar o ícone presente no rodapé da página.
        case 'overview': initOverview(); break;
        case 'view-mensal': initViewMensal(); break;
        case 'view-anual': initViewAnual(); break;
        case 'teclado-valores': initTecladoValores(); break;
        case 'escolher-tipo': initEscolherTipo(); break;
        case 'escolher-categoria': initEscolherCategoria(); break;
        case 'upload-extrato': initUploadExtrato(); break;
        case 'upload-fatura': initUploadFatura(); break;
        default: break;
    }
});

// ─────────────────────────────────────────────────────────────
//  PÁGINA: overview.html
// ─────────────────────────────────────────────────────────────

export function initOverview() {
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

export function initViewMensal() {
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
//  PÁGINA: view-anual.html
// ─────────────────────────────────────────────────────────────

export function initViewAnual() {
    // Chart.js é carregado via CDN no <head> do HTML (variável global Chart)
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Roboto', sans-serif";
        Chart.defaults.color = '#7f8c8d';
    }

    let anoAtual = new Date().getFullYear();
    const anoDisplay = document.getElementById('anoAtual');
    if (anoDisplay) anoDisplay.innerText = anoAtual;

    // Criação do gráfico de barras anual
    const canvas = document.getElementById('anualChart');
    if (canvas && typeof Chart !== 'undefined') {
        new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [{
                    label: 'Gastos',
                    data: [2800, 2600, 3100, 2900, 3200, 2700, 1900, 3000, 3100, 3500, 4000, 5200],
                    backgroundColor: '#ACB6E5',
                    borderRadius: 6,
                    barPercentage: 0.7
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, display: false },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Navegação de anos
    function mudarAno(dir) {
        anoAtual += dir;
        if (anoDisplay) anoDisplay.innerText = anoAtual;
    }

    const btnPrev = document.getElementById('btn-ano-prev');
    const btnNext = document.getElementById('btn-ano-next');
    if (btnPrev) btnPrev.addEventListener('click', () => mudarAno(-1));
    if (btnNext) btnNext.addEventListener('click', () => mudarAno(1));
}

// ─────────────────────────────────────────────────────────────
//  PÁGINA: teclado-valores.html
// ─────────────────────────────────────────────────────────────

export function initTecladoValores() {
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

    // -- Lógica da Calculadora --
    let expressao = '';
    const visorEq = document.getElementById('visorEquacao');
    const visorRes = document.getElementById('visorResultado');

    function formatar(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }

    function atualizar() {
        if (visorEq) visorEq.innerText = expressao || '0';
        try {
            let expr = expressao.replaceAll(",", ".");
            if (/[+\-]$/.test(expr)) expr = expr.slice(0, -1);
            if (expr) {
                if (visorRes) visorRes.innerText = formatar(eval(expr));
            } else {
                if (visorRes) visorRes.innerText = 'R$ 0,00';
            }
        } catch (e) {
            if (visorRes) visorRes.innerText = 'Err';
            if (visorEq) visorEq.innerText = 'Err';
        }
    }

    function inserir(c) {
        const last = expressao.slice(-1);
        if (['+', '-'].includes(c) && ['+', '-'].includes(last)) return;
        expressao += c;
        atualizar();
    }

    function apagar() { expressao = expressao.slice(0, -1); atualizar(); }
    function limpar() { expressao = ''; atualizar(); }

    function calcular() {
        try {
            let expr = expressao.replace(/,/g, '.');
            expressao = eval(expr).toString().replace('.', ',');
            atualizar();
        } catch (e) {
            alert('Expressão inválida');
        }
    }

    const calcKeypad = document.querySelector('.calc-keypad');
    if (calcKeypad) {
        calcKeypad.addEventListener('click', (e) => {
            const btn = e.target.closest('.calc-btn');
            if (!btn) return;
            const action = btn.dataset.calc;
            if (action === 'inserir') inserir(btn.dataset.val);
            else if (action === 'apagar') apagar();
            else if (action === 'calcular') calcular();
            else if (action === 'limpar') limpar();
        });
    }

    if (!btnConfirmar) return;

    btnConfirmar.addEventListener('click', () => {
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
    });
}

// ─────────────────────────────────────────────────────────────
//  PÁGINA: escolher-categoria.html
// ─────────────────────────────────────────────────────────────

export function initEscolherCategoria() {
    const valor = localStorage.getItem('valorTemporario');
    if (valor) {
        const valorDisplay = document.getElementById('valorDisplay');
        if (valorDisplay) valorDisplay.innerText = 'R$ ' + parseFloat(valor).toFixed(2).replace('.', ',');
    } else {
        alert('Nenhum valor definido. Voltando...');
        window.location.href = 'teclado-valores.html?tipo=gasto';
        return;
    }

    const categorias = ['Lazer', 'Transporte', 'Saúde', 'Alimentação', 'Moradia', 'Outros'];
    const lista = document.getElementById('listaCategorias');
    if (lista) {
        categorias.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'menu-btn-wide';
            btn.textContent = cat;
            lista.appendChild(btn);
        });

        lista.addEventListener('click', (e) => {
            const btn = e.target.closest('.menu-btn-wide');
            if (btn) {
                localStorage.setItem('categoriaTemporaria', btn.textContent);
                window.location.href = 'escolher-tipo-gasto.html';
            }
        });
    }
}

// ─────────────────────────────────────────────────────────────
//  PÁGINA: upload-extrato / upload-fatura
// ─────────────────────────────────────────────────────────────

export function initUploadExtrato() {
    _initGenericoUpload('extrato.csv', '../dashboard/overview.html', 'Lendo movimentações da conta corrente...\n\n(Na Fase 4, isso atualizará o Saldo e o Extrato automaticamente!)');
}

export function initUploadFatura() {
    _initGenericoUpload('fatura.csv', '../dashboard/overview.html', 'Lendo colunas e processando o arquivo...\n\n(Na Fase 4, isso transformará os dados em gastos na tela de Overview!)');
}

function _initGenericoUpload(defaultFileName, redirectUrl, alertMsg) {
    function toggleTutorial() {
        const content = document.getElementById('tutorialContent');
        const icon = document.getElementById('chevronIcon');
        if (!content || !icon) return;
        content.classList.toggle('active');
        icon.style.transform = content.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    function handleFile(e) {
        const file = e.target.files[0];
        const zone = document.getElementById('dropZone');
        const fb = document.getElementById('fileFeedback');
        if (!file) return;
        if (!file.name.endsWith('.csv')) {
            alert('Selecione apenas arquivos .csv');
            e.target.value = '';
            return;
        }
        const fileNameEl = document.getElementById('fileName');
        if (fileNameEl) fileNameEl.innerText = file.name;
        if (fb) fb.style.display = 'flex';
        if (zone) {
            zone.style.borderColor = 'var(--bd-primary)';
            zone.style.background = '#f0fdfa';
        }
    }

    function processarFile() {
        const input = document.getElementById('csvInput');
        if (!input || !input.files.length) { alert('Anexe um arquivo primeiro!'); return; }
        alert(alertMsg);
        window.location.href = redirectUrl;
    }

    const btnTutorial = document.getElementById('btn-tutorial');
    if (btnTutorial) btnTutorial.addEventListener('click', toggleTutorial);

    const dropZone = document.getElementById('dropZone');
    const csvInput = document.getElementById('csvInput');
    if (dropZone && csvInput) {
        dropZone.addEventListener('click', () => csvInput.click());
        csvInput.addEventListener('change', handleFile);
    }

    const btnProcessar = document.getElementById('btn-processar');
    if (btnProcessar) btnProcessar.addEventListener('click', processarFile);
}

// ─────────────────────────────────────────────────────────────
//  PÁGINA: escolher-tipo-gasto.html
// ─────────────────────────────────────────────────────────────

export function initEscolherTipo() {
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
 * Injeta o Action Sheet e o Bottom Nav em tags <bd-footer>.
 * Busca de arquivo HTML externo e manipulação virtual
 * para injeção programática de estados antes de afetar o DOM real.
 */
async function _injectFooter() {
    const bdFooterTag = document.querySelector('bd-footer'); //busca a tag html <bd-footer>
    if (!bdFooterTag) return;

    // Identifica a página atual (overview, transacoes, perfil, configuracao)
    const activePage = bdFooterTag.getAttribute('active-page') || '';

    try {
        // 1. Fetching Assíncrono: Busca o HTML base do rodapé no servidor local
        // Foi preciso trocar footer.html por footer.txt para que o fetch funcionasse enquanto estivessemos utilizando da extensão do Live Server!
        const response = await fetch('../../components/footer.txt');
        //O conteúdo abaixo só é executado quando o fetch tiver retornado!
        //...
        if (!response.ok) throw new Error('Falha ao buscar footer.html');

        // Extrai o texto puro da requisição HTTP
        const htmlStr = await response.text();

        //Este conteúdo abaixo é apenas executado quando o response.text() tiver sido retornado!
        //...

        // 2. Criação do DOM Virtual: Parser lê a string "morta" e converte numa árvore de elementos real
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlStr, 'text/html');

        // 3. Estilização Dinâmica: Adiciona a classe '.active' visualmente baseando-se no contexto atual.
        // Este trecho de código if..else abaixo faz com que consigamos sinalizar, por meio de uma cor,
        // o item do menu inferior que deve ficar em evidência de acordo com a página que estivermos navegando.
        if (activePage === 'overview') {
            doc.getElementById('nav-painel')?.classList.add('active');
            // A adição desta classe fará com que o CSS consiga identificar que deve aplicar uma diferenciação de cor.
        } else if (activePage === 'perfil') {
            doc.getElementById('nav-perfil')?.classList.add('active');
        }

        // 4. Injeção Final: Transfere a árvore preenchida e manipulada para a tela do usuário
        bdFooterTag.innerHTML = doc.body.innerHTML;

        // 5. Acoplamento de Ações: Conecta Event Listeners da UI injetada agora que ela existe fisicamente
        document.getElementById('menuOverlay')?.addEventListener('click', () => { toggleMenu(); });
        document.getElementById('btn-novo-ganho')?.addEventListener('click', () => { window.location.href = '../transacoes/teclado-valores.html?tipo=ganho'; });
        document.getElementById('btn-novo-gasto')?.addEventListener('click', () => { window.location.href = '../transacoes/teclado-valores.html?tipo=gasto'; });
        document.getElementById('btn-importar-extrato')?.addEventListener('click', () => { window.location.href = '../upload/extrato-upload.html'; });
        document.getElementById('btn-importar-fatura')?.addEventListener('click', () => { window.location.href = '../upload/fatura-upload.html'; });
        document.getElementById('nav-painel')?.addEventListener('click', () => { window.location.href = '../dashboard/overview.html'; });
        document.getElementById('nav-add')?.addEventListener('click', () => { toggleMenu(); });
        document.getElementById('nav-perfil')?.addEventListener('click', () => { window.location.href = '../profile/usuario.html'; });

    } catch (err) {
        console.error('[App] Erro crítico ao injetar footer isolado:', err);
    }
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
