import React from 'react';
import { Music, Sparkles, BookOpen, Award, Clock } from 'lucide-react';

export default function Hero({ title, subtitle, roleTag }) {
  return (
    <section className="hero relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-10 mb-8 border border-slate-800/80 glow-indigo">
      {/* Decorative Glow Elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        {roleTag && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{roleTag}</span>
          </div>
        )}

        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
          {title || 'Portal de Música Fundación Rubato 🎶'}
        </h2>
        <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed mb-6">
          {subtitle || 'Gestión integral de horarios de instrumento, evaluaciones de audición, asistencia a ensayos y expediente académico.'}
        </p>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Clases y Ensayos</p>
              <p className="text-sm font-semibold text-white">Horarios Semanales</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Audiciones</p>
              <p className="text-sm font-semibold text-white">Calificaciones</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Asignaturas</p>
              <p className="text-sm font-semibold text-white">Asistencia Real</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
