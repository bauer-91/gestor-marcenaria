const express = require("express");
const orcamentosController = require("../controllers/orcamentosController");

const router = express.Router();

router.get("/", orcamentosController.listarOrcamentos);
router.post("/", orcamentosController.criarOrcamento);
router.get("/:id", orcamentosController.buscarOrcamento);
router.put("/:id", orcamentosController.atualizarOrcamento);
router.delete("/:id", orcamentosController.excluirOrcamento);

module.exports = router;