import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { servicoService } from '../services';
import { Settings, Plus, Edit, Trash2, Eye, Save } from 'lucide-react';

function Servicos() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [servicoToDelete, setServicoToDelete] = useState(null);
  const [editingServico, setEditingServico] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
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
        toast.success('Serviço cadastrado com sucesso!');
      },
      onError: (error) => {
        toast.error('Erro ao cadastrar serviço: ' + (error.response?.data?.mensagem || error.message));
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
        toast.success('Serviço atualizado com sucesso!');
      },
      onError: (error) => {
        toast.error('Erro ao atualizar serviço: ' + (error.response?.data?.mensagem || error.message));
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => servicoService.deleteServico(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('servicos');
        setShowDeleteModal(false);
        toast.success('Serviço excluído com sucesso!');
      },
      onError: (error) => {
        toast.error('Erro ao excluir serviço: ' + (error.response?.data?.mensagem || error.message));
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
    setIsViewMode(false);
  };

  const handleOpenModal = (servico = null, viewMode = false) => {
    if (servico) {
      setEditingServico(servico);
      setIsViewMode(viewMode);
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

  const handleSwitchToEdit = () => {
    setIsViewMode(false);
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

  const handleDelete = (servico) => {
    setServicoToDelete(servico);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (servicoToDelete) {
      deleteMutation.mutate(servicoToDelete.id);
    }
  };

  const servicos = data?.data || [];

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title mb-0">
          <Settings size={28} className="me-2" />
          Serviços
        </h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus size={16} className="me-1" />
          Novo Serviço
        </Button>
      </div>

      <Card>
        <Card.Header>
          <strong>Lista de Serviços ({servicos.length})</strong>
        </Card.Header>
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-3">
              <Alert variant="danger" className="mb-0">
                Erro ao carregar serviços: {error.message}
              </Alert>
            </div>
          ) : servicos.length === 0 ? (
            <div className="p-3">
              <Alert variant="info" className="mb-0">
                Nenhum serviço cadastrado. Clique em "Novo Serviço" para começar.
              </Alert>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover className="mb-0">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Preço Base</th>
                  <th>Duração</th>
                  <th style={{width: '140px'}}>Ações</th>
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
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleOpenModal(servico, true)}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleOpenModal(servico, false)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(servico)}
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
          )}
        </Card.Body>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton={!isViewMode}>
          <div className="d-flex justify-content-between align-items-center w-100">
            <Modal.Title>
              {isViewMode ? 'Visualizar Serviço' : editingServico ? 'Editar Serviço' : 'Novo Serviço'}
            </Modal.Title>
            {isViewMode && (
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleSwitchToEdit}
              >
                <Edit size={16} className="me-1" />
                Editar
              </Button>
            )}
          </div>
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
                disabled={isViewMode}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                disabled={isViewMode}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Preço Base (R$)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.preco_base}
                onChange={(e) => setFormData({ ...formData, preco_base: e.target.value })}
                disabled={isViewMode}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Duração Estimada (minutos)</Form.Label>
              <Form.Control
                type="number"
                value={formData.duracao_estimada}
                onChange={(e) => setFormData({ ...formData, duracao_estimada: e.target.value })}
                disabled={isViewMode}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            {!isViewMode && (
              <>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  <Save size={16} className="me-1" />
                  {createMutation.isLoading || updateMutation.isLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </>
            )}
            {isViewMode && (
              <Button variant="secondary" onClick={handleCloseModal}>
                Fechar
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Tem certeza que deseja excluir o serviço <strong>{servicoToDelete?.nome}</strong>?
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

export default Servicos;
