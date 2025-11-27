const AgendamentoDAO = require('../dao/AgendamentoDAO');
const ClienteDAO = require('../dao/ClienteDAO');
const Agendamento = require('../models/Agendamento');

class AgendamentoController {
  // Criar novo agendamento
  static async create(req, res) {
    try {
      const agendamentoData = req.body;
      console.log('📝 Dados recebidos:', agendamentoData);
      
      // Validar dados
      const errors = Agendamento.validate(agendamentoData);
      if (errors.length > 0) {
        console.log('❌ Erros de validação:', errors);
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors 
        });
      }

      // Verificar se o cliente existe
      const cliente = await ClienteDAO.findById(agendamentoData.cliente_id);
      if (!cliente) {
        console.log('❌ Cliente não encontrado:', agendamentoData.cliente_id);
        return res.status(404).json({ 
          message: 'Cliente não encontrado' 
        });
      }
      console.log('✅ Cliente encontrado:', cliente.nome);

      // Verificar disponibilidade do tatuador
      const disponivel = await AgendamentoDAO.verificarDisponibilidade(
        agendamentoData.tatuador_id,
        agendamentoData.data_agendamento,
        agendamentoData.hora_inicio,
        agendamentoData.hora_fim
      );

      if (!disponivel) {
        console.log('❌ Horário não disponível');
        return res.status(409).json({ 
          message: 'Horário não disponível para este tatuador' 
        });
      }
      console.log('✅ Horário disponível');

      const agendamento = await AgendamentoDAO.create(agendamentoData);
      console.log('✅ Agendamento criado:', agendamento);
      
