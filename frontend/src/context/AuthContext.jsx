import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const normalizeRole = (role) => {
  const map = { 'ADMIN': 'admin', 'DOCENTE': 'professor', 'ESTUDIANTE': 'student' };
  return map[String(role).toUpperCase()] || String(role).toLowerCase();
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser({
            id: data.user.id,
            nombre: data.user.nombre,
            apellido: data.user.apellido,
            usuario: data.user.usuario,
            role: normalizeRole(data.user.role)
          });
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (usuario, password, roleRequested = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
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
        apellido: data.user.apellido,
        usuario: data.user.usuario,
        role: normalizeRole(data.user.role)
      };

      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // se ignora
    } finally {
      setUser(null);
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
