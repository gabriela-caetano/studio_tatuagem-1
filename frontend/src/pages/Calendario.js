import React, { useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, Badge, Modal, Button, Row, Col } from 'react-bootstrap';
import { useQuery } from 'react-query';
import { agendamentoService } from '../services';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, DollarSign, FileText, Phone, CheckCircle, Settings, PenTool } from 'lucide-react';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const messages = {
  allDay: 'Dia todo',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Atual',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Não há agendamentos neste período',
  showMore: (total) => `+ Ver mais ${total}`
};

function Calendario() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState({
    dataInicio: moment().startOf('month').format('YYYY-MM-DD'),
    dataFim: moment().endOf('month').format('YYYY-MM-DD')
  });
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data: agendamentos, isLoading } = useQuery(
    ['agendamentos-calendario', periodo],
    () => agendamentoService.getAgendamentos(periodo),
    { keepPreviousData: true }
  );

  const eventos = agendamentos?.agendamentos?.map(ag => {
    const start = moment(`${ag.data_agendamento} ${ag.hora_inicio}`, 'YYYY-MM-DD HH:mm').toDate();
    const end = moment(`${ag.data_agendamento} ${ag.hora_fim}`, 'YYYY-MM-DD HH:mm').toDate();
    return {
      id: ag.id,
      title: `${ag.cliente_nome} - ${ag.tatuador_nome}`,
      start,
      end,
      resource: ag
    };
  }) || [];

  const eventStyleGetter = (event) => {
    const colors = {
      agendado: '#ffc107',
      confirmado: '#17a2b8',
      em_andamento: '#007bff',
      concluido: '#28a745',
      cancelado: '#dc3545'
    };

    return {
      style: {
        backgroundColor: colors[event.resource.status] || '#6c757d',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleRangeChange = (range) => {
    let inicio, fim;
    
    if (Array.isArray(range)) {
      inicio = moment(range[0]).format('YYYY-MM-DD');
      fim = moment(range[range.length - 1]).format('YYYY-MM-DD');
    } else {
      inicio = moment(range.start).format('YYYY-MM-DD');
      fim = moment(range.end).format('YYYY-MM-DD');
    }

    setPeriodo({ dataInicio: inicio, dataFim: fim });
  };

  const handleSelectEvent = (event) => {
    setEventoSelecionado(event.resource);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEventoSelecionado(null);
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

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="page-title mb-0">
          <Calendar size={28} className="me-2" />
          Calendário
        </h1>
        <Button variant="primary" onClick={() => navigate('/agendamentos/novo')}>
          + Novo Agendamento
        </Button>
      </div>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <div className="mb-3">
            <strong>Legenda:</strong>
            <Badge bg="warning" className="ms-2">Agendado</Badge>
            <Badge bg="info" className="ms-2">Confirmado</Badge>
            <Badge bg="primary" className="ms-2">Em Andamento</Badge>
            <Badge bg="success" className="ms-2">Concluído</Badge>
            <Badge bg="danger" className="ms-2">Cancelado</Badge>
          </div>
          
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : (
            <div style={{ height: '600px' }}>
              <BigCalendar
                localizer={localizer}
                events={eventos}
                startAccessor="start"
                endAccessor="end"
                messages={messages}
                onRangeChange={handleRangeChange}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day', 'agenda']}
                defaultView="month"
                style={{ height: '100%' }}
                popup
              />
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Detalhes */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Calendar size={24} className="me-2" />
            Detalhes do Agendamento
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {eventoSelecionado && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <div className="d-flex align-items-center mb-3">
                    <User size={20} className="me-2 text-primary" />
                    <div>
                      <small className="text-muted d-block">Cliente</small>
                      <strong>{eventoSelecionado.cliente_nome}</strong>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <User size={20} className="me-2 text-success" />
                    <div>
                      <small className="text-muted d-block">Tatuador</small>
                      <strong>{eventoSelecionado.tatuador_nome}</strong>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center mb-3">
                    <Calendar size={20} className="me-2 text-info" />
                    <div>
                      <small className="text-muted d-block">Data</small>
                      <strong>{moment(eventoSelecionado.data_agendamento).format('DD/MM/YYYY')}</strong>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <Clock size={20} className="me-2 text-warning" />
                    <div>
                      <small className="text-muted d-block">Horário</small>
                      <strong>{eventoSelecionado.hora_inicio} - {eventoSelecionado.hora_fim}</strong>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <div className="d-flex align-items-center mb-3">
                    <Settings size={20} className="me-2 text-secondary" />
                    <div>
                      <small className="text-muted d-block">Serviço</small>
                      <strong>{eventoSelecionado.servico_nome || 'Personalizado'}</strong>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center mb-3">
                    <CheckCircle size={20} className="me-2 text-primary" />
                    <div>
                      <small className="text-muted d-block">Status</small>
                      {getStatusBadge(eventoSelecionado.status)}
                    </div>
                  </div>
                </Col>
              </Row>

              {eventoSelecionado.cliente_telefone && (
                <div className="d-flex align-items-center mb-3">
                  <Phone size={20} className="me-2 text-success" />
                  <div>
                    <small className="text-muted d-block">Telefone do Cliente</small>
                    <strong>{eventoSelecionado.cliente_telefone}</strong>
                  </div>
                </div>
              )}

              {eventoSelecionado.valor_estimado && (
                <div className="d-flex align-items-center mb-3">
                  <DollarSign size={20} className="me-2 text-success" />
                  <div>
                    <small className="text-muted d-block">Valor Estimado</small>
                    <strong>R$ {parseFloat(eventoSelecionado.valor_estimado).toFixed(2)}</strong>
                  </div>
                </div>
              )}

              {eventoSelecionado.valor_final && (
                <div className="d-flex align-items-center mb-3">
                  <DollarSign size={20} className="me-2 text-success" />
                  <div>
                    <small className="text-muted d-block">Valor Final</small>
                    <strong>R$ {parseFloat(eventoSelecionado.valor_final).toFixed(2)}</strong>
                  </div>
                </div>
              )}

              {eventoSelecionado.descricao_tatuagem && (
                <div className="d-flex align-items-start mb-3">
                  <PenTool size={20} className="me-2 text-dark mt-1" />
                  <div>
                    <small className="text-muted d-block">Descrição da Tatuagem</small>
                    <p className="mb-0">{eventoSelecionado.descricao_tatuagem}</p>
                  </div>
                </div>
              )}

              {eventoSelecionado.observacoes && (
                <div className="d-flex align-items-start mb-3">
                  <FileText size={20} className="me-2 text-muted mt-1" />
                  <div>
                    <small className="text-muted d-block">Observações</small>
                    <p className="mb-0">{eventoSelecionado.observacoes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Fechar
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              navigate(`/agendamentos/${eventoSelecionado.id}/editar`);
              handleCloseModal();
            }}
          >
            Editar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Calendario;
