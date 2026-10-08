import {
    analisarNegocio,
    criarMensagemOferta
} from "./mochila.js";
const BACKEND_URL = "http://127.0.0.1:3000";

const WHATSAPP_NUMERO =
    "5512981889190";

const TEMA_STORAGE_KEY =
    "geekzoneTema";


// =========================================================
// ELEMENTOS DA LOJA
// =========================================================

const productsGrid =
    document.getElementById(
        "productsGrid"
    );

const productsStatus =
    document.getElementById(
        "productsStatus"
    );

const emptyProducts =
    document.getElementById(
        "emptyProducts"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const searchButton =
    document.getElementById(
        "searchButton"
    );

const categoryButtons =
    document.querySelectorAll(
        ".category-card"
    );

const menuButton =
    document.getElementById(
        "menuButton"
    );

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );

const currentYear =
    document.getElementById(
        "currentYear"
    );


// =========================================================
// CARRINHO
// =========================================================

const cartButton =
    document.getElementById(
        "cartButton"
    );

const mobileCartButton =
    document.getElementById(
        "mobileCartButton"
    );

const cartDrawer =
    document.getElementById(
        "cartDrawer"
    );

const cartOverlay =
    document.getElementById(
        "cartOverlay"
    );

const cartCloseButton =
    document.getElementById(
        "cartCloseButton"
    );

const cartItems =
    document.getElementById(
        "cartItems"
    );

const cartEmpty =
    document.getElementById(
        "cartEmpty"
    );

const cartTotal =
    document.getElementById(
        "cartTotal"
    );

const cartCount =
    document.getElementById(
        "cartCount"
    );

const mobileCartCount =
    document.getElementById(
        "mobileCartCount"
    );

const clearCartButton =
    document.getElementById(
        "clearCartButton"
    );

const checkoutButton =
    document.getElementById(
        "checkoutButton"
    );


// =========================================================
// CHECKOUT
// =========================================================

const checkoutOverlay =
    document.getElementById(
        "checkoutOverlay"
    );

const checkoutCloseButton =
    document.getElementById(
        "checkoutCloseButton"
    );

const checkoutForm =
    document.getElementById(
        "checkoutForm"
    );

const customerName =
    document.getElementById(
        "customerName"
    );

const customerPhone =
    document.getElementById(
        "customerPhone"
    );

const customerEmail =
    document.getElementById(
        "customerEmail"
    );

const customerCep =
    document.getElementById(
        "customerCep"
    );

const customerStreet =
    document.getElementById(
        "customerStreet"
    );

const customerNumber =
    document.getElementById(
        "customerNumber"
    );

const customerComplement =
    document.getElementById(
        "customerComplement"
    );

const customerNeighborhood =
    document.getElementById(
        "customerNeighborhood"
    );

const customerCity =
    document.getElementById(
        "customerCity"
    );

const customerState =
    document.getElementById(
        "customerState"
    );

const calculateShippingButton =
    document.getElementById(
        "calculateShippingButton"
    );

const cepStatus =
    document.getElementById(
        "cepStatus"
    );

const checkoutProducts =
    document.getElementById(
        "checkoutProducts"
    );

const checkoutSubtotal =
    document.getElementById(
        "checkoutSubtotal"
    );

const checkoutDiscountRow =
    document.getElementById(
        "checkoutDiscountRow"
    );

const checkoutDiscount =
    document.getElementById(
        "checkoutDiscount"
    );

const checkoutDistance =
    document.getElementById(
        "checkoutDistance"
    );

const checkoutShipping =
    document.getElementById(
        "checkoutShipping"
    );

const checkoutTotal =
    document.getElementById(
        "checkoutTotal"
    );


// =========================================================
// GEEKBOT
// =========================================================

const aiAssistant =
    document.getElementById(
        "aiAssistant"
    );

const aiLauncher =
    document.getElementById(
        "aiLauncher"
    );

const aiChat =
    document.getElementById(
        "aiChat"
    );

const aiChatClose =
    document.getElementById(
        "aiChatClose"
    );

const aiChatMessages =
    document.getElementById(
        "aiChatMessages"
    );

const aiChatForm =
    document.getElementById(
        "aiChatForm"
    );

const aiChatInput =
    document.getElementById(
        "aiChatInput"
    );

const aiMicButton =
    document.getElementById(
        "aiMicButton"
    );

const whatsappLink =
    document.getElementById(
        "whatsappLink"
    );


// =========================================================
// ESTADO
// =========================================================

let produtos = [];

let categoriaAtual =
    "Todos";

let pesquisaAtual =
    "";

let carrinho =
    carregarCarrinhoSalvo();

let ultimoResumoPedido =
    null;


// =========================================================
// MICROFONE
// =========================================================

let reconhecimentoVoz =
    null;

let microfoneAtivo =
    false;

let cancelarEnvioVoz =
    false;

let textoVozFinal =
    "";


// =========================================================
// INICIAR
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        atualizarAno();

        configurarTema();

        configurarMenuMobile();

        configurarPesquisa();

        configurarCategorias();

        configurarCarrinho();

        configurarCheckout();

        configurarAssistenteIA();

        configurarWhatsApp();

        renderizarCarrinho();

        await carregarProdutos();

    }
);


// =========================================================
// ANO
// =========================================================

function atualizarAno() {

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }

}


// =========================================================
// UTILIDADES
// =========================================================

function formatarPreco(
    valor
) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style:
                "currency",

            currency:
                "BRL"
        }
    ).format(
        Number(valor) || 0
    );

}


