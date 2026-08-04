import React from 'react';

export default function TabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full sm:w-auto px-4 sm:px-6 py-3 font-medium text-sm rounded-t-lg transition-all duration-200 text-center
        ${isActive
          ? 'bg-[#6b0060] text-white border-b-2 border-[#6b0060]'
          : 'bg-slate-200 text-slate-700 hover:bg-slate-300 border-b-2 border-transparent'
        }
      `}
    >
      {label}
    </button>
  );
}
