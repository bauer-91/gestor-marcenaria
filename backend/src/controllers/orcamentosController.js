const prisma = require("../lib/prisma");

// Função para listar os orçamentos
async function listarOrcamentos(req, res) {
  try {
    // Busca todos os orçamentos no banco de dados, com os dados do cliente, itens e produção
    const orcamentos = await prisma.orcamento.findMany({
      include: {cliente: true, itens: true, producao: true}
    });
    // Se encontra orçamentos, retorna os orçamentos encontrados
    res.json(orcamentos);
  } 
  // Se não conseguir, retorna um erro 500 com uma mensagem de erro
  catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar orçamentos" });
  }
}

// Função para criar um orçamento
async function criarOrcamento(req, res) {
  try {
    // Pega os dados do orçamento a partir dos dados que vem do front-end
    const { clienteId, descricao, status, itens } = req.body;

    // Só permite criar o orçamento se houver um cliente
    if (!clienteId || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        erro: "Cliente e pelo menos um item são obrigatórios"
      });
    }

    // Calcula o valor total do orçamento somando o preço de cada item multiplicado pela quantidade
    const valorTotal = itens.reduce((total, item) => {
      return total + Number(item.quantidade) * Number(item.precoUnitario);
    }, 0);

    // Cria o orçamento no banco de dados
    const orcamento = await prisma.$transaction(async (tx) => {
      const novoOrcamento = await tx.orcamento.create({
        data: {clienteId: Number(clienteId), descricao, status: status || "pendente",valorTotal,itens: {
            create: itens.map((item) => ({
              nome: item.nome,
              quantidade: Number(item.quantidade),
              precoUnitario: Number(item.precoUnitario),
              total:
                Number(item.quantidade) * Number(item.precoUnitario)
            }))
          }
        },
        include: {cliente: true, itens: true}
      });
      // Se o orçamento for aprovado, cria a produção automaticamente com o status aguardando material
      if (novoOrcamento.status === "aprovado") {
        await tx.producao.create({
          data: {orcamentoId: novoOrcamento.id, status: "aguardando_material"}
        });
      }

      return novoOrcamento;
    });
    // Retorna o orçamento criado com status 201 (Created)
    res.status(201).json(orcamento);
  } 
  // Se não conseguir, retorna um erro 500 com uma mensagem de erro
  catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar orçamento" });
  }
}

// Função para atualizar um orçamento
async function atualizarOrcamento(req, res) {
  try {
    // Pega o id do orçamento a partir dos dados que vem do front-end
    const id = Number(req.params.id);
    const { clienteId, descricao, status, itens } = req.body;

    // A mesma condição da criação de orçamento
    if (!clienteId || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        erro: "Cliente e pelo menos um item são obrigatórios"
      });
    }

    // Calcula o valor total do orçamento somando o preço de cada item multiplicado pela quantidade
    const valorTotal = itens.reduce((total, item) => {
      return total + Number(item.quantidade) * Number(item.precoUnitario);
    }, 0);

    // Busca o orçamento no banco e verifica se já foi criado um id para produção ou não
    const orcamentoExistente = await prisma.orcamento.findUnique({
      where: { id },
      include: {producao: true}
    });

    // Se não encontrar, retorna que não encontrou
    if (!orcamentoExistente) {
      return res.status(404).json({
        erro: "Orçamento não encontrado"
      });
    }

    // Se mudou o status atualize, se não, mantém o status atual
    const novoStatus = status || orcamentoExistente.status;

    // Grava as alterações no banco de dados, deletando os itens antigos e criando os novos
    const orcamento = await prisma.$transaction(async (tx) => {
      await tx.orcamentoItem.deleteMany({
        where: {orcamentoId: id}
      });

      const orcamentoAtualizado = await tx.orcamento.update({
        where: {id},
        data: {
          clienteId: Number(clienteId),
          descricao,
          status: novoStatus,
          valorTotal,
          itens: {
            create: itens.map((item) => ({
              nome: item.nome,
              quantidade: Number(item.quantidade),
              precoUnitario: Number(item.precoUnitario),
              total:
                Number(item.quantidade) * Number(item.precoUnitario)
            }))
          }
        },
        include: {cliente: true, itens: true}
      });

      // Precisa criar a produção se o status for aprovado e não houver produção existente
      if (
        novoStatus === "aprovado" &&
        !orcamentoExistente.producao
      ) {
        await tx.producao.create({
          data: {
            orcamentoId: id,
            status: "aguardando_material"
          }
        });
      }

      return orcamentoAtualizado;
    });

    res.json(orcamento);
  } 
    // Se não conseguir, retorna um erro 500 com uma mensagem de erro
    catch (error) {
    console.error(error);
    res.status(500).json({
      erro: "Erro ao atualizar orçamento"
    });
  }
}

// Função para excluir um orçamento
async function excluirOrcamento(req, res) {
  try {
    // Pega o id do orçamento a partir dos dados que vem do front-end
    const id = Number(req.params.id);
    // Busca o orçamento no banco de dados pelo id
    const orcamentoExistente = await prisma.orcamento.findUnique({
      where: { id }
    });
    // Se não achar, retorna que não encontrou
    if (!orcamentoExistente) {
      return res.status(404).json({
        erro: "Orçamento não encontrado"
      });
    }
    // Deleta o orçamento do banco de dados
    await prisma.orcamento.delete({
      where: { id }
    });
    // Retorna uma mensagem de sucesso
    res.json({
      mensagem: "Orçamento excluído com sucesso"
    });
    // Se não conseguir, retorna um erro 500 com uma mensagem de erro
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
  atualizarOrcamento,
  excluirOrcamento
};