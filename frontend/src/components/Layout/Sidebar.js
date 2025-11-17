import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  UserCheck, 
  Settings, 
  BarChart3,
  Clock
} from 'lucide-react';
import { navigateFromMenu } from '../../utils/navigationHelper';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/clientes', icon: Users, label: 'Clientes', useNavigationHelper: true },
    { path: '/agendamentos', icon: Calendar, label: 'Agendamentos', useNavigationHelper: true },
    { path: '/calendario', icon: Clock, label: 'Calendário' },
    { path: '/tatuadores', icon: UserCheck, label: 'Tatuadores' },
    { path: '/servicos', icon: Settings, label: 'Serviços' },
    { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  ];

  // Usar navigation helper para páginas com persistência de filtros
  const handleMenuClick = (e, item) => {
    if (item.useNavigationHelper) {
      e.preventDefault();
      navigateFromMenu(navigate, item.path);
    }
  };

  return (
    <div className="sidebar">
      <div className="p-3">
        <h6 className="text-white-50 small text-uppercase mb-3">
          Menu Principal
        </h6>
        <Nav className="flex-column">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Nav.Link
                key={item.path}
                as={Link}
                to={item.path}
                onClick={(e) => handleMenuClick(e, item)}
                className={`d-flex align-items-center ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} className="me-2" />
                {item.label}
              </Nav.Link>
            );
          })}
        </Nav>
      </div>
      
      <div className="mt-auto p-3">
        <div className="text-white-50 small">
          <Clock size={16} className="me-2" />
          Sistema Online
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
