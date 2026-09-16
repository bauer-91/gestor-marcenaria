import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001";

const nomesStatus = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado"
};

function Orcamentos({ onVoltar }) {
  const [clientes, setClientes] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [busca, setBusca] = useState("");

  const [clienteId, setClienteId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState("pendente");

  const [itens, setItens] = useState([
    {
      nome: "",
      quantidade: 1,
      precoUnitario: ""
    }
  ]);

  const [orcamentoEditando, setOrcamentoEditando] = useState(null);

  useEffect(() => {
    carregarClientes();
    carregarOrcamentos();
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

  async function carregarOrcamentos() {
    try {
      const resposta = await fetch(`${API_URL}/orcamentos`);
      const dados = await resposta.json();

      setOrcamentos(dados);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar orçamentos.");
    }
  }

  function alterarItem(index, campo, valor) {
    const novosItens = [...itens];

    novosItens[index] = {
      ...novosItens[index],
      [campo]: valor
    };

    setItens(novosItens);
  }

  function adicionarItem() {
    setItens([
      ...itens,
      {
        nome: "",
        quantidade: 1,
        precoUnitario: ""
      }
    ]);
  }

  function removerItem(index) {
    if (itens.length === 1) {
      return;
    }

    setItens(itens.filter((_, itemIndex) => itemIndex !== index));
  }

  function calcularTotalItem(item) {
    return (
      Number(item.quantidade || 0) *
      Number(item.precoUnitario || 0)
    );
  }

  function calcularTotal() {
    return itens.reduce((total, item) => {
      return total + calcularTotalItem(item);
    }, 0);
  }

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function limparFormulario() {
    setClienteId("");
    setDescricao("");
    setStatus("pendente");

    setItens([
      {
        nome: "",
        quantidade: 1,
        precoUnitario: ""
      }
    ]);

    setOrcamentoEditando(null);
  }

  async function salvarOrcamento(event) {
    event.preventDefault();

    if (!clienteId) {
      alert("Selecione um cliente.");
      return;
    }

    if (!descricao.trim()) {
      alert("Informe a descrição do orçamento.");
      return;
    }

    const itensValidos = itens.every((item) => {
      return (
        item.nome.trim() &&
        Number(item.quantidade) > 0 &&
        Number(item.precoUnitario) >= 0
      );
    });

    if (!itensValidos) {
      alert("Preencha corretamente todos os itens.");
      return;
    }

    const dados = {
      clienteId: Number(clienteId),
      descricao,
      status,
      itens: itens.map((item) => ({
        nome: item.nome,
        quantidade: Number(item.quantidade),
        precoUnitario: Number(item.precoUnitario)
      }))
    };

    try {
      const url = orcamentoEditando
        ? `${API_URL}/orcamentos/${orcamentoEditando.id}`
        : `${API_URL}/orcamentos`;

      const metodo = orcamentoEditando ? "PUT" : "POST";

      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
      });

      if (!resposta.ok) {
        throw new Error("Erro ao salvar orçamento.");
      }

      await carregarOrcamentos();

      limparFormulario();

      alert(
        orcamentoEditando
          ? "Orçamento atualizado com sucesso."
          : "Orçamento cadastrado com sucesso."
      );
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar orçamento.");
    }
  }

  function editarOrcamento(orcamento) {
    setOrcamentoEditando(orcamento);

    setClienteId(String(orcamento.clienteId));
    setDescricao(orcamento.descricao || "");
    setStatus(orcamento.status || "pendente");

    setItens(
      orcamento.itens.map((item) => ({
        nome: item.nome,
        quantidade: item.quantidade,
        precoUnitario: Number(item.precoUnitario)
      }))
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  async function excluirOrcamento(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este orçamento?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const resposta = await fetch(`${API_URL}/orcamentos/${id}`, {
        method: "DELETE"
      });

      if (!resposta.ok) {
        throw new Error("Erro ao excluir orçamento.");
      }

      await carregarOrcamentos();

      alert("Orçamento excluído com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir orçamento.");
    }
  }

  const orcamentosFiltrados = orcamentos.filter((orcamento) => {
    const textoBusca = busca.toLowerCase();

    return (
      String(orcamento.id).includes(textoBusca) ||
      orcamento.cliente?.nome
        ?.toLowerCase()
        .includes(textoBusca) ||
      orcamento.descricao
        ?.toLowerCase()
        .includes(textoBusca)
    );
  });

  return (
    <div className="pagina">

      <header className="cabecalho-pagina">
        <h1>Orçamentos</h1>
        <p>Cadastro e gerenciamento de orçamentos</p>
      </header>

      <main className="conteudo">

        <section className="card">

          <h2>
            {orcamentoEditando
              ? "Editar orçamento"
              : "Novo orçamento"}
          </h2>

          <form onSubmit={salvarOrcamento}>

            <div className="form-grid">

              <div className="campo">
                <label>Cliente</label>

                <select
                  value={clienteId}
                  onChange={(event) =>
                    setClienteId(event.target.value)
                  }
                >
                  <option value="">
                    Selecione um cliente
                  </option>

                  {clientes.map((cliente) => (
                    <option
                      key={cliente.id}
                      value={cliente.id}
                    >
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label>Status</label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                >
                  <option value="pendente">
                    Pendente
                  </option>

                  <option value="aprovado">
                    Aprovado
                  </option>

                  <option value="rejeitado">
                    Rejeitado
                  </option>
                </select>
              </div>

              <div className="campo">
                <label>Descrição</label>

                <input
                  type="text"
                  value={descricao}
                  onChange={(event) =>
                    setDescricao(event.target.value)
                  }
                  placeholder="Ex.: Cozinha planejada"
                />
              </div>

            </div>

            <h3 className="titulo-itens">
              Itens do orçamento
            </h3>

            {itens.map((item, index) => (
              <div className="item-orcamento" key={index}>

                <div className="campo">
                  <label>Item</label>

                  <input
                    type="text"
                    value={item.nome}
                    onChange={(event) =>
                      alterarItem(
                        index,
                        "nome",
                        event.target.value
                      )
                    }
                    placeholder="Descrição do item"
                  />
                </div>

                <div className="campo campo-quantidade">
                  <label>Quantidade</label>

                  <input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(event) =>
                      alterarItem(
                        index,
                        "quantidade",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="campo">
                  <label>Valor unitário</label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.precoUnitario}
                    onChange={(event) =>
                      alterarItem(
                        index,
                        "precoUnitario",
                        event.target.value
                      )
                    }
                    placeholder="0,00"
                  />
                </div>

                <div className="total-item">
                  <span>Total</span>

                  <strong>
                    {formatarMoeda(
                      calcularTotalItem(item)
                    )}
                  </strong>
                </div>

                <button
                  type="button"
                  className="botao-excluir"
                  onClick={() => removerItem(index)}
                >
                  Remover
                </button>

              </div>
            ))}

            <button
              type="button"
              className="botao-secundario"
              onClick={adicionarItem}
            >
              + Adicionar item
            </button>

            <div className="resumo-orcamento">

              <span>Total do orçamento</span>

              <strong>
                {formatarMoeda(calcularTotal())}
              </strong>

            </div>

            <div className="acoes-formulario">

              <button
                type="submit"
                className="botao-principal"
              >
                {orcamentoEditando
                  ? "Salvar alterações"
                  : "Cadastrar orçamento"}
              </button>

              {orcamentoEditando && (
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

            <h2>Orçamentos cadastrados</h2>

            <input
              type="text"
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
              placeholder="Pesquisar orçamento..."
              className="campo-pesquisa"
            />

          </div>

          {orcamentosFiltrados.length === 0 ? (
            <p className="mensagem-vazia">
              Nenhum orçamento encontrado.
            </p>
          ) : (
            <div className="tabela-container">

              <table>

                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Cliente</th>
                    <th>Descrição</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>

                  {orcamentosFiltrados.map((orcamento) => (
                    <tr key={orcamento.id}>

                      <td>{orcamento.id}</td>

                      <td>
                        {orcamento.cliente?.nome}
                      </td>

                      <td>
                        {orcamento.descricao || "-"}
                      </td>

                      <td>
                        {formatarMoeda(
                          orcamento.valorTotal
                        )}
                      </td>

                      <td>
                        {nomesStatus[orcamento.status] ||
                          orcamento.status}
                      </td>

                      <td className="acoes-tabela">

                        <button
                          className="botao-editar"
                          onClick={() =>
                            editarOrcamento(orcamento)
                          }
                        >
                          Editar
                        </button>

                        <button
                          className="botao-excluir"
                          onClick={() =>
                            excluirOrcamento(orcamento.id)
                          }
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
          onClick={onVoltar}
        >
          Voltar ao menu
        </button>

      </main>
    </div>
  );
}

export default Orcamentos;