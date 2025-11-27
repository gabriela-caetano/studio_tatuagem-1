// Script de teste para depurar o erro no ClienteDAO
const db = require('./config/database');

async function testarClienteDAO() {
  try {
    console.log('\n🧪 TESTE 1: Conexão com banco...');
    const [result] = await db.execute('SELECT 1 as test');
    console.log('✅ Banco conectado!', result);

    console.log('\n🧪 TESTE 2: Buscar clientes (SEM paginação)...');
    const [clientes] = await db.execute('SELECT * FROM clientes WHERE ativo = 1 LIMIT 10');
    console.log(`✅ ${clientes.length} clientes encontrados`);

    console.log('\n🧪 TESTE 3: Buscar clientes (COM parâmetros)...');
    const page = 1;
    const limit = 10;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    console.log('Parâmetros:', { pageNum, limitNum, offset });
    console.log('Tipos:', { 
      pageNum: typeof pageNum, 
      limitNum: typeof limitNum, 
      offset: typeof offset 
    });

    const query = `SELECT * FROM clientes WHERE ativo = 1 ORDER BY nome ASC LIMIT ${offset}, ${limitNum}`;
    const params = [];
    
    console.log('Query:', query);
    console.log('Params:', params);
    
    const [clientesComParams] = await db.execute(query, params);
    console.log(`✅ ${clientesComParams.length} clientes encontrados com parâmetros`);
    
    console.log('\n✅ TODOS OS TESTES PASSARAM!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:');
    console.error('Mensagem:', error.message);
    console.error('Código:', error.code);
    console.error('SQL:', error.sql);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

testarClienteDAO();
