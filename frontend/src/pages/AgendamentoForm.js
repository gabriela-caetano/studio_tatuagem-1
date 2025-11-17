import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { agendamentoService, clienteService, tatuadorService, servicoService } from '../services';
import api from '../services/api';

function AgendamentoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

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
      enabled: isEditMode,
      onSuccess: (data) => {
        if (data?.agendamento) {
          const agendamento = data.agendamento;
          // Formatar data_agendamento para YYYY-MM-DD (formato do input date)
          let dataFormatada = '';
          if (agendamento.data_agendamento) {
            dataFormatada = agendamento.data_agendamento.split('T')[0];
          }
          
          // Verificar se o agendamento já passou (considerar hora de fim)
          const dataHoraFim = new Date(`${dataFormatada}T${agendamento.hora_fim}`);
          const agora = new Date();
          setIsAgendamentoPastado(dataHoraFim < agora);
          
          setFormData({
            cliente_id: agendamento.cliente_id || '',
            tatuador_id: agendamento.tatuador_id || '',
            servico_id: agendamento.servico_id || '',
            data: dataFormatada,
            hora_inicio: agendamento.hora_inicio || '',
            hora_fim: agendamento.hora_fim || '',
            status: agendamento.status || 'agendado',
            valor_estimado: agendamento.valor_estimado || '',
            descricao_tatuagem: agendamento.descricao_tatuagem || '',
            observacoes: agendamento.observacoes || ''
          });
        }
      }
    }
  );

  // Buscar clientes
  const { data: clientesData } = useQuery('clientes', () => clienteService.getClientes({ limit: 1000 }), {
    onSuccess: (data) => {
      console.log('📋 Clientes carregados:', data);
    }
  });

  // Buscar tatuadores
  const { data: tatuadoresData } = useQuery('tatuadores-ativos', () => 
    api.get('/tatuadores', { params: { ativo: 1 } }).then(res => res.data),
    {
      onSuccess: (data) => {
        console.log('👨‍🎨 Tatuadores carregados:', data);
      }
    }
  );

  // Buscar serviços
  const { data: servicosData } = useQuery('servicos-ativos', () =>
    api.get('/servicos', { params: { ativo: 1 } }).then(res => res.data),
    {
      onSuccess: (data) => {
        console.log('💼 Serviços carregados:', data);
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
        // Invalidar cache para forçar recarregamento da lista
        queryClient.invalidateQueries('agendamentos');
        navigate('/agendamentos');
      },
      onError: (error) => {
        console.error('❌ Erro ao salvar agendamento:', error);
        console.error('📝 Dados enviados:', formData);
        console.error('🔥 Resposta do servidor:', error.response?.data);
        
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
      
      console.log('📤 Atualizando agendamento passado (apenas status/observações):', dataToSend);
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
    
    console.log('📤 Enviando dados:', dataToSend);
    mutation.mutate(dataToSend);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fade-in">
      <h1 className="page-title">
        <Calendar size={32} className="me-2" />
        {isEditMode ? 'Editar Agendamento' : 'Novo Agendamento'}
      </h1>

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
                    disabled={isAgendamentoPastado}
                  >
                    <option value="">Selecione um cliente</option>
                    {clientesData?.data?.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome} - {cliente.telefone}
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
                    disabled={isAgendamentoPastado}
                  >
                    <option value="">Selecione um tatuador</option>
                    {tatuadoresData?.data?.map(tatuador => (
                      <option key={tatuador.id} value={tatuador.id}>
                        {tatuador.nome}
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
                    disabled={isAgendamentoPastado}
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
                    disabled={isAgendamentoPastado}
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
                    disabled={isAgendamentoPastado}
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
                    disabled={isAgendamentoPastado}
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
                    disabled={isAgendamentoPastado}
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
                disabled={isAgendamentoPastado}
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

            <div className="d-flex gap-2">
              <Button 
                type="submit" 
                variant="primary"
                disabled={mutation.isLoading || (!isAgendamentoPastado && (conflitos.length > 0 || verificando))}
              >
                {verificando && !isAgendamentoPastado ? 'Verificando...' : 
                 mutation.isLoading ? 'Salvando...' : 
                 !isAgendamentoPastado && conflitos.length > 0 ? 'Horário Indisponível' : 
                 isAgendamentoPastado ? 'Atualizar Status' :
                 'Salvar'}
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => navigate('/agendamentos')}
              >
                Cancelar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AgendamentoForm;
