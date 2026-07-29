import React, { useState } from 'react';
import { useDataManager } from '../../context/DataManagerContext';
import { useToast } from '../Toast';
import { User, BookOpen, Calendar, Clock } from 'lucide-react';

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function ClassForm({ onSubmit, onCancel }) {
  const { students } = useDataManager();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    day: '',
    time: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.studentId) {
      newErrors.studentId = 'Debe seleccionar un estudiante';
    }
    if (!formData.subject.trim() || formData.subject.length < 3) {
      newErrors.subject = 'La materia debe tener al menos 3 caracteres';
    }
    if (!formData.day) {
      newErrors.day = 'Debe seleccionar un día';
    }
    if (!formData.time) {
      newErrors.time = 'La hora es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const student = students.find(s => s.id === Number(formData.studentId) || s.id === formData.studentId);
      onSubmit({
        ...formData,
        studentId: Number(formData.studentId) || formData.studentId,
        studentName: student ? student.name : 'Estudiante',
      });
      setFormData({ studentId: '', subject: '', day: '', time: '' });
    } else {
      addToast('Por favor corrija los errores en el formulario', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Estudiante */}
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-800 mb-1">
          Estudiante
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <select
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-2.5 text-slate-900 font-medium text-sm bg-white border rounded-xl transition-all focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20 ${
              errors.studentId ? 'border-rose-500' : 'border-slate-300'
            }`}
          >
            <option value="" disabled>Seleccionar estudiante</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} — {student.instrument}
              </option>
            ))}
          </select>
        </div>
        {errors.studentId && <p className="text-xs text-rose-600 font-medium mt-1">{errors.studentId}</p>}
      </div>

      {/* Materia / Cátedra */}
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-800 mb-1">
          Materia / Cátedra
        </label>
        <div className="relative">
          <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-2.5 text-slate-900 font-medium text-sm bg-white border rounded-xl placeholder:text-slate-500 transition-all focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20 ${
              errors.subject ? 'border-rose-500' : 'border-slate-300'
            }`}
            placeholder="Ej: Piano Avanzado, Violín Intermedio"
          />
        </div>
        {errors.subject && <p className="text-xs text-rose-600 font-medium mt-1">{errors.subject}</p>}
      </div>

      {/* Día y Hora */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-800 mb-1">
            Día de la Semana
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <select
              name="day"
              value={formData.day}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 text-slate-900 font-medium text-sm bg-white border rounded-xl transition-all focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20 ${
                errors.day ? 'border-rose-500' : 'border-slate-300'
              }`}
            >
              <option value="" disabled>Seleccionar día</option>
              {days.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          {errors.day && <p className="text-xs text-rose-600 font-medium mt-1">{errors.day}</p>}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-800 mb-1">
            Horario
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 text-slate-900 font-medium text-sm bg-white border rounded-xl placeholder:text-slate-500 transition-all focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20 ${
                errors.time ? 'border-rose-500' : 'border-slate-300'
              }`}
            />
          </div>
          {errors.time && <p className="text-xs text-rose-600 font-medium mt-1">{errors.time}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#6b0060] hover:bg-[#52004a] rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          Guardar y Programar Clase
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
