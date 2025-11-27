// ...existing code...
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '..', 'database', 'studio_tatuagem.sqlite'); // corrigido: sobe 1 nível
if (!fs.existsSync(dbPath)) {
  console.error('Banco de dados não encontrado em:', dbPath);
  console.error('Execute "npm run create-db" na pasta backend ou verifique o caminho.');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Erro ao abrir o DB:', err.message);
    process.exit(1);
  }

  db.run(`ALTER TABLE usuarios ADD COLUMN password TEXT`, function (err) {
    if (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('duplicate column') || msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('has no column named')) {
        console.log('A coluna "password" já existe (ou tabela/coluna já estava no estado esperado).');
        process.exit(0);
      }
      console.error('ALTER TABLE failed:', msg);
      process.exit(1);
    } else {
      console.log('Coluna "password" adicionada com sucesso.');
      process.exit(0);
    }
  });
});
// ...existing code...