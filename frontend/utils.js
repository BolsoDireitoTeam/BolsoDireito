// --- Função Original (mantida) ---
function FormatDate(date) {
    return date.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

// --- Lógica Global do App ---

// 1. Função para carregar componentes HTML dinamicamente
function carregarFooter() {
    const placeholder = document.getElementById('footer-placeholder');
    
    if (placeholder) {
        // Busca o arquivo HTML do footer
        fetch('../../components/footer.html')
            .then(response => {
                if (!response.ok) throw new Error("Erro de requisição. Você está usando o Live Server?");
                return response.text();
            })
            .then(html => {
                placeholder.innerHTML = html;
            })
            .catch(erro => console.error("Erro ao injetar o Footer:", erro));
    }
}

// 2. Funções de interação do Footer (agora acessíveis de qualquer lugar)
function toggleViews() {
    const path = window.location.pathname;
    if (path.includes('overview.html')) {
        window.location.href = 'view-mensal.html';
    } else {
        window.location.href = 'overview.html';
    }
}

function toggleMenu() {
    const overlay = document.getElementById('actionOverlay');
    const sheet = document.getElementById('actionSheet');
    
    if(overlay && sheet) {
        overlay.classList.toggle('active');
        sheet.classList.toggle('active');
    }
}

// 3. Executa a carga do footer assim que a página carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarFooter();
});