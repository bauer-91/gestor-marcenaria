const express = require("express");
// Importando o controlador do módulo orçamentos
const orcamentosController = require("../controllers/orcamentosController");

const router = express.Router();

// Definindo as funções de todo CRUD para o módulo orçamentos
router.get("/", orcamentosController.listarOrcamentos);
router.post("/", orcamentosController.criarOrcamento);
router.put("/:id", orcamentosController.atualizarOrcamento);
router.delete("/:id", orcamentosController.excluirOrcamento);

module.exports = router;