function escaparHTML(
    valor
) {

    return String(valor)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


function normalizarTextoIA(
    texto
) {

    return String(
        texto || ""
    )

        .normalize(
            "NFD"
        )

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .toLowerCase()

        .replace(
            /[^a-z0-9\s]/g,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


// =========================================================
// PREPARAR CARRINHO PARA O SERVIDOR
// =========================================================

function itensParaServidor() {

    return carrinho

        .map(
            item => ({

                id:
                    String(
                        item.id || ""
                    ).trim(),

                quantidade:
                    Number(
                        item.quantidade || 0
                    )

            })
        )

        .filter(
            item =>

                item.id &&

                Number.isInteger(
                    item.quantidade
                ) &&

                item.quantidade > 0
        );

}


// =========================================================
// COMUNICAÇÃO COM BACKEND
// =========================================================

async function chamarBackend(
    rota,
    dados = null,
    metodo = "POST"
) {

    const opcoes = {

        method:
            metodo,

        headers:
            {}

    };


    if (
        dados !== null
    ) {

        opcoes.headers[
            "Content-Type"
        ] =
            "application/json";


        opcoes.body =
            JSON.stringify(
                dados
            );

    }


    const resposta =
        await fetch(

            `${BACKEND_URL}${rota}`,

            opcoes

        );


    let respostaJson =
        {};


    try {

        respostaJson =
            await resposta.json();

    }

    catch {

        respostaJson =
            {};

    }


    if (
        !resposta.ok
    ) {

        throw new Error(

            respostaJson.erro ||

            respostaJson.resposta ||

            respostaJson.resposta_agente ||

            "O servidor não conseguiu processar a solicitação."

        );

    }


    return respostaJson;

}


// =========================================================
// CARREGAR PRODUTOS
// =========================================================

async function carregarProdutos() {

    if (
        !productsStatus ||
        !productsGrid
    ) {

        return;

    }


    try {

        productsStatus.textContent =
            "Carregando produtos...";


        const dados =
            await chamarBackend(

                "/api/produtos",

                null,

                "GET"

            );


        produtos =
            Array.isArray(
                dados.produtos
            )

                ? dados.produtos

                : [];


        sincronizarCarrinhoComCatalogo();


        renderizarProdutos();


        renderizarCarrinho();

    }

    catch (erro) {

        console.error(
            "Erro ao carregar produtos:",
            erro
        );


        productsStatus.textContent =
            "Não foi possível carregar os produtos.";


        if (
            emptyProducts
        ) {

            emptyProducts.hidden =
                false;

        }

    }

}


// =========================================================
// SINCRONIZAR CARRINHO COM PRODUTOS OFICIAIS
// =========================================================

function sincronizarCarrinhoComCatalogo() {

    if (
        !Array.isArray(
            carrinho
        )
    ) {

        carrinho =
            [];


        salvarCarrinho();


        return;

    }


    const carrinhoSincronizado =
        [];


    for (
        const item
        of carrinho
    ) {

        const produtoOficial =
            produtos.find(

                produto =>

                    String(
                        produto.id
                    ) ===

                    String(
                        item.id
                    )

            );


        if (
            !produtoOficial
        ) {

            continue;

        }


        const estoque =
            Math.max(

                0,

                Number(
                    produtoOficial.estoque ||
                    0
                )

            );


        const quantidade =
            Math.min(

                Math.max(

                    1,

                    Number(
                        item.quantidade ||
                        1
                    )

                ),

                estoque

            );


        if (
            estoque <= 0 ||
            quantidade <= 0
        ) {

            continue;

        }


        carrinhoSincronizado.push({

            id:
                produtoOficial.id,

            nome:
                produtoOficial.nome ||
                "Produto",

            preco:
                Number(
                    produtoOficial.preco ||
                    0
                ),

            estoque:
                estoque,

            quantidade:
                quantidade,

            imagem:

                produtoOficial.imagem ||

                produtoOficial.image ||

                produtoOficial.imageUrl ||

                ""

        });

    }


    carrinho =
        carrinhoSincronizado;


    salvarCarrinho();

}


// =========================================================
// FILTRAR PRODUTOS
// =========================================================

function filtrarProdutos() {

    const pesquisa =
        normalizarTextoIA(
            pesquisaAtual
        );


    const categoriaEscolhida =
        normalizarTextoIA(
            categoriaAtual
        );


    return produtos.filter(
        produto => {

            const nome =
                normalizarTextoIA(
                    produto.nome ||
                    ""
                );


            const categoria =
                normalizarTextoIA(
                    produto.categoria ||
                    ""
                );


            const descricao =
                normalizarTextoIA(
                    produto.descricao ||
                    ""
                );


            const pesquisaOk =

                !pesquisa ||

                nome.includes(
                    pesquisa
                ) ||

                categoria.includes(
                    pesquisa
                ) ||

                descricao.includes(
                    pesquisa
                );


            const categoriaOk =

                categoriaAtual ===
                    "Todos"

                ||

                categoria ===
                    categoriaEscolhida;


            return (
                pesquisaOk &&
                categoriaOk
            );

        }
    );

}


// =========================================================
// RENDERIZAR PRODUTOS
// =========================================================

function renderizarProdutos() {

    if (
        !productsGrid
    ) {

        return;

    }


    productsGrid.innerHTML =
        "";


    const filtrados =
        filtrarProdutos();


    if (
        emptyProducts
    ) {

        emptyProducts.hidden =
            filtrados.length > 0;

    }


    if (
        productsStatus
    ) {

        productsStatus.textContent =

            filtrados.length > 0

                ? `${filtrados.length} produto(s) encontrado(s).`

                : "Nenhum produto encontrado.";

    }


    filtrados.forEach(
        produto => {

            productsGrid.appendChild(

                criarCardProduto(
                    produto
                )

            );

        }
    );

}


// =========================================================
// CARD PRODUTO
// =========================================================

function criarCardProduto(
    produto
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    const nome =
        produto.nome ||
        "Produto";


    const preco =
        Number(
            produto.preco ||
            0
        );


    const estoque =
        Number(
            produto.estoque ||
            0
        );


    const categoria =
        produto.categoria ||
        "Produto";


    const descricao =
        produto.descricao ||
        "";


    const imagem =

        produto.imagem ||

        produto.image ||

        produto.imageUrl ||

        "";


    const disponivel =
        estoque > 0;


    card.innerHTML = `

        <div class="product-image">

            ${
                imagem

                    ? `
                        <img
                            src="${escaparHTML(imagem)}"
                            alt="${escaparHTML(nome)}"
                            loading="lazy"
                        >
                    `

                    : `
                        <div class="product-placeholder">
                            📦
                        </div>
                    `
            }

            <span
                class="stock-badge ${
                    disponivel
                        ? ""
                        : "out"
                }"
            >
                ${
                    disponivel

                        ? `Em estoque: ${estoque}`

                        : "Fora de estoque"
                }
            </span>

        </div>


        <div class="product-info">

            <div class="product-category">
                ${escaparHTML(categoria)}
            </div>


            <h3 class="product-name">
                ${escaparHTML(nome)}
            </h3>


            <p class="product-description">
                ${escaparHTML(descricao)}
            </p>


            <div class="product-bottom">

                <strong class="product-price">
                    ${formatarPreco(preco)}
                </strong>


                <button
                    class="product-button"
                    type="button"
                    ${disponivel ? "" : "disabled"}
                >
                    ${
                        disponivel
                            ? "COMPRAR"
                            : "Indisponível"
                    }
                </button>

            </div>

        </div>

    `;


    if (
        disponivel
    ) {

        card
            .querySelector(
                ".product-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    adicionarAoCarrinho(
                        produto
                    );

                }
            );

    }


    return card;

}


// =========================================================
// PESQUISA
// =========================================================

function configurarPesquisa() {

    searchInput?.addEventListener(
        "input",
        () => {

            pesquisaAtual =
                searchInput.value;


            renderizarProdutos();

        }
    );


    searchButton?.addEventListener(
        "click",
        () => {

            pesquisaAtual =
                searchInput?.value ||
                "";


            renderizarProdutos();

        }
    );

}


// =========================================================
// CATEGORIAS
// =========================================================

function configurarCategorias() {

    categoryButtons.forEach(
        botao => {

            botao.addEventListener(
                "click",
                () => {

                    categoryButtons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    botao.classList.add(
                        "active"
                    );


                    categoriaAtual =
                        botao.dataset.category ||
                        "Todos";


                    renderizarProdutos();

                }
            );

        }
    );

}


// =========================================================
// MENU MOBILE
// =========================================================

function configurarMenuMobile() {

    menuButton?.addEventListener(
        "click",
        () => {

            mobileMenu
                ?.classList.toggle(
                    "active"
                );

        }
    );


    mobileMenu
        ?.querySelectorAll(
            "a"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        mobileMenu
                            .classList
                            .remove(
                                "active"
                            );

                    }
                );

            }
        );

}


