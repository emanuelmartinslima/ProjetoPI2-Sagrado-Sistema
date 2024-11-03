const Contrato = require("../models/contratoModel");
const Cliente = require("../models/clienteModel");
const ListaProdutos = require("../models/listaProdutos");
const Produto = require("../models/produtoModel");
const Items = require("../models/itemModel");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, Alignment, Header, Media , ImageRun} = require("docx");
const { text } = require("body-parser");
const { google } = require("googleapis");

exports.registrarContrato = async (req, res) => {
    const { cpfCnpj, dataEvento, horarioMontagem, horarioEncerramento, enderecoEvento, quantidadeProdutos, formaPagamento, dataPagamento, numeroParcelas, valorTotal } = req.body;

    const cliente = await Cliente.findOne({ where: { cpfCnpj: cpfCnpj } });

    console.log(cliente);
    const token = req.cookies.token;
    const secret = process.env.SECRET;
    const payloadToken = jwt.verify(token, secret);

    const lista = await ListaProdutos.create({
        valorTotal: valorTotal
    });

    const produtos = req.body.produtos;

    produtos.forEach(async (produto)=>{
        const produtoSelecionado = await Produto.findOne({where: {id: produto}});

        await Items.create({
            produtoId: produtoSelecionado.id,
            valor: produtoSelecionado.valorUnidade,
            lista: lista.id
        });
    });

    await Contrato.create({
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
    }).then(async () => {
        console.log("Contrato criado com sucesso!")
        const numeroContrato = await Contrato.count();
        const contrato = await Contrato.findOne({where: {id: numeroContrato}});
        criarDocumentoContrato(contrato, lista);
        res.redirect("/telaInicial");
    }).catch((error) => {
        console.log("Erro: ", error)
    });
}

const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

async function criarDocumentoContrato(contrato, lista){
    const creds = fs.readFileSync('creds.json');
    const tokens = JSON.parse(creds);
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({
        version: 'v3',
        auth: oauth2Client
    });

    const docs = google.docs({
        version: 'v1',
        auth: oauth2Client
    });

    const cliente = await Cliente.findOne({where: {id: contrato.idCliente}});

    const items = await Items.findAll({where: {lista: lista.id}});

    let paragrafoProdutos = "";

    items.forEach(async (item)=>{
        const produtoItem = await Produto.findOne({where: {id: item.produtoId}});

        paragrafoProdutos += 
        `
        Item Escolhido: ${produtoItem.nome}
        Dimensões Aproximadas: ${produtoItem.dimensoes}
        Obs:
        `;
    });

    const data = new Date();

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDay()).padStart(2, '0');

    const dataFormatada = `${dia}${mes}`;

    const copiaDocumento = await drive.files.copy({
        fileId: '1yYsbk87kuPZlaYT5t2pWT6L8ArvcYiZBESNZtOhMksg',
        requestBody: {
            name: `${contrato.id}-Contrato ${dataFormatada}${contrato.id} ${cliente.nome}`,
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
                replaceText: `${contrato.dataEvento}`
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
                replaceText: `${mes}`
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

    const documentoAtualizado = await docs.documents.batchUpdate({
        documentId: (await copiaDocumento).data.id,
        requestBody: {
            requests: request
        }
    });

    contrato.update({idDocumento: documentoAtualizado.data.id});
}

