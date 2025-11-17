import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search, Plus, Edit, Trash2, Eye, Users, RotateCcw } from 'lucide-react';
import { clienteService } from '../services';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { shouldClearStorage, navigateToView, navigateToEdit, navigateToNew } from '../utils/navigationHelper';

// Chaves para sessionStorage
const STORAGE_KEYS = {
  PAGE: 'clientes_page',
  SEARCH: 'clientes_search'
};

function Clientes() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Só processar se estamos EXATAMENTE na rota /clientes
  const isExactRoute = location.pathname === '/clientes';
  
  // Verificar logo no início se deve limpar storage
  const shouldClear = isExactRoute ? shouldClearStorage('/clientes') : false;
  
  // Restaurar estado do sessionStorage ou usar valores padrão
  const getInitialPage = () => {
    console.log('📦 [CLIENTES] Valores no storage page:', {
      page: sessionStorage.getItem(STORAGE_KEYS.PAGE),
      shouldClear: shouldClear
    });
    if (shouldClear) return 1;
    const savedPage = sessionStorage.getItem(STORAGE_KEYS.PAGE);
    return savedPage ? parseInt(savedPage) : 1;
  };

  const getInitialSearch = () => {
    console.log('📦 [CLIENTES] Valores no storage search:', {
      search: sessionStorage.getItem(STORAGE_KEYS.SEARCH),
      shouldClear: shouldClear
    });
    if (shouldClear) return '';
    const savedSearch = sessionStorage.getItem(STORAGE_KEYS.SEARCH);
    return savedSearch || '';
  };

  const [search, setSearch] = useState(getInitialSearch);
  const [page, setPage] = useState(getInitialPage);
  const limit = 10;

  // Limpar storage apenas UMA VEZ se necessário
  useEffect(() => {
    if (isExactRoute && shouldClear) {
      console.log('🧹 [CLIENTES] Limpando storage no mount');
      sessionStorage.removeItem(STORAGE_KEYS.PAGE);
      sessionStorage.removeItem(STORAGE_KEYS.SEARCH);
    }
    // Este effect roda apenas uma vez no mount
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Salvar estado no sessionStorage sempre que mudar (regra 2, 4)
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.PAGE, page.toString());
  }, [page]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.SEARCH, search);
  }, [search]);

  // Resetar página ao mudar busca (regra 3)
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [search]); // Não incluir page aqui para evitar loop

  const {
    data: clientesData,
    isLoading,
    refetch
  } = useQuery(
    ['clientes', page, search],
    () => clienteService.getClientes({ 
      page, 
      limit, 
      search,
      // Se for admin, não filtra por ativo (mostra todos)
      ...(isAdmin() ? {} : { ativo: 1 })
    }),
    {
      keepPreviousData: true,
      enabled: isExactRoute, // Só executar query se estiver na rota exata
      onError: (error) => {
        toast.error('Erro ao carregar clientes');
        console.error('Erro:', error);
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const handleDelete = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) {
      try {
        await clienteService.deleteCliente(id);
        toast.success('Cliente excluído com sucesso');
        refetch();
      } catch (error) {
        toast.error('Erro ao excluir cliente');
        console.error('Erro:', error);
      }
    }
  };

  const handleReativar = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja reativar o cliente "${nome}"?`)) {
      try {
        await clienteService.reativarCliente(id);
        toast.success('Cliente reativado com sucesso');
        refetch();
      } catch (error) {
        toast.error('Erro ao reativar cliente');
        console.error('Erro:', error);
      }
    }
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatTelefone = (telefone) => {
    if (!telefone) return '';
    return telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  // Não renderizar nada se não estamos na rota exata
  if (!isExactRoute) {
    return null;
  }

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
        <h1 className="page-title mb-0"><Users size={28} className="me-2" />Clientes</h1>
        <Button 
          variant="primary"
          onClick={() => navigateToNew(navigate, '/clientes/novo')}
        >
          <Plus size={16} className="me-1" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <Card.Header>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="outline-primary" type="submit">
                <Search size={16} />
              </Button>
              {search && (
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                    sessionStorage.removeItem(STORAGE_KEYS.SEARCH);
                    sessionStorage.removeItem(STORAGE_KEYS.PAGE);
                  }}
                >
                  Limpar
                </Button>
              )}
            </InputGroup>
          </Form>
        </Card.Header>

        <Card.Body className="p-0">
          {clientesData?.data?.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>CPF</th>
                      <th>Cidade</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesData.data.map((cliente) => (
                      <tr key={cliente.id}>
                        <td>
                          <strong>{cliente.nome}</strong>
                        </td>
                        <td>{cliente.email}</td>
                        <td>{formatTelefone(cliente.telefone)}</td>
                        <td>{formatCPF(cliente.cpf)}</td>
                        <td>{cliente.cidade}</td>
                        <td>
                          <Badge bg={cliente.ativo ? 'success' : 'secondary'}>
                            {cliente.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td>
                          {cliente.ativo ? (
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => navigateToView(navigate, `/clientes/${cliente.id}`)}
                              >
                                <Eye size={14} />
                              </Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => navigateToEdit(navigate, `/clientes/${cliente.id}/editar`)}
                              >
                                <Edit size={14} />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(cliente.id, cliente.nome)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleReativar(cliente.id, cliente.nome)}
                              title="Reativar cliente"
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
              {clientesData.pagination && (
                <div className="d-flex justify-content-between align-items-center p-3">
                  <div className="text-muted">
                    Mostrando {((clientesData.pagination.currentPage - 1) * limit) + 1} a{' '}
                    {Math.min(
                      clientesData.pagination.currentPage * limit,
                      clientesData.pagination.totalItems
                    )}{' '}
                    de {clientesData.pagination.totalItems} clientes
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
                      Página {page} de {clientesData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={page >= clientesData.pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <Search size={48} className="text-muted mb-3" />
              <h5 className="text-muted">Nenhum cliente encontrado</h5>
              <p className="text-muted">
                {search ? 'Tente ajustar os termos da busca' : 'Cadastre o primeiro cliente'}
              </p>
              {!search && (
                <Button as={Link} to="/clientes/novo" variant="primary">
                  <Plus size={16} className="me-1" />
                  Cadastrar Cliente
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default Clientes;
