import React, { useState } from 'react';
import { Card, Tabs, Tab, Form, Row, Col, Button, Table, Badge } from 'react-bootstrap';
import { useQuery } from 'react-query';
import { agendamentoService, clienteService, tatuadorService } from '../services';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  DollarSign,
  Users,
  TrendingUp,
  FileText
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function Relatorios() {
  const [dataInicio, setDataInicio] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [dataFim, setDataFim] = useState(moment().endOf('month').format('YYYY-MM-DD'));

  // Queries
  const { data: agendamentosData } = useQuery(
    ['relatorios-agendamentos', { dataInicio, dataFim }],
    () => agendamentoService.getAgendamentos({ dataInicio, dataFim })
  );

  const { data: clientesData } = useQuery('relatorios-clientes', () =>
    clienteService.getClientes()
  );

  const { data: tatuadoresData } = useQuery('relatorios-tatuadores', () =>
    tatuadorService.getTatuadores()
  );

  // Garante que agendamentos seja sempre um array
  const agendamentos = Array.isArray(agendamentosData?.data)
    ? agendamentosData.data
    : (Array.isArray(agendamentosData) ? agendamentosData : []);
  const clientes = clientesData?.data || [];
  const tatuadores = tatuadoresData?.data || [];

  // Cores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // ========== DASHBOARD - MÉTRICAS GERAIS ==========
  const calcularMetricasDashboard = () => {
    const totalAgendamentos = agendamentos.length;
    const concluidos = agendamentos.filter(a => a.status === 'concluido').length;
    const cancelados = agendamentos.filter(a => a.status === 'cancelado').length;
    const faturamento = agendamentos
      .filter(a => a.status === 'concluido')
      .reduce((sum, a) => sum + parseFloat(a.valor_estimado || 0), 0);

    // Agendamentos por dia
    const porDia = {};
    agendamentos.forEach(a => {
      const dia = moment(a.data).format('DD/MM');
      porDia[dia] = (porDia[dia] || 0) + 1;
    });

    const agendamentosPorDia = Object.entries(porDia).map(([dia, total]) => ({
      dia,
      total
    }));

    // Faturamento por dia
    const faturamentoPorDia = {};
    agendamentos
      .filter(a => a.status === 'concluido')
      .forEach(a => {
        const dia = moment(a.data).format('DD/MM');
        faturamentoPorDia[dia] = (faturamentoPorDia[dia] || 0) + parseFloat(a.valor_estimado || 0);
      });

    const faturamentoDiario = Object.entries(faturamentoPorDia).map(([dia, valor]) => ({
      dia,
      valor: parseFloat(valor.toFixed(2))
    }));

    // Status
    const porStatus = agendamentos.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(porStatus).map(([status, total]) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: total
    }));

    return {
      totalAgendamentos,
      concluidos,
      cancelados,
      faturamento,
      agendamentosPorDia,
      faturamentoDiario,
      statusData,
      taxaConclusao: totalAgendamentos > 0 ? ((concluidos / totalAgendamentos) * 100).toFixed(1) : 0
    };
  };

  // ========== RELATÓRIO DE AGENDAMENTOS ==========
  const calcularRelatorioAgendamentos = () => {
    return agendamentos.map(a => ({
      ...a,
      data_formatada: moment(a.data).format('DD/MM/YYYY'),
      valor_formatado: `R$ ${parseFloat(a.valor_estimado || 0).toFixed(2)}`
    }));
  };

  // ========== RELATÓRIO FINANCEIRO ==========
  const calcularRelatorioFinanceiro = () => {
    const agendamentosConcluidos = agendamentos.filter(a => a.status === 'concluido');
    
    const totalRecebido = agendamentosConcluidos.reduce(
      (sum, a) => sum + parseFloat(a.valor_estimado || 0),
      0
    );

    const ticketMedio = agendamentosConcluidos.length > 0
      ? totalRecebido / agendamentosConcluidos.length
      : 0;

    // Faturamento por tatuador
    const porTatuador = {};
    agendamentosConcluidos.forEach(a => {
      const nome = a.tatuador_nome || 'Sem tatuador';
      porTatuador[nome] = (porTatuador[nome] || 0) + parseFloat(a.valor_estimado || 0);
    });

    const faturamentoPorTatuador = Object.entries(porTatuador)
      .map(([nome, valor]) => ({
        nome,
        valor: parseFloat(valor.toFixed(2))
      }))
      .sort((a, b) => b.valor - a.valor);

    // Faturamento por serviço
    const porServico = {};
    agendamentosConcluidos.forEach(a => {
      const nome = a.servico_nome || 'Personalizado';
      porServico[nome] = (porServico[nome] || 0) + parseFloat(a.valor_estimado || 0);
    });

    const faturamentoPorServico = Object.entries(porServico).map(([nome, valor]) => ({
      name: nome,
      value: parseFloat(valor.toFixed(2))
    }));

    return {
      totalRecebido,
      ticketMedio,
      totalAgendamentos: agendamentosConcluidos.length,
      faturamentoPorTatuador,
      faturamentoPorServico
    };
  };

  // ========== RELATÓRIO DE TATUADORES ==========
  const calcularRelatorioTatuadores = () => {
    return tatuadores.map(t => {
      const agendamentosTatuador = agendamentos.filter(a => a.tatuador_id === t.id);
      const concluidos = agendamentosTatuador.filter(a => a.status === 'concluido');
      const faturamento = concluidos.reduce((sum, a) => sum + parseFloat(a.valor_estimado || 0), 0);

      return {
        ...t,
        total_agendamentos: agendamentosTatuador.length,
        total_concluidos: concluidos.length,
        faturamento: faturamento,
        taxa_conclusao: agendamentosTatuador.length > 0
          ? ((concluidos.length / agendamentosTatuador.length) * 100).toFixed(1)
          : 0
      };
    }).sort((a, b) => b.faturamento - a.faturamento);
  };

  // ========== RELATÓRIO DE CLIENTES ==========
  const calcularRelatorioClientes = () => {
    return clientes.map(c => {
      const agendamentosCliente = agendamentos.filter(a => a.cliente_id === c.id);
      const concluidos = agendamentosCliente.filter(a => a.status === 'concluido');
      const totalGasto = concluidos.reduce((sum, a) => sum + parseFloat(a.valor_estimado || 0), 0);

      return {
        ...c,
        total_agendamentos: agendamentosCliente.length,
        total_concluidos: concluidos.length,
        total_gasto: totalGasto,
        ultima_visita: agendamentosCliente.length > 0
          ? moment(Math.max(...agendamentosCliente.map(a => new Date(a.data)))).format('DD/MM/YYYY')
          : 'Nunca'
      };
    }).sort((a, b) => b.total_gasto - a.total_gasto);
  };

  // ========== EXPORTAÇÃO PDF ==========
  const exportarPDF = (tipo) => {
    const doc = new jsPDF();
    const titulo = `Relatório - ${tipo}`;
    const periodo = `Período: ${moment(dataInicio).format('DD/MM/YYYY')} a ${moment(dataFim).format('DD/MM/YYYY')}`;

    doc.setFontSize(18);
    doc.text(titulo, 14, 20);
    doc.setFontSize(11);
    doc.text(periodo, 14, 28);

    if (tipo === 'Dashboard') {
      const metricas = calcularMetricasDashboard();
      doc.autoTable({
        startY: 35,
        head: [['Métrica', 'Valor']],
        body: [
          ['Total de Agendamentos', metricas.totalAgendamentos],
          ['Agendamentos Concluídos', metricas.concluidos],
          ['Agendamentos Cancelados', metricas.cancelados],
          ['Taxa de Conclusão', `${metricas.taxaConclusao}%`],
          ['Faturamento Total', `R$ ${metricas.faturamento.toFixed(2)}`]
        ]
      });
    } else if (tipo === 'Agendamentos') {
      const dados = calcularRelatorioAgendamentos();
      doc.autoTable({
        startY: 35,
        head: [['Data', 'Cliente', 'Tatuador', 'Status', 'Valor']],
        body: dados.map(a => [
          a.data_formatada,
          a.cliente_nome,
          a.tatuador_nome,
          a.status,
          a.valor_formatado
        ])
      });
    } else if (tipo === 'Financeiro') {
      const dados = calcularRelatorioFinanceiro();
      doc.autoTable({
        startY: 35,
        head: [['Métrica', 'Valor']],
        body: [
          ['Total Recebido', `R$ ${dados.totalRecebido.toFixed(2)}`],
          ['Ticket Médio', `R$ ${dados.ticketMedio.toFixed(2)}`],
          ['Total de Agendamentos', dados.totalAgendamentos]
        ]
      });
      
      doc.addPage();
      doc.text('Faturamento por Tatuador', 14, 20);
      doc.autoTable({
        startY: 25,
        head: [['Tatuador', 'Faturamento']],
        body: dados.faturamentoPorTatuador.map(t => [
          t.nome,
          `R$ ${t.valor.toFixed(2)}`
        ])
      });
    } else if (tipo === 'Tatuadores') {
      const dados = calcularRelatorioTatuadores();
      doc.autoTable({
        startY: 35,
        head: [['Nome', 'Agendamentos', 'Concluídos', 'Taxa', 'Faturamento']],
        body: dados.map(t => [
          t.nome,
          t.total_agendamentos,
          t.total_concluidos,
          `${t.taxa_conclusao}%`,
          `R$ ${t.faturamento.toFixed(2)}`
        ])
      });
    } else if (tipo === 'Clientes') {
      const dados = calcularRelatorioClientes();
      doc.autoTable({
        startY: 35,
        head: [['Nome', 'Agendamentos', 'Concluídos', 'Total Gasto', 'Última Visita']],
        body: dados.map(c => [
          c.nome,
          c.total_agendamentos,
          c.total_concluidos,
          `R$ ${c.total_gasto.toFixed(2)}`,
          c.ultima_visita
        ])
      });
    }

    doc.save(`relatorio-${tipo.toLowerCase()}-${moment().format('YYYY-MM-DD')}.pdf`);
  };

  // ========== EXPORTAÇÃO CSV ==========
  const exportarCSV = (tipo) => {
    let dados = [];
    let headers = [];

    if (tipo === 'Agendamentos') {
      dados = calcularRelatorioAgendamentos();
      headers = ['Data', 'Cliente', 'Tatuador', 'Serviço', 'Status', 'Valor'];
      dados = dados.map(a => [
        a.data_formatada,
        a.cliente_nome,
        a.tatuador_nome,
        a.servico_nome || 'Personalizado',
        a.status,
        a.valor_formatado
      ]);
    } else if (tipo === 'Tatuadores') {
      dados = calcularRelatorioTatuadores();
      headers = ['Nome', 'Email', 'Telefone', 'Agendamentos', 'Concluídos', 'Taxa', 'Faturamento'];
      dados = dados.map(t => [
        t.nome,
        t.email,
        t.telefone,
        t.total_agendamentos,
        t.total_concluidos,
        `${t.taxa_conclusao}%`,
        `R$ ${t.faturamento.toFixed(2)}`
      ]);
    } else if (tipo === 'Clientes') {
      dados = calcularRelatorioClientes();
      headers = ['Nome', 'Email', 'Telefone', 'Agendamentos', 'Concluídos', 'Total Gasto', 'Última Visita'];
      dados = dados.map(c => [
        c.nome,
        c.email,
        c.telefone,
        c.total_agendamentos,
        c.total_concluidos,
        `R$ ${c.total_gasto.toFixed(2)}`,
        c.ultima_visita
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...dados.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${tipo.toLowerCase()}-${moment().format('YYYY-MM-DD')}.csv`;
    link.click();
  };

  const metricas = calcularMetricasDashboard();
  const relatorioFinanceiro = calcularRelatorioFinanceiro();
  const relatorioTatuadores = calcularRelatorioTatuadores();
  const relatorioClientes = calcularRelatorioClientes();

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">
          <BarChart3 size={32} className="me-2" />
          Relatórios e Análises
        </h1>
      </div>

      {/* Filtros de Data */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  <Calendar size={16} className="me-1" />
                  Data Início
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  <Calendar size={16} className="me-1" />
                  Data Fim
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="outline-primary"
                onClick={() => {
                  setDataInicio(moment().startOf('month').format('YYYY-MM-DD'));
                  setDataFim(moment().endOf('month').format('YYYY-MM-DD'));
                }}
              >
                Mês Atual
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs de Relatórios */}
      <Tabs defaultActiveKey="dashboard" className="mb-3">
        {/* TAB 1: DASHBOARD */}
        <Tab eventKey="dashboard" title="📊 Dashboard">
          <Row className="mb-4">
            <Col md={3}>
              <Card className="shadow-sm text-center">
                <Card.Body>
                  <Calendar size={32} className="text-primary mb-2" />
                  <h3>{metricas.totalAgendamentos}</h3>
                  <p className="text-muted mb-0">Total de Agendamentos</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm text-center">
                <Card.Body>
                  <TrendingUp size={32} className="text-success mb-2" />
                  <h3>{metricas.concluidos}</h3>
                  <p className="text-muted mb-0">Concluídos</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm text-center">
                <Card.Body>
                  <FileText size={32} className="text-info mb-2" />
                  <h3>{metricas.taxaConclusao}%</h3>
                  <p className="text-muted mb-0">Taxa de Conclusão</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm text-center">
                <Card.Body>
                  <DollarSign size={32} className="text-warning mb-2" />
                  <h3>R$ {metricas.faturamento.toFixed(2)}</h3>
                  <p className="text-muted mb-0">Faturamento</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header>
                  <strong>Agendamentos por Dia</strong>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metricas.agendamentosPorDia}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#8884d8" name="Agendamentos" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header>
                  <strong>Status dos Agendamentos</strong>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={metricas.statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {metricas.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="text-center">
            <Button variant="primary" onClick={() => exportarPDF('Dashboard')} className="me-2">
              <Download size={16} className="me-1" />
              Exportar PDF
            </Button>
          </div>
        </Tab>

        {/* TAB 2: AGENDAMENTOS */}
        <Tab eventKey="agendamentos" title="📅 Agendamentos">
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Lista de Agendamentos ({agendamentos.length})</strong>
              <div>
                <Button variant="success" size="sm" onClick={() => exportarCSV('Agendamentos')} className="me-2">
                  <Download size={16} className="me-1" />
                  CSV
                </Button>
                <Button variant="primary" size="sm" onClick={() => exportarPDF('Agendamentos')}>
                  <Download size={16} className="me-1" />
                  PDF
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
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
                    </tr>
                  </thead>
                  <tbody>
                    {calcularRelatorioAgendamentos().map((a) => (
                      <tr key={a.id}>
                        <td>{a.data_formatada}</td>
                        <td>{a.hora_inicio} - {a.hora_fim}</td>
                        <td>{a.cliente_nome}</td>
                        <td>{a.tatuador_nome}</td>
                        <td>{a.servico_nome || 'Personalizado'}</td>
                        <td>
                          <Badge bg={
                            a.status === 'concluido' ? 'success' :
                            a.status === 'cancelado' ? 'danger' :
                            a.status === 'em_andamento' ? 'primary' :
                            a.status === 'confirmado' ? 'info' : 'warning'
                          }>
                            {a.status}
                          </Badge>
                        </td>
                        <td>{a.valor_formatado}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        {/* TAB 3: FINANCEIRO */}
        <Tab eventKey="financeiro" title="💰 Financeiro">
          <Row className="mb-4">
            <Col md={4}>
              <Card className="shadow-sm text-center">
                <Card.Body>
                  <DollarSign size={32} className="text-success mb-2" />
                  <h3>R$ {relatorioFinanceiro.totalRecebido.toFixed(2)}</h3>
                  <p className="text-muted mb-0">Total Recebido</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm text-center">
                <Card.Body>
                  <TrendingUp size={32} className="text-info mb-2" />
                  <h3>R$ {relatorioFinanceiro.ticketMedio.toFixed(2)}</h3>
                  <p className="text-muted mb-0">Ticket Médio</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm text-center">
                <Card.Body>
                  <Calendar size={32} className="text-primary mb-2" />
                  <h3>{relatorioFinanceiro.totalAgendamentos}</h3>
                  <p className="text-muted mb-0">Agendamentos Pagos</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header>
                  <strong>Faturamento por Tatuador</strong>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={relatorioFinanceiro.faturamentoPorTatuador}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="valor" fill="#82ca9d" name="Faturamento (R$)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header>
                  <strong>Faturamento por Serviço</strong>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={relatorioFinanceiro.faturamentoPorServico}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {relatorioFinanceiro.faturamentoPorServico.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="text-center">
            <Button variant="primary" onClick={() => exportarPDF('Financeiro')}>
              <Download size={16} className="me-1" />
              Exportar PDF
            </Button>
          </div>
        </Tab>

        {/* TAB 4: TATUADORES */}
        <Tab eventKey="tatuadores" title="👨‍🎨 Tatuadores">
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Performance dos Tatuadores</strong>
              <div>
                <Button variant="success" size="sm" onClick={() => exportarCSV('Tatuadores')} className="me-2">
                  <Download size={16} className="me-1" />
                  CSV
                </Button>
                <Button variant="primary" size="sm" onClick={() => exportarPDF('Tatuadores')}>
                  <Download size={16} className="me-1" />
                  PDF
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Agendamentos</th>
                    <th>Concluídos</th>
                    <th>Taxa</th>
                    <th>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorioTatuadores.map((t) => (
                    <tr key={t.id}>
                      <td>{t.nome}</td>
                      <td>{t.email}</td>
                      <td>{t.telefone}</td>
                      <td>{t.total_agendamentos}</td>
                      <td>{t.total_concluidos}</td>
                      <td>
                        <Badge bg={parseFloat(t.taxa_conclusao) >= 80 ? 'success' : 'warning'}>
                          {t.taxa_conclusao}%
                        </Badge>
                      </td>
                      <td><strong>R$ {t.faturamento.toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* TAB 5: CLIENTES */}
        <Tab eventKey="clientes" title="👥 Clientes">
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Análise de Clientes</strong>
              <div>
                <Button variant="success" size="sm" onClick={() => exportarCSV('Clientes')} className="me-2">
                  <Download size={16} className="me-1" />
                  CSV
                </Button>
                <Button variant="primary" size="sm" onClick={() => exportarPDF('Clientes')}>
                  <Download size={16} className="me-1" />
                  PDF
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>Agendamentos</th>
                      <th>Concluídos</th>
                      <th>Total Gasto</th>
                      <th>Última Visita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorioClientes.map((c) => (
                      <tr key={c.id}>
                        <td>{c.nome}</td>
                        <td>{c.email}</td>
                        <td>{c.telefone}</td>
                        <td>{c.total_agendamentos}</td>
                        <td>{c.total_concluidos}</td>
                        <td><strong>R$ {c.total_gasto.toFixed(2)}</strong></td>
                        <td>{c.ultima_visita}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}

export default Relatorios;
