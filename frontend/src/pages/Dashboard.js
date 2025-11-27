import React from 'react';
import { Card, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { useQuery } from 'react-query';
import { Calendar, Users, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { agendamentoService, relatorioService } from '../services';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function Dashboard() {
  const hoje = new Date().toISOString().split('T')[0];
  const inicioAno = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const inicioMes = new Date(new Date().setDate(1)).toISOString().split('T')[0];

  const { data: agendamentosHoje } = useQuery(['agendamentos-hoje', hoje], () => agendamentoService.getAgendamentosByDate(hoje));
  const { data: dashboardData, isLoading: loadingDashboard } = useQuery('dashboard-metrics', () => relatorioService.getDashboard());

  // Ajuste para os campos corretos do backend
  const totalClientes = dashboardData?.total_clientes ?? dashboardData?.totalClientes ?? 0;
  const totalTatuadores = dashboardData?.total_tatuadores ?? dashboardData?.totalTatuadores ?? 0;
  const agendamentosHojeCount = dashboardData?.agendamentos_hoje ?? dashboardData?.agendamentosHoje ?? agendamentosHoje?.agendamentos?.length ?? 0;
  const receitaMes = dashboardData?.estatisticas_mes_atual?.faturamento ?? dashboardData?.receitaMes ?? 0;
  const taxaConclusao = dashboardData?.estatisticas_mes_atual?.concluidos && dashboardData?.estatisticas_mes_atual?.total_agendamentos
    ? Math.round((dashboardData.estatisticas_mes_atual.concluidos / dashboardData.estatisticas_mes_atual.total_agendamentos) * 100)
    : 0;
  const { data: financeiroData } = useQuery('financeiro-chart', () => relatorioService.getFinanceiro(inicioAno, hoje));
  const { data: agendamentosData } = useQuery('agendamentos-chart', () => relatorioService.getAgendamentos({ dataInicio: inicioMes, dataFim: hoje }));

  const getStatusBadge = (status) => {
    const statusMap = { agendado: 'warning', confirmado: 'info', em_andamento: 'primary', concluido: 'success', cancelado: 'danger' };
    const statusText = { agendado: 'Agendado', confirmado: 'Confirmado', em_andamento: 'Em Andamento', concluido: 'Concluído', cancelado: 'Cancelado' };
    return <Badge bg={statusMap[status] || 'secondary'}>{statusText[status] || status}</Badge>;
  };

  const agendamentosPorStatus = agendamentosData?.porStatus ? Object.entries(agendamentosData.porStatus).map(([status, count]) => ({ name: status, value: count })) : [];
  const receitaMensal = financeiroData?.porMes || [];

  return (
    <div className="fade-in">
      <h1 className="page-title">Dashboard</h1>
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <Calendar size={32} className="text-primary mb-2" />
              <h5 className="card-title">Agendamentos Hoje</h5>
              <h2 className="text-primary">{agendamentosHojeCount}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <Users size={32} className="text-success mb-2" />
              <h5 className="card-title">Clientes Ativos</h5>
              <h2 className="text-success">{loadingDashboard ? <Spinner animation="border" size="sm" /> : totalClientes}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <DollarSign size={32} className="text-warning mb-2" />
              <h5 className="card-title">Receita do Mês</h5>
              <h2 className="text-warning">{loadingDashboard ? <Spinner animation="border" size="sm" /> : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitaMes)}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <TrendingUp size={32} className="text-info mb-2" />
              <h5 className="card-title">Taxa de Conclusão</h5>
              <h2 className="text-info">{loadingDashboard ? <Spinner animation="border" size="sm" /> : `${taxaConclusao}%`}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col lg={8} className="mb-3">
          <Card className="shadow-sm">
            <Card.Header><h5 className="mb-0">Receita Mensal</h5></Card.Header>
            <Card.Body>
              {receitaMensal.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={receitaMensal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#8884d8" name="Receita" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <div className="text-center py-5"><p className="text-muted">Nenhum dado financeiro disponível</p></div>}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Header><h5 className="mb-0">Agendamentos por Status</h5></Card.Header>
            <Card.Body>
              {agendamentosPorStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={agendamentosPorStatus} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {agendamentosPorStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="text-center py-5"><p className="text-muted">Nenhum agendamento no período</p></div>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header><h5 className="mb-0">Agendamentos de Hoje</h5></Card.Header>
            <Card.Body>
              {agendamentosHoje?.agendamentos?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Horário</th>
                        <th>Cliente</th>
                        <th>Tatuador</th>
                        <th>Serviço</th>
                        <th>Status</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agendamentosHoje.agendamentos.map((agendamento) => (
                        <tr key={agendamento.id}>
                          <td><strong>{agendamento.hora_inicio}</strong>{agendamento.hora_fim && ` - ${agendamento.hora_fim}`}</td>
                          <td><div><div>{agendamento.cliente_nome}</div><small className="text-muted">{agendamento.cliente_telefone}</small></div></td>
                          <td>{agendamento.tatuador_nome}</td>
                          <td>{agendamento.servico_nome || 'Personalizado'}</td>
                          <td>{getStatusBadge(agendamento.status)}</td>
                          <td>{agendamento.valor_estimado && `R$ ${parseFloat(agendamento.valor_estimado).toFixed(2)}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Calendar size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">Nenhum agendamento para hoje</h5>
                  <p className="text-muted">Que tal aproveitar para organizar a agenda?</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
