const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth");

const operadorController = require("../controllers/operadorController");

const clienteController = require("../controllers/clienteController");

const contratoController = require("../controllers/contratoController");

router.post("/registrar", authController.registrar);

router.post("/login", authController.login);

router.post("/atualizar", operadorController.atualizar);

router.post("/atualizarGerente", operadorController.atualizar);

router.post("/locate", clienteController.locate);

router.post("/registrarCliente", clienteController.registerCliente);

router.post("/registrarClienteGerente", clienteController.registerClienteGerente);

router.post("/registrarContrato", contratoController.registrarContrato);

module.exports = router;