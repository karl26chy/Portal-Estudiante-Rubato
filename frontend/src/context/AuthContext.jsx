import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearSession = () => {
    localStorage.removeItem('rubato_active_user');
    setUser(null);
  };

  const checkAuth = async () => {
    const savedUser = localStorage.getItem('rubato_active_user');
    try {
      setLoading(true);
      if (!savedUser) {
        setUser(null);
        return;
      }

      // Validar la sesión contra el backend (cookie JWT HttpOnly)
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          const sessionUser = {
            id: data.user.id,
            nombre: data.user.nombre,
            usuario: data.user.usuario,
            role: data.user.role.toLowerCase()
          };
          setUser(sessionUser);
          localStorage.setItem('rubato_active_user', JSON.stringify(sessionUser));
          return;
        }
      }

      if (response.status === 401 || response.status === 403) {
        // Token expirado o inválido: sesión no válida
        clearSession();
      }
      // Si hay otro error (p. ej. backend caído), conservar la sesión local
    } catch (err) {
      // Error de red: conservar la sesión local almacenada
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        clearSession();
      }
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

  // Función de Logout: invalida la cookie JWT en el servidor y limpia la sesión local
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error al cerrar sesión en el servidor:', err);
    } finally {
      clearSession();
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
