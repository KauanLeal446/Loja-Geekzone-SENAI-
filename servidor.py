from flask import Flask, jsonify, request
from flask_cors import CORS
from decimal import Decimal, ROUND_HALF_UP
from thefuzz import process

import re
import requests
import unicodedata


app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "http://127.0.0.1:5501",
                "http://localhost:5501",
                "https://kauanleal446.github.io",
            ]
        }
    },
)

PORTA = 3000
PRECO_POR_KM = Decimal("2.00")

ORIGEM_LOJA = {
    "latitude": -22.92388889,
    "longitude": -45.46166667,
}


# =========================================================
# PRODUTOS OFICIAIS
# =========================================================

PRODUTOS = {
    "mouse-gamer": {
        "nome": "Mouse Gamer",
        "preco": Decimal("149.90"),
        "estoque": 10,
        "categoria": "Gaming",
        "descricao": "Mouse gamer de alta precisão.",
        "imagem": "",
    },

    "teclado-mecanico": {
        "nome": "Teclado Mecânico",
        "preco": Decimal("299.90"),
        "estoque": 8,
        "categoria": "Gaming",
        "descricao": "Teclado mecânico para jogos e produtividade.",
        "imagem": "",
    },

    "headset-gamer": {
        "nome": "Headset Gamer",
        "preco": Decimal("249.90"),
        "estoque": 15,
        "categoria": "Áudio",
        "descricao": "Headset gamer com áudio de alta qualidade.",
        "imagem": "",
    },
}


# =========================================================
# UTILIDADES
# =========================================================

def moeda(valor):
    return Decimal(str(valor)).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def numero_json(valor):
    if valor is None:
        return None

    return float(
        moeda(valor)
    )


def limpar_cep(valor):
    return re.sub(
        r"\D",
        "",
        str(valor or "")
    )[:8]


def validar_quantidade(valor):
    try:
        quantidade = int(valor)

    except (TypeError, ValueError):
        return 0

    if quantidade < 1 or quantidade > 99:
        return 0

    return quantidade


def normalizar_texto(texto):
    texto = str(
        texto or ""
    ).lower().strip()

    texto = unicodedata.normalize(
        "NFD",
        texto
    )

    texto = "".join(
        caractere
        for caractere in texto
        if unicodedata.category(caractere) != "Mn"
    )

    return texto


# =========================================================
# NORMALIZAR ITENS DO CARRINHO
# =========================================================

def normalizar_itens(itens_recebidos):
    if not isinstance(itens_recebidos, list):
        raise ValueError(
            "Lista de produtos inválida."
        )

    if len(itens_recebidos) == 0:
        raise ValueError(
            "O carrinho está vazio."
        )

    if len(itens_recebidos) > 50:
        raise ValueError(
            "Quantidade de produtos inválida."
        )

    acumulados = {}

    for item in itens_recebidos:
        if not isinstance(item, dict):
            raise ValueError(
                "Produto inválido."
            )

        produto_id = str(
            item.get(
                "id",
                ""
            )
        ).strip()

        quantidade = validar_quantidade(
            item.get(
                "quantidade"
            )
        )

        if not produto_id:
            raise ValueError(
                "Produto sem identificador."
            )

        if quantidade <= 0:
            raise ValueError(
                "Quantidade inválida."
            )

        acumulados[produto_id] = (
            acumulados.get(
                produto_id,
                0
            )
            +
            quantidade
        )

        if acumulados[produto_id] > 99:
            raise ValueError(
                "Quantidade inválida."
            )

    return [
        {
            "id": produto_id,
            "quantidade": quantidade,
        }
        for produto_id, quantidade
        in acumulados.items()
    ]


# =========================================================
# PRODUTOS OFICIAIS DO PEDIDO
# =========================================================

def carregar_produtos_oficiais(itens_recebidos):
    itens = normalizar_itens(
        itens_recebidos
    )

    produtos_confirmados = []

    subtotal = Decimal("0.00")

    quantidade_itens = 0

    for item in itens:
        produto_id = item["id"]

        quantidade = item["quantidade"]

        produto = PRODUTOS.get(
            produto_id
        )

        if not produto:
            raise ValueError(
                "Um dos produtos do carrinho não existe."
            )

        nome = produto["nome"]

        preco = moeda(
            produto["preco"]
        )

        estoque = int(
            produto["estoque"]
        )

        if estoque < quantidade:
            raise ValueError(
                f"Estoque insuficiente para {nome}."
            )

        total_item = moeda(
            preco *
            quantidade
        )

        subtotal += total_item

        quantidade_itens += quantidade

        produtos_confirmados.append({
            "id": produto_id,
            "nome": nome,
            "preco": numero_json(
                preco
            ),
            "estoque": estoque,
            "quantidade": quantidade,
            "total": numero_json(
                total_item
            ),
        })

    subtotal = moeda(
        subtotal
    )

    return (
        produtos_confirmados,
        subtotal,
        quantidade_itens,
    )


