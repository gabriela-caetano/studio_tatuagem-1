# 🎨 Studio de Tatuagem - Sistema de Gestão

Sistema completo de gestão para studios de tatuagem, desenvolvido com Node.js, React e MySQL.

## 📋 Funcionalidades

- ✅ **Gestão de Clientes**: Cadastro completo com validações de CPF e email
- ✅ **Agendamentos**: Sistema de calendário com verificação de disponibilidade
- ✅ **Tatuadores**: Cadastro com portfolio e especialidades
- ✅ **Serviços**: Catálogo com preços e durações
- ✅ **Relatórios**: Dashboard com métricas de desempenho
- ✅ **Autenticação**: Sistema JWT para controle de acesso

## 🚀 Tecnologias

### Backend
- Node.js 18+
- Express.js
- MySQL 8.0+
- JWT para autenticação
- Bcrypt para criptografia

### Frontend
- React 18
- Bootstrap 5
- React Query
- React Router v6
- React Hook Form

## 📦 Instalação

### Pré-requisitos
- Node.js 18 ou superior
- MySQL 8.0 ou superior
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/studio-tatuagem.git
cd studio-tatuagem
```

### 2. Instale as dependências

#### Usando o script automatizado (Windows)
```powershell
.\INICIAR-SISTEMA.ps1
```

#### Ou manualmente
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure o banco de dados

1. Crie um banco de dados MySQL:
```sql
CREATE DATABASE studio_tatuagem;
```

2. Configure as credenciais em `backend/config/database.js`:
```javascript
const config = {
  host: 'localhost',
  user: 'seu_usuario',
  password: 'sua_senha',
  database: 'studio_tatuagem'
};
```

3. Execute o script de criação do banco:
```bash
mysql -u seu_usuario -p studio_tatuagem < database/schema.sql
```

### 4. Inicie a aplicação

#### Usando VS Code Tasks
Pressione `Ctrl+Shift+B` e selecione "Iniciar Aplicação Completa"

#### Ou manualmente
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

A aplicação estará disponível em:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🔐 Credenciais Padrão

Após executar o script do banco de dados, você pode fazer login com:

**Administrador:**
- Email: admin@studio.com
- Senha: admin123

**Tatuador:**
- Email: carlos@studio.com
- Senha: carlos123

## 📁 Estrutura do Projeto

```
studio-tatuagem/
├── backend/
│   ├── config/         # Configurações do banco de dados
│   ├── controllers/    # Controladores da API
│   ├── dao/           # Data Access Objects
│   ├── middleware/    # Middleware de autenticação
│   ├── models/        # Modelos de dados
│   ├── routes/        # Rotas da API
│   └── server.js      # Servidor Express
├── frontend/
│   ├── public/        # Arquivos públicos
│   └── src/
│       ├── components/ # Componentes React
│       ├── contexts/  # Context API
│       ├── pages/     # Páginas da aplicação
│       └── services/  # Serviços de API
└── database/
    └── schema.sql     # Script de criação do banco
```

## 🔧 Padrões de Código

### Backend
- Arquitetura MVC com padrão DAO
- Async/await para operações assíncronas
- Validação em modelo e controller
- Try/catch para tratamento de erros
- Prepared statements para segurança

### Frontend
- Componentes funcionais com Hooks
- React Query para cache e sincronização
- React Hook Form para formulários
- Loading states e error handling
- React Router para navegação

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de novo usuário

### Clientes
- `GET /api/clientes` - Listar clientes (paginado)
- `GET /api/clientes/:id` - Buscar cliente por ID
- `POST /api/clientes` - Criar novo cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Excluir cliente

### Agendamentos
- `GET /api/agendamentos` - Listar agendamentos
- `GET /api/agendamentos/:id` - Buscar agendamento
- `POST /api/agendamentos` - Criar agendamento
- `PUT /api/agendamentos/:id` - Atualizar agendamento
- `DELETE /api/agendamentos/:id` - Cancelar agendamento

### Tatuadores
- `GET /api/tatuadores` - Listar tatuadores
- `GET /api/tatuadores/:id` - Buscar tatuador
- `POST /api/tatuadores` - Criar tatuador
- `PUT /api/tatuadores/:id` - Atualizar tatuador

### Serviços
- `GET /api/servicos` - Listar serviços
- `POST /api/servicos` - Criar serviço
- `PUT /api/servicos/:id` - Atualizar serviço
- `DELETE /api/servicos/:id` - Excluir serviço

### Relatórios
- `GET /api/relatorios/dashboard` - Métricas do dashboard

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🏗️ Build para Produção

```bash
# Frontend
cd frontend
npm run build
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Convenções de Nomenclatura

### Backend
- **Arquivos**: PascalCase (ClienteController.js)
- **Variáveis**: camelCase (nomeCliente)
- **Constantes**: UPPER_SNAKE_CASE (DB_HOST)

### Frontend
- **Componentes**: PascalCase (ClienteForm.js)
- **Hooks**: camelCase com prefixo "use" (useClienteData)
- **Variáveis**: camelCase (isLoading)

### Banco de Dados
- **Tabelas**: snake_case plural (clientes, agendamentos)
- **Colunas**: snake_case (data_nascimento, cliente_id)

## 🔒 Segurança

- Validação de entrada em todos os endpoints
- Senhas criptografadas com bcrypt
- Tokens JWT para autenticação
- Prepared statements para prevenir SQL injection
- CORS configurado adequadamente

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Isael** - Desenvolvimento Completo

## 📞 Suporte

Para suporte, envie um email para suporte@studio.com ou abra uma issue no GitHub.

---

⭐ Se este projeto foi útil para você, considere dar uma estrela!
