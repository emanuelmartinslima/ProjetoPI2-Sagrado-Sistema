const Contrato = require("../models/contratoModel");
const calendarioController = require("./calendarioController");
const Cliente = require("../models/clienteModel");
const Usuario = require("../models/usuarioModel")
const ListaProdutos = require("../models/listaProdutos");
const Produto = require("../models/produtoModel");
const Items = require("../models/itemModel");
const Parcela = require("../models/parcelaModel");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { google } = require("googleapis");
const { Op } = require('sequelize'); 

exports.atualizarPagamentos = async (req, res) => {
    const { contratos, parcelas } = req.body;  // Recebendo contratos e parcelas

    // Verifica se os dados são válidos
    if ((!contratos || !Array.isArray(contratos)) && (!parcelas || !Array.isArray(parcelas))) {
        return res.status(400).json({ message: "Dados inválidos." });
    }

    try {
        // Atualizar contratos
        const atualizacoesContratos = contratos.map(async (contrato) => {
            // Atualiza o campo 'pago' do contrato
            await Contrato.update(
                { pago: contrato.pago },
                { where: { id: contrato.id } }
            );

            // Se o contrato estiver marcado como pago, marca as parcelas também
            if (contrato.pago) {
                const parcelasDoContrato = await Parcela.findAll({ where: { contratoId: contrato.id } });
                const atualizacoesParcelas = parcelasDoContrato.map(async (parcela) => {
                    await Parcela.update(
                        { pago: true },
                        { where: { id: parcela.id } }
                    );
                });
                await Promise.all(atualizacoesParcelas);
            }
        });

        // Atualizar parcelas separadas
        const atualizacoesParcelas = parcelas.map(async (parcela) => {
            await Parcela.update(
                { pago: parcela.pago },
                { where: { id: parcela.id } }
            );
        });

        // Aguarda todas as atualizações de contratos e parcelas
        await Promise.all([...atualizacoesContratos, ...atualizacoesParcelas]);

        // Agora, verificamos se todas as parcelas de cada contrato estão pagas
        const contratosParaAtualizar = await Contrato.findAll({
            where: { id: { [Op.in]: contratos.map(c => c.id) } },
            include: [{
                model: Parcela,
                required: true,
                where: { pago: false }, // Verifica se há parcelas não pagas
            }]
        });

        // Para cada contrato, vamos verificar se todas as suas parcelas estão pagas
        for (const contrato of contratosParaAtualizar) {
            const parcelasDoContrato = await Parcela.findAll({ where: { contratoId: contrato.id } });

            // Se todas as parcelas estão pagas, atualiza o contrato
            const todasParcelasPagas = parcelasDoContrato.every(parcela => parcela.pago);

            if (todasParcelasPagas) {
                await Contrato.update({ pago: true }, { where: { id: contrato.id } });
            }
        }

        res.json({ message: "Pagamentos de contratos e parcelas atualizados com sucesso." });
    } catch (error) {
        console.error("Erro ao atualizar pagamentos:", error);
        res.status(500).json({ message: "Erro ao atualizar pagamentos." });
    }
};

exports.buscarContratosPagamentos = async (req, res) => {
    const token = req.cookies.token;
    const secret = process.env.SECRET;
    const payloadToken = jwt.verify(token, secret);

    try {
        const contratosList = await Contrato.findAll({
            where: { idOperador: payloadToken.id, pago: false },
            include: {
                model: Parcela,
                where: { pago: false }, // Exibe apenas parcelas não pagas
                required: false, // Permite contratos sem parcelas
            }
        });

        const contratosComDetalhes = await Promise.all(contratosList.map(async (contrato) => {
            const cliente = await Cliente.findByPk(contrato.idCliente);
            return {
                ...contrato.toJSON(),
                nomeCliente: cliente ? cliente.nome : "Cliente não encontrado",
                contatoCLiente: cliente ? cliente.contato : "Contato não encontrado",
                parcelas: contrato.parcelas // Inclui as parcelas
            };
        }));

        console.log("Contratos com parcelas e nome do cliente:", contratosComDetalhes);
        res.json(contratosComDetalhes);
    } catch (error) {
        console.error("Erro ao buscar contratos:", error);
        res.status(500).json({ message: "Erro ao buscar contratos." });
    }
};

