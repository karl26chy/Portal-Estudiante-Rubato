import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = () => {
    try {
      setLoading(true);
      const savedUser = localStorage.getItem('rubato_active_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Usuario por defecto si no hay sesión iniciada
        const defaultUser = {
          nombre: "Admin Fundación Rubato",
          usuario: "admin@rubato.org",
          role: "admin"
        };
        setUser(defaultUser);
        localStorage.setItem('rubato_active_user', JSON.stringify(defaultUser));
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

  // Función de Login conectada al backend
  const login = async (usuario, password, roleRequested = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password, roleRequested })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      const loggedUser = {
        id: data.user.id,
        nombre: data.user.nombre,
        usuario: data.user.usuario,
        role: data.user.role.toLowerCase() // Normalizar para el frontend (admin, student, professor)
      };

      setUser(loggedUser);
      localStorage.setItem('rubato_active_user', JSON.stringify(loggedUser));
      return loggedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función de Logout
  const logout = async () => {
    try {
      localStorage.removeItem('rubato_active_user');
      setUser(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
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
