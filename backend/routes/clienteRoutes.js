const express = require('express');
const ClienteController = require('../controllers/ClienteController');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(auth);

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
