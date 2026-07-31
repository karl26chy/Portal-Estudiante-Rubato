import React, { useState, useEffect } from 'react';
import { Calendar, User, Mail, Music, Sparkles } from 'lucide-react';
import FormField from './FormField';
import FormActions from './FormActions';

export default function StudentForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    birthdate: '',
    age: '',
    instrument: '',
    email: '',
  });
  const [errors, setErrors] = useState({});

  // Helper para calcular la edad exacta en tiempo real
  const calculateAge = (birthdateStr) => {
    if (!birthdateStr) return '';
    const birthDate = new Date(birthdateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  useEffect(() => {
    if (initialData) {
      const computedAge = initialData.birthdate ? calculateAge(initialData.birthdate) : (initialData.age || '');
      setFormData({
        name: initialData.name || '',
        birthdate: initialData.birthdate || '',
        age: computedAge,
        instrument: initialData.instrument || '',
        email: initialData.email || '',
      });
    } else {
      setFormData({ name: '', birthdate: '', age: '', instrument: '', email: '' });
    }
  }, [initialData]);

  const handleDateChange = (e) => {
    const bdate = e.target.value;
    const computedAge = calculateAge(bdate);
    setFormData(prev => ({
      ...prev,
      birthdate: bdate,
      age: computedAge,
    }));
    if (errors.birthdate) {
      setErrors(prev => ({ ...prev, birthdate: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.length < 3) {
      newErrors.name = 'El nombre completo debe tener al menos 3 caracteres';
    }
    if (!formData.birthdate) {
      newErrors.birthdate = 'La fecha de nacimiento es requerida';
    } else if (formData.age < 3 || formData.age > 100) {
      newErrors.birthdate = 'La fecha ingresada no corresponde a una edad válida (3-100 años)';
    }
    if (!formData.instrument.trim()) {
      newErrors.instrument = 'El instrumento es requerido';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Generación automática de usuario y contraseña para el estudiante
      const sanitizedName = formData.name.trim().toLowerCase().replace(/\s+/g, '.');
      const generatedUsername = `${sanitizedName}@rubato.org`;
      const generatedPassword = `Rubato${Math.floor(1000 + Math.random() * 9000)}!`;

      const studentPayload = {
        ...formData,
        age: Number(formData.age),
        credentials: {
          usuario: generatedUsername,
          password: generatedPassword,
        }
      };

      onSubmit(studentPayload);
      if (!initialData) {
        setFormData({ name: '', birthdate: '', age: '', instrument: '', email: '' });
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
      {/* Nombre Completo */}
      <FormField
        label="Nombre Completo"
        name="name"
        value={formData.name}
        onChange={handleChange}
        icon={User}
        placeholder="Ej: Ana María López"
        error={errors.name}
      />

      {/* Fecha de Nacimiento y Cálculo de Edad en Tiempo Real */}
      <FormField
        label="Fecha de Nacimiento"
        name="birthdate"
        type="date"
        value={formData.birthdate}
        onChange={handleDateChange}
        icon={Calendar}
        error={errors.birthdate}
      >
        {/* Indicador dinámico de edad calculada */}
        {formData.birthdate && formData.age !== '' && (
          <div className="mt-2 p-2 px-3 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-between text-xs text-[#6b0060] font-semibold">
            <span>Edad calculada automáticamente:</span>
            <span className="bg-[#6b0060] text-white px-2 py-0.5 rounded-full text-xs">
              {formData.age} {formData.age === 1 ? 'año' : 'años'}
            </span>
          </div>
        )}
      </FormField>

      {/* Instrumento */}
      <FormField
        label="Cátedra / Instrumento"
        name="instrument"
        value={formData.instrument}
        onChange={handleChange}
        icon={Music}
        placeholder="Ej: Piano, Violín, Guitarra"
        error={errors.instrument}
      />

      {/* Correo Electrónico */}
      <FormField
        label="Correo Electrónico"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        icon={Mail}
        placeholder="estudiante@rubato.org"
        error={errors.email}
      />

      {/* Botones de acción */}
      <FormActions
        submitLabel={initialData ? 'Actualizar Estudiante' : 'Registrar Estudiante'}
        onCancel={onCancel}
        submitIcon={Sparkles}
      />
    </form>
  );
}
