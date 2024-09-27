exports.register = async (req, res) => {
    console.log(req.body);
    const {Op} = require("sequelize");
    const operador = require("../models/operadorModel");
    const { nome, cpf, cnpj, email, senha } = req.body;

    const isGerente = req.body.gerente === 'true';

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
            senha: senha,
            gerente: isGerente
        }).then(() => {
            console.log("Dados cadastrados com sucesso!")
            res.redirect("/telaInicialGerente");
        }).catch((error) => {
            console.log("Erro: ", error)
        });
    }
}

exports.login = async (req, res) => {
    const operador = require("../models/operadorModel");
    const { email, senha } = req.body;

    // Verifica o operador no banco de dados
    const verificarOperador = await operador.findOne({ where: { email: email, senha: senha } });

    if (verificarOperador) {
        // Login bem-sucedido
        if (verificarOperador.gerente === true) {
            // Se o usuário for gerente, redireciona para telaInicialGerente
            return res.json({ success: true, redirect: '/telaInicialGerente' });
        } else {
            // Se for operador, redireciona para telaInicialOperador
            return res.json({ success: true, redirect: '/telaInicialOp' });
        }
    } else {
        // Usuário ou senha inválido
        res.json({ success: false, message: "Usuário ou senha inválido!" });
    }
};