// =========================================================
// LOCAL STORAGE
// =========================================================

function carregarCarrinhoSalvo() {

    try {

        const salvo =
            localStorage.getItem(
                "geekzoneCarrinho"
            );


        return salvo

            ? JSON.parse(
                salvo
            )

            : [];

    }

    catch {

        return [];

    }

}


function salvarCarrinho() {

    localStorage.setItem(

        "geekzoneCarrinho",

        JSON.stringify(
            carrinho
        )

    );

}


// =========================================================
// CONFIGURAR CARRINHO
// =========================================================

function configurarCarrinho() {

    cartButton?.addEventListener(
        "click",
        abrirCarrinho
    );


    mobileCartButton?.addEventListener(
        "click",
        () => {

            mobileMenu
                ?.classList.remove(
                    "active"
                );


            abrirCarrinho();

        }
    );


    cartCloseButton?.addEventListener(
        "click",
        fecharCarrinho
    );


    cartOverlay?.addEventListener(
        "click",
        fecharCarrinho
    );


    clearCartButton?.addEventListener(
        "click",
        limparCarrinho
    );


    checkoutButton?.addEventListener(
        "click",
        abrirCheckout
    );

}


// =========================================================
// ABRIR CARRINHO
// =========================================================

function abrirCarrinho() {

    cartDrawer
        ?.classList.add(
            "active"
        );


    cartDrawer
        ?.setAttribute(
            "aria-hidden",
            "false"
        );


    if (
        cartOverlay
    ) {

        cartOverlay.hidden =
            false;


        requestAnimationFrame(
            () => {

                cartOverlay
                    .classList.add(
                        "active"
                    );

            }
        );

    }

}


// =========================================================
// FECHAR CARRINHO
// =========================================================

function fecharCarrinho() {

    cartDrawer
        ?.classList.remove(
            "active"
        );


    cartDrawer
        ?.setAttribute(
            "aria-hidden",
            "true"
        );


    cartOverlay
        ?.classList.remove(
            "active"
        );


    setTimeout(
        () => {

            if (
                cartOverlay
            ) {

                cartOverlay.hidden =
                    true;

            }

        },
        250
    );

}


// =========================================================
// ADICIONAR AO CARRINHO
// =========================================================

function adicionarAoCarrinho(
    produto
) {

    const estoque =
        Number(
            produto.estoque ||
            0
        );


    const existente =
        carrinho.find(

            item =>

                String(
                    item.id
                ) ===

                String(
                    produto.id
                )

        );


    if (
        existente
    ) {

        if (
            existente.quantidade >=
            estoque
        ) {

            alert(
                "Você já adicionou a quantidade máxima disponível."
            );


            abrirCarrinho();


            return;

        }


        existente.quantidade++;

    }

    else {

        carrinho.push({

            id:
                produto.id,

            nome:
                produto.nome ||
                "Produto",

            preco:
                Number(
                    produto.preco ||
                    0
                ),

            estoque:
                estoque,

            quantidade:
                1,

            imagem:

                produto.imagem ||

                produto.image ||

                produto.imageUrl ||

                ""

        });

    }


    ultimoResumoPedido =
        null;


    salvarCarrinho();


    renderizarCarrinho();


    abrirCarrinho();

}


// =========================================================
// ALTERAR QUANTIDADE
// =========================================================

function alterarQuantidade(
    id,
    diferenca
) {

    const item =
        carrinho.find(

            produto =>

                String(
                    produto.id
                ) ===

                String(
                    id
                )

        );


    if (
        !item
    ) {

        return;

    }


    const novaQuantidade =

        Number(
            item.quantidade
        )

        +

        diferenca;


    if (
        novaQuantidade <= 0
    ) {

        removerDoCarrinho(
            id
        );


        return;

    }


    if (
        novaQuantidade >
        Number(
            item.estoque ||
            0
        )
    ) {

        alert(
            "Quantidade maior que o estoque disponível."
        );


        return;

    }


    item.quantidade =
        novaQuantidade;


    ultimoResumoPedido =
        null;


    salvarCarrinho();


    renderizarCarrinho();

}


// =========================================================
// REMOVER
// =========================================================

function removerDoCarrinho(
    id
) {

    carrinho =
        carrinho.filter(

            item =>

                String(
                    item.id
                ) !==

                String(
                    id
                )

        );


    ultimoResumoPedido =
        null;


    salvarCarrinho();


    renderizarCarrinho();

}


// =========================================================
// LIMPAR CARRINHO
// =========================================================

function limparCarrinho() {

    carrinho =
        [];


    ultimoResumoPedido =
        null;


    salvarCarrinho();


    renderizarCarrinho();

}


// =========================================================
// SUBTOTAL VISUAL
// =========================================================

function calcularSubtotalVisual() {

    return carrinho.reduce(

        (
            total,
            item
        ) => {

            return (

                total

                +

                Number(
                    item.preco ||
                    0
                )

                *

                Number(
                    item.quantidade ||
                    0
                )

            );

        },

        0

    );

}


// =========================================================
// RENDER CARRINHO
// =========================================================

function renderizarCarrinho() {

    if (
        !cartItems
    ) {

        return;

    }


    cartItems.innerHTML =
        "";


    const quantidadeItens =
        carrinho.reduce(

            (
                total,
                item
            ) =>

                total

                +

                Number(
                    item.quantidade ||
                    0
                ),

            0

        );


    if (
        cartCount
    ) {

        cartCount.textContent =
            quantidadeItens;

    }


    if (
        mobileCartCount
    ) {

        mobileCartCount.textContent =
            quantidadeItens;

    }


    if (
        cartTotal
    ) {

        cartTotal.textContent =
            formatarPreco(
                calcularSubtotalVisual()
            );

    }


    if (
        cartEmpty
    ) {

        cartEmpty.hidden =
            carrinho.length > 0;

    }


    if (
        checkoutButton
    ) {

        checkoutButton.disabled =
            carrinho.length === 0;

    }


    if (
        clearCartButton
    ) {

        clearCartButton.disabled =
            carrinho.length === 0;

    }


    carrinho.forEach(
        item => {

            const elemento =
                document.createElement(
                    "div"
                );


            elemento.className =
                "cart-item";


            elemento.innerHTML = `

                <div class="cart-item-image">

                    ${
                        item.imagem

                            ? `
                                <img
                                    src="${escaparHTML(item.imagem)}"
                                    alt="${escaparHTML(item.nome)}"
                                >
                            `

                            : `
                                <span>
                                    📦
                                </span>
                            `
                    }

                </div>


                <div class="cart-item-content">

                    <div class="cart-item-top">

                        <h3>
                            ${escaparHTML(item.nome)}
                        </h3>

                    </div>


                    <span class="cart-item-unit-price">

                        ${formatarPreco(item.preco)}
                        cada

                    </span>


                    <div class="cart-item-bottom">

                        <div class="quantity-control">

                            <button
                                data-action="decrease"
                                type="button"
                            >
                                −
                            </button>


                            <span>
                                ${item.quantidade}
                            </span>


                            <button
                                data-action="increase"
                                type="button"
                            >
                                +
                            </button>

                        </div>


                        <strong>

                            ${
                                formatarPreco(

                                    item.preco

                                    *

                                    item.quantidade

                                )
                            }

                        </strong>

                    </div>


                    <button
                        class="cart-remove-button"
                        data-action="remove"
                        type="button"
                        aria-label="Remover produto"
                    >

                        🗑️ Remover

                    </button>

                </div>

            `;


            elemento
                .querySelector(
                    '[data-action="decrease"]'
                )
                ?.addEventListener(
                    "click",
                    () => {

                        alterarQuantidade(
                            item.id,
                            -1
                        );

                    }
                );


            elemento
                .querySelector(
                    '[data-action="increase"]'
                )
                ?.addEventListener(
                    "click",
                    () => {

                        alterarQuantidade(
                            item.id,
                            1
                        );

                    }
                );


            elemento
                .querySelector(
                    '[data-action="remove"]'
                )
                ?.addEventListener(
                    "click",
                    () => {

                        removerDoCarrinho(
                            item.id
                        );

                    }
                );


            cartItems.appendChild(
                elemento
            );

        }
    );


    if (
        checkoutOverlay &&
        !checkoutOverlay.hidden
    ) {

        atualizarResumoCheckout()
            .catch(
                erro => {

                    console.error(
                        "Erro ao atualizar resumo:",
                        erro
                    );

                }
            );

    }

}


