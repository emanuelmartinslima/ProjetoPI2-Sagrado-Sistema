const express = require("express");
const router = express.Router();
const autenticar = require("../controllers/auth");
const Usuario = require("../models/usuarioModel");

router.get("/", (req, res) => {
    res.render("index");
});

router.get("/emailConfirmacao", (req, res) => {
    res.render("emailConfirmacao");
});

router.get("/redefinirSenha", autenticar.autenticarTokenRedefinirSenha, (req, res) => {
    res.render("telaRedefinirSenha");
});

router.get("/telaInicial", autenticar.autenticarToken, (req, res) => {
    const usuarioCargo = req.user.cargo;

    // console.log("Cargo:" + usuarioCargo);

    if(usuarioCargo !== 'gerente'){
        res.render("telaInicialOp");
    } else {
        res.render("telaInicialGerente");
    }
});

router.get("/cadastrarCliente", autenticar.autenticarToken, (req, res) => {
    res.render("cadastrarCliente");
});

router.get("/cadastroClienteForm", autenticar.autenticarToken, (req, res) =>{
    res.render("cadastroClienteForm");
});

router.get("/atualizarOperador", autenticar.autenticarToken, async (req, res) => {
    const usuarioId = req.user.id;

    const usuario = await Usuario.findOne({where: {id: usuarioId}});

    res.render("atualizarOperador", {cpf: usuario.cpf, nome: usuario.nome, email: usuario.email});
});

router.get("/paginaContrato", autenticar.autenticarToken, (req, res) => {
    const usuarioCargo = req.user.cargo;

    console.log("Cargo:" + usuarioCargo);

    if(usuarioCargo !== 'gerente'){
        res.render("paginaContrato");
    } else {
        res.render("paginaContrato");
    }
});

router.get("/cadastrarClienteGerente", autenticar.autenticarToken, (req, res) => {
    res.render("cadastroClienteGerente");
});

router.get("/paginaContratoGerente", autenticar.autenticarToken, (req, res) => {
    res.render("paginaContratoGerente");
});

router.get("/cadastroClienteFormGerente", autenticar.autenticarToken, (req, res) => {
    res.render("cadastroClienteFormGerente");
});

router.get("/editarDados", autenticar.autenticarToken, (req, res) => {
    res.render("editarDados");
});

router.get("/atualizarGerente", autenticar.autenticarToken, async (req, res) => {
    const usuarioId = req.user.id;

    const usuario = await Usuario.findOne({where: {id: usuarioId}});

    res.render("atualizarGerente", {cpf: usuario.cpf, nome: usuario.nome, email: usuario.email});
});

router.get("/atualizarOperadorGerente", autenticar.autenticarToken, (req, res) => {
    res.render("atualizarOperadorGerente");
});

router.get("/cadastro", autenticar.autenticarToken, (req, res) => {
    res.render("cadastro");
});

router.get("/sair", autenticar.sair);

module.exports = router;