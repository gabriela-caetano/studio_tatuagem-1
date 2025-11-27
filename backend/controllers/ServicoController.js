const ServicoDAO = require('../dao/ServicoDAO');

class ServicoController {
  // Listar todos os serviços
  static async list(req, res) {
    try {
      const { page = 1, limit = 10, search = '', ativo } = req.query;
      
      // Se ativo=1 foi passado, ignorar paginação e retornar todos ativos
      if (ativo === '1' || ativo === 1) {
        const servicos = await ServicoDAO.findAllActive();
        return res.json({
          data: Array.isArray(servicos) ? servicos : [],
          pagination: {
            page: 1,
            limit: Array.isArray(servicos) ? servicos.length : 0,
            total: Array.isArray(servicos) ? servicos.length : 0,
            totalPages: 1
          }
        });
      }
      let result;
      try {
        result = await ServicoDAO.findAll(page, limit, search);
      } catch (error) {
        console.error('Erro ao listar serviços:', error);
        return res.status(500).json({
          error: 'Erro ao listar serviços',
          details: error.message,
          data: []
        });
      }
      res.json({
        data: Array.isArray(result.data) ? result.data : [],
        pagination: result.pagination || {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 1
        }
      });
    } catch (error) {
      console.error('Erro ao listar serviços:', error);
      res.status(500).json({ 
        error: 'Erro ao listar serviços',
        details: error.message 
      });
    }
  }

  // Listar serviços ativos (simplificado)
  static async listActive(req, res) {
    try {
      const servicos = await ServicoDAO.findAllActive();
      res.json(servicos);
    } catch (error) {
      console.error('Erro ao listar serviços ativos:', error);
      res.status(500).json({ 
        error: 'Erro ao listar serviços ativos',
        details: error.message 
      });
    }
  }

  // Buscar serviço por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const servico = await ServicoDAO.findById(id);
      
      if (!servico) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }
      
      res.json(servico);
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      res.status(500).json({ 
        error: 'Erro ao buscar serviço',
        details: error.message 
      });
    }
  }

  // Criar novo serviço
  static async create(req, res) {
    try {
      const { nome, descricao, preco_base, duracao_estimada } = req.body;
      
      // Validações
      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }
      
      if (!preco_base || preco_base <= 0) {
        return res.status(400).json({ error: 'Preço base deve ser maior que zero' });
      }

      if (!duracao_estimada || duracao_estimada <= 0) {
        return res.status(400).json({ error: 'Duração estimada deve ser maior que zero' });
      }
      
      const servicoData = {
        nome,
        descricao,
        preco_base,
        duracao_estimada
      };
      
      const novoServico = await ServicoDAO.create(servicoData);
      res.status(201).json(novoServico);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Já existe um serviço com este nome' });
      }
      
      res.status(500).json({ 
        error: 'Erro ao criar serviço',
        details: error.message 
      });
    }
  }

  // Atualizar serviço
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, preco_base, duracao_estimada } = req.body;
      
      // Validações
      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }
      
      if (preco_base && preco_base <= 0) {
        return res.status(400).json({ error: 'Preço base deve ser maior que zero' });
      }

      if (duracao_estimada && duracao_estimada <= 0) {
        return res.status(400).json({ error: 'Duração estimada deve ser maior que zero' });
      }
      
      const servicoData = {
        nome,
        descricao,
        preco_base,
        duracao_estimada
      };
      
      const servicoAtualizado = await ServicoDAO.update(id, servicoData);
      
      if (!servicoAtualizado) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }
      
      res.json(servicoAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Já existe um serviço com este nome' });
      }
      
      res.status(500).json({ 
        error: 'Erro ao atualizar serviço',
        details: error.message 
      });
    }
  }

  // Excluir serviço (soft delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const success = await ServicoDAO.delete(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }
      
      res.json({ message: 'Serviço excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      res.status(500).json({ 
        error: 'Erro ao excluir serviço',
        details: error.message 
      });
    }
  }

  // Reativar serviço
  static async reactivate(req, res) {
    try {
      const { id } = req.params;
      const success = await ServicoDAO.reactivate(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }
      
      res.json({ message: 'Serviço reativado com sucesso' });
    } catch (error) {
      console.error('Erro ao reativar serviço:', error);
      res.status(500).json({ 
        error: 'Erro ao reativar serviço',
        details: error.message 
      });
    }
  }

  // Buscar por faixa de preço
  static async findByPriceRange(req, res) {
    try {
      const { minPrice, maxPrice } = req.query;
      
      if (!minPrice || !maxPrice) {
        return res.status(400).json({ error: 'Informe minPrice e maxPrice' });
      }
      
      const servicos = await ServicoDAO.findByPriceRange(parseFloat(minPrice), parseFloat(maxPrice));
      res.json(servicos);
    } catch (error) {
      console.error('Erro ao buscar por faixa de preço:', error);
      res.status(500).json({ 
        error: 'Erro ao buscar por faixa de preço',
        details: error.message 
      });
    }
  }
}

module.exports = ServicoController;
