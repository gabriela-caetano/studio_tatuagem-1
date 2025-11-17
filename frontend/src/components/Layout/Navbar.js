import React from 'react';
import { Navbar as BootstrapNavbar, Nav, NavDropdown } from 'react-bootstrap';
import { Users, Calendar, User, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="px-3">
      <BootstrapNavbar.Brand href="/" className="d-flex align-items-center">
        <User className="me-2" size={24} />
        Studio Tatuagem
      </BootstrapNavbar.Brand>
      
      <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
      <BootstrapNavbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          <Nav.Link href="/agendamentos" className="d-flex align-items-center">
            <Calendar className="me-1" size={16} />
            Agendamentos
          </Nav.Link>
          <Nav.Link href="/clientes" className="d-flex align-items-center">
            <Users className="me-1" size={16} />
            Clientes
          </Nav.Link>
          
          <NavDropdown 
            title={
              <>
                <UserCircle className="me-1" size={20} style={{ verticalAlign: 'middle' }} />
                <span style={{ verticalAlign: 'middle' }}>{user?.nome || 'Usuário'}</span>
              </>
            } 
            id="user-dropdown"
            align="end"
            className="d-inline-flex align-items-center"
          >
            <NavDropdown.Item href="/perfil">
              <UserCircle className="me-2" size={16} />
              Meu Perfil
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout}>
              <LogOut className="me-2" size={16} />
              Sair
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </BootstrapNavbar.Collapse>
    </BootstrapNavbar>
  );
}

export default Navbar;
