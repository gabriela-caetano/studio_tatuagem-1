const express = require('express');
const ClienteController = require('../controllers/ClienteController');
const router = express.Router();

// Middleware de autenticação (será implementado posteriormente)
// const auth = require('../middleware/auth');

/**
 * @route   POST /api/clientes
 * @desc    Criar novo cliente
 * @access  Private
 */
router.post('/', ClienteController.create);

/**
 * @route   GET /api/clientes
 * @desc    Listar todos os clientes
 * @access  Private
 */
router.get('/', ClienteController.findAll);

/**
 * @route   GET /api/clientes/:id
 * @desc    Buscar cliente por ID
 * @access  Private
 */
router.get('/:id', ClienteController.findById);

/**
 * @route   PUT /api/clientes/:id
 * @desc    Atualizar cliente
 * @access  Private
 */
router.put('/:id', ClienteController.update);

/**
 * @route   DELETE /api/clientes/:id
 * @desc    Excluir cliente
 * @access  Private
 */
router.delete('/:id', ClienteController.delete);

/**
 * @route   GET /api/clientes/:id/agendamentos
 * @desc    Buscar agendamentos do cliente
 * @access  Private
 */
router.get('/:id/agendamentos', ClienteController.findAgendamentos);

module.exports = router;