exports.buscarVendasEspecifico = async (req, res) => {
    console.log(`isso é um teste`);

    try {
        // Pegue os parâmetros da URL
        const { cpfOperador, mes, ano } = req.params;

        if (!cpfOperador || !mes || !ano) {
            console.log(`Erro: Parâmetros insuficientes!`);
            return res.status(400).json({ message: "CPF do operador, mês ou ano não fornecidos." });
        }

        // Verificando os parâmetros
        console.log(`Buscando vendas do operador com CPF ${cpfOperador} para o mês ${mes} e ano ${ano}`);

        // Buscar o operador pelo CPF
        const operador = await Usuario.findOne({
            where: { cpf: cpfOperador }  // Buscar pelo CPF do operador
        });

        if (!operador) {
            console.log(`Erro: Operador não encontrado!`);
            return res.status(404).json({ message: "Operador não encontrado." });
        }

        // Agora que temos o idOperador, vamos buscar os contratos
        const contratosList = await Contrato.findAll({
            where: {
                idOperador: operador.id,  // Usar o idOperador encontrado
                createdAt: {
                    [Op.gte]: new Date(`${ano}-${mes}-01`),  // Início do mês
                    [Op.lt]: new Date(`${ano}-${parseInt(mes) + 1}-01`),  // Início do próximo mês
                }
            }
        });

        if (contratosList.length === 0) {
            console.log(`Nenhum contrato encontrado para este operador no período.`);
            return res.status(404).json({ message: "Nenhum contrato encontrado para o operador neste período." });
        }

        const contratosComNomeCliente = await Promise.all(contratosList.map(async (contrato) => {
            // Buscar dados do cliente associado ao contrato
            const cliente = await Cliente.findByPk(contrato.idCliente);

            // Buscar lista de produtos associada ao contrato
            const listaProdutos = await ListaProdutos.findOne({
                where: { id: contrato.id }
            });

            const valorTotalContrato = listaProdutos ? listaProdutos.valorTotal : 0;

            // Buscar os itens (produtos) associados à lista de produtos
            const itens = await Items.findAll({
                where: { lista: listaProdutos ? listaProdutos.id : null }
            });

            // Obter detalhes dos produtos
            const produtos = await Promise.all(itens.map(async (item) => {
                const produto = await Produto.findByPk(item.produtoId);
                return {
                    nomeProduto: produto ? produto.nome : "Produto não encontrado",
                };
            }));

            // Formatando a data da venda
            const dataVenda = contrato.createdAt.toISOString().split('T')[0];

            return {
                ...contrato.toJSON(),
                nomeCliente: cliente ? cliente.nome : "Cliente não encontrado",
                valorTotal: valorTotalContrato,
                dataVenda: dataVenda,
                produtos: produtos,
                comissao: (valorTotalContrato * 2) / 100
            };
        }));

        console.log("Contratos encontrados:", contratosComNomeCliente);
        res.json(contratosComNomeCliente);

    } catch (error) {
        console.error("Erro ao buscar contratos:", error);
        res.status(500).json({ message: "Erro ao buscar contratos." });
    }
};

