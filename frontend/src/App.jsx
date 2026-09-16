import { useState } from "react";
import Clientes from "./pages/Clientes";
import Orcamentos from "./pages/Orcamentos";
import Producao from "./pages/Producao";
import Pagamentos from "./pages/Pagamentos";

function App() {
  const [pagina, setPagina] = useState("menu");

  if (pagina === "clientes") {
    return <Clientes onVoltar={() => setPagina("menu")} />;
  }

  if (pagina === "orcamentos") {
    return <Orcamentos onVoltar={() => setPagina("menu")} />;
  }

  if (pagina === "producao") {
    return <Producao onVoltar={() => setPagina("menu")} />;
  }

  if (pagina === "pagamentos") {
  return <Pagamentos onVoltar={() => setPagina("menu")} />;
}

  return (
    <div className="app">
      <header className="cabecalho">
        <h1>Gestor Marcenaria</h1>
        <p>Controle de clientes, orçamentos, produção e pagamentos</p>
      </header>

      <main className="menu">

        <button
          className="menu-item"
          onClick={() => setPagina("clientes")}
        >
          <strong>Clientes</strong>
        </button>

        <button
          className="menu-item"
          onClick={() => setPagina("orcamentos")}
        >
          <strong>Orçamentos</strong>
        </button>

        <button
          className="menu-item"
          onClick={() => setPagina("producao")}
        >
          <strong>Produção</strong>
        </button>

        <button
          className="menu-item"
          onClick={() => setPagina("pagamentos")}
        >
          <strong>Pagamentos</strong>
        </button>

      </main>

    <footer className="rodape">
      Desenvolvido por Matias Bauer.
    </footer>
    </div>
  );
}

export default App;