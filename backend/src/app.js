const express = require("express");
const clientesRoutes = require("./routes/clientes");
const orcamentosRoutes = require("./routes/orcamentos");

const app = express();

app.use(express.json());

app.use("/clientes", clientesRoutes);

app.use("/orcamentos", orcamentosRoutes);

app.get("/", (req, res) => {
  res.send("Gestor Marcenaria API");
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});