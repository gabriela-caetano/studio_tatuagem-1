import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { servicoService } from '../services';
import { Settings, Plus, Edit, Trash2 } from 'lucide-react';

function Servicos() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingServico, setEditingServico] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco_base: '',
    duracao_estimada: ''
  });

  const { data, isLoading, error } = useQuery('servicos', servicoService.getServicos);

  const createMutation = useMutation(
    (data) => servicoService.createServico(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('servicos');
        setShowModal(false);
        resetForm();
        alert('Serviço cadastrado com sucesso!');
      },
      onError: (error) => {
        alert('Erro ao cadastrar serviço: ' + (error.response?.data?.mensagem || error.message));
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => servicoService.updateServico(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('servicos');
        setShowModal(false);
        resetForm();
        alert('Serviço atualizado com sucesso!');
      },
      onError: (error) => {
        alert('Erro ao atualizar serviço: ' + (error.response?.data?.mensagem || error.message));
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => servicoService.deleteServico(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('servicos');
        alert('Serviço excluído com sucesso!');
      },
      onError: (error) => {
        alert('Erro ao excluir serviço: ' + (error.response?.data?.mensagem || error.message));
      }
    }
  );

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      preco_base: '',
      duracao_estimada: ''
    });
    setEditingServico(null);
  };

  const handleOpenModal = (servico = null) => {
    if (servico) {
      setEditingServico(servico);
      setFormData({
        nome: servico.nome,
        descricao: servico.descricao || '',
        preco_base: servico.preco_base || '',
        duracao_estimada: servico.duracao_estimada || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingServico) {
      updateMutation.mutate({ id: editingServico.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Deseja realmente excluir este serviço?')) {
      deleteMutation.mutate(id);
    }
  };

  const servicos = data?.data || [];

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">
          <Settings size={32} className="me-2" />
          Serviços
        </h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus size={20} className="me-2" />
          Novo Serviço
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Header>
          <strong>Lista de Serviços ({servicos.length})</strong>
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
              Erro ao carregar serviços: {error.message}
            </Alert>
          ) : servicos.length === 0 ? (
            <Alert variant="info">
              Nenhum serviço cadastrado. Clique em "Novo Serviço" para começar.
            </Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Preço Base</th>
                  <th>Duração</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {servicos.map((servico) => (
                  <tr key={servico.id}>
                    <td>{servico.nome}</td>
                    <td>{servico.descricao || '-'}</td>
                    <td>R$ {parseFloat(servico.preco_base || 0).toFixed(2)}</td>
                    <td>{servico.duracao_estimada ? `${servico.duracao_estimada} min` : '-'}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleOpenModal(servico)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(servico.id)}
                        disabled={deleteMutation.isLoading}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome *</Form.Label>
              <Form.Control
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Preço Base (R$)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.preco_base}
                onChange={(e) => setFormData({ ...formData, preco_base: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Duração Estimada (minutos)</Form.Label>
              <Form.Control
                type="number"
                value={formData.duracao_estimada}
                onChange={(e) => setFormData({ ...formData, duracao_estimada: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {createMutation.isLoading || updateMutation.isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Servicos;
