const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.render("index");
});

router.get("/cadastro", (req, res) => {
    res.render("cadastro");
});

router.get("/emailConfirmacao", (req, res) => {
    res.render("emailConfirmacao");
});

router.get("/paginaContrato", (req, res) => {
    res.render("paginaContrato");
});

router.get("/paginaContratoModoEscuro", (req, res) => {
    res.render("paginaContratoModoEscuro");
});

router.get("/cadastrarCliente", (req, res) => {
    res.render("cadastrarCliente");
});

router.get("/telaInicialOp", (req, res) => {
    res.render("telaInicialOp");
});

router.get("/atualizarOperador", (req, res) => {
    res.render("atualizarOperador");
});

router.get("/telaInicialGerente", (req, res) => {
    res.render("telaInicialGerente");
});

router.get("/atualizarGerente", (req, res) => {
    res.render("atualizarGerente");
});

router.get("/editarDados", (req, res) => {
    res.render("editarDados");
});


module.exports = router;