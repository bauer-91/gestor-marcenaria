import { useState } from "react";
import Clientes from "./pages/Clientes";

function App() {
  const [pagina, setPagina] = useState("menu");

  if (pagina === "clientes") {
    return <Clientes onVoltar={() => setPagina("menu")} />;
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

        <button className="menu-item">
          <strong>Orçamentos</strong>
        </button>

        <button className="menu-item">
          <strong>Produção</strong>
        </button>

        <button className="menu-item">
          <strong>Pagamentos</strong>
        </button>

      </main>
    </div>
  );
}

export default App;