      res.status(201).json({
        message: 'Agendamento criado com sucesso',
        agendamento
      });
    } catch (error) {
      console.error('💥 Erro ao criar agendamento:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar agendamento por ID
  static async findById(req, res) {
    try {
      const { id } = req.params;
      
      const agendamento = await AgendamentoDAO.findById(id);
      
      if (!agendamento) {
        return res.status(404).json({ 
          message: 'Agendamento não encontrado' 
        });
      }

      res.json({
        agendamento
      });
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Listar agendamentos com filtros
  static async findAll(req, res) {
    try {
      const filters = {};
      
      // Aplicar filtros da query string
      if (req.query.cliente_id) filters.cliente_id = req.query.cliente_id;
      if (req.query.tatuador_id) filters.tatuador_id = req.query.tatuador_id;
      if (req.query.status) filters.status = req.query.status;
      if (req.query.data_agendamento) filters.data_agendamento = req.query.data_agendamento;
      if (req.query.data_inicio && req.query.data_fim) {
        filters.data_inicio = req.query.data_inicio;
        filters.data_fim = req.query.data_fim;
      }
      
      const agendamentos = await AgendamentoDAO.findAll(filters);
      console.log('📋 Agendamentos encontrados:', agendamentos.length);
      
      res.json({
        message: 'Agendamentos encontrados',
        agendamentos: Array.isArray(agendamentos) ? agendamentos : [],
        pagination: {
          total: Array.isArray(agendamentos) ? agendamentos.length : 0,
          page: 1,
          limit: Array.isArray(agendamentos) ? agendamentos.length : 0,
          totalPages: 1
        }
      });
    } catch (error) {
      console.error('Erro ao listar agendamentos:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Atualizar agendamento
  static async update(req, res) {
    try {
      const { id } = req.params;
      const agendamentoData = req.body;
      
      // Buscar agendamento atual
      const agendamentoAtual = await AgendamentoDAO.findById(id);
      if (!agendamentoAtual) {
        return res.status(404).json({ 
          message: 'Agendamento não encontrado' 
        });
      }

      // Verificar se pode ser alterado
      const agendamento = new Agendamento(agendamentoAtual);
      if (!agendamento.podeSerAlterado()) {
        return res.status(400).json({ 
          message: 'Agendamento não pode ser alterado neste status' 
        });
      }

      // Validar dados
      const errors = Agendamento.validate(agendamentoData);
      if (errors.length > 0) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors 
        });
      }

      // Verificar disponibilidade se data/hora foram alteradas
      if (agendamentoData.data_agendamento !== agendamentoAtual.data_agendamento ||
          agendamentoData.hora_inicio !== agendamentoAtual.hora_inicio ||
          agendamentoData.hora_fim !== agendamentoAtual.hora_fim ||
          agendamentoData.tatuador_id !== agendamentoAtual.tatuador_id) {
        
        const disponivel = await AgendamentoDAO.verificarDisponibilidade(
          agendamentoData.tatuador_id,
          agendamentoData.data_agendamento,
          agendamentoData.hora_inicio,
          agendamentoData.hora_fim,
          id
        );

        if (!disponivel) {
          return res.status(409).json({ 
            message: 'Horário não disponível para este tatuador' 
          });
        }
      }

      const agendamentoAtualizado = await AgendamentoDAO.update(id, agendamentoData);
      
      res.json({
        message: 'Agendamento atualizado com sucesso',
        agendamento: agendamentoAtualizado
      });
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Atualizar status do agendamento
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, observacoes } = req.body;
      
      if (!status) {
        return res.status(400).json({ 
          message: 'Status é obrigatório' 
        });
      }

      if (!Object.values(Agendamento.STATUS).includes(status)) {
        return res.status(400).json({ 
          message: 'Status inválido' 
        });
      }

      const agendamento = await AgendamentoDAO.findById(id);
      if (!agendamento) {
        return res.status(404).json({ 
          message: 'Agendamento não encontrado' 
        });
      }

      const agendamentoAtualizado = await AgendamentoDAO.updateStatus(id, status, observacoes);
      
      res.json({
        message: 'Status atualizado com sucesso',
        agendamento: agendamentoAtualizado
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Cancelar agendamento
  static async cancel(req, res) {
    try {
      const { id } = req.params;
      const { observacoes } = req.body;
      
      const agendamento = await AgendamentoDAO.findById(id);
      if (!agendamento) {
        return res.status(404).json({ 
          message: 'Agendamento não encontrado' 
        });
      }

      const agendamentoObj = new Agendamento(agendamento);
      if (!agendamentoObj.podeSerCancelado()) {
        return res.status(400).json({ 
          message: 'Agendamento não pode ser cancelado neste status' 
        });
      }

      const agendamentoAtualizado = await AgendamentoDAO.updateStatus(
        id, 
        Agendamento.STATUS.CANCELADO, 
        observacoes || 'Cancelado'
      );
      
      res.json({
        message: 'Agendamento cancelado com sucesso',
        agendamento: agendamentoAtualizado
      });
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Concluir agendamento
  static async concluir(req, res) {
    try {
      const { id } = req.params;
      const { valor_final, observacoes } = req.body;
      
      const agendamento = await AgendamentoDAO.findById(id);
      if (!agendamento) {
        return res.status(404).json({ 
          message: 'Agendamento não encontrado' 
        });
      }

      // Verificar se está em andamento ou confirmado
      if (!['em_andamento', 'confirmado'].includes(agendamento.status)) {
        return res.status(400).json({ 
          message: 'Apenas agendamentos confirmados ou em andamento podem ser concluídos' 
        });
      }

      // Validar valor final
      if (valor_final && (isNaN(valor_final) || valor_final < 0)) {
        return res.status(400).json({ 
          message: 'Valor final inválido' 
        });
      }

      // Atualizar com valor final e status
      const dadosAtualizacao = {
        ...agendamento,
        status: Agendamento.STATUS.CONCLUIDO,
        valor_final: valor_final || agendamento.valor_estimado,
        observacoes: observacoes || agendamento.observacoes
      };

      const agendamentoAtualizado = await AgendamentoDAO.update(id, dadosAtualizacao);
      
      res.json({
        message: 'Agendamento concluído com sucesso',
        agendamento: agendamentoAtualizado
      });
    } catch (error) {
      console.error('Erro ao concluir agendamento:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Excluir agendamento
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      const agendamento = await AgendamentoDAO.findById(id);
      if (!agendamento) {
        return res.status(404).json({ 
          message: 'Agendamento não encontrado' 
        });
      }

      const sucesso = await AgendamentoDAO.delete(id);
      
      if (sucesso) {
        res.json({ 
          message: 'Agendamento excluído com sucesso' 
        });
      } else {
        res.status(500).json({ 
          message: 'Erro ao excluir agendamento' 
        });
      }
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Buscar agendamentos do dia
  static async findByDate(req, res) {
    try {
      const { data } = req.params;
      
      const agendamentos = await AgendamentoDAO.findByDate(data);
      
      res.json({
        message: 'Agendamentos do dia encontrados',
        agendamentos: Array.isArray(agendamentos) ? agendamentos : []
      });
    } catch (error) {
      console.error('Erro ao buscar agendamentos do dia:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Relatório mensal
  static async relatorioMensal(req, res) {
    try {
      const { ano, mes } = req.params;
      
      const relatorio = await AgendamentoDAO.relatorioMensal(
        parseInt(ano), 
        parseInt(mes)
      );
      
      res.json({
        message: 'Relatório mensal gerado',
        relatorio: {
          ...relatorio,
          periodo: `${mes}/${ano}`
        }
      });
    } catch (error) {
      console.error('Erro ao gerar relatório mensal:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Verificar disponibilidade de horário
  static async verificarDisponibilidade(req, res) {
    try {
      const { tatuadorId, data, horaInicio, horaFim, agendamentoId } = req.query;

      if (!tatuadorId || !data || !horaInicio || !horaFim) {
        return res.status(400).json({ 
          message: 'Parâmetros obrigatórios: tatuadorId, data, horaInicio, horaFim' 
        });
      }

      const disponivel = await AgendamentoDAO.verificarDisponibilidade(
        parseInt(tatuadorId),
        data,
        horaInicio,
        horaFim,
        agendamentoId ? parseInt(agendamentoId) : null
      );

      // Buscar conflitos se não estiver disponível
      let conflitos = [];
      if (!disponivel) {
        const db = require('../config/database');
        const query = `
          SELECT id, hora_inicio, hora_fim, cliente_nome, status
          FROM view_agendamentos_completos
          WHERE tatuador_id = ? 
          AND data = ? 
          AND status NOT IN ('cancelado')
          AND (
            (hora_inicio < ? AND hora_fim > ?) OR
            (hora_inicio < ? AND hora_fim > ?) OR
            (hora_inicio >= ? AND hora_fim <= ?)
          )
          ${agendamentoId ? 'AND id != ?' : ''}
        `;

        const params = [
          tatuadorId, 
          data,
          horaFim, horaInicio,
          horaFim, horaInicio,
          horaInicio, horaFim
        ];

        if (agendamentoId) {
          params.push(agendamentoId);
        }

        const rows = await db.query(query, params);
        conflitos = rows;
      }

      res.json({
        disponivel,
        conflitos
      });
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      res.status(500).json({ 
        message: 'Erro ao verificar disponibilidade',
        error: error.message 
      });
    }
  }
}

module.exports = AgendamentoController;
