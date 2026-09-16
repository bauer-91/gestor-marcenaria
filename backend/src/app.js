const express = require("express");
const cors = require("cors");
const clientesRoutes = require("./routes/clientes");
const orcamentosRoutes = require("./routes/orcamentos");
const producaoRoutes = require("./routes/producao");
const pagamentosRoutes = require("./routes/pagamentos");

const app = express();

app.use(express.json());

app.use(cors());
app.use(express.json());

app.use("/clientes", clientesRoutes);

app.use("/orcamentos", orcamentosRoutes);

app.use("/producoes", producaoRoutes);

app.use("/pagamentos", pagamentosRoutes);

app.get("/", (req, res) => {
  res.send("Gestor Marcenaria API");
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});