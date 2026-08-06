import React, { useState, useEffect } from 'react';
import { Shield, User, Mail } from 'lucide-react';
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

export default function AdminForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    role: 'SuperAdmin',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const { nombre, apellidos } = parseNameFromLegacy(initialData);
      setFormData({
        nombre,
        apellidos,
        email: initialData.email || '',
        role: 'SuperAdmin',
      });
    } else {
      setFormData({ nombre: '', apellidos: '', email: '', role: 'SuperAdmin' });
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
      onSubmit({ ...formData, role: 'SuperAdmin' });
      if (!initialData) {
        setFormData({ nombre: '', apellidos: '', email: '', role: 'SuperAdmin' });
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
          placeholder="Ej: Gloria"
          error={errors.nombre}
        />
        <FormField
          label="Apellidos"
          name="apellidos"
          value={formData.apellidos}
          onChange={handleChange}
          icon={User}
          placeholder="Ej: Ramírez"
          error={errors.apellidos}
        />
      </div>

      <FormField
        label="Correo Electrónico"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        icon={Mail}
        placeholder="admin@rubato.org"
        error={errors.email}
      />

      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-800 mb-1">
          Rol de Sistema
        </label>
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6b0060]" />
            <span className="text-sm font-bold text-slate-800">SuperAdmin</span>
          </div>
          <span className="text-[11px] font-semibold text-[#6b0060] bg-white px-2 py-0.5 rounded-full border border-purple-200">
            Control Exclusivo
          </span>
        </div>
      </div>

      <FormActions
        submitLabel={initialData ? 'Actualizar SuperAdmin' : 'Guardar Administrador (SuperAdmin)'}
        onCancel={onCancel}
      />
    </form>
  );
}
