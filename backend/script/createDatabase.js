// ...existing code...
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '..', 'data', 'meubanco.db');

// Garante que a pasta exista
const dir = path.dirname(DB_FILE);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

try {
  const db = new Database(DB_FILE);

  // Cria tabela com constraints
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Índice para unicidade/email
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);`);

  const insert = db.prepare('INSERT INTO usuarios (nome, email, password, role) VALUES (?, ?, ?, ?)');
  const exists = db.prepare('SELECT 1 FROM usuarios WHERE email = ?');

  const seeds = [
    { nome: 'Administrador', email: 'admin@studio.com', senha: 'admin123', role: 'admin' },
    { nome: 'Carlos Tatuador', email: 'carlos@studio.com', senha: 'carlos123', role: 'tatuador' }
  ];

  const insertMany = db.transaction((items) => {
    for (const u of items) {
      const found = exists.get(u.email);
      if (!found) {
        const hash = bcrypt.hashSync(u.senha, 10);
        insert.run(u.nome, u.email, hash, u.role);
      }
    }
  });

  insertMany(seeds);

  const rows = db.prepare('SELECT id, nome, email, role, created_at FROM usuarios').all();
  console.log({
    message: 'Operação realizada com sucesso',
    data: rows
  });

  db.close();
} catch (error) {
  console.error({
    message: 'Erro ao criar/usar o banco de dados',
    errors: [error.message],
    code: 'DB_ERROR'
  });
  process.exit(1);
}
// ...existing code...