const express = require("express");
const producaoController = require("../controllers/producaoController");

const router = express.Router();

router.get("/", producaoController.listarProducoes);
router.post("/", producaoController.criarProducao);
router.get("/:id", producaoController.buscarProducao);
router.put("/:id", producaoController.atualizarProducao);
router.delete("/:id", producaoController.excluirProducao);

module.exports = router;