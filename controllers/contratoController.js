const { Op } = require("sequelize");
const Contrato = require("../models/contratoModel");
const Cliente = require("../models/clienteModel");
const {google} = require("googleapis");
const jwt = require("jsonwebtoken");
const Cookie = require("js-cookie");

exports.registrarContrato = async (req, res) => {
    const tokenAcessoGoogle = req.cookies.access_token;
    const { cpfCnpj, dataEvento, horarioMontagem, horarioEncerramento, enderecoEvento, quantidadeProdutos, formaPagamento, dataPagamento, numeroParcelas, valorTotal } = req.body;

    const cliente = Cliente.findOne({where: {cpfCnpj: cpfCnpj}});
    console.log(cliente);
    const token = req.cookies.token;
    const secret = process.env.SECRET;
    const payloadToken = jwt.verify(token, secret);

    const contrato = Contrato.create({
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
    }).then(() => {
        console.log("Contrato criado com sucesso!")
        automatizarContrato(cliente, contrato, tokenAcessoGoogle);
        res.redirect("/telaInicial");
    }).catch((error) => {
        console.log("Erro: ", error)
    });
}

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

async function automatizarContrato (cliente, contrato, tokenAcessoGoogle) {
    verificarToken(tokenAcessoGoogle);

    oAuth2Client.setCredentials({ access_token: tokenAcessoGoogle });
    console.log(tokenAcessoGoogle);

    const docs = google.docs({version: 'v1', auth: oAuth2Client});
    const drive = google.drive({version: 'v3', auth: oAuth2Client});

    const data = new Date();

    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDay()).padStart(2, '0');

    const dataFormatada = `${dia}${mes}`;

    const copiaDocumento = await drive.files.copy({
        fileId: '1dfe2jqk5MuoXyBMczBPNh6WWYmBWr1XR',
        requestBody: {
            name: `${contrato.id}-Contrato ${dataFormatada}${contrato.id} ${cliente.nome}`
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
                replaceText: `${contrato.valorTotal}`
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
        }
    ];

    const documentoAtualizado = await docs.documents.batchUpdate({
        documentId: (await copiaDocumento).data.id,
        requestBody: {
            requests: request
        }
    });

    contrato.update({idDocumento: documentoAtualizado.data.id});

    return documentoAtualizado.data.id;
}

async function verificarToken(token) {
    oAuth2Client.setCredentials({ access_token: token });

    try {
        const response = await oAuth2Client.request({
            url: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
            params: { access_token: token },
        });
        console.log('Token é válido:', response.data);
    } catch (error) {
        console.error('Token inválido:', error);
    }
}