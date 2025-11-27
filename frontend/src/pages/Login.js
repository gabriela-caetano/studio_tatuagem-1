import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { LogIn, User, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      console.log('Usuário já logado, redirecionando...', user);
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Tentando fazer login...');
      const response = await login(formData.email, formData.senha);
      console.log('Login bem-sucedido:', response);
      toast.success('Login realizado com sucesso!');
      // O redirecionamento será feito pelo useEffect acima
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError(
        error.response?.data?.error || 
        'Erro ao fazer login. Verifique suas credenciais.'
      );
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="login-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={6} lg={4}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <div className="login-icon-wrapper mb-3">
                  <LogIn size={48} className="text-primary" />
                </div>
                <h2 className="fw-bold">Studio Tatuagem</h2>
                <p className="text-muted">Sistema de Gestão</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <User size={16} className="me-2" />
                    E-mail
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <Lock size={16} className="me-2" />
                    Senha
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="senha"
                    placeholder="••••••••"
                    value={formData.senha}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 py-2 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>

                <div className="text-center">
                  <Link to="/esqueceu-senha" className="text-muted small">
                    Esqueceu sua senha?
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <div className="text-center mt-3 text-muted small">
            <p>© 2025 Studio Tatuagem. Todos os direitos reservados.</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
