const jwt = require('jsonwebtoken');

// Middleware para verificar autenticação
const auth = (req, res, next) => {
  try {
    // Pegar token do header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ 
        message: 'Token não fornecido' 
      });
    }

    // Token no formato: Bearer [token]
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ 
        message: 'Formato de token inválido' 
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ 
        message: 'Formato de token inválido' 
      });
    }

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro', (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          message: 'Token inválido ou expirado' 
        });
      }

      // Adicionar informações do usuário na requisição
      req.usuario = decoded;
      next();
    });
  } catch (error) {
    return res.status(401).json({ 
      message: 'Erro na autenticação' 
    });
  }
};

// Middleware para verificar se é admin
const isAdmin = (req, res, next) => {
  try {
    if (req.usuario.tipo !== 'admin') {
      return res.status(403).json({ 
        message: 'Acesso negado. Apenas administradores' 
      });
    }
    next();
  } catch (error) {
    return res.status(403).json({ 
      message: 'Erro na verificação de permissões' 
    });
  }
};

// Middleware para verificar se é tatuador
const isTatuador = (req, res, next) => {
  try {
    if (req.usuario.tipo !== 'tatuador' && req.usuario.tipo !== 'admin') {
      return res.status(403).json({ 
        message: 'Acesso negado. Apenas tatuadores' 
      });
    }
    next();
  } catch (error) {
    return res.status(403).json({ 
      message: 'Erro na verificação de permissões' 
    });
  }
};

// Middleware opcional de auth (não bloqueia se não tiver token)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return next();
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro', (err, decoded) => {
      if (!err) {
        req.usuario = decoded;
      }
      next();
    });
  } catch (error) {
    next();
  }
};

// Middleware para filtrar dados por tipo de usuário
const filterByUserType = (req, res, next) => {
  try {
    // Admin vê tudo, não precisa de filtros
    if (req.usuario.tipo === 'admin') {
      return next();
    }

    // Tatuador só vê seus próprios dados
    if (req.usuario.tipo === 'tatuador') {
      // Adicionar filtro de tatuador_id nas queries
      req.tatuadorFilter = req.usuario.id;
    }

    next();
  } catch (error) {
    return res.status(403).json({ 
      message: 'Erro ao aplicar filtros de acesso' 
    });
  }
};

module.exports = {
  auth,
  isAdmin,
  isTatuador,
  optionalAuth,
  filterByUserType
};
