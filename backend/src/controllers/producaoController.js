const prisma = require("../lib/prisma");

// Função para listar todas as produções
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
  } 
    // Se não conseguir, retorna um erro 500 com uma mensagem de erro
    catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar produções" });
  }
}

// Função para atualizar uma produção
async function atualizarProducao(req, res) {
  try {
    // Pega o id da produção que vem do front-end
    const id = Number(req.params.id);
    // Pega o status da produção que vem do front-end
    const { status } = req.body;

    // Busca a produção pelo id
    const producaoAtual = await prisma.producao.findUnique({
      where: {
        id
      }
    });
    // Se não encontrar a produção, retorna uma mensagem de erro
    if (!producaoAtual) {
      return res.status(404).json({ erro: "Produção não encontrada" });
    }
    
    // Adiciona o status
    const dadosAtualizacao = {
      status
    };
    // Se for em produção e não tiver data de início, adiciona a data de início
    if (status === "em_producao" && !producaoAtual.dataInicio) {
      dadosAtualizacao.dataInicio = new Date();
    }
    // Se for concluído e não tiver data de fim, adiciona a data de fim
    if (status === "concluido" && !producaoAtual.dataFim) {
      dadosAtualizacao.dataFim = new Date();
      // Se não tiver data de início, adiciona a data de início
      if (!producaoAtual.dataInicio) {
        dadosAtualizacao.dataInicio = new Date();
      }
    }

    // Atualiza a produção no banco de dados
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
  } 
    // Se não conseguir, retorna um erro 500 com uma mensagem de erro
    catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar produção" });
  }
}

// Função para excluir uma produção
async function excluirProducao(req, res) {
  try {
    // Pega o id da produção que vem do front-end
    const id = Number(req.params.id);
    // Busca a produção pelo id e deleta se existir
    await prisma.producao.delete({
      where: {
        id
      }
    });
    // Retorna uma mensagem de sucesso
    res.json({ mensagem: "Produção excluída com sucesso" });
  } catch (error) {
    // Se não conseguir, retorna um erro 500 com uma mensagem de erro
    console.error(error);
    res.status(500).json({ erro: "Erro ao excluir produção" });
  }
}

module.exports = {
  listarProducoes,
  atualizarProducao,
  excluirProducao
};