// transacoes.js
// Javascript de Controle Específico para a Tela "lista-transacoes.html"
// Integra com ui.js e database.js

// Variáveis de Estado Internos do Filtro
let stateFiltroMes = "";
let stateFiltroCategoria = "Todas as categorias";
//console.log(window.stateFiltroCategoria); //output: undefined //isto ocorre porque ao declarar as variáveis com "let", você está garantindo que elas possuem um escopo próprio e não devem ser definidas como atributos do objeto global window.

document.addEventListener("DOMContentLoaded", () => {
    // Sempre se certificar que o Motor está inicializado perante a navegação direta
    if (typeof BolsoDB !== 'undefined') {
        BolsoDB.init(); //FIXME: Verificar se, no caso da renderização de "lista-transacoes.html", esta inicialização é realmente necessário, visto que o mesmo código já foi executado por "app.js", script o qual estaria sendo executado antes deste.

        stateFiltroMes = UI.mesAtual(); // Exemplo de valor: "2026-04"

        // Povoando Select Modal dinamicamente baseado na data de hoje
        construirModalMeses();

        // Roda a renderização inicial
        renderizarTransacoes();
    } else {
        console.error("BolsoDB não carregado. Verifique os imports estáticos nas tags scripts.");
    }
});

function construirModalMeses() {
    const selectStr = document.getElementById("filtroSelectMes");
    if (!selectStr) return;

    selectStr.innerHTML = "";
    const d = new Date();

    // Gerar últimos 6 meses
    for (let i = 0; i < 6; i++) {
        const aux = new Date(d.getFullYear(), d.getMonth() - i, 1); // Caso venhamos a ter o argumento de meses com valores negativos, o construtor é capaz de transformar estes em meses do ano anterior, fazendo com que a data aponte para um ano anterior ao que estivermos analisando.
        const refMes = String(aux.getMonth() + 1).padStart(2, '0');
        const refAno = aux.getFullYear();
        const strFormato = `${refAno}-${refMes}`;

        const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const nomeFinal = `${nomes[aux.getMonth()]} ${refAno}`;

        const op = document.createElement("option"); // Irá criar as respectivas tags <option> que irão descrever quais filtros poderão ser aplicados dentro da respectiva seleção
        op.value = strFormato;
        op.textContent = nomeFinal;

        // Mantém o atual selecionado
        if (i === 0) {
            op.selected = true; //Mantém o mês atual como filtro principal que estará selecionado quando abrirmos a seleção.

            // Garante que o mês atual seja exibido no botão de acionamento do filtro
            document.getElementById('mesSelectLabel').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>` + nomeFinal;

        }

        selectStr.appendChild(op); // Adiciona a tag <option> criada como filha da tag <select> já existente.
    }
}

// Interações do Modal de Filtros invocadas pelos botões "Aplicar" e "Resetar"
window.aplicarFiltrosModal = function () {
    stateFiltroMes = document.getElementById('filtroSelectMes').value;
    stateFiltroCategoria = document.getElementById('filtroSelectCategoria').value;

    const textoMes = document.getElementById('filtroSelectMes').options[document.getElementById('filtroSelectMes').selectedIndex].text;
    document.getElementById('mesSelectLabel').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>` + textoMes;

    renderizarTransacoes();
}

window.limparFiltros = function () {
    //Ao limpar os filtros, devemos configurar um padrão para o mês atual e para a categoria "Todas as categorias"
    document.getElementById('filtroSelectMes').selectedIndex = 0; // Volta a HOJE
    document.getElementById('filtroSelectCategoria').value = "Todas as categorias";
    aplicarFiltrosModal(); // Aplica automaticamente após limpar
}

// Motor Mestre de Renderização de UI (Mobile-First) via BolsoDB
function renderizarTransacoes() {
    const listContainer = document.getElementById("listaTransacoesContainer");
    const balancoDisplay = document.getElementById("balancoPeriodoDisplay");
    const receitasDisplay = document.getElementById("receitasDisplay");
    const despesasDisplay = document.getElementById("despesasDisplay");
    const badgeFiltro = document.getElementById("badgeFiltroAtivo");

    if (!listContainer) return;

    // Transações reais unificadas
    const transacoesTotais = BolsoDB.getTransacoes();

    // 1º Passo: Aplica o filtro de Data (Mês) e Categoria em cima do Array Total
    let doMes = transacoesTotais.filter(e => e.data && e.data.startsWith(stateFiltroMes));

    // Condicionais Secundárias (Categorização e Grupos)
    badgeFiltro.classList.remove("d-none"); // mostra UI de alerta logico

    if (stateFiltroCategoria === "Apenas ganhos") {
        badgeFiltro.textContent = "Apenas Ganhos";
        doMes = doMes.filter(e => e.tipo === 'ganho');
    } else if (stateFiltroCategoria === "Apenas gastos") {
        badgeFiltro.textContent = "Apenas Gastos";
        doMes = doMes.filter(e => e.tipo === 'gasto');
    } else if (stateFiltroCategoria !== "Todas as categorias") {
        badgeFiltro.textContent = stateFiltroCategoria;
        // Filtragem direta por Categoria preenchida
        doMes = doMes.filter(e => e.categoria === stateFiltroCategoria);
    } else {
        badgeFiltro.textContent = "Todas as categorias";
        // Sem filtro adicional
    }

    // 2º Passo: Calcula os Agregados com base unicamente naquilo que sobrou no filtro atual
    let receitas = 0;
    let despesas = 0;

    doMes.forEach(e => {
        if (e.tipo === 'ganho') receitas += e.valor;
        if (e.tipo === 'gasto') despesas += e.valor;
    });

    const balanco = receitas - despesas;

    // Header Injectors
    if (balancoDisplay) {
        // Remove cor existente (caso toggle antigo fique travado)
        balancoDisplay.parentElement.classList.remove('text-bd-success', 'text-warning');

        balancoDisplay.textContent = UI.moeda(Math.abs(balanco));
        if (balanco >= 0) balancoDisplay.parentElement.classList.add('text-bd-success');
        else balancoDisplay.parentElement.classList.add('text-warning');
        // Usando CSS Base color p/ negativo e positivo
    }

    if (receitasDisplay) receitasDisplay.textContent = `Receitas: ${UI.moeda(receitas)}`;
    if (despesasDisplay) despesasDisplay.textContent = `Despesas: ${UI.moeda(despesas)}`;

    // Refresh da Timeline
    listContainer.innerHTML = doMes.length === 0
        ? `<li class="transacao-vazia" style="text-align:center; padding:2rem; color:#888;"><p>Ainda não há lançamentos neste período.</p></li>`
        : '';

    // Injetor de Blocos Individuais com função CRUD associada
    for (const item of doMes) {
        const isGanho = item.tipo === 'ganho';
        const sinal = isGanho ? '+' : '-';
        const corHex = isGanho ? '#28a745' : '#dc3545';
        const bgHex = isGanho ? '#e8f5e9' : '#fce8e8';

        // Puxa svg com shape generico
        const svgIcon = isGanho ?
            `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>` :
            `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

        // Atribuição da operação de Exclusão e Edição 
        // Estas funções serão atribuídas ao atributo onClick de cada Transação que for exibida
        // O acionamento da deleção/edição será feito mediante ao clique
        const deleteHandler = isGanho ? `removerTransacao('${item.id}', 'ganho')` : `removerTransacao('${item.id}', 'gasto')`;
        const editHandler = `abrirModalEdicao('${item.id}')`;

        // Aqui estamos adicionando cada transação individual a nossa lista de transações, a qual é descrita dentro do arquivo lista-transacoes.html.
        // Preste muita atenção às variáveis que são passadas como argumentos dos atributos de cada tag que está sendo construída dentro da string abaixo.
        const li = document.createElement('li');
        li.style.cssText = `border-left: 4px solid ${corHex}; background: #fff; padding: 12px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,0.05);`;
        li.innerHTML = `
            <div style="display:flex; align-items:center; gap: 12px;">
                <div style="background:${bgHex}; border-radius:50%; min-width: 38px; height: 38px; display:flex; align-items:center; justify-content:center; color:${corHex};">
                    ${svgIcon}
                </div>
                <!-- Limite ellipsis no titulo p mobile -->
                <div style="max-width: 130px;">
                    <div style="font-weight:600; color:#1e1e1e; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.nome}">${item.nome}</div>
                    <div style="font-size:0.75rem; color:#888;">${item.data.split('-').reverse().join('/')} • ${item.categoria || (isGanho ? 'Receita' : 'Despesa')}</div>
                </div>
            </div>
            <div class="d-flex align-items-center gap-2">
                <div style="font-weight:bold; color:${corHex}; font-size: 0.95rem; text-align: right;">${sinal} ${UI.moeda(item.valor)}</div>
                <!-- Editar e Deletar Exclusivos em Telas Viewers -->
                <div class="d-flex align-items-center gap-2 ms-1">
                    <!-- Botão de Editar -->
                    <button class="btn btn-sm btn-link text-primary p-0 m-0 opacity-75" onclick="${editHandler}" data-bs-toggle="modal" data-bs-target="#modalEditar" title="Editar lançamento">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button> 
                    <!-- Botão de Deletar -->
                    <button class="btn btn-sm btn-link text-danger p-0 m-0 opacity-75" onclick="${deleteHandler}" title="Excluir lançamento">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            </div>
        `;
        listContainer.appendChild(li);
    }
}

// Exportação global (para inline html onClick events)
// Ao definirmos estas funções globalmente, podemos chamá-las diretamente no HTML sem precisar nos preocupar com escopo.
window.removerTransacao = function (id, type) {
    if (confirm("🚨 Tem certeza que deseja apagar essa transação permanente? Esse valor irá refletir o seu saldo principal.")) {
        if (type === 'gasto') {
            const arr = BolsoDB.getTransacoes();
            const obj = arr.find(e => e.id === id);
            if (obj && obj.subtipo === 'credito') {
                BolsoDB.removerGastoCredito(id);
            } else {
                BolsoDB.removerGastoDebito(id);
            }
        } else {
            BolsoDB.removerGanho(id);
        }
        // UI Repaint - Efeito Fluid
        renderizarTransacoes();
    }
}

window.abrirModalEdicao = function (id) {
    const arr = BolsoDB.getTransacoes();
    const trx = arr.find(e => e.id === id);
    if (!trx) return;

    // Seta o ID Oculto no html
    document.getElementById('editTransacaoId').value = id;

    // Popula campos textuais
    document.getElementById('editTransacaoNome').value = trx.nome;
    document.getElementById('editTransacaoValor').value = trx.valor.toFixed(2);

    // Tratamento de Categoria visual
    const seletorCat = document.getElementById('editContainerCategoria');
    const inputCat = document.getElementById('editTransacaoCategoria');
    if (trx.tipo === 'ganho') {
        seletorCat.style.display = 'none';
    } else {
        seletorCat.style.display = 'block';
        inputCat.value = trx.categoria || 'Outros';
    }

    // Trava Visual de Crédito (Integração com DB)
    const inputValor = document.getElementById('editTransacaoValor');
    const avisoCredito = document.getElementById('editAvisoCredito');
    if (trx.subtipo === 'credito') {
        inputValor.setAttribute('disabled', 'true');
        avisoCredito.style.display = 'block';
    } else {
        inputValor.removeAttribute('disabled');
        avisoCredito.style.display = 'none';
    }
}

window.salvarEdicaoModal = function () {
    const id = document.getElementById('editTransacaoId').value;
    const nome = document.getElementById('editTransacaoNome').value;
    const valor = parseFloat(document.getElementById('editTransacaoValor').value);
    const categoria = document.getElementById('editTransacaoCategoria').value;

    if (!nome || isNaN(valor) || valor <= 0) {
        alert("🚨 Por favor, preencha um título e um valor válido superior a zero!");
        return;
    }

    const payload = { nome, valor, categoria };

    // Envia para o motor de estado global (calculo matemático de delta acontece la dentro)
    if (BolsoDB.editarTransacao(id, payload)) {
        // UI Repaint - Efeito Fluid instantâneo na listagem
        renderizarTransacoes();
    } else {
        alert("Houve um problema ao editar a transação.");
    }
}
