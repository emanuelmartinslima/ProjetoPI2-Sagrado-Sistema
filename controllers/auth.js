const Usuario = require("../models/usuarioModel");
const Cliente = require("../models/clienteModel");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("dotenv");

env.config();

exports.registrar = async (req, res) => {
    const { nome, cpf, cnpj, email, senha, gerente } = req.body;

    const cargo = gerente ? 'gerente' : 'operador';

    const verificarUsuario = await Usuario
        .findOne({
            where: {
                [Op.or]: [
                    { cpf: cpf },
                    { email: email }
                ]
            }
        });

    if (verificarUsuario) {
        console.log("Usuário já cadastrado");
        res.redirect("/telaInicial");
    } else {
        const salt = await bcrypt.genSalt(12);

        const hashPassword = await bcrypt.hash(senha, salt);

        Usuario.create({
            nome: nome,
            cpf: cpf,
            cnpj: cnpj,
            email: email,
            senha: hashPassword,
            cargo: cargo
        }).then(() => {
            console.log("Dados cadastrados com sucesso!")
            res.redirect("/telaInicial");
        }).catch((error) => {
            console.log("Erro: ", error)
        });
    }
}

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ where: { email: email } });

        if (!usuario) {
            res.json({ success: false, message: "Usuário ou senha inválido!" });
        }

        const verificarSenha = await bcrypt.compare(senha, usuario.senha);

        if (!verificarSenha) {
            res.json({ success: false, message: "Usuário ou senha inválido!" });
        }

        const secret = process.env.SECRET;

        const token = jwt.sign(
            {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                cargo: usuario.cargo
            },
            secret
        );

        res.cookie('token', token, { httpOnly: true });

        // console.log({ msg: "Usuário autenticado com sucesso!" }, token);

        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.render("index");
    }
}

exports.autenticarToken = (req, res, next) => {
    try {
        const token = req.cookies.token;

        // console.log("Token: " + token);

        if (!token) {
            console.log("Token não definido");
            res.redirect("/");
        }

        const secret = process.env.SECRET;

        jwt.verify(token, secret, (error, user) => {
            // console.log(user);
            req.user = user;

            next();
        });
    } catch (error) {
        console.log("Erro: " + error);
    }
}

exports.autenticarTokenRedefinirSenha = (req, res, next) => {
    const token = req.cookies.tokenRedefinirSenha;

    if (!token) {
        console.log("Token para redefinir senha inválido!");

        res.redirect("/");
    }

    const secret = process.env.SECRET;

    jwt.verify(token, secret, (error, user) => {
        if (error) {
            console.log("Ocorreu um erro! Token inválido!");
            res.redirect("/");
        }

        next();
    });
}

exports.locate = async (req, res) => {
    const { cpfCnpj } = req.body;

    const verificarCliente = await Cliente.findOne({ where: { cpfCnpj: cpfCnpj } });

    if (verificarCliente) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Cliente não encontrado!" });
    }
}

exports.sair = async (req, res) => {
    res.clearCookie('token');
    res.redirect("/");
}


