import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from 'react-query';
import { authService } from '../services';
import { useNavigate, useParams } from 'react-router-dom';

function RedefinirSenha() {
  const { token } = useParams();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation(authService.redefinirSenha, {
    onSuccess: () => {
      alert('Senha redefinida com sucesso!');
      navigate('/login');
    },
    onError: (error) => {
      setErro(error.response?.data?.message || 'Erro ao redefinir senha');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    mutation.mutate({ token, novaSenha });
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{minHeight: '100vh', backgroundColor: '#f8f9fa'}}>
      <Card style={{width: '400px'}} className="shadow">
        <Card.Body>
          <h2 className="text-center mb-4">Redefinir Senha</h2>
          
          {erro && <Alert variant="danger">{erro}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nova Senha</Form.Label>
              <Form.Control
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                minLength={6}
              />
              <Form.Text className="text-muted">Mínimo de 6 caracteres</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmar Senha</Form.Label>
              <Form.Control
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" className="w-100" disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default RedefinirSenha;
