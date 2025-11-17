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
      
      console.log('📝 Atualizando agendamento ID:', id);
      console.log('📦 Dados recebidos:', agendamentoData);
      
      // Buscar agendamento atual
      const agendamentoAtual = await AgendamentoDAO.findById(id);
      if (!agendamentoAtual) {
        return res.status(404).json({ 
          message: 'Agendamento não encontrado' 
        });
      }

      // Verificar se o agendamento já passou (considerar hora de fim)
      const dataHoraFim = new Date(`${agendamentoAtual.data_agendamento.split('T')[0]}T${agendamentoAtual.hora_fim}`);
      const agora = new Date();
      const isAgendamentoPastado = dataHoraFim < agora;
      
      console.log('📅 Data/Hora fim do agendamento:', dataHoraFim);
      console.log('🕐 Data/Hora atual:', agora);
      console.log('⏰ É agendamento passado?', isAgendamentoPastado);

      if (isAgendamentoPastado) {
        console.log('⚠️ Processando atualização de agendamento passado');
        // Para agendamentos passados, validar regras especiais
        const statusPermitidos = ['em_andamento', 'concluido', 'cancelado'];
        
        // Verificar se está tentando alterar campos não permitidos
        const camposAlterados = [];
        if (agendamentoData.cliente_id && agendamentoData.cliente_id !== agendamentoAtual.cliente_id) {
          camposAlterados.push('cliente');
        }
        if (agendamentoData.tatuador_id && agendamentoData.tatuador_id !== agendamentoAtual.tatuador_id) {
          camposAlterados.push('tatuador');
        }
        if (agendamentoData.data_agendamento && agendamentoData.data_agendamento !== agendamentoAtual.data_agendamento.split('T')[0]) {
          camposAlterados.push('data');
        }
        if (agendamentoData.hora_inicio && agendamentoData.hora_inicio !== agendamentoAtual.hora_inicio) {
          camposAlterados.push('hora de início');
        }
        if (agendamentoData.hora_fim && agendamentoData.hora_fim !== agendamentoAtual.hora_fim) {
          camposAlterados.push('hora de fim');
        }
        if (agendamentoData.servico_id && agendamentoData.servico_id !== agendamentoAtual.servico_id) {
          camposAlterados.push('serviço');
        }
        if (agendamentoData.valor_estimado && agendamentoData.valor_estimado !== agendamentoAtual.valor_estimado) {
          camposAlterados.push('valor estimado');
        }
        if (agendamentoData.descricao_tatuagem && agendamentoData.descricao_tatuagem !== agendamentoAtual.descricao_tatuagem) {
          camposAlterados.push('descrição');
        }

        if (camposAlterados.length > 0) {
          return res.status(400).json({ 
            message: 'Agendamento já passou. Não é possível alterar: ' + camposAlterados.join(', '),
            errors: [`Para agendamentos passados, apenas status (${statusPermitidos.join(', ')}) e observações podem ser alterados`]
          });
        }

        // Validar status para agendamentos passados
        if (agendamentoData.status && !statusPermitidos.includes(agendamentoData.status)) {
          return res.status(400).json({ 
            message: 'Status inválido para agendamento passado',
            errors: [`Para agendamentos passados, apenas os seguintes status são permitidos: ${statusPermitidos.join(', ')}`]
          });
        }

        // Permitir apenas alteração de status e observações
        const dadosPermitidos = {
          status: agendamentoData.status || agendamentoAtual.status,
          observacoes: agendamentoData.observacoes !== undefined ? agendamentoData.observacoes : agendamentoAtual.observacoes
        };

        // Usar updateStatus que é mais adequado para atualizar apenas status e observações
        console.log('✅ Atualizando apenas status e observações:', dadosPermitidos);
        const agendamentoAtualizado = await AgendamentoDAO.updateStatus(
          id, 
          dadosPermitidos.status, 
          dadosPermitidos.observacoes
        );
        
        console.log('✅ Agendamento atualizado com sucesso');
        return res.json({
          message: 'Status do agendamento atualizado com sucesso',
          agendamento: agendamentoAtualizado
        });
      }

      // Para agendamentos futuros, seguir fluxo normal
      console.log('✅ Processando atualização de agendamento futuro');
      // Verificar se pode ser alterado
      const agendamento = new Agendamento(agendamentoAtual);
      console.log('🔍 Verificando se pode ser alterado...');
      if (!agendamento.podeSerAlterado()) {
        console.log('❌ Agendamento não pode ser alterado');
        return res.status(400).json({ 
          message: 'Agendamento não pode ser alterado neste status' 
        });
      }
      console.log('✅ Agendamento pode ser alterado');

      // Validar dados
      console.log('🔍 Validando dados...');
      const errors = Agendamento.validate(agendamentoData);
      if (errors.length > 0) {
        console.log('❌ Dados inválidos:', errors);
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors 
        });
      }
      console.log('✅ Dados válidos');

      // Verificar disponibilidade se data/hora foram alteradas
      console.log('🔍 Verificando se precisa checar disponibilidade...');
      if (agendamentoData.data_agendamento !== agendamentoAtual.data_agendamento ||
          agendamentoData.hora_inicio !== agendamentoAtual.hora_inicio ||
          agendamentoData.hora_fim !== agendamentoAtual.hora_fim ||
          agendamentoData.tatuador_id !== agendamentoAtual.tatuador_id) {
        
        console.log('🔍 Verificando disponibilidade...');
        const disponivel = await AgendamentoDAO.verificarDisponibilidade(
          agendamentoData.tatuador_id,
          agendamentoData.data_agendamento,
          agendamentoData.hora_inicio,
          agendamentoData.hora_fim,
          id
        );

        if (!disponivel) {
          console.log('❌ Horário não disponível');
          return res.status(409).json({ 
            message: 'Horário não disponível para este tatuador' 
          });
        }
        console.log('✅ Horário disponível');
      } else {
        console.log('⏩ Não precisa verificar disponibilidade (data/hora não mudaram)');
      }

      console.log('💾 Salvando agendamento...');
      const agendamentoAtualizado = await AgendamentoDAO.update(id, agendamentoData);
      
      console.log('✅ Agendamento salvo com sucesso!');
      res.json({
        message: 'Agendamento atualizado com sucesso',
        agendamento: agendamentoAtualizado
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar agendamento:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
