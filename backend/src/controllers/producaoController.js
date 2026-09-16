const prisma = require("../lib/prisma");

async function listarProducoes(req, res) {
  try {
    const producoes = await prisma.producao.findMany({
      include: {
        orcamento: {
          include: {
            cliente: true
          }
        }
      }
    });

    res.json(producoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar produções" });
  }
}

async function criarProducao(req, res) {
  try {
    const { orcamentoId, status } = req.body;

    const producao = await prisma.producao.create({
      data: {
        orcamentoId: Number(orcamentoId),
        status: status || "aguardando_material"
      },
      include: {
        orcamento: {
          include: {
            cliente: true
          }
        }
      }
    });

    res.status(201).json(producao);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar produção" });
  }
}

async function buscarProducao(req, res) {
  try {
    const id = Number(req.params.id);

    const producao = await prisma.producao.findUnique({
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

    if (!producao) {
      return res.status(404).json({ erro: "Produção não encontrada" });
    }

    res.json(producao);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar produção" });
  }
}

async function atualizarProducao(req, res) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const producaoAtual = await prisma.producao.findUnique({
      where: {
        id
      }
    });

    if (!producaoAtual) {
      return res.status(404).json({ erro: "Produção não encontrada" });
    }

    const dadosAtualizacao = {
      status
    };

    if (status === "em_producao" && !producaoAtual.dataInicio) {
      dadosAtualizacao.dataInicio = new Date();
    }

    if (status === "concluido" && !producaoAtual.dataFim) {
      dadosAtualizacao.dataFim = new Date();

      if (!producaoAtual.dataInicio) {
        dadosAtualizacao.dataInicio = new Date();
      }
    }

    const producao = await prisma.producao.update({
      where: {
        id
      },
      data: dadosAtualizacao,
      include: {
        orcamento: {
          include: {
            cliente: true
          }
        }
      }
    });

    res.json(producao);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar produção" });
  }
}

async function excluirProducao(req, res) {
  try {
    const id = Number(req.params.id);

    await prisma.producao.delete({
      where: {
        id
      }
    });

    res.json({ mensagem: "Produção excluída com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao excluir produção" });
  }
}

module.exports = {
  listarProducoes,
  criarProducao,
  buscarProducao,
  atualizarProducao,
  excluirProducao
};