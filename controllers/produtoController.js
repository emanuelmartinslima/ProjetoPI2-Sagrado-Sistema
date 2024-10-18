const { Op } = require("sequelize");
const produto = require("../models/produtoModel");

exports.registrarProduto = async (req, res) => {
    const { nome, dimensoes, estado, valorUnidade } = req.body;

    console.log("Dados recebidos:", req.body); // Verifique se os dados estão chegando corretamente

    try {
        await produto.create({
            nome: nome,
            dimensoes: dimensoes,
            estado: estado,
            valorUnidade: valorUnidade
        });
        console.log("Dados cadastrados com sucesso!");
        res.redirect("/formCadastrarProdutos");
    } catch (error) {
        console.error("Erro ao cadastrar produto:", error);
        res.status(500).send("Erro ao cadastrar produto: " + error.message);
    }
};
