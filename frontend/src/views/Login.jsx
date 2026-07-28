import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Music, Shield, UserCheck, GraduationCap, ArrowRight, KeyRound, Mail, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleQuickRoleLogin = async (role) => {
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
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full flex-1 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          
          {/* Main Card */}
          <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-slate-800 relative glow-indigo">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/25">
                <Music className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Iniciar Sesión</h2>
              <p className="text-xs text-slate-400 mt-1">Accede con tu cuenta institucional o usa el modo de prueba por rol</p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Custom Login Form */}
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@rubato.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contraseña</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{submitting ? 'Verificando...' : 'Ingresar al Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <span className="relative px-3 bg-slate-900 text-slate-500 text-xs font-medium uppercase tracking-wider">O selecciona un Rol de Prueba</span>
            </div>

            {/* Quick Role Simulation Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRoleLogin('admin')}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/40 hover:border-purple-500/60 text-purple-300 transition-all group cursor-pointer"
              >
                <Shield className="w-5 h-5 mb-1 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleLogin('professor')}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/40 hover:border-emerald-500/60 text-emerald-300 transition-all group cursor-pointer"
              >
                <UserCheck className="w-5 h-5 mb-1 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Profesor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleLogin('student')}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-800/40 hover:border-indigo-500/60 text-indigo-300 transition-all group cursor-pointer"
              >
                <GraduationCap className="w-5 h-5 mb-1 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Estudiante</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-4">
            El token JWT se generará excluyendo la contraseña y se almacenará en cookies <code className="text-indigo-400">HttpOnly</code>, <code className="text-indigo-400">SameSite=Strict</code>.
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}
