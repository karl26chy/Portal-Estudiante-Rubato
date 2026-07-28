import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Hero from '../../components/Hero';
import Footer from '../../components/Footer';
import { UserCheck, BookOpen, Plus, Award, CheckCircle2, Clock, MapPin } from 'lucide-react';
import axios from 'axios';

export default function Professor() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [asignatura, setAsignatura] = useState('');
  const [horario, setHorario] = useState('');
  const [aula, setAula] = useState('');

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/classes');
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!asignatura) return;

    try {
      const res = await axios.post('/api/classes', { asignatura, horario, aula });
      setClasses([...classes, res.data.newClass]);
      setAsignatura('');
      setHorario('');
      setAula('');
    } catch (err) {
      console.error('Error al crear clase:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full flex-1">
        <Hero
          title="Portal Docente y Evaluación 🎼"
          subtitle="Gestión de cátedras de instrumento, asignación de horarios de ensayo y registro de calificaciones de audición."
          roleTag="Vista Exclusiva de Profesor / Maestro"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Create New Class Form */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 h-fit">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Programar Cátedra o Ensayos
            </h3>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de la Asignatura</label>
                <input
                  type="text"
                  value={asignatura}
                  onChange={(e) => setAsignatura(e.target.value)}
                  placeholder="Ej: Técnica Vocal / Violín II"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Horarios de Ensayo</label>
                <input
                  type="text"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  placeholder="Ej: Lunes 11:00 AM - 01:00 PM"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Aula / Sala de Música</label>
                <input
                  type="text"
                  value={aula}
                  onChange={(e) => setAula(e.target.value)}
                  placeholder="Ej: Sala Piano #2"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md shadow-emerald-600/30 transition-all cursor-pointer text-sm"
              >
                Publicar Horario
              </button>
            </form>
          </div>

          {/* Managed Classes List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" /> Mis Asignaturas Asignadas
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                {classes.length} Cátedras
              </span>
            </div>

            {loading ? (
              <p className="text-sm text-slate-400 py-6 text-center">Cargando asignaturas...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((c) => (
                  <div key={c.id} className="glass-card p-5 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-white text-base leading-snug">{c.asignatura}</h4>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Activa
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{c.horario}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{c.aula}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Docente: {c.profesor || c.director}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Promedio Calificación: <strong className="text-emerald-400 font-bold">{c.nota}</strong></span>
                      <button className="text-emerald-400 hover:underline font-semibold cursor-pointer">
                        Evaluar Alumnos →
                      </button>
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
