import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Card, Table, Button, Badge, Form, Row, Col, Alert, Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { agendamentoService } from '../services';
import { Clock, Plus, Edit, Trash2, Filter, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import moment from 'moment';
import { shouldClearStorage, navigateToEdit, navigateToNew } from '../utils/navigationHelper';

// Chaves para sessionStorage
const STORAGE_KEYS = {
  PAGE: 'agendamentos_page',
  FILTROS: 'agendamentos_filtros'
};

function Agendamentos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  
  // Verificar se deve limpar o storage baseado no histórico de navegação
  const shouldClear = shouldClearStorage('/agendamentos');
  
  // Restaurar estado do sessionStorage ou usar valores padrão
  const getInitialPage = () => {
    if (shouldClear) return 1;
    const savedPage = sessionStorage.getItem(STORAGE_KEYS.PAGE);
    return savedPage ? parseInt(savedPage) : 1;
  };

  const getInitialFiltros = () => {
    if (shouldClear) {
      return {
        data_inicio: moment().startOf('month').format('YYYY-MM-DD'),
        data_fim: moment().endOf('month').format('YYYY-MM-DD'),
        status: '',
        tatuador_id: ''
      };
    }
    
    const savedFiltros = sessionStorage.getItem(STORAGE_KEYS.FILTROS);
    if (savedFiltros) {
      try {
        return JSON.parse(savedFiltros);
      } catch (e) {
        console.error('Erro ao parsear filtros salvos:', e);
      }
    }
    return {
      data_inicio: moment().startOf('month').format('YYYY-MM-DD'),
      data_fim: moment().endOf('month').format('YYYY-MM-DD'),
      status: '',
      tatuador_id: ''
    };
  };

  const [page, setPage] = useState(getInitialPage);
  const limit = 10;
  const [filtros, setFiltros] = useState(getInitialFiltros);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agendamentoToDelete, setAgendamentoToDelete] = useState(null);

  // Limpar storage se necessário quando a rota mudar
  useEffect(() => {
    if (shouldClear) {
      console.log('🧹 [AGENDAMENTOS] Limpando storage');
      sessionStorage.removeItem(STORAGE_KEYS.PAGE);
      sessionStorage.removeItem(STORAGE_KEYS.FILTROS);
      setPage(1);
      setFiltros({
        data_inicio: moment().startOf('month').format('YYYY-MM-DD'),
        data_fim: moment().endOf('month').format('YYYY-MM-DD'),
        status: '',
        tatuador_id: ''
      });
    } else {
      console.log('💾 [AGENDAMENTOS] Mantendo storage');
    }
  }, [location.pathname]); // Executa quando a rota muda

  // Salvar estado no sessionStorage sempre que mudar (regra 2, 4)
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.PAGE, page.toString());
  }, [page]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.FILTROS, JSON.stringify(filtros));
  }, [filtros]);

  // Resetar página ao mudar filtros (regra 3)
  const handleFiltroChange = (newFiltros) => {
    setFiltros(newFiltros);
    setPage(1);
  };

  const { data, isLoading, error } = useQuery(
    ['agendamentos', page, filtros],
    () => agendamentoService.getAgendamentos({
      ...filtros,
      page,
      limit
    }),
    {
      keepPreviousData: true
    }
  );

  const deleteMutation = useMutation(
    (id) => agendamentoService.deleteAgendamento(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['agendamentos']);
        toast.success('Agendamento excluído com sucesso!');
      },
      onError: (error) => {
        const message = error.response?.data?.mensagem || error.message;
        toast.error('Erro ao excluir agendamento: ' + message);
      }
    }
  );

  const handleDelete = (agendamento) => {
    setAgendamentoToDelete(agendamento);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (agendamentoToDelete) {
      deleteMutation.mutate(agendamentoToDelete.id);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      agendado: 'warning',
      confirmado: 'info',
      em_andamento: 'primary',
      concluido: 'success',
      cancelado: 'danger'
    };
    const statusText = {
      agendado: 'Agendado',
      confirmado: 'Confirmado',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado'
    };
    return (
      <Badge bg={statusMap[status] || 'secondary'}>
        {statusText[status] || status}
      </Badge>
    );
  };

  const agendamentos = data?.agendamentos || [];

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title mb-0">
          <Clock size={28} className="me-2" />
          Agendamentos
        </h1>
        <Button
          variant="primary"
          onClick={() => navigateToNew(navigate, '/agendamentos/novo')}
        >
          <Plus size={20} className="me-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Filtros */}
      <Card className="shadow-sm mb-4">
        <Card.Header>
          <Filter size={18} className="me-2" />
          Filtros
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Data Início</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.data_inicio}
                  onChange={(e) => handleFiltroChange({ ...filtros, data_inicio: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Data Fim</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.data_fim}
                  onChange={(e) => handleFiltroChange({ ...filtros, data_fim: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filtros.status}
                  onChange={(e) => handleFiltroChange({ ...filtros, status: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="agendado">Agendado</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                className="mb-3 w-100"
                onClick={() => {
                  const defaultFiltros = {
                    data_inicio: moment().startOf('month').format('YYYY-MM-DD'),
                    data_fim: moment().endOf('month').format('YYYY-MM-DD'),
                    status: '',
                    tatuador_id: ''
                  };
                  handleFiltroChange(defaultFiltros);
                }}
              >
                Limpar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabela de Agendamentos */}
      <Card className="shadow-sm">
        <Card.Header>
          <strong>Lista de Agendamentos</strong>
          {data?.pagination && (
            <span className="text-muted ms-2">
              ({data.pagination.totalItems} registros)
            </span>
          )}
        </Card.Header>
        <Card.Body className="p-0">{isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : error ? (
            <Alert variant="danger" className="m-3">
              Erro ao carregar agendamentos: {error.message}
            </Alert>
          ) : agendamentos.length === 0 ? (
            <div className="text-center py-5">
              <Clock size={48} className="text-muted mb-3" />
              <h5 className="text-muted">Nenhum agendamento encontrado</h5>
              <p className="text-muted">
                {filtros.data_inicio || filtros.status
                  ? 'Tente ajustar os filtros'
                  : 'Crie o primeiro agendamento'}
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/agendamentos/novo')}
              >
                <Plus size={16} className="me-1" />
                Novo Agendamento
              </Button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Cliente</th>
                      <th>Tatuador</th>
                      <th>Serviço</th>
                      <th>Status</th>
                      <th>Valor</th>
                      <th style={{width: '140px'}}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamentos.map((agendamento) => (
                      <tr key={agendamento.id}>
                        <td>{moment(agendamento.data_agendamento).format('DD/MM/YYYY')}</td>
                        <td>{agendamento.hora_inicio} - {agendamento.hora_fim}</td>
                        <td>{agendamento.cliente_nome}</td>
                        <td>{agendamento.tatuador_nome}</td>
                        <td>{agendamento.servico_nome || 'Personalizado'}</td>
                        <td>{getStatusBadge(agendamento.status)}</td>
                        <td>R$ {parseFloat(agendamento.valor_estimado || 0).toFixed(2)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => navigate(`/agendamentos/${agendamento.id}`)}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => navigateToEdit(navigate, `/agendamentos/${agendamento.id}/editar`)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(agendamento)}
                              disabled={deleteMutation.isLoading}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Paginação */}
              {data?.pagination && (
                <div className="d-flex justify-content-between align-items-center p-3">
                  <div className="text-muted">
                    Mostrando {((data.pagination.currentPage - 1) * limit) + 1} a{' '}
                    {Math.min(
                      data.pagination.currentPage * limit,
                      data.pagination.totalItems
                    )}{' '}
                    de {data.pagination.totalItems} agendamentos
                  </div>
                  <div className="d-flex gap-1">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Anterior
                    </Button>
                    <span className="align-self-center mx-2 text-muted">
                      Página {page} de {data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={page >= data.pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Tem certeza que deseja excluir o agendamento de <strong>{agendamentoToDelete?.cliente_nome}</strong> com <strong>{agendamentoToDelete?.tatuador_nome}</strong>?
          </p>
          <p className="text-muted mb-0">
            Esta ação não poderá ser desfeita.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Agendamentos;
