const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// Importando os arquivos das rotas dos módulos
const clientesRoutes = require("./routes/clientes");
const orcamentosRoutes = require("./routes/orcamentos");
const producaoRoutes = require("./routes/producao");
const pagamentosRoutes = require("./routes/pagamentos");

app.use(express.json());
app.use(cors());

// Configurando as rotas para cada módulo
app.use("/clientes", clientesRoutes);
app.use("/orcamentos", orcamentosRoutes);
app.use("/producoes", producaoRoutes);
app.use("/pagamentos", pagamentosRoutes);

// Configurando o caminho dos arquivos do frontend
const caminhoFrontend = path.join(__dirname, "../../frontend/dist");
app.use(express.static(caminhoFrontend));

// Rota para a pagina inicial
app.get("/", (req, res) => {res.sendFile(path.join(caminhoFrontend, "index.html"));});

// Define a porta em que o servidor irá rodar, no caso 3001
const PORT = 3001;

// Inicia o servidor e mostra mensagem no console pra saber se rodou
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});