const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const crypto = require('crypto');

class AuthController {
  // Registro básico de usuário
  static async register(req, res) {
    try {
      return res.status(501).json({ message: 'Registro de usuário não implementado.' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Alteração básica de senha
  static async alterarSenha(req, res) {
    try {
      return res.status(501).json({ message: 'Alteração de senha não implementada.' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Verificar token
  static async verifyToken(req, res) {
    try {
      return res.status(501).json({ message: 'Verificação de token não implementada.' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Recuperar senha
  static async recuperarSenha(req, res) {
    try {
      return res.status(501).json({ message: 'Recuperação de senha não implementada.' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Resetar senha
  static async resetarSenha(req, res) {
    try {
      return res.status(501).json({ message: 'Reset de senha não implementado.' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
  // Registro básico de usuário
  static async register(req, res) {
    try {
      return res.status(501).json({ message: 'Registro de usuário não implementado.' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Alteração básica de senha
  static async alterarSenha(req, res) {
    try {
      return res.status(501).json({ message: 'Alteração de senha não implementada.' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  static async login(req, res) {
    try {
      const { email, senha } = req.body;
      if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
      }
      db.db.get('SELECT * FROM usuarios WHERE email = ? AND ativo = 1', [email], (err, usuario) => {
        if (err) {
          console.error('Erro ao buscar usuário:', err);
          return res.status(500).json({ message: 'Erro interno do servidor' });
        }
        if (!usuario) {
          return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        bcrypt.compare(senha, usuario.senha, (errCompare, senhaValida) => {
          if (errCompare) {
            console.error('Erro ao validar senha:', errCompare);
            return res.status(500).json({ message: 'Erro ao validar senha' });
          }
          const token = jwt.sign(
            { 
              id: usuario.id, 
              tipo: usuario.tipo,
              tatuador_id: usuario.tatuador_id || null,
              email: usuario.email,
              nome: usuario.nome
            },
            process.env.JWT_SECRET || 'studio_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '6h' }
          );
          db.db.run('UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?', [usuario.id], (err2) => {
            if (err2) console.error('Erro ao atualizar último login:', err2);
            delete usuario.senha;
            return res.status(200).json({
              message: 'Login realizado com sucesso',
              token,
              usuario
            });
          });
        });
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Recuperação de senha
  static async esqueceuSenha(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email é obrigatório' });
      }
      // Gerar token único (válido por 1 hora)
      let token = crypto.randomBytes(32).toString('hex');
      const expiracao = new Date(Date.now() + 3600000); // 1 hora

      // Salvar token no banco
      db.db.run(
        'INSERT INTO tokens_recuperacao (token, usuario_id, expiracao) SELECT ?, id, ? FROM usuarios WHERE email = ?',
        [token, expiracao.toISOString(), email],
        function (err) {
          if (err) {
            console.error('Erro ao salvar token:', err);
            return res.status(500).json({ message: 'Erro ao processar recuperação de senha' });
          }
          // TODO: Enviar email com link de recuperação
          // const link = `http://localhost:3000/redefinir-senha/${token}`;
          // await enviarEmail(email, 'Recuperação de Senha', link);

          console.log(`Token de recuperação para ${email}: ${token}`);
          res.json({ 
            message: 'Se o email existir, um link de recuperação será enviado',
            token // REMOVER EM PRODUÇÃO - só para teste
          });
        }
      );
    } catch (error) {
      console.error('Erro ao processar recuperação de senha:', error);
      res.status(500).json({ message: 'Erro ao processar recuperação de senha' });
    }
  }

  // Redefinir senha com token
  static async redefinirSenha(req, res) {
    try {
      const { token, novaSenha } = req.body;

      if (!token || !novaSenha) {
        return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres' });
      }

      // Verificar token
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
          // Hash da nova senha
          const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
          // Atualizar senha
          db.db.run(
            'UPDATE usuarios SET senha = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
            [novaSenhaHash, tokenRow.usuario_id],
            (err2) => {
              if (err2) {
                console.error('Erro ao atualizar senha:', err2);
                return res.status(500).json({ message: 'Erro ao atualizar senha', error: err2.message });
              }
              // Deletar token usado
              db.db.run(
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
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      res.status(500).json({ message: 'Erro ao redefinir senha', error: error.message });
    }
  }

  // Logout (apenas retorna sucesso, token é gerenciado no frontend)
  static async logout(req, res) {
    try {
      return res.json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }
}

module.exports = AuthController;
