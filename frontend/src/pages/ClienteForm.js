import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import { ArrowLeft, Save, Edit } from 'lucide-react';
import { clienteService } from '../services';
import { toast } from 'react-toastify';

function ClienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  // Detecta se está em modo visualização ou edição
  const isView = id && !location.pathname.includes('/editar');
  const isEdit = id && location.pathname.includes('/editar');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await clienteService.updateCliente(id, data);
        toast.success('Cliente atualizado com sucesso');
        // Invalidar cache para forçar recarregamento da lista
        queryClient.invalidateQueries('clientes');
      } else {
        await clienteService.createCliente(data);
        toast.success('Cliente cadastrado com sucesso');
        // Invalidar cache para forçar recarregamento da lista
        queryClient.invalidateQueries('clientes');
      }
      navigate('/clientes');
    } catch (error) {
      const errorData = error.response?.data;
      
      // Se houver erros de validação específicos, exibi-los
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        errorData.errors.forEach(err => {
          toast.error(err);
        });
      } else {
        // Senão, exibir mensagem genérica
        toast.error(
          errorData?.message || 
          `Erro ao ${isEdit ? 'atualizar' : 'cadastrar'} cliente`
        );
      }
    }
  };

  // Buscar dados do cliente quando estiver em modo visualização ou edição
  useEffect(() => {
    if (id) {
      setLoading(true);
      clienteService.getCliente(id)
        .then(cliente => {
          if (cliente && typeof cliente === 'object') {
            // Preencher o formulário com os dados do cliente
            Object.keys(cliente).forEach(key => {
              if (key === 'data_nascimento' && cliente[key]) {
                // Formatar data para o formato do input date (YYYY-MM-DD)
                setValue(key, cliente[key].split('T')[0]);
              } else {
                setValue(key, cliente[key]);
              }
            });
          }
        })
        .catch(error => {
          const errorData = error.response?.data;
          const errorMessage = errorData?.message || 'Erro ao carregar dados do cliente';
          toast.error(errorMessage);
          console.error('Erro:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, setValue]);

  return (
    <div className="fade-in">
      <div className="d-flex align-items-center mb-4">
        <Button as={Link} to="/clientes" variant="outline-secondary" className="me-3">
          <ArrowLeft size={16} />
        </Button>
        <h1 className="page-title mb-0">
          {isView ? 'Visualizar Cliente' : isEdit ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
        {isView && (
          <Button 
            as={Link} 
            to={`/clientes/${id}/editar`} 
            variant="primary" 
            className="ms-auto"
          >
            <Edit size={16} className="me-1" />
            Editar
          </Button>
        )}
      </div>

      {loading ? (
        <Card>
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 mb-0">Carregando dados...</p>
          </Card.Body>
        </Card>
      ) : (
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
                      disabled={isView}
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
                      disabled={isView}
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
                      disabled={isView}
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
                      disabled={isView}
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
                    <Form.Label>Data de Nascimento *</Form.Label>
                    <Form.Control
                      type="date"
                      {...register('data_nascimento', { 
                        required: 'Data de nascimento é obrigatória',
                        validate: (value) => {
                          if (!value) return 'Data de nascimento é obrigatória';
                          
                          const dataNascimento = new Date(value);
                          const hoje = new Date();
                          let idade = hoje.getFullYear() - dataNascimento.getFullYear();
                          const mesAtual = hoje.getMonth();
                          const mesNascimento = dataNascimento.getMonth();
                          
                          // Ajustar idade se ainda não fez aniversário este ano
                          if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < dataNascimento.getDate())) {
                            idade--;
                          }
                          
                          if (idade < 18) {
                            return 'Cliente deve ter no mínimo 18 anos';
                          }
                          
                          return true;
                        }
                      })}
                      isInvalid={!!errors.data_nascimento}
                      disabled={isView}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.data_nascimento?.message}
                    </Form.Control.Feedback>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Form.Label>CEP</Form.Label>
                    <Form.Control
                      type="text"
                      {...register('cep')}
                      disabled={isView}
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
                      disabled={isView}
                    />
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-3">
                    <Form.Label>Cidade</Form.Label>
                    <Form.Control
                      type="text"
                      {...register('cidade')}
                      disabled={isView}
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
                      disabled={isView}
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
                      disabled={isView}
                    />
                  </div>
                </Col>
              </Row>

              {!isView && (
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
              )}
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default ClienteForm;
