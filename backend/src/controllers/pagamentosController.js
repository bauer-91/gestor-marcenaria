const prisma = require("../lib/prisma");

async function atualizarStatusPagamentos(orcamentoId) {
  const orcamento = await prisma.orcamento.findUnique({
    where: {
      id: orcamentoId
    },
    include: {
      pagamentos: true
    }
  });

  if (!orcamento) {
    throw new Error("Orçamento não encontrado");
  }

  const totalPago = orcamento.pagamentos.reduce((total, pagamento) => {
    return total + Number(pagamento.valor);
  }, 0);

  const status = totalPago >= Number(orcamento.valorTotal)
    ? "pago"
    : "pendente";

  await prisma.pagamento.updateMany({
    where: {
      orcamentoId
    },
    data: {
      status
    }
  });

  return {
    totalPago,
    status
  };
}

async function listarPagamentos(req, res) {
  try {
    const pagamentosExistentes = await prisma.pagamento.findMany({
      select: {
        orcamentoId: true
      }
    });

    const orcamentosIds = [
      ...new Set(
        pagamentosExistentes.map((pagamento) => pagamento.orcamentoId)
      )
    ];

    for (const orcamentoId of orcamentosIds) {
      await atualizarStatusPagamentos(orcamentoId);
    }

    const pagamentos = await prisma.pagamento.findMany({
      include: {
        orcamento: {
          include: {
            cliente: true
          }
        }
      }
    });

    res.json(pagamentos);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao buscar pagamentos"
    });
  }
}

async function criarPagamento(req, res) {
  try {
    const {
      orcamentoId,
      valor,
      dataPagamento,
      metodo
    } = req.body;

    const idOrcamento = Number(orcamentoId);
    const valorPagamento = Number(valor);

    if (!orcamentoId || !valor || valorPagamento <= 0) {
      return res.status(400).json({
        erro: "Orçamento e valor do pagamento são obrigatórios"
      });
    }

    const orcamento = await prisma.orcamento.findUnique({
      where: {
        id: idOrcamento
      }
    });

    if (!orcamento) {
      return res.status(404).json({
        erro: "Orçamento não encontrado"
      });
    }

    const pagamento = await prisma.pagamento.create({
      data: {
        orcamentoId: idOrcamento,
        valor: valorPagamento,
        dataPagamento: dataPagamento
          ? new Date(dataPagamento)
          : null,
        metodo: metodo || null
      }
    });

    const resultado = await atualizarStatusPagamentos(idOrcamento);

    const pagamentoAtualizado = await prisma.pagamento.findUnique({
      where: {
        id: pagamento.id
      }
    });

    res.status(201).json({
      pagamento: pagamentoAtualizado,
      totalPago: resultado.totalPago,
      valorOrcamento: Number(orcamento.valorTotal),
      statusPagamento: resultado.status
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao criar pagamento"
    });
  }
}

async function buscarPagamento(req, res) {
  try {
    const id = Number(req.params.id);

    const pagamento = await prisma.pagamento.findUnique({
      where: {
        id
      },
      include: {
        orcamento: {
          include: {
            cliente: true
          }
        }
      }
    });

    if (!pagamento) {
      return res.status(404).json({
        erro: "Pagamento não encontrado"
      });
    }

    res.json(pagamento);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao buscar pagamento"
    });
  }
}

async function atualizarPagamento(req, res) {
  try {
    const id = Number(req.params.id);

    const {
      valor,
      dataPagamento,
      metodo
    } = req.body;

    const pagamentoExistente = await prisma.pagamento.findUnique({
      where: {
        id
      }
    });

    if (!pagamentoExistente) {
      return res.status(404).json({
        erro: "Pagamento não encontrado"
      });
    }

    const valorPagamento = Number(valor);

    if (!valor || valorPagamento <= 0) {
      return res.status(400).json({
        erro: "O valor do pagamento deve ser maior que zero"
      });
    }

    const pagamento = await prisma.pagamento.update({
      where: {
        id
      },
      data: {
        valor: valorPagamento,
        dataPagamento: dataPagamento
          ? new Date(dataPagamento)
          : null,
        metodo: metodo || null
      }
    });

    const resultado = await atualizarStatusPagamentos(
      pagamentoExistente.orcamentoId
    );

    const pagamentoAtualizado = await prisma.pagamento.findUnique({
      where: {
        id
      },
      include: {
        orcamento: {
          include: {
            cliente: true
          }
        }
      }
    });

    res.json({
      pagamento: pagamentoAtualizado,
      totalPago: resultado.totalPago,
      statusPagamento: resultado.status
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao atualizar pagamento"
    });
  }
}

async function excluirPagamento(req, res) {
  try {
    const id = Number(req.params.id);

    const pagamento = await prisma.pagamento.findUnique({
      where: {
        id
      }
    });

    if (!pagamento) {
      return res.status(404).json({
        erro: "Pagamento não encontrado"
      });
    }

    await prisma.pagamento.delete({
      where: {
        id
      }
    });

    const resultado = await atualizarStatusPagamentos(
      pagamento.orcamentoId
    );

    res.json({
      mensagem: "Pagamento excluído com sucesso",
      totalPago: resultado.totalPago,
      statusPagamento: resultado.status
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao excluir pagamento"
    });
  }
}

async function resumoPagamentosOrcamento(req, res) {
  try {
    const orcamentoId = Number(req.params.orcamentoId);

    const orcamento = await prisma.orcamento.findUnique({
      where: {
        id: orcamentoId
      },
      include: {
        pagamentos: true
      }
    });

    if (!orcamento) {
      return res.status(404).json({
        erro: "Orçamento não encontrado"
      });
    }

    const totalPago = orcamento.pagamentos.reduce((total, pagamento) => {
      return total + Number(pagamento.valor);
    }, 0);

    const valorOrcamento = Number(orcamento.valorTotal);

    const saldo = Math.max(valorOrcamento - totalPago, 0);

    const statusPagamento = totalPago >= valorOrcamento
      ? "pago"
      : "pendente";

    res.json({
      orcamentoId: orcamento.id,
      valorOrcamento,
      totalPago,
      saldo,
      statusPagamento,
      pagamentos: orcamento.pagamentos
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao buscar resumo dos pagamentos"
    });
  }
}

module.exports = {
  listarPagamentos,
  criarPagamento,
  buscarPagamento,
  atualizarPagamento,
  excluirPagamento,
  resumoPagamentosOrcamento
};