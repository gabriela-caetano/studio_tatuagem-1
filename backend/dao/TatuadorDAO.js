const db = require('../config/database');
const Tatuador = require('../models/Tatuador');

class TatuadorDAO {
  // Criar novo tatuador
  static async create(tatuadorData) {
    try {
      console.log('🗄️  TatuadorDAO.create - Dados recebidos:', tatuadorData);
      
      const query = `
        INSERT INTO tatuadores (
          nome, email, telefone, especialidades, biografia, 
          portfolio_url, instagram, valor_hora, disponibilidade, senha
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        tatuadorData.nome || null,
        tatuadorData.email || null,
        tatuadorData.telefone || null,
        tatuadorData.especialidades || null,
        tatuadorData.biografia || null,
        tatuadorData.portfolio_url || null,
        tatuadorData.instagram || null,
        tatuadorData.valor_hora || null,
        JSON.stringify(tatuadorData.disponibilidade || {}),
        tatuadorData.senha || null
      ];

      console.log('📋 Query:', query);
      console.log('📋 Values:', values);

      // SQLite: usar db.run para obter o último ID inserido
      const sqlite3 = require('sqlite3').verbose();
      const dbRaw = require('../config/database').db;
      const lastId = await new Promise((resolve, reject) => {
        dbRaw.run(query, values, function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        });
      });
      const novoTatuador = await this.findById(lastId);
      console.log('✅ Tatuador recuperado:', novoTatuador);
      return novoTatuador;
    } catch (error) {
      console.error('❌ Erro no TatuadorDAO.create:', error);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  // Buscar tatuador por ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM tatuadores WHERE id = ? AND ativo = 1';
      const rows = await db.query(query, [id]);
      if (!Array.isArray(rows) || rows.length === 0 || !rows[0]) {
        return null;
      }
      const tatuador = rows[0];
      // Parse do JSON de disponibilidade
      if (tatuador && tatuador.disponibilidade) {
        try {
          tatuador.disponibilidade = JSON.parse(tatuador.disponibilidade);
        } catch (e) {
          tatuador.disponibilidade = {};
        }
      }
      return new Tatuador(tatuador);
    } catch (error) {
      throw error;
    }
  }

  // Buscar tatuador por email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM tatuadores WHERE email = ? AND ativo = 1';
      const rows = await db.query(query, [email]);
      if (!Array.isArray(rows) || rows.length === 0) {
        return null;
      }
      const tatuador = rows[0];
      if (tatuador.disponibilidade) {
        try {
          tatuador.disponibilidade = JSON.parse(tatuador.disponibilidade);
        } catch (e) {
          tatuador.disponibilidade = {};
        }
      }
      return new Tatuador(tatuador);
    } catch (error) {
      throw error;
    }
  }

  // Listar todos os tatuadores
  static async findAll(page = 1, limit = 10, search = '', especialidade = '', apenasAtivos = true) {
    try {
      // Converter para inteiros para evitar erro no MySQL
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      
      let query = 'SELECT * FROM tatuadores WHERE 1=1';
      let countQuery = 'SELECT COUNT(*) as total FROM tatuadores WHERE 1=1';
      const queryParams = [];
      const countParams = [];
      
      // Se apenasAtivos for true, filtrar apenas ativos
      // Se for false, filtrar apenas inativos
      // Se for null/undefined, mostrar todos
      if (apenasAtivos === true) {
        query += ' AND ativo = ?';
        countQuery += ' AND ativo = ?';
        queryParams.push(1);
        countParams.push(1);
      } else if (apenasAtivos === false) {
        query += ' AND ativo = ?';
        countQuery += ' AND ativo = ?';
        queryParams.push(0);
        countParams.push(0);
      }
      // Se apenasAtivos for null, não adiciona filtro (mostra todos)
      
      if (search) {
        query += ' AND (nome LIKE ? OR email LIKE ? OR telefone LIKE ?)';
        countQuery += ' AND (nome LIKE ? OR email LIKE ? OR telefone LIKE ?)';
        const searchParam = `%${search}%`;
        queryParams.push(searchParam, searchParam, searchParam);
        countParams.push(searchParam, searchParam, searchParam);
      }
      
      if (especialidade) {
        query += ' AND especialidades LIKE ?';
        countQuery += ' AND especialidades LIKE ?';
        const espParam = `%${especialidade}%`;
        queryParams.push(espParam);
        countParams.push(espParam);
      }
      
      query += ' ORDER BY nome ASC LIMIT ? OFFSET ?';
      queryParams.push(limitNum, offset);

      const rows = await db.query(query, queryParams);
      const countResult = await db.query(countQuery, countParams);
      const tatuadores = Array.isArray(rows) ? rows.map(row => {
        if (row.disponibilidade) {
          try {
            row.disponibilidade = JSON.parse(row.disponibilidade);
          } catch (e) {
            row.disponibilidade = {};
          }
        }
        return new Tatuador(row);
      }) : [];

      return {
        data: tatuadores,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limitNum)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Listar tatuadores ativos (simplificado)
  static async findAllActive() {
    try {
      const query = 'SELECT id, nome, email, especialidades, valor_hora FROM tatuadores WHERE ativo = 1 ORDER BY nome ASC';
      const rows = await db.query(query);
      return Array.isArray(rows) ? rows.map(row => {
        if (row.disponibilidade) {
          try {
            row.disponibilidade = JSON.parse(row.disponibilidade);
          } catch (e) {
            row.disponibilidade = {};
          }
        }
        return new Tatuador(row);
      }) : [];
    } catch (error) {
      throw error;
    }
  }

  // Atualizar tatuador
  static async update(id, tatuadorData) {
    try {
      const updates = [];
      const values = [];

      if (tatuadorData.nome !== undefined) {
        updates.push('nome = ?');
        values.push(tatuadorData.nome);
      }
      if (tatuadorData.email !== undefined) {
        updates.push('email = ?');
        values.push(tatuadorData.email);
      }
      if (tatuadorData.telefone !== undefined) {
        updates.push('telefone = ?');
        values.push(tatuadorData.telefone);
      }
      if (tatuadorData.especialidades !== undefined) {
        updates.push('especialidades = ?');
        values.push(tatuadorData.especialidades);
      }
      if (tatuadorData.biografia !== undefined) {
        updates.push('biografia = ?');
        values.push(tatuadorData.biografia);
      }
      if (tatuadorData.portfolio_url !== undefined) {
        updates.push('portfolio_url = ?');
        values.push(tatuadorData.portfolio_url);
      }
      if (tatuadorData.instagram !== undefined) {
        updates.push('instagram = ?');
        values.push(tatuadorData.instagram);
      }
      if (tatuadorData.valor_hora !== undefined) {
        updates.push('valor_hora = ?');
        values.push(tatuadorData.valor_hora);
      }
      if (tatuadorData.disponibilidade !== undefined) {
        updates.push('disponibilidade = ?');
        values.push(JSON.stringify(tatuadorData.disponibilidade));
      }

      if (updates.length === 0) {
        throw new Error('Nenhum campo para atualizar');
      }

      values.push(id);
      const query = `UPDATE tatuadores SET ${updates.join(', ')} WHERE id = ?`;
      
      await db.query(query, values);
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Excluir tatuador (soft delete)
  static async delete(id) {
    try {
      // Verificar se existem agendamentos futuros
      const checkQuery = `
        SELECT COUNT(*) as count 
        FROM agendamentos 
        WHERE tatuador_id = ? 
        AND data_agendamento >= CURDATE() 
        AND status IN ('agendado', 'confirmado')
      `;
      const checkResult = await db.query(checkQuery, [id]);
      
      if (checkResult[0].count > 0) {
        throw new Error('Não é possível excluir tatuador com agendamentos futuros');
      }

      const query = 'UPDATE tatuadores SET ativo = 0 WHERE id = ?';
      await db.query(query, [id]);
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Reativar tatuador
  static async reactivate(id) {
    try {
      const query = 'UPDATE tatuadores SET ativo = 1 WHERE id = ?';
      await db.query(query, [id]);
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Buscar agendamentos do tatuador
  static async findAgendamentos(tatuadorId, dataInicio = null, dataFim = null) {
    try {
      let query = `
        SELECT a.*, c.nome as cliente_nome, s.nome as servico_nome
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE a.tatuador_id = ?
      `;
      const params = [tatuadorId];

      if (dataInicio) {
        query += ' AND a.data_agendamento >= ?';
        params.push(dataInicio);
      }

      if (dataFim) {
        query += ' AND a.data_agendamento <= ?';
        params.push(dataFim);
      }

      query += ' ORDER BY a.data_agendamento DESC, a.hora_inicio DESC';

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Verificar disponibilidade do tatuador em uma data/hora específica
  static async verificarDisponibilidade(tatuadorId, data, horaInicio, horaFim, agendamentoIdExcluir = null) {
    try {
      let query = `
        SELECT COUNT(*) as count
        FROM agendamentos
        WHERE tatuador_id = ?
        AND data_agendamento = ?
        AND status IN ('agendado', 'confirmado', 'em_andamento')
        AND (
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio >= ? AND hora_fim <= ?)
        )
      `;
      
      const params = [
        tatuadorId,
        data,
        horaFim, horaInicio,
        horaFim, horaFim,
        horaInicio, horaFim
      ];

      if (agendamentoIdExcluir) {
        query += ' AND id != ?';
        params.push(agendamentoIdExcluir);
      }

      const result = await db.query(query, params);
      return result[0].count === 0;
    } catch (error) {
      throw error;
    }
  }

  // Buscar estatísticas do tatuador
  static async getEstatisticas(tatuadorId, mes = null, ano = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_agendamentos,
          COUNT(CASE WHEN status = 'concluido' THEN 1 END) as concluidos,
          COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelados,
          SUM(CASE WHEN status = 'concluido' THEN valor_final ELSE 0 END) as faturamento_total
        FROM agendamentos
        WHERE tatuador_id = ?
      `;
      const params = [tatuadorId];

      if (ano) {
        query += ' AND YEAR(data_agendamento) = ?';
        params.push(ano);
      }

      if (mes) {
        query += ' AND MONTH(data_agendamento) = ?';
        params.push(mes);
      }

      const result = await db.query(query, params);
      return result[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TatuadorDAO;


