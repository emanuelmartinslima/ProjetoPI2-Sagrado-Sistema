const express = require("express");

const router = express.Router();

//Login
router.get("/", (req, res) => {
    res.render("index");
});
//E-mail de recuperação
router.get("/emailConfirmacao", (req, res) => {
    res.render("emailConfirmacao");
});



//Rotas do operador: tela inicial
router.get("/telaInicialOp", (req, res) => {
    res.render("telaInicialOp");
});

//Validar cliente
router.get("/cadastrarCliente", (req, res) => {
    res.render("cadastrarCliente");
});
//Gerar contrato
router.get("/paginaContrato", (req, res) => {
    res.render("paginaContrato");
});
//Cadastrar clientes novos
router.get("/cadastroClienteForm", (req, res) => {
    res.render("cadastroClienteForm");
});

//Atualizar informações próprias
router.get("/atualizarOperador", (req, res) => {
    res.render("atualizarOperador");
});



//Rotas do Gerente: tela inicial
router.get("/telaInicialGerente", (req, res) => {
    res.render("telaInicialGerente");
});

//Validar cliente
router.get("/cadastrarClienteGerente", (req, res) => {
    res.render("cadastrarClienteGerente");
});
//Gerar contrato
router.get("/paginaContratoGerente", (req, res) => {
    res.render("paginaContratoGerente");
});
//Cadastrar cliente
router.get("/cadastroClienteFormGerente", (req, res) => {
    res.render("cadastroClienteFormGerente");
});

//Escolher quais informações quer alterar
router.get("/editarDados", (req, res) => {
    res.render("editarDados");
});
//Atualizar informações própias
router.get("/atualizarGerente", (req, res) => {
    res.render("atualizarGerente");
});
//Atualizar informações de um operador
router.get("/atualizarOperadorGerente", (req, res) => {
    res.render("atualizarOperadorGerente");
});



router.get("/cadastro", (req, res) => {
    res.render("cadastro");
});

module.exports = router;