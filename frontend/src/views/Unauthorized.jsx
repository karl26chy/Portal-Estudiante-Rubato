import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      <Header />

      <main className="max-w-md mx-auto px-4 py-16 w-full flex-1 flex flex-col justify-center items-center text-center">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-white">Acceso Denegado (403)</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            No tienes los permisos requeridos para acceder a esta sección. Tu rol actual es <strong className="text-indigo-400 font-semibold">{user?.role || 'No autenticado'}</strong>.
          </p>

          <div className="pt-2">
            <Link
              to={user ? `/${user.role}` : '/login'}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a mi panel
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
