const db = require('../config/database');

class RelatorioController {
  // Relatório geral de agendamentos
  static async agendamentos(req, res) {
    try {
      const { 
        dataInicio, 
        dataFim, 
        tatuadorId, 
        status, 
        formato = 'json' 
      } = req.query;

      let query = `
        SELECT 
          a.id,
          a.data_agendamento,
          a.hora_inicio,
          a.hora_fim,
          a.status,
          a.valor_estimado,
          a.valor_final,
          c.nome as cliente_nome,
          c.telefone as cliente_telefone,
          t.nome as tatuador_nome,
          s.nome as servico_nome
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN tatuadores t ON a.tatuador_id = t.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE 1=1
      `;

      const params = [];

      // Se for tatuador, filtrar apenas seus agendamentos
      if (req.usuario && req.usuario.tipo === 'tatuador') {
        query += ' AND a.tatuador_id = ?';
        params.push(req.usuario.id);
      } else if (tatuadorId) {
        query += ' AND a.tatuador_id = ?';
        params.push(tatuadorId);
      }

      if (dataInicio) {
        query += ' AND a.data_agendamento >= ?';
        params.push(dataInicio);
      }

      if (dataFim) {
        query += ' AND a.data_agendamento <= ?';
        params.push(dataFim);
      }

      if (tatuadorId) {
        query += ' AND a.tatuador_id = ?';
        params.push(tatuadorId);
      }

      if (status) {
        query += ' AND a.status = ?';
        params.push(status);
      }

      query += ' ORDER BY a.data_agendamento DESC, a.hora_inicio DESC';

      const agendamentos = await db.query(query, params);

      // Calcular estatísticas
      const estatisticas = {
        total: agendamentos.length,
        concluidos: agendamentos.filter(a => a.status === 'concluido').length,
        cancelados: agendamentos.filter(a => a.status === 'cancelado').length,
        faturamento: agendamentos
          .filter(a => a.status === 'concluido')
          .reduce((sum, a) => sum + parseFloat(a.valor_final || a.valor_estimado || 0), 0),
        ticketMedio: 0
      };

      if (estatisticas.concluidos > 0) {
        estatisticas.ticketMedio = estatisticas.faturamento / estatisticas.concluidos;
      }

      // Calcular agendamentos por status
      const porStatus = agendamentos.reduce((acc, agendamento) => {
        const status = agendamento.status || 'indefinido';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return res.json({
        periodo: {
          dataInicio: dataInicio || 'início',
          dataFim: dataFim || 'hoje'
        },
        estatisticas,
        porStatus,
        agendamentos: Array.isArray(agendamentos) ? agendamentos : []
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de agendamentos:', error);
      return res.status(500).json({ 
        message: 'Erro ao gerar relatório' 
      });
    }
  }

  // Relatório financeiro
  static async financeiro(req, res) {
    try {
      const { ano, mes, tatuadorId, data_inicio, data_fim } = req.query;

      // Aceitar tanto o formato antigo (ano/mes) quanto o novo (data_inicio/data_fim)
      let query, params;

      if (data_inicio && data_fim) {
        // Formato novo com range de datas
        query = `
          SELECT 
            DATE(a.data_agendamento) as data,
            COUNT(*) as total_agendamentos,
            COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as concluidos,
            SUM(CASE WHEN a.status = 'concluido' THEN COALESCE(a.valor_final, a.valor_estimado, 0) ELSE 0 END) as faturamento_dia,
            t.id as tatuador_id,
            t.nome as tatuador_nome
          FROM agendamentos a
          LEFT JOIN tatuadores t ON a.tatuador_id = t.id
          WHERE a.data_agendamento BETWEEN ? AND ?
        `;
        params = [data_inicio, data_fim];

        if (tatuadorId) {
          query += ' AND a.tatuador_id = ?';
          params.push(tatuadorId);
        }

        query += ' GROUP BY DATE(a.data_agendamento), t.id, t.nome';
        query += ' ORDER BY data DESC';

      } else if (ano && mes) {
        // Formato antigo com ano/mes
        query = `
          SELECT 
            DATE(a.data_agendamento) as data,
            COUNT(*) as total_agendamentos,
            COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as concluidos,
            SUM(CASE WHEN a.status = 'concluido' THEN COALESCE(a.valor_final, a.valor_estimado, 0) ELSE 0 END) as faturamento_dia,
            t.id as tatuador_id,
            t.nome as tatuador_nome
          FROM agendamentos a
          LEFT JOIN tatuadores t ON a.tatuador_id = t.id
          WHERE strftime('%Y', a.data_agendamento) = ? AND strftime('%m', a.data_agendamento) = ?
        `;
        params = [ano, mes];

        if (tatuadorId) {
          query += ' AND a.tatuador_id = ?';
          params.push(tatuadorId);
        }

        query += ' GROUP BY DATE(a.data_agendamento), t.id, t.nome';
        query += ' ORDER BY data DESC';

      } else {
        return res.status(400).json({ 
          message: 'Informe (ano e mês) ou (data_inicio e data_fim)' 
        });
      }

      const dados = await db.query(query, params);
      const dadosArray = Array.isArray(dados) ? dados : [];
      // Calcular totais
      const totais = {
        faturamento_total: dadosArray.reduce((sum, d) => sum + parseFloat(d.faturamento_dia || 0), 0),
        total_agendamentos: dadosArray.reduce((sum, d) => sum + parseInt(d.total_agendamentos || 0), 0),
        total_concluidos: dadosArray.reduce((sum, d) => sum + parseInt(d.concluidos || 0), 0),
      };

      totais.ticket_medio = totais.total_concluidos > 0 
        ? totais.faturamento_total / totais.total_concluidos 
        : 0;

      // Agregar por mês para o gráfico
      const porMes = {};
      dados.forEach(d => {
        const mesAno = d.data.substring(0, 7); // YYYY-MM
        if (!porMes[mesAno]) {
          porMes[mesAno] = { mes: mesAno, receita: 0, agendamentos: 0 };
        }
        porMes[mesAno].receita += parseFloat(d.faturamento_dia || 0);
        porMes[mesAno].agendamentos += parseInt(d.concluidos || 0);
      });

      return res.json({
        periodo: data_inicio && data_fim ? `${data_inicio} a ${data_fim}` : `${mes}/${ano}`,
        totais,
        detalhamento_diario: Array.isArray(dados) ? dados : [],
        porMes: Object.values(porMes)
      });
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error);
      return res.status(500).json({ 
        message: 'Erro ao gerar relatório financeiro',
        error: error.message 
      });
    }
  }

  // Relatório por tatuador
  static async porTatuador(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;

      let query = `
        SELECT 
          t.id,
          t.nome,
          t.especialidades,
          COUNT(a.id) as total_agendamentos,
          COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as concluidos,
          COUNT(CASE WHEN a.status = 'cancelado' THEN 1 END) as cancelados,
          SUM(CASE WHEN a.status = 'concluido' THEN a.valor_final ELSE 0 END) as faturamento,
          AVG(CASE WHEN a.status = 'concluido' THEN a.valor_final ELSE NULL END) as ticket_medio
        FROM tatuadores t
        LEFT JOIN agendamentos a ON t.id = a.tatuador_id
        WHERE t.ativo = 1
      `;

      const params = [];

      if (dataInicio) {
        query += ' AND a.data_agendamento >= ?';
        params.push(dataInicio);
      }

      if (dataFim) {
        query += ' AND a.data_agendamento <= ?';
        params.push(dataFim);
      }

      query += ' GROUP BY t.id, t.nome, t.especialidades';
      query += ' ORDER BY faturamento DESC';

      const tatuadores = await db.query(query, params);

      // Calcular totais gerais
      const totais = {
        faturamento_total: tatuadores.reduce((sum, t) => sum + parseFloat(t.faturamento || 0), 0),
        total_agendamentos: tatuadores.reduce((sum, t) => sum + parseInt(t.total_agendamentos || 0), 0),
        total_concluidos: tatuadores.reduce((sum, t) => sum + parseInt(t.concluidos || 0), 0),
      };

      return res.json({
        periodo: {
          dataInicio: dataInicio || 'início',
          dataFim: dataFim || 'hoje'
        },
        totais,
        tatuadores
      });
    } catch (error) {
      console.error('Erro ao gerar relatório por tatuador:', error);
      return res.status(500).json({ 
        message: 'Erro ao gerar relatório por tatuador' 
      });
    }
  }

  // Relatório de clientes
  static async clientes(req, res) {
    try {
      const { limite = 50 } = req.query;

      const query = `
        SELECT 
          c.id,
          c.nome,
          c.email,
          c.telefone,
          c.data_cadastro,
          COUNT(a.id) as total_agendamentos,
          COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as agendamentos_concluidos,
          SUM(CASE WHEN a.status = 'concluido' THEN a.valor_final ELSE 0 END) as valor_total_gasto,
          MAX(a.data_agendamento) as ultimo_agendamento
        FROM clientes c
        LEFT JOIN agendamentos a ON c.id = a.cliente_id
        WHERE c.ativo = 1
        GROUP BY c.id, c.nome, c.email, c.telefone, c.data_cadastro
        ORDER BY total_agendamentos DESC, valor_total_gasto DESC
        LIMIT ?
      `;

      const clientes = await db.query(query, [parseInt(limite)]);

      return res.json({
        total: clientes.length,
        clientes
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de clientes:', error);
      return res.status(500).json({ 
        message: 'Erro ao gerar relatório de clientes' 
      });
    }
  }

  // Dashboard (resumo geral)
  static async dashboard(req, res) {
    try {
      const hoje = new Date().toISOString().split('T')[0];

      // Agendamentos de hoje
      const agendamentosHoje = await db.query(`
        SELECT COUNT(*) as total
        FROM agendamentos
        WHERE DATE(data_agendamento) = ?
        AND status NOT IN ('cancelado')
      `, [hoje]);

      // Próximos agendamentos
      const proximosAgendamentos = await db.query(`
        SELECT 
          a.*,
          c.nome as cliente_nome,
          t.nome as tatuador_nome
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN tatuadores t ON a.tatuador_id = t.id
        WHERE a.data_agendamento >= ?
        AND a.status IN ('agendado', 'confirmado')
        ORDER BY a.data_agendamento ASC, a.hora_inicio ASC
        LIMIT 5
      `, [hoje]);

      // Estatísticas do mês atual
      const mesAtual = new Date().getMonth() + 1;
      const anoAtual = new Date().getFullYear();

      const estatisticasMes = await db.query(`
        SELECT 
          COUNT(*) as total_agendamentos,
          COUNT(CASE WHEN status = 'concluido' THEN 1 END) as concluidos,
          COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelados,
          SUM(CASE WHEN status = 'concluido' THEN COALESCE(valor_final, valor_estimado, 0) ELSE 0 END) as faturamento
        FROM agendamentos
        WHERE strftime('%Y', data_agendamento) = ? AND strftime('%m', data_agendamento) = ?
      `, [String(anoAtual), String(mesAtual).padStart(2, '0')]);

      // Total de clientes ativos
      const totalClientes = await db.query(`
        SELECT COUNT(*) as total
        FROM clientes
        WHERE ativo = 1
      `);

      // Total de tatuadores ativos
      const totalTatuadores = await db.query(`
        SELECT COUNT(*) as total
        FROM tatuadores
        WHERE ativo = 1
      `);

      return res.json({
        agendamentos_hoje: agendamentosHoje[0].total,
        proximos_agendamentos: proximosAgendamentos,
        estatisticas_mes_atual: {
          ...estatisticasMes[0],
          mes: mesAtual,
          ano: anoAtual
        },
        total_clientes: totalClientes[0].total,
        total_tatuadores: totalTatuadores[0].total
      });
    } catch (error) {
      console.error('Erro ao gerar dashboard:', error);
      return res.status(500).json({ 
        message: 'Erro ao gerar dashboard' 
      });
    }
  }
}

module.exports = RelatorioController;
