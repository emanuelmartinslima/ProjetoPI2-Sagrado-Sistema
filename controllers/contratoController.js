const { Op } = require("sequelize");
const contrato = require("../models/contratoModel");
const {google} = require("googleapis");
const docs = google.docs('v1', process.env.CHAVE_API_GOOGLE);
const drive = google.drive('v3', process.env.CHAVE_API_GOOGLE);

exports.registrarContrato = async (req, res) => {
    const { nome, cpfCnpj, endereco, contato } = req.body;

    cliente.create({
        nome: nome,
        cpfCnpj: cpfCnpj,
        endereco: endereco,
        contato: contato
    }).then(() => {
        console.log("Dados cadastrados com sucesso!")
        res.redirect("/cadastrarCliente");
    }).catch((error) => {
        console.log("Erro: ", error)
    });

    console.log(automatizarContrato(nome));
}

async function automatizarContrato (nome) {
    const copiaDocumento = drive.files.copy({
        fileId: '1dfe2jqk5MuoXyBMczBPNh6WWYmBWr1XR',
        requestBody: {
            name: 'Novo Contrato'
        }
    });

    const request = [
        {
            replaceAllText: {
                containsText: {
                    text: '{{nomeCliente}}',
                    matchCase: true
                },
                replaceText: `${nome}`
            }
        }
    ];

    const documentoAtualizado = docs.documents.batchUpdate({
        documentId: (await copiaDocumento).data.id,
        requestBody: {
            requests: request
        }
    });

    return documentoAtualizado.data.id;
}