/* static/script.js - Versão Definitiva Dark Mode */

const API_URL = "/api";
let todosProdutos = [];
let produtosAgrupados = {};
let filtroAtual = "Tudos";

document.addEventListener("DOMContentLoaded", carregarProdutos);

// --- 1. CARREGAR E AGRUPAR DADOS (Lógica FIFO) ---
async function carregarProdutos() {
    try {
        const response = await fetch(`${API_URL}/listar`);
        const data = await response.json();
        todosProdutos = data;
        agruparPorCodigo();
        atualizarTela();
    } catch (error) {
        console.error("Erro ao carregar:", error);
        document.getElementById('lista-produtos').innerHTML = 
            "<p style='text-align:center; padding:20px; color:#666;'>Erro de conexão com o servidor.</p>";
    }
}

function agruparPorCodigo() {
    produtosAgrupados = {};
    
    todosProdutos.forEach(p => {
        if (!produtosAgrupados[p.codigo]) {
            produtosAgrupados[p.codigo] = {
                nome: p.nome,
                codigo: p.codigo,
                imagem: p.imagem,
                categoria: p.categoria,
                preco: p.preco,
                totalQtd: 0,
                lotes: []
            };
        }
        produtosAgrupados[p.codigo].lotes.push(p);
        produtosAgrupados[p.codigo].totalQtd += p.qtd;
    });

    // Ordena FIFO (Primeiro que vence é o primeiro da lista)
    for (let cod in produtosAgrupados) {
        produtosAgrupados[cod].lotes.sort((a, b) => new Date(a.validade) - new Date(b.validade));
    }
}

