const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.render("index");
});

router.get("/cadastro", (req, res) => {
    res.render("cadastro");
});

router.get("/cadastroModoEscuro", (req, res) => {
    res.render("cadastroModoEscuro");
});

router.get("/emailConfirmacao", (req, res) => {
    res.render("emailConfirmacao");
});

router.get("/emailConfirmacaoModoEscuro", (req, res) => {
    res.render("emailConfirmacaoModoEscuro");
});

router.get("/loginModoEscuro", (req, res) => {
    res.render("LoginModoEscuro");
});

router.get("/paginaContrato", (req, res) => {
    res.render("paginaContrato");
});

router.get("/paginaContratoModoEscuro", (req, res) => {
    res.render("paginaContratoModoEscuro");
});

module.exports = router;