const express = require('express');
const router = express.Router();
const ServicoController = require('../controllers/ServicoController');

/**
 * @route   GET /api/servicos
 * @desc    Listar serviços (paginado)
 * @access  Public
 * @query   page, limit, search
 */
router.get('/', ServicoController.list);

/**
 * @route   GET /api/servicos/ativos/list
 * @desc    Listar apenas serviços ativos (simplificado)
 * @access  Public
 */
router.get('/ativos/list', ServicoController.listActive);

/**
 * @route   GET /api/servicos/preco-range
 * @desc    Buscar por faixa de preço
 * @access  Public
 * @query   minPrice, maxPrice
 */
router.get('/preco-range', ServicoController.findByPriceRange);

/**
 * @route   GET /api/servicos/:id
 * @desc    Buscar serviço por ID
 * @access  Public
 */
router.get('/:id', ServicoController.getById);

/**
 * @route   POST /api/servicos
 * @desc    Criar novo serviço
 * @access  Private
 */
router.post('/', ServicoController.create);

/**
 * @route   PUT /api/servicos/:id
 * @desc    Atualizar serviço
 * @access  Private
 */
router.put('/:id', ServicoController.update);

/**
 * @route   PATCH /api/servicos/:id/reativar
 * @desc    Reativar serviço
 * @access  Private
 */
router.patch('/:id/reativar', ServicoController.reactivate);

/**
 * @route   DELETE /api/servicos/:id
 * @desc    Excluir serviço (soft delete)
 * @access  Private
 */
router.delete('/:id', ServicoController.delete);

module.exports = router;

