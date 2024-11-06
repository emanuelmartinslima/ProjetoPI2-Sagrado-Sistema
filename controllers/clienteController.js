exports.locate = async (req, res) => {
    const cliente = require("../models/clienteModel");
    const { cpfCnpj } = req.body;

    const verificarCliente = await cliente.findOne({ where: { cpfCnpj: cpfCnpj } });

    if (verificarCliente) {
        // Retorna os dados do cliente (nome e endereço)
        res.json({ success: true, cliente: { nome: verificarCliente.nome, endereco: verificarCliente.endereco } });
    } else {
        res.json({ success: false, message: "Cliente não encontrado!" });
    }
};


exports.registerCliente = async (req, res) => {
    console.log(req.body);
    const {Op} = require("sequelize");
    const cliente = require("../models/clienteModel");
    const { nome, cpfCnpj, endereco, contato } = req.body;

    const usuario = await cliente
    .findOne({
         where: {
         [Op.or] : [
            {cpfCnpj: cpfCnpj},
         ]    
         }
    });

    if (usuario) {
        console.log("Cliente já cadastrado");
    } else {
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
}

exports.registerClienteGerente = async (req, res) => {
    console.log(req.body);
    const {Op} = require("sequelize");
    const cliente = require("../models/clienteModel");
    const { nome, cpfCnpj, endereco, contato } = req.body;

    const usuario = await cliente
    .findOne({
         where: {
         [Op.or] : [
            {cpfCnpj: cpfCnpj},
         ]    
         }
    });

    if (usuario) {
        console.log("Cliente já cadastrado");
        res.redirect("/paginaContrato");
    } else {
        cliente.create({
            nome: nome,
            cpfCnpj: cpfCnpj,
            endereco: endereco,
            contato: contato
        }).then(() => {
            console.log("Dados cadastrados com sucesso!")
            res.redirect("/paginaContrato");
        }).catch((error) => {
            console.log("Erro: ", error)
        });
    }
}