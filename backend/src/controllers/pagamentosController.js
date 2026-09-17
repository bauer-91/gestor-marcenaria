const prisma = require("../lib/prisma");

// Função para atualizar o status dos pagamentos de um orçamento
async function atualizarStatusPagamentos(orcamentoId) {
  const orcamento = await prisma.orcamento.findUnique({
    where: {
      id: orcamentoId
    },
    include: {
      pagamentos: true
    }
  });
  // Se não encontrar o orçamento, mensagem de erro
  if (!orcamento) {
    throw new Error("Orçamento não encontrado");
  }
  // Se encontrar, calcula o total pago e atualiza o status dos pagamentos
  const totalPago = orcamento.pagamentos.reduce((total, pagamento) => {
    return total + Number(pagamento.valor);
  }, 0);
  // Atualiza o status dos pagamentos com base no total pago em relação ao valor total do orçamento
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

// Função para listar todos os pagamentos
async function listarPagamentos(req, res) {
  try {
    // Busca os pagamentos existentes
    const pagamentosExistentes = await prisma.pagamento.findMany({
      select: {
        orcamentoId: true
      }
    });
    // Pega os ids dos pagamentos mas tira os ids repetidos
    const orcamentosIds = [
      ...new Set(
        pagamentosExistentes.map((pagamento) => pagamento.orcamentoId)
      )
    ];

    // Passa pelos ids dos pagamentos e atualiza o status de cada um
    for (const orcamentoId of orcamentosIds) {
      await atualizarStatusPagamentos(orcamentoId);
    }

    // Busca os pagamentos, trazendo junto de qual orçamento é
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
    // Se não conseguir, retorna um erro 500 com uma mensagem de erro
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao buscar pagamentos"
    });
  }
}

// Função para criar um pagamento
async function criarPagamento(req, res) {
  try {
    // Pega os dados do pagamento a partir dos dados que vem do front-end
    const {
      orcamentoId,
      valor,
      dataPagamento,
      metodo
    } = req.body;

    // Converte os valores para números
    const idOrcamento = Number(orcamentoId);
    const valorPagamento = Number(valor);

    // Se não tiver de qual orçamento ou o valor, retorna pedindo os dados obrigatórios
    if (!orcamentoId || !valor || valorPagamento <= 0) {
      return res.status(400).json({
        erro: "Orçamento e valor do pagamento são obrigatórios"
      });
    }

    // Busca o orçamento pelo id
    const orcamento = await prisma.orcamento.findUnique({
      where: {
        id: idOrcamento
      }
    });

    // Se não encontrar o orçamento, retorna uma mensagem de erro
    if (!orcamento) {
      return res.status(404).json({
        erro: "Orçamento não encontrado"
      });
    }

    // Cria o pagamento com os dados fornecidos
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

    // Atualiza o status dos pagamentos do orçamento
    const resultado = await atualizarStatusPagamentos(idOrcamento);

    // Busca o pagamento atualizado para retornar na resposta
    const pagamentoAtualizado = await prisma.pagamento.findUnique({
      where: {
        id: pagamento.id
      }
    });

    // Retorna o pagamento criado, o total pago, o valor do orçamento e o status do pagamento
    res.status(201).json({
      pagamento: pagamentoAtualizado,
      totalPago: resultado.totalPago,
      valorOrcamento: Number(orcamento.valorTotal),
      statusPagamento: resultado.status
    });
    // Se não conseguir, retorna um erro 500 com uma mensagem de erro
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao criar pagamento"
    });
  }
}

// Função para atualizar um pagamento
async function atualizarPagamento(req, res) {
  try {
    // Pega o id que vem do front-end
    const id = Number(req.params.id);
    // Pega os dados do pagamento que vem do front-end
    const {
      valor,
      dataPagamento,
      metodo
    } = req.body;
    // Busca o pagamento pelo id
    const pagamentoExistente = await prisma.pagamento.findUnique({
      where: {
        id
      }
    });
    // Se não encontrar o pagamento, retorna uma mensagem de erro
    if (!pagamentoExistente) {
      return res.status(404).json({
        erro: "Pagamento não encontrado"
      });
    }
    // Converte o valor do pagamento para número
    const valorPagamento = Number(valor);

    // Se não tiver valor ou o valor for menor ou igual a zero, retorna uma mensagem de erro
    if (!valor || valorPagamento <= 0) {
      return res.status(400).json({
        erro: "O valor do pagamento deve ser maior que zero"
      });
    }

    // Atualiza o pagamento com os dados fornecidos
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

    // Atualiza o status dos pagamentos do orçamento
    const resultado = await atualizarStatusPagamentos(
      pagamentoExistente.orcamentoId
    );

    // Busca o pagamento atualizado para retornar na resposta
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
    // Se não conseguir, retorna um erro 500 com uma mensagem de erro
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao atualizar pagamento"
    });
  }
}

// Função para excluir um pagamento
async function excluirPagamento(req, res) {
  try {
    // Pega o id do pagamento que vem do front-end
    const id = Number(req.params.id);
    // Busca o pagamento pelo id
    const pagamento = await prisma.pagamento.findUnique({
      where: {
        id
      }
    });
    // Se não encontrar o pagamento, retorna uma mensagem de erro
    if (!pagamento) {
      return res.status(404).json({
        erro: "Pagamento não encontrado"
      });
    }
    // Exclui o pagamento pelo id
    await prisma.pagamento.delete({
      where: {
        id
      }
    });
    // Atualiza o status dos pagamentos do orçamento
    const resultado = await atualizarStatusPagamentos(
      pagamento.orcamentoId
    );
    // Retorna uma mensagem de sucesso, o total pago e o status do pagamento
    res.json({
      mensagem: "Pagamento excluído com sucesso",
      totalPago: resultado.totalPago,
      statusPagamento: resultado.status
    });
    // Se não conseguir, retorna um erro 500 com uma mensagem de erro
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao excluir pagamento"
    });
  }
}

module.exports = {
  listarPagamentos,
  criarPagamento,
  atualizarPagamento,
  excluirPagamento,
};