// =========================================================
// CONFIGURAR CHECKOUT
// =========================================================

function configurarCheckout() {

    checkoutCloseButton?.addEventListener(
        "click",
        fecharCheckout
    );


    checkoutOverlay?.addEventListener(
        "click",
        evento => {

            if (
                evento.target ===
                checkoutOverlay
            ) {

                fecharCheckout();

            }

        }
    );


    customerCep?.addEventListener(
        "input",
        formatarCampoCep
    );


    calculateShippingButton?.addEventListener(
        "click",
        calcularFretePorCep
    );


    checkoutForm?.addEventListener(
        "submit",
        confirmarPedido
    );

}


// =========================================================
// ABRIR CHECKOUT
// =========================================================

async function abrirCheckout() {

    if (
        carrinho.length === 0
    ) {

        alert(
            "Seu carrinho está vazio."
        );


        return;

    }


    fecharCarrinho();


    ultimoResumoPedido =
        null;


    if (
        checkoutDistance
    ) {

        checkoutDistance.textContent =
            "Calcule o frete";

    }


    if (
        cepStatus
    ) {

        cepStatus.textContent =
            "";


        cepStatus.className =
            "cep-status";

    }


    if (
        checkoutOverlay
    ) {

        checkoutOverlay.hidden =
            false;


        requestAnimationFrame(
            () => {

                checkoutOverlay
                    .classList.add(
                        "active"
                    );

            }
        );

    }


    try {

        await atualizarResumoCheckout();

    }

    catch (erro) {

        console.error(
            "Erro ao abrir checkout:",
            erro
        );


        mostrarStatusCep(

            erro.message ||

            "Não foi possível carregar o resumo.",

            "error"

        );

    }

}


// =========================================================
// FECHAR CHECKOUT
// =========================================================

function fecharCheckout() {

    checkoutOverlay
        ?.classList.remove(
            "active"
        );


    setTimeout(
        () => {

            if (
                checkoutOverlay
            ) {

                checkoutOverlay.hidden =
                    true;

            }

        },
        250
    );

}


// =========================================================
// FORMATAR CEP
// =========================================================

function formatarCampoCep() {

    if (
        !customerCep
    ) {

        return;

    }


    let valor =
        customerCep.value

            .replace(
                /\D/g,
                ""
            )

            .slice(
                0,
                8
            );


    if (
        valor.length > 5
    ) {

        valor =
            `${valor.slice(0, 5)}-${valor.slice(5)}`;

    }


    customerCep.value =
        valor;


    ultimoResumoPedido =
        null;


    if (
        checkoutDistance
    ) {

        checkoutDistance.textContent =
            "Calcule o frete";

    }


    mostrarStatusCep(
        "",
        ""
    );

}


// =========================================================
// OBTER RESUMO SEGURO
// =========================================================

async function obterResumoSeguro(
    cep = ""
) {

    return chamarBackend(

        "/api/calcular-pedido",

        {

            produtos:
                itensParaServidor(),

            cep:
                cep

        }

    );

}


// =========================================================
// CALCULAR FRETE PELO SERVIDOR
// =========================================================

async function calcularFretePorCep() {

    if (
        !customerCep
    ) {

        return;

    }


    const cep =
        customerCep.value
            .replace(
                /\D/g,
                ""
            );


    if (
        cep.length !== 8
    ) {

        mostrarStatusCep(
            "Digite um CEP válido.",
            "error"
        );


        return;

    }


    try {

        if (
            calculateShippingButton
        ) {

            calculateShippingButton.disabled =
                true;


            calculateShippingButton.textContent =
                "CALCULANDO...";

        }


        mostrarStatusCep(

            "Buscando endereço e calculando frete...",

            "loading"

        );


        const resumo =
            await obterResumoSeguro(
                cep
            );


        ultimoResumoPedido =
            resumo;


        preencherEnderecoDoServidor(
            resumo.endereco
        );


        renderizarResumoServidor(
            resumo
        );


        mostrarStatusCep(

            resumo.frete?.gratis

                ? "Endereço encontrado. Seu pedido tem frete grátis."

                : "Endereço encontrado e frete calculado.",

            "success"

        );

    }

    catch (erro) {

        console.error(
            "Erro no frete:",
            erro
        );


        ultimoResumoPedido =
            null;


        mostrarStatusCep(

            erro.message ||

            "Não foi possível calcular o frete.",

            "error"

        );


        if (
            checkoutDistance
        ) {

            checkoutDistance.textContent =
                "Não calculado";

        }

    }

    finally {

        if (
            calculateShippingButton
        ) {

            calculateShippingButton.disabled =
                false;


            calculateShippingButton.textContent =
                "CALCULAR FRETE";

        }

    }

}


// =========================================================
// PREENCHER ENDEREÇO
// =========================================================

function preencherEnderecoDoServidor(
    endereco
) {

    if (
        !endereco
    ) {

        return;

    }


    if (
        customerStreet
    ) {

        customerStreet.value =
            endereco.rua ||
            "";

    }


    if (
        customerNeighborhood
    ) {

        customerNeighborhood.value =
            endereco.bairro ||
            "";

    }


    if (
        customerCity
    ) {

        customerCity.value =
            endereco.cidade ||
            "";

    }


    if (
        customerState
    ) {

        customerState.value =
            endereco.estado ||
            "";

    }

}


// =========================================================
// ATUALIZAR RESUMO DO CHECKOUT
// =========================================================

