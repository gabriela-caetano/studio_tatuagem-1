import React from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { clienteService } from '../services';
import { toast } from 'react-toastify';

function ClienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await clienteService.updateCliente(id, data);
        toast.success('Cliente atualizado com sucesso');
      } else {
        await clienteService.createCliente(data);
        toast.success('Cliente cadastrado com sucesso');
      }
      navigate('/clientes');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        `Erro ao ${isEdit ? 'atualizar' : 'cadastrar'} cliente`
      );
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex align-items-center mb-4">
        <Button as={Link} to="/clientes" variant="outline-secondary" className="me-3">
          <ArrowLeft size={16} />
        </Button>
        <h1 className="page-title mb-0">
          {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
      </div>

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Nome *</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('nome', { required: 'Nome é obrigatório' })}
                    isInvalid={!!errors.nome}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nome?.message}
                  </Form.Control.Feedback>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    {...register('email', { 
                      required: 'Email é obrigatório',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Email inválido'
                      }
                    })}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Telefone *</Form.Label>
                  <Form.Control
                    type="tel"
                    {...register('telefone', { required: 'Telefone é obrigatório' })}
                    isInvalid={!!errors.telefone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.telefone?.message}
                  </Form.Control.Feedback>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>CPF *</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('cpf', { required: 'CPF é obrigatório' })}
                    isInvalid={!!errors.cpf}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.cpf?.message}
                  </Form.Control.Feedback>
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>Data de Nascimento</Form.Label>
                  <Form.Control
                    type="date"
                    {...register('data_nascimento')}
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Form.Label>CEP</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('cep')}
                  />
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={8}>
                <div className="mb-3">
                  <Form.Label>Endereço</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('endereco')}
                  />
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <Form.Label>Cidade</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('cidade')}
                  />
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={2}>
                <div className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('estado')}
                    maxLength={2}
                  />
                </div>
              </Col>
              <Col md={10}>
                <div className="mb-3">
                  <Form.Label>Observações</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    {...register('observacoes')}
                  />
                </div>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button 
                as={Link} 
                to="/clientes" 
                variant="outline-secondary"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={isSubmitting}
              >
                <Save size={16} className="me-1" />
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ClienteForm;
