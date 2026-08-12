import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Selecciona una opción',
  className = '',
  error
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  const handleSelect = (optValue) => {
    setIsOpen(false);
    if (onChange) {
      onChange({
        target: {
          name,
          value: optValue
        }
      });
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left pl-10 pr-10 py-2.5 text-slate-900 font-semibold text-sm bg-white border rounded-xl transition-all focus:outline-none focus:border-[#6b0060] focus:ring-2 focus:ring-[#6b0060]/20 flex items-center justify-between cursor-pointer ${
          error ? 'border-rose-500' : 'border-slate-300'
        } ${className}`}
      >
        <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 max-h-60 overflow-y-auto animate-in fade-in-50 slide-in-from-top-1 duration-100">
          {options.map((opt, i) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={i}
                type="button"
                disabled={opt.disabled}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-[#6b0060]/10 text-[#6b0060] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
