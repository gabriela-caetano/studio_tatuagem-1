const db = require('../config/database');
const Cliente = require('../models/Cliente');

class ClienteDAO {
  // Criar novo cliente
  static async create(clienteData) {
    try {
      const query = `
        INSERT INTO clientes (
          nome, email, telefone, cpf, data_nascimento, 
          endereco, cidade, estado, cep, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        clienteData.nome,
        clienteData.email,
        clienteData.telefone,
        clienteData.cpf,
        clienteData.data_nascimento,
        clienteData.endereco,
        clienteData.cidade,
        clienteData.estado,
        clienteData.cep,
        clienteData.observacoes
      ];

      const [result] = await db.query(query, values);
      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Buscar cliente por ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM clientes WHERE id = ? AND ativo = 1';
      const [rows] = await db.query(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Cliente(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Buscar cliente por email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM clientes WHERE email = ? AND ativo = 1';
      const [rows] = await db.query(query, [email]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Cliente(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Buscar cliente por CPF
  static async findByCPF(cpf) {
    try {
      const query = 'SELECT * FROM clientes WHERE cpf = ? AND ativo = 1';
      const [rows] = await db.query(query, [cpf]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Cliente(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Listar todos os clientes
  static async findAll(page = 1, limit = 10, search = '') {
    try {
      // Converter para números para evitar erro no MySQL
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;
      
      let query = 'SELECT * FROM clientes WHERE ativo = 1';
      let countQuery = 'SELECT COUNT(*) as total FROM clientes WHERE ativo = 1';
      const queryParams = [];
      
      if (search) {
        query += ' AND (nome LIKE ? OR email LIKE ? OR telefone LIKE ?)';
        countQuery += ' AND (nome LIKE ? OR email LIKE ? OR telefone LIKE ?)';
        const searchParam = `%${search}%`;
        queryParams.push(searchParam, searchParam, searchParam);
      }
      
      // MySQL 9.x tem problemas com prepared statements em LIMIT
      // Usar concatenação direta (seguro pois já convertemos para int)
      query += ` ORDER BY nome ASC LIMIT ${offset}, ${limitNum}`;

      const [rows] = await db.query(query, queryParams);
      const [countResult] = await db.query(countQuery, search ? queryParams.slice(0, 3) : []);
      
      const clientes = rows.map(row => new Cliente(row));
      const total = countResult[0].total;
      
      return {
        clientes,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Atualizar cliente
  static async update(id, clienteData) {
    try {
      const query = `
        UPDATE clientes SET 
          nome = ?, email = ?, telefone = ?, cpf = ?, data_nascimento = ?,
          endereco = ?, cidade = ?, estado = ?, cep = ?, observacoes = ?
        WHERE id = ? AND ativo = 1
      `;
      
      const values = [
        clienteData.nome,
        clienteData.email,
        clienteData.telefone,
        clienteData.cpf,
        clienteData.data_nascimento,
        clienteData.endereco,
        clienteData.cidade,
        clienteData.estado,
        clienteData.cep,
        clienteData.observacoes,
        id
      ];

      const [result] = await db.query(query, values);
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Excluir cliente (soft delete)
  static async delete(id) {
    try {
      const query = 'UPDATE clientes SET ativo = 0 WHERE id = ?';
      const [result] = await db.query(query, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Buscar agendamentos do cliente
  static async findAgendamentos(clienteId) {
    try {
      const query = `
        SELECT a.*, t.nome as tatuador_nome, s.nome as servico_nome
        FROM agendamentos a
        LEFT JOIN tatuadores t ON a.tatuador_id = t.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE a.cliente_id = ?
        ORDER BY a.data_agendamento DESC
      `;
      
      const [rows] = await db.query(query, [clienteId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ClienteDAO;

