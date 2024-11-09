const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

const operadorController = require("../controllers/operadorController");
const clienteController = require("../controllers/clienteController");
const contratoController = require("../controllers/contratoController");
const produtoController = require("../controllers/produtoController");

router.post("/registrar", authController.registrar); //Cadastro de usuários no sistema

router.post("/login", authController.login);
router.post("/enviarEmailRedefinirSenha", operadorController.verificarUsuario, operadorController.enviarEmailAtualizarSenha);
router.post("/redefinirSenha", operadorController.redefinirSenha);


router.post("/atualizar", operadorController.atualizar); //Atualizar os próprios dados
router.post("/atualizarOperadorGerente", operadorController.atualizarOperador); //Atualizar dados de um operador do sistema

router.post("/locate", clienteController.locate); //Localizar um cliente para realizar contrato

router.post("/registrarCliente", clienteController.registerCliente);
router.post("/registrarContrato", contratoController.registrarContrato); //Cadastrar contrato e registrar no Drive
router.post("/registrarProduto", produtoController.upload.single('imagem'), produtoController.registrarProduto);

router.get('/produtos', produtoController.buscarProdutos); //Retorna todos os produtos em uma lista
router.get('/produtosDisponiveis', produtoController.buscarProdutosDisponiveis);
router.get("/produtos/:id", produtoController.buscarProdutoPorId); //Busca um produto específico
router.put("/produtos/:id", produtoController.upload.single('imagem'), produtoController.editarProduto); //Edita um produto
router.delete("/produtos/:id", produtoController.deletarProduto); //Deleta um produto

router.get('/contratos', contratoController.buscarContratos); //Retorna todos os contratos que o operador logado realizou
router.get('/contratosGeral', contratoController.buscarContratosGeral);

router.get("/download/:idDocumento", contratoController.baixarContrato); //Realiza o download de um contrato do Drive

router.get('/relatorioVendas', contratoController.buscarVendas);
router.get('/buscarVendas/:cpfOperador/:mes/:ano', contratoController.buscarVendasEspecifico); //Busca vendas de um operador específico
router.get('/buscarVendasGeral', contratoController.buscarVendasGeral);

module.exports = router;