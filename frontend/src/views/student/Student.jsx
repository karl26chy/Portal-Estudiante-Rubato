import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { GraduationCap, Calendar, Award, CheckCircle, Clock, MapPin, User, FileText, Music } from 'lucide-react';
import { useDataManager } from '../../context/DataManagerContext';
import { useAuth } from '../../context/AuthContext';

export default function Student() {
  const { classes } = useDataManager();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Tarjeta de Bienvenida del Estudiante */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-[#6b0060]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 font-['Playfair_Display',serif]">
                  ¡Bienvenido(a), {user?.nombre || 'Estudiante Rubato'}!
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Portal de seguimiento académico y horarios de ensayo
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-[#6b0060] font-semibold text-xs border border-purple-200">
              Semestre Activo 2026-I
            </span>
          </div>

          {/* Tarjetas de Indicadores Académicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#6b0060] uppercase tracking-wider">Asistencia Global</span>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-slate-800">96.5%</p>
              <p className="text-xs text-slate-500 mt-2">Cumplimiento en clases y ensayos</p>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#6b0060] h-full w-[96.5%]" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#6b0060] uppercase tracking-wider">Promedio Audiciones</span>
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-black text-slate-800">4.75 / 5.0</p>
              <p className="text-xs text-slate-500 mt-2">Nivel técnico e interpretación</p>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-purple-600 h-full w-[95%]" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#6b0060] uppercase tracking-wider">Cátedras Asignadas</span>
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-3xl font-black text-slate-800">{classes.length} Clases</p>
              <p className="text-xs text-slate-500 mt-2">Instrumento principal y ensamble</p>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-600 h-full w-full" />
              </div>
            </div>

          </div>

          {/* Horario de Clases Inscritas */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 font-['Playfair_Display',serif]">
                <Calendar className="w-5 h-5 text-[#6b0060]" /> Horarios de Clases Programadas
              </h3>
            </div>

            {classes.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Music className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No tienes clases inscritas por el momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {classes.map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-base leading-snug">{c.subject || c.asignatura}</h4>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-[#6b0060]">
                        {c.day || 'Asignado'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#6b0060] shrink-0" />
                        <span>Alumno: <strong>{c.studentName || 'Asignado'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#6b0060] shrink-0" />
                        <span>Hora: {c.time || 'Por definir'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
