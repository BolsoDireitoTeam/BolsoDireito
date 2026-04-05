// ============================================================
//  Bolso Direito — utils.js
//  Utilitários globais do app (Fase 1: navegação e helpers)
// ============================================================

/** Formata uma data para pt-BR longa. */
function FormatDate(date) {
    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Formata um número para moeda brasileira. */
function formatarMoeda(valor) {
    return 'R$ ' + Number(valor).toFixed(2).replace('.', ',');
}

/**
 * Alterna entre overview.html ↔ view-mensal.html.
 * Usado pelo botão "Painel" na bottom-nav.
 */
function toggleViews() {
    const path = window.location.pathname;
    if (path.includes('overview.html')) {
        window.location.href = 'view-mensal.html';
    } else if (path.includes('view-mensal.html') ) {
        window.location.href = 'view-anual.html';
    } else {
        window.location.href = '../dashboard/overview.html';
    }
}

/**
 * Abre/fecha o Action Sheet e seu overlay.
 * Os IDs padrão são: 'actionSheet' e 'menuOverlay'.
 */
function toggleMenu() {
    const sheet   = document.getElementById('actionSheet');
    const overlay = document.getElementById('menuOverlay');
    if (sheet)   sheet.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}