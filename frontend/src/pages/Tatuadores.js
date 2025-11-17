import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Card, Table, Button, Form, InputGroup, Badge, 
  Spinner, Alert, Modal 
} from 'react-bootstrap';
import { 
  Plus, Search, Edit, Trash2, UserCheck, 
  Phone, Mail, DollarSign, RotateCcw, Eye 
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
  const limit = 10;

  // Buscar tatuadores
  const { data, isLoading, error, refetch } = useQuery(
    ['tatuadores', page, search],
    () => {
      const params = {
        page,
        limit,
        search
      };
      
      // Se não for admin, filtrar apenas ativos
      if (!isAdmin()) {
        params.ativo = '1';
      }
      
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

  // Resetar página ao mudar busca
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleDelete = () => {
    if (selectedTatuador) {
      deleteMutation.mutate(selectedTatuador.id);
    }
  };

  const handleReativar = (id, nome) => {
    if (window.confirm(`Tem certeza que deseja reativar o tatuador "${nome}"?`)) {
      reativarMutation.mutate(id);
    }
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

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title mb-0">
          <UserCheck size={28} className="me-2" />
          Tatuadores
        </h1>
        <Link to="/tatuadores/novo">
          <Button variant="primary">
            <Plus size={16} className="me-1" />
            Novo Tatuador
          </Button>
        </Link>
      </div>

      <Card>
        <Card.Header>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline-primary">
              <Search size={16} />
            </Button>
            {search && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setSearch('')}
              >
                Limpar
              </Button>
            )}
          </InputGroup>
        </Card.Header>

        <Card.Body className="p-0">
          {error && (
            <Alert variant="danger" className="m-3">
              Erro ao carregar tatuadores. Tente novamente mais tarde.
            </Alert>
          )}

          {data?.data?.length === 0 ? (
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
                <Table striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>Especialidades</th>
                      <th>Valor/Hora</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data?.map((tatuador) => (
                      <tr key={tatuador.id}>
                        <td>
                          <strong>{tatuador.nome}</strong>
                        </td>
                        <td>{tatuador.email}</td>
                        <td>{formatTelefone(tatuador.telefone)}</td>
                        <td>
                          <span className="small text-muted">
                            {tatuador.especialidades || '-'}
                          </span>
                        </td>
                        <td>
                          {formatPreco(tatuador.valor_hora)}
                        </td>
                        <td>
                          <Badge bg={tatuador.ativo ? 'success' : 'secondary'}>
                            {tatuador.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td>
                          {tatuador.ativo ? (
                            <div className="d-flex gap-1">
                              <Link
                                to={`/tatuadores/${tatuador.id}`}
                                className="btn btn-sm btn-outline-info"
                              >
                                <Eye size={14} />
                              </Link>
                              <Link
                                to={`/tatuadores/${tatuador.id}/editar`}
                                className="btn btn-sm btn-outline-warning"
                              >
                                <Edit size={14} />
                              </Link>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => {
                                  setSelectedTatuador(tatuador);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleReativar(tatuador.id, tatuador.nome)}
                              title="Reativar tatuador"
                            >
                              <RotateCcw size={14} className="me-1" />
                              Reativar
                            </Button>
                          )}
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
                    Mostrando {((data.pagination.page - 1) * limit) + 1} a{' '}
                    {Math.min(
                      data.pagination.page * limit,
                      data.pagination.total
                    )}{' '}
                    de {data.pagination.total} tatuadores
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
