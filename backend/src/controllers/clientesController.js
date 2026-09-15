const prisma = require("../lib/prisma");

async function listarClientes(req, res) {
  try {
    const clientes = await prisma.cliente.findMany();

    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar clientes" });
  }
}

async function criarCliente(req, res) {
  try {
    const { nome, telefone, email, cpf } = req.body;

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        telefone,
        email,
        cpf
      }
    });

    res.status(201).json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar cliente" });
  }
}

async function buscarCliente(req, res) {
  try {
    const id = Number(req.params.id);

    const cliente = await prisma.cliente.findUnique({
      where: {
        id: id
      }
    });

    if (!cliente) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar cliente" });
  }
}

async function atualizarCliente(req, res) {
  try {
    const id = Number(req.params.id);
    const { nome, telefone, email, cpf } = req.body;

    const cliente = await prisma.cliente.update({
      where: {
        id: id
      },
      data: {
        nome,
        telefone,
        email,
        cpf
      }
    });

    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar cliente" });
  }
}

async function excluirCliente(req, res) {
  try {
    const id = Number(req.params.id);

    await prisma.cliente.delete({
      where: {
        id: id
      }
    });

    res.json({ mensagem: "Cliente excluído com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao excluir cliente" });
  }
}

module.exports = {
  listarClientes,
  criarCliente,
  buscarCliente,
  atualizarCliente,
  excluirCliente
};