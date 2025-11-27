import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from 'react-query';
import { authService } from '../services';
import { Lock } from 'lucide-react';

function Perfil() {
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const mutation = useMutation(authService.alterarSenha, {
    onSuccess: () => {
      setSucesso('Senha alterada com sucesso!');
      setErro('');
      setFormData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    },
    onError: (error) => {
      setErro(error.response?.data?.message || 'Erro ao alterar senha');
      setSucesso('');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (formData.novaSenha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (formData.novaSenha.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    mutation.mutate({
      senhaAtual: formData.senhaAtual,
      novaSenha: formData.novaSenha
    });
  };

  return (
    <div className="fade-in">
      <h1 className="page-title">Meu Perfil</h1>
      <Card className="shadow-sm">
        <Card.Header>
          <Lock size={20} className="me-2" />
          Alterar Senha
        </Card.Header>
        <Card.Body>
          {erro && <Alert variant="danger">{erro}</Alert>}
          {sucesso && <Alert variant="success">{sucesso}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Senha Atual</Form.Label>
              <Form.Control
                type="password"
                value={formData.senhaAtual}
                onChange={(e) => setFormData({...formData, senhaAtual: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nova Senha</Form.Label>
              <Form.Control
                type="password"
                value={formData.novaSenha}
                onChange={(e) => setFormData({...formData, novaSenha: e.target.value})}
                required
                minLength={6}
              />
              <Form.Text className="text-muted">Mínimo de 6 caracteres</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmar Nova Senha</Form.Label>
              <Form.Control
                type="password"
                value={formData.confirmarSenha}
                onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
                required
              />
            </Form.Group>

            <Button type="submit" disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Perfil;
