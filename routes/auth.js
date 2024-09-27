const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth");

const operadorController = require("../controllers/operadorController");

const clienteController = require("../controllers/clienteController");

const contratoController = require("../controllers/contratoController");



router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/atualizar", operadorController.atualizar);
router.post("/atualizarGerente", operadorController.atualizarGerente);

router.post("/locate", clienteController.locate);

router.post("/registerCliente", clienteController.registerCliente);
router.post("/registerClienteGerente", clienteController.registerClienteGerente);

//ainda não funciona
router.post("/registerContrato", contratoController.registerContrato);

module.exports = router;