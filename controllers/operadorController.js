const Usuario = require("../models/usuarioModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

exports.atualizar = async (req, res) => {
    const token = req.cookies.token;
    const secret = process.env.SECRET;

    jwt.verify(token, secret, async (error, user) => {
        const { nome, email } = req.body

        const usuario = await Usuario.findOne({ where: { id: user.id } });

        try {
            const verificarUsuario = await Usuario.findOne({ where: { cpf: usuario.cpf } });

            if (!verificarUsuario) {
                return;
            } else {
                usuario.update({ nome: nome, email: email }, { where: { cpf: usuario.cpf } });

                res.redirect("/telaInicial");
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Erro no servidor" });
        }
    });
}

exports.atualizarOperador = async (req, res) => {
    try {
        const { cpf, nome, email } = req.body;

        const operador = Usuario.findOne({ where: { cpf: cpf } });

        if (!operador) {
            console.log("Operador não encontrado!");
            res.redirect("telaInicial");
        }

        Usuario.update({ nome: nome, email: email }, { where: { cpf: cpf } });
        res.redirect("../telaInicial");
    } catch (error) {
        console.log(error);
    }
}

exports.enviarEmailAtualizarSenha = async (req, res) => {
    const email = req.body.email;

    const usuario = await Usuario.findOne({ where: { email: email } });

    if (!usuario) {
        console.log("Usuário não encontrado");

        res.redirect("/");
    }

    const secret = process.env.SECRET;

    const token = jwt.sign({
        'id': usuario.id
    },
        secret,
        {
            expiresIn: '5min'
        }
    );

    res.cookie('tokenRedefinirSenha', token, { httpOnly: true });

    const transporter = nodemailer.createTransport({
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        secure: false,
        auth: {
            user: '0a43a67ad92dca',
            pass: '2763c02b437d23'
        }
    });

    // tcct ykim dguy dnf

    const url = `${req.protocol}://${req.get('host')}/redefinirSenha`;

    transporter.sendMail({
        to: usuario.email,
        from: process.env.MAIL_USER,
        subject: "Sagrado Sistema - Redefinição de Senha",
        html: `<a href=${url}>Clique neste link para redefinir a senha!</a>`
    });

    res.redirect("/");
}

exports.redefinirSenha = async (req, res) => {
    const { senha } = req.body;

    const token = req.cookies.tokenRedefinirSenha;

    const secret = process.env.SECRET;

    const payloadToken = jwt.verify(token, secret);

    const salt = bcrypt.genSalt(12);

    const hashSenha = bcrypt.hash(senha, salt);

    try {
        await Usuario.update({ senha: hashSenha }, { where: { id: payloadToken.id } });
    } catch (error) {
        console.log("Erro ao atualizar senha do usuário: ", error);
    }
}