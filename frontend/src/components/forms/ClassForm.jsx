import React, { useState, useEffect } from 'react';
import { useDataManager } from '../../context/DataManagerContext';
import { useToast } from '../Toast';
import { UserCheck, BookOpen, Calendar, Clock, Layers, Filter } from 'lucide-react';
import FormField from './FormField';
import FormActions from './FormActions';
import { normalizeText, getFullName } from '../../utils/teacherUtils';
import { MODULOS_OFI, SEMESTRES_POR_MODULO, ASIGNATURAS_POR_MODULO } from '../../constants/pensumData';

export const formatTime12h = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM')) {
    return timeStr;
  }
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return timeStr;
  
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const minStr = String(m).padStart(2, '0');
  const hourStr = String(hour12).padStart(2, '0');
  return `${hourStr}:${minStr} ${period}`;
};

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function ClassForm({ initialData, onSubmit, onCancel, onNavigateToCycles }) {
  const { students, teachers, cycles } = useDataManager();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    module: '',
    semester: '',
    subject: '',
    teacherId: '',
    cicloId: '',
    selectedStudentIds: [],
    day: 'Lunes',
    startTime: '08:00',
    endTime: '10:00',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const openCycle = (cycles || []).find(c => c.estado === 'ABIERTO' && (c.is_open || c.ciclo_abierto !== false));
    const defaultCiclo = openCycle ? openCycle.id : (cycles[0] ? cycles[0].id : '');

    if (initialData) {
      const teacher = teachers.find(t =>
        t.id === initialData.docente_id ||
        normalizeText(getFullName(t)) === normalizeText(initialData.teacherName || initialData.profesor || initialData.profesora || initialData.director)
      );
      const names = (initialData.studentNames && initialData.studentNames.length > 0)
        ? initialData.studentNames
        : (initialData.studentName ? [initialData.studentName] : []);
      const idsFromNames = names
        .map(name => {
          const found = students.find(s => normalizeText(getFullName(s)) === normalizeText(name));
          return found ? found.id : null;
        })
        .filter(id => id !== null);
      const fallbackIds = (initialData.studentId !== undefined && initialData.studentId !== null) ? [initialData.studentId] : [];
      const initialStudentIds = (initialData.studentIds && initialData.studentIds.length > 0)
        ? initialData.studentIds
        : (idsFromNames.length > 0 ? idsFromNames : fallbackIds);

      setFormData({
        module: initialData.module || '',
        semester: initialData.semester || '',
        subject: initialData.subject || initialData.asignatura || '',
        teacherId: teacher ? teacher.id : (initialData.docente_id || ''),
        cicloId: initialData.ciclo_id || initialData.cicloId || defaultCiclo,
        selectedStudentIds: initialStudentIds,
        day: initialData.day || 'Lunes',
        startTime: initialData.startTime || '08:00',
        endTime: initialData.endTime || '10:00',
      });
    } else {
      setFormData({
        module: '',
        semester: '',
        subject: '',
        teacherId: '',
        cicloId: defaultCiclo,
        selectedStudentIds: [],
        day: 'Lunes',
        startTime: '08:00',
        endTime: '10:00'
      });
    }
  }, [initialData, students, teachers, cycles]);

  const availableCycles = (cycles || []).filter(c => {
    if (initialData && (Number(c.id) === Number(initialData.ciclo_id) || Number(c.id) === Number(initialData.cicloId))) return true;
    return c.estado === 'ABIERTO' && (c.is_open || c.ciclo_abierto !== false);
  });

  if (availableCycles.length === 0) {
    return (
      <div className="p-6 text-center bg-purple-50/80 border border-purple-200 rounded-2xl space-y-3 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-[#6b0060] mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Primero debes crear un ciclo académico</h3>
        <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium leading-relaxed">
          Para programar o guardar clases en la plataforma, debe existir al menos un ciclo académico en estado abierto.
        </p>
        {onNavigateToCycles && (
          <button
            type="button"
            onClick={onNavigateToCycles}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#6b0060] hover:bg-[#52004a] rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Crear Ciclo Académico</span>
          </button>
        )}
      </div>
    );
  }

  const handleModuleChange = (e) => {
    const selectedMod = e.target.value;
    setFormData(prev => ({
      ...prev,
      module: selectedMod,
      semester: '',
      subject: '',
      selectedStudentIds: [],
    }));
    if (errors.module) {
      setErrors(prev => ({ ...prev, module: '', semester: '', subject: '', selectedStudentIds: '' }));
    }
  };

  const toggleStudentSelection = (studentId) => {
    setFormData(prev => {
      const exists = prev.selectedStudentIds.includes(studentId);
      const updated = exists
        ? prev.selectedStudentIds.filter(id => id !== studentId)
        : [...prev.selectedStudentIds, studentId];
      return { ...prev, selectedStudentIds: updated };
    });
    if (errors.selectedStudentIds) {
      setErrors(prev => ({ ...prev, selectedStudentIds: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.module) {
      newErrors.module = 'Debe seleccionar un módulo del pénsum';
    }
    if (!formData.semester) {
      newErrors.semester = 'Debe seleccionar un semestre';
    }
    if (!formData.subject) {
      newErrors.subject = 'Debe seleccionar una asignatura del pénsum';
    }
    if (!formData.teacherId) {
      newErrors.teacherId = 'Debe asignar un docente a la clase';
    }
    if (!formData.cicloId) {
      newErrors.cicloId = 'Debe seleccionar un ciclo académico';
    }
    if (formData.selectedStudentIds.length === 0) {
      newErrors.selectedStudentIds = 'Debe seleccionar al menos un estudiante para inscribir';
    }
    if (!formData.day) {
      newErrors.day = 'Debe seleccionar un día de la semana';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'La hora de inicio es requerida';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'La hora de finalización es requerida';
    }

    if (formData.startTime && formData.endTime) {
      const [startH, startM] = formData.startTime.split(':').map(Number);
      const [endH, endM] = formData.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (endMinutes <= startMinutes) {
        newErrors.endTime = 'La hora de finalización debe ser posterior a la hora de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const assignedTeacher = teachers.find(t => t.id === Number(formData.teacherId) || t.id === formData.teacherId);
      const enrolledStudents = students.filter(s => formData.selectedStudentIds.includes(s.id));
      const formattedStart = formatTime12h(formData.startTime);
      const formattedEnd = formatTime12h(formData.endTime);

      const classPayload = {
        ...formData,
        ciclo_id: Number(formData.cicloId) || formData.cicloId,
        startTimeFormatted: formattedStart,
        endTimeFormatted: formattedEnd,
        teacherName: assignedTeacher ? getFullName(assignedTeacher) : 'Docente Asignado',
        studentCount: enrolledStudents.length,
        studentNames: enrolledStudents.map(s => getFullName(s)),
        studentIds: enrolledStudents.map(s => s.id),
        horario: `${formData.day} ${formattedStart} - ${formattedEnd}`,
      };

      onSubmit(classPayload);
      if (!initialData) {
        const openCycle = (cycles || []).find(c => c.estado === 'ABIERTO' && (c.is_open || c.ciclo_abierto !== false));
        setFormData({
          module: '',
          semester: '',
          subject: '',
          teacherId: '',
          cicloId: openCycle ? openCycle.id : (cycles[0] ? cycles[0].id : ''),
          selectedStudentIds: [],
          day: 'Lunes',
          startTime: '08:00',
          endTime: '10:00',
        });
      }
    } else {
      addToast('Por favor complete todos los campos obligatorios y verifique el rango de horario', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const availableSemesters = formData.module ? (SEMESTRES_POR_MODULO[formData.module] || []) : [];
  const availableSubjects = formData.module ? (ASIGNATURAS_POR_MODULO[formData.module] || []) : [];
  const filteredStudents = formData.module
    ? students.filter(s => (s.module || 'Módulo 1') === formData.module || formData.selectedStudentIds.includes(s.id))
    : students;



  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <FormField
        label="Ciclo Académico"
        name="cicloId"
        type="select"
        value={formData.cicloId}
        onChange={handleChange}
        icon={Layers}
        error={errors.cicloId}
        options={[
          { value: '', label: 'Seleccionar Ciclo Académico...', disabled: true },
          ...availableCycles.map((c) => ({
            value: c.id,
            label: `${c.nombre || `Semestre ${c.semestre || '1'} - ${c.anio || ''}`} (hasta ${c.fecha_fin ? String(c.fecha_fin).substring(0, 10) : '—'})`
          }))
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Módulo del Pénsum"
          name="module"
          type="select"
          value={formData.module}
          onChange={handleModuleChange}
          icon={Layers}
          error={errors.module}
          options={[
            { value: '', label: 'Seleccionar Módulo...', disabled: true },
            ...MODULOS_OFI.map(m => ({ value: m, label: m }))
          ]}
        />
        <FormField
          label="Semestre"
          name="semester"
          type="select"
          value={formData.semester}
          onChange={handleChange}
          icon={BookOpen}
          error={errors.semester}
          options={[
            { value: '', label: formData.module ? 'Seleccionar Semestre...' : 'Primero elija módulo', disabled: true },
            ...availableSemesters.map(s => ({ value: s, label: s }))
          ]}
        />
      </div>

      <FormField
        label="Asignatura del Pénsum"
        name="subject"
        type="select"
        value={formData.subject}
        onChange={handleChange}
        icon={BookOpen}
        error={errors.subject}
        options={[
          { value: '', label: formData.module ? 'Seleccionar Asignatura...' : 'Seleccione un módulo primero', disabled: true },
          ...availableSubjects.map(sub => ({ value: sub, label: sub }))
        ]}
      />

      <FormField
        label="Docente Asignado"
        name="teacherId"
        type="select"
        value={formData.teacherId}
        onChange={handleChange}
        icon={UserCheck}
        error={errors.teacherId}
        options={[
          { value: '', label: 'Seleccionar Docente...', disabled: true },
          ...teachers.map((t) => ({
            value: t.id,
            label: `${getFullName(t)} — ${t.specialty || t.especialidad || 'Docente'}`
          }))
        ]}
      />

      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-800 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span>Estudiantes Inscritos</span>
            {formData.module && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6b0060] bg-purple-100 px-2 py-0.5 rounded-md normal-case">
                <Filter className="w-3 h-3" /> Filtrado por {formData.module}
              </span>
            )}
          </span>
          <span className="text-[#6b0060] font-bold text-xs">
            {formData.selectedStudentIds.length} seleccionado(s)
          </span>
        </label>
        
        <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 max-h-48 overflow-y-auto space-y-2">
          {!formData.module ? (
            <p className="text-xs text-slate-500 italic py-2 text-center">
              Seleccione un módulo primero para filtrar automáticamente los estudiantes correspondientes.
            </p>
          ) : filteredStudents.length === 0 ? (
            <p className="text-xs text-rose-500 italic py-2 text-center">
              No se encontraron estudiantes registrados en {formData.module}
            </p>
          ) : (
            filteredStudents.map((student) => {
              const isChecked = formData.selectedStudentIds.includes(student.id);
              return (
                <label
                  key={student.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-purple-100/80 border-[#6b0060] text-slate-900 font-semibold'
                      : 'bg-white border-slate-200 hover:border-purple-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="w-4 h-4 text-[#6b0060] rounded border-slate-300 focus:ring-[#6b0060] shrink-0"
                    />
                    <span className="text-xs truncate">{getFullName(student)}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium hidden sm:block shrink-0">
                    {student.instrument} — {student.module || 'Módulo 1'} {student.semester ? `(${student.semester})` : ''}
                  </span>
                </label>
              );
            })
          )}
        </div>
        {errors.selectedStudentIds && (
          <p className="text-xs text-rose-600 font-medium mt-1">{errors.selectedStudentIds}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-800">
          Programación de Horario de Clase
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField
            label="Día"
            name="day"
            type="select"
            value={formData.day}
            onChange={handleChange}
            icon={Calendar}
            error={errors.day}
            options={[
              ...days.map((d) => ({
                value: d,
                label: d
              }))
            ]}
          />
          <FormField
            label="Hora de Inicio"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange}
            icon={Clock}
            error={errors.startTime}
          />
          <FormField
            label="Hora de Finalización"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={handleChange}
            icon={Clock}
            error={errors.endTime}
          />
        </div>
      </div>

      <FormActions
        submitLabel={initialData ? 'Actualizar Clase' : 'Crear y Programar Clase (Admin)'}
        onCancel={onCancel}
      />
    </form>
  );
}
