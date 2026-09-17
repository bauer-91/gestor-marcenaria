const express = require("express");
// Importando o controlador do módulo pagamentos
const pagamentosController = require("../controllers/pagamentosController");

const router = express.Router();

// Definindo as funções de todo CRUD para o módulo pagamentos
router.get("/", pagamentosController.listarPagamentos);
router.post("/", pagamentosController.criarPagamento);
router.put("/:id", pagamentosController.atualizarPagamento);
router.delete("/:id", pagamentosController.excluirPagamento);

module.exports = router;