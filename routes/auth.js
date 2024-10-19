const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth");

const operadorController = require("../controllers/operadorController");

const clienteController = require("../controllers/clienteController");

const contratoController = require("../controllers/contratoController");

const produtoController = require("../controllers/produtoController");

router.post("/registrar", authController.registrar);

router.post("/login", authController.login);

router.post("/enviarEmailRedefinirSenha", operadorController.verificarUsuario, operadorController.enviarEmailAtualizarSenha);

router.post("/redefinirSenha", operadorController.redefinirSenha);

router.post("/atualizar", operadorController.atualizar);

router.post("/atualizarGerente", operadorController.atualizar);

router.post("/atualizarOperadorGerente", operadorController.atualizarOperador);

router.post("/locate", clienteController.locate);

router.post("/registrarCliente", clienteController.registerCliente);

router.post("/registrarClienteGerente", clienteController.registerClienteGerente);

router.post("/registrarContrato", contratoController.registrarContrato);

router.post("/registrarProduto", produtoController.upload.single('imagem'), produtoController.registrarProduto);

router.get('/produtos', produtoController.buscarProdutos);

// Adicione esta linha para buscar um produto específico pelo ID
router.get("/produtos/:id", produtoController.buscarProdutoPorId);

router.put("/produtos/:id", produtoController.upload.single('imagem'), produtoController.editarProduto);

router.delete("/produtos/:id", produtoController.deletarProduto);

module.exports = router;