exports.buscarVendasGeral = async (req, res) => {

    try {
        const contratosList = await Contrato.findAll({});

        const contratosComNomeCliente = await Promise.all(contratosList.map(async (contrato) => {
            const cliente = await Cliente.findByPk(contrato.idCliente);
            
            const listaProdutos = await ListaProdutos.findOne({
                where: { id: contrato.id }
            });

            const valorTotalContrato = listaProdutos ? listaProdutos.valorTotal : 0;

            const itens = await Items.findAll({
                where: { lista: listaProdutos ? listaProdutos.id : null }
            });
            const produtos = await Promise.all(itens.map(async (item) => {
                const produto = await Produto.findByPk(item.produtoId);
                return {
                    nomeProduto: produto ? produto.nome : "Produto não encontrado",
                };
            }));
            const dataVenda = contrato.createdAt.toISOString().split('T')[0];

            return {
                ...contrato.toJSON(),
                nomeCliente: cliente ? cliente.nome : "Cliente não encontrado",
                valorTotal: valorTotalContrato,
                dataVenda: dataVenda,
                produtos: produtos,
                comissao: (valorTotalContrato * 2) / 100
            };
        }));
        console.log("Contratos com nome do cliente, valor total e produtos:", contratosComNomeCliente);
        res.json(contratosComNomeCliente);
    } catch (error) {
        console.error("Erro ao buscar contratos:", error);
        res.status(500).json({ message: "Erro ao buscar contratos." });
    }
};

exports.buscarVendas = async (req, res) => {
    const token = req.cookies.token;
    const secret = process.env.SECRET;
    const payloadToken = jwt.verify(token, secret);

    try {
        const contratosList = await Contrato.findAll({
            where: { idOperador: payloadToken.id }
        });

        const contratosComNomeCliente = await Promise.all(contratosList.map(async (contrato) => {
            const cliente = await Cliente.findByPk(contrato.idCliente);
            
            const listaProdutos = await ListaProdutos.findOne({
                where: { id: contrato.id }
            });

            const valorTotalContrato = listaProdutos ? listaProdutos.valorTotal : 0;

            const itens = await Items.findAll({
                where: { lista: listaProdutos ? listaProdutos.id : null }
            });
            const produtos = await Promise.all(itens.map(async (item) => {
                const produto = await Produto.findByPk(item.produtoId);
                return {
                    nomeProduto: produto ? produto.nome : "Produto não encontrado",
                };
            }));
            const dataVenda = contrato.createdAt.toISOString().split('T')[0];

            return {
                ...contrato.toJSON(),
                nomeCliente: cliente ? cliente.nome : "Cliente não encontrado",
                valorTotal: valorTotalContrato,
                dataVenda: dataVenda,
                produtos: produtos,
                comissao: (valorTotalContrato * 2) / 100
            };
        }));
        console.log("Contratos com nome do cliente, valor total e produtos:", contratosComNomeCliente);
        res.json(contratosComNomeCliente);
    } catch (error) {
        console.error("Erro ao buscar contratos:", error);
        res.status(500).json({ message: "Erro ao buscar contratos." });
    }
};

exports.buscarContratos = async (req, res) => {
    const token = req.cookies.token;
    const secret = process.env.SECRET;
    const payloadToken = jwt.verify(token, secret);

    try {
        const contratosList = await Contrato.findAll({
            where: { idOperador: payloadToken.id }
        });

        const contratosComNomeCliente = await Promise.all(contratosList.map(async (contrato) => {
            const cliente = await Cliente.findByPk(contrato.idCliente);
            return {
                ...contrato.toJSON(),
                nomeCliente: cliente ? cliente.nome : "Cliente não encontrado",
                idDocumento: contrato.idDocumento
            };
        }));
        console.log("Contratos com nome do cliente:", contratosComNomeCliente);
        res.json(contratosComNomeCliente);
    } catch (error) {
        console.error("Erro ao buscar contratos:", error);
        res.status(500).json({ message: "Erro ao buscar contratos." });
    }
};