async function atualizarResumoCheckout() {

    if (
        !checkoutProducts ||
        !checkoutSubtotal ||
        !checkoutShipping ||
        !checkoutTotal
    ) {

        return;

    }


    if (
        carrinho.length === 0
    ) {

        checkoutProducts.innerHTML =
            "";


        checkoutSubtotal.textContent =
            formatarPreco(
                0
            );


        checkoutShipping.textContent =
            formatarPreco(
                0
            );


        checkoutTotal.textContent =
            formatarPreco(
                0
            );


        if (
            checkoutDiscountRow
        ) {

            checkoutDiscountRow.hidden =
                true;

        }


        return;

    }


    const cep =
        customerCep
            ?.value
            ?.replace(
                /\D/g,
                ""
            )

        ||

        "";


    const cepValido =
        cep.length === 8;


    const resumo =
        await obterResumoSeguro(

            cepValido

                ? cep

                : ""

        );


    ultimoResumoPedido =
        resumo;


    if (
        cepValido &&
        resumo.endereco
    ) {

        preencherEnderecoDoServidor(
            resumo.endereco
        );

    }


    renderizarResumoServidor(
        resumo
    );

}


// =========================================================
// RENDERIZAR RESUMO DO SERVIDOR
// =========================================================

function renderizarResumoServidor(
    resumo
) {

    if (
        !resumo
    ) {

        return;

    }


    if (
        checkoutProducts
    ) {

        checkoutProducts.innerHTML =
            "";


        const itens =
            Array.isArray(
                resumo.produtos
            )

                ? resumo.produtos

                : [];


        itens.forEach(
            item => {

                const linha =
                    document.createElement(
                        "div"
                    );


                linha.className =
                    "checkout-product";


                linha.innerHTML = `

                    <span>
                        ${item.quantidade}x
                        ${escaparHTML(item.nome)}
                    </span>


                    <strong>
                        ${formatarPreco(item.total)}
                    </strong>

                `;


                checkoutProducts.appendChild(
                    linha
                );

            }
        );

    }


    if (
        checkoutSubtotal
    ) {

        checkoutSubtotal.textContent =
            formatarPreco(
                resumo.subtotal
            );

    }


    const valorDesconto =
        Number(
            resumo.desconto?.valor ||
            0
        );


    if (
        checkoutDiscountRow
    ) {

        checkoutDiscountRow.hidden =
            valorDesconto <= 0;

    }


    if (
        checkoutDiscount
    ) {

        checkoutDiscount.textContent =
            `- ${formatarPreco(valorDesconto)}`;

    }


    const frete =
        resumo.frete ||
        {};


    if (
        checkoutDistance
    ) {

        checkoutDistance.textContent =

            frete.distancia_km != null

                ? `${Number(frete.distancia_km).toFixed(2)} km`

                : "Calcule o frete";

    }


    if (
        checkoutShipping
    ) {

        if (
            frete.gratis
        ) {

            checkoutShipping.textContent =
                "Frete Grátis!";

        }

        else if (
            frete.calculado
        ) {

            checkoutShipping.textContent =
                formatarPreco(
                    frete.valor
                );

        }

        else {

            checkoutShipping.textContent =
                "Calcule o frete";

        }

    }


    if (
        checkoutTotal
    ) {

        checkoutTotal.textContent =

            resumo.total != null

                ? formatarPreco(
                    resumo.total
                )

                : formatarPreco(
                    resumo.subtotal_com_desconto
                );

    }

}


// =========================================================
// STATUS DO CEP
// =========================================================

function mostrarStatusCep(
    mensagem,
    tipo = ""
) {

    if (
        !cepStatus
    ) {

        return;

    }


    cepStatus.textContent =
        mensagem;


    cepStatus.className =
        `cep-status ${tipo}`
            .trim();

}


// =========================================================
// FINALIZAR PEDIDO NO SERVIDOR
// =========================================================

async function confirmarPedido(
    evento
) {

    evento.preventDefault();


    if (
        carrinho.length === 0
    ) {

        alert(
            "Seu carrinho está vazio."
        );


        return;

    }


    if (
        checkoutForm &&
        !checkoutForm.checkValidity()
    ) {

        checkoutForm.reportValidity();


        return;

    }


    const cep =
        customerCep
            ?.value
            ?.replace(
                /\D/g,
                ""
            )

        ||

        "";


    if (
        cep.length !== 8
    ) {

        mostrarStatusCep(
            "Informe um CEP válido.",
            "error"
        );


        customerCep
            ?.focus();


        return;

    }


    let botaoSubmit =
        null;


    try {

        botaoSubmit =
            checkoutForm
                ?.querySelector(
                    'button[type="submit"]'
                );


        if (
            botaoSubmit
        ) {

            botaoSubmit.disabled =
                true;


            botaoSubmit.dataset.textoOriginal =
                botaoSubmit.textContent ||
                "";


            botaoSubmit.textContent =
                "VALIDANDO PEDIDO...";

        }


        const dados =
            await chamarBackend(

                "/api/finalizar-pedido",

                {

                    produtos:
                        itensParaServidor(),

                    cliente: {

                        nome:
                            customerName
                                ?.value
                                ?.trim()

                            ||

                            "",

                        telefone:
                            customerPhone
                                ?.value
                                ?.trim()

                            ||

                            "",

                        email:
                            customerEmail
                                ?.value
                                ?.trim()

                            ||

                            ""

                    },

                    endereco: {

                        cep:
                            cep,

                        numero:
                            customerNumber
                                ?.value
                                ?.trim()

                            ||

                            "",

                        complemento:
                            customerComplement
                                ?.value
                                ?.trim()

                            ||

                            ""

                    }

                }

            );


        const pedido =
            dados.pedido;


        if (
            !pedido
        ) {

            throw new Error(
                "O servidor não devolveu os dados do pedido."
            );

        }


        ultimoResumoPedido =
            pedido;


        preencherEnderecoDoServidor(
            pedido.endereco
        );


        const desconto =
            Number(
                pedido.desconto?.valor ||
                0
            );


        const frete =
            pedido.frete ||
            {};


        let mensagem =

            "Pedido validado pelo servidor!\n\n";


        mensagem +=

            `Produtos: ${formatarPreco(pedido.subtotal)}\n`;


        if (
            desconto > 0
        ) {

            mensagem +=

                `Desconto: -${formatarPreco(desconto)}\n`;

        }


        mensagem +=

            frete.gratis

                ? "Frete: GRÁTIS\n"

                : `Frete: ${formatarPreco(frete.valor)}\n`;


        mensagem +=

            `\nTOTAL: ${formatarPreco(pedido.total)}`;


        alert(
            mensagem
        );

    }

    catch (erro) {

        console.error(
            "Erro ao finalizar pedido:",
            erro
        );


        alert(

            erro.message ||

            "Não foi possível finalizar o pedido."

        );

    }

    finally {

        if (
            botaoSubmit
        ) {

            botaoSubmit.disabled =
                false;


            botaoSubmit.textContent =

                botaoSubmit.dataset.textoOriginal

                ||

                "FINALIZAR PEDIDO";

        }

    }

}


// =========================================================
// WHATSAPP
// =========================================================

function configurarWhatsApp() {

    if (
        !whatsappLink
    ) {

        return;

    }


    const mensagem =
        "Olá! Vim pelo GeekBot da GeekZone e gostaria de atendimento.";


    whatsappLink.href =

        `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;

}


// =========================================================
// REDIRECIONAMENTO HUMANO
// =========================================================

function redirecionarHumano(
    mensagemPersonalizada = ""
) {

    const mensagem =

        mensagemPersonalizada

        ||

        (
            "Olá! Vim pelo GeekBot da GeekZone " +
            "e gostaria de falar com um atendente."
        );


    const linkWhatsApp =

        `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;


    setTimeout(
        () => {

            window.location.href =
                linkWhatsApp;

        },
        3000
    );

}


