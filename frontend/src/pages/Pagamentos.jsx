import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001";

function Pagamentos({ onVoltar }) {
  const [orcamentos, setOrcamentos] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [busca, setBusca] = useState("");

  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState("");
  const [valor, setValor] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [metodo, setMetodo] = useState("Pix");

  const [pagamentoEditando, setPagamentoEditando] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [respostaOrcamentos, respostaPagamentos] =
        await Promise.all([
          fetch(`${API_URL}/orcamentos`),
          fetch(`${API_URL}/pagamentos`)
        ]);

      if (!respostaOrcamentos.ok || !respostaPagamentos.ok) {
        throw new Error("Erro ao carregar dados.");
      }

      const dadosOrcamentos = await respostaOrcamentos.json();
      const dadosPagamentos = await respostaPagamentos.json();

      setOrcamentos(dadosOrcamentos);
      setPagamentos(dadosPagamentos);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar pagamentos.");
    }
  }

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function formatarData(data) {
    if (!data) {
      return "-";
    }

    return new Date(data).toLocaleDateString("pt-BR");
  }

  function obterPagamentosOrcamento(orcamentoId) {
    return pagamentos.filter(
      (pagamento) => pagamento.orcamentoId === orcamentoId
    );
  }

  function calcularTotalPago(orcamentoId) {
    return obterPagamentosOrcamento(orcamentoId).reduce(
      (total, pagamento) => {
        return total + Number(pagamento.valor);
      },
      0
    );
  }

  function calcularSaldo(orcamento) {
    const totalPago = calcularTotalPago(orcamento.id);

    return Math.max(
      Number(orcamento.valorTotal) - totalPago,
      0
    );
  }

  function obterStatusPagamento(orcamento) {
    const totalPago = calcularTotalPago(orcamento.id);

    return totalPago >= Number(orcamento.valorTotal)
      ? "Pago"
      : "Pendente";
  }

  function editarPagamento(pagamento) {
    setPagamentoEditando(pagamento);

    setOrcamentoSelecionado(
      String(pagamento.orcamentoId)
    );

    setValor(Number(pagamento.valor));

    setDataPagamento(
      pagamento.dataPagamento
        ? pagamento.dataPagamento.substring(0, 10)
        : ""
    );

    setMetodo(pagamento.metodo || "Pix");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function limparFormulario() {
    setOrcamentoSelecionado("");
    setValor("");
    setDataPagamento("");
    setMetodo("Pix");
    setPagamentoEditando(null);
  }

  async function salvarPagamento(event) {
    event.preventDefault();

    if (!orcamentoSelecionado) {
      alert("Selecione um orçamento.");
      return;
    }

    if (!valor || Number(valor) <= 0) {
      alert("Informe um valor maior que zero.");
      return;
    }

    const dados = {
      orcamentoId: Number(orcamentoSelecionado),
      valor: Number(valor),
      dataPagamento: dataPagamento || null,
      metodo
    };

    try {
      const url = pagamentoEditando
        ? `${API_URL}/pagamentos/${pagamentoEditando.id}`
        : `${API_URL}/pagamentos`;

      const metodoHttp = pagamentoEditando
        ? "PUT"
        : "POST";

      const resposta = await fetch(url, {
        method: metodoHttp,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
      });

      if (!resposta.ok) {
        throw new Error("Erro ao salvar pagamento.");
      }

      await carregarDados();

      limparFormulario();

      alert(
        pagamentoEditando
          ? "Pagamento atualizado com sucesso."
          : "Pagamento registrado com sucesso."
      );
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar pagamento.");
    }
  }

  async function excluirPagamento(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este pagamento?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const resposta = await fetch(
        `${API_URL}/pagamentos/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!resposta.ok) {
        throw new Error("Erro ao excluir pagamento.");
      }

      await carregarDados();

      alert("Pagamento excluído com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir pagamento.");
    }
  }

  const orcamentosAprovados = orcamentos.filter(
    (orcamento) => orcamento.status === "aprovado"
  );

  const orcamentosFiltrados = orcamentosAprovados.filter(
    (orcamento) => {
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
    }
  );

  return (
    <div className="pagina">

      <header className="cabecalho-pagina">
        <h1>Pagamentos</h1>
        <p>Controle dos pagamentos dos pedidos aprovados</p>
      </header>

      <main className="conteudo">

        <section className="card">

          <h2>
            {pagamentoEditando
              ? "Editar pagamento"
              : "Registrar pagamento"}
          </h2>

          <form onSubmit={salvarPagamento}>

            <div className="form-grid">

              <div className="campo">
                <label>Orçamento</label>

                <select
                  value={orcamentoSelecionado}
                  onChange={(event) =>
                    setOrcamentoSelecionado(
                      event.target.value
                    )
                  }
                  disabled={Boolean(pagamentoEditando)}
                >
                  <option value="">
                    Selecione um orçamento
                  </option>

                  {orcamentosAprovados.map((orcamento) => (
                    <option
                      key={orcamento.id}
                      value={orcamento.id}
                    >
                      #{orcamento.id} -{" "}
                      {orcamento.cliente?.nome} -{" "}
                      {formatarMoeda(orcamento.valorTotal)}
                    </option>
                  ))}

                </select>
              </div>

              <div className="campo">
                <label>Valor do pagamento</label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={valor}
                  onChange={(event) =>
                    setValor(event.target.value)
                  }
                  placeholder="0,00"
                />
              </div>

              <div className="campo">
                <label>Data do pagamento</label>

                <input
                  type="date"
                  value={dataPagamento}
                  onChange={(event) =>
                    setDataPagamento(event.target.value)
                  }
                />
              </div>

              <div className="campo">
                <label>Método</label>

                <select
                  value={metodo}
                  onChange={(event) =>
                    setMetodo(event.target.value)
                  }
                >
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Transferência">
                    Transferência
                  </option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

            </div>

            <div className="acoes-formulario">

              <button
                type="submit"
                className="botao-principal"
              >
                {pagamentoEditando
                  ? "Salvar alterações"
                  : "Registrar pagamento"}
              </button>

              {pagamentoEditando && (
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

            <h2>Contas a receber</h2>

            <input
              type="text"
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
              placeholder="Pesquisar cliente ou orçamento..."
              className="campo-pesquisa"
            />

          </div>

          {orcamentosFiltrados.length === 0 ? (
            <p className="mensagem-vazia">
              Nenhum orçamento aprovado encontrado.
            </p>
          ) : (
            <div className="tabela-container">

              <table>

                <thead>
                  <tr>
                    <th>Orçamento</th>
                    <th>Cliente</th>
                    <th>Valor</th>
                    <th>Total pago</th>
                    <th>Saldo</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {orcamentosFiltrados.map((orcamento) => {

                    const totalPago =
                      calcularTotalPago(orcamento.id);

                    const saldo =
                      calcularSaldo(orcamento);

                    const statusPagamento =
                      obterStatusPagamento(orcamento);

                    return (
                      <tr key={orcamento.id}>

                        <td>
                          #{orcamento.id}
                        </td>

                        <td>
                          {orcamento.cliente?.nome || "-"}
                        </td>

                        <td>
                          {formatarMoeda(
                            orcamento.valorTotal
                          )}
                        </td>

                        <td>
                          {formatarMoeda(totalPago)}
                        </td>

                        <td>
                          {formatarMoeda(saldo)}
                        </td>

                        <td>
                          {statusPagamento}
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </section>

        <section className="card">

          <h2>Pagamentos registrados</h2>

          {pagamentos.length === 0 ? (
            <p className="mensagem-vazia">
              Nenhum pagamento registrado.
            </p>
          ) : (
            <div className="tabela-container">

              <table>

                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Orçamento</th>
                    <th>Cliente</th>
                    <th>Valor</th>
                    <th>Data</th>
                    <th>Método</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>

                  {pagamentos.map((pagamento) => (
                    <tr key={pagamento.id}>

                      <td>
                        {pagamento.id}
                      </td>

                      <td>
                        #{pagamento.orcamentoId}
                      </td>

                      <td>
                        {pagamento.orcamento?.cliente?.nome ||
                          "-"}
                      </td>

                      <td>
                        {formatarMoeda(pagamento.valor)}
                      </td>

                      <td>
                        {formatarData(
                          pagamento.dataPagamento
                        )}
                      </td>

                      <td>
                        {pagamento.metodo || "-"}
                      </td>

                      <td>
                        {pagamento.status === "pago"
                          ? "Pago"
                          : "Pendente"}
                      </td>

                      <td className="acoes-tabela">

                        <button
                          className="botao-editar"
                          onClick={() =>
                            editarPagamento(pagamento)
                          }
                        >
                          Editar
                        </button>

                        <button
                          className="botao-excluir"
                          onClick={() =>
                            excluirPagamento(
                              pagamento.id
                            )
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

export default Pagamentos;