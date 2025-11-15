import api from './api';

export const clienteService = {
  // Listar todos os clientes
  getClientes: async (params = {}) => {
    const response = await api.get('/clientes', { params });
    return response.data;
  },

  // Buscar cliente por ID
  getClienteById: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  // Criar novo cliente
  createCliente: async (clienteData) => {
    const response = await api.post('/clientes', clienteData);
    return response.data;
  },

  // Atualizar cliente
  updateCliente: async (id, clienteData) => {
    const response = await api.put(`/clientes/${id}`, clienteData);
    return response.data;
  },

  // Excluir cliente
  deleteCliente: async (id) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },

  // Buscar agendamentos do cliente
  getAgendamentosCliente: async (id) => {
    const response = await api.get(`/clientes/${id}/agendamentos`);
    return response.data;
  },
};

export const agendamentoService = {
  // Listar agendamentos
  getAgendamentos: async (filters = {}) => {
    const response = await api.get('/agendamentos', { params: filters });
    return response.data;
  },

  // Buscar agendamento por ID
  getAgendamentoById: async (id) => {
    const response = await api.get(`/agendamentos/${id}`);
    return response.data;
  },

  // Criar novo agendamento
  createAgendamento: async (agendamentoData) => {
    const response = await api.post('/agendamentos', agendamentoData);
    return response.data;
  },

  // Atualizar agendamento
  updateAgendamento: async (id, agendamentoData) => {
    const response = await api.put(`/agendamentos/${id}`, agendamentoData);
    return response.data;
  },

  // Atualizar status do agendamento
  updateStatus: async (id, status, observacoes) => {
    const response = await api.patch(`/agendamentos/${id}/status`, {
      status,
      observacoes,
    });
    return response.data;
  },

  // Cancelar agendamento
  cancelAgendamento: async (id, observacoes) => {
    const response = await api.patch(`/agendamentos/${id}/cancel`, {
      observacoes,
    });
    return response.data;
  },

  // Excluir agendamento
  deleteAgendamento: async (id) => {
    const response = await api.delete(`/agendamentos/${id}`);
    return response.data;
  },

  // Buscar agendamentos por data
  getAgendamentosByDate: async (data) => {
    const response = await api.get(`/agendamentos/data/${data}`);
    return response.data;
  },

  // Relatório mensal
  getRelatorioMensal: async (ano, mes) => {
    const response = await api.get(`/agendamentos/relatorio/${ano}/${mes}`);
    return response.data;
  },

  // Concluir agendamento
  concluirAgendamento: async (id, data) => {
    const response = await api.patch(`/agendamentos/${id}/concluir`, data);
    return response.data;
  },
};

// Serviço de Serviços (Catálogo)
export const servicoService = {
  // Listar todos os serviços
  getServicos: async (params = {}) => {
    const response = await api.get('/servicos', { params });
    return response.data;
  },

  // Buscar serviço por ID
  getServicoById: async (id) => {
    const response = await api.get(`/servicos/${id}`);
    return response.data;
  },

  // Criar novo serviço
  createServico: async (servicoData) => {
    const response = await api.post('/servicos', servicoData);
    return response.data;
  },

  // Atualizar serviço
  updateServico: async (id, servicoData) => {
    const response = await api.put(`/servicos/${id}`, servicoData);
    return response.data;
  },

  // Excluir serviço
  deleteServico: async (id) => {
    const response = await api.delete(`/servicos/${id}`);
    return response.data;
  },
};

