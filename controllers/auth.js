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
        res.render("cadastro");
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
            res.render("cadastro");
        });
    }
}

exports.login = async (req, res) => {
    const operador = require("../models/operadorModel");
    const { email, senha } = req.body

    const verificarOperador = await operador.findOne({ where: {email: email, senha: senha} });

    if (verificarOperador) {
        res.render("paginaContrato");
    } else {
        console.log("Usuário inválido!");
        res.render("index");
    }
}