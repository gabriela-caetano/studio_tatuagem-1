const { db, query } = require('../config/database');
const Servico = require('../models/Servico');

class ServicoDAO {
  // Criar novo serviço
  static async create(servicoData) {
    try {
      const query = `
        INSERT INTO servicos (
          nome, descricao, preco_base, duracao_estimada
        ) VALUES (?, ?, ?, ?)
      `;
      const values = [
        servicoData.nome || null,
        servicoData.descricao || null,
        servicoData.preco_base || null,
        servicoData.duracao_estimada || null
      ];
      const lastID = await new Promise((resolve, reject) => {
        db.run(query, values, function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
      return await ServicoDAO.findById(lastID);
    } catch (error) {
      console.error('ServicoDAO.create:', error);
      throw error;
    }
  }

  // Buscar serviço por ID
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM servicos WHERE id = ? AND ativo = 1';
      const rows = await query(sql, [id]);
      if (!rows || rows.length === 0) {
        return null;
      }
      return new Servico(rows[0]);
    } catch (error) {
      console.error('ServicoDAO.findById:', error);
      throw error;
    }
  }
  static async findAll(page = 1, limit = 10, search = '') {
    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      let sql = 'SELECT * FROM servicos WHERE ativo = 1';
      let countSql = 'SELECT COUNT(*) as total FROM servicos WHERE ativo = 1';
      const queryParams = [];
      const countParams = [];
      if (search) {
        sql += ' AND (nome LIKE ? OR descricao LIKE ?)';
        countSql += ' AND (nome LIKE ? OR descricao LIKE ?)';
        const searchParam = `%${search}%`;
        queryParams.push(searchParam, searchParam);
        countParams.push(searchParam, searchParam);
      }
      sql += ' ORDER BY nome ASC LIMIT ? OFFSET ?';
      queryParams.push(limitNum, offset);
      let rows = await query(sql, queryParams);
      let countArr = await query(countSql, countParams);
      const servicos = Array.isArray(rows) ? rows.map(row => new Servico(row)) : [];
      return {
        data: servicos,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: countArr[0] && countArr[0].total ? countArr[0].total : 0,
          totalPages: countArr[0] && countArr[0].total ? Math.ceil(countArr[0].total / limitNum) : 1
        }
      };
    } catch (error) {
      console.error('ServicoDAO.findAll:', error);
      throw error;
    }
  }

  // Listar serviços ativos (simplificado)
  static async findAllActive() {
    try {
      const sql = 'SELECT id, nome, descricao, preco_base, duracao_estimada FROM servicos WHERE ativo = 1 ORDER BY nome ASC';
      const rows = await query(sql);
      return Array.isArray(rows) ? rows.map(row => new Servico(row)) : [];
    } catch (error) {
      console.error('ServicoDAO.findAllActive:', error);
      return [];
    }
  }

  // Atualizar serviço
  static async update(id, servicoData) {
    try {
      const query = `
        UPDATE servicos SET 
          nome = ?, 
          descricao = ?, 
          preco_base = ?, 
          duracao_estimada = ?
        WHERE id = ? AND ativo = 1
      `;
      const values = [
        servicoData.nome || null,
        servicoData.descricao || null,
        servicoData.preco_base || null,
        servicoData.duracao_estimada || null,
        id
      ];
      const changes = await new Promise((resolve, reject) => {
        db.run(query, values, function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
      if (changes === 0) {
        return null;
      }
      return await ServicoDAO.findById(id);
    } catch (error) {
      console.error('ServicoDAO.update:', error);
      throw error;
    }
  }

  // Excluir serviço (soft delete)
  static async delete(id) {
    try {
      const query = 'UPDATE servicos SET ativo = 0 WHERE id = ?';
      const changes = await new Promise((resolve, reject) => {
        db.run(query, [id], function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
      return changes > 0;
    } catch (error) {
      console.error('ServicoDAO.delete:', error);
      throw error;
    }
  }

  // Reativar serviço
  static async reactivate(id) {
    try {
      const query = 'UPDATE servicos SET ativo = 0 WHERE id = ?';
      await db.query(query, [id]);
      
      return true;
    } catch (error) {
      console.error('ServicoDAO.reactivate:', error);
      throw error;
    }
  }

  // Buscar serviços por faixa de preço
  static async findByPriceRange(minPrice, maxPrice) {
    try {
      const query = `
        SELECT * FROM servicos 
        WHERE ativo = 1 
        AND preco_base >= ? 
        AND preco_base <= ?
        ORDER BY preco_base ASC
      `;
      
      const [rows] = await db.query(query, [minPrice, maxPrice]);
      return rows.map(row => new Servico(row));
    } catch (error) {
      console.error('ServicoDAO.findByPriceRange:', error);
      throw error;
    }
  }
}

module.exports = ServicoDAO;

