import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from 'react-query';
import { authService } from '../services';
import { useNavigate } from 'react-router-dom';

function EsqueceuSenha() {
  const [email, setEmail] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation(authService.esqueceuSenha, {
    onSuccess: () => {
      setSucesso(true);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ email });
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{minHeight: '100vh', backgroundColor: '#f8f9fa'}}>
      <Card style={{width: '400px'}} className="shadow">
        <Card.Body>
          <h2 className="text-center mb-4">Recuperar Senha</h2>
          
          {sucesso ? (
            <Alert variant="success">
              Se o email existir em nosso sistema, você receberá um link de recuperação.
              <div className="mt-3 text-center">
                <Button onClick={() => navigate('/login')}>Voltar para Login</Button>
              </div>
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </Form.Group>

              <Button type="submit" className="w-100" disabled={mutation.isLoading}>
                {mutation.isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>

              <div className="text-center mt-3">
                <Button variant="link" onClick={() => navigate('/login')}>
                  Voltar para Login
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default EsqueceuSenha;
