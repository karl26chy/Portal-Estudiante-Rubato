import React, { useState, useEffect } from 'react';
import { Calendar, Layers, Hash } from 'lucide-react';
import FormField from './FormField';
import FormActions from './FormActions';

export default function CycleForm({ initialData, onSubmit, onCancel }) {
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    semestre: '1',
    anio: currentYear,
    fecha_inicio: '',
    fecha_fin: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        semestre: initialData.semestre || (initialData.nombre?.includes('Semestre 2') ? '2' : '1'),
        anio: initialData.anio || currentYear,
        fecha_inicio: initialData.fecha_inicio ? String(initialData.fecha_inicio).substring(0, 10) : '',
        fecha_fin: initialData.fecha_fin ? String(initialData.fecha_fin).substring(0, 10) : '',
      });
    } else {
      setFormData({ semestre: '1', anio: currentYear, fecha_inicio: '', fecha_fin: '' });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.semestre) {
      newErrors.semestre = 'Seleccione el semestre (1 o 2)';
    }
    if (!formData.anio || Number(formData.anio) < 2000 || Number(formData.anio) > 2100) {
      newErrors.anio = 'Ingrese un año válido (ej: 2026)';
    }
    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }
    if (!formData.fecha_fin) {
      newErrors.fecha_fin = 'La fecha de finalización es requerida';
    }
    if (formData.fecha_inicio && formData.fecha_fin) {
      if (new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio)) {
        newErrors.fecha_fin = 'La fecha de finalización debe ser posterior a la fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        semestre: String(formData.semestre),
        anio: Number(formData.anio),
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin
      });
      if (!initialData) {
        setFormData({ semestre: '1', anio: currentYear, fecha_inicio: '', fecha_fin: '' });
      }
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Semestre"
          name="semestre"
          type="select"
          value={formData.semestre}
          onChange={handleChange}
          icon={Layers}
          error={errors.semestre}
          options={[
            { value: '1', label: 'Semestre 1' },
            { value: '2', label: 'Semestre 2' }
          ]}
        />

        <FormField
          label="Año"
          name="anio"
          type="number"
          value={formData.anio}
          onChange={handleChange}
          icon={Hash}
          placeholder="Ej: 2026"
          error={errors.anio}
        />
      </div>

      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs font-semibold text-[#6b0060] flex items-center justify-between">
        <span>Nombre del Ciclo generado:</span>
        <span className="font-bold text-sm bg-white px-2.5 py-1 rounded-lg border border-purple-200">
          Semestre {formData.semestre || '1'} - {formData.anio || currentYear}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Fecha de Inicio"
          name="fecha_inicio"
          type="date"
          value={formData.fecha_inicio}
          onChange={handleChange}
          icon={Calendar}
          error={errors.fecha_inicio}
        />
        <FormField
          label="Fecha de Finalización (Cierre)"
          name="fecha_fin"
          type="date"
          value={formData.fecha_fin}
          onChange={handleChange}
          icon={Calendar}
          error={errors.fecha_fin}
        />
      </div>

      <FormActions
        submitLabel={initialData ? 'Actualizar Ciclo' : 'Crear Ciclo Académico'}
        onCancel={onCancel}
      />
    </form>
  );
}
