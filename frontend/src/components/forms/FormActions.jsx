import React from 'react';

export default function FormActions({
  submitLabel,
  onCancel,
  submitIcon: SubmitIcon
}) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <button
        type="submit"
        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#6b0060] hover:bg-[#52004a] rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        {SubmitIcon && <SubmitIcon className="w-4 h-4" />}
        <span>{submitLabel}</span>
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
  );
}