// Serviço de Tatuadores
export const tatuadorService = {
  // Listar todos os tatuadores
  getTatuadores: async (params = {}) => {
    const response = await api.get('/tatuadores', { params });
    return response.data;
  },

  // Listar tatuadores ativos (simplificado)
  getTatuadoresAtivos: async () => {
    const response = await api.get('/tatuadores/ativos/list');
    return response.data;
  },

  // Buscar tatuador por ID
  getTatuadorById: async (id) => {
    const response = await api.get(`/tatuadores/${id}`);
    return response.data;
  },

  // Criar novo tatuador
  createTatuador: async (tatuadorData) => {
    const response = await api.post('/tatuadores', tatuadorData);
    return response.data;
  },

  // Atualizar tatuador
  updateTatuador: async (id, tatuadorData) => {
    const response = await api.put(`/tatuadores/${id}`, tatuadorData);
    return response.data;
  },

  // Excluir tatuador
  deleteTatuador: async (id) => {
    const response = await api.delete(`/tatuadores/${id}`);
    return response.data;
  },

  // Reativar tatuador
  reativarTatuador: async (id) => {
    const response = await api.patch(`/tatuadores/${id}/reativar`);
    return response.data;
  },

  // Buscar agendamentos do tatuador
  getAgendamentosTatuador: async (id) => {
    const response = await api.get(`/tatuadores/${id}/agendamentos`);
    return response.data;
  },

  // Verificar disponibilidade
  verificarDisponibilidade: async (id, data, horaInicio, horaFim) => {
    const response = await api.get(`/tatuadores/${id}/disponibilidade`, {
      params: { data, hora_inicio: horaInicio, hora_fim: horaFim }
    });
    return response.data;
  },

  // Buscar estatísticas do tatuador
  getEstatisticas: async (id, dataInicio, dataFim) => {
    const response = await api.get(`/tatuadores/${id}/estatisticas`, {
      params: { data_inicio: dataInicio, data_fim: dataFim }
    });
    return response.data;
  },

  // Login tatuador
  loginTatuador: async (data) => {
    const response = await api.post('/tatuadores/login', data);
    return response.data;
  },
};

// Serviço de Autenticação
export const authService = {
  // Login
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // Backend retorna 'usuario', mas salvamos como 'user' no localStorage
      const user = response.data.usuario || response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      // Retornar com o nome correto 'user'
      return {
        token: response.data.token,
        user: user,
        message: response.data.message
      };
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Registro
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Verificar token
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  // Alterar senha
  alterarSenha: async (data) => {
    const response = await api.put('/auth/alterar-senha', data);
    return response.data;
  },

  // Esqueceu senha (recuperar senha)
  esqueceuSenha: async (data) => {
    const response = await api.post('/auth/esqueceu-senha', data);
    return response.data;
  },

  // Redefinir senha
  redefinirSenha: async (data) => {
    const response = await api.post('/auth/redefinir-senha', data);
    return response.data;
  },

  // Obter usuário logado
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar se está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// Serviço de Relatórios
export const relatorioService = {
  // Dashboard geral
  getDashboard: async (dataInicio, dataFim) => {
    const response = await api.get('/relatorios/dashboard', {
      params: { data_inicio: dataInicio, data_fim: dataFim }
    });
    return response.data;
  },

  // Relatório de agendamentos
  getAgendamentos: async (params = {}) => {
    const response = await api.get('/relatorios/agendamentos', { params });
    return response.data;
  },

  // Relatório financeiro
  getFinanceiro: async (dataInicio, dataFim, tatuadorId) => {
    const response = await api.get('/relatorios/financeiro', {
      params: { 
        data_inicio: dataInicio, 
        data_fim: dataFim,
        tatuador_id: tatuadorId 
      }
    });
    return response.data;
  },

  // Relatório de agendamentos (alias)
  getRelatorioAgendamentos: async (params = {}) => {
    const response = await api.get('/relatorios/agendamentos', { params });
    return response.data;
  },

  // Relatório financeiro (alias)
  getRelatorioFinanceiro: async (dataInicio, dataFim, tatuadorId) => {
    const response = await api.get('/relatorios/financeiro', {
      params: { 
        data_inicio: dataInicio, 
        data_fim: dataFim,
        tatuador_id: tatuadorId 
      }
    });
    return response.data;
  },

  // Relatório por tatuador
  getRelatorioPorTatuador: async (dataInicio, dataFim) => {
    const response = await api.get('/relatorios/tatuadores', {
      params: { data_inicio: dataInicio, data_fim: dataFim }
    });
    return response.data;
  },

  // Relatório de clientes
  getRelatorioClientes: async (dataInicio, dataFim) => {
    const response = await api.get('/relatorios/clientes', {
      params: { data_inicio: dataInicio, data_fim: dataFim }
    });
    return response.data;
  },
};
