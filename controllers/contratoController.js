const { Op } = require("sequelize");
const contrato = require("../models/contratoModel");

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
}