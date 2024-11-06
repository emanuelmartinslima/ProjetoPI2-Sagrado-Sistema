const cliente = require("../models/clienteModel");

exports.locate = async (req, res) => {
    const { cpfCnpj } = req.body;
    const verificarCliente = await cliente.findOne({ where: { cpfCnpj: cpfCnpj } });

    if (verificarCliente) {
        res.json({ success: true, cliente: { nome: verificarCliente.nome, endereco: verificarCliente.endereco } });
    } else {
        res.json({ success: false, message: "Cliente não encontrado!" });
    }
};

exports.registerCliente = async (req, res) => {
    console.log(req.body);
    const { Op } = require("sequelize");
    const { nome, cpfCnpj, endereco, contato } = req.body;

    const usuario = await cliente.findOne({
        where: {
            [Op.or]: [
                { cpfCnpj: cpfCnpj },
            ]
        }
    });

    if (usuario) {
        console.log("Cliente já cadastrado");
        res.json({ success: false, message: 'Cliente já cadastrado!' });
    } else {
        cliente.create({
            nome: nome,
            cpfCnpj: cpfCnpj,
            endereco: endereco,
            contato: contato
        }).then(() => {
            console.log("Dados cadastrados com sucesso!");
            res.redirect("/cadastrarCliente");
        }).catch((error) => {
            console.log("Erro: ", error);
        });
    }
};