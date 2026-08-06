import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataManagerProvider } from './context/DataManagerContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './views/Login';
import AdminDashboard from './views/admin/AdminDashboard';
import TeacherDashboard from './views/professor/TeacherDashboard';
import Student from './views/student/Student';
import Unauthorized from './views/Unauthorized';

export default function App() {
  return (
    <AuthProvider>
      <DataManagerProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Ruta Pública de Autenticación */}
              <Route path="/login" element={<Login />} />

              {/* Rutas Protegidas por Rol */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/professor"
                element={
                  <ProtectedRoute allowedRoles={['professor']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Student />
                  </ProtectedRoute>
                }
              />

              {/* Acceso Denegado y Redirecciones por Defecto */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </DataManagerProvider>
    </AuthProvider>
  );
}
