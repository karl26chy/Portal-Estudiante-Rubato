import React, { useState, useEffect } from 'react';
import { Shield, User, Mail } from 'lucide-react';
import FormField from './FormField';
import FormActions from './FormActions';

export default function AdminForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'SuperAdmin',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        role: 'SuperAdmin',
      });
    } else {
      setFormData({ name: '', email: '', role: 'SuperAdmin' });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.length < 3) {
      newErrors.name = 'El nombre completo debe tener al menos 3 caracteres';
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
        setFormData({ name: '', email: '', role: 'SuperAdmin' });
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
        placeholder="Ej: Gloria Ramírez"
        error={errors.name}
      />

      {/* Correo Electrónico */}
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

      {/* Rol de Administrador Fijo: SuperAdmin */}
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

      {/* Botones de acción */}
      <FormActions
        submitLabel={initialData ? 'Actualizar SuperAdmin' : 'Guardar Administrador (SuperAdmin)'}
        onCancel={onCancel}
      />
    </form>
  );
}
