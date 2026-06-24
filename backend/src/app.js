const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Gestor Marcenaria API");
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});