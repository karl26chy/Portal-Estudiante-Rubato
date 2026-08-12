import React from 'react';
import CustomSelect from './CustomSelect';

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
  className = '',
  iconColor = 'text-slate-500',
  children
}) {
  const baseClasses = `w-full pl-10 pr-4 py-2.5 text-slate-900 font-medium text-sm bg-white border rounded-xl transition-all focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20 ${
    error ? 'border-rose-500' : 'border-slate-300'
  } ${className}`;

  return (
    <div>
      {label && (
        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-800 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className={`w-4 h-4 absolute left-3.5 top-3 pointer-events-none ${iconColor}`} />
        )}
        
        {type === 'select' ? (
          <CustomSelect
            name={name}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            error={error}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={`${baseClasses} placeholder:text-slate-500`}
            placeholder={placeholder}
          />
        )}
      </div>

      {children}
      
      {error && (
        <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>
      )}
    </div>
  );
}
