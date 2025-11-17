import React from 'react';
import { Navbar as BootstrapNavbar, Nav, NavDropdown } from 'react-bootstrap';
import { Users, Clock, User, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { navigateFromMenu } from '../../utils/navigationHelper';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="px-3">
      <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
        <User className="me-2" size={24} />
        Studio Tatuagem
      </BootstrapNavbar.Brand>
      
      <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
      <BootstrapNavbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          <Nav.Link 
            onClick={(e) => {
              e.preventDefault();
              navigateFromMenu(navigate, '/agendamentos');
            }}
            className="d-flex align-items-center"
            style={{ cursor: 'pointer' }}
          >
            <Clock className="me-1" size={18} />
            Agendamentos
          </Nav.Link>
          <Nav.Link 
            onClick={(e) => {
              e.preventDefault();
              navigateFromMenu(navigate, '/clientes');
            }}
            className="d-flex align-items-center"
            style={{ cursor: 'pointer' }}
          >
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
