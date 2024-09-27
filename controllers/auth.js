exports.register = async (req, res) => {
    console.log(req.body);
    const {Op} = require("sequelize");
    const operador = require("../models/operadorModel");
    const { nome, cpf, cnpj, email, senha } = req.body;

    const usuario = await operador
    .findOne({
         where: {
         [Op.or] : [
            {cpf: cpf},
            {email: email}
         ]    
         }
    });

    if (usuario) {
        console.log("Usuário já cadastrado");
    } else {
        operador.create({
            nome: nome,
            cpf: cpf,
            cnpj: cnpj,
            email: email,
            senha: senha
        }).then(() => {
            console.log("Dados cadastrados com sucesso!")
            res.render("index");
        }).catch((error) => {
            console.log("Erro: ", error)
        });
    }
}

exports.login = async (req, res) => {
    const operador = require("../models/operadorModel");
    const { email, senha } = req.body;

    const verificarOperador = await operador.findOne({ where: { email: email, senha: senha } });

    if (verificarOperador) {
        // Login bem-sucedido
        res.json({ success: true });
    } else {
        // Usuário ou senha inválido
        res.json({ success: false, message: "Usuário ou senha inválido!" });
    }
}

exports.locate = async (req, res) => {
    const cliente = require("../models/clienteModel");
    const { cpfCnpj } = req.body;

    const verificarCliente = await cliente.findOne({ where: { cpfCnpj: cpfCnpj } });

    if (verificarCliente) {
        res.json({ success : true });
    } else {
        res.json({ success: false, message: "Cliente não encontrado!" });
    }
}