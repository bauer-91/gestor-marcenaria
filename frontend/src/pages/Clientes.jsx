import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");

  const [formulario, setFormulario] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    email: ""
  });

  const [clienteEditando, setClienteEditando] = useState(null);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      const resposta = await fetch(`${API_URL}/clientes`);
      const dados = await resposta.json();

      setClientes(dados);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar clientes.");
    }
  }

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario({
      ...formulario,
      [name]: value
    });
  }

  async function salvarCliente(event) {
    event.preventDefault();

    if (!formulario.nome.trim()) {
      alert("Informe o nome do cliente.");
      return;
    }

    try {
      const url = clienteEditando
        ? `${API_URL}/clientes/${clienteEditando.id}`
        : `${API_URL}/clientes`;

      const metodo = clienteEditando ? "PUT" : "POST";

      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formulario)
      });

      if (!resposta.ok) {
        throw new Error("Erro ao salvar cliente.");
      }

      await carregarClientes();

      limparFormulario();

      alert(
        clienteEditando
          ? "Cliente atualizado com sucesso."
          : "Cliente cadastrado com sucesso."
      );
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar cliente.");
    }
  }

  function editarCliente(cliente) {
    setClienteEditando(cliente);

    setFormulario({
      nome: cliente.nome || "",
      cpf: cliente.cpf || "",
      telefone: cliente.telefone || "",
      email: cliente.email || ""
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  async function excluirCliente(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este cliente?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const resposta = await fetch(`${API_URL}/clientes/${id}`, {
        method: "DELETE"
      });

      if (!resposta.ok) {
        throw new Error("Erro ao excluir cliente.");
      }

      await carregarClientes();

      alert("Cliente excluído com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir cliente.");
    }
  }

  function limparFormulario() {
    setFormulario({
      nome: "",
      cpf: "",
      telefone: "",
      email: ""
    });

    setClienteEditando(null);
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    const textoBusca = busca.toLowerCase();

    return (
      cliente.nome?.toLowerCase().includes(textoBusca) ||
      cliente.cpf?.toLowerCase().includes(textoBusca) ||
      cliente.telefone?.toLowerCase().includes(textoBusca) ||
      cliente.email?.toLowerCase().includes(textoBusca)
    );
  });

  return (
    <div className="pagina">
      <header className="cabecalho-pagina">
        <h1>Clientes</h1>
        <p>Cadastro e gerenciamento de clientes</p>
      </header>

      <main className="conteudo">

        <section className="card">

          <h2>
            {clienteEditando ? "Editar cliente" : "Novo cliente"}
          </h2>

          <form onSubmit={salvarCliente}>

            <div className="form-grid">

              <div className="campo">
                <label>Nome</label>

                <input
                  type="text"
                  name="nome"
                  value={formulario.nome}
                  onChange={alterarCampo}
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="campo">
                <label>CPF/CNPJ</label>

                <input
                  type="text"
                  name="cpf"
                  value={formulario.cpf}
                  onChange={alterarCampo}
                  placeholder="CPF ou CNPJ"
                />
              </div>

              <div className="campo">
                <label>Telefone</label>

                <input
                  type="text"
                  name="telefone"
                  value={formulario.telefone}
                  onChange={alterarCampo}
                  placeholder="Telefone"
                />
              </div>

              <div className="campo">
                <label>E-mail</label>

                <input
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={alterarCampo}
                  placeholder="E-mail"
                />
              </div>

            </div>

            <div className="acoes-formulario">

              <button type="submit" className="botao-principal">
                {clienteEditando ? "Salvar alterações" : "Cadastrar cliente"}
              </button>

              {clienteEditando && (
                <button
                  type="button"
                  className="botao-secundario"
                  onClick={limparFormulario}
                >
                  Cancelar
                </button>
              )}

            </div>

          </form>

        </section>

        <section className="card">

          <div className="cabecalho-lista">

            <h2>Clientes cadastrados</h2>

            <input
              type="text"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Pesquisar cliente..."
              className="campo-pesquisa"
            />

          </div>

          {clientesFiltrados.length === 0 ? (
            <p className="mensagem-vazia">
              Nenhum cliente encontrado.
            </p>
          ) : (
            <div className="tabela-container">

              <table>

                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>CPF/CNPJ</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>

                  {clientesFiltrados.map((cliente) => (
                    <tr key={cliente.id}>

                      <td>{cliente.id}</td>

                      <td>{cliente.nome}</td>

                      <td>{cliente.cpf || "-"}</td>

                      <td>{cliente.telefone || "-"}</td>

                      <td>{cliente.email || "-"}</td>

                      <td className="acoes-tabela">

                        <button
                          className="botao-editar"
                          onClick={() => editarCliente(cliente)}
                        >
                          Editar
                        </button>

                        <button
                          className="botao-excluir"
                          onClick={() => excluirCliente(cliente.id)}
                        >
                          Excluir
                        </button>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        <button
          className="botao-voltar"
          onClick={() => window.location.reload()}
        >
          Voltar ao menu
        </button>

      </main>
    </div>
  );
}

export default Clientes;