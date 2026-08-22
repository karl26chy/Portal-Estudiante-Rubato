import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, ArrowRight, AlertCircle, Music } from 'lucide-react';
import Footer from '../components/Footer';
import FormField from '../components/forms/FormField';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [imgError, setImgError] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Ingresa tu usuario y contraseña.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const loggedUser = await login(email, password);
      navigate(`/${loggedUser.role}`);
    } catch (err) {
      setErrorMessage(err.message || 'Credenciales no válidas.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 relative overflow-hidden font-sans">
      {/* Background images: vbg-login.jpeg on mobile, hbg-login.jpeg on desktop */}
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-[url('/backgrounds/vbg_login.png')] sm:bg-[url('/backgrounds/hbg_login.png')]" />
      
      {/* Glassmorphic overlay to ensure text readability */}
      <div className="absolute inset-0 z-0" />


      {/* Encabezado */}
      <header className="relative z-10 text-center pt-10 pb-4">
        <h1 className="uppercase text-4xl sm:text-5xl text-[#6b0060] mb-1 font-serif font-black tracking-wide">
          conservatorio rubato
        </h1>
        <p className="text-slate-100 text-base font-medium font-sans">
          Portal Académico
        </p>
      </header>

      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-6">
        <div className="w-full max-w-md">

          {/* Tarjeta de Login */}
          <div className="rounded-2xl p-8 bg-white/40 backdrop-blur-md border border-slate-200 shadow-md">

            {/* Logo de la Fundación con Fallback */}
            <div className="text-center mb-6">
              {!imgError ? (
                <div className="flex items-center justify-center mx-auto mb-2 min-h-22.5">
                  <img
                    src="/images/rubato-logo.png"
                    alt="Logo Fundación Rubato"
                    onError={() => setImgError(true)}
                    className="max-h-36 w-auto object-contain transition-transform hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 bg-[#6b0060] shadow-md shadow-purple-900/20">
                  <Music className="w-10 h-10 text-white" />
                </div>
              )}
            </div>

            {/* Títulos */}
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-1 font-serif">
              Iniciar sesión
            </h2>
            <p className="text-sm text-slate-900 font-medium text-center mb-6">
              Accede con tus credenciales
            </p>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <FormField
                name="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={User}
                placeholder="Usuario o correo"
                className="bg-white/30 backdrop-blur-sm border-slate-300 focus:bg-white/60 placeholder:text-slate-600"
                iconColor="text-slate-900"
              />

              <FormField
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                placeholder="Contraseña"
                className="bg-white/30 backdrop-blur-sm border-slate-300 focus:bg-white/60 placeholder:text-slate-600"
                iconColor="text-slate-900"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 bg-[#6b0060]/70 transition-colors duration-200 hover:bg-[#52004a] shadow-sm"
              >
                <span>{submitting ? 'Verificando...' : 'Ingresar al portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

          </div>

          <p className="text-center text-xs text-slate-100 font-medium mt-4">
            Gestor Académico
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}