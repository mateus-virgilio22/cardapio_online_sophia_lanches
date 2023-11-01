$(document).ready(function(){
    cardapio.eventos.init();
})

var cardapio = {};

var MEU_CARRINHO = [];

var MEU_ENDERECO = null;

var VALOR_CARRINHO = 0;

var VALOR_ENTREGA = 1.5;

var CELULAR_EMPRESA = '5588996506731';

cardapio.eventos = {

    init: () => {
        cardapio.metodos.obterItensCardapio();
        cardapio.metodos.carregarBotaoReserva();
        cardapio.metodos.carregarBotaoLigar();
    }

}

cardapio.metodos = {

    //Obtem a lista de itens do cardapio
    obterItensCardapio: (categoria = 'cuscuz', vermais = false) => {

        var filtro = MENU[categoria];
        console.log(filtro);

        if(!vermais) {
            $("#itensCardapio").html('');
            $("#btnVerMais").removeClass('hidden');
        }


        $.each(filtro, (i, e) => {

            let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${nome}/g, e.name)
            .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
            .replace(/\${id}/g, e.id)
            .replace(/\${dsc}/g, e.dsc)

            // botão ver mais foi clicado (16 itens)
            if(vermais && i >= 8 && i < 16) {
                $("#itensCardapio").append(temp)
            }

            // paginação inicial (8 itens)
            if(!vermais && i < 8) {
                $("#itensCardapio").append(temp)
            }
            
        })

        // remove o ativo
        $(".container-menu a").removeClass('active');

        // seta o menu para ativo
        $("#menu-" + categoria).addClass('active');

    },

    // clique no botão de ver mais
    verMais: () => {

        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];
        cardapio.metodos.obterItensCardapio(ativo, true);

        $("#btnVerMais").addClass('hidden');

    },

    // diminuir a quantidade do item no cardápio
    diminuirQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if(qntdAtual > 0) {
            $("#qntd-" + id).text(qntdAtual - 1)
        }

    },

    // aumentar a quantidade do item no cardápio
    aumentarQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        $("#qntd-" + id).text(qntdAtual + 1)

    },

    // adicionar ao carrinho o item do cardápio
    adicionarAoCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if(qntdAtual > 0) {
            
            // obter a categoria ativa
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];

            // obter a lista de itens
            let filtro = MENU[categoria];

            // obter o item
            let item = $.grep(filtro, (e, i) => { return e.id == id});

            if(item.length > 0) {
                
                // validar se já existe esse item no carrinho
                let existe = $.grep(MEU_CARRINHO, (elem, index) => { return elem.id == id});

                // caso já exista o item no carrinho, só altera a quantidade
                if(existe.length > 0) {
                    let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
                    MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;
                }
                // caso ainda não exista o item no carrinho, adiciona ele
                else {
                    item[0].qntd = qntdAtual;
                    MEU_CARRINHO.push(item[0])
                }

                cardapio.metodos.mensagem('Item adicionado ao carrinho','green')

                $("#qntd-" + id).text(0);

                cardapio.metodos.atualizarBadgeTotal(0);
                
            }
        }

    },

    // atualiza o badge de totais dos botões "Meu carrinho"
    atualizarBadgeTotal: () => {

        var total = 0;

        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd
        })

        if(total > 0) {
            $(".botao-carrinho").removeClass('hidden');
            $(".container-total-carrinho").removeClass('hidden');
        }
        else {
            $(".botao-carrinho").addClass('hidden');
            $(".container-total-carrinho").addClass('hidden');  
        }

        $(".badge-total-carrinho").html(total);

    },

    // abrir a modal do carrinho
    abrirCarrinho: (abrir) => {

        if(abrir) {
            $("#modalCarrinho").removeClass('hidden');
            cardapio.metodos.carregarCarrinho();
        }
        else {
            $("#modalCarrinho").addClass('hidden');
        }


    },

    // Retirar produto no local
    retirarNoLocal: () => {

        $("#lblTituloEtapa").text('Resumo do pedido: ');
        $("#itemCarrinho").addClass('hidden');
        $("#localEntrega").addClass('hidden');
        $("#resumoCarrinho").removeClass('hidden');

        $(".etapa").removeClass('active');
        $(".etapa1").addClass('active');
        $(".etapa2").addClass('active');
        $(".etapa3").addClass('active');

        $("#btnEtapaPedido").addClass('hidden');
        $("#btnEtapaEndereco").addClass('hidden');
        $("#btnEtapaResumo").removeClass('hidden');
        $("#btnVoltar").removeClass('hidden');
        $("#entrega").addClass('hidden');
        $("#entregaLocal").addClass('hidden');
        $("#btnEnviarRetirada").removeClass('hidden');
        $("#btnEtapaResumo").addClass('hidden');
        $("#img-map").addClass('hidden')

        $("#listaItensResumo").html('');

        $.each(MEU_CARRINHO, (i, e) => {

            let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${qntd}/g, e.qntd)

            $("#listaItensResumo").append(temp);

        });

        VALOR_CARRINHO = 0;

        $("#lblValorTotal").text('R$ 0,00');

        $.each(MEU_CARRINHO, (i, e) => {

            VALOR_CARRINHO += parseFloat(e.price * e.qntd);

            if ((i + 1) == MEU_CARRINHO.length) {

                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO).toFixed(2).replace('.',',')}`);

            }

        })

        $("#retirarNoLocal").addClass('hidden');
        $("#resumoEndereco").addClass('hidden');
        $("#cidadeEndereco").addClass('hidden');

        if (MEU_CARRINHO.length > 0) {

            var texto = 'Olá, gostaria de fazer um pedido:';
            texto += `\n*Itens do pedido:*\n\n\${itens}`;
            texto += `\n\n*Total: R$ ${(VALOR_CARRINHO).toFixed(2).replace('.',',')}*`;
            texto += `\n\n*Vou retirar no local*`

            var itens = '';

            $.each(MEU_CARRINHO, (i, e) => {

                itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.',',')} \n`;

                // último item
                if ((i+1) == MEU_CARRINHO.length) {

                    texto = texto.replace(/\${itens}/g, itens);

                    // converte a url
                    let encode = encodeURI(texto);
                    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

                    $("#btnEnviarRetirada").attr('href', URL);


                }

                

            })

        }

    },

    // altera os textos e exibe os botões das etapas
    carregarEtapa: (etapa) => {

        if (etapa == 1) {

            $("#lblTituloEtapa").text('Seu carrinho: ');
            $("#itemCarrinho").removeClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").addClass('hidden');
            $("#entrega").removeClass('hidden');
            $("#retirarNoLocal").removeClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');

            $("#btnEtapaPedido").removeClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").addClass('hidden');
            $("#btnEnviarRetirada").addClass('hidden');

        }

        if (etapa == 2) {

            $("#lblTituloEtapa").text('Endereço de entrega:');
            $("#itemCarrinho").addClass('hidden');
            $("#localEntrega").removeClass('hidden');
            $("#resumoCarrinho").addClass('hidden');
            $("#entrega").removeClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").removeClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").removeClass('hidden');
            $("#btnEnviarRetirada").addClass('hidden');
            $("#retirarNoLocal").addClass('hidden');

            cardapio.metodos.carregarValores();

        }

        if (etapa == 3) {

            $("#lblTituloEtapa").text('Resumo do pedido: ');
            $("#itemCarrinho").addClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").removeClass('hidden');
            $("#entrega").removeClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            $(".etapa3").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").removeClass('hidden');
            $("#btnVoltar").removeClass('hidden');

        }

    },

    // botão de voltar etapa
    voltarEtapa: () => {

        let etapa = $(".etapa.active").length;
        cardapio.metodos.carregarEtapa(etapa - 1);

    },

    // carrega a lista de itens do carrinho
    carregarCarrinho: () => {

        cardapio.metodos.carregarEtapa(1);

        if (MEU_CARRINHO.length > 0) {

            $("#itemCarrinho").html('');

            $.each(MEU_CARRINHO, (i, e) => {

                let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${id}/g, e.id)
                .replace(/\${qntd}/g, e.qntd)

                $("#itemCarrinho").append(temp);

                // ultimo item 
                if ((i + 1) == MEU_CARRINHO.length) {

                    // atualiza os valores (R$) totais do carrinho
                    cardapio.metodos.carregarValores();

                }

            })

        }
        else {

            $("#itemCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i>Seu carrinho está vazio</p>');
            // atualiza os valores (R$) totais do carrinho
            cardapio.metodos.carregarValores();

        }

    },

    // diminuir quantidade do item do carrinho
    diminuirQuantidadeCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

        if(qntdAtual > 1) {
            $("#qntd-carrinho-" + id).text(qntdAtual - 1)
            cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
        }
        else {
            cardapio.metodos.removerItemCarrinho(id)
        }

    },

    // aumentar quantidade do item do carrinho
    aumentarQuantidadeCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        $("#qntd-carrinho-" + id).text(qntdAtual + 1);
        cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);

    },

    // botão remover item do carrinho
    removerItemCarrinho: (id) => {

        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id != id });
        cardapio.metodos.carregarCarrinho();

        //atualiza o botão carrinho com a quantidade atualizada
        cardapio.metodos.atualizarBadgeTotal();

    },

    // atualiza o carrinho com a quantidade atual
    atualizarCarrinho: (id, qntd) => {

        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
        MEU_CARRINHO[objIndex].qntd = qntd;

        //atualiza o botão carrinho com a quantidade atualizada
        cardapio.metodos.atualizarBadgeTotal();

        // atualiza os valores (R$) totais do carrinho
        cardapio.metodos.carregarValores();

    },

    // carrega os valores de subTotal, Entrega e Total
    carregarValores: () => {

        VALOR_CARRINHO = 0;

        $("#lblSubTotal").text('R$ 0,00');
        $("#lblValorEntrega").text('+ R$ 0,00');
        $("#lblValorTotal").text('R$ 0,00');

        $.each(MEU_CARRINHO, (i, e) => {

            VALOR_CARRINHO += parseFloat(e.price * e.qntd);

            if ((i + 1) == MEU_CARRINHO.length) {

                $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.',',')}`);
                $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace('.',',')}`);
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.',',')}`);

            }

        })

    },

    // carregar a etapa Enderecos
    carregarEndereco: () => {

        if (MEU_CARRINHO.length <= 0) {
            cardapio.metodos.mensagem('Seu carrinho está vazio.')
            return;
        }

        cardapio.metodos.carregarEtapa(2);

    },

    // API ViaCEP
    buscarCep: () => {

        // cria a variável com o valor do cep
        var cep = $("#txtCEP").val().trim().replace(/\D/g, '');

        // verifica se o cep possui valor informado
        if (cep !="") {

            // expressão regular para validar o cep
            var validacep = /^[0-9]{8}$/;

            if (validacep.test(cep)) {

                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {

                    if (!("erro" in dados)) {

                        // atualizar os campos com os valores retornados
                        $("#txtEndereco").val(dados.logradouro).focus();
                        $("#txtBairro").val(dados.bairro);
                        $("#txtCidade").val(dados.localidade);
                        $("#ddlUf").val(dados.uf);
                        $("#txtNumero");

                    }
                    else {

                        cardapio.metodos.mensagem('CEP não encontrado. Preencha as informações manualmente.');
                        $("#txtEndereco").focus();

                    }

                })

            }
            else {

                cardapio.metodos.mensagem('Formato do CEP inválido.');
                $("#txtCEP").focus();

            }

        }
        else {

            cardapio.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus();

        }


    },

    // validação antes de prosseguir para a etapa 3
    resumoPedido: () => {


        let endereco = $("#txtEndereco").val().trim();
        let bairro = $("#txtBairro").val().trim();
        let numero = $("#txtNumero").val().trim();
        let cep = $("#txtCEP").val().trim();
        let cidade = $("#txtCidade").val().trim();
        let uf = $("#ddlUf").val().trim();
        let complemento = $("#txtComplemento").val().trim();

        if (endereco.length <= 0) {
            cardapio.metodos.mensagem('Informe o Endereço, por favor!');
            $("#txtEndereco").focus();
            return;
        }

        if (bairro.length <= 0) {
            cardapio.metodos.mensagem('Informe o Bairro, por favor!');
            $("#txtBairro").focus();
            return;
        }

        if (numero.length <= 0) {
            cardapio.metodos.mensagem('Informe o Número, por favor!');
            $("#txtNumero").focus();
            return;
        }

        MEU_ENDERECO = {

            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento

        }

        cardapio.metodos.carregarEtapa(3);
        cardapio.metodos.carregarResumo();

    },

    // carrega a etapa de resumo do pedido
    carregarResumo: () => {

        $("#listaItensResumo").html('');

        $.each(MEU_CARRINHO, (i, e) => {

            let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${qntd}/g, e.qntd)

            $("#listaItensResumo").append(temp);

        });

        $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`);

        cardapio.metodos.finalizarPedido();

    },

    // atualiza o link do botão do whatsapp
    finalizarPedido: () => {

        if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {

            var texto = 'Olá, gostaria de fazer um pedido:';
            texto += `\n*Itens do pedido:*\n\n\${itens}`;
            texto += `\n*Endereço de entrega:*`;
            texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
            texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
            texto += `\n\n*Total (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.',',')}*`;

            var itens = '';

            $.each(MEU_CARRINHO, (i, e) => {

                itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.',',')} \n`;

                // último item
                if ((i+1) == MEU_CARRINHO.length) {

                    texto = texto.replace(/\${itens}/g, itens);

                    // converte a url
                    let encode = encodeURI(texto);
                    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

                    $("#btnEtapaResumo").attr('href', URL);


                }

                

            })

        }

    },

    // carrega o link do botão reserva
    carregarBotaoReserva: () => {

        var texto = `Olá, gostaria de fazer uma *encomenda de brownies*!`;

        let encode = encodeURI(texto);
        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;
        
        $("#btnReserva").attr('href', URL);

    },

    // carrega o botão de ligar
    carregarBotaoLigar: () => {

        $("#btnLigar").attr('href', `tel:${CELULAR_EMPRESA}`);

    },

    // abre o depoimento
    abrirDepoimento: (depoimento) => {

        $("#depoimento-1").addClass('hidden');
        $("#depoimento-2").addClass('hidden');
        $("#depoimento-3").addClass('hidden');

        $("#btnDepoimento-1").removeClass('active');
        $("#btnDepoimento-2").removeClass('active');
        $("#btnDepoimento-3").removeClass('active');

        $("#depoimento-" + depoimento).removeClass('hidden');
        $('#btnDepoimento-' + depoimento).addClass('active');

    },

    


    // mensagens
    mensagem: (texto, cor = 'red', tempo = 3500) => {

        let id = Math.floor(Date.now() * Math.random()).toString();

        let msg = `<div id="msg-${id}" class=" animated fadeInDown toast ${cor}">${texto}</div>`;

        $("#container-mensagens").append(msg);

        setTimeout(() => {
            $("#msg-" + id).removeClass('fadeInDown');
            $("#msg-" + id).addClass('fadeOutUp');
            setTimeout(() => {
                $("#msg-" + id).remove();
            }, 800);
        }, tempo )

    }

}