// =========================================================
// TEMA
// =========================================================

function configurarTema() {

    const temaSalvo =
        localStorage.getItem(
            TEMA_STORAGE_KEY
        );


    aplicarTema(

        temaSalvo ===
            "claro"

            ? "claro"

            : "escuro",

        false

    );

}

// =========================================================
// EASTER EGG - LADO SOMBRIO
// =========================================================

function ativarLadoSombrio() {

    // Remove o modo claro,
    // caso ele esteja ativado.
    document.body.classList.remove(
        "light-mode"
    );


    // Ativa o Easter Egg.
    document.body.classList.add(
        "dark-side-mode"
    );


    // Garante que o site seja tratado
    // como tema escuro.
    document.documentElement.setAttribute(
        "data-theme",
        "dark"
    );


    console.log(
        "🔴 LADO SOMBRIO ATIVADO"
    );

}

function aplicarTema(
    tema,
    salvar = true
) {

        // Sempre que o cliente escolher
    // um tema normal, saímos do Easter Egg.
    document.body.classList.remove(
        "dark-side-mode"
    );

    const modoClaro =
        tema ===
        "claro";


    document.body.classList.toggle(

        "light-mode",

        modoClaro

    );


    document.documentElement.setAttribute(

        "data-theme",

        modoClaro

            ? "light"

            : "dark"

    );


    if (
        salvar
    ) {

        localStorage.setItem(

            TEMA_STORAGE_KEY,

            modoClaro

                ? "claro"

                : "escuro"

        );

    }


    return modoClaro

        ? "Pronto! ☀️ Ativei o Modo Claro para você."

        : "Pronto! 🌙 Ativei o Modo Escuro para você.";

}

// =========================================================
// DESATIVAR EASTER EGG - LADO SOMBRIO
// =========================================================

function desativarLadoSombrio() {

    // Remove o visual vermelho/preto
    document.body.classList.remove(
        "dark-side-mode"
    );


    // Recupera o tema que o cliente usava
    // antes do Easter Egg.
    const temaSalvo =
        localStorage.getItem(
            TEMA_STORAGE_KEY
        );


    if (
        temaSalvo === "claro"
    ) {

        aplicarTema(
            "claro",
            false
        );

    }

    else {

        aplicarTema(
            "escuro",
            false
        );

    }


    console.log(
        "⚡ LADO SOMBRIO DESATIVADO"
    );

}

// =========================================================
// TRANSIÇÃO SUAVE ENTRE TEMAS
// =========================================================

let trocaTemaEmAndamento = false;

let temporizadorTema = null;


function mudarVisualComDelay(
    callback,
    tipo = "normal",
    delay = 800
) {

    // Evita executar a troca duas vezes
    // ao mesmo tempo.
    if (
        trocaTemaEmAndamento
    ) {

        return;

    }


    trocaTemaEmAndamento =
        true;


    // Cancela qualquer temporizador antigo.
    if (
        temporizadorTema
    ) {

        clearTimeout(
            temporizadorTema
        );

    }


    // Ativa somente a transição das cores.
    document.body.classList.add(
        "theme-transition"
    );


    temporizadorTema =
        setTimeout(
            () => {

                // A mudança acontece UMA vez.
                callback();


                // Aguarda a animação terminar.
                setTimeout(
                    () => {

                        document.body.classList.remove(
                            "theme-transition"
                        );


                        trocaTemaEmAndamento =
                            false;


                        temporizadorTema =
                            null;

                    },
                    1000
                );

            },
            delay
        );

}

// =========================================================
// COMANDO DE TEMA
// =========================================================

function identificarComandoTema(
    texto
) {

    const normalizado =
        normalizarTextoIA(
            texto
        );


    const comandosClaro = [

        "modo claro",

        "tema claro",

        "site claro",

        "fundo claro",

        "ativar modo claro",

        "ative o modo claro",

        "ativar tema claro",

        "mude para modo claro",

        "mudar para modo claro",

        "deixa o site claro",

        "deixe o site claro",

        "quero modo claro",

        "quero tema claro",

        "coloque modo claro",

        "coloca modo claro",

        "light mode"

    ];


    const comandosEscuro = [

        "modo escuro",

        "tema escuro",

        "modo noturno",

        "site escuro",

        "fundo escuro",

        "ativar modo escuro",

        "ative o modo escuro",

        "ativar tema escuro",

        "mude para modo escuro",

        "mudar para modo escuro",

        "deixa o site escuro",

        "deixe o site escuro",

        "quero modo escuro",

        "quero tema escuro",

        "coloque modo escuro",

        "coloca modo escuro",

        "dark mode"

    ];


    if (
        comandosClaro.some(

            comando =>

                normalizado.includes(

                    normalizarTextoIA(
                        comando
                    )

                )

        )
    ) {

        return "claro";

    }


    if (
        comandosEscuro.some(

            comando =>

                normalizado.includes(

                    normalizarTextoIA(
                        comando
                    )

                )

        )
    ) {

        return "escuro";

    }


    return null;

}


// =========================================================
// CONFIGURAR GEEKBOT
// =========================================================

function configurarAssistenteIA() {

    if (
        !aiAssistant ||
        !aiLauncher ||
        !aiChat ||
        !aiChatMessages ||
        !aiChatForm ||
        !aiChatInput
    ) {

        return;

    }


    aiLauncher.addEventListener(
        "click",
        () => {

            if (
                aiChat.classList.contains(
                    "active"
                )
            ) {

                fecharAssistenteIA();

            }

            else {

                abrirAssistenteIA();

            }

        }
    );


    aiChatClose?.addEventListener(
        "click",
        fecharAssistenteIA
    );


    configurarReconhecimentoVoz();


    aiChatForm.addEventListener(
        "submit",
        evento => {

            evento.preventDefault();


            const pergunta =
                aiChatInput
                    .value
                    .trim();


            if (
                !pergunta
            ) {

                return;

            }


            aiChatInput.value =
                "";


            responderTextoLivreIA(
                pergunta
            );

        }
    );


    adicionarMensagemIA(

        "bot",

        "Olá! Eu sou o GeekBot 🤖. Você pode digitar ou tocar no microfone 🎤 e falar comigo."

    );

}


// =========================================================
// ABRIR GEEKBOT
// =========================================================

function abrirAssistenteIA() {

    if (
        !aiChat ||
        !aiLauncher ||
        !aiChatInput
    ) {

        return;

    }


    aiChat.classList.add(
        "active"
    );


    aiChat.setAttribute(
        "aria-hidden",
        "false"
    );


    aiLauncher.setAttribute(
        "aria-expanded",
        "true"
    );


    setTimeout(
        () => {

            aiChatInput.focus();

        },
        150
    );

}


// =========================================================
// FECHAR GEEKBOT
// =========================================================

function fecharAssistenteIA() {

    if (
        !aiChat ||
        !aiLauncher
    ) {

        return;

    }


    if (
        microfoneAtivo &&
        reconhecimentoVoz
    ) {

        cancelarEnvioVoz =
            true;


        reconhecimentoVoz.abort();

    }


    aiChat.classList.remove(
        "active"
    );


    aiChat.setAttribute(
        "aria-hidden",
        "true"
    );


    aiLauncher.setAttribute(
        "aria-expanded",
        "false"
    );

}


