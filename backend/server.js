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

// debug: log headers e body das requisições para troubleshooting (mover antes das rotas)
app.use((req, res, next) => {
  try {
    console.log(`[DEBUG] ${req.method} ${req.originalUrl} - Content-Type: ${req.headers['content-type']}`);
    console.log('[DEBUG] body:', req.body);
  } catch (err) {
    console.log('[DEBUG] erro ao logar body:', err);
  }
  next();
});

// Log de requisições
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'));


// Função para inicializar o servidor
async function startServer() {
  try {
    // 1. Primeiro, testar conexão com o banco
    console.log('🔌 Conectando ao banco de dados...');
    await db.query('SELECT 1');
    console.log('✅ Conectado ao banco de dados MySQL');

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
