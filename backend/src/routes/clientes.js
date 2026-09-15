const express = require("express");
const clientesController = require("../controllers/clientesController");

const router = express.Router();

router.get("/", clientesController.listarClientes);
router.post("/", clientesController.criarCliente);
router.get("/:id", clientesController.buscarCliente);
router.put("/:id", clientesController.atualizarCliente);
router.delete("/:id", clientesController.excluirCliente);

module.exports = router;