// =========================================================
// MENSAGEM DO CHAT
// =========================================================

function adicionarMensagemIA(
    tipo,
    texto
) {

    if (
        !aiChatMessages
    ) {

        return;

    }


    const mensagem =
        document.createElement(
            "div"
        );


    mensagem.className =

        `ai-message ${
            tipo === "user"

                ? "ai-message-user"

                : "ai-message-bot"
        }`;


    const balao =
        document.createElement(
            "div"
        );


    balao.className =
        "ai-message-bubble";


    balao.textContent =
        texto;


    mensagem.appendChild(
        balao
    );


    aiChatMessages.appendChild(
        mensagem
    );


    rolarChatIA();

}


// =========================================================
// DIGITANDO
// =========================================================

function mostrarDigitandoIA(
    callback
) {

    if (
        !aiChatMessages
    ) {

        callback();


        return;

    }


    const digitando =
        document.createElement(
            "div"
        );


    digitando.className =
        "ai-message ai-message-bot";


    digitando.innerHTML = `

        <div class="ai-message-bubble ai-typing">

            <span></span>

            <span></span>

            <span></span>

        </div>

    `;


    aiChatMessages.appendChild(
        digitando
    );


    rolarChatIA();


    setTimeout(
        () => {

            digitando.remove();


            callback();

        },
        600
    );

}


// =========================================================
// ROLAR CHAT
// =========================================================

function rolarChatIA() {

    if (
        aiChatMessages
    ) {

        aiChatMessages.scrollTop =
            aiChatMessages.scrollHeight;

    }

}


// =========================================================
// VOZ DO GEEKBOT
// =========================================================

function falar(
    texto
) {

    if (
        !(
            "speechSynthesis"
            in
            window
        )
    ) {

        return;

    }


    window.speechSynthesis.cancel();


    const fala =
        new SpeechSynthesisUtterance(

            String(
                texto
            )

        );


    fala.lang =
        "pt-BR";


    fala.rate =
        1;


    fala.pitch =
        1;


    window.speechSynthesis.speak(
        fala
    );

}


// =========================================================
// BACKEND DO GEEKBOT
// =========================================================

async function perguntarGeekBotAPI(
    mensagem
) {

    try {

        return await chamarBackend(

            "/api/geekbot",

            {
                mensagem:
                    mensagem
            }

        );

    }

    catch (erro) {

        console.error(
            "Erro ao conectar ao backend:",
            erro
        );


        return {

            sucesso:
                false,

            resposta:
                "Não consegui me conectar ao servidor do GeekBot.",

            resposta_agente:
                "Não consegui me conectar ao servidor do GeekBot.",

            comando_tela:
                "nenhuma"

        };

    }

}


// =========================================================
// RESUMO DO CARRINHO PARA GEEKBOT
// =========================================================

async function criarMensagemCarrinhoServidor() {

    if (
        carrinho.length === 0
    ) {

        return (
            "Seu carrinho está vazio no momento."
        );

    }


    try {

        const cep =

            customerCep
                ?.value
                ?.replace(
                    /\D/g,
                    ""
                )

            ||

            "";


        const resumo =
            await obterResumoSeguro(

                cep.length === 8

                    ? cep

                    : ""

            );


        let mensagem =

            `Você tem ${resumo.quantidade_itens} item(ns) no carrinho. `;


        mensagem +=

            `Subtotal: ${formatarPreco(resumo.subtotal)}.`;


        const desconto =
            Number(

                resumo.desconto?.valor ||

                0

            );


        if (
            desconto > 0
        ) {

            mensagem +=

                ` Desconto: ${formatarPreco(desconto)}.`;

        }


        if (
            resumo.frete?.gratis
        ) {

            mensagem +=

                " Seu pedido tem frete grátis.";

        }

        else if (
            resumo.frete?.calculado
        ) {

            mensagem +=

                ` Frete: ${formatarPreco(resumo.frete.valor)}.`;

        }

        else {

            mensagem +=

                " Informe o CEP no checkout para calcular o frete.";

        }


        if (
            resumo.total != null
        ) {

            mensagem +=

                ` Total: ${formatarPreco(resumo.total)}.`;

        }


        return mensagem;

    }

    catch (erro) {

        console.error(

            "Erro ao consultar carrinho no servidor:",

            erro

        );


        return (

            erro.message ||

            "Não consegui consultar o carrinho agora."

        );

    }

}


// =========================================================
// RESPONDER GEEKBOT
// =========================================================

async function responderTextoLivreIA(
    pergunta
) {

    adicionarMensagemIA(
        "user",
        pergunta
    );


    const texto =
        normalizarTextoIA(
            pergunta
        );


    // =====================================================
    // TEMA
    // =====================================================

    const temaSolicitado =
        identificarComandoTema(
            pergunta
        );


    if (
    temaSolicitado
) {

    mostrarDigitandoIA(
        () => {

            let mensagemPreparando;


            if (
                temaSolicitado ===
                "claro"
            ) {

                mensagemPreparando =
                    "Claro! ☀️ Preparando o Modo Claro...";

            }

            else {

                mensagemPreparando =
                    "Certo! 🌙 Preparando o Modo Escuro...";

            }


            adicionarMensagemIA(
                "bot",
                mensagemPreparando
            );


            falar(
                mensagemPreparando
            );


            mudarVisualComDelay(
                () => {

                    const respostaTema =
                        aplicarTema(
                            temaSolicitado
                        );


                    adicionarMensagemIA(
                        "bot",
                        respostaTema
                    );


                    falar(
                        respostaTema
                    );

                },
                "normal",
                1200
            );

        }
    );


    return;

}


    // =====================================================
    // HUMANO
    // =====================================================

    const pediuHumano = [

        "atendente",

        "assistente humano",

        "atendimento humano",

        "falar com alguem",

        "falar com uma pessoa",

        "falar com atendente",

        "quero um atendente",

        "suporte humano"

    ].some(

        termo =>

            texto.includes(

                normalizarTextoIA(
                    termo
                )

            )

    );


    if (
        pediuHumano
    ) {

        mostrarDigitandoIA(
            () => {

                const respostaHumano =
                    "Claro! Estou te encaminhando para nosso atendimento pelo WhatsApp.";


                adicionarMensagemIA(
                    "bot",
                    respostaHumano
                );


                falar(
                    respostaHumano
                );


                redirecionarHumano();

            }
        );


        return;

    }


    // =====================================================
    // PERGUNTAS SOBRE O CARRINHO
    // =====================================================

    const perguntaCarrinho = [

        "carrinho",

        "quanto estou levando",

        "quanto tenho no carrinho",

        "valor da compra",

        "total da compra",

        "tenho direito",

        "oferta",

        "promocao",

        "desconto",

        "frete"

    ].some(

        termo =>

            texto.includes(

                normalizarTextoIA(
                    termo
                )

            )

    );


    if (
        perguntaCarrinho &&
        carrinho.length > 0
    ) {

        mostrarDigitandoIA(
            async () => {

                const respostaCarrinho =
                    await criarMensagemCarrinhoServidor();


                adicionarMensagemIA(
                    "bot",
                    respostaCarrinho
                );


                falar(
                    respostaCarrinho
                );

            }
        );


        return;

    }


    // =====================================================
    // PYTHON
    // =====================================================

    mostrarDigitandoIA(
        async () => {

            const dados =
                await perguntarGeekBotAPI(
                    pergunta
                );


            const respostaRobo =

                dados.resposta_agente

                ||

                dados.resposta

                ||

                "Não recebi uma resposta do servidor.";


            adicionarMensagemIA(
                "bot",
                respostaRobo
            );


            falar(
                respostaRobo
            );


            console.log(

                "RESPOSTA GEEKBOT:",

                {

                    humor:
                        dados.humor,

                    intencao:
                        dados.intencao,

                    confianca:
                        dados.confianca,

                    comando:
                        dados.comando_tela

                }

            );

// =============================================
// EASTER EGG - LADO SOMBRIO
// =============================================

if (
    dados.comando_tela ===
    "ativar_lado_sombrio"
) {

    mudarVisualComDelay(
        () => {

            ativarLadoSombrio();

        },
        "sombrio",
        900
    );

}

// =============================================
// SAIR DO LADO SOMBRIO
// =============================================

if (
    dados.comando_tela ===
    "desativar_lado_sombrio"
) {

    mudarVisualComDelay(
        () => {

            desativarLadoSombrio();

        },
        "normal",
        800
    );

}
            
            if (
                dados.comando_tela ===
                "abrir_chamado"
            ) {

                redirecionarHumano(

                    "Vim pelo GeekBot da GeekZone. " +
                    "Tive um problema e gostaria de solucionar!"

                );

            }

        }
    );

}


