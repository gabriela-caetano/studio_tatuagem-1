import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { clienteService } from '../services';
import { toast } from 'react-toastify';

function Clientes() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: clientesData,
    isLoading,
    refetch
  } = useQuery(
    ['clientes', page, search],
    () => clienteService.getClientes({ page, limit, search }),
    {
      keepPreviousData: true,
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

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatTelefone = (telefone) => {
    if (!telefone) return '';
    return telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
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
        <h1 className="page-title mb-0">Clientes</h1>
        <Button as={Link} to="/clientes/novo" variant="primary">
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
                          <div className="d-flex gap-1">
                            <Button
                              as={Link}
                              to={`/clientes/${cliente.id}`}
                              variant="outline-info"
                              size="sm"
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              as={Link}
                              to={`/clientes/${cliente.id}/editar`}
                              variant="outline-warning"
                              size="sm"
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
