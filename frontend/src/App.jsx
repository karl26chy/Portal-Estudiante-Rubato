import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './views/Login';
import Admin from './views/admin/Admin';
import Professor from './views/professor/Professor';
import Student from './views/student/Student';
import Unauthorized from './views/Unauthorized';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta Pública de Autenticación */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Protegidas por Rol */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/professor"
            element={
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <Professor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['admin', 'professor', 'student']}>
                <Student />
              </ProtectedRoute>
            }
          />

          {/* Acceso Denegado y Redirecciones por Defecto */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<Navigate to="/student" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
