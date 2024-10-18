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
        const { cpf, nome, email, gerente } = req.body;

        const cargo = gerente ? 'gerente' : 'operador';

        const operador = Usuario.findOne({ where: { cpf: cpf } });

        if (!operador) {
            console.log("Operador não encontrado!");
            res.redirect("telaInicial");
        }

        Usuario.update({ nome: nome, email: email, cargo: cargo }, { where: { cpf: cpf } });
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
        host: process.env.MAIL_HOST,
        port: 2525,
        secure: false,
        auth: {
            user: 'apikey',
            pass: process.env.API_PASSWORD
        }
    });

    //Código de verificação do twillo: WKAM8YFDV5UDTAGTYA4DDDPX

    const url = `${req.protocol}://${req.get('host')}/telaRedefinirSenha`;

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

exports.verificarUsuario = async (req, res, next) => {
    const { email } = req.body;

    const usuario = await Usuario.findOne({ where: { email: email } });

    if (!usuario) {
        console.log("Usuário não existente");
        // Redireciona para a página de redefinição de senha e envia uma mensagem através do corpo
        return res.send(`<script>
            alert('Email não encontrado! Tente novamente.');
            window.location.href = '/redefinirSenha';
        </script>`);
    } else {
        next(); // Chama o próximo middleware se o usuário existir
    } 
}

exports.buscarPorCPF = async (req, res) => {
    const { cpf } = req.params;

    try {
        const usuario = await Usuario.findOne({ where: { cpf: cpf } });

        if (usuario) {
            res.json({
                nome: usuario.nome,
                email: usuario.email
            });
        } else {
            res.status(404).json({ message: "Usuário não encontrado" });
        }
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        res.status(500).json({ message: "Erro no servidor" });
    }
};