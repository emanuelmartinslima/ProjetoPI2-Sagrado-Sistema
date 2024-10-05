const Usuario = require("../models/usuarioModel");
const jwt = require("jsonwebtoken");

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