const express = require("express");
const router = express.Router();
const autenticar = require("../controllers/auth");
const Usuario = require("../models/usuarioModel");
const operadorController = require('../controllers/operadorController');
const googleController = require('../controllers/googleController');

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
        res.render("paginaContratoOperador");
    } else {
        res.render("paginaContrato");
    }
});

router.get("/cadastrarClienteGerente", autenticar.autenticarToken, (req, res) => {
    res.render("cadastrarClienteGerente");
});

router.get("/paginaContratoGerente", autenticar.autenticarToken, (req, res) => {
    res.render("paginaContratoGerente");
});

router.get("/cadastroClienteFormGerente", autenticar.autenticarToken, (req, res) => {
    res.render("cadastroClienteGerente");
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

router.get('/api/usuarios/:cpf', operadorController.buscarPorCPF);

router.get("/sair", autenticar.sair);

router.get('/produtos', autenticar.autenticarToken, (req, res) => {
    res.render('produtos'); 
});

router.get('/vizualizarProdutos', autenticar.autenticarToken, (req, res) => {
    res.render('vizualizarProdutos');
});

router.get('/formCadastrarProdutos', autenticar.autenticarToken, (req, res) => {
    res.render('formCadastrarProdutos');
});

router.get('/formEditarProdutos', autenticar.autenticarToken, (req, res) => {
    res.render('formEditarProdutos');
});

router.get('/formDeletarProdutos', autenticar.autenticarToken, (req, res) => {
    res.render('formDeletarProdutos');
});

router.get("/redefinirSenhaDef", (req, res) => {
    res.render("telaRedefinirSenhaPos");
});

router.get('/auth/google', async (req, res) => {
    const open = await import('open');
    const authUrl = googleController.getAuthUrl();
    open.openApp(authUrl); // Abre o navegador automaticamente
});

router.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const token = await googleController.getTokens(code);
        res.cookie('access_token', token, {httpOnly: true});

        res.redirect("/telaInicial");
    } catch (error) {
        console.error('Erro ao obter tokens:', error);
        res.status(500).send('Erro ao autenticar.');
    }
});
module.exports = router;