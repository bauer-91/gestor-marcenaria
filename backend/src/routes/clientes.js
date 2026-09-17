const express = require("express");
// Importando o controlador do módulo clientes
const clientesController = require("../controllers/clientesController");

const router = express.Router();

// Definindo as funções de todo CRUD para o módulo clientes
router.get("/", clientesController.listarClientes);
router.post("/", clientesController.criarCliente);
router.put("/:id", clientesController.atualizarCliente);
router.delete("/:id", clientesController.excluirCliente);

module.exports = router;