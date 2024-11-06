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

    const url = `${req.protocol}://${req.get('host')}/redefinirSenha`;
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
        <div style="background-color:  rgb(49, 04, 59); padding: 10px; text-align: center;">
          <img src="/Logoextendido.svg" alt="Logo da Empresa" style="height: 50px;">
        </div>

        <!-- Corpo do e-mail -->
        <div style="padding: 20px; color: Black; ">
          <h2>Olá, ${usuario.nome}</h2>
          <p>Recebemos uma solicitação para redefinir sua senha.</p>
          <p>Para criar uma nova senha, clique no botão abaixo:</p>

          <a href="${url}" style="display: inline-block; padding: 8px 16px; margin: 10px 0; background-color: #197ACF; color: white; text-decoration: none; border-radius: 5px;">Redefinir senha</a>
          
          <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
          <p>Atenciosamente,</p>
          <p>Sagrado Neon </p>
        </div>
      </body>
    </html>
    `;

    transporter.sendMail({
        to: usuario.email,
        from: process.env.MAIL_USER,
        subject: "Sagrado Sistema - Redefinição de Senha",
        html: htmlContent
    });
    res.redirect("/");
}

exports.redefinirSenha = async (req, res) => {
    const { senha, confirmarSenha } = req.body;

    if (senha !== confirmarSenha) {
        return res.status(400).send("As senhas não coincidem.");
    }

    const token = req.cookies.tokenRedefinirSenha;
    const secret = process.env.SECRET;

    try {
        const payloadToken = jwt.verify(token, secret);
        const salt = await bcrypt.genSalt(12);
        const hashSenha = await bcrypt.hash(senha, salt);
        await Usuario.update({ senha: hashSenha }, { where: { id: payloadToken.id } });
        res.redirect("/");

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send("Token expirado. Solicite novamente a redefinição de senha.");
        }
        res.status(500).send("Erro ao redefinir senha.");
    }
}

exports.verificarUsuario = async (req, res, next) => {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email: email } });

    if (!usuario) {
        console.log("Usuário não existente");
        return res.send(`<script>
            alert('Email não encontrado! Tente novamente.');
            window.location.href = '/redefinirSenha';
        </script>`);
    } else {
        next();
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