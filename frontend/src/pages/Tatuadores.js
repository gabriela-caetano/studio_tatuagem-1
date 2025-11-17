import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Card, Table, Button, Form, InputGroup, Badge, 
  Spinner, Alert, Modal, Row, Col 
} from 'react-bootstrap';
import { 
  UserPlus, Search, Edit, Trash2, UserCheck, 
  Phone, Mail, DollarSign, CheckCircle 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { tatuadorService } from '../services';
import { useAuth } from '../contexts/AuthContext';

function Tatuadores() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTatuador, setSelectedTatuador] = useState(null);
  const [ativoFilter, setAtivoFilter] = useState(isAdmin() ? 'todos' : 'ativos'); // Admin vê todos por padrão

  // Buscar tatuadores
  const { data, isLoading, error } = useQuery(
    ['tatuadores', page, search, ativoFilter],
    () => {
      const params = {
        page,
        limit: 10,
        nome: search
      };
      
      // Se não for admin e tentar ver inativos, força mostrar apenas ativos
      if (!isAdmin() && ativoFilter !== 'ativos') {
        setAtivoFilter('ativos');
      }
      
      if (ativoFilter === 'ativos') params.ativo = '1';
      if (ativoFilter === 'inativos') params.ativo = '0';
      
      return tatuadorService.getTatuadores(params);
    },
    {
      keepPreviousData: true,
      onError: (error) => {
        console.error('Erro ao buscar tatuadores:', error);
        toast.error('Erro ao carregar tatuadores');
      }
    }
  );

  // Deletar tatuador (soft delete)
  const deleteMutation = useMutation(
    (id) => tatuadorService.deleteTatuador(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tatuadores');
        toast.success('Tatuador excluído com sucesso!');
        setShowDeleteModal(false);
      },
      onError: (error) => {
        console.error('Erro ao excluir tatuador:', error);
        toast.error(error.response?.data?.error || 'Erro ao excluir tatuador');
      }
    }
  );

  // Reativar tatuador
  const reativarMutation = useMutation(
    (id) => tatuadorService.reativarTatuador(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tatuadores');
        toast.success('Tatuador reativado com sucesso!');
      },
      onError: (error) => {
        console.error('Erro ao reativar tatuador:', error);
        toast.error(error.response?.data?.error || 'Erro ao reativar tatuador');
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDelete = () => {
    if (selectedTatuador) {
      deleteMutation.mutate(selectedTatuador.id);
    }
  };

  const handleReativar = (tatuador) => {
    reativarMutation.mutate(tatuador.id);
  };

  const formatTelefone = (telefone) => {
    if (!telefone) return '-';
    return telefone;
  };

  const formatPreco = (preco) => {
    if (!preco) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">
          <UserCheck className="me-2" />
          Tatuadores
        </h1>
        <Link to="/tatuadores/novo">
          <Button variant="primary">
            <UserPlus size={20} className="me-2" />
            Novo Tatuador
          </Button>
        </Link>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nome..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select 
                  value={ativoFilter}
                  onChange={(e) => {
                    setAtivoFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="ativos">Apenas Ativos</option>
                  <option value="inativos">Apenas Inativos</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Button type="submit" variant="primary" className="w-100">
                  Buscar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger">
          Erro ao carregar tatuadores. Tente novamente mais tarde.
        </Alert>
      )}

      <Card>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Carregando tatuadores...</p>
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-5">
              <UserCheck size={64} className="text-muted mb-3" />
              <h5 className="text-muted">Nenhum tatuador encontrado</h5>
              <p className="text-muted">
                {search ? 'Tente outra busca' : 'Comece cadastrando um novo tatuador'}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Contato</th>
                      <th>Especialidades</th>
                      <th>Valor/Hora</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data?.map((tatuador) => (
                      <tr key={tatuador.id}>
                        <td>
                          <strong>{tatuador.nome}</strong>
                        </td>
                        <td>
                          <div className="small">
                            <div>
                              <Phone size={14} className="me-1" />
                              {formatTelefone(tatuador.telefone)}
                            </div>
                            <div>
                              <Mail size={14} className="me-1" />
                              {tatuador.email}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="small text-muted">
                            {tatuador.especialidades || '-'}
                          </span>
                        </td>
                        <td>
                          <DollarSign size={14} className="me-1" />
                          {formatPreco(tatuador.valor_hora)}
                        </td>
                        <td className="text-center">
                          <Badge bg={tatuador.ativo ? 'success' : 'danger'}>
                            {tatuador.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="btn-group" role="group">
                            <Link
                              to={`/tatuadores/${tatuador.id}/editar`}
                              className="btn btn-sm btn-outline-primary"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </Link>
                            
                            {tatuador.ativo ? (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => {
                                  setSelectedTatuador(tatuador);
                                  setShowDeleteModal(true);
                                }}
                                title="Desativar"
                              >
                                <Trash2 size={16} />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => handleReativar(tatuador)}
                                disabled={reativarMutation.isLoading}
                                title="Reativar"
                              >
                                <CheckCircle size={16} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Paginação */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <span className="text-muted">
                    Mostrando {data.data?.length || 0} de {data.pagination.total || 0} tatuadores
                  </span>
                  <div className="btn-group">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Anterior
                    </Button>
                    <Button size="sm" variant="outline-primary" disabled>
                      Página {page} de {data.pagination.totalPages}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      disabled={page === data.pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Próxima
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
          <Modal.Title>Confirmar Desativação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Tem certeza que deseja desativar o tatuador{' '}
            <strong>{selectedTatuador?.nome}</strong>?
          </p>
          <Alert variant="warning" className="mb-0">
            <small>
              O tatuador será marcado como inativo mas não será removido do sistema.
              Você poderá reativá-lo a qualquer momento.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Desativando...' : 'Desativar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Tatuadores;
