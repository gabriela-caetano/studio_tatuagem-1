const db = require('../config/database');
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

      const result = await db.run(query, values);
      return await this.findById(result.lastID);
    } catch (error) {
      console.error('ServicoDAO.create:', error);
      throw error;
    }
  }

  // Buscar serviço por ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM servicos WHERE id = ? AND ativo = 1';
      const rows = await db.query(query, [id]);
      if (!rows || rows.length === 0) {
        return null;
      }
      return new Servico(rows[0]);
    } catch (error) {
      console.error('ServicoDAO.findById:', error);
      throw error;
    }
  }

  // Listar todos os serviços
  static async findAll(page = 1, limit = 10, search = '') {
    try {
      // Converter para inteiros para evitar erro no MySQL
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      
      let query = 'SELECT * FROM servicos WHERE ativo = 1';
      let countQuery = 'SELECT COUNT(*) as total FROM servicos WHERE ativo = 1';
      const queryParams = [];
      const countParams = [];
      
      if (search) {
        query += ' AND (nome LIKE ? OR descricao LIKE ?)';
        countQuery += ' AND (nome LIKE ? OR descricao LIKE ?)';
        const searchParam = `%${search}%`;
        queryParams.push(searchParam, searchParam);
        countParams.push(searchParam, searchParam);
      }
      
      query += ' ORDER BY nome ASC LIMIT ? OFFSET ?';
      queryParams.push(limitNum, offset);

      const rows = await db.query(query, queryParams);
      const countResult = await db.query(countQuery, countParams);
      const arrServicos = Array.isArray(rows) ? rows : [];
      const arrCount = Array.isArray(countResult) ? countResult : [{ total: 0 }];
      const servicos = arrServicos.map(row => new Servico(row));
      return {
        data: servicos,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: arrCount[0].total,
          totalPages: Math.ceil(arrCount[0].total / limitNum)
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
      const query = 'SELECT id, nome, descricao, preco_base, duracao_estimada FROM servicos WHERE ativo = 1 ORDER BY nome ASC';
      const rows = await db.query(query);
      const arrServicos = Array.isArray(rows) ? rows : [];
      return arrServicos.map(row => new Servico(row));
    } catch (error) {
      console.error('ServicoDAO.findAllActive:', error);
      throw error;
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

      const result = await db.query(query, values);
      if (!result || result.affectedRows === 0) {
        return null;
      }
      return await this.findById(id);
    } catch (error) {
      console.error('ServicoDAO.update:', error);
      throw error;
    }
  }

  // Excluir serviço (soft delete)
  static async delete(id) {
    try {
      const query = 'UPDATE servicos SET ativo = 0 WHERE id = ?';
      const result = await db.query(query, [id]);
      return result && result.affectedRows > 0;
    } catch (error) {
      console.error('ServicoDAO.delete:', error);
      throw error;
    }
  }

  // Reativar serviço
  static async reactivate(id) {
    try {
      const query = 'UPDATE servicos SET ativo = 1 WHERE id = ?';
      const result = await db.query(query, [id]);
      return result && result.affectedRows > 0;
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
      
      const rows = await db.query(query, [minPrice, maxPrice]);
      return rows.map(row => new Servico(row));
    } catch (error) {
      console.error('ServicoDAO.findByPriceRange:', error);
      throw error;
    }
  }
}

module.exports = ServicoDAO;