# =========================================================
# DESCONTO
# =========================================================

def calcular_desconto(subtotal):
    percentual = (
        Decimal("10")
        if subtotal > Decimal("300.00")
        else Decimal("0")
    )

    valor_desconto = moeda(
        subtotal *
        percentual /
        Decimal("100")
    )

    subtotal_com_desconto = moeda(
        subtotal -
        valor_desconto
    )

    return {
        "percentual": float(
            percentual
        ),
        "valor": numero_json(
            valor_desconto
        ),
        "subtotal_com_desconto": numero_json(
            subtotal_com_desconto
        ),
    }


# =========================================================
# CEP E FRETE
# =========================================================

def consultar_cep_e_frete(cep):
    cep_limpo = limpar_cep(
        cep
    )

    if len(cep_limpo) != 8:
        raise ValueError(
            "Digite um CEP válido."
        )

    try:
        resposta_cep = requests.get(
            f"https://brasilapi.com.br/api/cep/v2/{cep_limpo}",
            timeout=10,
        )

    except requests.RequestException as erro:
        raise ValueError(
            "Não foi possível consultar o CEP."
        ) from erro

    if not resposta_cep.ok:
        raise ValueError(
            "CEP não encontrado."
        )

    try:
        dados = resposta_cep.json()

    except ValueError as erro:
        raise ValueError(
            "A consulta do CEP retornou uma resposta inválida."
        ) from erro

    coordenadas = (
        dados.get(
            "location",
            {}
        )
        .get(
            "coordinates",
            {}
        )
    )

    latitude = coordenadas.get(
        "latitude"
    )

    longitude = coordenadas.get(
        "longitude"
    )

    try:
        latitude = float(
            latitude
        )

        longitude = float(
            longitude
        )

    except (TypeError, ValueError) as erro:
        raise ValueError(
            "Não foi possível localizar esse CEP."
        ) from erro

    origem = (
        f"{ORIGEM_LOJA['longitude']},"
        f"{ORIGEM_LOJA['latitude']}"
    )

    destino = (
        f"{longitude},"
        f"{latitude}"
    )

    try:
        resposta_rota = requests.get(
            (
                "https://router.project-osrm.org/"
                f"route/v1/driving/{origem};{destino}"
            ),
            params={
                "overview": "false"
            },
            timeout=10,
        )

    except requests.RequestException as erro:
        raise ValueError(
            "Não foi possível calcular a rota."
        ) from erro

    if not resposta_rota.ok:
        raise ValueError(
            "Não foi possível calcular a rota."
        )

    try:
        rota = resposta_rota.json()

    except ValueError as erro:
        raise ValueError(
            "A rota retornou uma resposta inválida."
        ) from erro

    if (
        rota.get("code") != "Ok"
        or
        not rota.get("routes")
    ):
        raise ValueError(
            "Não foi encontrada uma rota."
        )

    distancia_km = (
        Decimal(
            str(
                rota[
                    "routes"
                ][0][
                    "distance"
                ]
            )
        )
        /
        Decimal("1000")
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    valor_frete = moeda(
        distancia_km *
        PRECO_POR_KM
    )

    return {
        "endereco": {
            "cep":
                cep_limpo,

            "rua":
                dados.get(
                    "street",
                    ""
                ),

            "bairro":
                dados.get(
                    "neighborhood",
                    ""
                ),

            "cidade":
                dados.get(
                    "city",
                    ""
                ),

            "estado":
                dados.get(
                    "state",
                    ""
                ),
        },

        "distancia_km":
            float(
                distancia_km
            ),

        "valor_frete":
            valor_frete,
    }


# =========================================================
# CALCULAR PEDIDO SEGURO
# =========================================================

def calcular_pedido_seguro(
    itens_recebidos,
    cep="",
    exigir_endereco=False,
):
    (
        produtos,
        subtotal,
        quantidade_itens,
    ) = carregar_produtos_oficiais(
        itens_recebidos
    )

    desconto = calcular_desconto(
        subtotal
    )

    subtotal_com_desconto = moeda(
        desconto[
            "subtotal_com_desconto"
        ]
    )

    frete_gratis = (
        subtotal >=
        Decimal("200.00")
    )

    endereco = None

    distancia_km = None

    frete_calculado = False

    valor_frete = None

    cep_limpo = limpar_cep(
        cep
    )

    if frete_gratis:
        frete_calculado = True

        valor_frete = Decimal(
            "0.00"
        )

        if len(cep_limpo) == 8:
            dados_frete = consultar_cep_e_frete(
                cep_limpo
            )

            endereco = dados_frete[
                "endereco"
            ]

            distancia_km = dados_frete[
                "distancia_km"
            ]

        elif exigir_endereco:
            raise ValueError(
                "Informe um CEP válido."
            )

    elif cep_limpo:
        dados_frete = consultar_cep_e_frete(
            cep_limpo
        )

        endereco = dados_frete[
            "endereco"
        ]

        distancia_km = dados_frete[
            "distancia_km"
        ]

        valor_frete = dados_frete[
            "valor_frete"
        ]

        frete_calculado = True

    elif exigir_endereco:
        raise ValueError(
            "Informe um CEP válido."
        )

    total = None

    if frete_calculado:
        total = moeda(
            subtotal_com_desconto
            +
            (
                valor_frete
                or
                Decimal("0.00")
            )
        )

    return {
        "produtos":
            produtos,

        "quantidade_itens":
            quantidade_itens,

        "subtotal":
            numero_json(
                subtotal
            ),

        "desconto": {
            "percentual":
                desconto[
                    "percentual"
                ],

            "valor":
                desconto[
                    "valor"
                ],
        },

        "subtotal_com_desconto":
            numero_json(
                subtotal_com_desconto
            ),

        "frete": {
            "gratis":
                frete_gratis,

            "calculado":
                frete_calculado,

            "valor":
                numero_json(
                    valor_frete
                ),

            "distancia_km":
                distancia_km,
        },

        "endereco":
            endereco,

        "total":
            numero_json(
                total
            ),
    }


# =========================================================
# INTELIGÊNCIA DO GEEKBOT
# =========================================================

palavras_positivas = [
    "bom",
    "otimo",
    "legal",
    "amei",
    "incrivel",
    "adoro",
    "perfeito",
    "top",
]


palavras_negativas = [
    "caro",
    "horrivel",
    "ruim",
    "odeio",
    "lixo",
    "demora",
    "pessimo",
    "raiva",
    "absurdo",
    "procon",
]


def analisar_humor(frase):
    pontuacao = 0

    palavras = normalizar_texto(
        frase
    ).split()

    for palavra in palavras:
        palavra = palavra.strip(
            ".,!?;:"
        )

        if palavra in palavras_positivas:
            pontuacao += 1

        elif palavra in palavras_negativas:
            pontuacao -= 1

    return pontuacao


# =========================================================
# INTENÇÕES
# =========================================================

matriz_de_intencoes = {
    "saudacao": {
        "treino": [
            "ola",
            "oi",
            "bom dia",
            "boa tarde",
            "boa noite",
            "fala ai",
        ],

        "resposta_feliz":
            "Saudações, Mestre Jedi! Bem-vindo à GeekZone. 😄",

        "resposta_neutra":
            "Saudações! Bem-vindo à GeekZone. Como posso ajudar?",
    },


    "frete": {
        "treino": [
            "qual o valor do frete",
            "entrega em casa",
            "frete gratis",
            "demora a entrega",
            "como funciona o frete",
        ],

        "resposta_feliz":
            "Boa notícia! Compras a partir de R$ 200,00 têm frete grátis! 🚀",

        "resposta_neutra":
            "O frete é calculado usando seu CEP. Compras a partir de R$ 200,00 têm frete grátis.",
    },


    "catalogo": {
        "treino": [
            "o que voces vendem",
            "produtos",
            "catalogo",
            "quais produtos tem",
            "o que tem na loja",
        ],

        "resposta_feliz":
            "Temos vários produtos legais disponíveis na GeekZone! 😄",

        "resposta_neutra":
            "Posso te mostrar os produtos disponíveis na GeekZone.",
    },


    "desconto": {
        "treino": [
            "tem desconto",
            "tem promocao",
            "tem cupom",
            "posso ter desconto",
            "como funciona o desconto",
        ],

        "resposta_feliz":
            "Sim! Compras acima de R$ 300,00 recebem 10% de desconto. 🤑",

        "resposta_neutra":
            "Compras acima de R$ 300,00 recebem 10% de desconto.",
    },


    "estoque": {
        "treino": [
            "tem estoque",
            "produto disponivel",
            "ainda tem produto",
            "quantidade em estoque",
        ],

        "resposta_feliz":
            "Posso verificar os produtos disponíveis para você! 📦",

        "resposta_neutra":
            "O estoque disponível aparece nos produtos da GeekZone.",
    },


    "pagamento": {
        "treino": [
            "como pagar",
            "forma de pagamento",
            "aceita pix",
            "aceita cartao",
            "pagamento",
        ],

        "resposta_feliz":
            "Posso te orientar sobre as formas de pagamento. 💳",

        "resposta_neutra":
            "As formas de pagamento podem ser confirmadas com nossa equipe.",
    },
}


def montar_catalogo_texto():
    itens = []

    for produto in PRODUTOS.values():
        preco = numero_json(
            produto[
                "preco"
            ]
        )

        itens.append(
            f"{produto['nome']} "
            f"(R$ {preco:.2f})"
        )

    return ", ".join(
        itens
    )

# =========================================================
# SAIR DO EASTER EGG
# =========================================================

def detectar_retorno_tema_normal(texto):

    texto = normalizar_texto(
        texto
    )

    comandos_retorno = [
        "voltar para o padrao da loja",
        "voltar ao padrao da loja",
        "voltar para o padrao",
        "voltar ao padrao",
        "voltar para o normal",
        "voltar ao normal",
        "quero voltar ao normal",
        "quero voltar para o normal",
        "sair do lado sombrio",
        "desativar lado sombrio",
        "desative o lado sombrio",
        "tirar modo sith",
        "sair do modo sith",
        "restaurar tema",
        "restaurar o tema",
        "tema normal",
        "modo normal",
        "voltar como estava",
        "volte como estava",
    ]

    return any(
        comando in texto
        for comando in comandos_retorno
    )

# =========================================================
# EASTER EGG - LADO SOMBRIO
# =========================================================

def detectar_lado_sombrio(texto):

    texto = normalizar_texto(
        texto
    )

    palavras_sombrias = [
        "darth vader",
        "vader",
        "sith",
        "lado negro",
        "lado sombrio",
        "lado escuro",
        "dark side",
    ]

    return any(
        palavra in texto
        for palavra in palavras_sombrias
    )

def responder_geekbot(
    mensagem_cliente
):
    mensagem_normalizada = normalizar_texto(
        mensagem_cliente
    )

    # =====================================================
    # SAIR DO LADO SOMBRIO
    # IMPORTANTE: vem antes da ativação
    # =====================================================

    if detectar_retorno_tema_normal(
        mensagem_cliente
    ):

        return {

            "resposta":
                (
                    "Como desejar. A GeekZone está "
                    "voltando ao seu visual normal. ⚡"
                ),

            "resposta_agente":
                (
                    "Como desejar. A GeekZone está "
                    "voltando ao seu visual normal. ⚡"
                ),

            "comando_tela":
                "desativar_lado_sombrio",

            "humor":
                0,

            "intencao":
                "tema_normal",

            "confianca":
                100,

        }

    # =====================================================
    # EASTER EGG - LADO SOMBRIO
    # =====================================================

    if detectar_lado_sombrio(
        mensagem_cliente
    ):

        return {

            "resposta":
                (
                    "Você demonstrou interesse pelo Lado Sombrio... "
                    "A GeekZone acaba de mudar de lado. 🔴"
                ),

            "resposta_agente":
                (
                    "Você demonstrou interesse pelo Lado Sombrio... "
                    "A GeekZone acaba de mudar de lado. 🔴"
                ),

            "comando_tela":
                "ativar_lado_sombrio",

            "humor":
                0,

            "intencao":
                "lado_sombrio",

            "confianca":
                100,

        }

    # =========================================================
# SAIR DO EASTER EGG
# =========================================================

def detectar_retorno_tema_normal(texto):

    texto = normalizar_texto(
        texto
    )

    comandos_retorno = [
        "voltar para o padrao da loja",
        "voltar ao padrao da loja",
        "voltar para o padrao",
        "voltar ao padrao",
        "voltar para o normal",
        "voltar ao normal",
        "quero voltar ao normal",
        "quero voltar para o normal",
        "sair do lado sombrio",
        "desativar lado sombrio",
        "desative o lado sombrio",
        "tirar modo sith",
        "sair do modo sith",
        "restaurar tema",
        "restaurar o tema",
        "tema normal",
        "modo normal",
        "voltar como estava",
        "volte como estava",
    ]

    return any(
        comando in texto
        for comando in comandos_retorno
    )

    melhor_intencao = None

    maior_pontuacao = 0

    for intencao, dados in matriz_de_intencoes.items():
        resultado = process.extractOne(
            mensagem_normalizada,
            dados[
                "treino"
            ],
        )

        if resultado is None:
            continue

        _, pontuacao = resultado

        if pontuacao > maior_pontuacao:
            maior_pontuacao = pontuacao

            melhor_intencao = intencao

    polaridade = analisar_humor(
        mensagem_cliente
    )

    acao_especial = "nenhuma"

    if polaridade < 0:
        resposta_final = (
            "Sinto muito que esteja frustrado. "
            "Estou te encaminhando para nosso atendimento humano "
            "para tentarmos resolver isso da melhor forma."
        )

        acao_especial = "abrir_chamado"

    elif (
        maior_pontuacao >= 60
        and
        melhor_intencao
    ):
        if melhor_intencao == "catalogo":
            resposta_final = (
                "No catálogo atual temos: "
                +
                montar_catalogo_texto()
                +
                "."
            )

        elif polaridade > 0:
            resposta_final = (
                matriz_de_intencoes[
                    melhor_intencao
                ][
                    "resposta_feliz"
                ]
            )

        else:
            resposta_final = (
                matriz_de_intencoes[
                    melhor_intencao
                ][
                    "resposta_neutra"
                ]
            )

    else:
        resposta_final = (
            "Bip bop! Ainda não consegui entender muito bem. "
            "Você pode perguntar sobre produtos, frete, desconto, "
            "estoque ou pagamento."
        )

    return {
        "resposta":
            resposta_final,

        "resposta_agente":
            resposta_final,

        "comando_tela":
            acao_especial,

        "humor":
            polaridade,

        "intencao":
            melhor_intencao,

        "confianca":
            maior_pontuacao,
    }


# =========================================================
# STATUS
# =========================================================

@app.route(
    "/api/status",
    methods=["GET"]
)
def status():
    return jsonify({
        "status":
            200,

        "servidor":
            "online",

        "robo":
            "GeekBot",
    })


# =========================================================
# PRODUTOS
# =========================================================

@app.route(
    "/api/produtos",
    methods=["GET"]
)
def listar_produtos():
    lista = []

    for produto_id, produto in PRODUTOS.items():
        lista.append({
            "id":
                produto_id,

            "nome":
                produto[
                    "nome"
                ],

            "preco":
                numero_json(
                    produto[
                        "preco"
                    ]
                ),

            "estoque":
                produto[
                    "estoque"
                ],

            "categoria":
                produto[
                    "categoria"
                ],

            "descricao":
                produto[
                    "descricao"
                ],

            "imagem":
                produto[
                    "imagem"
                ],
        })

    return jsonify({
        "sucesso":
            True,

        "produtos":
            lista,
    })


# =========================================================
# CALCULAR PEDIDO
# =========================================================

@app.route(
    "/api/calcular-pedido",
    methods=["POST"]
)
def calcular_pedido():
    pacote = (
        request.get_json(
            silent=True
        )
        or
        {}
    )

    try:
        resumo = calcular_pedido_seguro(
            pacote.get(
                "produtos",
                []
            ),
            pacote.get(
                "cep",
                ""
            ),
        )

        return jsonify({
            "sucesso":
                True,

            **resumo,
        })

    except ValueError as erro:
        return jsonify({
            "sucesso":
                False,

            "erro":
                str(
                    erro
                ),
        }), 400

    except Exception as erro:
        print(
            "Erro ao calcular pedido:",
            erro
        )

        return jsonify({
            "sucesso":
                False,

            "erro":
                "Não foi possível calcular o pedido.",
        }), 500


# =========================================================
# FINALIZAR PEDIDO
# =========================================================

@app.route(
    "/api/finalizar-pedido",
    methods=["POST"]
)
def finalizar_pedido():
    pacote = (
        request.get_json(
            silent=True
        )
        or
        {}
    )

    cliente = (
        pacote.get(
            "cliente",
            {}
        )
        or
        {}
    )

    endereco_cliente = (
        pacote.get(
            "endereco",
            {}
        )
        or
        {}
    )

    nome = str(
        cliente.get(
            "nome",
            ""
        )
    ).strip()

    telefone = str(
        cliente.get(
            "telefone",
            ""
        )
    ).strip()

    email = str(
        cliente.get(
            "email",
            ""
        )
    ).strip()

    cep = limpar_cep(
        endereco_cliente.get(
            "cep",
            ""
        )
    )

    numero = str(
        endereco_cliente.get(
            "numero",
            ""
        )
    ).strip()

    complemento = str(
        endereco_cliente.get(
            "complemento",
            ""
        )
    ).strip()

    if not nome:
        return jsonify({
            "sucesso":
                False,

            "erro":
                "Informe o nome.",
        }), 400

    if not telefone:
        return jsonify({
            "sucesso":
                False,

            "erro":
                "Informe o telefone.",
        }), 400

    if not email:
        return jsonify({
            "sucesso":
                False,

            "erro":
                "Informe o e-mail.",
        }), 400

    if len(cep) != 8:
        return jsonify({
            "sucesso":
                False,

            "erro":
                "Informe um CEP válido.",
        }), 400

    if not numero:
        return jsonify({
            "sucesso":
                False,

            "erro":
                "Informe o número do endereço.",
        }), 400

    try:
        resumo = calcular_pedido_seguro(
            pacote.get(
                "produtos",
                []
            ),
            cep,
            exigir_endereco=True,
        )

        endereco_oficial = (
            resumo.get(
                "endereco"
            )
            or
            {}
        )

        endereco_oficial[
            "numero"
        ] = numero

        endereco_oficial[
            "complemento"
        ] = complemento

        pedido = {
            "cliente": {
                "nome":
                    nome,

                "telefone":
                    telefone,

                "email":
                    email,
            },

            "endereco":
                endereco_oficial,

            "produtos":
                resumo[
                    "produtos"
                ],

            "subtotal":
                resumo[
                    "subtotal"
                ],

            "desconto":
                resumo[
                    "desconto"
                ],

            "subtotal_com_desconto":
                resumo[
                    "subtotal_com_desconto"
                ],

            "frete":
                resumo[
                    "frete"
                ],

            "total":
                resumo[
                    "total"
                ],
        }

        return jsonify({
            "sucesso":
                True,

            "mensagem":
                "Pedido validado pelo servidor.",

            "pedido":
                pedido,
        })

    except ValueError as erro:
        return jsonify({
            "sucesso":
                False,

            "erro":
                str(
                    erro
                ),
        }), 400

    except Exception as erro:
        print(
            "Erro ao finalizar pedido:",
            erro
        )

        return jsonify({
            "sucesso":
                False,

            "erro":
                "Não foi possível finalizar o pedido.",
        }), 500


# =========================================================
# GEEKBOT
# =========================================================

@app.route(
    "/api/geekbot",
    methods=["POST"]
)
@app.route(
    "/api/cerebro",
    methods=["POST"]
)
def processar_mensagem():
    pacote = (
        request.get_json(
            silent=True
        )
        or
        {}
    )

    mensagem = str(
        pacote.get(
            "mensagem",
            ""
        )
    ).strip()

    if not mensagem:
        return jsonify({
            "sucesso":
                False,

            "resposta":
                "Digite uma mensagem.",

            "resposta_agente":
                "Digite uma mensagem.",

            "comando_tela":
                "nenhuma",
        }), 400

    resultado = responder_geekbot(
        mensagem
    )

    return jsonify({
        "sucesso":
            True,

        **resultado,
    })


# =========================================================
# INICIAR
# =========================================================

if __name__ == "__main__":
    print(
        "======================================"
    )

    print(
        "🔐 SERVIDOR GEEKZONE ATIVADO!"
    )

    print(
        f"🌐 http://127.0.0.1:{PORTA}"
    )

    print(
        "======================================"
    )

    app.run(
        host="127.0.0.1",
        port=PORTA,
        debug=True,
    )