// =========================================================
// RECONHECIMENTO DE VOZ
// =========================================================

function configurarReconhecimentoVoz() {

    if (
        !aiMicButton ||
        !aiChatInput
    ) {

        return;

    }


    const SpeechRecognition =

        window.SpeechRecognition

        ||

        window.webkitSpeechRecognition;


    if (
        !SpeechRecognition
    ) {

        aiMicButton.disabled =
            true;


        aiMicButton.classList.add(
            "unsupported"
        );


        aiMicButton.title =
            "Reconhecimento de voz não disponível neste navegador.";


        return;

    }


    aiMicButton.addEventListener(
        "click",
        () => {

            if (
                microfoneAtivo &&
                reconhecimentoVoz
            ) {

                reconhecimentoVoz.stop();


                return;

            }


            reconhecimentoVoz =
                new SpeechRecognition();


            reconhecimentoVoz.lang =
                "pt-BR";


            reconhecimentoVoz.continuous =
                false;


            reconhecimentoVoz.interimResults =
                true;


            reconhecimentoVoz.maxAlternatives =
                1;


            textoVozFinal =
                "";


            cancelarEnvioVoz =
                false;


            reconhecimentoVoz.onstart =
                () => {

                    microfoneAtivo =
                        true;


                    aiMicButton.classList.add(
                        "active"
                    );


                    aiMicButton.textContent =
                        "🔴";


                    aiMicButton.title =
                        "Ouvindo... clique para parar";


                    aiMicButton.setAttribute(

                        "aria-label",

                        "Ouvindo sua voz"

                    );


                    aiChatInput.value =
                        "";


                    aiChatInput.placeholder =
                        "Fale agora...";

                };


            reconhecimentoVoz.onresult =
                evento => {

                    let textoParcial =
                        "";


                    for (

                        let indice =
                            evento.resultIndex;

                        indice <
                            evento.results.length;

                        indice++

                    ) {

                        const resultado =
                            evento.results[
                                indice
                            ];


                        if (
                            !resultado ||
                            !resultado[0]
                        ) {

                            continue;

                        }


                        const trecho =
                            resultado[0]
                                .transcript;


                        if (
                            resultado.isFinal
                        ) {

                            textoVozFinal =

                                `${textoVozFinal} ${trecho}`

                                    .replace(
                                        /\s+/g,
                                        " "
                                    )

                                    .trim();

                        }

                        else {

                            textoParcial +=
                                `${trecho} `;

                        }

                    }


                    aiChatInput.value =

                        `${textoVozFinal} ${textoParcial}`

                            .replace(
                                /\s+/g,
                                " "
                            )

                            .trim();

                };


            reconhecimentoVoz.onerror =
                evento => {

                    if (
                        evento.error ===
                        "aborted"
                    ) {

                        return;

                    }


                    cancelarEnvioVoz =
                        true;


                    let mensagem =
                        "Não consegui reconhecer sua voz. Tente novamente.";


                    if (

                        evento.error ===
                            "not-allowed"

                        ||

                        evento.error ===
                            "service-not-allowed"

                    ) {

                        mensagem =
                            "O acesso ao microfone foi bloqueado. Permita o microfone no navegador e tente novamente.";

                    }

                    else if (
                        evento.error ===
                        "no-speech"
                    ) {

                        mensagem =
                            "Não detectei nenhuma fala. Clique no microfone e tente novamente.";

                    }

                    else if (
                        evento.error ===
                        "audio-capture"
                    ) {

                        mensagem =
                            "Não consegui acessar o microfone deste dispositivo.";

                    }

                    else if (
                        evento.error ===
                        "network"
                    ) {

                        mensagem =
                            "O reconhecimento de voz teve um problema de conexão. Tente novamente.";

                    }


                    adicionarMensagemIA(
                        "bot",
                        mensagem
                    );

                };


            reconhecimentoVoz.onend =
                () => {

                    const perguntaFalada =

                        (
                            textoVozFinal

                            ||

                            aiChatInput.value
                        )

                            .replace(
                                /\s+/g,
                                " "
                            )

                            .trim();


                    microfoneAtivo =
                        false;


                    aiMicButton.classList.remove(
                        "active"
                    );


                    aiMicButton.textContent =
                        "🎤";


                    aiMicButton.title =
                        "Clique para falar";


                    aiMicButton.setAttribute(

                        "aria-label",

                        "Falar com o GeekBot"

                    );


                    aiChatInput.placeholder =
                        "Digite sua pergunta...";


                    reconhecimentoVoz =
                        null;


                    if (
                        !cancelarEnvioVoz &&
                        perguntaFalada
                    ) {

                        aiChatInput.value =
                            perguntaFalada;


                        setTimeout(
                            () => {

                                aiChatInput.value =
                                    "";


                                responderTextoLivreIA(
                                    perguntaFalada
                                );

                            },
                            450
                        );

                    }


                    textoVozFinal =
                        "";


                    cancelarEnvioVoz =
                        false;

                };


            try {

                reconhecimentoVoz.start();

            }

            catch {

                reconhecimentoVoz =
                    null;


                microfoneAtivo =
                    false;


                aiMicButton.classList.remove(
                    "active"
                );


                aiMicButton.textContent =
                    "🎤";


                aiChatInput.placeholder =
                    "Digite sua pergunta...";


                adicionarMensagemIA(

                    "bot",

                    "Não consegui iniciar o reconhecimento de voz. Tente novamente."

                );

            }

        }
    );

}