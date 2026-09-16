const express = require("express");
const pagamentosController = require("../controllers/pagamentosController");

const router = express.Router();

router.get("/", pagamentosController.listarPagamentos);
router.post("/", pagamentosController.criarPagamento);

router.get(
  "/orcamento/:orcamentoId",
  pagamentosController.resumoPagamentosOrcamento
);

router.get("/:id", pagamentosController.buscarPagamento);
router.put("/:id", pagamentosController.atualizarPagamento);
router.delete("/:id", pagamentosController.excluirPagamento);

module.exports = router;