import React, { useState, useEffect } from 'react';
import { Calendar, User, Mail, Music, Sparkles } from 'lucide-react';

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
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-800 mb-1">
          Nombre Completo
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-2.5 text-slate-900 font-medium text-sm bg-white border rounded-xl placeholder:text-slate-500 transition-all focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20 ${
              errors.name ? 'border-rose-500' : 'border-slate-300'
            }`}
            placeholder="Ej: Ana María López"
          />
        </div>
        {errors.name && <p className="text-xs text-rose-600 font-medium mt-1">{errors.name}</p>}
      </div>

      {/* Fecha de Nacimiento y Cálculo de Edad en Tiempo Real */}
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-800 mb-1">
          Fecha de Nacimiento
        </label>
        <div className="relative">
          <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleDateChange}
            className={`w-full pl-10 pr-4 py-2.5 text-slate-900 font-medium text-sm bg-white border rounded-xl placeholder:text-slate-500 transition-all focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20 ${
              errors.birthdate ? 'border-rose-500' : 'border-slate-300'
            }`}
          />
        </div>

        {/* Indicador dinámico de edad calculada */}
        {formData.birthdate && formData.age !== '' && (
          <div className="mt-2 p-2 px-3 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-between text-xs text-[#6b0060] font-semibold">
            <span>Edad calculada automáticamente:</span>
            <span className="bg-[#6b0060] text-white px-2 py-0.5 rounded-full text-xs">
              {formData.age} {formData.age === 1 ? 'año' : 'años'}
            </span>
          </div>
        )}
        {errors.birthdate && <p className="text-xs text-rose-600 font-medium mt-1">{errors.birthdate}</p>}
      </div>

      {/* Instrumento */}
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-800 mb-1">
          Cátedra / Instrumento
        </label>
        <div className="relative">
          <Music className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            name="instrument"
            value={formData.instrument}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-2.5 text-slate-900 font-medium text-sm bg-white border rounded-xl placeholder:text-slate-500 transition-all focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20 ${
              errors.instrument ? 'border-rose-500' : 'border-slate-300'
            }`}
            placeholder="Ej: Piano, Violín, Guitarra"
          />
        </div>
        {errors.instrument && <p className="text-xs text-rose-600 font-medium mt-1">{errors.instrument}</p>}
      </div>

      {/* Correo Electrónico */}
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-800 mb-1">
          Correo Electrónico
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-2.5 text-slate-900 font-medium text-sm bg-white border rounded-xl placeholder:text-slate-500 transition-all focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20 ${
              errors.email ? 'border-rose-500' : 'border-slate-300'
            }`}
            placeholder="estudiante@rubato.org"
          />
        </div>
        {errors.email && <p className="text-xs text-rose-600 font-medium mt-1">{errors.email}</p>}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#6b0060] hover:bg-[#52004a] rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{initialData ? 'Actualizar Estudiante' : 'Registrar Estudiante'}</span>
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
