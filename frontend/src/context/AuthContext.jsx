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

  // Función de Login desacoplada del backend
  const login = async (usuario, roleRequested = null) => {
    try {
      setError(null);
      let assignedRole = roleRequested || 'admin';
      
      // Inferir rol según correo o selección
      if (!roleRequested) {
        if (usuario.includes('profesor') || usuario.includes('docente')) {
          assignedRole = 'professor';
        } else if (usuario.includes('estudiante') || usuario.includes('student')) {
          assignedRole = 'student';
        } else {
          assignedRole = 'admin';
        }
      }

      const loggedUser = {
        nombre: usuario.split('@')[0] || usuario,
        usuario,
        role: assignedRole
      };

      setUser(loggedUser);
      localStorage.setItem('rubato_active_user', JSON.stringify(loggedUser));
      return loggedUser;
    } catch (err) {
      const msg = 'Error al iniciar sesión';
      setError(msg);
      throw new Error(msg);
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
