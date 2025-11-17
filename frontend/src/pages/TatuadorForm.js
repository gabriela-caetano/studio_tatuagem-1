import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useQueryClient } from 'react-query';
import { Save, ArrowLeft, Edit } from 'lucide-react';
import { tatuadorService } from '../services';
import { toast } from 'react-toastify';

function TatuadorForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  // Detecta se está em modo visualização ou edição
  const isView = id && !location.pathname.includes('/editar');
  const isEdit = id && location.pathname.includes('/editar');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    especialidades: '',
    portfolio_url: '',
    valor_hora: '',
    disponibilidade: {
      segunda: { ativo: false, inicio: '09:00', fim: '18:00' },
      terca: { ativo: false, inicio: '09:00', fim: '18:00' },
      quarta: { ativo: false, inicio: '09:00', fim: '18:00' },
      quinta: { ativo: false, inicio: '09:00', fim: '18:00' },
      sexta: { ativo: false, inicio: '09:00', fim: '18:00' },
      sabado: { ativo: false, inicio: '09:00', fim: '18:00' },
      domingo: { ativo: false, inicio: '09:00', fim: '18:00' },
    },
  });

  useEffect(() => {
    if (id && (isEdit || isView)) {
      loadTatuador();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, isView]);

  const loadTatuador = async () => {
    try {
      setLoading(true);
      const response = await tatuadorService.getTatuadorById(id);
      const tatuador = response?.tatuador || response?.data;
      
      if (!tatuador) {
        setError('Tatuador não encontrado');
        toast.error('Tatuador não encontrado');
        return;
      }
      // Parse disponibilidade se for string
      const disponibilidade = typeof tatuador.disponibilidade === 'string'
        ? JSON.parse(tatuador.disponibilidade)
        : tatuador.disponibilidade;

      setFormData({
        ...tatuador,
        disponibilidade: disponibilidade || formData.disponibilidade,
      });
    } catch (error) {
      console.error('Erro ao carregar tatuador:', error);
      toast.error('Erro ao carregar dados do tatuador');
      setError('Erro ao carregar dados do tatuador');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDisponibilidadeChange = (dia, field, value) => {
    setFormData({
      ...formData,
      disponibilidade: {
        ...formData.disponibilidade,
        [dia]: {
          ...formData.disponibilidade[dia],
          [field]: field === 'ativo' ? !formData.disponibilidade[dia].ativo : value,
        },
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSend = {
        ...formData,
        valor_hora: parseFloat(formData.valor_hora) || 0,
        // Enviar disponibilidade como objeto, não como string
        disponibilidade: formData.disponibilidade || {},
      };

      if (isEdit) {
        const result = await tatuadorService.updateTatuador(id, dataToSend);
        toast.success('Tatuador atualizado com sucesso!');
        // Invalidar cache para forçar recarregamento da lista
        queryClient.invalidateQueries('tatuadores');
      } else {
        const result = await tatuadorService.createTatuador(dataToSend);
        toast.success('Tatuador cadastrado com sucesso!');
        // Invalidar cache para forçar recarregamento da lista
        queryClient.invalidateQueries('tatuadores');
      }
      navigate('/tatuadores');
    } catch (error) {
      console.error('Erro ao salvar tatuador:', error);
      console.error('Response:', error.response);
      
      const errorData = error.response?.data;
      
      // Se houver erros de validação específicos, exibi-los
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.join('\n');
        setError(errorMessages);
        errorData.errors.forEach(err => {
          toast.error(err);
        });
      } else {
        // Capturar mensagem de erro específica do backend
        let errorMessage = 'Erro ao salvar tatuador. Verifique os dados e tente novamente.';
        
        if (error.response?.status === 409) {
          errorMessage = errorData?.message || 'Este email ou telefone já está cadastrado.';
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const diasSemana = [
    { key: 'segunda', label: 'Segunda-feira' },
    { key: 'terca', label: 'Terça-feira' },
    { key: 'quarta', label: 'Quarta-feira' },
    { key: 'quinta', label: 'Quinta-feira' },
    { key: 'sexta', label: 'Sexta-feira' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' },
  ];

  return (
    <div className="fade-in">
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="outline-secondary"
          className="me-3"
          onClick={() => navigate('/tatuadores')}
        >
          <ArrowLeft size={16} />
        </Button>
        <h1 className="page-title mb-0">
          {isView ? 'Visualizar Tatuador' : isEdit ? 'Editar Tatuador' : 'Novo Tatuador'}
        </h1>
        {isView && (
          <Button 
            variant="primary" 
            className="ms-auto"
            onClick={() => navigate(`/tatuadores/${id}/editar`)}
          >
            <Edit size={16} className="me-1" />
            Editar
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card className="mb-3">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome Completo *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    disabled={isView || loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>E-mail *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isView || loading}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>CPF *</Form.Label>
                  <Form.Control
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    required
                    disabled={isView || loading}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Telefone *</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    required
                    disabled={isView || loading}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor por Hora (R$) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="valor_hora"
                    value={formData.valor_hora}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    disabled={isView || loading}
                  />
                </Form.Group>
              </Col>
            </Row>
          
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Especialidades</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="especialidades"
                    value={formData.especialidades}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Ex: Realismo, Aquarela, Tribal..."
                    disabled={isView || loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>URL do Portfólio</Form.Label>
                  <Form.Control
                    type="url"
                    name="portfolio_url"
                    value={formData.portfolio_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    disabled={isView || loading}
                  />
                </Form.Group>
              </Col>
            </Row>
          
            <h5 className="mb-0">Disponibilidade Semanal</h5>
            {diasSemana.map((dia) => (
              <Row key={dia.key} className="mb-3 align-items-center">
                <Col md={4}>
                  <Form.Check
                    type="checkbox"
                    id={`disponibilidade-${dia.key}`}
                    label={dia.label}
                    checked={formData.disponibilidade[dia.key].ativo}
                    onChange={() => handleDisponibilidadeChange(dia.key, 'ativo')}
                    disabled={isView || loading}
                  />
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small">Horário Início</Form.Label>
                    <Form.Control
                      type="time"
                      value={formData.disponibilidade[dia.key].inicio}
                      onChange={(e) =>
                        handleDisponibilidadeChange(dia.key, 'inicio', e.target.value)
                      }
                      disabled={isView || !formData.disponibilidade[dia.key].ativo || loading}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small">Horário Fim</Form.Label>
                    <Form.Control
                      type="time"
                      value={formData.disponibilidade[dia.key].fim}
                      onChange={(e) =>
                        handleDisponibilidadeChange(dia.key, 'fim', e.target.value)
                      }
                      disabled={isView || !formData.disponibilidade[dia.key].ativo || loading}
                    />
                  </Form.Group>
                </Col>
              </Row>
            ))}

            {!isView && (
              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/tatuadores')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  <Save size={18} className="me-2" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default TatuadorForm;
