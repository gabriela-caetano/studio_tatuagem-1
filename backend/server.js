const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Capturar erros não tratados
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION:', reason);
  console.error('Promise:', promise);
});

// Middlewares de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000 // máximo 1000 requests por IP por janela de tempo (aumentado para desenvolvimento)
});
app.use(limiter);

// CORS - Permitir múltiplas origens
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (como Postman) ou de origens permitidas
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'));

// Rota /login (POST) para autenticação direta
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  console.log('POST /login recebido:', { email });
  if (!email || !senha) {
    console.log('Dados ausentes:', { email, senha });
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }
  db.db.get('SELECT * FROM usuarios WHERE email = ? AND ativo = 1', [email], (err, usuario) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
    }
    console.log('Resultado da busca:', usuario);
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    bcrypt.compare(senha, usuario.senha, (errCompare, senhaValida) => {
      if (errCompare) {
        console.error('Erro ao validar senha:', errCompare);
        return res.status(500).json({ message: 'Erro ao validar senha', error: errCompare.message });
      }
      console.log('Senha válida?', senhaValida);
      if (!senhaValida) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      const token = jwt.sign(
        { id: usuario.id, tipo: usuario.tipo },
        process.env.JWT_SECRET || 'studio_secret',
        { expiresIn: '8h' }
      );
      db.db.run('UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?', [usuario.id], (err2) => {
        if (err2) console.error('Erro ao atualizar último login:', err2);
        const usuarioSemSenha = { ...usuario };
        delete usuarioSemSenha.senha;
        console.log('Login realizado com sucesso:', usuarioSemSenha);
        return res.status(200).json({
          message: 'Login realizado com sucesso',
          token,
          usuario: usuarioSemSenha
        });
      });
    });
  });
});

// Rota /login (GET) para evitar erro 404
app.get('/login', (req, res) => {
  res.status(404).json({ message: 'Endpoint /login não implementado. Use POST /login para autenticação.' });
});

// Rota /favicon.ico para evitar erro 404
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // Sem conteúdo
});

// Função para inicializar o servidor
async function startServer() {
  try {
    // 1. Primeiro, testar conexão com o banco SQLite
    console.log('🔌 Conectando ao banco SQLite...');
    await db.query('SELECT 1');
    console.log('✅ Conectado ao banco de dados SQLite');

    // 2. Depois, importar e registrar as rotas
    console.log('📦 Carregando rotas...');
    const clienteRoutes = require('./routes/clienteRoutes');
    const tatuadorRoutes = require('./routes/tatuadorRoutes');
    const agendamentoRoutes = require('./routes/agendamentoRoutes');
    const servicoRoutes = require('./routes/servicoRoutes');
    const authRoutes = require('./routes/authRoutes');
    const relatorioRoutes = require('./routes/relatorioRoutes');

    app.use('/api/auth', authRoutes);
    app.use('/api/clientes', clienteRoutes);
    app.use('/api/tatuadores', tatuadorRoutes);
    app.use('/api/agendamentos', agendamentoRoutes);
    app.use('/api/servicos', servicoRoutes);
    app.use('/api/relatorios', relatorioRoutes);
    console.log('✅ Rotas carregadas');

    // 3. Rota de health check
    app.get('/health', (req, res) => {
      console.log('🏥 Health check requisitado');
      res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Studio Tatuagem Backend',
        database: 'connected'
      });
    });


    // 4. Middleware de tratamento de erros
    app.use((err, req, res, next) => {
      console.error('❌ Erro capturado no middleware:', err.message);
      console.error('Stack:', err.stack);
      res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
      });
    });

    // 5. Middleware para rotas não encontradas
    app.use('*', (req, res) => {
      console.log('❓ Rota não encontrada:', req.originalUrl);
      res.status(404).json({ message: 'Rota não encontrada' });
    });

    // 6. Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 Sistema pronto para uso!`);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Iniciar o servidor
startServer();
