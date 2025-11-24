const ServicoController = require('../../controllers/ServicoController');
const ServicoDAO = require('../../dao/ServicoDAO');

// Mock do DAO
jest.mock('../../dao/ServicoDAO');

describe('ServicoController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um serviço com sucesso', async () => {
      const servicoData = {
        nome: 'Tatuagem Pequena',
        descricao: 'Até 5cm',
        preco_base: 150,
        duracao_estimada: 60
      };
      req.body = servicoData;

      ServicoDAO.create.mockResolvedValue({ id: 1, ...servicoData });

      await ServicoController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        nome: 'Tatuagem Pequena'
      }));
    });

    it('deve permitir criar serviço com preço base 0', async () => {
      const servicoData = {
        nome: 'Orçamento',
        descricao: 'Avaliação gratuita',
        preco_base: 0,
        duracao_estimada: 30
      };
      req.body = servicoData;

      ServicoDAO.create.mockResolvedValue({ id: 2, ...servicoData });

      await ServicoController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        preco_base: 0
      }));
    });

    it('deve retornar erro se preço base for negativo', async () => {
      req.body = {
        nome: 'Teste',
        descricao: 'Teste',
        preco_base: -10,
        duracao_estimada: 60
      };

      await ServicoController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Preço base deve ser maior ou igual a zero' });
    });
  });

  describe('list', () => {
    it('deve listar serviços com paginação', async () => {
      const mockServicos = {
        data: [{ id: 1, nome: 'Tatuagem' }],
        pagination: { page: 1, total: 1 }
      };
      ServicoDAO.findAll.mockResolvedValue(mockServicos);

      await ServicoController.list(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.any(Array)
      }));
    });
  });
});
