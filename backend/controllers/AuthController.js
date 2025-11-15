const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

class AuthController {
  static async login(req, res) {
    const { email, senha } = req.body;
    console.log('AuthController.login - Dados recebidos:', { email });
    if (!email || !senha) {
      console.log('AuthController.login - Dados ausentes:', { email, senha });
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    db.get('SELECT * FROM usuarios WHERE email = ? AND ativo = 1', [email], (err, usuario) => {
      if (err) {
        console.error('AuthController.login - Erro ao buscar usuário:', err);
        return res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
      }
      console.log('AuthController.login - Resultado da busca:', usuario);
      if (!usuario) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      bcrypt.compare(senha, usuario.senha, (errCompare, senhaValida) => {
        if (errCompare) {
          console.error('AuthController.login - Erro ao validar senha:', errCompare);
          return res.status(500).json({ message: 'Erro ao validar senha', error: errCompare.message });
        }
        console.log('AuthController.login - Senha válida?', senhaValida);
        if (!senhaValida) {
          return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        const token = jwt.sign(
          { id: usuario.id, tipo: usuario.tipo },
          process.env.JWT_SECRET || 'studio_secret',
          { expiresIn: '8h' }
        );
        db.run('UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?', [usuario.id], (err2) => {
          if (err2) console.error('AuthController.login - Erro ao atualizar último login:', err2);
          const usuarioSemSenha = { ...usuario };
          delete usuarioSemSenha.senha;
          console.log('AuthController.login - Login realizado com sucesso:', usuarioSemSenha);
          return res.status(200).json({
            message: 'Login realizado com sucesso',
            token,
            usuario: usuarioSemSenha
          });
        });
      });
    });
  }

  static async redefinirSenha(req, res) {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres' });
    }

    db.get(
      `SELECT usuario_id FROM tokens_recuperacao WHERE token = ? AND expiracao > CURRENT_TIMESTAMP`,
      [token],
      async (err, tokenRow) => {
        if (err) {
          console.error('Erro ao buscar token:', err);
          return res.status(500).json({ message: 'Erro ao buscar token', error: err.message });
        }
        if (!tokenRow) {
          return res.status(400).json({ message: 'Token inválido ou expirado' });
        }
        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
        db.run(
          'UPDATE usuarios SET senha = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
          [novaSenhaHash, tokenRow.usuario_id],
          (err2) => {
            if (err2) {
              console.error('Erro ao atualizar senha:', err2);
              return res.status(500).json({ message: 'Erro ao atualizar senha', error: err2.message });
            }
            db.run(
              'DELETE FROM tokens_recuperacao WHERE token = ?',
              [token],
              (err3) => {
                if (err3) {
                  console.error('Erro ao deletar token:', err3);
                  return res.status(500).json({ message: 'Erro ao deletar token', error: err3.message });
                }
                res.json({ message: 'Senha redefinida com sucesso' });
              }
            );
          }
        );
      }
    );
  }

  static async logout(req, res) {
    return res.json({
      message: 'Logout realizado com sucesso'
    });
  }

  static async register(req, res) {
    return res.status(501).json({ message: 'Cadastro de usuário não implementado.' });
  }

  static async alterarSenha(req, res) {
    return res.status(501).json({ message: 'Alteração de senha não implementada.' });
  }

  static async esqueceuSenha(req, res) {
    return res.status(501).json({ message: 'Recuperação de senha não implementada.' });
  }

  static async verifyToken(req, res) {
    return res.status(501).json({ message: 'Verificação de token não implementada.' });
  }

  static async recuperarSenha(req, res) {
    return res.status(501).json({ message: 'Recuperar senha não implementado.' });
  }

  static async resetarSenha(req, res) {
    return res.status(501).json({ message: 'Resetar senha não implementado.' });
  }
}

module.exports = AuthController;
