import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Music, LogOut, Shield, GraduationCap, UserCheck, Activity } from 'lucide-react';
import axios from 'axios';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    axios.get('/api/health')
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Shield className="w-3.5 h-3.5" /> Administrador
          </span>
        );
      case 'professor':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <UserCheck className="w-3.5 h-3.5" /> Profesor
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <GraduationCap className="w-3.5 h-3.5" /> Estudiante
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand Header */}
        <Link to={user ? `/${user.role}` : '/login'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              Fundación Rubato
            </h1>
            <p className="text-xs text-slate-400 font-medium">Portal Académico y Musical</p>
          </div>
        </Link>

        {/* Right Navigation & Status */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-slate-900/80 border border-slate-800 text-slate-400">
            <Activity className={`w-3.5 h-3.5 ${apiStatus === 'online' ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`} />
            <span>{apiStatus === 'online' ? 'API Conectada' : 'Servidor Desconectado'}</span>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              {getRoleBadge(user.role)}
              
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-white leading-tight">{user.nombre}</p>
                <p className="text-xs text-slate-400">{user.usuario}</p>
              </div>

              {/* Navigation Links for Authenticated Users */}
              <nav className="flex items-center gap-1">
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      location.pathname === '/admin'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                {(user.role === 'admin' || user.role === 'professor') && (
                  <Link
                    to="/professor"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      location.pathname === '/professor'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Docente
                  </Link>
                )}
                <Link
                  to="/student"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    location.pathname === '/student'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Estudiante
                </Link>
              </nav>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-rose-400 bg-slate-900/80 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-lg transition-all ml-1 cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
