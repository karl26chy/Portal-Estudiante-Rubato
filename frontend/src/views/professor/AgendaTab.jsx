import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ClipboardCheck, GraduationCap, Save, ChevronRight, Loader } from 'lucide-react';
import { useToast } from '../../components/Toast';
import FormField from '../../components/forms/FormField';
import { formatTime12h } from '../../components/forms/ClassForm';
import { getTodayISO, formatFecha, calcNotaFinal, sortByLastName } from '../../utils/teacherUtils';
import { getAttendance, saveAttendance, getGrades, saveGrades } from '../../api/academicApi';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const getFullStudentName = (s) => `${(s.nombre || '')} ${(s.apellido || '')}`.trim();

const AttendanceBadge = ({ status }) => (
  <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
    status === 'P' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
  }`}>
    {status === 'P' ? 'Presente' : 'Ausente'}
  </span>
);

export default function AgendaTab() {
  const { addToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState({});
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Lunes');
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(getTodayISO());
  const [allAttendance, setAllAttendance] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [gradesMap, setGradesMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [savingGrades, setSavingGrades] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/classes', { credentials: 'include' });
        if (!res.ok) throw new Error('Error al cargar clases');
        const data = await res.json();
        setClasses(data.classes || []);
      } catch (err) {
        addToast(err.message, 'error');
      } finally {
        setClassesLoading(false);
      }
    })();
  }, []);

  const dayClasses = classes.filter((c) => c.dia_semana === selectedDay);
  const selectedClass = classes.find((c) => c.id === selectedClassId) || null;
  const enrolled = students[selectedClassId] || [];

  const countByDay = (day) => classes.filter((c) => c.dia_semana === day).length;

  useEffect(() => {
    if (!selectedClassId) {
      setAllAttendance([]);
      setAttendanceMap({});
      setGradesMap({});
      return;
    }

    if (students[selectedClassId]) return;

    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/classes/${selectedClassId}/students`, { credentials: 'include' });
        if (!res.ok) throw new Error('Error al cargar estudiantes');
        const data = await res.json();
        if (!active) return;
        const list = sortByLastName(data.students.map((s) => ({
          id: s.id,
          name: getFullStudentName(s),
          nombre: s.nombre,
          apellido: s.apellido,
          email: s.email
        })));
        setStudents((prev) => ({ ...prev, [selectedClassId]: list }));
      } catch (err) {
        if (active) addToast(err.message, 'error');
      }
    })();

    return () => { active = false; };
  }, [selectedClassId]);

  useEffect(() => {
    if (!selectedClassId || enrolled.length === 0) return;

    let active = true;
    setLoading(true);
    (async () => {
      try {
        const [attData, gradData] = await Promise.all([
          getAttendance(selectedClassId),
          getGrades(selectedClassId)
        ]);
        if (!active) return;
        setAllAttendance(attData.attendance || []);
        const grades = {};
        (gradData.grades || []).forEach((g) => {
          const key = g.estudiante_id || g.student_name;
          grades[key] = { corte1: g.corte1, corte2: g.corte2 };
        });
        setGradesMap(grades);
      } catch (err) {
        if (active) addToast(err.message, 'error');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [selectedClassId, enrolled.length]);

  useEffect(() => {
    const dayRecords = allAttendance.filter((r) => r.fecha === attendanceDate);
    const map = {};
    dayRecords.forEach((r) => {
      const key = r.estudiante_id || r.student_name;
      map[key] = r.asistencia;
    });
    setAttendanceMap(map);
  }, [attendanceDate, allAttendance]);

  const getStudentKey = (s) => s.id || s.name;

  const toggleAttendance = (key, value) => {
    setAttendanceMap((prev) => ({ ...prev, [key]: value }));
  };

  const handleGradeChange = (key, field, value) => {
    setGradesMap((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), [field]: value } }));
  };

  const handleSaveAttendance = async () => {
    const records = enrolled.map((s) => {
      const key = getStudentKey(s);
      return { estudianteId: s.id, studentName: s.name, present: attendanceMap[key] !== 'A' };
    });
    setSavingAttendance(true);
    try {
      await saveAttendance(selectedClassId, attendanceDate, records);
      const dayRecords = records.map((r) => ({
        estudiante_id: r.estudianteId,
        student_name: r.studentName,
        fecha: attendanceDate,
        asistencia: r.present ? 'P' : 'A'
      }));
      setAllAttendance((prev) => [...prev.filter((r) => r.fecha !== attendanceDate), ...dayRecords]);
      addToast('Asistencia guardada correctamente', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleSaveGrades = async () => {
    for (const s of enrolled) {
      const key = getStudentKey(s);
      const g = gradesMap[key] || {};
      for (const field of ['corte1', 'corte2']) {
        const v = g[field];
        if (v !== undefined && v !== null && v !== '' && (Number(v) < 1 || Number(v) > 5)) {
          addToast(`La nota de ${s.name} debe estar entre 1.0 y 5.0`, 'error');
          return;
        }
      }
    }
    const records = enrolled.map((s) => {
      const key = getStudentKey(s);
      const g = gradesMap[key] || {};
      return {
        estudianteId: s.id,
        studentName: s.name,
        corte1: g.corte1 ?? null,
        corte2: g.corte2 ?? null
      };
    });
    setSavingGrades(true);
    try {
      await saveGrades(selectedClassId, records);
      addToast('Notas guardadas correctamente', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSavingGrades(false);
    }
  };

  if (classesLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
        <Loader className="w-8 h-8 animate-spin text-[#6b0060]" />
        <p className="text-sm">Cargando clases...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 font-['Playfair_Display',serif]">
          Resumen por Día
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5">
          {DAYS.map((day) => {
            const count = countByDay(day);
            const isActive = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer text-left min-w-0 ${
                  isActive
                    ? 'border-[#6b0060] bg-[#6b0060] text-white shadow-sm'
                    : count > 0
                      ? 'border-[#6b0060]/30 bg-purple-50/60 hover:border-[#6b0060]'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <p className="text-xs font-semibold truncate">{day}</p>
                <p className={`text-[11px] mt-1 font-medium ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                  {count} clase(s)
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 font-['Playfair_Display',serif]">
            Detalle de Horario — {selectedDay}
          </h2>
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200 space-y-2.5">
            {dayClasses.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No tienes clases programadas para {selectedDay}.</p>
              </div>
            ) : (
              dayClasses.map((cls) => {
                const isActive = cls.id === selectedClassId;
                const time = cls.hora_inicio && cls.hora_fin
                  ? `${cls.hora_inicio.substring(0, 5)} - ${cls.hora_fin.substring(0, 5)}`
                  : (formatTime12h(cls.startTime) + ' - ' + formatTime12h(cls.endTime));
                return (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isActive ? 'border-[#6b0060] bg-purple-50/60 shadow-sm' : 'border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{cls.asignatura}</p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#6b0060]" />
                          {cls.horario || `${cls.dia_semana} ${time}`}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#6b0060]' : 'text-slate-300'}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 font-['Playfair_Display',serif]">
            Estudiantes Matriculados
          </h2>
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200">
            {!selectedClass ? (
              <div className="text-center py-12 text-slate-500">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">Selecciona una clase para ver sus estudiantes matriculados.</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center gap-3 py-12 text-slate-500">
                <Loader className="w-8 h-8 animate-spin text-[#6b0060]" />
                <p className="text-sm">Cargando datos de la clase...</p>
              </div>
            ) : enrolled.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-sm">Esta clase no tiene estudiantes matriculados.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  {selectedClass.asignatura} — {enrolled.length} estudiante(s)
                </p>

                <div className="space-y-4">
                  {enrolled.map((s) => {
                    const key = getStudentKey(s);
                    const present = attendanceMap[key] !== 'A';
                    const g = gradesMap[key] || {};
                    const notaFinal = calcNotaFinal(g.corte1, g.corte2);
                    return (
                      <div key={key} className="p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm break-words">{s.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {s.email || ''}
                            </p>
                          </div>
                          {attendanceMap[key] && <AttendanceBadge status={attendanceMap[key]} />}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                            <ClipboardCheck className="w-3.5 h-3.5 text-[#6b0060]" /> Asistencia
                          </span>
                          <button
                            onClick={() => toggleAttendance(key, 'P')}
                            className={`px-3 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                              present
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'
                            }`}
                          >
                            Presente
                          </button>
                          <button
                            onClick={() => toggleAttendance(key, 'A')}
                            className={`px-3 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                              !present
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-white text-slate-600 border-slate-300 hover:border-rose-400'
                            }`}
                          >
                            Ausente
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 items-end min-w-0">
                          <div className="min-w-0">
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Corte 1 (50%)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={g.corte1 ?? ''}
                              onChange={(e) => handleGradeChange(key, 'corte1', e.target.value)}
                              className="w-full min-w-0 px-2.5 py-1.5 text-sm font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20"
                              placeholder="1.0 - 5.0"
                            />
                          </div>
                          <div className="min-w-0">
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Corte 2 (50%)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={g.corte2 ?? ''}
                              onChange={(e) => handleGradeChange(key, 'corte2', e.target.value)}
                              className="w-full min-w-0 px-2.5 py-1.5 text-sm font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20"
                              placeholder="1.0 - 5.0"
                            />
                          </div>
                          <div className="min-w-0">
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Nota Final
                            </label>
                            <div className={`w-full min-w-0 px-2.5 py-1.5 text-sm font-bold rounded-lg text-center ${
                              notaFinal !== null ? 'bg-purple-100 text-[#6b0060]' : 'bg-slate-50 text-slate-400'
                            }`}>
                              {notaFinal !== null ? notaFinal.toFixed(1) : '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  <FormField
                    label="Fecha de asistencia"
                    name="attendanceDate"
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    icon={Calendar}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleSaveAttendance}
                      disabled={savingAttendance}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingAttendance ? 'Guardando...' : `Guardar Asistencia (${formatFecha(attendanceDate)})`}</span>
                    </button>
                    <button
                      onClick={handleSaveGrades}
                      disabled={savingGrades}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#6b0060] hover:bg-[#52004a] rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>{savingGrades ? 'Guardando...' : 'Guardar Notas'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
