import React, { useState, useEffect } from 'react';
import { User, Award, Mail } from 'lucide-react';
import FormField from './FormField';
import FormActions from './FormActions';

function parseNameFromLegacy(initialData) {
  if (initialData.nombre && initialData.apellidos) {
    return { nombre: initialData.nombre, apellidos: initialData.apellidos };
  }
  if (initialData.name) {
    const tokens = initialData.name.trim().split(/\s+/);
    const apellidos = tokens.length > 1 ? tokens[tokens.length - 1] : '';
    const nombre = tokens.length > 1 ? tokens.slice(0, -1).join(' ') : tokens[0] || '';
    return { nombre, apellidos };
  }
  return { nombre: '', apellidos: '' };
}

export default function TeacherForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    specialty: '',
    email: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const { nombre, apellidos } = parseNameFromLegacy(initialData);
      setFormData({
        nombre,
        apellidos,
        specialty: initialData.specialty || initialData.especialidad || '',
        email: initialData.email || '',
      });
    } else {
      setFormData({ nombre: '', apellidos: '', specialty: '', email: '' });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim() || formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!formData.apellidos.trim() || formData.apellidos.length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }
    if (!formData.specialty.trim()) {
      newErrors.specialty = 'La especialidad o cátedra es requerida';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Ingrese un correo institucional válido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      if (!initialData) {
        setFormData({ nombre: '', apellidos: '', specialty: '', email: '' });
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
          label="Nombre(s)"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          icon={User}
          placeholder="Ej: Carlos"
          error={errors.nombre}
        />
        <FormField
          label="Apellidos"
          name="apellidos"
          value={formData.apellidos}
          onChange={handleChange}
          icon={User}
          placeholder="Ej: Silva Gómez"
          error={errors.apellidos}
        />
      </div>

      <FormField
        label="Especialidad / Cátedra"
        name="specialty"
        value={formData.specialty}
        onChange={handleChange}
        icon={Award}
        placeholder="Ej: Piano Principal, Violín y Cuerdas"
        error={errors.specialty}
      />

      <FormField
        label="Correo Institucional"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        icon={Mail}
        placeholder="profesor@rubato.org"
        error={errors.email}
      />

      <FormActions
        submitLabel={initialData ? 'Actualizar Docente' : 'Registrar Docente'}
        onCancel={onCancel}
      />
    </form>
  );
}
