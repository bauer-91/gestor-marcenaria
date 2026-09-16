const prisma = require("../lib/prisma");

async function listarOrcamentos(req, res) {
  try {
    const orcamentos = await prisma.orcamento.findMany({
      include: {
        cliente: true,
        itens: true
      }
    });

    res.json(orcamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar orçamentos" });
  }
}

async function criarOrcamento(req, res) {
  try {
    const { clienteId, descricao, status, itens } = req.body;

    if (!clienteId || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        erro: "Cliente e pelo menos um item são obrigatórios"
      });
    }

    const valorTotal = itens.reduce((total, item) => {
      return total + Number(item.quantidade) * Number(item.precoUnitario);
    }, 0);

    const orcamento = await prisma.orcamento.create({
      data: {
        clienteId: Number(clienteId),
        descricao,
        status: status || "pendente",
        valorTotal,
        itens: {
          create: itens.map((item) => ({
            nome: item.nome,
            quantidade: Number(item.quantidade),
            precoUnitario: Number(item.precoUnitario),
            total: Number(item.quantidade) * Number(item.precoUnitario)
          }))
        }
      },
      include: {
        cliente: true,
        itens: true
      }
    });

    res.status(201).json(orcamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar orçamento" });
  }
}

async function buscarOrcamento(req, res) {
  try {
    const id = Number(req.params.id);

    const orcamento = await prisma.orcamento.findUnique({
      where: {
        id
      },
      include: {
        cliente: true,
        itens: true
      }
    });

    if (!orcamento) {
      return res.status(404).json({
        erro: "Orçamento não encontrado"
      });
    }

    res.json(orcamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: "Erro ao buscar orçamento"
    });
  }
}

async function atualizarOrcamento(req, res) {
  try {
    const id = Number(req.params.id);
    const { clienteId, descricao, status, itens } = req.body;

    if (!clienteId || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        erro: "Cliente e pelo menos um item são obrigatórios"
      });
    }

    const valorTotal = itens.reduce((total, item) => {
      return total + Number(item.quantidade) * Number(item.precoUnitario);
    }, 0);

    const orcamentoExistente = await prisma.orcamento.findUnique({
      where: {
        id
      }
    });

    if (!orcamentoExistente) {
      return res.status(404).json({
        erro: "Orçamento não encontrado"
      });
    }

    const orcamento = await prisma.$transaction(async (tx) => {
      await tx.orcamentoItem.deleteMany({
        where: {
          orcamentoId: id
        }
      });

      return await tx.orcamento.update({
        where: {
          id
        },
        data: {
          clienteId: Number(clienteId),
          descricao,
          status: status || "pendente",
          valorTotal,
          itens: {
            create: itens.map((item) => ({
              nome: item.nome,
              quantidade: Number(item.quantidade),
              precoUnitario: Number(item.precoUnitario),
              total: Number(item.quantidade) * Number(item.precoUnitario)
            }))
          }
        },
        include: {
          cliente: true,
          itens: true
        }
      });
    });

    res.json(orcamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: "Erro ao atualizar orçamento"
    });
  }
}

async function excluirOrcamento(req, res) {
  try {
    const id = Number(req.params.id);

    const orcamentoExistente = await prisma.orcamento.findUnique({
      where: {
        id
      }
    });

    if (!orcamentoExistente) {
      return res.status(404).json({
        erro: "Orçamento não encontrado"
      });
    }

    await prisma.orcamento.delete({
      where: {
        id
      }
    });

    res.json({
      mensagem: "Orçamento excluído com sucesso"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: "Erro ao excluir orçamento"
    });
  }
}

module.exports = {
  listarOrcamentos,
  criarOrcamento,
  buscarOrcamento,
  atualizarOrcamento,
  excluirOrcamento
};