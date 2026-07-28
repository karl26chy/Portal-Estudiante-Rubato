import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-indigo-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Verificando credenciales HttpOnly...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado -> redirigir a Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol del usuario no está en los roles permitidos -> redirigir a No Autorizado
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
