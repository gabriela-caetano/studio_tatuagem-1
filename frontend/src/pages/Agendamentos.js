import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Card, Table, Button, Badge, Form, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { agendamentoService } from '../services';
import { Calendar, Plus, Edit, Trash2, Filter } from 'lucide-react';
import moment from 'moment';

function Agendamentos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filtros, setFiltros] = useState({
    dataInicio: moment().startOf('month').format('YYYY-MM-DD'),
    dataFim: moment().endOf('month').format('YYYY-MM-DD'),
    status: '',
    tatuadorId: ''
  });

  const { data, isLoading, error } = useQuery(
    ['agendamentos', filtros],
    () => agendamentoService.getAgendamentos(filtros)
  );

  const deleteMutation = useMutation(
    (id) => agendamentoService.deleteAgendamento(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agendamentos');
        alert('Agendamento excluído com sucesso!');
      },
      onError: (error) => {
        alert('Erro ao excluir agendamento: ' + (error.response?.data?.mensagem || error.message));
      }
    }
  );

  const handleDelete = (id) => {
    if (window.confirm('Deseja realmente excluir este agendamento?')) {
      deleteMutation.mutate(id);
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

  const agendamentos = data?.data || [];

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">
          <Calendar size={32} className="me-2" />
          Agendamentos
        </h1>
        <Button
          variant="primary"
          onClick={() => navigate('/agendamentos/novo')}
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
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Data Fim</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
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
                className="mb-3"
                onClick={() => setFiltros({
                  dataInicio: moment().startOf('month').format('YYYY-MM-DD'),
                  dataFim: moment().endOf('month').format('YYYY-MM-DD'),
                  status: '',
                  tatuadorId: ''
                })}
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
          <strong>Lista de Agendamentos ({agendamentos.length})</strong>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : error ? (
            <Alert variant="danger">
              Erro ao carregar agendamentos: {error.message}
            </Alert>
          ) : agendamentos.length === 0 ? (
            <Alert variant="info">
              Nenhum agendamento encontrado para o período selecionado.
            </Alert>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Cliente</th>
                    <th>Tatuador</th>
                    <th>Serviço</th>
                    <th>Status</th>
                    <th>Valor</th>
                    <th>Ações</th>
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
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => navigate(`/agendamentos/${agendamento.id}/editar`)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(agendamento.id)}
                          disabled={deleteMutation.isLoading}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default Agendamentos;
