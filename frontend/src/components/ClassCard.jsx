import React from 'react';
import { Calendar, Clock, User, Trash2 } from 'lucide-react';
import { useToast } from './Toast';

export default function ClassCard({ classData, onDelete }) {
  const { addToast } = useToast();

  const handleDelete = () => {
    if (onDelete) {
      onDelete(classData);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 font-['Playfair_Display',serif]">{classData.subject}</h3>
          <span className="text-xs text-[#6b0060] bg-purple-100 px-2.5 py-0.5 rounded-full font-semibold">
            {classData.day}
          </span>
        </div>
        {onDelete && (
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Eliminar clase"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#6b0060]" />
          <span>Estudiante: <strong>{classData.studentName || 'Sin asignar'}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#6b0060]" />
          <span>Día: {classData.day}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#6b0060]" />
          <span>Hora: {classData.time}</span>
        </div>
      </div>
    </div>
  );
}
