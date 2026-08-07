import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { Loader, GraduationCap, CalendarCheck } from 'lucide-react';
import { useToast } from '../../components/Toast';
import FormField from '../../components/forms/FormField';
import StatCard from '../../components/StatCard';
import { formatFecha, sortByLastName } from '../../utils/teacherUtils';
import { getAttendance, getGrades } from '../../api/academicApi';

export default function StudentHistoryTab() {
  const { addToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [studentsByClass, setStudentsByClass] = useState({});
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (classes.length === 0) return;
    (async () => {
      const studentMap = new Map();
      const byClass = {};
      for (const cls of classes) {
        try {
          const res = await fetch(`/api/classes/${cls.id}/students`, { credentials: 'include' });
          if (!res.ok) continue;
          const data = await res.json();
          const classStudents = (data.students || []).map((s) => {
            const name = `${(s.nombre || '')} ${(s.apellido || '')}`.trim();
            return { id: s.id, name, nombre: s.nombre, apellido: s.apellido, email: s.email };
          });
          byClass[cls.id] = sortByLastName(classStudents);
          classStudents.forEach((s) => {
            if (!studentMap.has(s.name)) studentMap.set(s.name, s);
          });
        } catch {}
      }
      setStudentsByClass(byClass);
      setAllStudents(sortByLastName([...studentMap.values()]));
    })();
  }, [classes]);

  const activeCycleClasses = classes.filter(c =>
    c.ciclo_abierto !== false && c.ciclo_estado !== 'CERRADO'
  );
  const displayedStudents = selectedClassId && studentsByClass[selectedClassId]
    ? studentsByClass[selectedClassId]
    : allStudents;

  const selectedStudent = displayedStudents.find((s) => s.name === selectedStudentName) || null;
  const filteredClasses = selectedClassId
    ? classes.filter((c) => c.id === Number(selectedClassId))
    : classes;

  useEffect(() => {
    if (displayedStudents.length === 0) {
      if (selectedStudentName) setSelectedStudentName('');
      return;
    }
    const found = displayedStudents.find(s => s.name === selectedStudentName);
    if (!found) {
      setSelectedStudentName(displayedStudents[0].name);
    }
  }, [displayedStudents, selectedStudentName]);

  useEffect(() => {
    if (!selectedStudentName) return;
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const classId = selectedClassId ? Number(selectedClassId) : null;
        let attData, gradData;
        if (classId) {
          [attData, gradData] = await Promise.all([
            getAttendance(classId),
            getGrades(classId)
          ]);
          attData = (attData.attendance || []).filter((a) => a.student_name === selectedStudentName);
          gradData = (gradData.grades || []).filter((g) => g.student_name === selectedStudentName);
        } else {
          [attData, gradData] = await Promise.all([
            getAttendance(null, selectedStudentName),
            getGrades(null, selectedStudentName)
          ]);
          attData = attData.attendance || [];
          gradData = gradData.grades || [];
        }
        if (!active) return;
        setAttendance(attData);
        setGrades(gradData);
      } catch (err) {
        if (active) addToast(err.message, 'error');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [selectedStudentName, selectedClassId]);

  const classNameById = (classId) => {
    const cls = classes.find((c) => c.id === classId);
    return cls ? `${cls.asignatura} — ${cls.semestre}` : `Clase #${classId}`;
  };

  const metrics = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter((a) => a.asistencia === 'P').length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;

    const sum = (key) => grades.reduce((acc, g) => acc + (Number(g[key]) || 0), 0);
    const count = grades.filter((g) => g.nota_final !== null && g.nota_final !== undefined).length;

    return {
      total,
      present,
      pct,
      promedioFinal: count > 0 ? (sum('nota_final') / count) : null
    };
  }, [attendance, grades]);

  const chartData = useMemo(() => {
    const sum = (key) => grades.reduce((acc, g) => acc + (Number(g[key]) || 0), 0);
    const count = grades.length;
    if (count === 0) return [];
    return [
      { name: 'Corte 1', value: Math.round((sum('corte1') / count) * 10) / 10 },
      { name: 'Corte 2', value: Math.round((sum('corte2') / count) * 10) / 10 },
      { name: 'Nota Final', value: Math.round((sum('nota_final') / count) * 10) / 10 }
    ];
  }, [grades]);

  const sortedAttendance = [...attendance].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  if (classesLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
        <Loader className="w-8 h-8 animate-spin text-[#6b0060]" />
        <p className="text-sm">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200 max-w-lg">
        <FormField
          label="Filtrar por Clase (opcional)"
          name="classFilter"
          type="select"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          icon={CalendarCheck}
          options={[
            { value: '', label: '— Todas las clases —' },
            ...activeCycleClasses.map((c) => ({ value: String(c.id), label: `${c.asignatura} — ${c.semestre}` }))
          ]}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200 max-w-lg">
        <FormField
          label="Seleccionar Estudiante"
          name="student"
          type="select"
          value={selectedStudentName}
          onChange={(e) => setSelectedStudentName(e.target.value)}
          icon={GraduationCap}
          options={displayedStudents.map((s) => ({ value: s.name, label: `${s.name}` }))}
        />
        {selectedStudent && (
          <p className="text-xs text-slate-500 mt-2">
            {selectedStudent.name} · {selectedStudent.email}
          </p>
        )}
      </div>

      {!selectedStudentName ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm">No hay estudiantes inscritos en las clases de este docente.</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center gap-3 py-12 text-slate-500">
          <Loader className="w-8 h-8 animate-spin text-[#6b0060]" />
          <p className="text-sm">Cargando historial del estudiante...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Asistencia Acumulada"
              value={`${metrics.pct}%`}
              description={`${metrics.present} de ${metrics.total} registros presentes`}
              icon={CalendarCheck}
              iconColorClass="text-emerald-600"
              progressValue={`${metrics.pct}%`}
              progressColorClass="bg-emerald-600"
            />
            <StatCard
              title="Nota Definitiva"
              value={metrics.promedioFinal !== null ? metrics.promedioFinal.toFixed(1) : '—'}
              description="Promedio de nota final (Corte 1 + Corte 2 al 50%)"
              icon={GraduationCap}
              iconColorClass="text-[#6b0060]"
              progressValue={metrics.promedioFinal !== null ? `${(metrics.promedioFinal / 5) * 100}%` : '0%'}
              progressColorClass="bg-[#6b0060]"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200 min-w-0">
              <h3 className="text-lg font-bold text-slate-800 mb-4 font-['Playfair_Display',serif]">
                Historial de Asistencia
              </h3>
              {sortedAttendance.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">
                  Aún no hay registros de asistencia para este estudiante.
                </p>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {sortedAttendance.map((a, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{formatFecha(a.fecha)}</p>
                        <p className="text-[11px] text-slate-500 truncate">{classNameById(a.class_id)}</p>
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

            <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200 min-w-0">
              <h3 className="text-lg font-bold text-slate-800 mb-4 font-['Playfair_Display',serif]">
                Rendimiento por Cortes (Sistema Rubato)
              </h3>
              {chartData.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">
                  Aún no hay notas registradas para este estudiante.
                </p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip
                        formatter={(value) => [Number(value).toFixed(1), 'Nota']}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                      />
                      <ReferenceLine y={3} stroke="#cbd5e1" strokeDasharray="4 4" />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#6b0060" maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <p className="text-[11px] text-slate-500 mt-3">
                Nota Final = (Corte 1 × 0.50) + (Corte 2 × 0.50). Línea de referencia: 3.0 (aprobado).
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
