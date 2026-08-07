import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, GraduationCap, ClipboardCheck, Clock, Loader, BookOpen, Layers, Lock } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { calcNotaFinal, formatFecha, sortByLastName, getFullName } from '../../utils/teacherUtils';
import { formatTime12h } from '../../components/forms/ClassForm';
import { getAttendance, getGrades } from '../../api/academicApi';

export default function TeacherHistoryTab() {
  const { addToast } = useToast();

  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const [students, setStudents] = useState({});
  const [allAttendance, setAllAttendance] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [gradesMap, setGradesMap] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar ciclos y clases
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [cycleRes, classRes] = await Promise.all([
          fetch('/api/cycles', { credentials: 'include' }).catch(() => null),
          fetch('/api/classes', { credentials: 'include' })
        ]);
        if (!classRes.ok) throw new Error('Error al cargar clases');
        const classData = await classRes.json();
        const cycleData = cycleRes && cycleRes.ok ? await cycleRes.json() : { cycles: [] };

        if (!active) return;
        const fetchedCycles = cycleData.cycles || [];
        const fetchedClasses = classData.classes || [];

        setCycles(fetchedCycles);
        setClasses(fetchedClasses);

        const closedCycles = fetchedCycles.filter(c => c.estado === 'CERRADO' || !c.is_open || c.ciclo_abierto === false);
        if (closedCycles.length > 0) {
          setSelectedCycleId(closedCycles[0].id);
        }
      } catch (err) {
        if (active) addToast(err.message, 'error');
      } finally {
        if (active) setClassesLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const closedCycles = useMemo(() => {
    return cycles.filter(c => c.estado === 'CERRADO' || !c.is_open || c.ciclo_abierto === false);
  }, [cycles]);

  const cycleClasses = useMemo(() => {
    if (!selectedCycleId) return [];
    return classes.filter(c => Number(c.ciclo_id) === Number(selectedCycleId) || Number(c.cicloId) === Number(selectedCycleId));
  }, [classes, selectedCycleId]);

  useEffect(() => {
    if (cycleClasses.length > 0) {
      setSelectedClassId(cycleClasses[0].id);
    } else {
      setSelectedClassId(null);
    }
  }, [selectedCycleId, cycleClasses.length]);

  const selectedClass = cycleClasses.find((c) => c.id === selectedClassId) || null;
  const enrolled = students[selectedClassId] || [];

  // Cargar estudiantes de la clase
  useEffect(() => {
    if (!selectedClassId) return;
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
          name: getFullName(s),
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

  // Cargar asistencia y notas históricas
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

  const getStudentKey = (s) => s.id || s.name;

  if (classesLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
        <Loader className="w-8 h-8 animate-spin text-[#6b0060]" />
        <p className="text-sm">Cargando registros históricos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Banner de selección de Ciclo Cerrado */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-['Playfair_Display',serif]">
              Registros Históricos por Ciclo
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Consulta de clases, asistencias y calificaciones de ciclos cerrados anteriores
            </p>
          </div>
        </div>

        {closedCycles.length > 0 && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              Seleccionar ciclo:
            </label>
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 font-bold text-xs border border-amber-200 focus:outline-none cursor-pointer"
            >
              {closedCycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} (Cerrado)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {closedCycles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-200 space-y-3">
          <Layers className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No hay ciclos cerrados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Actualmente no existen ciclos académicos cerrados para consulta histórica.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listado de clases del ciclo cerrado seleccionado */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-base font-bold text-slate-800 font-['Playfair_Display',serif]">
              Clases del Ciclo ({cycleClasses.length})
            </h3>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-200 space-y-2">
              {cycleClasses.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">No tuviste clases asignadas en este ciclo.</p>
                </div>
              ) : (
                cycleClasses.map((cls) => {
                  const isActive = cls.id === selectedClassId;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isActive ? 'border-[#6b0060] bg-purple-50/60 shadow-sm' : 'border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <p className="font-bold text-slate-800 text-sm truncate">{cls.asignatura} — {cls.semestre}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#6b0060]" />
                        {cls.horario || `${cls.dia_semana} ${formatTime12h(cls.hora_inicio)} - ${formatTime12h(cls.hora_fin)}`}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Detalle de consulta histórica de la clase */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-800 font-['Playfair_Display',serif]">
              Registro Histórico de Asistencia y Notas
            </h3>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200">
              {!selectedClass ? (
                <div className="text-center py-12 text-slate-500">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">Selecciona una clase para ver su registro histórico.</p>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center gap-3 py-12 text-slate-500">
                  <Loader className="w-8 h-8 animate-spin text-[#6b0060]" />
                  <p className="text-sm">Cargando datos históricos...</p>
                </div>
              ) : enrolled.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-sm">Esta clase no registró estudiantes matriculados.</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-2 text-slate-700 text-xs font-semibold">
                    <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Registro histórico del ciclo {selectedClass.cicloNombre || selectedClass.ciclo_nombre} — Solo lectura.</span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium mb-3">
                    {selectedClass.asignatura} — {selectedClass.semestre} — {enrolled.length} estudiante(s)
                  </p>

                  <div className="space-y-4">
                    {enrolled.map((s) => {
                      const key = getStudentKey(s);
                      const g = gradesMap[key] || {};
                      const notaFinal = calcNotaFinal(g.corte1, g.corte2);
                      return (
                        <div key={key} className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                              <p className="text-xs text-slate-500">{s.email || ''}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 items-center text-xs">
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Corte 1 (50%)</span>
                              <span className="font-bold text-slate-800">{g.corte1 !== null && g.corte1 !== undefined ? Number(g.corte1).toFixed(1) : '—'}</span>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Corte 2 (50%)</span>
                              <span className="font-bold text-slate-800">{g.corte2 !== null && g.corte2 !== undefined ? Number(g.corte2).toFixed(1) : '—'}</span>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg border border-purple-200 text-center">
                              <span className="block text-[10px] text-[#6b0060] uppercase font-semibold">Nota Final</span>
                              <span className="font-bold text-[#6b0060] text-sm">{notaFinal !== null ? notaFinal.toFixed(1) : '—'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