exports.buscarContratosGeral = async (req, res) => {
    try {
        const contratosList = await Contrato.findAll();
        const contratosComNomeCliente = await Promise.all(contratosList.map(async (contrato) => {
            const cliente = await Cliente.findByPk(contrato.idCliente);
            const operador = await Usuario.findByPk(contrato.idOperador);
            return {
                ...contrato.toJSON(),
                nomeCliente: cliente ? cliente.nome : "Cliente não encontrado",
                nomeOperador: operador ? operador.nome : "Operador não encontrado",
                idDocumento: contrato.idDocumento
            };
        }));
        console.log("Contratos com nome do cliente:", contratosComNomeCliente);
        res.json(contratosComNomeCliente);
    } catch (error) {
        console.error("Erro ao buscar contratos:", error);
        res.status(500).json({ message: "Erro ao buscar contratos." });
    }
};

exports.registrarContrato = async (req, res) => {
    const { 
        cpfCnpj, 
        dataEvento, 
        horarioMontagem, 
        horarioEncerramento, 
        enderecoEvento, 
        quantidadeProdutos, 
        formaPagamento, 
        dataPagamento, 
        numeroParcelas, 
        valorTotal, 
        pixParceladoDatas 
    } = req.body;

    const cliente = await Cliente.findOne({ where: { cpfCnpj: cpfCnpj } });
    const token = req.cookies.token;
    const secret = process.env.SECRET;
    const payloadToken = jwt.verify(token, secret);

    const lista = await ListaProdutos.create({
        valorTotal: valorTotal
    });

    const produtos = req.body.produtos;

    for (const produto of produtos) {
        const produtoSelecionado = await Produto.findOne({ where: { id: produto } });
        await Items.create({
            produtoId: produtoSelecionado.id,
            valor: produtoSelecionado.valorUnidade,
            lista: lista.id
        });
    }

    const contrato = await Contrato.create({
        idCliente: cliente.id,
        idOperador: payloadToken.id,
        valor: valorTotal,
        horarioMontagem: horarioMontagem,
        horarioEncerramento: horarioEncerramento,
        enderecoEvento: enderecoEvento,
        dataEvento: dataEvento,
        quantidadeProdutos: quantidadeProdutos,
        formaPagamento: formaPagamento,
        dataPagamento: dataPagamento,
        numeroParcelas: numeroParcelas,
        lista: lista.id,
        pago: false
    });

    if (formaPagamento === "Pix Parcelado" && pixParceladoDatas) {
        const datasParcelas = JSON.parse(pixParceladoDatas);
        for (const data of datasParcelas) {
            await Parcela.create({
                contratoId: contrato.id,
                dataPagamento: data,
                valorParcela: valorTotal / datasParcelas.length
            });
        }
    }

    if (!contrato) {
        console.log("Erro: ", error);
        return;
    }

    console.log("Contrato criado com sucesso!");
    await criarDocumentoContrato(contrato, lista);
    calendarioController.gerarEventoContrato(contrato, lista);

    res.redirect("/telaInicial");
};


const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

