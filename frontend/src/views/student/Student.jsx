import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Hero from '../../components/Hero';
import Footer from '../../components/Footer';
import { GraduationCap, Calendar, Award, CheckCircle, Clock, MapPin, User, FileText } from 'lucide-react';
import axios from 'axios';

export default function Student() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/classes')
      .then((res) => setClasses(res.data.classes || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full flex-1">
        <Hero
          title="Mi Panel de Estudiante 🎵"
          subtitle="Consulta tus asignaturas de instrumento, registros de asistencia a ensayos y el historial de evaluaciones de audición."
          roleTag="Vista de Estudiante Rubato"
        />

        {/* Dashboard Academic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="glass-panel p-6 rounded-xl border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Asistencia Global</span>
              <CheckCircle className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">96.5%</p>
            <p className="text-xs text-slate-400 mt-2">Cumplimiento de presencia en clases y ensayos</p>
            <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[96.5%]" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Promedio Audiciones</span>
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">4.75 / 5.0</p>
            <p className="text-xs text-slate-400 mt-2">Nivel Técnico y Ejecución Instrumental</p>
            <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full w-[95%]" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Cátedras Inscritas</span>
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">{classes.length} Cursos</p>
            <p className="text-xs text-slate-400 mt-2">Instrumento principal, teoría y práctica de orquesta</p>
            <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full w-full" />
            </div>
          </div>

        </div>

        {/* Classes & Schedule Section */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" /> Horarios de Clases y Ensayos Asignados
            </h3>
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
              Semestre Activo 2026-I
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400 py-6 text-center">Cargando horario personal...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {classes.map((c) => (
                <div key={c.id} className="glass-card p-5 rounded-xl border border-slate-800/90 hover:border-indigo-500/50 transition-all space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-base leading-snug">{c.asignatura}</h4>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      Nota: {c.nota}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{c.profesor || c.director}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{c.horario}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{c.aula}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Asistencia: <strong className="text-emerald-400">{c.asistencia}</strong></span>
                    <button className="text-indigo-400 hover:underline font-medium cursor-pointer flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Ver Detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
