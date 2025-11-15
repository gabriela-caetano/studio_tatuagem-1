const ClienteDAO = require('../dao/ClienteDAO');
const Cliente = require('../models/Cliente');

class ClienteController {
  // Criar novo cliente
  static async create(req, res) {
    try {
      const clienteData = req.body;
      
      // Validar dados
      const errors = Cliente.validate(clienteData);
      if (errors.length > 0) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors 
        });
      }

      // Verificar se email já existe
      const emailExistente = await ClienteDAO.findByEmail(clienteData.email);
      if (emailExistente) {
        return res.status(409).json({ 
          message: 'Email já cadastrado' 
        });
      }

      // Verificar se CPF já existe
      const cpfExistente = await ClienteDAO.findByCPF(clienteData.cpf);
      if (cpfExistente) {
        return res.status(409).json({ 
          message: 'CPF já cadastrado' 
        });
      }

      const cliente = await ClienteDAO.create(clienteData);
      if (!cliente) {
        return res.status(500).json({
          message: 'Erro ao criar cliente: registro não encontrado após inserção.'
        });
      }
      res.status(201).json({
        message: 'Cliente criado com sucesso',
        cliente: cliente.toJSON()
      });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Buscar cliente por ID
  static async findById(req, res) {
    try {
      const { id } = req.params;
      
      const cliente = await ClienteDAO.findById(id);
      
      if (!cliente) {
        return res.status(404).json({ 
          message: 'Cliente não encontrado' 
        });
      }

      res.json({
        cliente: cliente.toJSON()
      });
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Listar todos os clientes
  static async findAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      
      const result = await ClienteDAO.findAll(
        parseInt(page), 
        parseInt(limit), 
        search
      );
      
      res.json({
        message: 'Clientes encontrados',
        data: result.clientes.map(cliente => cliente.toJSON()),
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Atualizar cliente
  static async update(req, res) {
    try {
      const { id } = req.params;
      const clienteData = req.body;
      
      // Validar dados
      const errors = Cliente.validate(clienteData);
      if (errors.length > 0) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors 
        });
      }

      // Verificar se o cliente existe
      const clienteExistente = await ClienteDAO.findById(id);
      if (!clienteExistente) {
        return res.status(404).json({ 
          message: 'Cliente não encontrado' 
        });
      }

      // Verificar se email já existe (exceto para o próprio cliente)
      const emailExistente = await ClienteDAO.findByEmail(clienteData.email);
      if (emailExistente && emailExistente.id != id) {
        return res.status(409).json({ 
          message: 'Email já cadastrado para outro cliente' 
        });
      }

      // Verificar se CPF já existe (exceto para o próprio cliente)
      const cpfExistente = await ClienteDAO.findByCPF(clienteData.cpf);
      if (cpfExistente && cpfExistente.id != id) {
        return res.status(409).json({ 
          message: 'CPF já cadastrado para outro cliente' 
        });
      }

      const cliente = await ClienteDAO.update(id, clienteData);
      
      res.json({
        message: 'Cliente atualizado com sucesso',
        cliente: cliente.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Excluir cliente
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      const cliente = await ClienteDAO.findById(id);
      if (!cliente) {
        return res.status(404).json({ 
          message: 'Cliente não encontrado' 
        });
      }

      const sucesso = await ClienteDAO.delete(id);
      
      if (sucesso) {
        res.json({ 
          message: 'Cliente excluído com sucesso' 
        });
      } else {
        res.status(500).json({ 
          message: 'Erro ao excluir cliente' 
        });
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Buscar agendamentos do cliente
  static async findAgendamentos(req, res) {
    try {
      const { id } = req.params;
      
      const cliente = await ClienteDAO.findById(id);
      if (!cliente) {
        return res.status(404).json({ 
          message: 'Cliente não encontrado' 
        });
      }

      const agendamentos = await ClienteDAO.findAgendamentos(id);
      
      res.json({
        message: 'Agendamentos encontrados',
        agendamentos
      });
    } catch (error) {
      console.error('Erro ao buscar agendamentos do cliente:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }
}

module.exports = ClienteController;
