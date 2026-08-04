import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  icon: Icon,
  placeholder,
  error,
  options = [],
  children
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const baseClasses = `w-full ${Icon ? 'pl-10' : 'pl-4'} ${isPassword ? 'pr-10' : 'pr-4'} py-2.5 text-slate-900 font-medium text-sm bg-white border rounded-xl transition-all focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20 ${
    error ? 'border-rose-500' : 'border-slate-300'
  }`;

  return (
    <div>
      {label && (
        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-800 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
        )}
        
        {type === 'select' ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={baseClasses}
          >
            {options.map((opt, i) => (
              opt.isGroup ? (
                <optgroup key={i} label={opt.label}>
                  {opt.options.map((sub, j) => (
                    <option key={j} value={sub.value} disabled={sub.disabled}>
                      {sub.label}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <option key={i} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              )
            ))}
          </select>
        ) : (
          <input
            type={inputType}
            name={name}
            value={value}
            onChange={onChange}
            className={`${baseClasses} placeholder:text-slate-500`}
            placeholder={placeholder}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {children}
      
      {error && (
        <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>
      )}
    </div>
  );
}

