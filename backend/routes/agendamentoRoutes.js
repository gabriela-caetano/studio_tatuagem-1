const express = require('express');
const AgendamentoController = require('../controllers/AgendamentoController');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(auth);

/**
 * @route   POST /api/agendamentos
 * @desc    Criar novo agendamento
 * @access  Private
 */
router.post('/', AgendamentoController.create);

/**
 * @route   GET /api/agendamentos
 * @desc    Listar agendamentos com filtros
 * @access  Private
 */
router.get('/', AgendamentoController.findAll);

/**
 * @route   GET /api/agendamentos/disponibilidade
 * @desc    Verificar disponibilidade de horário
 * @access  Private
 */
router.get('/disponibilidade', AgendamentoController.verificarDisponibilidade);

/**
 * @route   GET /api/agendamentos/data/:data
 * @desc    Buscar agendamentos por data
 * @access  Private
 */
router.get('/data/:data', AgendamentoController.findByDate);

/**
 * @route   GET /api/agendamentos/relatorio/:ano/:mes
 * @desc    Relatório mensal de agendamentos
 * @access  Private
 */
router.get('/relatorio/:ano/:mes', AgendamentoController.relatorioMensal);

/**
 * @route   GET /api/agendamentos/:id
 * @desc    Buscar agendamento por ID
 * @access  Private
 */
router.get('/:id', AgendamentoController.findById);

/**
 * @route   PUT /api/agendamentos/:id
 * @desc    Atualizar agendamento
 * @access  Private
 */
router.put('/:id', AgendamentoController.update);

/**
 * @route   PATCH /api/agendamentos/:id/status
 * @desc    Atualizar status do agendamento
 * @access  Private
 */
router.patch('/:id/status', AgendamentoController.updateStatus);

/**
 * @route   PATCH /api/agendamentos/:id/cancel
 * @desc    Cancelar agendamento
 * @access  Private
 */
router.patch('/:id/cancel', AgendamentoController.cancel);

/**
 * @route   PATCH /api/agendamentos/:id/concluir
 * @desc    Concluir agendamento
 * @access  Private
 */
router.patch('/:id/concluir', AgendamentoController.concluir);

/**
 * @route   DELETE /api/agendamentos/:id
 * @desc    Excluir agendamento
 * @access  Private
 */
router.delete('/:id', AgendamentoController.delete);

module.exports = router;
