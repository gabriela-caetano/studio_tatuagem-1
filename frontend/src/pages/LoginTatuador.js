import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { tatuadorService } from '../services';

export default function LoginTatuador() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = React.useState('');

  const mutation = useMutation(
    (data) => tatuadorService.loginTatuador(data),
    {
      onSuccess: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('tatuador', JSON.stringify(response.tatuador));
        navigate('/dashboard-tatuador');
      },
      onError: (error) => {
        setErrorMsg(error.response?.data?.message || 'Erro ao fazer login');
      }
    }
  );

  const onSubmit = (data) => {
    setErrorMsg('');
    mutation.mutate(data);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: 350 }}>
        <Card.Body>
          <h3 className="mb-4 text-center">Login Tatuador</h3>
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" {...register('email', { required: true })} isInvalid={!!errors.email} />
              {errors.email && <Form.Text className="text-danger">Email obrigatório</Form.Text>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control type="password" {...register('senha', { required: true })} isInvalid={!!errors.senha} />
              {errors.senha && <Form.Text className="text-danger">Senha obrigatória</Form.Text>}
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
