import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001";

// Página de Clientes
function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  // Formulário para cadastrar ou editar um cliente
  const [formulario, setFormulario] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    email: ""
  });
  // Variável para armazenar o cliente que está sendo editado
  const [clienteEditando, setClienteEditando] = useState(null);

  useEffect(() => {
    carregarClientes();
  }, []);
  // Função para carregar os clientes do banco de dados
  async function carregarClientes() {
    try {
      // Busca os clientes na API
      const resposta = await fetch(`${API_URL}/clientes`);
      const dados = await resposta.json();
      // Atualiza o estado com os clientes carregados
      setClientes(dados);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar clientes.");
    }
  }
  // Função para alterar os campos do formulário
  function alterarCampo(event) {
    const { name, value } = event.target;
    // Atualiza o estado do formulário com o novo valor do campo
    setFormulario({
      ...formulario,
      [name]: value
    });
  }
  // Função para salvar um cliente (cadastrar ou editar)
  async function salvarCliente(event) {
    event.preventDefault();
    // Se o nome do cliente estiver vazio, exibe um alerta e retorna
    if (!formulario.nome.trim()) {
      alert("Informe o nome do cliente.");
      return;
    }
    // Tenta salvar o cliente na API
    try {
      const url = clienteEditando
        ? `${API_URL}/clientes/${clienteEditando.id}`
        : `${API_URL}/clientes`;

      const metodo = clienteEditando ? "PUT" : "POST";
      // Faz a requisição para a API com os dados do formulário
      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formulario)
      });
      // Se a resposta não for ok, lança um erro
      if (!resposta.ok) {
        throw new Error("Erro ao salvar cliente.");
      }
      // Recarrega a lista de clientes e limpa o formulário
      await carregarClientes();

      limparFormulario();
      // Exibe um alerta informando se o cliente foi cadastrado ou atualizado
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

  // Função para editar um cliente
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

  // Função para excluir um cliente pedindo confirmação do usuário
  async function excluirCliente(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este cliente?"
    );

    if (!confirmar) {
      return;
    }
    // Tenta excluir o cliente na API
    try {
      const resposta = await fetch(`${API_URL}/clientes/${id}`, {
        method: "DELETE"
      });
      // Se a resposta não for ok, lança um erro
      if (!resposta.ok) {
        throw new Error("Erro ao excluir cliente.");
      }
      // Recarrega a lista de clientes
      await carregarClientes();
      // Exibe um alerta informando que o cliente foi excluído com sucesso
      alert("Cliente excluído com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir cliente.");
    }
  }
  // Função para limpar o formulário e resetar o estado de edição
  function limparFormulario() {
    setFormulario({
      nome: "",
      cpf: "",
      telefone: "",
      email: ""
    });

    setClienteEditando(null);
  }
  // Filtra os clientes com base na busca do usuário
  const clientesFiltrados = clientes.filter((cliente) => {
    const textoBusca = busca.toLowerCase();

    return (
      cliente.nome?.toLowerCase().includes(textoBusca) ||
      cliente.cpf?.toLowerCase().includes(textoBusca) ||
      cliente.telefone?.toLowerCase().includes(textoBusca) ||
      cliente.email?.toLowerCase().includes(textoBusca)
    );
  });
  // Renderiza a página de clientes com o formulário e a lista de clientes
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