cardapio.templates = {

    item: 

    `
        <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp ">
            <div class="card card-item" id="\${id}" >
                <div class="img-produto">
                    <img src="\${img}"/>
                </div>
                <div class="content_title_price">
                    <p class="title-produto">
                        <b>\${nome}</b>
                    </p>
                    <p class="price-produto">
                        <b>R$ \${preco}</b>
                    </p>
                    <p class="dsc-produto">
                        \${dsc}
                    </p>
                </div>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')">
                        <i class="fas fa-minus"></i>
                    </span>

                    <span class="add-numero-itens" id="qntd-\${id}">
                        0
                    </span>

                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')">
                        <i class="fas fa-plus"></i>
                    </span>

                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')">
                        <i class="fas fa-shopping-bag"></i>
                    </span>
                </div>
            </div>
        </div>
    ` ,

    itemCarrinho:
    `
    
                    <div class="col-12 item-carrinho">
                        <div class="img-produto">
                            <img src="\${img}"/>
                        </div>
                        <div class="dados-produto">
                            <p class="title-produto"><b>\${nome}</b></p>
                            <p class="price-produto"><b>R$ \${preco}</b></p>
                        </div>
                        <div class="add-carrinho">
                            <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')">
                            <i class="fas fa-minus"></i>
                            </span>

                            <span class="add-numero-itens" id="qntd-carrinho-\${id}">
                                \${qntd}
                            </span>

                            <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')">
                                <i class="fas fa-plus"></i>
                            </span>
                            <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')">
                                <i class="fas fa-times"></i>
                            </span>
                        </div>
                    </div>

    `,

    itemResumo: 

    `

                            <div class="col-12 item-carrinho resumo">
                                <div class="img-produto-resumo">
                                    <img src="\${img}"/>
                                </div>

                                <div class="dados-produto">
                                    <p class="title-produto-resumo">
                                        <b>\${nome}</b>
                                    </p>
                                    <p class="price-produto-resumo">
                                        <b>R$ \${preco}</b>
                                    </p>
                                </div>

                                <p class="quantidade-produto-resumo">
                                    x <b>\${qntd}</b>
                                </p>
                            </div>

    `

}