const TatuadorDAO = require('../dao/TatuadorDAO');
const Tatuador = require('../models/Tatuador');

class TatuadorController {
    // Login de tatuador
    static async login(req, res) {
      try {
        const { email, senha } = req.body;
        if (!email || !senha) {
          return res.status(400).json({
            message: 'Email e senha são obrigatórios'
          });
        }
        const tatuador = await TatuadorDAO.findByEmail(email);
        if (!tatuador) {
          return res.status(401).json({
            message: 'Email ou senha inválidos'
          });
        }
        // Verificar senha (simples, sem hash)
        if (!tatuador.senha || tatuador.senha !== senha) {
          return res.status(401).json({
            message: 'Email ou senha inválidos'
          });
        }
        // Gerar JWT
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: tatuador.id, email: tatuador.email }, process.env.JWT_SECRET || 'studio_tatuagem', { expiresIn: '1d' });
        return res.json({
          message: 'Login realizado com sucesso',
          tatuador: tatuador.toJSON(),
          token
        });
      } catch (error) {
        console.error('Erro no login de tatuador:', error);
        return res.status(500).json({
          message: 'Erro interno do servidor',
          error: error.message
        });
      }
    }
  // Criar novo tatuador
  static async create(req, res) {
    try {
      console.log('📝 TatuadorController.create - Dados recebidos:', req.body);
      
      // Validar dados
      const errors = Tatuador.validate(req.body);
      if (errors.length > 0) {
        console.log('❌ Validação falhou:', errors);
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors 
        });
      }

      console.log('✅ Validação OK');

      // Verificar se email já existe
      const tatuadorExistente = await TatuadorDAO.findByEmail(req.body.email);
      if (tatuadorExistente) {
        console.log('⚠️  Email já existe:', req.body.email);
        return res.status(409).json({ 
          message: 'Email já cadastrado' 
        });
      }

      console.log('📤 Enviando para TatuadorDAO.create...');
      const tatuador = await TatuadorDAO.create(req.body);
      console.log('✅ Tatuador criado:', tatuador);
      
      return res.status(201).json({
        message: 'Tatuador cadastrado com sucesso',
        data: tatuador
      });
    } catch (error) {
      console.error('❌ Erro ao criar tatuador:', error);
      console.error('Stack:', error.stack);
      return res.status(500).json({ 
        message: 'Erro ao cadastrar tatuador',
        error: error.message 
      });
    }
  }

  // Listar todos os tatuadores
  static async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        especialidade = '',
        incluirInativos = false 
      } = req.query;

      const apenasAtivos = incluirInativos === 'true' ? false : true;

      const result = await TatuadorDAO.findAll(
        parseInt(page), 
        parseInt(limit), 
        search,
        especialidade,
        apenasAtivos
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao listar tatuadores:', error);
      return res.status(500).json({ 
        message: 'Erro ao listar tatuadores',
        error: error.message 
      });
    }
  }

  // Listar apenas tatuadores ativos (para dropdowns)
  static async getAllActive(req, res) {
    try {
      const tatuadores = await TatuadorDAO.findAllActive();
      
      return res.status(200).json({
        data: tatuadores
      });
    } catch (error) {
      console.error('Erro ao listar tatuadores ativos:', error);
      return res.status(500).json({ 
        message: 'Erro ao listar tatuadores ativos',
        error: error.message 
      });
    }
  }

  // Buscar tatuador por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      const tatuador = await TatuadorDAO.findById(id);
      
      if (!tatuador) {
        return res.status(404).json({ 
          message: 'Tatuador não encontrado' 
        });
      }

      return res.status(200).json({
        data: tatuador
      });
    } catch (error) {
      console.error('Erro ao buscar tatuador:', error);
      return res.status(500).json({ 
        message: 'Erro ao buscar tatuador',
        error: error.message 
      });
    }
  }

  // Atualizar tatuador
  static async update(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar se tatuador existe
      const tatuadorExistente = await TatuadorDAO.findById(id);
      if (!tatuadorExistente) {
        return res.status(404).json({ 
          message: 'Tatuador não encontrado' 
        });
      }

      // Validar dados
      const errors = Tatuador.validate(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors 
        });
      }

      // Verificar se email já existe em outro tatuador
      if (req.body.email && req.body.email !== tatuadorExistente.email) {
        const emailEmUso = await TatuadorDAO.findByEmail(req.body.email);
        if (emailEmUso && emailEmUso.id !== parseInt(id)) {
          return res.status(409).json({ 
            message: 'Email já cadastrado para outro tatuador' 
          });
        }
      }

      const tatuadorAtualizado = await TatuadorDAO.update(id, req.body);
      
      return res.status(200).json({
        message: 'Tatuador atualizado com sucesso',
        data: tatuadorAtualizado
      });
    } catch (error) {
      console.error('Erro ao atualizar tatuador:', error);
      return res.status(500).json({ 
        message: 'Erro ao atualizar tatuador',
        error: error.message 
      });
    }
  }

  // Excluir tatuador (soft delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar se tatuador existe
      const tatuador = await TatuadorDAO.findById(id);
      if (!tatuador) {
        return res.status(404).json({ 
          message: 'Tatuador não encontrado' 
        });
      }

      await TatuadorDAO.delete(id);
      
      return res.status(200).json({
        message: 'Tatuador inativado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir tatuador:', error);
      
      if (error.message.includes('agendamentos futuros')) {
        return res.status(400).json({ 
          message: error.message 
        });
      }
      
      return res.status(500).json({ 
        message: 'Erro ao excluir tatuador',
        error: error.message 
      });
    }
  }

  // Reativar tatuador
  static async reactivate(req, res) {
    try {
      const { id } = req.params;
      
      const success = await TatuadorDAO.reactivate(id);
      
      if (!success) {
        return res.status(404).json({ 
          message: 'Tatuador não encontrado' 
        });
      }

      return res.status(200).json({
        message: 'Tatuador reativado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao reativar tatuador:', error);
      return res.status(500).json({ 
        message: 'Erro ao reativar tatuador',
        error: error.message 
      });
    }
  }

  // Buscar agendamentos do tatuador
  static async getAgendamentos(req, res) {
    try {
      const { id } = req.params;
      const { dataInicio, dataFim } = req.query;
      
      // Verificar se tatuador existe
      const tatuador = await TatuadorDAO.findById(id);
      if (!tatuador) {
        return res.status(404).json({ 
          message: 'Tatuador não encontrado' 
        });
      }

      const agendamentos = await TatuadorDAO.findAgendamentos(id, dataInicio, dataFim);
      
      return res.status(200).json({
        data: agendamentos,
        total: agendamentos.length
      });
    } catch (error) {
      console.error('Erro ao buscar agendamentos do tatuador:', error);
      return res.status(500).json({ 
        message: 'Erro ao buscar agendamentos',
        error: error.message 
      });
    }
  }

  // Verificar disponibilidade do tatuador
  static async checkDisponibilidade(req, res) {
    try {
      const { id } = req.params;
      const { data, horaInicio, horaFim, agendamentoId } = req.query;
      
      if (!data || !horaInicio || !horaFim) {
        return res.status(400).json({ 
          message: 'Data, hora de início e hora de fim são obrigatórias' 
        });
      }

      // Verificar se tatuador existe
      const tatuador = await TatuadorDAO.findById(id);
      if (!tatuador) {
        return res.status(404).json({ 
          message: 'Tatuador não encontrado' 
        });
      }

      const disponivel = await TatuadorDAO.verificarDisponibilidade(
        id, 
        data, 
        horaInicio, 
        horaFim,
        agendamentoId
      );
      
      return res.status(200).json({
        disponivel,
        message: disponivel 
          ? 'Tatuador disponível neste horário' 
          : 'Tatuador já possui agendamento neste horário'
      });
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return res.status(500).json({ 
        message: 'Erro ao verificar disponibilidade',
        error: error.message 
      });
    }
  }

  // Buscar estatísticas do tatuador
  static async getEstatisticas(req, res) {
    try {
      const { id } = req.params;
      const { mes, ano } = req.query;
      
      // Verificar se tatuador existe
      const tatuador = await TatuadorDAO.findById(id);
      if (!tatuador) {
        return res.status(404).json({ 
          message: 'Tatuador não encontrado' 
        });
      }

      const estatisticas = await TatuadorDAO.getEstatisticas(id, mes, ano);
      
      return res.status(200).json({
        data: estatisticas
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return res.status(500).json({ 
        message: 'Erro ao buscar estatísticas',
        error: error.message 
      });
    }
  }
}

module.exports = TatuadorController;
