// ============================================================
//  Bolso Direito — auth.js
//  Controlador de Autenticação (Login e Criação de Conta)
//
//  Este módulo é isolado do app.js pois as páginas de login
//  não carregam o sistema BolsoDB/Engine/UI — o usuário ainda
//  não está autenticado.
// ============================================================

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // ─── LOGIN ───────────────────────────────────────────
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const senha = document.getElementById('senha').value;
            if (senha) window.location.href = '../dashboard/overview.html';
        });
    }

    // ─── CRIAÇÃO DE CONTA ────────────────────────────────
    const criarContaForm = document.getElementById('criarContaForm');
    if (criarContaForm) {
        criarContaForm.addEventListener('submit', (e) => {

            e.preventDefault();
            // A ação default de recarregamento da página e envio automático dos dados ao servidor atrelada ao tipo "submit" é cancelada

            const senha = document.getElementById('senha').value;
            const confirmar = document.getElementById('confirmar_senha').value;
            if (senha !== confirmar) {
                alert('As senhas não coincidem. Tente novamente!');
                return;
            }
            alert('Conta criada com sucesso!');
            window.location.href = './login.html';
        });
    }
});
