import React, { useState, useEffect } from 'react';
import { Shield, User, Mail } from 'lucide-react';

export default function AdminForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Superami',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        role: 'Superami',
      });
    } else {
      setFormData({ name: '', email: '', role: 'Superami' });
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
      onSubmit({ ...formData, role: 'Superami' });
      if (!initialData) {
        setFormData({ name: '', email: '', role: 'Superami' });
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
            placeholder="Ej: Gloria Ramírez"
          />
        </div>
        {errors.name && <p className="text-xs text-rose-600 font-medium mt-1">{errors.name}</p>}
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
            placeholder="admin@rubato.org"
          />
        </div>
        {errors.email && <p className="text-xs text-rose-600 font-medium mt-1">{errors.email}</p>}
      </div>

      {/* Rol de Administrador Fijo: Superami */}
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-800 mb-1">
          Rol de Sistema
        </label>
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6b0060]" />
            <span className="text-sm font-bold text-slate-800">Superami</span>
          </div>
          <span className="text-[11px] font-semibold text-[#6b0060] bg-white px-2 py-0.5 rounded-full border border-purple-200">
            Control Exclusivo
          </span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#6b0060] hover:bg-[#52004a] rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          {initialData ? 'Actualizar Superami' : 'Guardar Administrador (Superami)'}
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
