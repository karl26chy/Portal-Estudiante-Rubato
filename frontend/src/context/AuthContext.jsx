import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Habilitar envío automático de cookies HttpOnly en solicitudes Axios
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar la sesión al cargar la app llamando al endpoint /api/auth/me
  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/auth/me');
      if (res.data.authenticated) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Función de Login
  const login = async (usuario, roleRequested = null) => {
    try {
      setError(null);
      const res = await axios.post('/api/auth/login', { usuario, roleRequested });
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al iniciar sesión';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Función de Logout (Limpia la cookie HttpOnly en el servidor)
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loading,
        error,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
