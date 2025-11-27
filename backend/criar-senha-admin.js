// Script para criar senha do admin
const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function criarSenhaAdmin() {
  try {
    const senha = 'admin123'; // Senha padrão
    const hash = await bcrypt.hash(senha, 10);
    
    console.log('\n📝 Atualizando senha do administrador...');
    console.log('Email: admin@studio.com');
    console.log('Senha: admin123');
    console.log('Hash:', hash);
    
    await db.execute(
      'UPDATE usuarios SET senha = ? WHERE email = ?',
      [hash, 'admin@studio.com']
    );
    
    console.log('\n✅ Senha atualizada com sucesso!');
    console.log('\n🔐 Credenciais de acesso:');
    console.log('   Email: admin@studio.com');
    console.log('   Senha: admin123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
}

criarSenhaAdmin();
