import React, { useState, useEffect } from 'react';
import { Calendar, User, Mail, Music, Sparkles, Layers, BookOpen, Phone } from 'lucide-react';
import FormField from './FormField';
import FormActions from './FormActions';
import { INSTRUMENTOS_OFI, INSTRUMENTOS_CATEGORIZADOS, MODULOS_OFI, SEMESTRES_POR_MODULO } from '../../constants/pensumData';

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

export default function StudentForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    birthdate: '',
    age: '',
    instrument: '',
    email: '',
    phone: '',
    module: '',
    semester: '',
  });
  const [errors, setErrors] = useState({});

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
      const { nombre, apellidos } = parseNameFromLegacy(initialData);
      const computedAge = initialData.birthdate ? calculateAge(initialData.birthdate) : (initialData.age || '');
      setFormData({
        nombre,
        apellidos,
        birthdate: initialData.birthdate || '',
        age: computedAge,
        instrument: initialData.instrument || '',
        email: initialData.email || '',
        phone: initialData.phone || initialData.celular || '',
        module: initialData.module || '',
        semester: initialData.semester || '',
      });
    } else {
      setFormData({ nombre: '', apellidos: '', birthdate: '', age: '', instrument: '', email: '', phone: '', module: '', semester: '' });
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

  const handleModuleChange = (e) => {
    const selectedMod = e.target.value;
    setFormData(prev => ({
      ...prev,
      module: selectedMod,
      semester: ''
    }));
    if (errors.module) {
      setErrors(prev => ({ ...prev, module: '', semester: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim() || formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!formData.apellidos.trim() || formData.apellidos.length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }
    if (!formData.birthdate) {
      newErrors.birthdate = 'La fecha de nacimiento es requerida';
    } else if (formData.age < 3 || formData.age > 100) {
      newErrors.birthdate = 'La fecha ingresada no corresponde a una edad válida (3-100 años)';
    }
    if (!formData.instrument.trim()) {
      newErrors.instrument = 'El instrumento es obligatorio (seleccione de la lista)';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }
    if (!formData.phone || formData.phone.trim().length < 7) {
      newErrors.phone = 'Ingrese un número de celular válido (al menos 7 dígitos)';
    }
    if (!formData.module) {
      newErrors.module = 'Seleccione un módulo';
    }
    if (!formData.semester) {
      newErrors.semester = 'Seleccione un semestre';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const studentPayload = {
        ...formData,
        age: Number(formData.age),
      };

      if (!initialData) {
        const firstName = formData.nombre
          .trim()
          .split(' ')[0]
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '');

        const randomNum = Math.floor(10 + Math.random() * 90);
        const username = `${firstName}.rubato${randomNum}`;
        const autoPassword = `Rubato${Math.floor(1000 + Math.random() * 9000)}!`;

        studentPayload.username = username;
        studentPayload.password = autoPassword;
        studentPayload.credentials = {
          usuario: username,
          password: autoPassword,
        };
      }

      onSubmit(studentPayload);
      if (!initialData) {
        setFormData({ nombre: '', apellidos: '', birthdate: '', age: '', instrument: '', email: '', phone: '', module: '', semester: '' });
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

  const availableSemesters = formData.module ? (SEMESTRES_POR_MODULO[formData.module] || []) : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Nombre(s)"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          icon={User}
          placeholder="Ej: Ana María"
          error={errors.nombre}
        />
        <FormField
          label="Apellidos"
          name="apellidos"
          value={formData.apellidos}
          onChange={handleChange}
          icon={User}
          placeholder="Ej: Gómez López"
          error={errors.apellidos}
        />
      </div>

      <FormField
        label="Fecha de Nacimiento"
        name="birthdate"
        type="date"
        value={formData.birthdate}
        onChange={handleDateChange}
        icon={Calendar}
        error={errors.birthdate}
      >
        {formData.birthdate && formData.age !== '' && (
          <div className="mt-2 p-2 px-3 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-between text-xs text-[#6b0060] font-semibold">
            <span>Edad calculada automáticamente:</span>
            <span className="bg-[#6b0060] text-white px-2 py-0.5 rounded-full text-xs">
              {formData.age} {formData.age === 1 ? 'año' : 'años'}
            </span>
          </div>
        )}
      </FormField>

      <FormField
        label="Instrumento (Pénsum Oficial)"
        name="instrument"
        type="select"
        value={formData.instrument}
        onChange={handleChange}
        icon={Music}
        error={errors.instrument}
        options={[
          { value: '', label: 'Seleccionar instrumento del pénsum...', disabled: true },
          ...INSTRUMENTOS_CATEGORIZADOS.map(cat => ({
            isGroup: true,
            label: cat.categoria,
            options: cat.opciones.map(inst => ({ value: inst, label: inst }))
          }))
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <FormField
          label="Número de Celular"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          icon={Phone}
          placeholder="Ej: 3001234567"
          error={errors.phone}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Módulo"
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
            { value: '', label: formData.module ? 'Seleccionar Semestre...' : 'Primero elija un módulo', disabled: true },
            ...availableSemesters.map(s => ({ value: s, label: s }))
          ]}
        />
      </div>

      <FormActions
        submitLabel={initialData ? 'Actualizar Estudiante' : 'Registrar Estudiante'}
        onCancel={onCancel}
        submitIcon={Sparkles}
      />
    </form>
  );
}
