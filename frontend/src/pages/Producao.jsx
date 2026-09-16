import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001";

const nomesStatus = {
  aguardando_material: "Aguardando material",
  em_producao: "Em produção",
  em_montagem: "Em montagem",
  concluido: "Concluído"
};

function Producao({ onVoltar }) {
  const [producoes, setProducoes] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregarProducoes();
  }, []);

  async function carregarProducoes() {
    try {
      const resposta = await fetch(`${API_URL}/producoes`);

      if (!resposta.ok) {
        throw new Error("Erro ao carregar produções.");
      }

      const dados = await resposta.json();

      setProducoes(dados);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar produções.");
    }
  }

  async function alterarStatus(producao, novoStatus) {
    try {
      const resposta = await fetch(
        `${API_URL}/producoes/${producao.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: novoStatus
          })
        }
      );

      if (!resposta.ok) {
        throw new Error("Erro ao atualizar produção.");
      }

      await carregarProducoes();

      alert("Status atualizado com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar status.");
    }
  }

  async function excluirProducao(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta produção?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const resposta = await fetch(
        `${API_URL}/producoes/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!resposta.ok) {
        throw new Error("Erro ao excluir produção.");
      }

      await carregarProducoes();

      alert("Produção excluída com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir produção.");
    }
  }

  function formatarData(data) {
    if (!data) {
      return "-";
    }

    return new Date(data).toLocaleDateString("pt-BR");
  }

  const producoesFiltradas = producoes.filter((producao) => {
    const textoBusca = busca.toLowerCase();

    const nomeCliente =
      producao.orcamento?.cliente?.nome?.toLowerCase() || "";

    const descricao =
      producao.orcamento?.descricao?.toLowerCase() || "";

    return (
      nomeCliente.includes(textoBusca) ||
      descricao.includes(textoBusca)
    );
  });

  return (
    <div className="pagina">

      <header className="cabecalho-pagina">
        <h1>Produção</h1>
        <p>Acompanhamento da produção dos pedidos</p>
      </header>

      <main className="conteudo">

        <section className="card">

          <div className="cabecalho-lista">

            <h2>Produções</h2>

            <input
              type="text"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Pesquisar cliente ou orçamento..."
              className="campo-pesquisa"
            />

          </div>

          {producoesFiltradas.length === 0 ? (
            <p className="mensagem-vazia">
              Nenhuma produção encontrada.
            </p>
          ) : (
            <div className="tabela-container">

              <table>

                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Cliente</th>
                    <th>Descrição</th>
                    <th>Status</th>
                    <th>Início</th>
                    <th>Conclusão</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>

                  {producoesFiltradas.map((producao) => (
                    <tr key={producao.id}>

                      <td>{producao.orcamentoId}</td>

                      <td>
                        {producao.orcamento?.cliente?.nome || "-"}
                      </td>

                      <td>
                        {producao.orcamento?.descricao || "-"}
                      </td>

                      <td>

                        <select
                          value={producao.status}
                          onChange={(event) =>
                            alterarStatus(
                              producao,
                              event.target.value
                            )
                          }
                        >

                          <option value="aguardando_material">
                            Aguardando material
                          </option>

                          <option value="em_producao">
                            Em produção
                          </option>

                          <option value="em_montagem">
                            Em montagem
                          </option>

                          <option value="concluido">
                            Concluído
                          </option>

                        </select>

                      </td>

                      <td>
                        {formatarData(producao.dataInicio)}
                      </td>

                      <td>
                        {formatarData(producao.dataFim)}
                      </td>

                      <td className="acoes-tabela">

                        <button
                          className="botao-excluir"
                          onClick={() =>
                            excluirProducao(producao.id)
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

export default Producao;