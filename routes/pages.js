const express = require("express");
const router = express.Router();
const autenticar = require("../controllers/auth");
const Usuario = require("../models/usuarioModel");
const operadorController = require('../controllers/operadorController');

router.get("/", (req, res) => {
    res.render("index");
});

router.get("/calendario", (req, res)=>{
    res.render("paginaCalendario");
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

router.get("/gerarRelatorios", autenticar.autenticarToken, (req, res) => {
    const usuarioCargo = req.user.cargo;

    console.log("Cargo:" + usuarioCargo);

    if(usuarioCargo !== 'gerente'){
        res.render("gerarRelatoriosOp");
    } else {
        res.render("gerarRelatorios");
    }
});

router.get("/visualizarContratos", autenticar.autenticarToken, (req, res) => {
    const usuarioCargo = req.user.cargo;

    console.log("Cargo:" + usuarioCargo);

    if(usuarioCargo !== 'gerente'){
        res.render("visualizarContratos");
    } else {
        res.render("visualizarContratosGerente");
    }
});

router.get('/relatorioComissoes', autenticar.autenticarToken, (req, res) => {
    res.render('relatorioComissoes');
});

router.get('/relatorioVendas', autenticar.autenticarToken, (req, res) => {
    res.render('relatorioVendas');
});

router.get('/relatorioVendasOp', autenticar.autenticarToken, (req, res) => {
    res.render('relatorioVendasOp');
});

router.get('/relatorioComissoesOp', autenticar.autenticarToken, (req, res) => {
    res.render('relatorioComissoesOp    ');
});

router.get('/visualizarRealtoriosDeVendas', autenticar.autenticarToken, (req, res) => {
    res.render('visualizarRealtoriosDeVendas ');
});

router.get('/visualizarRealtoriosDeVendasOp', autenticar.autenticarToken, (req, res) => {
    res.render('visualizarRealtoriosDeVendasOp ');
});

router.get('/vizualizarRelatorioDeComissao', autenticar.autenticarToken, (req, res) => {
    res.render('vizualizarRelatorioDeComissao');
});

router.get('/vizualizarRelatorioDeComissaoOp', autenticar.autenticarToken, (req, res) => {
    res.render('vizualizarRelatorioDeComissaoOp ');
});

module.exports = router;