const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { auth } = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuário e retornar token JWT
 * @access  Public
 */
router.post('/login', AuthController.login);

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /api/auth/logout
 * @desc    Fazer logout (limpar token no frontend)
 * @access  Private
 */
router.post('/logout', auth, AuthController.logout);

/**
 * @route   PUT /api/auth/alterar-senha
 * @desc    Alterar senha do usuário logado
 * @access  Private
 */
router.put('/alterar-senha', auth, AuthController.alterarSenha);

/**
 * @route   POST /api/auth/esqueceu-senha
 * @desc    Solicitar recuperação de senha (gerar token)
 * @access  Public
 */
router.post('/esqueceu-senha', AuthController.esqueceuSenha);

/**
 * @route   POST /api/auth/redefinir-senha
 * @desc    Redefinir senha usando token de recuperação
 * @access  Public
 */
router.post('/redefinir-senha', AuthController.redefinirSenha);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar se token é válido
 * @access  Private
 */
router.get('/verify', auth, AuthController.verifyToken);

/**
 * @route   POST /api/auth/alterar-senha
 * @desc    Alterar senha do usuário logado
 * @access  Private
 */
router.post('/alterar-senha', auth, AuthController.alterarSenha);

/**
 * @route   POST /api/auth/recuperar-senha
 * @desc    Solicitar recuperação de senha
 * @access  Public
 */
router.post('/recuperar-senha', AuthController.recuperarSenha);

/**
 * @route   POST /api/auth/resetar-senha
 * @desc    Resetar senha com token de recuperação
 * @access  Public
 */
router.post('/resetar-senha', AuthController.resetarSenha);

module.exports = router;