// --- 2. FILTRAR E ATUALIZAR TELA ---
function filtrar(categoria) {
    filtroAtual = categoria;
    
    // Atualiza botões visuais
    const botoes = document.querySelectorAll('.cat-btn');
    botoes.forEach(btn => {
        const comando = btn.getAttribute('onclick');
        // Verifica se o botão clicado corresponde à categoria
        if(comando && comando.includes(`'${categoria}'`)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    atualizarTela();
}

function atualizarTela() {
    const div = document.getElementById('lista-produtos');
    if (!div) return; // Proteção contra erro se o HTML mudar
    
    div.innerHTML = "";
    let listaExibicao = Object.values(produtosAgrupados);

    if (filtroAtual !== "Tudos") {
        listaExibicao = listaExibicao.filter(g => g.categoria === filtroAtual);
    }

    if (listaExibicao.length === 0) {
        div.innerHTML = `<div style="text-align:center; padding:50px; color:#666;">
                            <i class="fas fa-box-open" style="font-size:3rem; margin-bottom:10px;"></i>
                            <p>Nenhum produto encontrado.</p>
                         </div>`;
        return;
    }

    listaExibicao.forEach(grupo => {
        let proximoVencer = grupo.lotes[0]; 
        
        // Define status visual
        let classeStatus = "status-green"; // Borda Verde
        let badgesHtml = "";
        
        if (proximoVencer.status_val === 'vencido') {
            classeStatus = "status-red";
            badgesHtml = `<span class="badge bg-red">VENCIDO</span>`;
        } else if (proximoVencer.status_val === 'perigo') {
            classeStatus = "status-red";
            badgesHtml = `<span class="badge bg-red">Vence em ${proximoVencer.dias_vencimento}d</span>`;
        } else if (proximoVencer.status_val === 'atencao') {
            classeStatus = "status-yellow";
            badgesHtml = `<span class="badge bg-orange">Atenção</span>`;
        }

        // Se tiver imagem real, usa. Se não, ícone padrão.
        let imgHtml = grupo.imagem 
            ? `<img src="/uploads/${grupo.imagem}" class="prod-img">` 
            : `<div class="prod-icon"><i class="fas fa-box"></i></div>`;

        div.innerHTML += `
            <div class="card-produto ${classeStatus}" onclick='abrirDetalhes("${grupo.codigo}")'>
                <div class="img-area">${imgHtml}</div>
                <div class="info-area">
                    <h3>${grupo.nome}</h3>
                    <div class="card-badges">${badgesHtml}</div>
                    <small>${grupo.lotes.length} Lotes | Próx: ${formatData(proximoVencer.validade)}</small>
                </div>
                <div class="price-tag">
                    <div style="font-size:0.7rem; color:#888; font-weight:normal;">Qtd</div>
                    ${grupo.totalQtd}
                </div>
            </div>
        `;
    });
}

// --- 3. GERENCIAMENTO DE MODAIS ---

function abrirDetalhes(codigo) {
    const grupo = produtosAgrupados[codigo];
    const modal = document.getElementById('modal-detalhes');
    
    document.getElementById('detalhe-titulo').innerText = grupo.nome;
    document.getElementById('detalhe-total').innerText = grupo.totalQtd;
    
    const listaLotes = document.getElementById('lista-lotes');
    listaLotes.innerHTML = "";
    
    grupo.lotes.forEach(lote => {
        let icone = '<i class="fas fa-check-circle" style="color:var(--success)"></i>';
        if(lote.status_val === 'vencido') icone = '<i class="fas fa-times-circle" style="color:var(--danger)"></i>';
        else if(lote.status_val === 'perigo') icone = '<i class="fas fa-exclamation-circle" style="color:var(--warning)"></i>';

        listaLotes.innerHTML += `
            <div class="lote-item" onclick='editarProduto(${JSON.stringify(lote)})' style="cursor:pointer">
                <div>
                    <div class="lote-data">${icone} ${formatData(lote.validade)}</div>
                    <small>Qtd: ${lote.qtd}</small>
                </div>
                <div style="color:var(--primary)"><i class="fas fa-pen"></i></div>
            </div>
        `;
    });
    
    document.getElementById('btn-add-lote').onclick = function() { abrirModalCadastro(grupo); };
    modal.style.display = 'flex';
}

function abrirModalCadastro(preenchimento = null) {
    // Fecha outros modais para evitar sobreposição
    fecharModal('modal-detalhes');
    fecharModal('modal-ia');

    const modal = document.getElementById('modal-cadastro');
    if(modal) {
        modal.style.display = 'flex';
        
        // Limpa formulário
        document.getElementById('form-produto').reset();
        document.getElementById('prod-id').value = "";
        document.getElementById('img-preview').style.display = 'none';
        document.getElementById('btn-excluir').style.display = 'none';
        document.getElementById('modal-titulo').innerText = "Novo Item";
        
        // Se for "Novo Lote" de um produto existente
        if(preenchimento) {
            document.getElementById('prod-nome').value = preenchimento.nome;
            document.getElementById('prod-codigo').value = preenchimento.codigo;
            document.getElementById('prod-categoria').value = preenchimento.categoria;
            document.getElementById('prod-preco').value = preenchimento.preco;
            document.getElementById('modal-titulo').innerText = "Novo Lote";
        }
    } else {
        console.error("Erro: Modal de cadastro não encontrado no HTML");
    }
}

function editarProduto(p) {
    fecharModal('modal-detalhes');
    const modal = document.getElementById('modal-cadastro');
    modal.style.display = 'flex';
    document.getElementById('modal-titulo').innerText = "Editar Lote";
    
    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-nome').value = p.nome;
    document.getElementById('prod-codigo').value = p.codigo;
    document.getElementById('prod-categoria').value = p.categoria;
    document.getElementById('prod-preco').value = p.preco;
    document.getElementById('prod-qtd').value = p.qtd;
    document.getElementById('prod-min').value = p.min_estoque;
    document.getElementById('prod-validade').value = p.validade;
    
    if(p.imagem) {
        const imgPreview = document.getElementById('img-preview');
        imgPreview.src = `/uploads/${p.imagem}`;
        imgPreview.style.display = 'block';
    }

    document.getElementById('btn-excluir').style.display = 'flex';
    document.getElementById('btn-excluir').onclick = function() { confirmarExclusao(p.id); };
}

function fecharModal(id) {
    const el = document.getElementById(id);
    if(el) el.style.display = 'none';
}

// --- 4. AÇÕES DE BANCO DE DADOS ---

function salvarProduto(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    fetch(`${API_URL}/salvar`, { method: "POST", body: formData })
    .then(r => r.json())
    .then(data => {
        fecharModal('modal-cadastro');
        carregarProdutos(); // Recarrega a tela
    })
    .catch(err => alert("Erro ao salvar: " + err));
}

function confirmarExclusao(id) {
    if(confirm("Tem certeza que deseja excluir este lote?")) {
        fetch(`${API_URL}/excluir/${id}`, { method: "DELETE" })
        .then(() => {
            fecharModal('modal-cadastro');
            carregarProdutos();
        });
    }
}

// --- 5. UTILITÁRIOS E IA ---

function abrirMenuIA() {
    document.getElementById('modal-ia').style.display = 'flex';
    document.getElementById('ia-resultado').style.display = 'none';
    document.getElementById('ia-loading').style.display = 'none';
    document.querySelector('.ia-controls').style.display = 'block';
}

function chamarIA() {
    const loading = document.getElementById('ia-loading');
    const controls = document.querySelector('.ia-controls');
    const resultBox = document.getElementById('ia-resultado');
    
    controls.style.display = 'none';
    loading.style.display = 'block';
    
    // Prepara resumo do estoque para a IA
    const resumo = todosProdutos.map(p => `${p.nome} (Qtd: ${p.qtd}, Val: ${p.validade})`);
    
    fetch("/api/ia/analise", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ dados: resumo })
    })
    .then(r => r.json())
    .then(data => {
        loading.style.display = 'none';
        resultBox.style.display = 'block';
        resultBox.innerHTML = data.conteudo;
    })
    .catch(err => {
        loading.style.display = 'none';
        controls.style.display = 'block';
        alert("Erro na IA: Verifique a API Key no app.py");
    });
}

