const express = require("express");
const cors = require("cors");
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


// Mensagem apresentada ao acessar a API pelo navegador na porta 3001
app.get("/", (req, res) => {
  res.send("Gestor Marcenaria API");
});

// Define a porta em que o servidor irá rodar, no caso 3001
const PORT = 3001;

// Inicia o servidor e mostra mensagem no console pra saber se rodou
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});