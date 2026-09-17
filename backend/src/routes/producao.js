const express = require("express");
// Importando o controlador do módulo produção
const producaoController = require("../controllers/producaoController");

const router = express.Router();

// Definindo as funções de todo CRUD para o módulo produção
router.get("/", producaoController.listarProducoes);
router.put("/:id", producaoController.atualizarProducao);
router.delete("/:id", producaoController.excluirProducao);

module.exports = router;