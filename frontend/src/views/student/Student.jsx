import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { GraduationCap, Calendar, Award, CheckCircle, Music } from 'lucide-react';
import { useDataManager } from '../../context/DataManagerContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import ClassCard from '../../components/ClassCard';

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
            <StatCard
              title="Asistencia Global"
              value="96.5%"
              description="Cumplimiento en clases y ensayos"
              icon={CheckCircle}
              iconColorClass="text-emerald-600"
              progressValue="96.5%"
              progressColorClass="bg-[#6b0060]"
            />
            
            <StatCard
              title="Promedio Audiciones"
              value="4.75 / 5.0"
              description="Nivel técnico e interpretación"
              icon={Award}
              iconColorClass="text-purple-600"
              progressValue="95%"
              progressColorClass="bg-purple-600"
            />
            
            <StatCard
              title="Cátedras Asignadas"
              value={`${classes.length} Clases`}
              description="Instrumento principal y ensamble"
              icon={Calendar}
              iconColorClass="text-indigo-600"
              progressValue="100%"
              progressColorClass="bg-indigo-600"
            />
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
                  <ClassCard key={c.id} classData={c} />
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
