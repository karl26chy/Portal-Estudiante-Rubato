import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { GraduationCap, Calendar, Award, CheckCircle, Music, Clock, User, Loader, CalendarCheck, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import StatCard from '../../components/StatCard';
import { calcNotaFinal, formatFecha } from '../../utils/teacherUtils';
import { formatTime12h } from '../../components/forms/ClassForm';
import { getAttendance, getGrades } from '../../api/academicApi';

const mapDbClass = (c) => ({
  id: c.id,
  dbId: c.id,
  asignatura: c.asignatura,
  subject: c.asignatura,
  day: c.dia_semana,
  horario: c.horario,
  startTime: c.hora_inicio ? c.hora_inicio.substring(0, 5) : '08:00',
  endTime: c.hora_fin ? c.hora_fin.substring(0, 5) : '10:00',
  teacherName: c.profesor_nombre,
  profesor: c.profesor_nombre,
  cicloId: c.ciclo_id,
  ciclo_id: c.ciclo_id,
  cicloNombre: c.ciclo_nombre,
  cicloEstado: c.ciclo_estado,
  cicloAbierto: c.ciclo_abierto !== undefined && c.ciclo_abierto !== null ? Boolean(c.ciclo_abierto) : true
});

const teacherOf = (cls) => cls.teacherName || cls.profesor || cls.profesora || cls.director || 'Por asignar';

export default function Student() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [classesLoading, setClassesLoading] = useState(true);

  const userName = ((user?.nombre || '') + ' ' + (user?.apellido || '')).trim();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [classRes, cycleRes] = await Promise.all([
          fetch('/api/classes', { credentials: 'include' }),
          fetch('/api/cycles', { credentials: 'include' }).catch(() => null)
        ]);
        if (!classRes.ok) throw new Error('Error al cargar clases');
        const classData = await classRes.json();
        const cycleData = cycleRes && cycleRes.ok ? await cycleRes.json() : { cycles: [] };

        if (active) {
          const mappedClasses = (classData.classes || []).map(mapDbClass);
          setClasses(mappedClasses);
          const fetchedCycles = cycleData.cycles || [];
          setCycles(fetchedCycles);

          if (fetchedCycles.length > 0) {
            const activeCycle = fetchedCycles.find(c => c.estado === 'ABIERTO' && (c.is_open || c.ciclo_abierto !== false));
            setSelectedCycleId(activeCycle ? activeCycle.id : fetchedCycles[0].id);
          }
        }
      } catch (err) {
        if (active) addToast(err.message, 'error');
      } finally {
        if (active) setClassesLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const myClasses = useMemo(() => {
    if (!selectedCycleId || selectedCycleId === 'ALL') return classes;
    return classes.filter(c => Number(c.cicloId) === Number(selectedCycleId) || Number(c.ciclo_id) === Number(selectedCycleId));
  }, [classes, selectedCycleId]);

  const [subjectsData, setSubjectsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setSubjectsData({});

    if (myClasses.length === 0) {
      setSelectedClassId(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const results = await Promise.all(myClasses.map(async (c) => {
          const [attData, gradData] = await Promise.all([
            getAttendance(c.id, userName),
            getGrades(c.id, userName)
          ]);
          return [c.id, { attendance: attData.attendance || [], grades: gradData.grades || [] }];
        }));
        if (!active) return;
        const map = Object.fromEntries(results);
        setSubjectsData(map);
        setSelectedClassId(prev => prev && map[prev] ? prev : myClasses[0].id);
      } catch (err) {
        if (active) addToast(err.message, 'error');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [myClasses, userName]);

  const metrics = useMemo(() => {
    let total = 0;
    let present = 0;
    let sumFinal = 0;
    let countFinal = 0;

    Object.values(subjectsData).forEach(({ attendance, grades }) => {
      total += attendance.length;
      present += attendance.filter(a => a.asistencia === 'P').length;
      grades.forEach(g => {
        if (g.nota_final !== null && g.nota_final !== undefined) {
          sumFinal += Number(g.nota_final) || 0;
          countFinal += 1;
        }
      });
    });

    return {
      total,
      present,
      pct: total > 0 ? Math.round((present / total) * 100) : 0,
      promedio: countFinal > 0 ? Math.round((sumFinal / countFinal) * 10) / 10 : null
    };
  }, [subjectsData]);

  const selectedClass = myClasses.find(c => c.id === selectedClassId) || null;
  const selectedData = selectedClassId
    ? (subjectsData[selectedClassId] || { attendance: [], grades: [] })
    : { attendance: [], grades: [] };

  const selectedAttendancePct = selectedData.attendance.length > 0
    ? Math.round((selectedData.attendance.filter(a => a.asistencia === 'P').length / selectedData.attendance.length) * 100)
    : 0;

  const sortedAttendance = [...selectedData.attendance].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const grade = selectedData.grades[0] || null;
  const notaFinal = grade ? calcNotaFinal(grade.corte1, grade.corte2) : null;

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
                  ¡Bienvenido(a), {userName || 'Estudiante Rubato'}!
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Portal de seguimiento académico y horarios de ensayo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ciclo:</label>
              <select
                value={selectedCycleId}
                onChange={(e) => setSelectedCycleId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-purple-50 text-[#6b0060] font-bold text-xs border border-purple-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todos los ciclos</option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.estado === 'ABIERTO' && (c.is_open || c.ciclo_abierto !== false) ? 'Abierto' : 'Cerrado'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tarjetas de Indicadores Académicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Asistencia Global"
              value={loading ? '—' : `${metrics.pct}%`}
              description={`${metrics.present} de ${metrics.total} registros presentes`}
              icon={CheckCircle}
              iconColorClass="text-emerald-600"
              progressValue={loading ? '0%' : `${metrics.pct}%`}
              progressColorClass="bg-[#6b0060]"
            />

            <StatCard
              title="Promedio de notas de asignatura"
              value={loading ? '—' : (metrics.promedio !== null ? `${metrics.promedio.toFixed(1)} / 5.0` : '—')}
              description="Promedio de nota definitiva por asignatura"
              icon={Award}
              iconColorClass="text-purple-600"
              progressValue={loading || metrics.promedio === null ? '0%' : `${(metrics.promedio / 5) * 100}%`}
              progressColorClass="bg-purple-600"
            />

            <StatCard
              title="Materias asignadas"
              value={`${myClasses.length} ${myClasses.length === 1 ? 'Materia' : 'Materias'}`}
              description="Materias en las que está inscrito"
              icon={Calendar}
              iconColorClass="text-indigo-600"
              progressValue="100%"
              progressColorClass="bg-indigo-600"
            />
          </div>

          {/* Horario de Clases Inscritas */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 font-['Playfair_Display',serif]">
                <Calendar className="w-5 h-5 text-[#6b0060]" /> Horarios de Clases Programadas
              </h3>
            </div>

            {classesLoading || loading ? (
              <div className="flex flex-col items-center gap-3 py-10 text-slate-500">
                <Loader className="w-8 h-8 animate-spin text-[#6b0060]" />
                <p className="text-sm">Cargando tus materias y datos académicos...</p>
              </div>
            ) : myClasses.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Music className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No tienes materias inscritas por el momento.</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full bg-white">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Materia</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Día</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Horario</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Docente</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {myClasses.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedClassId(c.id)}
                          className={`cursor-pointer transition-colors ${
                            selectedClassId === c.id ? 'bg-purple-50 border-l-4 border-l-[#6b0060]' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                            <span className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-[#6b0060]" />
                              {c.subject || c.asignatura}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">{c.day || '—'}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#6b0060]" />
                              {c.startTime || c.endTime
                                ? `${formatTime12h(c.startTime)} - ${formatTime12h(c.endTime)}`
                                : c.horario || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                            <span className="flex items-center gap-2">
                              <User className="w-4 h-4 text-[#6b0060]" /> {teacherOf(c)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-3">
                  {myClasses.map((c) => {
                    const isSelected = selectedClassId === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedClassId(c.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#6b0060] bg-purple-50/60 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm break-words flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-[#6b0060] shrink-0" />
                              {c.subject || c.asignatura}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#6b0060]" /> {c.day || '—'}
                            </p>
                          </div>
                          <span className="text-[11px] text-[#6b0060] font-semibold shrink-0">
                            {isSelected ? 'Detalle activo' : 'Ver detalle'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Horario</p>
                            <p className="font-medium break-words flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#6b0060] shrink-0" />
                              {c.startTime || c.endTime
                                ? `${formatTime12h(c.startTime)} - ${formatTime12h(c.endTime)}`
                                : c.horario || '—'}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Docente</p>
                            <p className="font-medium break-words flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[#6b0060] shrink-0" />
                              {teacherOf(c)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Detalle Interactivo por Materia */}
          {!loading && selectedClass && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h3 className="text-lg font-bold text-slate-800 font-['Playfair_Display',serif]">
                  Detalle de {selectedClass.subject || selectedClass.asignatura}
                </h3>
                <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-[#6b0060] font-semibold text-xs border border-purple-200">
                  {selectedClass.day || 'Programado'} · {formatTime12h(selectedClass.startTime)} - {formatTime12h(selectedClass.endTime)}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Asistencia de la materia */}
                <div>
                  <div className="mb-4">
                    <StatCard
                      title="Asistencia de la materia"
                      value={`${selectedAttendancePct}%`}
                      description={`${selectedData.attendance.filter(a => a.asistencia === 'P').length} de ${selectedData.attendance.length} registros presentes`}
                      icon={CalendarCheck}
                      iconColorClass="text-emerald-600"
                      progressValue={`${selectedAttendancePct}%`}
                      progressColorClass="bg-emerald-600"
                    />
                  </div>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Historial de Asistencias
                    </p>
                    {sortedAttendance.length === 0 ? (
                      <p className="text-sm text-slate-500 py-6 text-center">
                        Aún no hay registros de asistencia para esta materia.
                      </p>
                    ) : (
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-200">
                        {sortedAttendance.map((a, i) => (
                          <div key={i} className="flex items-center justify-between py-2.5">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800">{formatFecha(a.fecha)}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                              a.asistencia === 'P' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                            }`}>
                              {a.asistencia === 'P' ? 'Presente' : 'Ausente'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Calificaciones de la materia */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Calificaciones de la asignatura
                  </h4>
                  {!grade ? (
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center text-slate-500">
                      <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">Aún no hay notas registradas para esta materia.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <span className="text-sm font-semibold text-slate-700">Nota Corte 1 (50%)</span>
                        <span className="text-xl font-black text-[#6b0060]">
                          {grade.corte1 !== null && grade.corte1 !== undefined ? Number(grade.corte1).toFixed(1) : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <span className="text-sm font-semibold text-slate-700">Nota Corte 2 (50%)</span>
                        <span className="text-xl font-black text-[#6b0060]">
                          {grade.corte2 !== null && grade.corte2 !== undefined ? Number(grade.corte2).toFixed(1) : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-[#6b0060] text-white rounded-xl p-4">
                        <span className="text-sm font-semibold">Nota Definitiva</span>
                        <span className="text-2xl font-black">
                          {notaFinal !== null && notaFinal !== undefined ? notaFinal.toFixed(1) : '—'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Nota Definitiva = (Corte 1 × 0.50) + (Corte 2 × 0.50)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
