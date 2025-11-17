import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar se o token ainda é válido
  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    // Verificar se há um usuário logado ao carregar
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && isTokenValid(token)) {
          const userData = authService.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // Token existe mas user não, limpar
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else {
          // Token inválido ou expirado
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await authService.login(email, senha);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('AuthContext: Erro no login:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const isAdmin = () => {
    return user?.tipo === 'admin';
  };

  const isTatuador = () => {
    return user?.tipo === 'tatuador';
  };

  const isAtendente = () => {
    return user?.tipo === 'atendente';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
    isAdmin,
    isTatuador,
    isAtendente,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;
