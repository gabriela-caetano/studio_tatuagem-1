# Instruções para o GitHub Copilot - Studio de Tatuagem

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Contexto do Projeto
Este é um sistema de gestão para studio de tatuagem desenvolvido com:
- **Backend**: Node.js + Express.js + MySQL
- **Frontend**: React 18 + Bootstrap + React Query
- **Arquitetura**: MVC com padrão DAO

## Padrões de Código

### Backend
- Use **async/await** para operações assíncronas
- Implemente **validação** tanto no modelo quanto no controller
- Use **try/catch** para tratamento de erros
- Retorne sempre **status HTTP** apropriados
- Implemente **paginação** em listagens
- Use **transactions** para operações complexas no banco
- Siga o padrão **DAO** para acesso aos dados

### Frontend
- Use **React Hooks** (useState, useEffect, useQuery)
- Implemente **loading states** e **error handling**
- Use **React Hook Form** para formulários
- Implemente **validação** de formulários
- Use **React Query** para cache e sincronização
- Siga o padrão de **componentes funcionais**
- Use **React Router** para navegação

### Banco de Dados
- Use **prepared statements** para prevenir SQL injection
- Implemente **índices** para performance
- Use **foreign keys** para integridade referencial
- Documente **procedures e functions**
- Use **transactions** para operações atômicas

## Convenções de Nomenclatura

### Backend
- **Arquivos**: PascalCase para classes (ClienteController.js)
- **Variáveis**: camelCase (nomeCliente)
- **Constantes**: UPPER_SNAKE_CASE (DB_HOST)
- **Funções**: camelCase descritivo (findClienteById)

### Frontend
- **Componentes**: PascalCase (ClienteForm.js)
- **Hooks personalizados**: camelCase com prefixo "use" (useClienteData)
- **Variáveis**: camelCase (isLoading)
- **Constantes**: UPPER_SNAKE_CASE (API_BASE_URL)

### Banco de Dados
- **Tabelas**: snake_case plural (clientes, agendamentos)
- **Colunas**: snake_case (data_nascimento, cliente_id)
- **Índices**: prefixo "idx_" (idx_clientes_email)
- **Procedures**: prefixo "sp_" (sp_verificar_disponibilidade)
- **Functions**: prefixo "fn_" (fn_calcular_idade)

## Estrutura de Resposta da API

### Sucesso
```json
{
  "message": "Operação realizada com sucesso",
  "data": { /* dados retornados */ },
  "pagination": { /* info de paginação se aplicável */ }
}
```

### Erro
```json
{
  "message": "Descrição do erro",
  "errors": [ /* array de erros detalhados */ ],
  "code": "ERROR_CODE"
}
```

## Validações Importantes

### Cliente
- Nome: mínimo 2 caracteres
- Email: formato válido e único
- CPF: formato válido e único
- Telefone: mínimo 10 caracteres

### Agendamento
- Data: não pode ser no passado
- Horário: verificar disponibilidade do tatuador
- Cliente e Tatuador: devem existir
- Status: deve ser um valor válido do enum

## Segurança

- **Sempre** valide entrada do usuário
- Use **rate limiting** em endpoints públicos
- Implemente **CORS** adequadamente
- **Nunca** exponha dados sensíveis
- Use **HTTPS** em produção
- Implemente **logging** de segurança

## Performance

- Use **índices** apropriados no banco
- Implemente **paginação** em listagens
- Use **cache** com React Query
- Otimize **queries** do banco de dados
- Implemente **lazy loading** quando necessário

## Tratamento de Erros

### Backend
```javascript
try {
  // operação
} catch (error) {
  console.error('Descrição do erro:', error);
  res.status(500).json({ 
    message: 'Erro interno do servidor' 
  });
}
```

### Frontend
```javascript
const { data, isLoading, error } = useQuery(
  'key',
  fetchFunction,
  {
    onError: (error) => {
      toast.error('Mensagem amigável para o usuário');
    }
  }
);
```

## Funcionalidades Principais

1. **Gestão de Clientes**: CRUD completo com validações
2. **Agendamentos**: Sistema de calendário com verificação de disponibilidade
3. **Tatuadores**: Cadastro com portfolio e especialidades
4. **Serviços**: Catálogo com preços e durações
5. **Relatórios**: Dashboard com métricas importantes
6. **Autenticação**: Sistema JWT para controle de acesso

## Próximos Desenvolvimentos

Quando implementar novas funcionalidades, considere:
- **Testes unitários** para lógica crítica
- **Documentação** de APIs com OpenAPI/Swagger
- **Logs estruturados** para debugging
- **Métricas** de performance
- **Backup** de dados críticos
- **Notificações** em tempo real
- **Upload de imagens** para portfolio
