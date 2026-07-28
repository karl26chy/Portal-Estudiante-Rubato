import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    <div className="min-h-screen flex flex-col justify-between bg-white relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Backgrounds convertidos a utilidades nativas */}
      <div className="absolute inset-0 flex z-0">
        {/* bg-pattern-left */}
        <div className="w-1/2 bg-[repeating-linear-gradient(45deg,#e2e8f0,#e2e8f0_10px,#cbd5e1_10px,#cbd5e1_20px),repeating-linear-gradient(-45deg,#e2e8f0,#e2e8f0_10px,#cbd5e1_10px,#cbd5e1_20px)] bg-[length:40px_40px] opacity-30"></div>
        {/* bg-pattern-right */}
        <div className="w-1/2 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_20px,rgba(148,163,184,0.15)_20px,rgba(148,163,184,0.15)_24px),repeating-linear-gradient(to_right,transparent,transparent_40px,rgba(148,163,184,0.1)_40px,rgba(148,163,184,0.1)_44px)] opacity-40"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 text-center pt-12 pb-6">
        <h1 className="text-5xl text-black mb-2 font-['Playfair_Display',serif] font-black tracking-[0.05em]">
          FUNDACIÓN RUBATO
        </h1>
        <p className="text-slate-600 text-lg font-medium">
          Portal académico y musical
        </p>
      </header>

      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md">
          {/* login-card */}
          <div className="rounded-2xl p-8 bg-white/95 backdrop-blur-[20px] border border-white/30 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)]">
            
            {/* Logo Circle */}
            <div className="text-center mb-6">
              {/* logo-circle */}
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#5b21b6] shadow-[0_10px_25px_-5px_rgba(91,33,182,0.4)]">
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C12 2 8 6 8 12C8 17 12 22 12 22C12 22 16 17 16 12C16 6 12 2 12 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-white font-bold text-xs uppercase tracking-wider block">
                  FUNDACIÓN RUBATO
                </span>
              </div>
            </div>

            {/* Títulos */}
            <h2 className="text-2xl font-bold text-black text-center mb-2 font-['Playfair_Display',serif]">
              Iniciar sesión
            </h2>
            <p className="text-sm text-slate-600 text-center mb-6">
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
                  {/* form-input */}
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Usuario"
                    className="w-full pl-11 pr-4 py-3 text-sm text-black placeholder-slate-400 bg-white border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:border-[#8b5cf6] focus:ring-[3px] focus:ring-[#8b5cf6]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  {/* form-input */}
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full pl-11 pr-4 py-3 text-sm text-black placeholder-slate-400 bg-white border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:border-[#8b5cf6] focus:ring-[3px] focus:ring-[#8b5cf6]/20"
                    required
                  />
                </div>
              </div>

              {/* submit-btn */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 bg-[#5b21b6] transition-colors duration-200 hover:bg-[#4c1d95]"
              >
                <span>{submitting ? 'Verificando...' : 'Ingresar al portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Selector de Rol */}
            <div className="mt-6">
              <div className="border border-purple-300 rounded-xl p-4 bg-white">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Modo de prueba: seleccionar rol
                </label>
                {/* role-selector */}
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-black focus:outline-none border border-[#a855f7] rounded-xl bg-white"
                >
                  <option value="" disabled>Seleccionar rol</option>
                  <option value="student">Estudiante</option>
                  <option value="professor">Profesor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {role && (
                {/* submit-btn */}
                <button
                  type="button"
                  onClick={handleQuickRoleLogin}
                  disabled={submitting}
                  className="w-full mt-3 py-3 px-4 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 bg-[#5b21b6] transition-colors duration-200 hover:bg-[#4c1d95]"
                >
                  <span>{submitting ? 'Ingresando...' : 'Ingresar al portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* JWT Info */}
          <p className="text-center text-xs text-slate-500 mt-4">
            El token JWT se generará excluyendo la contraseña y se almacenará en cookies <code className="text-purple-600">HttpOnly</code>, <code className="text-purple-600">SameSite=Strict</code>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}