function previewImagem(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('img-preview').src = e.target.result;
            document.getElementById('img-preview').style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function formatData(dateStr) {
    if(!dateStr) return "--/--";
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

function logout() {
    window.location.href = '/login';
}

// --- 6. SCANNER REAL ---
let html5QrcodeScanner;
function startBarcodeScanner() {
    const container = document.getElementById('scanner-container');
    container.style.display = 'block';
    
    html5QrcodeScanner = new Html5Qrcode("reader");
    html5QrcodeScanner.start({ facingMode: "environment" }, { fps: 10 }, 
        (decodedText) => {
            stopScanner();
            // Lógica inteligente: Abre detalhes se existe, ou cadastro se é novo
            if (produtosAgrupados[decodedText]) {
                abrirDetalhes(decodedText); 
            } else {
                abrirModalCadastro();
                // Pequeno delay para garantir que o modal abriu antes de preencher
                setTimeout(() => {
                    document.getElementById('prod-codigo').value = decodedText;
                }, 100);
            }
        }
    );
}

function stopScanner() {
    if(html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            document.getElementById('scanner-container').style.display = 'none';
        }).catch(err => {
            console.log("Erro ao parar scanner:", err);
            document.getElementById('scanner-container').style.display = 'none';
        });
    } else {
        document.getElementById('scanner-container').style.display = 'none';
    }
}

// --- FUNÇÃO DE RELATÓRIOS ---
function abrirRelatorios() {
    // Fecha outros modais se estiverem abertos
    fecharModal('modal-cadastro');
    fecharModal('modal-detalhes');
    fecharModal('modal-ia');

    const modal = document.getElementById('modal-relatorios');
    if(!modal) return; // Segurança

    // Variáveis para contagem
    let valorTotal = 0;
    let qtdTotal = 0;
    let vencidos = 0;
    let estoqueBaixo = 0;
    let categorias = {};

    // Loop para somar tudo
    // 'todosProdutos' já existe no topo do seu script
    todosProdutos.forEach(p => {
        // Soma valor (Preço x Quantidade)
        if(p.preco && p.qtd) {
            valorTotal += (parseFloat(p.preco) * parseInt(p.qtd));
        }
        
        // Soma quantidade de itens
        qtdTotal += parseInt(p.qtd || 0);

        // Conta problemas
        if(p.status_val === 'vencido') vencidos++;
        if(p.alerta_estoque) estoqueBaixo++;

        // Agrupa por categoria para o gráfico simples
        let cat = p.categoria || "Sem Categoria";
        if(!categorias[cat]) categorias[cat] = 0;
        categorias[cat] += parseInt(p.qtd);
    });

    // Atualiza a tela com os números formatados
    document.getElementById('rel-valor-total').innerText = valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('rel-qtd-total').innerText = qtdTotal;
    document.getElementById('rel-vencidos').innerText = vencidos;
    document.getElementById('rel-baixo').innerText = estoqueBaixo;

    // Gera a lista de categorias
    const listaCat = document.getElementById('rel-lista-categorias');
    listaCat.innerHTML = "";
    
    for (let cat in categorias) {
        // Calcula porcentagem simples
        let percent = qtdTotal > 0 ? ((categorias[cat] / qtdTotal) * 100).toFixed(0) : 0;
        
        listaCat.innerHTML += `
            <li style="margin-bottom:8px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #333; padding-bottom:5px;">
                <span>${cat}</span>
                <span>${categorias[cat]} un <small style="color:#666">(${percent}%)</small></span>
            </li>
        `;
    }

    // Abre o modal
    modal.style.display = 'flex';
}