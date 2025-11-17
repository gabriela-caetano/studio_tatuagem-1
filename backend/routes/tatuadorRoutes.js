const express = require('express');
const router = express.Router();
const TatuadorController = require('../controllers/TatuadorController');
const { auth } = require('../middleware/auth');

/**
 * @route   POST /api/tatuadores/login
 * @desc    Login de tatuador
 * @access  Public
 */
router.post('/login', TatuadorController.login);

// Aplicar autenticação nas demais rotas
router.use(auth);

/**
 * @route   GET /api/tatuadores
 * @desc    Listar tatuadores com paginação e filtros
 * @access  Private
 * @query   page, limit, search, especialidade, incluirInativos
 */
router.get('/', TatuadorController.getAll);

/**
 * @route   GET /api/tatuadores/ativos
 * @desc    Listar apenas tatuadores ativos (para dropdowns)
 * @access  Public
 */
router.get('/ativos/list', TatuadorController.getAllActive);

/**
 * @route   GET /api/tatuadores/:id
 * @desc    Buscar tatuador por ID
 * @access  Public
 */
router.get('/:id', TatuadorController.getById);

/**
 * @route   GET /api/tatuadores/:id/agendamentos
 * @desc    Buscar agendamentos do tatuador
 * @access  Public
 * @query   dataInicio, dataFim
 */
router.get('/:id/agendamentos', TatuadorController.getAgendamentos);

/**
 * @route   GET /api/tatuadores/:id/disponibilidade
 * @desc    Verificar disponibilidade do tatuador em data/hora específica
 * @access  Public
 * @query   data, horaInicio, horaFim, agendamentoId (opcional)
 */
router.get('/:id/disponibilidade', TatuadorController.checkDisponibilidade);

/**
 * @route   GET /api/tatuadores/:id/estatisticas
 * @desc    Buscar estatísticas do tatuador
 * @access  Public
 * @query   mes, ano
 */
router.get('/:id/estatisticas', TatuadorController.getEstatisticas);

/**
 * @route   POST /api/tatuadores
 * @desc    Criar novo tatuador
 * @access  Private
 */
router.post('/', TatuadorController.create);

/**
 * @route   PUT /api/tatuadores/:id
 * @desc    Atualizar tatuador
 * @access  Private
 */
router.put('/:id', TatuadorController.update);

/**
 * @route   PATCH /api/tatuadores/:id/reativar
 * @desc    Reativar tatuador inativo
 * @access  Private
 */
router.patch('/:id/reativar', TatuadorController.reactivate);

/**
 * @route   DELETE /api/tatuadores/:id
 * @desc    Excluir tatuador (soft delete)
 * @access  Private
 */
router.delete('/:id', TatuadorController.delete);

module.exports = router;
