const prisma = require("../lib/prisma");

// Função para listar os clientes
async function listarClientes(req, res) {
  // Tenta executar a busca dos clientes no banco de dados
  try {
    const clientes = await prisma.cliente.findMany();
    res.json(clientes);
  } 
  // Se não conseguir, retorna um erro 500 com uma mensagem de erro
  catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar clientes" });
  }
}

// Função para criar um novo cliente
async function criarCliente(req, res) {
  // Tenta criar um novo cliente no banco de dados com os dados recebidos do front-end
  try {
    // Pega os dados
    const { nome, telefone, email, cpf } = req.body;
    // Cria o cliente no banco de dados
    const cliente = await prisma.cliente.create({
      data: {
        nome,
        telefone,
        email,
        cpf
      }
    });
    // Retorna o cliente criado com status 201 (Created)
    res.status(201).json(cliente);
  } 
  // Se não conseguir, retorna um erro 500 com uma mensagem de erro
  catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar cliente" });
  }
}

// Função para atualizar um cliente
async function atualizarCliente(req, res) {
  try {
    // Pega o id e os dados do cliente a partir dos dados que vem do front-end
    const id = Number(req.params.id);
    const { nome, telefone, email, cpf } = req.body;

    // Faz o update do cliente no banco de dados com os novos dados
    const cliente = await prisma.cliente.update({
      where: {
        // Busca o cliente pelo id
        id: id
      },
      // Atualiza os dados do cliente com os novos dados
      data: {
        nome,
        telefone,
        email,
        cpf
      }
    });
    // Retorna o cliente atualizado
    res.json(cliente);
  } 
  // Se não conseguir, retorna um erro 500 com uma mensagem de erro
  catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar cliente" });
  }
}

// Função para excluir um cliente
async function excluirCliente(req, res) {
  try {
    // Pega o id do cliente a partir dos dados que vem do front-end
    const id = Number(req.params.id);
    // Busca o cliente no banco de dados pelo id
    await prisma.cliente.delete({
      where: {
        id: id
      }
    });
    // Se encontrar, retorna uma mensagem de sucesso
    res.json({ mensagem: "Cliente excluído com sucesso" });
  } catch (error) {
    // Se não conseguir, retorna um erro 500 com uma mensagem de erro
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