const express = require('express');
const router = express.Router();
const RelatorioController = require('../controllers/RelatorioController');
const { auth } = require('../middleware/auth');

// Aplicar autenticação em todas as rotas
router.use(auth);

/**
 * @route   GET /api/relatorios/dashboard
 * @desc    Dashboard com resumo geral
 * @access  Private
 * @description Retorna estatísticas gerais para o dashboard
 */
router.get('/dashboard', RelatorioController.dashboard);

/**
 * @route   GET /api/relatorios/agendamentos
 * @desc    Relatório de agendamentos com filtros
 * @access  Private
 * @query   dataInicio, dataFim, tatuadorId, status, formato
 */
router.get('/agendamentos', RelatorioController.agendamentos);

/**
 * @route   GET /api/relatorios/financeiro
 * @desc    Relatório financeiro mensal
 * @access  Private
 * @query   ano, mes, tatuadorId
 */
router.get('/financeiro', RelatorioController.financeiro);

/**
 * @route   GET /api/relatorios/tatuadores
 * @desc    Relatório de performance por tatuador
 * @access  Private
 * @query   dataInicio, dataFim
 */
router.get('/tatuadores', RelatorioController.porTatuador);

/**
 * @route   GET /api/relatorios/clientes
 * @desc    Relatório de clientes mais ativos
 * @access  Private
 * @query   limite
 */
router.get('/clientes', RelatorioController.clientes);

module.exports = router;
