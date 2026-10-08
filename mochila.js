// =========================================================
// MOCHILA DE FERRAMENTAS - GEEKZONE
// =========================================================


// =========================================================
// RAIO-X DO CARRINHO
// =========================================================

export function analisarCarrinho(carrinho) {

    if (!Array.isArray(carrinho)) {

        return {
            subtotal: 0,
            quantidadeItens: 0
        };

    }


    const subtotal =
        carrinho.reduce(
            (total, item) => {

                const preco =
                    Number(
                        item.preco || 0
                    );

                const quantidade =
                    Number(
                        item.quantidade || 0
                    );

                return (
                    total +
                    preco * quantidade
                );

            },
            0
        );


    const quantidadeItens =
        carrinho.reduce(
            (total, item) => {

                return (
                    total +
                    Number(
                        item.quantidade || 0
                    )
                );

            },
            0
        );


    return {
        subtotal,
        quantidadeItens
    };

}


// =========================================================
// REGRA DE FRETE PROMOCIONAL
// =========================================================

export function calcularFreteDoCarrinho(
    subtotal
) {

    const valor =
        Number(
            subtotal || 0
        );


    if (
        valor >= 200
    ) {

        return {

            valorFrete:
                0,

            freteGratis:
                true,

            mensagem:
                "Frete Grátis!"

        };

    }


    return {

        valorFrete:
            25,

        freteGratis:
            false,

        mensagem:
            "Frete fixo de R$ 25,00."

    };

}


// =========================================================
// REGRA DE DESCONTO
// =========================================================

export function calcularDescontoDoCarrinho(
    subtotal
) {

    const valor =
        Number(
            subtotal || 0
        );


    if (
        valor > 300
    ) {

        const percentual =
            10;


        const valorDesconto =
            valor *
            (
                percentual /
                100
            );


        const totalComDesconto =
            valor -
            valorDesconto;


        return {

            possuiDesconto:
                true,

            percentual:
                percentual,

            valorDesconto:
                valorDesconto,

            totalComDesconto:
                totalComDesconto,

            mensagem:
                "Você ganhou 10% de desconto!"

        };

    }


    return {

        possuiDesconto:
            false,

        percentual:
            0,

        valorDesconto:
            0,

        totalComDesconto:
            valor,

        mensagem:
            ""

    };

}


// =========================================================
// ANÁLISE COMPLETA
// =========================================================

export function analisarNegocio(
    carrinho
) {

    const raioX =
        analisarCarrinho(
            carrinho
        );


    const frete =
        calcularFreteDoCarrinho(
            raioX.subtotal
        );


    const desconto =
        calcularDescontoDoCarrinho(
            raioX.subtotal
        );


    return {

        subtotal:
            raioX.subtotal,

        quantidadeItens:
            raioX.quantidadeItens,

        frete:
            frete,

        desconto:
            desconto

    };

}


// =========================================================
// MENSAGEM PARA O GEEKBOT
// =========================================================

export function criarMensagemOferta(
    carrinho
) {

    const analise =
        analisarNegocio(
            carrinho
        );


    if (
        analise.quantidadeItens === 0
    ) {

        return (
            "Seu carrinho está vazio no momento."
        );

    }


    let mensagem =
        `Atualmente você possui ${analise.quantidadeItens} item(ns) no carrinho, totalizando ${formatarReal(analise.subtotal)}.`;


    if (
        analise.frete.freteGratis
    ) {

        mensagem +=
            " Você já tem direito a Frete Grátis!";

    }

    else {

        mensagem +=
            ` O frete promocional é de ${formatarReal(analise.frete.valorFrete)}.`;

    }


    if (
        analise.desconto.possuiDesconto
    ) {

        mensagem +=
            ` E tem mais: você ganhou ${analise.desconto.percentual}% de desconto!`;

        mensagem +=
            ` Isso representa ${formatarReal(analise.desconto.valorDesconto)} de desconto.`;

        mensagem +=
            ` Seus produtos ficam por ${formatarReal(analise.desconto.totalComDesconto)}.`;

    }


    return mensagem;

}


// =========================================================
// FORMATAÇÃO
// =========================================================

function formatarReal(
    valor
) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    )
        .format(
            Number(valor) || 0
        );

}