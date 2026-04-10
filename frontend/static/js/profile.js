/**
 * Arquivo isolado de lógicas dinâmicas da tela de Perfil do Usuário
 * Issue #15 - Mock Database
 */

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
});
