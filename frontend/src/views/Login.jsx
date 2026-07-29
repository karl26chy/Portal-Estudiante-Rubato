import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, ArrowRight, AlertCircle, Music } from 'lucide-react';
import Footer from '../components/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [imgError, setImgError] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      const loggedUser = await login(email);
      navigate(`/${loggedUser.role}`);
    } catch (err) {
      setErrorMessage(err.message || 'Credenciales no válidas.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickRoleLogin = async () => {
    if (!role) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      const mockEmailMap = {
        admin: 'admin@rubato.org',
        professor: 'profesor@rubato.org',
        student: 'estudiante@rubato.org'
      };
      const targetEmail = mockEmailMap[role];
      const loggedUser = await login(targetEmail, role);
      navigate(`/${loggedUser.role}`);
    } catch (err) {
      setErrorMessage(err.message || 'Error en el acceso directo de prueba.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Fondos decorativos sutiles */}
      <div className="absolute inset-0 flex z-0 opacity-40 pointer-events-none">
        <div className="w-1/2 bg-[repeating-linear-gradient(45deg,#e2e8f0,#e2e8f0_10px,#cbd5e1_10px,#cbd5e1_20px)] opacity-20"></div>
        <div className="w-1/2 bg-[repeating-linear-gradient(-45deg,#e2e8f0,#e2e8f0_10px,#cbd5e1_10px,#cbd5e1_20px)] opacity-20"></div>
      </div>

      {/* Encabezado */}
      <header className="relative z-10 text-center pt-10 pb-4">
        <h1 className="text-4xl sm:text-5xl text-[#6b0060] mb-1 font-['Playfair_Display',serif] font-black tracking-wide">
          FUNDACIÓN RUBATO
        </h1>
        <p className="text-slate-600 text-base font-medium">
          Portal académico y musical
        </p>
      </header>

      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-6">
        <div className="w-full max-w-md">

          {/* Tarjeta de Login */}
          <div className="rounded-2xl p-8 bg-white border border-slate-200 shadow-md">

            {/* Logo de la Fundación con Fallback */}
            <div className="text-center mb-6">
              {!imgError ? (
                <div className="flex items-center justify-center mx-auto mb-2 min-h-[90px]">
                  <img
                    src="/images/logo-Rubato.png"
                    alt="Logo Fundación Rubato"
                    onError={() => setImgError(true)}
                    className="max-h-24 w-auto object-contain transition-transform hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#6b0060] shadow-md shadow-purple-900/20">
                  <Music className="w-10 h-10 text-white" />
                </div>
              )}
            </div>

            {/* Títulos */}
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-1 font-['Playfair_Display',serif]">
              Iniciar sesión
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              Acceder con tu cuenta institucional
            </p>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Usuario o correo"
                    className="w-full pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-xl transition-all focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-xl transition-all focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 bg-[#6b0060] transition-colors duration-200 hover:bg-[#52004a] shadow-sm"
              >
                <span>{submitting ? 'Verificando...' : 'Ingresar al portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Selector de Rol para Modo de Prueba */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <label className="block text-xs font-semibold text-[#6b0060] uppercase tracking-wider mb-2">
                  Acceso rápido de prueba
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-800 focus:outline-none border border-purple-200 rounded-xl bg-white"
                >
                  <option value="" disabled>Seleccionar un rol para ingresar</option>
                  <option value="student">Estudiante</option>
                  <option value="professor">Profesor</option>
                  <option value="admin">Administrador</option>
                </select>

                {role && (
                  <button
                    type="button"
                    onClick={handleQuickRoleLogin}
                    disabled={submitting}
                    className="w-full mt-3 py-2.5 px-4 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 bg-[#6b0060] hover:bg-[#52004a] transition-colors"
                  >
                    <span>Ingresar como {role === 'admin' ? 'Admin' : role === 'professor' ? 'Profesor' : 'Estudiante'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Gestor Académico y Musical - Fundación Rubato 🎵
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}