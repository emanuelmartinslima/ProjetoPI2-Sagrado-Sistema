const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth");

const operadorController = require("../controllers/operadorController");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/atualizar", operadorController.atualizar);

router.post("/locate", authController.locate);

module.exports = router;