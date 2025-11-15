const mysql = require('mysql2');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'studio_tatuagem',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

console.log('📦 Criando pool de conexões MySQL...');
const pool = mysql.createPool(config);

// Promisify para usar async/await
const promisePool = pool.promise();

// Adicionar handler de erro do pool
pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexões:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Conexão com banco de dados foi perdida.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Banco de dados tem muitas conexões.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Conexão com banco de dados foi recusada.');
  }
});

module.exports = promisePool;
