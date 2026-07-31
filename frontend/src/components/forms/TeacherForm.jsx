import React, { useState, useEffect } from 'react';
import { User, Award, Mail } from 'lucide-react';
import FormField from './FormField';
import FormActions from './FormActions';

export default function TeacherForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    email: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        specialty: initialData.specialty || initialData.especialidad || '',
        email: initialData.email || '',
      });
    } else {
      setFormData({ name: '', specialty: '', email: '' });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.length < 3) {
      newErrors.name = 'El nombre completo debe tener al menos 3 caracteres';
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
        setFormData({ name: '', specialty: '', email: '' });
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
      <FormField
        label="Nombre Completo"
        name="name"
        value={formData.name}
        onChange={handleChange}
        icon={User}
        placeholder="Ej: Maestro Carlos Silva"
        error={errors.name}
      />

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