async function criarDocumentoContrato(contrato, lista) {
    const creds = fs.readFileSync('creds.json');
    const tokens = JSON.parse(creds);
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const docs = google.docs({ version: 'v1', auth: oauth2Client });
    const cliente = await Cliente.findOne({ where: { id: contrato.idCliente } });

    const items = await Items.findAll({ where: { lista: lista.id } });

    let paragrafoProdutos = "";
    for (const item of items) {
        const produtoItem = await Produto.findOne({ where: { id: item.produtoId } });
        paragrafoProdutos += `Item Escolhido: ${produtoItem.nome}\nDimensões Aproximadas: ${produtoItem.dimensoes}\nObs:\n`;
    }

    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const mesString = mesParaString(mes);
    const dia = String(data.getDate()).padStart(2, '0');

    const dataFormatada = `${dia}${mes}`;
    const dataEventoArray = contrato.dataEvento.split("-");
    const dataEvento = `${dataEventoArray[2]}/${dataEventoArray[1]}/${dataEventoArray[0]}`;

    const nomeDocumento = `${contrato.id}-Contrato ${dataFormatada}${contrato.id} ${cliente.nome}`;

    const copiaDocumento = await drive.files.copy({
        fileId: '1yYsbk87kuPZlaYT5t2pWT6L8ArvcYiZBESNZtOhMksg',
        requestBody: {
            name: nomeDocumento,
            name: nomeDocumento,
        }
    });

    const request = [
        {
            replaceAllText: {
                containsText: {
                    text: '{{nomeCliente}}',
                    matchCase: true
                },
                replaceText: `${cliente.nome}`
            }
        },
        {
            replaceAllText: {
                containsText: {
                    text: '{{cpfCnpj}}',
                    matchCase: true
                },
                replaceText: `${cliente.cpfCnpj}`
            }
        },
        {
            replaceAllText: {
                containsText: {
                    text: '{{enderecoCliente}}',
                    matchCase: true
                },
                replaceText: `${cliente.endereco}`
            }
        },
        {
            replaceAllText: {
                containsText: {
                    text: '{{listaProduto}}',
                    matchCase: true
                },
                replaceText: `${paragrafoProdutos}`
            }
        },
        {
            replaceAllText: {
                containsText: {
                    text: '{{dataEvento}}',
                    matchCase: true
                },
                replaceText: `${dataEvento}`
            }
        },
        {
            replaceAllText: {
                containsText: {
                    text: '{{horarioMontagem}}',
                    matchCase: true
                },
                replaceText: `${contrato.horarioMontagem}`
            }
        },
        {
            replaceAllText: {
                containsText: {
                    text: '{{horarioEncerramento}}',
                    matchCase: true
                },
                replaceText: `${contrato.horarioEncerramento}`
            }
        },
        {
            replaceAllText: {
                containsText: {
                    text: '{{enderecoEvento}}',
                    matchCase: true
                },
                replaceText: `${contrato.enderecoEvento}`
            }
        },
        {
            replaceAllText: {
                containsText: {
                    text: '{{valor}}',
                    matchCase: true
                },
                replaceText: `${contrato.valor}`
            }
        },
        {
            replaceAllText: {
                containsText: {
                    text: '{{formaPagamento}}',
                    matchCase: true
                },
                replaceText: `${contrato.formaPagamento}`
            }
        },
        {
            replaceAllText: {
                containsText: {
                    text: '{{dia}}',
                    matchCase: true
                },
                replaceText: `${dia}`
            }
        },
        {
            replaceAllText: {
                containsText: {
                    text: '{{mes}}',
                    matchCase: true
                },
                replaceText: `${mesString}`
            }
        },
        {
            replaceAllText: {
                containsText: {
                    text: '{{ano}}',
                    matchCase: true
                },
                replaceText: `${ano}`
            }
        }
    ];

    await docs.documents.batchUpdate({
        documentId: (await copiaDocumento).data.id,
        requestBody: {
            requests: request
        }
    });

    await contrato.update({ idDocumento: copiaDocumento.data.id, nomeDocumento: nomeDocumento });
}

function mesParaString(mes) {
    const meses = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return meses[parseInt(mes) - 1];
}

exports.baixarContrato = async (req, res) => {
    const { idDocumento } = req.params;

    try {
        const creds = fs.readFileSync('creds.json');
        const tokens = JSON.parse(creds);
        oauth2Client.setCredentials(tokens);

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const file = await drive.files.export({
            fileId: idDocumento,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }, { responseType: 'stream' });

        const contrato = await Contrato.findOne({ where: { idDocumento: idDocumento } });

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${contrato.nomeDocumento || idDocumento}.word"`,
        });

        file.data.on('end', () => {
            console.log('Download concluído.');
        }).on('error', (err) => {
            console.error('Erro durante o download:', err);
            res.status(500).send('Erro ao baixar o contrato.');
        }).pipe(res);
    } catch (error) {
        console.error("Erro ao baixar o contrato:", error);
        if (error.code === 404) {
            return res.status(404).send('Arquivo não encontrado.');
        }
        res.status(500).send('Erro ao baixar o contrato.');
    }
};