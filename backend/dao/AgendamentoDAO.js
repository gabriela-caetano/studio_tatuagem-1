const db = require('../config/database');
const Agendamento = require('../models/Agendamento');

class AgendamentoDAO {
  // Criar novo agendamento
  static async create(agendamentoData) {
    try {
      const query = `
        INSERT INTO agendamentos (
          cliente_id, tatuador_id, servico_id, data_agendamento, 
          hora_inicio, hora_fim, descricao_tatuagem, valor_estimado, 
          status, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        agendamentoData.cliente_id,
        agendamentoData.tatuador_id,
        agendamentoData.servico_id,
        agendamentoData.data_agendamento,
        agendamentoData.hora_inicio,
        agendamentoData.hora_fim,
        agendamentoData.descricao_tatuagem,
        agendamentoData.valor_estimado,
        agendamentoData.status || 'agendado',
        agendamentoData.observacoes
      ];

      // SQLite: usar db.run para obter o último ID inserido
      const sqlite3 = require('sqlite3').verbose();
      const dbRaw = require('../config/database').db;
      const lastId = await new Promise((resolve, reject) => {
        dbRaw.run(query, values, function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        });
      });
      return await this.findById(lastId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar agendamento por ID
  static async findById(id) {
    try {
      const query = `
        SELECT a.*, 
               c.nome as cliente_nome, c.telefone as cliente_telefone,
               t.nome as tatuador_nome, t.telefone as tatuador_telefone,
               s.nome as servico_nome, s.categoria as servico_categoria
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN tatuadores t ON a.tatuador_id = t.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE a.id = ?
      `;
      
      const rows = await db.query(query, [id]);
      if (!Array.isArray(rows) || rows.length === 0) {
        return null;
      }
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Listar agendamentos com filtros e paginação
  static async findAll(filters = {}) {
    try {
      // Query para contar total
      let countQuery = `
        SELECT COUNT(*) as total
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN tatuadores t ON a.tatuador_id = t.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE 1=1
      `;
      
      // Query principal
      let query = `
        SELECT a.*, 
               c.nome as cliente_nome, c.telefone as cliente_telefone,
               t.nome as tatuador_nome, t.telefone as tatuador_telefone,
               s.nome as servico_nome, s.categoria as servico_categoria
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN tatuadores t ON a.tatuador_id = t.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      if (filters.cliente_id) {
        query += ' AND a.cliente_id = ?';
        countQuery += ' AND a.cliente_id = ?';
        queryParams.push(filters.cliente_id);
      }
      
      if (filters.tatuador_id) {
        query += ' AND a.tatuador_id = ?';
        countQuery += ' AND a.tatuador_id = ?';
        queryParams.push(filters.tatuador_id);
      }
      
      if (filters.status) {
        query += ' AND a.status = ?';
        countQuery += ' AND a.status = ?';
        queryParams.push(filters.status);
      }
      
      if (filters.data_inicio && filters.data_fim) {
        query += ' AND a.data_agendamento BETWEEN ? AND ?';
        countQuery += ' AND a.data_agendamento BETWEEN ? AND ?';
        queryParams.push(filters.data_inicio, filters.data_fim);
      } else if (filters.data_agendamento) {
        query += ' AND DATE(a.data_agendamento) = ?';
        countQuery += ' AND DATE(a.data_agendamento) = ?';
        queryParams.push(filters.data_agendamento);
      }
      
      // Buscar total de registros
      const countRows = await db.query(countQuery, queryParams);
      const total = countRows[0]?.total || 0;
      
      query += ' ORDER BY a.data_agendamento DESC, a.hora_inicio DESC';
      
      // Verificar se deve usar paginação
      const usePagination = filters.page !== undefined || filters.limit !== undefined;
      
      if (usePagination) {
        // Adicionar paginação
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 10;
        const offset = (page - 1) * limit;
        
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(limit, offset);
        
        const rows = await db.query(query, queryParams);
        
        return {
          data: Array.isArray(rows) ? rows : [],
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
          }
        };
      } else {
        // Retornar todos os dados sem paginação
        const rows = await db.query(query, queryParams);
        
        return {
          data: Array.isArray(rows) ? rows : [],
          pagination: null
        };
      }
    } catch (error) {
      throw error;
    }
  }

  // Verificar disponibilidade do tatuador
  static async verificarDisponibilidade(tatuadorId, dataAgendamento, horaInicio, horaFim, agendamentoId = null) {
    try {
      let query = `
        SELECT * FROM agendamentos 
        WHERE tatuador_id = ? 
        AND data_agendamento = ? 
        AND status NOT IN ('cancelado', 'reagendado')
        AND (
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio >= ? AND hora_fim <= ?)
        )
      `;
      
      const queryParams = [
        tatuadorId, 
        dataAgendamento, 
        horaFim, horaInicio,
        horaFim, horaInicio,
        horaInicio, horaFim
      ];
      
      if (agendamentoId) {
        query += ' AND id != ?';
        queryParams.push(agendamentoId);
      }
      
      const rows = await db.query(query, queryParams);
      return Array.isArray(rows) && rows.length === 0;
    } catch (error) {
      throw error;
    }
  }

  // Atualizar agendamento
  static async update(id, agendamentoData) {
    try {
      const query = `
        UPDATE agendamentos SET 
          cliente_id = ?, tatuador_id = ?, servico_id = ?, 
          data_agendamento = ?, hora_inicio = ?, hora_fim = ?, 
          descricao_tatuagem = ?, valor_estimado = ?, valor_final = ?,
          status = ?, observacoes = ?, data_atualizacao = datetime('now')
        WHERE id = ?
      `;
      
      const values = [
        agendamentoData.cliente_id,
        agendamentoData.tatuador_id,
        agendamentoData.servico_id,
        agendamentoData.data_agendamento,
        agendamentoData.hora_inicio,
        agendamentoData.hora_fim,
        agendamentoData.descricao_tatuagem,
        agendamentoData.valor_estimado,
        agendamentoData.valor_final,
        agendamentoData.status,
        agendamentoData.observacoes,
        id
      ];

      await db.query(query, values);
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Atualizar status do agendamento
  static async updateStatus(id, status, observacoes = null) {
    try {
      const query = `
        UPDATE agendamentos SET 
          status = ?, observacoes = COALESCE(?, observacoes), 
          data_atualizacao = datetime('now')
        WHERE id = ?
      `;
      
      await db.query(query, [status, observacoes, id]);
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Excluir agendamento
  static async delete(id) {
    try {
      const query = 'DELETE FROM agendamentos WHERE id = ?';
      await db.query(query, [id]);
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Buscar agendamentos do dia
  static async findByDate(data) {
    try {
      const query = `
        SELECT a.*, 
               c.nome as cliente_nome, c.telefone as cliente_telefone,
               t.nome as tatuador_nome,
               s.nome as servico_nome
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN tatuadores t ON a.tatuador_id = t.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE DATE(a.data_agendamento) = ?
        AND a.status NOT IN ('cancelado')
        ORDER BY a.hora_inicio ASC
      `;
      
      const rows = await db.query(query, [data]);
      return rows || [];
    } catch (error) {
      throw error;
    }
  }

  // Relatório de agendamentos por período
  static async relatorioMensal(ano, mes) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_agendamentos,
          COUNT(CASE WHEN status = 'concluido' THEN 1 END) as concluidos,
          COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelados,
          SUM(CASE WHEN status = 'concluido' THEN valor_final ELSE 0 END) as faturamento,
          AVG(CASE WHEN status = 'concluido' THEN valor_final ELSE 0 END) as ticket_medio
        FROM agendamentos
        WHERE YEAR(data_agendamento) = ? AND MONTH(data_agendamento) = ?
      `;
      
      const rows = await db.query(query, [ano, mes]);
      return rows[0] || {};
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AgendamentoDAO;

