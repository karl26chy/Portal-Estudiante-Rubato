import React, { useState } from 'react';
import { useDataManager } from '../../context/DataManagerContext';
import { useToast } from '../Toast';
import { User, BookOpen, Calendar, Clock } from 'lucide-react';
import FormField from './FormField';
import FormActions from './FormActions';

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
      <FormField
        label="Estudiante"
        name="studentId"
        type="select"
        value={formData.studentId}
        onChange={handleChange}
        icon={User}
        error={errors.studentId}
        options={[
          { value: '', label: 'Seleccionar estudiante', disabled: true },
          ...students.map((student) => ({
            value: student.id,
            label: `${student.name} — ${student.instrument}`
          }))
        ]}
      />

      {/* Materia / Cátedra */}
      <FormField
        label="Materia / Cátedra"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        icon={BookOpen}
        placeholder="Ej: Piano Avanzado, Violín Intermedio"
        error={errors.subject}
      />

      {/* Día y Hora */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Día de la Semana"
          name="day"
          type="select"
          value={formData.day}
          onChange={handleChange}
          icon={Calendar}
          error={errors.day}
          options={[
            { value: '', label: 'Seleccionar día', disabled: true },
            ...days.map((d) => ({
              value: d,
              label: d
            }))
          ]}
        />

        <FormField
          label="Horario"
          name="time"
          type="time"
          value={formData.time}
          onChange={handleChange}
          icon={Clock}
          error={errors.time}
        />
      </div>

      <FormActions
        submitLabel="Guardar y Programar Clase"
        onCancel={onCancel}
      />
    </form>
  );
}
