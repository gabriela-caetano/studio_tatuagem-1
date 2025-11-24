const AgendamentoController = require('../../controllers/AgendamentoController');
const AgendamentoDAO = require('../../dao/AgendamentoDAO');
const Agendamento = require('../../models/Agendamento');

jest.mock('../../dao/AgendamentoDAO');
jest.mock('../../dao/ClienteDAO');

describe('AgendamentoController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      usuario: { id: 1, tipo: 'admin' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('updateStatus', () => {
    it('deve atualizar status e valor_final com sucesso', async () => {
      req.params.id = 1;
      req.body = {
        status: 'concluido',
        valor_final: 200,
        observacoes: 'Tudo ok'
      };

      const mockAgendamento = {
        id: 1,
        status: 'agendado',
        tatuador_id: 1
      };

      AgendamentoDAO.findById.mockResolvedValue(mockAgendamento);
      AgendamentoDAO.updateStatus.mockResolvedValue({ ...mockAgendamento, status: 'concluido', valor_final: 200 });

      await AgendamentoController.updateStatus(req, res);

      expect(AgendamentoDAO.updateStatus).toHaveBeenCalledWith(1, 'concluido', 'Tudo ok', 200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Status atualizado com sucesso'
      }));
    });

    it('deve retornar erro se status for inválido', async () => {
      req.params.id = 1;
      req.body = { status: 'status_inexistente' };

      await AgendamentoController.updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Status inválido' });
    });
  });
});
