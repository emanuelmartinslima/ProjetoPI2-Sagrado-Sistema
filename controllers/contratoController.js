const Contrato = require("../models/contratoModel");
const calendarioController = require("./calendarioController");
const Cliente = require("../models/clienteModel");
const Usuario = require("../models/usuarioModel")
const ListaProdutos = require("../models/listaProdutos");
const Produto = require("../models/produtoModel");
const Items = require("../models/itemModel");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { google } = require("googleapis");

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
    const { cpfCnpj, dataEvento, horarioMontagem, horarioEncerramento, enderecoEvento, quantidadeProdutos, formaPagamento, dataPagamento, numeroParcelas, valorTotal } = req.body;
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
        numeroParcelas: numeroParcelas
    })

    if (!contrato) {
        console.log("Erro: ", error);
        return;
    }

    console.log("Contrato criado com sucesso!");
    await criarDocumentoContrato(contrato, lista);
    calendarioController.gerarEventoContrato(contrato, lista);

    res.redirect("/telaInicial");
}

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
        paragrafoProdutos += `
        Item Escolhido: ${produtoItem.nome}
        Dimensões Aproximadas: ${produtoItem.dimensoes}
        Obs:
        `;
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
            'Content-Disposition': `attachment; filename="${contrato.nomeDocumento || idDocumento}.docx"`,
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

