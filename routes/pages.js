const express = require("express");
const router = express.Router();
const autenticar = require("../controllers/auth");
const Usuario = require("../models/usuarioModel");
const operadorController = require('../controllers/operadorController');

router.get("/", (req, res) => {
    res.render("index");
}); //Tela de Login

router.get("/emailConfirmacao", (req, res) => {
    res.render("emailConfirmacao");
});

router.get("/redefinirSenha", autenticar.autenticarTokenRedefinirSenha, (req, res) => {
    res.render("telaRedefinirSenha");
});

router.get("/telaInicial", autenticar.autenticarToken, (req, res) => {
    const usuarioCargo = req.user.cargo;
    if(usuarioCargo !== 'gerente'){
        res.render("telaInicialOp");
    } else {
        res.render("telaInicialGerente");
    }
});

router.get("/editarDados", autenticar.autenticarToken, (req, res) => {
    res.render("editarDados");
}); //Hub de escolha de edição de dados de gerente

router.get("/atualizarOperador", autenticar.autenticarToken, async (req, res) => {
    const usuarioId = req.user.id;
    const usuario = await Usuario.findOne({where: {id: usuarioId}});
    const usuarioCargo = req.user.cargo;
    if(usuarioCargo !== 'gerente'){
        res.render("atualizarOperador", {cpf: usuario.cpf, nome: usuario.nome, email: usuario.email});
    } else {
        res.render("atualizarGerente", {cpf: usuario.cpf, nome: usuario.nome, email: usuario.email});
    }
}); //Atualizar os próprios dados de usuário

router.get("/atualizarOperadorGerente", autenticar.autenticarToken, (req, res) => {
    res.render("atualizarOperadorGerente");
}); //Atualizar dados de um operador específico

router.get("/cadastrarCliente", autenticar.autenticarToken, (req, res) => {
    const usuarioCargo = req.user.cargo;
    if(usuarioCargo !== 'gerente'){
        res.render("cadastrarCliente");
    } else {
        res.render("cadastrarClienteGerente");
    }
}); //Tela que precede a geração de contratos, verifica se há um cliente para tal contrato

router.get("/cadastroClienteForm", autenticar.autenticarToken, (req, res) =>{
    const usuarioCargo = req.user.cargo;
    if(usuarioCargo !== 'gerente'){
        res.render("cadastroClienteForm");
    } else {
        res.render("cadastroClienteGerente");
    }
});

router.get("/paginaContrato", autenticar.autenticarToken, (req, res) => {
    const usuarioCargo = req.user.cargo;
    if(usuarioCargo !== 'gerente'){
        res.render("paginaContratoOperador");
    } else {
        res.render("paginaContrato");
    }
}); //Pagina de geração de contratos

router.get("/cadastro", autenticar.autenticarToken, (req, res) => {
    res.render("cadastro");
}); //Cadastro de usuários novos

router.get('/api/usuarios/:cpf', operadorController.buscarPorCPF); //Busca um usuário e preenche os seus dados em seus respectivos inputs 

router.get('/produtos', autenticar.autenticarToken, (req, res) => {
    res.render('produtos'); 
}); //Hub de produtos

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
    if(usuarioCargo !== 'gerente'){
        res.render("gerarRelatoriosOp");
    } else {
        res.render("gerarRelatorios");
    }
}); //Hub de visualização de relatórios

router.get("/visualizarContratos", autenticar.autenticarToken, (req, res) => {
    const usuarioCargo = req.user.cargo;
    if(usuarioCargo !== 'gerente'){
        res.render("visualizarContratos");
    } else {
        res.render("visualizarContratosGerente");
    }
});

router.get("/relatorioComissoes", autenticar.autenticarToken, (req, res) => {
    const usuarioCargo = req.user.cargo;
    if(usuarioCargo !== 'gerente'){
        res.render("relatorioComissoesOp");
    } else {
        res.render("relatorioComissoes");
    }
});

router.get("/relatorioVendas", autenticar.autenticarToken, (req, res) => {
    const usuarioCargo = req.user.cargo;
    if(usuarioCargo !== 'gerente'){
        res.render("relatorioVendasOp");
    } else {
        res.render("relatorioVendas");
    }
});

router.get("/visualizarRelatorioVendas", autenticar.autenticarToken, (req, res) => {
    const usuarioCargo = req.user.cargo;
    if(usuarioCargo !== 'gerente'){
        res.render("vizualizarRelatorioDeVendasOp");
    } else {
        res.render("visualizarRealtoriosDeVendas");
    }
});

router.get("/vizualizarRelatoriosDeComissao", autenticar.autenticarToken, (req, res) => {
    const usuarioCargo = req.user.cargo;
    if(usuarioCargo !== 'gerente'){
        res.render("vizualizarRelatorioDeComissaoOp");
    } else {
        res.render("vizualizarRelatoriosDeComissao");
    }
});

router.get("/calendario", (req, res)=>{
    res.render("paginaCalendario");
});

router.get("/sair", autenticar.sair);

module.exports = router;