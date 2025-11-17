import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { AlertTriangle, CheckCircle, ArrowLeft, Edit, Save } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { agendamentoService, clienteService, tatuadorService, servicoService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { navigateAfterSave, navigateBack } from '../utils/navigationHelper';

function AgendamentoForm() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  // Detecta se está em modo visualização ou edição
  const isView = id && !location.pathname.includes('/editar');
  const isEditMode = id && location.pathname.includes('/editar');

  const [formData, setFormData] = useState({
    cliente_id: '',
    tatuador_id: '',
    servico_id: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    status: 'agendado',
    valor_estimado: '',
    descricao_tatuagem: '',
    observacoes: ''
  });

  const [conflitos, setConflitos] = useState([]);
  const [verificando, setVerificando] = useState(false);
  const [isAgendamentoPastado, setIsAgendamentoPastado] = useState(false);

  // Buscar dados para edição
  const { data: agendamentoData } = useQuery(
    ['agendamento', id],
    () => agendamentoService.getAgendamentoById(id),
    { 
      enabled: isEditMode
    }
  );

  // Atualizar form quando dados do agendamento forem carregados
  useEffect(() => {
    if (agendamentoData?.agendamento) {
      const agendamento = agendamentoData.agendamento;
      // Formatar data_agendamento para YYYY-MM-DD (formato do input date)
      let dataFormatada = '';
      if (agendamento.data_agendamento) {
        dataFormatada = agendamento.data_agendamento.split('T')[0];
      }
      
      // Verificar se o agendamento já passou (considerar hora de fim)
      const dataHoraFim = new Date(`${dataFormatada}T${agendamento.hora_fim}`);
      const agora = new Date();
      const isPastado = dataHoraFim < agora;
      setIsAgendamentoPastado(isPastado);
      
      // Para agendamentos passados, ajustar o status se não for um dos permitidos
      let statusAjustado = agendamento.status || 'agendado';
      if (isPastado) {
        const statusPermitidos = ['em_andamento', 'concluido', 'cancelado'];
        if (!statusPermitidos.includes(statusAjustado)) {
          // Se o status atual não é permitido para passados, usar 'em_andamento' como padrão
          statusAjustado = 'em_andamento';
        }
      }
      
      setFormData({
        cliente_id: agendamento.cliente_id || '',
        tatuador_id: agendamento.tatuador_id || '',
        servico_id: agendamento.servico_id || '',
        data: dataFormatada,
        hora_inicio: agendamento.hora_inicio || '',
        hora_fim: agendamento.hora_fim || '',
        status: statusAjustado,
        valor_estimado: agendamento.valor_estimado || '',
        descricao_tatuagem: agendamento.descricao_tatuagem || '',
        observacoes: agendamento.observacoes || ''
      });
    }
  }, [agendamentoData]);

  // Buscar clientes
  const { data: clientesData } = useQuery('clientes', () => 
    clienteService.getClientes({ 
      limit: 1000,
      ...(isAdmin() ? {} : { ativo: 1 })
    }), {
    onSuccess: (data) => {
      //console.log('Clientes carregados:', data);
    }
  });

  // Buscar tatuadores
  const { data: tatuadoresData } = useQuery('tatuadores-form', () => 
    api.get('/tatuadores', { 
      params: isAdmin() ? {} : { ativo: 1 } 
    }).then(res => res.data),
    {
      onSuccess: (data) => {
        //console.log('Tatuadores carregados:', data);
      }
    }
  );

  // Buscar serviços
  const { data: servicosData } = useQuery('servicos-ativos', () =>
    api.get('/servicos', { params: { ativo: 1 } }).then(res => res.data),
    {
      onSuccess: (data) => {
        //console.log('Serviços carregados:', data);
      }
    }
  );

  // Mutation para salvar
  const mutation = useMutation(
    (data) => isEditMode 
      ? agendamentoService.updateAgendamento(id, data)
      : agendamentoService.createAgendamento(data),
    {
      onSuccess: () => {
        // Invalidar todas as queries de agendamentos (incluindo paginadas)
        queryClient.invalidateQueries(['agendamentos']);
        toast.success(isEditMode ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!');
        // Navegar após salvar - limpa storage
        navigateAfterSave(navigate, '/agendamentos');
      },
      onError: (error) => {
        console.error('Erro ao salvar agendamento:', error);
        console.error('Dados enviados:', formData);
        console.error('Resposta do servidor:', error.response?.data);
        
        const errorData = error.response?.data;
        
        // Se houver erros de validação específicos, exibi-los
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach(err => {
            toast.error(err);
          });
        } else {
          const errorMessage = errorData?.message || error.message || 'Erro ao salvar agendamento';
          toast.error(errorMessage);
        }
      }
    }
  );

  // Verificar disponibilidade em tempo real
  useEffect(() => {
    const verificarDisponibilidade = async () => {
      if (!formData.tatuador_id || !formData.data || !formData.hora_inicio || !formData.hora_fim) {
        setConflitos([]);
        return;
      }

      setVerificando(true);
      try {
        const params = {
          tatuadorId: formData.tatuador_id,
          data: formData.data,
          horaInicio: formData.hora_inicio,
          horaFim: formData.hora_fim
        };

        if (id) {
          params.agendamentoId = id;
        }

        const response = await api.get('/agendamentos/disponibilidade', { params });
        setConflitos(response.data.conflitos || []);
      } catch (error) {
        console.error('Erro ao verificar disponibilidade:', error);
      } finally {
        setVerificando(false);
      }
    };

    const timer = setTimeout(() => {
      verificarDisponibilidade();
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timer);
  }, [formData.tatuador_id, formData.data, formData.hora_inicio, formData.hora_fim, id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Só verificar conflitos se não for agendamento passado (pois data/hora não podem ser alteradas)
    if (!isAgendamentoPastado && conflitos.length > 0) {
      return;
    }
    
    // Para agendamentos passados, enviar apenas status e observações
    if (isAgendamentoPastado) {
      const dataToSend = {
        status: formData.status,
        observacoes: formData.observacoes || null
      };
      
      mutation.mutate(dataToSend);
      return;
    }
    
    // Para agendamentos futuros, transformar os dados para o formato esperado pelo backend
    const dataToSend = {
      cliente_id: formData.cliente_id,
      tatuador_id: formData.tatuador_id,
      servico_id: formData.servico_id || null,
      data_agendamento: formData.data, // Backend espera data_agendamento
      hora_inicio: formData.hora_inicio,
      hora_fim: formData.hora_fim || null,
      status: formData.status,
      valor_estimado: formData.valor_estimado || 0,
      descricao_tatuagem: formData.descricao_tatuagem || 'Tatuagem personalizada', // Campo obrigatório
      observacoes: formData.observacoes || null
    };
    
    mutation.mutate(dataToSend);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fade-in">
      <div className="d-flex align-items-center mb-3">
        <Button 
          variant="outline-secondary"
          className="me-3"
          onClick={() => navigateBack(navigate, '/agendamentos')}
        >
          <ArrowLeft size={16} />
        </Button>
        <h1 className="page-title mb-0">
          {isView ? 'Visualizar Agendamento' : isEditMode ? 'Editar Agendamento' : 'Novo Agendamento'}
        </h1>
        {isView && (
          <Button 
            variant="primary" 
            className="ms-auto"
            onClick={() => navigate(`/agendamentos/${id}/editar`)}
          >
            <Edit size={16} className="me-1" />
            Editar
          </Button>
        )}
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {isEditMode && isAgendamentoPastado && (
            <Alert variant="warning" className="mb-3">
              <AlertTriangle size={20} className="me-2" />
              <strong>Agendamento Passado:</strong> Este agendamento já ocorreu. Você pode atualizar o status e observações, mas a data e horário não podem ser alterados.
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cliente *</Form.Label>
                  <Form.Select
                    name="cliente_id"
                    value={formData.cliente_id}
                    onChange={handleChange}
                    required
                    disabled={isView || isAgendamentoPastado}
                  >
                    <option value="">Selecione um cliente</option>
                    {clientesData?.data?.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome} - {cliente.telefone} {!cliente.ativo && '(Inativo)'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tatuador *</Form.Label>
                  <Form.Select
                    name="tatuador_id"
                    value={formData.tatuador_id}
                    onChange={handleChange}
                    required
                    disabled={isView || isAgendamentoPastado}
                  >
                    <option value="">Selecione um tatuador</option>
                    {tatuadoresData?.data?.map(tatuador => (
                      <option key={tatuador.id} value={tatuador.id}>
                        {tatuador.nome} {!tatuador.ativo && '(Inativo)'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Serviço</Form.Label>
                  <Form.Select
                    name="servico_id"
                    value={formData.servico_id}
                    onChange={handleChange}
                    disabled={isView || isAgendamentoPastado}
                  >
                    <option value="">Serviço Personalizado</option>
                    {servicosData?.data?.map(servico => (
                      <option key={servico.id} value={servico.id}>
                        {servico.nome} - R$ {servico.preco}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Data *</Form.Label>
                  <Form.Control
                    type="date"
                    name="data"
                    value={formData.data}
                    onChange={handleChange}
                    required
                    disabled={isView || isAgendamentoPastado}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isView}
                  >
                    {isAgendamentoPastado ? (
                      // Para agendamentos passados, apenas 3 opções
                      <>
                        <option value="em_andamento">Em Andamento (necessita mais sessões)</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </>
                    ) : (
                      // Para agendamentos futuros, todas as opções
                      <>
                        <option value="agendado">Agendado</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Hora Início *</Form.Label>
                  <Form.Control
                    type="time"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleChange}
                    required
                    disabled={isView || isAgendamentoPastado}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Hora Fim *</Form.Label>
                  <Form.Control
                    type="time"
                    name="hora_fim"
                    value={formData.hora_fim}
                    onChange={handleChange}
                    required
                    disabled={isView || isAgendamentoPastado}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor Estimado</Form.Label>
                  <Form.Control
                    type="number"
                    name="valor_estimado"
                    value={formData.valor_estimado}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    disabled={isView || isAgendamentoPastado}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descrição da Tatuagem *</Form.Label>
              <Form.Control
                as="textarea"
                name="descricao_tatuagem"
                value={formData.descricao_tatuagem}
                onChange={handleChange}
                rows={3}
                placeholder="Descreva a tatuagem desejada (mínimo 5 caracteres)..."
                required
                minLength={5}
                disabled={isView || isAgendamentoPastado}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as="textarea"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={3}
                placeholder="Informações adicionais..."
                disabled={isView}
              />
            </Form.Group>

            {/* Alert de verificação */}
            {!isAgendamentoPastado && verificando && (
              <Alert variant="info" className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-2" />
                Verificando disponibilidade...
              </Alert>
            )}

            {/* Alert de conflito */}
            {!isAgendamentoPastado && !verificando && conflitos.length > 0 && (
              <Alert variant="danger">
                <AlertTriangle size={20} className="me-2" />
                <strong>Conflito de Horário!</strong>
                <p className="mb-2 mt-2">Já existe(m) {conflitos.length} agendamento(s) neste horário:</p>
                <ul className="mb-0">
                  {conflitos.map(c => (
                    <li key={c.id}>
                      <strong>{c.hora_inicio} - {c.hora_fim}</strong>: {c.cliente_nome} ({c.status})
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Alert de disponível */}
            {!isAgendamentoPastado && !verificando && conflitos.length === 0 && formData.tatuador_id && formData.data && formData.hora_inicio && formData.hora_fim && (
              <Alert variant="success">
                <CheckCircle size={20} className="me-2" />
                Horário disponível!
              </Alert>
            )}

            {!isView && (
              <div className="d-flex justify-content-end gap-2">
                <Button 
                  type="button" 
                  variant="outline-secondary"
                  onClick={() => navigateBack(navigate, '/agendamentos')}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={mutation.isLoading || (!isAgendamentoPastado && (conflitos.length > 0 || verificando))}
                >
                  <Save size={16} className="me-1" />
                  {verificando && !isAgendamentoPastado ? 'Verificando...' : 
                   mutation.isLoading ? 'Salvando...' : 
                   !isAgendamentoPastado && conflitos.length > 0 ? 'Horário Indisponível' : 
                   isAgendamentoPastado ? 'Atualizar Status' :
                   'Salvar'}
                </Button>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AgendamentoForm;
