import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import ClienteForm from './pages/ClienteForm';
import Agendamentos from './pages/Agendamentos';
import AgendamentoForm from './pages/AgendamentoForm';
import Tatuadores from './pages/Tatuadores';
import TatuadorForm from './pages/TatuadorForm';
import Servicos from './pages/Servicos';
import Relatorios from './pages/Relatorios';
import Login from './pages/Login';
import LoginTatuador from './pages/LoginTatuador';
import Perfil from './pages/Perfil';
import EsqueceuSenha from './pages/EsqueceuSenha';
import RedefinirSenha from './pages/RedefinirSenha';
import Calendario from './pages/Calendario';

// Componente para proteger rotas
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Carregando...</span>
      </div>
    </div>;
  }
  
  return user ? children : <Navigate to="/login" replace />;
}

// Componente principal com layout condicional
function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="App">
      {!isLoginPage && <Navbar />}
      <Container fluid className="p-0">
        <Row className="g-0">
          {!isLoginPage && (
            <Col md={2} className="d-none d-md-block">
              <Sidebar />
            </Col>
          )}
          <Col md={isLoginPage ? 12 : 10} xs={12}>
            <div className={isLoginPage ? '' : 'main-content'}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/login-tatuador" element={<LoginTatuador />} />
                <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
                <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
                  
                <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
                <Route path="/clientes/novo" element={<PrivateRoute><ClienteForm /></PrivateRoute>} />
                <Route path="/clientes/:id" element={<PrivateRoute><ClienteForm /></PrivateRoute>} />
                <Route path="/clientes/:id/editar" element={<PrivateRoute><ClienteForm /></PrivateRoute>} />
                
                <Route path="/agendamentos" element={<PrivateRoute><Agendamentos /></PrivateRoute>} />
                <Route path="/agendamentos/novo" element={<PrivateRoute><AgendamentoForm /></PrivateRoute>} />
                <Route path="/agendamentos/:id/editar" element={<PrivateRoute><AgendamentoForm /></PrivateRoute>} />
                
                <Route path="/calendario" element={<PrivateRoute><Calendario /></PrivateRoute>} />
                
                <Route path="/tatuadores" element={<PrivateRoute><Tatuadores /></PrivateRoute>} />
                <Route path="/tatuadores/novo" element={<PrivateRoute><TatuadorForm /></PrivateRoute>} />
                <Route path="/tatuadores/:id/editar" element={<PrivateRoute><TatuadorForm /></PrivateRoute>} />
                
                <Route path="/servicos" element={<PrivateRoute><Servicos /></PrivateRoute>} />
                <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
                {/* Exemplo de dashboard para tatuador, pode ser ajustado depois */}
                <Route path="/dashboard-tatuador" element={<div style={{padding:40}}><h2>Bem-vindo, Tatuador!</h2></div>} />
              </Routes>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
