/**
 * Arquivo isolado de lógicas dinâmicas da tela de Perfil do Usuário
 * Issue #15 - Mock Database
 */

import { BolsoDB } from './database.js';

document.addEventListener("DOMContentLoaded", () => {  //Este evento apenas será lançado após o carregamento completo do HTML
    // Certificando inicialização do DB para consultar saldo real
    if (typeof BolsoDB !== 'undefined') {
        BolsoDB.init();
    }

    // 1. Mantemos o nome e avatar mockado, e deixamos o saldo reativo!
    const mockUserData = {
        nomeCompleto: "Matheus Ku",
        idFotoPerfil: "MK",
        saldo: (typeof BolsoDB !== 'undefined') ? BolsoDB.getSaldo() : 0,
        isAdmin: true
    };

    // 2. Localizamos os elementos do HTML que exibirão essas infos
    const elNomeUsuario = document.getElementById("nomeUsuario");
    const elSaldoPerfil = document.getElementById("saldoPerfil");
    const elUserAvatar = document.getElementById("userAvatar");

    // 3. Atualizamos os elementos da tela Profile Info com os dados
    if (elNomeUsuario) {
        elNomeUsuario.textContent = mockUserData.nomeCompleto;
    }

    if (elUserAvatar) {
        // Aproveitamos a mesma API visual só trocando o nome que passa pela url
        elUserAvatar.src = `https://ui-avatars.com/api/?name=${mockUserData.idFotoPerfil}&background=74ebd5&color=2c3e50&size=150`;
    }

    if (elSaldoPerfil) {
        // Formatador para Real BRL
        const formataBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
        elSaldoPerfil.textContent = "Saldo: " + formataBRL.format(mockUserData.saldo);
    }

    // 4. Adiciona o Alert nativo do avatar
    const btnAvatar = document.getElementById("btn-edit-avatar");
    if (btnAvatar) {
        btnAvatar.addEventListener('click', () => {
            alert('Funcionalidade de upload de foto será ativada futuramente!');
        });
    }

    // 5. Lógica da página "Gerenciar Categorias"
    const listaCategorias = document.getElementById('listaCategorias');
    if (listaCategorias && document.getElementById('novaCategoria')) {
        let catArr = ['Lazer', 'Transporte', 'Saúde', 'Alimentação', 'Moradia', 'Outros'];

        const renderizar = () => {
            listaCategorias.innerHTML = '';
            catArr.forEach((cat, i) => {
                listaCategorias.innerHTML += `
                    <div class="category-item">
                        <span class="category-name">${cat}</span>
                        <button class="cat-action-btn" data-index="${i}" aria-label="Remover ${cat}">
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>`;
            });
        };

        document.getElementById('btn-add-cat')?.addEventListener('click', () => {
            const input = document.getElementById('novaCategoria');
            const val = input.value.trim();
            if (!val) { alert('Digite um nome para a categoria.'); return; }
            catArr.push(val.charAt(0).toUpperCase() + val.slice(1));
            input.value = '';
            renderizar();
        });

        document.getElementById('novaCategoria')?.addEventListener('keypress', e => {
            if (e.key === 'Enter') document.getElementById('btn-add-cat').click();
        });

        listaCategorias.addEventListener('click', e => {
            const btn = e.target.closest('.cat-action-btn');
            if (btn) {
                const i = parseInt(btn.dataset.index, 10);
                if (confirm(`Apagar a categoria "${catArr[i]}"?`)) {
                    catArr.splice(i, 1);
                    renderizar();
                }
            }
        });

        renderizar();
    }
});
