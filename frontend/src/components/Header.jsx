import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDataManager } from '../context/DataManagerContext';
import { Music, LogOut, Shield, GraduationCap, UserCheck, Menu, X } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const { currentAdmin } = useDataManager();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const activeUser = user || currentAdmin;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
      case 'SuperAdmin':
      case 'Super Admin':
      case 'Gestor Académico':
      case 'Auxiliar':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-[#6b0060]">
            <Shield className="w-3.5 h-3.5" /> SuperAdmin
          </span>
        );
      case 'professor':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
            <UserCheck className="w-3.5 h-3.5" /> Docente
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-[#6b0060]">
            <GraduationCap className="w-3.5 h-3.5" /> Estudiante
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Marca / Logo */}
        <Link to={user ? `/${user.role}` : '/login'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#6b0060] flex items-center justify-center shadow-md shadow-purple-900/20 group-hover:scale-105 transition-all">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 font-['Playfair_Display',serif] tracking-tight leading-none">
              FUNDACIÓN RUBATO
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Portal académico y musical</p>
          </div>
        </Link>

        {/* Botón de Menú Móvil */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-700 hover:text-[#6b0060] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop View: Usuario Activo y Navegación */}
        <div className="hidden lg:flex items-center gap-3">
          {activeUser ? (
            <>
              {getRoleBadge(activeUser.role)}
              
              {/* Tarjeta flotante con usuario/admin activo */}
              <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-right">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[160px]">
                  {activeUser.nombre || activeUser.name}
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate max-w-[160px]">
                  {activeUser.usuario || activeUser.email}
                </p>
              </div>

              {/* Menú de Navegación Rápida */}
              <nav className="flex items-center gap-1">
                {(user?.role === 'admin' || !user) && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      location.pathname === '/admin'
                        ? 'bg-[#6b0060] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                {(user?.role === 'admin' || user?.role === 'professor' || !user) && (
                  <Link
                    to="/professor"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      location.pathname === '/professor'
                        ? 'bg-[#6b0060] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Docente
                  </Link>
                )}
                <Link
                  to="/student"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    location.pathname === '/student'
                      ? 'bg-[#6b0060] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Estudiante
                </Link>
              </nav>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-all cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#6b0060] hover:bg-[#52004a] rounded-lg shadow-sm transition-all"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-slate-200 space-y-3 pb-2 animate-in slide-in-from-top-2">
          {activeUser && (
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-800">{activeUser.nombre || activeUser.name}</p>
                <p className="text-[11px] text-slate-500">{activeUser.usuario || activeUser.email}</p>
              </div>
              <div>{getRoleBadge(activeUser.role)}</div>
            </div>
          )}

          <nav className="flex flex-col gap-1.5">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl text-center transition-all ${
                location.pathname === '/admin' ? 'bg-[#6b0060] text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Panel Admin
            </Link>
            <Link
              to="/professor"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl text-center transition-all ${
                location.pathname === '/professor' ? 'bg-[#6b0060] text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Panel Docente
            </Link>
            <Link
              to="/student"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl text-center transition-all ${
                location.pathname === '/student' ? 'bg-[#6b0060] text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Panel Estudiante
            </Link>
          </nav>

          {activeUser && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl border border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
