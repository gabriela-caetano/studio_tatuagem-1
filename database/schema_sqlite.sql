-- SCHEMA BANCO DE DADOS: STUDIO TATUAGEM (SQLite)

-- Tabela: clientes
CREATE TABLE IF NOT EXISTS clientes (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nome TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	cpf TEXT NOT NULL UNIQUE,
	telefone TEXT NOT NULL,
	data_nascimento DATE,
	ativo INTEGER DEFAULT 1,
	data_cadastro DATE DEFAULT (DATE('now'))
);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf);

-- Tabela: tatuadores
CREATE TABLE IF NOT EXISTS tatuadores (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nome TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	cpf TEXT,
	senha TEXT NOT NULL,
	telefone TEXT,
	especialidades TEXT,
	portfolio TEXT,
	ativo INTEGER DEFAULT 1,
	data_cadastro DATE DEFAULT (DATE('now'))
);
CREATE INDEX IF NOT EXISTS idx_tatuadores_email ON tatuadores(email);
CREATE INDEX IF NOT EXISTS idx_tatuadores_cpf ON tatuadores(cpf);

-- Tabela: servicos
CREATE TABLE IF NOT EXISTS servicos (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nome TEXT NOT NULL,
	descricao TEXT,
	preco REAL NOT NULL,
	duracao INTEGER,
	ativo INTEGER DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_servicos_nome ON servicos(nome);

-- Tabela: agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	cliente_id INTEGER NOT NULL,
	tatuador_id INTEGER NOT NULL,
	servico_id INTEGER,
	data_agendamento DATE NOT NULL,
	hora_inicio TEXT NOT NULL,
	hora_fim TEXT,
	status TEXT NOT NULL,
	valor_estimado REAL,
	valor_final REAL,
	observacoes TEXT,
	criado_em DATE DEFAULT (DATE('now')),
	FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
	FOREIGN KEY (tatuador_id) REFERENCES tatuadores(id) ON DELETE CASCADE,
	FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_tatuador ON agendamentos(tatuador_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos(cliente_id);
